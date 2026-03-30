from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Charger


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_chargers(request):

    chargers = Charger.objects.select_related('station').all()

    stations = {}

    for c in chargers:
        station = c.station

        if station.id not in stations:
            stations[station.id] = {
                "station_name": station.name,
                "address": station.location_address,
                "phone": station.telephone,
                "map": station.google_map_link,
                "chargers": []
            }

        stations[station.id]["chargers"].append({
            "connector": c.connector_type,
            "power": float(c.power_kw),
            "cost": float(c.unit_cost),
            "available": c.is_available 
        })

    return Response(list(stations.values()))