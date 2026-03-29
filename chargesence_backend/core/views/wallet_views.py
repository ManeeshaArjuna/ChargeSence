import requests

from core.models import Card, Reward, Wallet
from core.serializers.card_serializer import CardSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


# ===============================
#  SMS FUNCTION
# ===============================
def send_sms(phone, message):
    try:
        if phone and phone.startswith("0"):
            phone = "94" + phone[1:]

        url = "https://app.text.lk/api/v3/sms/send"

        headers = {
            "Authorization": "Bearer 3987|8B3PFHkRxcQ0qLUEVwgsUJ9sKRPrtaSuFYllsR9m1617924e",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        data = {
            "recipient": phone,
            "sender_id": "ChargeSence",
            "message": message
        }

        res = requests.post(url, json=data, headers=headers)

        print("📩 SMS STATUS:", res.status_code)
        print("📩 SMS RESPONSE:", res.text)

    except Exception as e:
        print("❌ SMS ERROR:", e)


# ===============================
#  GET CARDS
# ===============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cards(request):
    cards = Card.objects.filter(user=request.user)
    serializer = CardSerializer(cards, many=True)
    return Response(serializer.data)


# ===============================
#  ADD CARD
# ===============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_card(request):
    card = Card.objects.create(
        user=request.user,
        card_number=request.data.get("number").replace(" ", ""),
        card_holder=request.data.get("name"),
        expiry=request.data.get("expiry")
    )
    return Response({"message": "Card added"})


# ===============================
#  DELETE CARD
# ===============================
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_card(request, id):
    try:
        card = Card.objects.get(id=id, user=request.user)
        card.delete()
        return Response({"message": "Deleted"})
    except Card.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


# ===============================
#  REWARD REDEMPTION (FIXED)
# ===============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def redeem_rewards(request):
    try:
        points = request.data.get("points")

        if not points:
            return Response({"error": "Points required"}, status=400)

        points = int(points)

        reward = Reward.objects.get(user=request.user)
        wallet = Wallet.objects.get(user=request.user)

        #  validation
        if points < 100:
            return Response({"error": "Minimum 100 points"}, status=400)

        if reward.points < points:
            return Response({"error": "Not enough points"}, status=400)

        #  update
        reward.points -= points
        wallet.balance += points

        reward.save()
        wallet.save()

        #  SAFE SMS (won't crash API)
        try:
            send_sms(
                request.user.phone_number,
                f"🎁 Redeemed {points} points. Wallet credited!"
            )
        except Exception as e:
            print("SMS failed:", e)

        return Response({"message": "Redeemed successfully"})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)