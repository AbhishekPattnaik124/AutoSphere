#!/bin/sh
# ============================================================
# Django Entrypoint — Best Cars Dealership Platform v2
# Runs before the main server command inside the container.
# ============================================================

set -e  # Exit immediately on any error

SERVICE="django-hub"
ENV="${DJANGO_ENV:-development}"

echo "============================================================"
echo "  AutoSphere — Best Cars Django Hub"
echo "  Environment: ${ENV}"
echo "  Build Time:  $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "============================================================"

# ── Step 1: Database migrations ───────────────────────────────
echo "[1/4] Applying database migrations..."
#
# NOTE: In production, migrations should be generated locally and
#       committed to version control. We run 'migrate' only (not
#       'makemigrations') to avoid accidental schema changes.
#       In development, we allow 'makemigrations' for convenience.
#
if [ "${ENV}" = "production" ]; then
    python manage.py migrate --noinput
else
    python manage.py makemigrations --noinput
    python manage.py migrate --noinput
fi
echo "      ✓ Migrations complete"

# ── Step 2: Static files ──────────────────────────────────────
echo "[2/4] Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true
echo "      ✓ Static files collected"

# ── Step 3: Default superuser ─────────────────────────────────
echo "[3/4] Ensuring default superuser exists..."
python manage.py shell -c "
from django.contrib.auth.models import User
import os

su_user  = os.getenv('DJANGO_SUPERUSER_USERNAME', 'root')
su_email = os.getenv('DJANGO_SUPERUSER_EMAIL',    'root@bestcars.com')
su_pass  = os.getenv('DJANGO_SUPERUSER_PASSWORD',  'root')

if not User.objects.filter(username=su_user).exists():
    User.objects.create_superuser(su_user, su_email, su_pass)
    print(f'      ✓ Superuser created: {su_user} / [REDACTED]')
else:
    print(f'      ✓ Superuser already exists: {su_user}')
" 2>/dev/null || true

# ── Step 4: Start server ──────────────────────────────────────
echo "[4/4] Starting server..."
echo "      ✓ Handing off to: $@"
echo "============================================================"
exec "$@"
