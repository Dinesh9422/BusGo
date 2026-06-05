from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_id', 'user', 'amount', 'payment_method', 'status', 'transaction_id', 'created_at']
    list_filter = ['status', 'payment_method']
    search_fields = ['payment_id', 'transaction_id', 'user__email']
