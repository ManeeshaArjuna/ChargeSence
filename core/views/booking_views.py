from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from core.models import Booking
from core.serializers.booking_serializer import BookingSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):

    serializer = BookingSerializer(
        data=request.data,
        context={'request': request}
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_bookings(request):

    bookings = Booking.objects.filter(user=request.user)

    serializer = BookingSerializer(bookings, many=True)

    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):

    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    booking.status = "CANCELLED"
    booking.save()

    return Response({"message": "Booking cancelled"})