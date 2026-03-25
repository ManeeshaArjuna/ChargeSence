from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Wallet, Reward, Charger   # ✅ added Charger


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home_dashboard(request):
    try:
        user = request.user

        wallet, _ = Wallet.objects.get_or_create(user=user)
        reward, _ = Reward.objects.get_or_create(user=user)

        # ✅ Get chargers safely
        chargers = Charger.objects.all()[:3]

        charger_data = []
        for c in chargers:
            charger_data.append({
                "id": c.id,
                "station": c.station.name if c.station else "Unknown",
                "power": float(c.power_kw)
            })

        return Response({
            "name": user.username,
            "balance": float(wallet.balance),
            "rewards": reward.points,
            "favorites": [],
            "promotions": [
                "⚡ 20% OFF fast charging",
                "🔋 Free charging for 10 mins"
            ],
            "chargers": charger_data   # ✅ new field
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)