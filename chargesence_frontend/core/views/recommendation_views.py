from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Vehicle
from core.services.recommendation_service import recommend_charger


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_best_charger(request, vehicle_id):

    lat = request.query_params.get("lat")
    lng = request.query_params.get("lng")

    if not lat or not lng:
        return Response(
            {"error": "lat and lng query parameters are required"},
            status=400
        )

    # ✅ FIX: move battery_level INSIDE function
    battery_level = float(request.query_params.get("battery", 50))

    user_lat = float(lat)
    user_lng = float(lng)

    try:
        vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
    except Vehicle.DoesNotExist:
        return Response({"error": "Vehicle not found"}, status=404)

    charger, score, distance, queue_length = recommend_charger(
        vehicle,
        user_lat,
        user_lng,
        battery_level
    )

    if not charger:
        return Response({"message": "No compatible chargers available"})

    return Response({
        "recommended_station": charger.station.name,
        "charger_id": charger.id,
        "power_kw": charger.power_kw,
        "unit_cost": charger.unit_cost,
        "distance_km": round(distance, 2),
        "queue_length": queue_length,
        "priority_score": round(score, 2),

        # NEW
        "station_lat": charger.station.latitude,
        "station_lng": charger.station.longitude
    })