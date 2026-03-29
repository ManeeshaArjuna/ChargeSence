import random
from django.core.cache import cache

from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from core.models import Booking, Charger

from django.db.models import Sum, Count
from django.db.models.functions import TruncDate

from core.views.wallet_views import send_sms
from core.models import ChargingStation
from core.models import Charger, ChargingStation

from core.models import Booking

from core.models import Vehicle, User

from core.models import User

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
    maintenance_chargers = Charger.objects.filter(is_available=False).count()

    completed_bookings = Booking.objects.filter(status="COMPLETED").count()
    cancelled_bookings = Booking.objects.filter(status="CANCELLED").count()

    charging_revenue = Booking.objects.aggregate(
        total=Sum("final_amount")
    )["total"] or 0

    booking_revenue = Booking.objects.aggregate(
        total=Sum("amount")
    )["total"] or 0

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
        "maintenance_chargers": maintenance_chargers,

        "completed_bookings": completed_bookings,
        "cancelled_bookings": cancelled_bookings,

        "charging_revenue": float(charging_revenue),
        "booking_revenue": float(booking_revenue),

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


# SEND OTP
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_send_otp(request):
    try:
        if not request.user.is_superuser:
            return Response({"error": "Unauthorized"}, status=403)

        user_id = request.data.get("user_id")

        if not user_id:
            return Response({"error": "User ID required"}, status=400)

        user = User.objects.get(id=user_id)

        #  Check phone number
        if not user.phone_number:
            return Response({"error": "User has no phone number"}, status=400)

        otp = str(random.randint(1000, 9999))

        # SAVE OTP
        cache.set(f"admin_reset_{user_id}", otp, timeout=300)

        print("OTP:", otp)  # 👈 for testing

        #  SAFE SMS
        try:
            send_sms(user.phone_number, f"Please don't share this with anyone: Use ChargeSense OTP: {otp} to reset your password. Didn't request? Call 3737.")
        except Exception as e:
            print("SMS ERROR:", e)

        return Response({"message": "OTP sent"})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


