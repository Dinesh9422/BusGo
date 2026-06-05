from django.contrib import admin
from django.http import HttpResponseRedirect
from django.urls import path
from django.contrib import messages
from .models import Bus, BusOperator, Route, Schedule, Trip, Seat


@admin.register(BusOperator)
class BusOperatorAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_email', 'is_active']
    list_filter = ['is_active']


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ['bus_name', 'bus_number', 'bus_type', 'total_seats', 'operator', 'is_active', 'seat_count', 'generate_seats_button']
    list_filter = ['bus_type', 'is_active', 'operator']
    search_fields = ['bus_name', 'bus_number']

    def seat_count(self, obj):
        return Seat.objects.filter(bus=obj).count()
    seat_count.short_description = 'Seats Created'

    def generate_seats_button(self, obj):
        from django.utils.html import format_html
        return format_html(
            '<a class="button" href="generate-seats/{}/" style="background:#1a3faa;color:white;padding:5px 12px;border-radius:5px;text-decoration:none;font-size:12px;">🪑 Generate Seats</a>',
            obj.pk
        )
    generate_seats_button.short_description = 'Action'
    generate_seats_button.allow_tags = True

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('generate-seats/<int:bus_id>/', self.admin_site.admin_view(self.generate_seats_view), name='generate_seats'),
        ]
        return custom_urls + urls

    def generate_seats_view(self, request, bus_id):
        try:
            bus = Bus.objects.get(id=bus_id)
            Seat.objects.filter(bus=bus).delete()
            total_seats = bus.total_seats
            seat_count = 0
            while seat_count < total_seats:
                seat_count += 1
                seat_number = str(seat_count)
                seat_type = 'WINDOW' if seat_count % 4 in [1, 0] else 'AISLE'
                Seat.objects.create(
                    bus=bus,
                    seat_number=seat_number,
                    seat_type=seat_type,
                    deck='LOWER'
                )
            messages.success(request, f'✅ {seat_count} seats generated for {bus.bus_name}!')
        except Exception as e:
            messages.error(request, f'Error: {str(e)}')
        return HttpResponseRedirect('../')


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['source', 'destination', 'distance_km', 'estimated_duration']


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['bus', 'route', 'departure_time', 'arrival_time', 'fare', 'is_active']
    list_filter = ['is_active']


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    list_display = ['schedule', 'trip_date', 'available_seats', 'status']
    list_filter = ['status', 'trip_date']


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ['seat_number', 'bus', 'seat_type', 'deck']
    list_filter = ['bus', 'seat_type']