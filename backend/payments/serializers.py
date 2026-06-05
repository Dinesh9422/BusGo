from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['payment_id', 'user', 'status', 'transaction_id', 'created_at']


class InitiatePaymentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=['CARD', 'UPI', 'NETBANKING', 'WALLET'])
    # Dummy card details
    card_number = serializers.CharField(required=False, allow_blank=True)
    card_expiry = serializers.CharField(required=False, allow_blank=True)
    card_cvv = serializers.CharField(required=False, allow_blank=True)
    upi_id = serializers.CharField(required=False, allow_blank=True)
