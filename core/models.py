from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ('USER', 'User'),
        ('ADMIN', 'Admin'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')
    phone_number = models.CharField(max_length=15, blank=True, null=True)


class Vehicle(models.Model):

    CONNECTOR_TYPES = (
        ('TYPE1', 'Type 1'),
        ('TYPE2', 'Type 2'),
        ('CCS', 'CCS'),
        ('CHADEMO', 'CHAdeMO'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    manufacturer = models.CharField(max_length=50)
    model = models.CharField(max_length=50)

    battery_capacity_kwh = models.DecimalField(max_digits=6, decimal_places=2)
    efficiency_wh_per_km = models.DecimalField(max_digits=6, decimal_places=2)

    connector_type = models.CharField(max_length=20, choices=CONNECTOR_TYPES)

    def __str__(self):
        return f"{self.manufacturer} {self.model}"
    

class ChargingStation(models.Model):

    name = models.CharField(max_length=100)

    location_address = models.CharField(max_length=255)

    latitude = models.FloatField()
    longitude = models.FloatField()

    google_map_link = models.URLField(blank=True, null=True)

    telephone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.name
    

class Charger(models.Model):

    CHARGER_TYPES = (
        ('L2', 'L2 Charger'),
        ('L3', 'L3 Fast Charger'),
    )

    CONNECTOR_TYPES = (
        ('TYPE2', 'Type 2'),
        ('CCS2', 'CCS2'),
        ('CHADEMO', 'CHAdeMO'),
    )

    station = models.ForeignKey(ChargingStation, on_delete=models.CASCADE)

    charger_type = models.CharField(max_length=10, choices=CHARGER_TYPES)

    connector_type = models.CharField(max_length=20, choices=CONNECTOR_TYPES)

    power_kw = models.DecimalField(max_digits=6, decimal_places=2)

    unit_cost = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Cost per kWh"
    )

    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.station.name} - {self.charger_type} ({self.power_kw}kW)"
    

class Wallet(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.user.username} Wallet"


class WalletTransaction(models.Model):

    TRANSACTION_TYPES = (
        ('TOPUP', 'Top Up'),
        ('PAYMENT', 'Charging Payment'),
        ('REFUND', 'Refund'),
    )

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)

    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)


class Booking(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)

    charger = models.ForeignKey(Charger, on_delete=models.CASCADE)

    battery_level = models.DecimalField(max_digits=5, decimal_places=2)

    booking_time = models.DateTimeField()

    duration_minutes = models.IntegerField()

    status = models.CharField(
        max_length=20,
        choices=[
            ('BOOKED', 'Booked'),
            ('CANCELLED', 'Cancelled'),
            ('COMPLETED', 'Completed'),
        ],
        default='BOOKED'
    )

    # New fields for tracking charging session
    actual_end_time = models.DateTimeField(null=True, blank=True)

    extra_minutes = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking {self.id} - {self.user.username}"
    

class ChargingQueue(models.Model):

    user = models.ForeignKey('core.User', on_delete=models.CASCADE)
    vehicle = models.ForeignKey('core.Vehicle', on_delete=models.CASCADE)
    charger = models.ForeignKey('core.Charger', on_delete=models.CASCADE)

    requested_time = models.DateTimeField()
    duration_minutes = models.IntegerField()
    queue_position = models.IntegerField()

    priority_score = models.FloatField(default=0)

    status = models.CharField(
        max_length=20,
        choices=[
            ('WAITING', 'Waiting'),
            ('ALLOCATED', 'Allocated'),
            ('CANCELLED', 'Cancelled')
        ],
        default='WAITING'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Queue {self.id}"