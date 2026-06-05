from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction, models
from django.utils import timezone
from .models import Booking, Review, PromoCode, LoyaltyPoints, LoyaltyTransaction, Notification
from .serializers import BookingSerializer, CreateBookingSerializer
from accounts.utils import send_booking_confirmation_email, send_cancellation_email
from rest_framework import serializers as drf_serializers


# ============ BOOKING VIEWS ============

class CreateBookingView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save(user=request.user, status='CONFIRMED')
        trip = booking.trip
        trip.available_seats -= 1
        trip.save()
        send_booking_confirmation_email(booking)

        # Add loyalty points (1 point per ₹10 spent)
        points_earned = int(float(booking.fare_paid) / 10)
        points_obj, _ = LoyaltyPoints.objects.get_or_create(user=request.user)
        points_obj.points += points_earned
        points_obj.total_earned += points_earned
        points_obj.save()

        LoyaltyTransaction.objects.create(
            user=request.user,
            points=points_earned,
            transaction_type='EARNED',
            description=f'Booking {booking.booking_id} - {booking.trip.schedule.route.source} to {booking.trip.schedule.route.destination}'
        )

        # Create notification
        Notification.objects.create(
            user=request.user,
            title='Booking Confirmed! 🎫',
            message=f'Your booking {booking.booking_id} is confirmed. Seat {booking.seat.seat_number} on {booking.trip.trip_date}.',
            notification_type='BOOKING'
        )

        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class UserBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            'trip__schedule__bus', 'trip__schedule__route', 'seat'
        )


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


class CancelBookingView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

        if booking.status != 'CONFIRMED':
            return Response({'error': 'Only confirmed bookings can be cancelled'},
                            status=status.HTTP_400_BAD_REQUEST)

        booking.status = 'CANCELLED'
        booking.cancellation_reason = request.data.get('reason', '')
        booking.save()
        booking.trip.available_seats += 1
        booking.trip.save()
        send_cancellation_email(booking)

        # Deduct loyalty points
        points_to_deduct = int(float(booking.fare_paid) / 10)
        try:
            points_obj = LoyaltyPoints.objects.get(user=request.user)
            points_obj.points = max(0, points_obj.points - points_to_deduct)
            points_obj.save()
            LoyaltyTransaction.objects.create(
                user=request.user,
                points=-points_to_deduct,
                transaction_type='REDEEMED',
                description=f'Cancelled booking {booking.booking_id}'
            )
        except LoyaltyPoints.DoesNotExist:
            pass

        # Notification
        Notification.objects.create(
            user=request.user,
            title='Booking Cancelled ❌',
            message=f'Your booking {booking.booking_id} has been cancelled. Refund will be processed within 5-7 days.',
            notification_type='CANCELLATION'
        )

        return Response({'message': 'Booking cancelled successfully'})


class DownloadTicketView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        from .utils import generate_ticket_pdf
        try:
            booking = Booking.objects.get(pk=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        return generate_ticket_pdf(booking)


# Admin Views
class AdminBookingListView(generics.ListAPIView):
    queryset = Booking.objects.all().select_related('user', 'trip__schedule__bus', 'seat')
    serializer_class = BookingSerializer
    permission_classes = [IsAdminUser]


class AdminBookingDetailView(generics.RetrieveUpdateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAdminUser]


# ============ REVIEW VIEWS ============

class ReviewSerializer(drf_serializers.ModelSerializer):
    user_name = drf_serializers.SerializerMethodField()
    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'bus', 'booking', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']
    def get_user_name(self, obj):
        return obj.user.get_full_name()


class AddReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        bus_id = request.data.get('bus')
        rating = request.data.get('rating', 5)
        comment = request.data.get('comment', '')
        booking_id = request.data.get('booking')

        if not bus_id:
            return Response({'error': 'Bus ID required'}, status=status.HTTP_400_BAD_REQUEST)

        review, created = Review.objects.update_or_create(
            user=request.user,
            bus_id=bus_id,
            defaults={'rating': rating, 'comment': comment, 'booking_id': booking_id}
        )
        return Response({'message': 'Review submitted!', 'created': created})


class BusReviewsView(APIView):
    permission_classes = []

    def get(self, request, bus_id):
        reviews = Review.objects.filter(bus_id=bus_id).select_related('user')
        data = ReviewSerializer(reviews, many=True).data
        avg = reviews.aggregate(avg=models.Avg('rating'))['avg'] or 0
        return Response({'reviews': data, 'average_rating': round(avg, 1), 'total': reviews.count()})


# ============ PROMO CODE VIEWS ============

class ValidatePromoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get('code', '').upper().strip()
        amount = float(request.data.get('amount', 0))

        try:
            promo = PromoCode.objects.get(code=code)
        except PromoCode.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid promo code'}, status=400)

        if not promo.is_valid():
            return Response({'valid': False, 'error': 'Promo code expired or exhausted'}, status=400)

        discount = min(amount * promo.discount_percent / 100, float(promo.max_discount))
        final_amount = max(amount - discount, 0)

        return Response({
            'valid': True,
            'code': promo.code,
            'discount_percent': promo.discount_percent,
            'discount_amount': round(discount, 2),
            'final_amount': round(final_amount, 2),
            'message': f'{promo.discount_percent}% off! You save ₹{round(discount, 2)}'
        })


# ============ LOYALTY POINTS VIEWS ============

class LoyaltyPointsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        points_obj, _ = LoyaltyPoints.objects.get_or_create(user=request.user)
        transactions = LoyaltyTransaction.objects.filter(user=request.user)[:10]
        return Response({
            'points': points_obj.points,
            'total_earned': points_obj.total_earned,
            'total_redeemed': points_obj.total_redeemed,
            'transactions': [
                {
                    'points': t.points,
                    'type': t.transaction_type,
                    'description': t.description,
                    'date': t.created_at.strftime('%Y-%m-%d')
                } for t in transactions
            ]
        })


# ============ NOTIFICATION VIEWS ============

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)[:20]
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({
            'notifications': [
                {
                    'id': n.id,
                    'title': n.title,
                    'message': n.message,
                    'type': n.notification_type,
                    'is_read': n.is_read,
                    'created_at': n.created_at.strftime('%Y-%m-%d %H:%M')
                } for n in notifications
            ],
            'unread_count': unread_count
        })

    def patch(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read'})


class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notif = Notification.objects.get(id=pk, user=request.user)
            notif.is_read = True
            notif.save()
            return Response({'message': 'Marked as read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)