from rest_framework import serializers
from datetime import timedelta
from decimal import Decimal

from core.models import Booking, Wallet, WalletTransaction

BUFFER_MINUTES = 5


class BookingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

    # Duration validation
    def validate_duration_minutes(self, value):

        if value < 10:
            raise serializers.ValidationError(
                "Minimum booking duration is 10 minutes"
            )

        if value % 5 != 0:
            raise serializers.ValidationError(
                "Duration must increase in 5 minute increments"
            )

        return value

    # Booking conflict validation
    def validate(self, data):

        charger = data.get('charger')
        vehicle = data.get('vehicle')
        booking_time = data.get('booking_time')
        duration = data.get('duration_minutes')

        # Connector compatibility check
        if vehicle.connector_type.upper() != charger.connector_type.upper():
            raise serializers.ValidationError(
                "Vehicle connector type is not compatible with this charger."
            )

        booking_end = booking_time + timedelta(minutes=duration)

        existing_bookings = Booking.objects.filter(
            charger=charger,
            status="BOOKED"
        )

        for booking in existing_bookings:

            existing_start = booking.booking_time
            existing_end = booking.booking_time + timedelta(
                minutes=booking.duration_minutes + BUFFER_MINUTES
            )

            if booking_time < existing_end and booking_end > existing_start:
                raise serializers.ValidationError(
                    "This charger is already booked during that time slot."
                )

        return data


    def create(self, validated_data):

        user = self.context['request'].user
        charger = validated_data.get('charger')
        duration = validated_data.get('duration_minutes')

        # ENERGY COST
        estimated_energy = charger.power_kw * (Decimal(duration) / Decimal(60))
        energy_cost = estimated_energy * charger.unit_cost

        # BOOKING COST
        base_cost = Decimal(250)

        if duration > 10:
            extra_blocks = (duration - 10) // 5
            booking_cost = base_cost + Decimal(extra_blocks * 25)
        else:
            booking_cost = base_cost

        estimated_cost = energy_cost + booking_cost

        wallet = Wallet.objects.get(user=user)

        if wallet.balance < estimated_cost:
            raise serializers.ValidationError(
                "Insufficient wallet balance for this booking."
            )

        wallet.balance -= estimated_cost
        wallet.save()

        WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type="PAYMENT",
            amount=estimated_cost
        )

        booking = Booking.objects.create(
            user=user,
            **validated_data
        )

        return booking