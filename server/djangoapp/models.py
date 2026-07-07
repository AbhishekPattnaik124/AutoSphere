from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


# ── Car Make ───────────────────────────────────────────────────

class CarMake(models.Model):
    """Represents an automobile manufacturer / brand."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    country_of_origin = models.CharField(max_length=100, blank=True, default='')
    founded_year = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Car Make'
        verbose_name_plural = 'Car Makes'

    def __str__(self):
        return self.name


# ── Car Model ──────────────────────────────────────────────────

class CarModel(models.Model):
    """
    Represents a specific model offered by a CarMake.
    Many-to-One relationship: one CarMake → many CarModels.
    """
    car_make = models.ForeignKey(CarMake, on_delete=models.CASCADE, related_name='models')
    name = models.CharField(max_length=100)

    CAR_TYPES = [
        ('SEDAN',     'Sedan'),
        ('SUV',       'SUV'),
        ('WAGON',     'Wagon'),
        ('COUPE',     'Coupe'),
        ('HATCHBACK', 'Hatchback'),
        ('TRUCK',     'Truck'),
        ('MINIVAN',   'Minivan'),
        ('CONVERTIBLE', 'Convertible'),
    ]
    type = models.CharField(max_length=15, choices=CAR_TYPES, default='SUV')

    year = models.IntegerField(
        default=2024,
        validators=[
            MaxValueValidator(2026),
            MinValueValidator(2015),
        ],
    )

    class Meta:
        ordering = ['car_make__name', 'name']
        verbose_name = 'Car Model'
        verbose_name_plural = 'Car Models'

    def __str__(self):
        return f"{self.car_make.name} {self.name} ({self.year})"

# ── Dealership Billing ─────────────────────────────────────────

class DealershipBilling(models.Model):
    """
    Monetization: Tracks Lead Credits for dealerships.
    Dealerships purchase lead credits, which are deducted when
    a user books a test drive.
    """
    dealer_id = models.IntegerField(unique=True) # Maps to the external Node.js Dealer ID
    lead_credits = models.IntegerField(default=0)
    stripe_customer_id = models.CharField(max_length=100, blank=True, default='')
    is_sponsored = models.BooleanField(default=False)
    sponsor_expiry = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = 'Dealership Billing'
        verbose_name_plural = 'Dealership Billings'

    def __str__(self):
        return f"Dealer {self.dealer_id} - {self.lead_credits} Credits"

# ── Blockchain Vehicle Ledger ──────────────────────────────────

import hashlib

class VehicleLedger(models.Model):
    """
    Simulated Web3 Blockchain Ledger for immutable vehicle history.
    Stores maintenance and ownership events hashed with SHA-256.
    """
    vin = models.CharField(max_length=17, db_index=True)
    event_type = models.CharField(max_length=50) # 'SERVICE', 'SALE', 'ACCIDENT'
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    dealer_id = models.IntegerField(null=True, blank=True)
    previous_hash = models.CharField(max_length=64, blank=True)
    hash = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ['timestamp']

    def save(self, *args, **kwargs):
        # Cryptographic Hash computation (simulating Blockchain block creation)
        raw_data = f"{self.vin}{self.event_type}{self.description}{self.previous_hash}"
        self.hash = hashlib.sha256(raw_data.encode('utf-8')).hexdigest()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.vin} - {self.event_type} [{self.hash[:8]}]"
