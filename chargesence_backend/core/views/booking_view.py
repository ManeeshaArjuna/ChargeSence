import requests
import threading
import time
from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decimal import Decimal
from core.models import Booking, Wallet, WalletTransaction
from django.db import transaction
from datetime import datetime
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal



# ===============================
# 📲 SMS FUNCTION
# ===============================
def send_sms(phone, message):
    try:
        # ✅ format phone
        if phone.startswith("0"):
            phone = "94" + phone[1:]

        url = "https://app.text.lk/api/v3/sms/send"

        headers = {
            "Authorization": "Bearer 3987|8B3PFHkRxcQ0qLUEVwgsUJ9sKRPrtaSuFYllsR9m1617924e",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        data = {
            "recipient": phone,
            "sender_id": "TextLKDemo",
            "message": message
        }

        res = requests.post(url, json=data, headers=headers)

        print("📩 SMS STATUS:", res.status_code)
        print("📩 SMS RESPONSE:", res.text)

        if res.status_code != 200:
            print("❌ SMS FAILED")

    except Exception as e:
        print("❌ SMS ERROR:", e)

def check_low_balance(user, wallet):
    if wallet.balance < 100:  # threshold
        send_sms(
            user.phone_number,
            f"⚠️ ChargeSense: Your wallet balance is low (Rs {wallet.balance}). Please top up."
        )

def schedule_reminder(booking):

    def send_later():
        try:
            start_time = booking.start_time

            if timezone.is_naive(start_time):
                start_time = timezone.make_aware(start_time)

            now = timezone.now()

            # ⏱ Calculate seconds before 30 min
            delay = (start_time - now - timedelta(minutes=30)).total_seconds()

            if delay > 0:
                time.sleep(delay)

                send_sms(
                    booking.user.phone_number,
                    f"⏰ ChargeSense Reminder: Your booking #{booking.id} starts in 30 minutes."
                )

        except Exception as e:
            print("Reminder Error:", e)

    threading.Thread(target=send_later).start()


# ===============================
# AVAILABLE SLOTS
# ===============================
from django.utils import timezone
from datetime import timedelta

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_slots(request):

    charger_id = request.GET.get("charger_id")
    eta = request.GET.get("eta")

    if not charger_id:
        return Response({"error": "charger_id missing"}, status=400)

    try:
        eta = int(eta) if eta else 0
    except:
        eta = 0

    try:
        # ✅ USE NAIVE TIME (MATCH YOUR DB)
        now = timezone.localtime(timezone.now())

        # ✅ ADD ETA
        now = now + timedelta(minutes=eta)

        # ✅ ROUND TO NEXT 5 MIN
        minute = (now.minute // 5 + 1) * 5
        if minute >= 60:
            now = now.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
        else:
            now = now.replace(minute=minute, second=0, microsecond=0)

        slots = []

        for i in range(0, 30):

            start = now + timedelta(minutes=5 * i)
            end = start + timedelta(minutes=10)

            conflict = Booking.objects.filter(
                charger_id=charger_id,
                start_time__lt=end + timedelta(minutes=5),
                end_time__gt=start - timedelta(minutes=5)
            ).exists()

            if not conflict:
                slots.append({
                        "start": timezone.localtime(start).isoformat(),
                        "end": timezone.localtime(end).isoformat()
                })

        return Response(slots)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


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
            start_time = timezone.make_aware(start_time)
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

        # ✅ secure booking fetch
        booking = Booking.objects.filter(id=booking_id, user=user).first()
        if not booking:
            return Response({"error": "Booking not found"}, status=404)
        
        if booking.status == "PAID":
            return Response({"error": "Already paid"}, status=400)

        wallet = Wallet.objects.filter(user=user).first()
        if not wallet:
            return Response({"error": "Wallet not found"}, status=400)

        if wallet.balance < Decimal(str(booking.amount)):
            return Response({"error": "Insufficient balance"}, status=400)

        # ✅ ATOMIC TRANSACTION (VERY IMPORTANT)
        with transaction.atomic():

            wallet.balance = wallet.balance - Decimal(str(booking.amount))
            wallet.save()

            check_low_balance(user, wallet)

            schedule_reminder(booking)

            # 💳 transaction record
            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='PAYMENT',
                amount=booking.amount
            )

            booking.status = "PAID"
            booking.save()

            send_sms(
                user.phone_number,
                f"⚡ ChargeSense: Booking #{booking.id} confirmed. Booking Fee Recieved. Amount Rs {booking.amount}"
            )

        print("✅ PAYMENT SUCCESS")


        return Response({
            "message": "Payment successful"
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        print("❌ PAYMENT ERROR:", e)
        return Response({"error": str(e)}, status=500)
    
    # ===============================
# COMPLETE BOOKING
# ===============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_booking(request):
    try:
        booking = Booking.objects.get(id=request.data.get("booking_id"), user=request.user)

        energy = Decimal(str(request.data.get("energy_used")))
        cost = energy * booking.charger.unit_cost

        wallet = Wallet.objects.get(user=request.user)

        if wallet.balance < cost:
            return Response({"error": "Insufficient balance"}, status=400)

        wallet.balance -= cost
        wallet.save()

        wallet.balance -= cost
        wallet.save()
        check_low_balance(request.user, wallet)

        WalletTransaction.objects.create(
            wallet=wallet,
            transaction_type='PAYMENT',
            amount=cost
        )

        booking.energy_used_kwh = energy
        booking.final_amount = cost
        booking.status = "COMPLETED"
        booking.save()

        send_sms(
            request.user.phone_number,
            f"⚡ ChargeSense: Charging completed. Energy: {energy} kWh, Cost: Rs {cost}"
        )

        return Response({"message": "Completed", "cost": cost})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ===============================
# CANCEL BOOKING
# ===============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request):
    try:
        booking = Booking.objects.get(
            id=request.data.get("booking_id"),
            user=request.user
        )

        if booking.status == "CANCELLED":
            return Response({"error": "Already cancelled"}, status=400)

        if booking.status != "PAID":
            return Response({"error": "Cannot cancel this booking"}, status=400)

        # ✅ FIX TIMEZONE ISSUE
        start_time = booking.start_time

        if timezone.is_naive(start_time):
            start_time = timezone.make_aware(start_time)

        now = timezone.now()
        time_diff = start_time - now

        wallet = Wallet.objects.get(user=request.user)

        # 🔴 Late cancel fee
        if time_diff < timedelta(hours=1):
            fee = Decimal("50.00")

            if wallet.balance < fee:
                return Response({"error": "Insufficient balance"}, status=400)

            wallet.balance -= fee
            wallet.save()

            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type='PAYMENT',
                amount=fee
            )

        booking.status = "CANCELLED"
        booking.save()

        message = f"⚡ ChargeSense: Booking #{booking.id} cancelled. {'Late cancellation fee applied.' if time_diff < timedelta(hours=1) else 'No fee applied.'}"
        send_sms(request.user.phone_number, message)

        return Response({"message": "Booking cancelled successfully"})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_bookings(request):
    bookings = Booking.objects.filter(user=request.user).order_by('-created_at')

    data = []
    for b in bookings:
        data.append({
            "id": b.id,
            "station": b.charger.station.name,
            "connector": b.connector,
            "start_time": b.start_time,
            "status": b.status,
            "amount": float(b.amount),
            "final_amount": float(b.final_amount) if b.final_amount else None
        })

    return Response(data)