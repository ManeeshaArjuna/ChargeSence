from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.models import ChargingStation, Charger
import math


#  HAVERSINE (accurate distance)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon/2)**2

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


@api_view(['POST'])
def route_chargers(request):
    try:
        points = request.data.get("points", [])

        if not points:
            return Response({"data": []})

        stations = ChargingStation.objects.all()
        results = []

        start_point = points[0]
        end_point = points[-1]

        for station in stations:

            min_dist = 999
            closest_index = 0

            for i, p in enumerate(points):
                try:
                    lat = float(p["lat"])
                    lng = float(p["lng"])
                except:
                    continue

                dist = haversine(lat, lng, station.latitude, station.longitude)

                if dist < min_dist:
                    min_dist = dist
                    closest_index = i

            #  IMPORTANT (increase range)
            if min_dist > 30:   # 30 km corridor
                continue

            progress = closest_index / len(points)

            if progress < 0.05 or progress > 0.95:
                continue

            #  chargers
            chargers = Charger.objects.filter(station=station)

            charger_list = []
            for ch in chargers:
                charger_list.append({
                    "connector": ch.connector_type,
                    "power": float(ch.power_kw),
                    "cost": float(ch.unit_cost),
                })

            results.append({
                "id": station.id,
                "station_name": station.name,
                "address": getattr(station, "address", ""),
                "lat": station.latitude,
                "lng": station.longitude,
                "distance": round(min_dist, 2),
                "progress": progress,  #  IMPORTANT
                "chargers": charger_list,
                "connector": charger_list[0]["connector"] if charger_list else "Unknown",
                "power": charger_list[0]["power"] if charger_list else 0,
                "cost": charger_list[0]["cost"] if charger_list else 0,
            })

        return Response({"data": results})

    except Exception as e:
        print("ERROR:", e)
        return Response({"data": []})