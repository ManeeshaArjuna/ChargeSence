from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.models import ChargingStation, Charger


@api_view(['POST'])
def route_chargers(request):
    try:
        points = request.data.get("points", [])

        print("📍 Incoming points count:", len(points))

        # 🚨 If no points → return early
        if not points:
            return Response({
                "error": "No route points received",
                "data": []
            })

        stations = ChargingStation.objects.all()
        results = []

        for station in stations:

            for p in points[::10]:  # slightly denser sampling

                try:
                    lat = float(p.get("lat"))
                    lng = float(p.get("lng"))
                except:
                    continue  # skip bad points

                # distance (rough)
                dist = ((station.latitude - lat) ** 2 + (station.longitude - lng) ** 2) ** 0.5

                # 🔥 Increased radius (IMPORTANT)
                if dist < 0.3:

                    chargers = Charger.objects.filter(station=station)

                    charger_list = []
                    for ch in chargers:
                        charger_list.append({
                            "connector": ch.connector_type,
                            "power": float(ch.power_kw),
                            "cost": float(ch.unit_cost),
                        })

                    results.append({
                        "station_name": station.name,
                        "address": getattr(station, "address", ""),

                        "lat": station.latitude,
                        "lng": station.longitude,

                        "distance": round(dist * 111, 2),

                        "chargers": charger_list,

                        # fallback (for frontend compatibility)
                        "connector": charger_list[0]["connector"] if charger_list else "Unknown",
                        "power": charger_list[0]["power"] if charger_list else 0,
                        "cost": charger_list[0]["cost"] if charger_list else 0,
                    })

                    break  # stop checking more points for this station

        print("⚡ Found stations:", len(results))

        return Response({
            "count": len(results),
            "data": results
        })

    except Exception as e:
        print("❌ ERROR in route_chargers:", str(e))
        return Response({
            "error": str(e),
            "data": []
        })