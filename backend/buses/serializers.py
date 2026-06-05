from rest_framework import serializers
from .models import Bus, BusOperator, Route, Schedule, Trip, Seat


class BusOperatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusOperator
        fields = '__all__'


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = '__all__'


class BusSerializer(serializers.ModelSerializer):
    operator = BusOperatorSerializer(read_only=True)
    operator_id = serializers.IntegerField(write_only=True)
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = Bus
        fields = '__all__'


class ScheduleSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    route = RouteSerializer(read_only=True)

    class Meta:
        model = Schedule
        fields = '__all__'


class TripSerializer(serializers.ModelSerializer):
    schedule = ScheduleSerializer(read_only=True)
    booked_seats = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = '__all__'

    def get_booked_seats(self, obj):
        return obj.bookings.filter(status='CONFIRMED').values_list('seat__seat_number', flat=True)


class TripSearchSerializer(serializers.Serializer):
    source = serializers.CharField()
    destination = serializers.CharField()
    travel_date = serializers.DateField()
    bus_type = serializers.CharField(required=False, allow_blank=True)
