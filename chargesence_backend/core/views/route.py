from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.models import ChargingStation

@api_view(['POST'])
def route_chargers(request):
    points = request.data.get("points", [])

    stations = ChargingStation.objects.all()

    results = []

    for station in stations:
        for p in points[::20]:  # reduce points (performance)
            dist = ((station.latitude - p['lat'])**2 + (station.longitude - p['lng'])**2) ** 0.5

            if dist < 0.05:  # ~5km radius
                results.append({
                    "name": station.name,
                    "lat": station.latitude,
                    "lng": station.longitude,
                })
                break

    return Response(results)