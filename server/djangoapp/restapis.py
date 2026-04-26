"""
REST API utilities — Best Cars Django Hub.

All inter-service HTTP calls go through resilient_get / resilient_post
which wrap every call in:
  1. Circuit breaker (CLOSED/OPEN/HALF-OPEN)
  2. Retry with exponential backoff (for GET only)
  3. Trace ID propagation (X-Trace-Id header)
"""

import os
import uuid
from dotenv import load_dotenv
from django.core.cache import cache

from djangoapp.exceptions import (
    resilient_get,
    resilient_post,
    CircuitBreakerOpen,
)

load_dotenv()

# ── Service base URLs (from environment) ──────────────────
backend_url = os.getenv('backend_url', 'http://localhost:3030')
sentiment_analyzer_url = os.getenv('sentiment_analyzer_url', 'http://localhost:5050/')
searchcars_url = os.getenv('searchcars_url', 'http://localhost:3050/')

DEALER_CACHE_TIMEOUT = int(os.getenv('DEALER_CACHE_TIMEOUT', 300))


# ══════════════════════════════════════════════════════════
# Dealer & Review Service
# ══════════════════════════════════════════════════════════

def get_request(endpoint: str, trace_id: str = None, **kwargs) -> dict | None:
    """
    GET from the Dealer/Review service with circuit breaker + retry.

    Args:
        endpoint:  Path to append to backend_url (e.g. '/fetchDealers').
        trace_id:  Caller's trace ID to propagate. Generated if absent.
        **kwargs:  URL query parameters (?key=value).

    Returns:
        Parsed JSON dict/list, or None on circuit open / network failure.
    """
    params = ''.join(f"{k}={v}&" for k, v in kwargs.items()) if kwargs else ''
    url = f"{backend_url}{endpoint}?{params}"
    tid = trace_id or str(uuid.uuid4())

    try:
        return resilient_get(url, service_name='dealer-api', trace_id=tid)
    except CircuitBreakerOpen:
        return None
    except Exception:
        return None


def get_dealerships_cached(endpoint: str, trace_id: str = None) -> dict | None:
    """
    Cached wrapper for the dealer list endpoint.
    Cache TTL: DEALER_CACHE_TIMEOUT (default 5 min).
    Cache is invalidated externally (on write) in a future enhancement.
    """
    cache_key = f"dealers:{endpoint}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    result = get_request(endpoint, trace_id=trace_id)
    if result is not None:
        cache.set(cache_key, result, timeout=DEALER_CACHE_TIMEOUT)
    return result


def post_review(data_dict: dict, trace_id: str = None) -> dict | None:
    """
    POST a new review to the Dealer service.

    Args:
        data_dict: Review payload dict.
        trace_id:  Trace ID to propagate.

    Returns:
        Saved review dict, or None on failure.
    """
    url = f"{backend_url}/insert_review"
    tid = trace_id or str(uuid.uuid4())
    try:
        return resilient_post(url, service_name='dealer-api', data=data_dict, trace_id=tid)
    except CircuitBreakerOpen:
        return None
    except Exception:
        return None


# ══════════════════════════════════════════════════════════
# Sentiment Analyzer Service
# ══════════════════════════════════════════════════════════

def analyze_review_sentiments(text: str, trace_id: str = None) -> dict:
    """
    Analyze sentiment for a single text string.
    Results are cached permanently (sentiment of a fixed string never changes).

    Args:
        text:      Review text to analyze.
        trace_id:  Trace ID to propagate.

    Returns:
        { sentiment, confidence, model } — or a neutral fallback on error.
    """
    if not text or not text.strip():
        return {"sentiment": "neutral", "confidence": 0.5, "model": "none"}

    cache_key = f"sentiment:{hash(text.strip())}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    url = f"{sentiment_analyzer_url}analyze/{text}"
    tid = trace_id or str(uuid.uuid4())
    try:
        result = resilient_get(url, service_name='sentiment-analyzer', trace_id=tid)
        if result:
            cache.set(cache_key, result, timeout=None)  # Cache forever
            return result
    except CircuitBreakerOpen:
        pass
    except Exception:
        pass

    # Graceful degradation: return neutral if analyzer is down
    return {"sentiment": "neutral", "confidence": 0.0, "model": "unavailable"}


def analyze_batch(texts: list, trace_id: str = None) -> list:
    """
    Batch analyze up to 50 review texts.
    Uses POST /analyze/batch endpoint on the sentiment service.

    Args:
        texts:    List of text strings (max 50).
        trace_id: Trace ID to propagate.

    Returns:
        List of { sentiment, confidence, model } results.
    """
    if not texts:
        return []

    url = f"{sentiment_analyzer_url}analyze/batch"
    tid = trace_id or str(uuid.uuid4())
    try:
        result = resilient_post(url, service_name='sentiment-analyzer', data={"texts": texts[:50]}, trace_id=tid)
        return result.get('results', []) if result else []
    except (CircuitBreakerOpen, Exception):
        return [{"sentiment": "neutral", "confidence": 0.0, "model": "unavailable"}] * len(texts)


# ══════════════════════════════════════════════════════════
# Car Inventory Service
# ══════════════════════════════════════════════════════════

def searchcars_request(endpoint: str, trace_id: str = None, **kwargs) -> dict | None:
    """
    GET from the Car Inventory service with circuit breaker + retry.

    Args:
        endpoint:  Path to append to searchcars_url (e.g. '/cars/1').
        trace_id:  Trace ID to propagate.
        **kwargs:  Query parameters.

    Returns:
        Parsed JSON, or None on circuit open / network failure.
    """
    params = ''.join(f"{k}={v}&" for k, v in kwargs.items()) if kwargs else ''
    url = f"{searchcars_url}{endpoint}?{params}"
    tid = trace_id or str(uuid.uuid4())
    try:
        return resilient_get(url, service_name='inventory-api', trace_id=tid)
    except CircuitBreakerOpen:
        return None
    except Exception:
        return None
