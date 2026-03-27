from rest_framework.decorators import api_view
from rest_framework.response import Response
from core.models import ChargingStation, Charger


@api_view(['POST'])
def route_chargers(request):
    try:
        points = request.data.get("points", [])

        print("📍 Incoming points count:", len(points))

        if not points:
            return Response({
                "error": "No route points received",
                "data": []
            })

        stations = ChargingStation.objects.all()
        results = []

        # 🧭 start & end points
        start_point = points[0]
        end_point = points[-1]

        for station in stations:

            closest_index = None
            min_dist = 999

            # 🔍 find closest point on route
            for i, p in enumerate(points):  # denser check

                try:
                    lat = float(p.get("lat"))
                    lng = float(p.get("lng"))
                except:
                    continue

                dist = ((station.latitude - lat) ** 2 + (station.longitude - lng) ** 2) ** 0.5

                if dist < min_dist:
                    min_dist = dist
                    closest_index = i

            # 🚫 strict distance filter
            if min_dist > 0.4:
                continue

            # 📊 route progression (0 → start, 1 → end)
            progress = closest_index / max(len(points), 1)

            # 🚫 remove start/end noise
            if progress < 0.1 or progress > 0.9:
                continue

            # 🧭 direction filter (avoid backward locations)
            start_dist = ((station.latitude - float(start_point["lat"]))**2 +
                          (station.longitude - float(start_point["lng"]))**2) ** 0.5

            end_dist = ((station.latitude - float(end_point["lat"]))**2 +
                        (station.longitude - float(end_point["lng"]))**2) ** 0.5

            if end_dist > start_dist:
                continue

            # 🔌 get chargers
            chargers = Charger.objects.filter(station=station)

            charger_list = []
            for ch in chargers:
                try:
                    charger_list.append({
                        "connector": getattr(ch, "connector_type", "Unknown"),
                        "power": float(getattr(ch, "power_kw", 0)),
                        "cost": float(getattr(ch, "unit_cost", 0)),
                    })
                except:
                    continue

            results.append({
                "station_name": station.name,
                "address": getattr(station, "address", ""),

                "lat": station.latitude,
                "lng": station.longitude,

                # convert approx distance to KM
                "distance": round(min_dist * 111, 2),

                "chargers": charger_list,

                # fallback for ML
                "connector": charger_list[0]["connector"] if charger_list else "Unknown",
                "power": charger_list[0]["power"] if charger_list else 0,
                "cost": charger_list[0]["cost"] if charger_list else 0,
                
            })

        print("⚡ Filtered stations:", len(results))

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