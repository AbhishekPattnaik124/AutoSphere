"""
Management command: seed_db
Populates the database with initial CarMake and CarModel data.
Safe to run multiple times — skips if data already exists.

Usage:
    python manage.py seed_db
"""

from django.core.management.base import BaseCommand
from djangoapp.models import CarMake
from djangoapp.populate import initiate


class Command(BaseCommand):
    help = 'Seed the database with initial CarMake and CarModel data.'

    def handle(self, *args, **options):
        if CarMake.objects.exists():
            self.stdout.write(self.style.WARNING(
                '✅ Database already seeded — skipping.'
            ))
            return

        self.stdout.write('🌱 Seeding database with car makes and models...')
        try:
            initiate()
            self.stdout.write(self.style.SUCCESS(
                f'✅ Seeded {CarMake.objects.count()} car makes successfully.'
            ))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'❌ Seeding failed: {e}'))
            raise
