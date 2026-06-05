from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction
import uuid
from .models import Payment
from .serializers import PaymentSerializer, InitiatePaymentSerializer
from bookings.models import Booking


class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            booking = Booking.objects.get(id=data['booking_id'], user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)

        # Dummy payment processing - always succeeds (for demo)
        transaction_id = f"TXN{uuid.uuid4().hex[:12].upper()}"
        payment = Payment.objects.create(
            booking=booking,
            user=request.user,
            amount=booking.fare_paid,
            payment_method=data['payment_method'],
            status='SUCCESS',
            transaction_id=transaction_id,
            payment_gateway_response={
                'gateway': 'DummyPay',
                'transaction_id': transaction_id,
                'status': 'SUCCESS',
                'message': 'Payment processed successfully',
            }
        )
        return Response({
            'payment': PaymentSerializer(payment).data,
            'message': 'Payment successful!',
            'transaction_id': transaction_id,
        }, status=status.HTTP_201_CREATED)


class PaymentDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)


class UserPaymentHistoryView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user)


class AdminPaymentListView(generics.ListAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAdminUser]
