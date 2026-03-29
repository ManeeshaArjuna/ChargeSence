from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Wallet, Reward, Charger

import math


# Distance calculation
def calculate_distance(lat1, lon1, lat2, lon2):
    return math.sqrt((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def home_dashboard(request):
    try:
        user = request.user

        # ✅ Wallet + Reward (existing system)
        wallet, _ = Wallet.objects.get_or_create(user=user)
        reward, _ = Reward.objects.get_or_create(user=user)

        # 🌍 User location
        user_lat = request.query_params.get("lat")
        user_lng = request.query_params.get("lng")

        stations = []

        if user_lat and user_lng:
            user_lat = float(user_lat)
            user_lng = float(user_lng)

            chargers = Charger.objects.select_related('station').all()

            station_dict = {}

            for c in chargers:
                station = c.station

                if station.latitude is not None and station.longitude is not None:

                    distance = calculate_distance(
                        user_lat,
                        user_lng,
                        station.latitude,
                        station.longitude
                    )

                    if station.id not in station_dict:
                        station_dict[station.id] = {
                            "station_name": station.name,
                            "address": station.location_address,
                            "phone": station.telephone,
                            "map": station.google_map_link,
                            "distance": distance,
                            "chargers": []
                        }

                    station_dict[station.id]["chargers"].append({
                        "connector": c.connector_type,
                        "power": float(c.power_kw),
                        "cost": float(c.unit_cost),
                        "available": True  # ✅ always available (your logic)
                    })

            stations = list(station_dict.values())
            stations = sorted(stations, key=lambda x: x["distance"])[:3]

        return Response({
            "name": user.username,
            "balance": float(wallet.balance),

            # 🎁 REWARD FIX (IMPORTANT)
            "rewards": reward.points,

            "favorites": [],
            "promotions": [
                "⚡ 20% OFF fast charging",
                "🔋 Free charging for 10 mins"
            ],
            "stations": stations
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)