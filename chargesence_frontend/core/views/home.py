from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Wallet, Reward


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home_dashboard(request):
    user = request.user

    try:
        wallet, _ = Wallet.objects.get_or_create(user=user)
        reward, _ = Reward.objects.get_or_create(user=user)

        return Response({
            "name": user.username,
            "balance": float(wallet.balance),
            "rewards": reward.points,
            "favorites": [],
            "promotions": [
                "⚡ 20% OFF fast charging",
                "🔋 Free charging for 10 mins"
            ]
        })

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=500)