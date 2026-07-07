"""
djangoproj/logging_utils.py

Standalone JSON log formatter with zero Django or DRF dependencies.
This module is imported very early by the logging system (before apps are ready),
so it MUST NOT import anything from django.contrib or rest_framework.
"""

import json
import logging
from datetime import datetime, timezone


class JsonFormatter(logging.Formatter):
    """
    Emit log records as structured JSON for log aggregation tools
    (e.g. Datadog, CloudWatch, Loki).

    Output format:
        {"time": "...", "service": "django-hub", "level": "INFO", "logger": "...", "message": "..."}
    """

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "time": datetime.now(tz=timezone.utc).isoformat(),
            "service": "django-hub",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Propagate trace IDs if available
        if hasattr(record, 'trace_id'):
            log_entry["traceId"] = record.trace_id

        # Include exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        # Include any extra fields passed via logger.info("msg", extra={"key": "val"})
        for key, value in record.__dict__.items():
            if key not in (
                'name', 'msg', 'args', 'levelname', 'levelno', 'pathname',
                'filename', 'module', 'exc_info', 'exc_text', 'stack_info',
                'lineno', 'funcName', 'created', 'msecs', 'relativeCreated',
                'thread', 'threadName', 'processName', 'process', 'message',
                'trace_id',
            ):
                try:
                    json.dumps(value)  # Only include JSON-serializable extras
                    log_entry[key] = value
                except (TypeError, ValueError):
                    pass

        return json.dumps(log_entry, default=str)
