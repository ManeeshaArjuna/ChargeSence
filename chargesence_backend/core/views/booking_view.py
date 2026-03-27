import requests
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Booking, Wallet, WalletTransaction


# ===============================
# 📲 SMS FUNCTION
# ===============================
def send_sms(phone, message):
    try:
        url = "https://app.text.lk/api/v3/sms/send"

        headers = {
            "Authorization": "Bearer 3987|8B3PFHkRxcQ0qLUEVwgsUJ9sKRPrtaSuFYllsR9m1617924e",
            "Content-Type": "application/json"
        }

        data = {
            "recipient": phone,
            "sender_id": "TextLKDemo",
            "message": message
        }

        res = requests.post(url, json=data, headers=headers)
        print("SMS Response:", res.json())

    except Exception as e:
        print("SMS Error:", e)


# ===============================
# AVAILABLE SLOTS
# ===============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_slots(request):

    charger_id = request.GET.get("charger_id")

    if not charger_id:
        return Response({"error": "charger_id missing"}, status=400)

    now = datetime.now()
    slots = []

    for i in range(1, 30):

        start = now + timedelta(minutes=5 * i)
        end = start + timedelta(minutes=10)

        conflict = Booking.objects.filter(
            charger_id=charger_id,
            start_time__lt=end + timedelta(minutes=5),
            end_time__gt=start - timedelta(minutes=5)
        ).exists()

        if not conflict:
            slots.append({
                "start": start.isoformat(),
                "end": end.isoformat()
            })

    return Response(slots)


# ===============================
# CREATE BOOKING
# ===============================
from datetime import datetime, timedelta
from core.models import Booking, Vehicle, Charger

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    print("🔥 CREATE BOOKING FUNCTION CALLED")

    try:
        user = request.user

        print("🔥 Incoming booking data:", request.data)

        # 🔹 GET RAW DATA SAFELY
        charger_id = request.data.get("charger_id")
        vehicle_id = request.data.get("vehicle_id")
        connector = request.data.get("connector")
        start = request.data.get("start")
        duration = request.data.get("duration")

        # 🔹 VALIDATION
        if not charger_id or not vehicle_id or not start or not duration:
            return Response({"error": "Missing required fields"}, status=400)

        try:
            charger_id = int(charger_id)
            vehicle_id = int(vehicle_id)
            duration = int(duration)
        except:
            return Response({"error": "Invalid numeric values"}, status=400)

        # 🔥 SAFE FETCH (NO CRASH)
        vehicle = Vehicle.objects.filter(id=vehicle_id, user=user).first()
        charger = Charger.objects.filter(id=charger_id).first()

        if not vehicle:
            return Response({"error": "Vehicle not found"}, status=400)

        if not charger:
            return Response({"error": "Charger not found"}, status=400)

        # 🔥 SAFE DATETIME PARSE
        try:
            start_time = datetime.fromisoformat(start.split(".")[0])
        except:
            return Response({"error": "Invalid start time format"}, status=400)

        end_time = start_time + timedelta(minutes=duration)

        # 💰 COST
        amount = (duration // 5) * 25

        # 🔥 CREATE BOOKING
        booking = Booking.objects.create(
            user=user,
            vehicle=vehicle,
            charger=charger,
            connector=connector,
            start_time=start_time,
            end_time=end_time,
            duration_minutes=duration,
            amount=amount,
            status="PENDING"
        )

        print("✅ Booking created:", booking.id)

        return Response({
            "booking_id": booking.id,
            "amount": amount
        })

    except Exception as e:
        print("❌ FINAL CREATE ERROR:", e)
        return Response({"error": str(e)}, status=400)


# ===============================
# 💳 PAY BOOKING (FINAL FIXED)
# ===============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_booking(request):
    print("🔥 PAY BOOKING CALLED:", request.data)

    try:
        booking_id = request.data.get("booking_id")
        user = request.user

        if not booking_id:
            return Response({"error": "booking_id missing"}, status=400)

        booking = Booking.objects.filter(id=booking_id).first()
        if not booking:
            return Response({"error": "Booking not found"}, status=404)

        wallet = Wallet.objects.filter(user=user).first()
        if not wallet:
            return Response({"error": "Wallet not found"}, status=400)

        if wallet.balance < booking.amount:
            return Response({"error": "Insufficient balance"}, status=400)

        # 💰 deduct
        wallet.balance -= booking.amount
        wallet.save()

        # ✅ update booking
        booking.status = "PAID"
        booking.save()

        print("✅ PAYMENT SUCCESS")

        return Response({
            "message": "Payment successful"
        })

    except Exception as e:
        print("❌ PAYMENT ERROR:", e)
        return Response({"error": str(e)}, status=500)