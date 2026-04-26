"""
Structured JSON logging formatter — imported by settings.py.
Kept as a standalone module for clean import path:
    djangoapp.logging.JsonFormatter
"""
from djangoapp.exceptions import JsonFormatter  # noqa: F401 — re-export
