"""
djangoproj URL Configuration — Best Cars Dealership Platform (v2)

Route hierarchy:
  /api/docs/           — Swagger UI (OpenAPI 3.0)
  /api/schema/         — OpenAPI JSON schema
  /api/health/         — Platform health check
  /api/v1/             — DRF versioned API endpoints
  /api/token/          — JWT token obtain
  /api/token/refresh/  — JWT token refresh
  /djangoapp/          — Legacy views (preserved for backward compat)
  /admin/              — Django admin
  /                    — React SPA (all other paths)
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf.urls.static import static
from django.conf import settings
from django.http import JsonResponse
import time
import uuid

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# ── Platform health check ──────────────────────────────────
_start_time = time.time()


def platform_health(request):
    """
    Unified health check for the Django Hub.
    The React Health Dashboard polls this endpoint.
    """
    import django
    from django.db import connection
    from django.core.cache import cache

    # Check DB
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False

    # Check Redis
    try:
        cache.set('_health_probe', '1', timeout=5)
        redis_ok = cache.get('_health_probe') == '1'
    except Exception:
        redis_ok = False

    uptime = round(time.time() - _start_time, 1)
    status_ok = db_ok  # Redis degraded is acceptable

    return JsonResponse({
        "service": "django-hub",
        "version": "2.0.0",
        "status": "healthy" if status_ok else "degraded",
        "uptime_seconds": uptime,
        "django_version": django.VERSION,
        "checks": {
            "database": {"connected": db_ok},
            "redis": {"connected": redis_ok},
        },
        "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z",
        "trace_id": request.headers.get('X-Trace-Id', str(uuid.uuid4())),
    }, status=200)


urlpatterns = [
    # ── Admin ──────────────────────────────────────────────
    path('admin/', admin.site.urls),

    # ── Health check ───────────────────────────────────────
    path('api/health/', platform_health, name='health'),

    # ── OpenAPI / Swagger ──────────────────────────────────
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # ── JWT Auth ───────────────────────────────────────────
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/blacklist/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # ── DRF versioned API ──────────────────────────────────
    path('api/v1/', include('djangoapp.api_urls')),

    # ── Legacy Django views (backward compat) ──────────────
    path('djangoapp/', include('djangoapp.urls')),

    # ── React SPA routes (serve index.html for all) ────────
    path('', TemplateView.as_view(template_name="Home.html")),
    path('about/', TemplateView.as_view(template_name="About.html")),
    path('contact/', TemplateView.as_view(template_name="Contact.html")),
    path('login/', TemplateView.as_view(template_name="index.html")),
    path('register/', TemplateView.as_view(template_name="index.html")),
    path('dealers/', TemplateView.as_view(template_name="index.html")),
    path('dealer/<int:dealer_id>', TemplateView.as_view(template_name="index.html")),
    path('postreview/<int:dealer_id>', TemplateView.as_view(template_name="index.html")),
    path('searchcars/<int:dealer_id>', TemplateView.as_view(template_name="index.html")),
    path('health-dashboard/', TemplateView.as_view(template_name="index.html")),

] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
