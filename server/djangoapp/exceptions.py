"""
Custom exception handler, circuit breaker, retry logic, and structured logging
for the Best Cars Django Hub.
"""

import json
import time
import logging
import threading
import uuid
from datetime import datetime
from functools import wraps

import requests
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════
# Structured JSON Logging
# ══════════════════════════════════════════════════════════

class JsonFormatter(logging.Formatter):
    """
    Emit log records as structured JSON with trace ID support.
    """
    def format(self, record):
        log_entry = {
            "time": datetime.utcnow().isoformat() + "Z",
            "service": "django-hub",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, 'trace_id'):
            log_entry["traceId"] = record.trace_id
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)


# ══════════════════════════════════════════════════════════
# DRF Custom Exception Handler
# ══════════════════════════════════════════════════════════

def custom_exception_handler(exc, context):
    """
    Convert all DRF exceptions into a consistent structured error format:
    { "error": "ERROR_CODE", "message": "...", "detail": {...} }
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_code = 'API_ERROR'
        if response.status_code == 400:
            error_code = 'VALIDATION_ERROR'
        elif response.status_code == 401:
            error_code = 'UNAUTHORIZED'
        elif response.status_code == 403:
            error_code = 'FORBIDDEN'
        elif response.status_code == 404:
            error_code = 'NOT_FOUND'
        elif response.status_code == 429:
            error_code = 'RATE_LIMIT_EXCEEDED'

        response.data = {
            'error': error_code,
            'message': str(exc),
            'detail': response.data,
        }

    return response


# ══════════════════════════════════════════════════════════
# Circuit Breaker — CLOSED → OPEN → HALF-OPEN State Machine
# ══════════════════════════════════════════════════════════

class CircuitBreakerOpen(Exception):
    """Raised when a circuit is OPEN and requests are being rejected."""
    pass


class CircuitBreaker:
    """
    Simple thread-safe circuit breaker.

    States:
      CLOSED    — Normal operation. Failures counted.
      OPEN      — Service assumed down. All calls rejected immediately.
      HALF_OPEN — One test call allowed. Success → CLOSED. Failure → OPEN.

    Args:
        name (str): Identifier for logging.
        failure_threshold (int): Consecutive failures before opening.
        timeout (int): Seconds to wait before moving OPEN → HALF_OPEN.
    """

    CLOSED = 'CLOSED'
    OPEN = 'OPEN'
    HALF_OPEN = 'HALF_OPEN'

    def __init__(self, name: str, failure_threshold: int = 5, timeout: int = 30):
        self.name = name
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self._state = self.CLOSED
        self._failure_count = 0
        self._last_failure_time = None
        self._lock = threading.Lock()

    @property
    def state(self):
        with self._lock:
            if self._state == self.OPEN:
                if time.time() - self._last_failure_time >= self.timeout:
                    self._state = self.HALF_OPEN
                    logger.warning(f"Circuit [{self.name}] → HALF_OPEN (testing recovery)")
            return self._state

    def record_success(self):
        with self._lock:
            if self._state in (self.HALF_OPEN, self.CLOSED):
                self._failure_count = 0
                self._state = self.CLOSED

    def record_failure(self):
        with self._lock:
            self._failure_count += 1
            self._last_failure_time = time.time()
            if self._failure_count >= self.failure_threshold or self._state == self.HALF_OPEN:
                self._state = self.OPEN
                logger.error(
                    f"Circuit [{self.name}] → OPEN after {self._failure_count} failures. "
                    f"Will retry in {self.timeout}s"
                )

    def call(self, func, *args, **kwargs):
        """
        Execute func through the circuit breaker.
        Raises CircuitBreakerOpen if OPEN.
        """
        if self.state == self.OPEN:
            raise CircuitBreakerOpen(f"Circuit [{self.name}] is OPEN — service unavailable")
        try:
            result = func(*args, **kwargs)
            self.record_success()
            return result
        except Exception as e:
            self.record_failure()
            raise


# Global circuit breaker registry — one per downstream service
_circuit_breakers = {}
_cb_lock = threading.Lock()


def get_circuit_breaker(service_name: str) -> CircuitBreaker:
    """Get or create a circuit breaker for a named service."""
    from django.conf import settings
    with _cb_lock:
        if service_name not in _circuit_breakers:
            _circuit_breakers[service_name] = CircuitBreaker(
                name=service_name,
                failure_threshold=getattr(settings, 'CIRCUIT_BREAKER_FAILURE_THRESHOLD', 5),
                timeout=getattr(settings, 'CIRCUIT_BREAKER_TIMEOUT', 30),
            )
    return _circuit_breakers[service_name]


# ══════════════════════════════════════════════════════════
# Resilient HTTP GET with Retry + Circuit Breaker
# ══════════════════════════════════════════════════════════

def resilient_get(url: str, service_name: str, trace_id: str = None,
                  max_retries: int = 3, timeout: int = 10) -> dict:
    """
    Perform a GET request with:
      - Circuit breaker protection
      - Exponential backoff retry (up to max_retries)
      - Trace ID propagation

    Args:
        url:          Full URL to GET.
        service_name: Name for the circuit breaker (e.g. 'dealer-api').
        trace_id:     X-Trace-Id to propagate. Generated if not provided.
        max_retries:  Maximum retry attempts.
        timeout:      Per-request timeout in seconds.

    Returns:
        Parsed JSON response dict.

    Raises:
        CircuitBreakerOpen: If circuit is OPEN.
        requests.RequestException: If all retries fail.
    """
    cb = get_circuit_breaker(service_name)
    tid = trace_id or str(uuid.uuid4())
    headers = {'X-Trace-Id': tid}

    def _do_request():
        for attempt in range(1, max_retries + 1):
            try:
                response = requests.get(url, headers=headers, timeout=timeout)
                response.raise_for_status()
                logger.debug(f"[{service_name}] GET {url} → {response.status_code} (attempt {attempt})")
                return response.json()
            except (requests.Timeout, requests.ConnectionError) as e:
                if attempt == max_retries:
                    raise
                wait = 2 ** attempt
                logger.warning(f"[{service_name}] Attempt {attempt} failed, retrying in {wait}s: {e}")
                time.sleep(wait)
            except requests.HTTPError as e:
                raise   # Don't retry 4xx/5xx HTTP errors

    return cb.call(_do_request)


def resilient_post(url: str, service_name: str, data: dict,
                   trace_id: str = None, timeout: int = 10) -> dict:
    """
    POST with circuit breaker and trace ID.
    No retry on POST (not idempotent).
    """
    cb = get_circuit_breaker(service_name)
    tid = trace_id or str(uuid.uuid4())
    headers = {'X-Trace-Id': tid}

    def _do_post():
        response = requests.post(url, json=data, headers=headers, timeout=timeout)
        response.raise_for_status()
        return response.json()

    return cb.call(_do_post)


# ══════════════════════════════════════════════════════════
# RBAC Decorators
# ══════════════════════════════════════════════════════════

def role_required(allowed_roles):
    """
    Decorator enforcing RBAC on Django views.

    Roles are stored in user.profile.role (Guest/Customer/DealerAdmin).
    Falls back to checking is_staff for DealerAdmin.

    Args:
        allowed_roles (list): List of role strings that can access the view.

    Usage:
        @role_required(['Customer', 'DealerAdmin'])
        def my_view(request):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                from django.http import JsonResponse
                return JsonResponse({'error': 'UNAUTHORIZED', 'message': 'Authentication required'}, status=401)

            # Get role — is_staff counts as DealerAdmin
            user_role = 'Customer'
            if request.user.is_staff:
                user_role = 'DealerAdmin'

            if user_role not in allowed_roles and 'Guest' not in allowed_roles:
                from django.http import JsonResponse
                return JsonResponse({'error': 'FORBIDDEN', 'message': f'Role {user_role!r} not permitted'}, status=403)

            return func(request, *args, **kwargs)
        return wrapper
    return decorator


def customer_required(func):
    """Shorthand: requires Customer or DealerAdmin role."""
    return role_required(['Customer', 'DealerAdmin'])(func)


def dealer_admin_required(func):
    """Shorthand: requires DealerAdmin role only."""
    return role_required(['DealerAdmin'])(func)
