from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Vehicle
from core.services.recommendation_service import recommend_charger


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_best_charger(request, vehicle_id):

    try:
        vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
    except Vehicle.DoesNotExist:
        return Response({"error": "Vehicle not found"}, status=404)

    charger, score = recommend_charger(vehicle)

    if not charger:
        return Response({"message": "No compatible chargers available"})

    return Response({
        "recommended_station": charger.station.name,
        "charger_id": charger.id,
        "charger_type": charger.charger_type,
        "power_kw": charger.power_kw,
        "unit_cost": charger.unit_cost,
        "priority_score": round(score, 2)
    })