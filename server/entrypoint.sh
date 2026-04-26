#!/bin/sh
# ============================================================
# Django Entrypoint — Best Cars Dealership Platform
# Runs before the main server command.
# ============================================================

set -e  # Exit immediately on any error

echo "============================================"
echo "  Best Cars Django Hub — Starting Up"
echo "  Environment: ${DJANGO_ENV:-development}"
echo "============================================"

echo "[1/4] Applying database migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput
echo "      ✓ Migrations complete"

echo "[2/4] Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true
echo "      ✓ Static files collected"

echo "[3/4] Creating default superuser (if not exists)..."
python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='root').exists():
    User.objects.create_superuser('root', 'root@bestcars.com', 'root')
    print('      ✓ Superuser created: root / root')
else:
    print('      ✓ Superuser already exists')
" 2>/dev/null || true

echo "[4/4] Starting server..."
exec "$@"
