from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home_dashboard(request):
    user = request.user

    return Response({
        "name": user.username,
        "balance": 1200,
        "rewards": 350,
        "favorites": [],
        "promotions": [
            "⚡ 20% OFF fast charging",
            "🔋 Free charging for 10 mins"
        ]
    })