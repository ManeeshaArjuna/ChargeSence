from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Sum

from core.models import Booking, ChargingStation, WalletTransaction


@api_view(['GET'])
def admin_dashboard(request):

    total_bookings = Booking.objects.count()
    total_revenue = WalletTransaction.objects.filter(
        transaction_type="PAYMENT"
    ).aggregate(total=Sum('amount'))['total'] or 0

    popular_stations = ChargingStation.objects.annotate(
        booking_count=Count('charger__booking')
    ).order_by('-booking_count')[:5]

    data = [
        {
            "station": s.name,
            "bookings": s.booking_count
        }
        for s in popular_stations
    ]

    return Response({
        "total_bookings": total_bookings,
        "total_revenue": total_revenue,
        "popular_stations": data
    })