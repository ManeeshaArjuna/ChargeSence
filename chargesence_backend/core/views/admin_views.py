from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from core.models import Booking, Charger

from django.db.models import Sum, Count
from django.db.models.functions import TruncDate

User = get_user_model()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):

    #  Only super admin
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    #  TOTALS
    total_users = User.objects.count()
    total_bookings = Booking.objects.count()
    total_revenue = Booking.objects.aggregate(
        total=Sum("final_amount")
    )["total"] or 0

    active_chargers = Charger.objects.filter(is_available=True).count()

    # BOOKINGS PER DAY
    bookings_per_day = (
        Booking.objects
        .annotate(date=TruncDate("created_at"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )

    #  REVENUE PER DAY
    revenue_per_day = (
        Booking.objects
        .annotate(date=TruncDate("created_at"))
        .values("date")
        .annotate(total=Sum("final_amount"))
        .order_by("date")
    )

    return Response({
        "total_users": total_users,
        "total_bookings": total_bookings,
        "total_revenue": float(total_revenue),
        "active_chargers": active_chargers,
        "bookings_per_day": list(bookings_per_day),
        "revenue_per_day": list(revenue_per_day),
    })

# GET ALL USERS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    search = request.GET.get("search", "")

    users = User.objects.all()

    if search:
        users = users.filter(username__icontains=search)

    data = []
    for u in users:
        data.append({
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "phone_number": getattr(u, "phone_number", ""),
            "is_superuser": u.is_superuser,
        })

    return Response(data)


# CREATE USER / ADMIN
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    user = User.objects.create_user(
        username=request.data.get("username"),
        password=request.data.get("password"),
        email=request.data.get("email"),
        first_name=request.data.get("first_name"),
        last_name=request.data.get("last_name"),
    )

    # phone number (custom field)
    user.phone_number = request.data.get("phone_number")

    # ROLE
    if request.data.get("is_admin"):
        user.is_superuser = True
        user.is_staff = True

    user.save()

    return Response({"message": "User created"})


# UPDATE USER
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, id):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    user = User.objects.get(id=id)

    user.username = request.data.get("username", user.username)
    user.email = request.data.get("email", user.email)
    user.first_name = request.data.get("first_name", user.first_name)
    user.last_name = request.data.get("last_name", user.last_name)

    if "phone_number" in request.data:
        user.phone_number = request.data.get("phone_number")

    if "is_admin" in request.data:
        user.is_superuser = request.data.get("is_admin")
        user.is_staff = request.data.get("is_admin")

    user.save()

    return Response({"message": "Updated"})


# DELETE USER
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, id):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    user = User.objects.get(id=id)
    user.delete()

    return Response({"message": "Deleted"})