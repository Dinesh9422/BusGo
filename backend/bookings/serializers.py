from rest_framework import serializers
from .models import Booking
from buses.serializers import TripSerializer, SeatSerializer


class BookingSerializer(serializers.ModelSerializer):
    trip_detail = TripSerializer(source='trip', read_only=True)
    seat_detail = SeatSerializer(source='seat', read_only=True)

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['booking_id', 'user', 'booked_at', 'updated_at']


class CreateBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['trip', 'seat', 'passenger_name', 'passenger_age',
                  'passenger_gender', 'passenger_phone', 'fare_paid']

    def validate(self, attrs):
        trip = attrs['trip']
        seat = attrs['seat']
        # Check seat already booked for this trip
        if Booking.objects.filter(trip=trip, seat=seat, status='CONFIRMED').exists():
            raise serializers.ValidationError({'seat': 'This seat is already booked.'})
        # Check trip available
        if trip.available_seats <= 0:
            raise serializers.ValidationError({'trip': 'No seats available for this trip.'})
        return attrs