# VERIFY OTP
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_verify_otp(request):
    try:
        user_id = request.data.get("user_id")
        otp = request.data.get("otp")

        saved_otp = cache.get(f"admin_reset_{user_id}")

        if not saved_otp:
            return Response({"error": "OTP expired"}, status=400)

        if saved_otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        return Response({"message": "OTP verified"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# RESET PASSWORD
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_reset_password(request):
    user_id = request.data.get("user_id")
    new_password = request.data.get("password")

    user = User.objects.get(id=user_id)
    user.set_password(new_password)
    user.save()

    return Response({"message": "Password updated"})

from core.models import ChargingStation

# GET ALL STATIONS
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stations(request):
    try:
        if not request.user.is_superuser:
            return Response({"error": "Unauthorized"}, status=403)

        search = request.GET.get("search", "")

        stations = ChargingStation.objects.all()

        if search:
            stations = stations.filter(name__icontains=search)

        data = []
        for s in stations:
            data.append({
                "id": s.id,
                "station_name": s.name,
                "address": s.location_address,
                "lat": s.latitude,
                "lng": s.longitude,
                "google_map_link": s.google_map_link,
                "telephone": s.telephone,
            })

        return Response(data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


# CREATE
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_station(request):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    ChargingStation.objects.create(
        name=request.data.get("station_name"),
        location_address=request.data.get("address"),
        latitude=request.data.get("lat"),
        longitude=request.data.get("lng"),
        google_map_link=request.data.get("google_map_link"),
        telephone=request.data.get("telephone"),
    )

    return Response({"message": "Created"})


# UPDATE
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_station(request, id):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    s = ChargingStation.objects.get(id=id)

    s.name = request.data.get("station_name", s.name)
    s.location_address = request.data.get("address", s.location_address)
    s.latitude = request.data.get("lat", s.latitude)
    s.longitude = request.data.get("lng", s.longitude)
    s.google_map_link = request.data.get("google_map_link", s.google_map_link)
    s.telephone = request.data.get("telephone", s.telephone)

    s.save()

    return Response({"message": "Updated"})


# DELETE
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_station(request, id):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    ChargingStation.objects.get(id=id).delete()

    return Response({"message": "Deleted"})

# ===============================
# GET CHARGERS
# ===============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chargers(request):
    try:
        if not request.user.is_superuser:
            return Response({"error": "Unauthorized"}, status=403)

        search = request.GET.get("search", "")

        chargers = Charger.objects.select_related("station").all()

        if search:
            chargers = chargers.filter(station__name__icontains=search)

        data = []
        for c in chargers:
            data.append({
                "id": c.id,
                "station_id": c.station.id,
                "station_name": c.station.name,
                "charger_type": c.charger_type,
                "connector_type": c.connector_type,
                "power_kw": c.power_kw,
                "unit_cost": c.unit_cost,
                "is_available": c.is_available
            })

        return Response(data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


# ===============================
# CREATE CHARGER
# ===============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_charger(request):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    station_id = request.data.get("station")

    Charger.objects.create(
        station=ChargingStation.objects.get(id=station_id),
        charger_type=request.data.get("charger_type"),
        connector_type=request.data.get("connector_type"),
        power_kw=request.data.get("power_kw"),
        unit_cost=request.data.get("unit_cost"),
        is_available=request.data.get("is_available", True)
    )

    return Response({"message": "Created"})


# ===============================
# UPDATE CHARGER
# ===============================
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_charger(request, id):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    c = Charger.objects.get(id=id)

    station_id = request.data.get("station")

    if station_id:
        c.station = ChargingStation.objects.get(id=station_id)

    c.charger_type = request.data.get("charger_type", c.charger_type)
    c.connector_type = request.data.get("connector_type", c.connector_type)
    c.power_kw = request.data.get("power_kw", c.power_kw)
    c.unit_cost = request.data.get("unit_cost", c.unit_cost)
    c.is_available = request.data.get("is_available", c.is_available)

    c.save()

    return Response({"message": "Updated"})


# ===============================
# DELETE CHARGER
# ===============================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_charger(request, id):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    Charger.objects.get(id=id).delete()

    return Response({"message": "Deleted"})

# ===============================
# GET BOOKINGS
# ===============================
# ===============================
# GET BOOKINGS (UPDATED)
# ===============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bookings(request):
    try:
        if not request.user.is_superuser:
            return Response({"error": "Unauthorized"}, status=403)

        search = request.GET.get("search", "")

        bookings = Booking.objects.select_related(
            "user", "charger__station"
        ).all().order_by("-id")

        if search:
            bookings = bookings.filter(user__username__icontains=search)

        #  TOTAL REVENUES
        charging_revenue = Booking.objects.aggregate(
            total=Sum("final_amount")
        )["total"] or 0

        booking_revenue = Booking.objects.aggregate(
            total=Sum("amount")
        )["total"] or 0

        data = []
        for b in bookings:
            data.append({
                "id": b.id,
                "user": getattr(b.user, "username", ""),
                "station": getattr(b.charger.station, "name", "") if b.charger else "",
                "charger": b.charger.id if b.charger else "",
                "status": getattr(b, "status", ""),
                "date": str(getattr(b, "date", "")),
                "start_time": str(getattr(b, "start_time", "")),
                "end_time": str(getattr(b, "end_time", "")),

                #  BOTH AMOUNTS
                "booking_fee": getattr(b, "amount", 0),
                "charging_amount": getattr(b, "final_amount", 0),
            })

        return Response({
            "bookings": data,
            "charging_revenue": float(charging_revenue),
            "booking_revenue": float(booking_revenue)
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


# ===============================
# UPDATE STATUS
# ===============================
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_booking_status(request, id):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    booking = Booking.objects.get(id=id)

    booking.status = request.data.get("status", booking.status)
    booking.save()

    return Response({"message": "Updated"})

# ===============================
# GET VEHICLES
# ===============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_vehicles(request):
    try:
        if not request.user.is_superuser:
            return Response({"error": "Unauthorized"}, status=403)

        search = request.GET.get("search", "")

        vehicles = Vehicle.objects.select_related("user").all()

        if search:
            vehicles = vehicles.filter(manufacturer__icontains=search)

        data = []
        for v in vehicles:
            data.append({
                "id": v.id,
                "user_id": v.user.id,
                "user": v.user.username,
                "manufacturer": v.manufacturer,
                "model": v.model,
                "battery": v.battery_capacity_kwh,
                "efficiency": v.efficiency_wh_per_km,
                "connector_type": v.connector_type
            })

        return Response(data)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ===============================
# CREATE VEHICLE
# ===============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_vehicle(request):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        user_id = request.data.get("user")

        #  VALIDATION
        if not user_id:
            return Response({"error": "User is required"}, status=400)

        user = User.objects.get(id=user_id)

        Vehicle.objects.create(
            user=user,
            manufacturer=request.data.get("manufacturer"),
            model=request.data.get("model"),
            battery_capacity_kwh=float(request.data.get("battery") or 0),
            efficiency_wh_per_km=float(request.data.get("efficiency") or 0),
            connector_type=request.data.get("connector_type"),
        )

        return Response({"message": "Created"})

    except User.DoesNotExist:
        return Response({"error": "Invalid user"}, status=400)

    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ===============================
# UPDATE VEHICLE
# ===============================
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_vehicle(request, id):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    v = Vehicle.objects.get(id=id)

    if request.data.get("user"):
        v.user = User.objects.get(id=request.data.get("user"))

    v.manufacturer = request.data.get("manufacturer", v.manufacturer)
    v.model = request.data.get("model", v.model)
    v.battery_capacity_kwh = request.data.get("battery", v.battery_capacity_kwh)
    v.battery_capacity_kwh = float(request.data.get("battery") or v.battery_capacity_kwh)
    v.efficiency_wh_per_km = float(request.data.get("efficiency") or v.efficiency_wh_per_km)

    v.save()

    return Response({"message": "Updated"})


# ===============================
# DELETE VEHICLE
# ===============================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_vehicle(request, id):
    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    Vehicle.objects.get(id=id).delete()

    return Response({"message": "Deleted"})

# ===============================
# SEND NOTIFICATIONS
# ===============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_notifications(request):

    if not request.user.is_superuser:
        return Response({"error": "Unauthorized"}, status=403)

    try:
        user_ids = request.data.get("users", [])
        message = request.data.get("message")

        if not message:
            return Response({"error": "Message is required"}, status=400)

        users = User.objects.filter(id__in=user_ids)

        sent_count = 0

        for user in users:
            if user.phone_number:
                send_sms(user.phone_number, message)
                sent_count += 1

        return Response({
            "message": f"Sent to {sent_count} users"
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)