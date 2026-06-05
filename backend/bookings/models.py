import uuid
from django.db import models
from django.conf import settings


class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
    ]
    booking_id = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    trip = models.ForeignKey('buses.Trip', on_delete=models.CASCADE, related_name='bookings')
    seat = models.ForeignKey('buses.Seat', on_delete=models.CASCADE, related_name='bookings')
    passenger_name = models.CharField(max_length=200)
    passenger_age = models.PositiveIntegerField()
    passenger_gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')])
    passenger_phone = models.CharField(max_length=15)
    fare_paid = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    booked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancellation_reason = models.TextField(blank=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['-booked_at']

    def save(self, *args, **kwargs):
        if not self.booking_id:
            self.booking_id = f"BG{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking {self.booking_id} - {self.user.get_full_name()}"
# ADD THESE MODELS TO THE BOTTOM OF backend/bookings/models.py
# (Keep existing Booking model, just add these below)

class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    bus = models.ForeignKey('buses.Bus', on_delete=models.CASCADE, related_name='reviews')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='review', null=True, blank=True)
    rating = models.PositiveIntegerField(default=5)  # 1-5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'bus']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.bus.bus_name} - {self.rating}⭐"


class PromoCode(models.Model):
    code = models.CharField(max_length=20, unique=True)
    discount_percent = models.PositiveIntegerField(default=10)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, default=200)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()
    max_uses = models.PositiveIntegerField(default=100)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.discount_percent}% off"

    def is_valid(self):
        from django.utils import timezone
        return (
            self.is_active and
            self.used_count < self.max_uses and
            self.valid_from <= timezone.now() <= self.valid_until
        )


class LoyaltyPoints(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loyalty_points')
    points = models.PositiveIntegerField(default=0)
    total_earned = models.PositiveIntegerField(default=0)
    total_redeemed = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.points} points"


class LoyaltyTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('EARNED', 'Earned'),
        ('REDEEMED', 'Redeemed'),
        ('EXPIRED', 'Expired'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loyalty_transactions')
    points = models.IntegerField()
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.transaction_type} - {self.points} pts"


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('BOOKING', 'Booking'),
        ('PAYMENT', 'Payment'),
        ('CANCELLATION', 'Cancellation'),
        ('PROMO', 'Promo'),
        ('REMINDER', 'Reminder'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='BOOKING')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.title}"        
