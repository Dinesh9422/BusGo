from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.utils import timezone
from .models import Bus, BusOperator, Route, Schedule, Trip, Seat
from .serializers import (BusSerializer, BusOperatorSerializer, RouteSerializer,
                           ScheduleSerializer, TripSerializer, TripSearchSerializer)


class SearchTripsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        serializer = TripSearchSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        trips = Trip.objects.filter(
            schedule__route__source__icontains=data['source'],
            schedule__route__destination__icontains=data['destination'],
            trip_date=data['travel_date'],
            status='SCHEDULED',
            available_seats__gt=0
        ).select_related('schedule__bus__operator', 'schedule__route')

        if data.get('bus_type'):
            trips = trips.filter(schedule__bus__bus_type=data['bus_type'])

        return Response(TripSerializer(trips, many=True).data)


class TripDetailView(generics.RetrieveAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [AllowAny]


class RouteListView(generics.ListAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [AllowAny]


class PopularRoutesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        routes = Route.objects.all()[:10]
        return Response(RouteSerializer(routes, many=True).data)


# Admin Views
class AdminBusListCreateView(generics.ListCreateAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAdminUser]


class AdminBusDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAdminUser]


class AdminScheduleListCreateView(generics.ListCreateAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAdminUser]


class AdminTripListCreateView(generics.ListCreateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsAdminUser]


class AdminRouteListCreateView(generics.ListCreateAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAdminUser]

class GenerateSeatsView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, bus_id):
        try:
            bus = Bus.objects.get(id=bus_id)
        except Bus.DoesNotExist:
            return Response({'error': 'Bus not found'}, status=404)

        Seat.objects.filter(bus=bus).delete()

        total_seats = bus.total_seats
        seats_per_row = 4
        rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        created_seats = []
        seat_count = 0
        row_idx = 0

        while seat_count < total_seats:
            row = rows[row_idx]
            for col in range(1, seats_per_row + 1):
                if seat_count >= total_seats:
                    break
                seat_number = f"{row}{col}"
                seat_type = 'WINDOW' if col in [1, 4] else 'AISLE'
                Seat.objects.create(
                    bus=bus,
                    seat_number=seat_number,
                    seat_type=seat_type,
                    deck='LOWER'
                )
                created_seats.append(seat_number)
                seat_count += 1
            row_idx += 1

        return Response({
            'message': f'{len(created_seats)} seats generated!',
            'seats': created_seats
        })