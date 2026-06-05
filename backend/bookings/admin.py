from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['booking_id', 'user', 'passenger_name', 'trip', 'seat', 'fare_paid', 'status', 'booked_at']
    list_filter = ['status', 'booked_at']
    search_fields = ['booking_id', 'passenger_name', 'user__email']
    ordering = ['-booked_at']
