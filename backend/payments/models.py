from django.db import models
from django.conf import settings
import uuid


class Payment(models.Model):
    PAYMENT_METHODS = [
        ('CARD', 'Credit/Debit Card'),
        ('UPI', 'UPI'),
        ('NETBANKING', 'Net Banking'),
        ('WALLET', 'Wallet'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]
    payment_id = models.CharField(max_length=30, unique=True, editable=False)
    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_gateway_response = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.payment_id:
            self.payment_id = f"PAY{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Payment {self.payment_id} - ₹{self.amount}"
