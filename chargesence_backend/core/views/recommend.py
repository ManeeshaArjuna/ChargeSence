import joblib
import requests
import os
from core.models import Charger, Vehicle
from math import radians, sin, cos, sqrt, atan2
from rest_framework.decorators import api_view
from rest_framework.response import Response

model = joblib.load("ml/ml_model.pkl")


def get_eta(origin_lat, origin_lng, dest_lat, dest_lng):
    api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin_lat},{origin_lng}&destinations={dest_lat},{dest_lng}&key={api_key}"

    res = requests.get(url).json()

    try:
        return res["rows"][0]["elements"][0]["duration"]["value"] / 60  # minutes
    except:
        return None

##################################################
# HAVERSINE
##################################################
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


##################################################
# MAIN FUNCTION
##################################################
def recommend_chargers(user, vehicle_id, start_lat, start_lon, user_battery):

    vehicle = Vehicle.objects.get(id=vehicle_id)

    battery_capacity = float(vehicle.battery_capacity_kwh)
    efficiency = float(vehicle.efficiency_wh_per_km) / 1000
    connector = vehicle.connector_type
    threshold = float(user.threshold)

    available_energy = (user_battery / 100) * battery_capacity
    reserve_energy = (threshold / 100) * battery_capacity

    usable_energy = max(available_energy - reserve_energy, 0)
    max_range = usable_energy / efficiency

    chargers = Charger.objects.filter(
        connector_type=connector,
        is_available=True
    )

    results = []

    for charger in chargers:

        if charger.station.latitude is None:
            continue

        lat = charger.station.latitude
        lng = charger.station.longitude

        distance = haversine(start_lat, start_lon, lat, lng)

        if distance > max_range:
            continue

        remaining_range = max_range - distance

        cost = float(charger.unit_cost)
        power = float(charger.power_kw)

        ##################################################
        # ETA (simple estimate)
        ##################################################
        eta = get_eta(start_lat, start_lon, lat, lng)

        if eta is None:
            eta = (distance / 40) * 60 

        ##################################################
        # ML
        ##################################################
        features = [[distance, cost, power, user_battery, remaining_range]]
        prob = model.predict_proba(features)[0][1]

        ##################################################
        #  IMPROVED SCORING (KEY FIX)
        ##################################################
        score = prob

        #  URGENCY LOGIC (VERY IMPORTANT)
        urgency = max(0, (threshold + 10 - user_battery))

        score += urgency * (1 / (distance + 1)) * 5

        ##################################################
        #  SMART RANGE TARGET LOGIC (NEW CORE)
        ##################################################

        #  Ideal charging point = 75% of max range
        target_distance = max_range * 0.75

        # distance difference from ideal
        distance_diff = abs(distance - target_distance)

        # closer to target → higher score
        score += 5 / (distance_diff + 1)

        #  avoid too near chargers
        if distance < max_range * 0.3:
            score -= 0.5

        #  avoid too far chargers
        if distance > max_range * 0.9:
            score -= 1

        # Urgency override (low battery users)
        if user_battery < 35:
            score += (1 / (distance + 1)) * 4

        score -= cost * 0.002
        score += power * 0.005

        # safety penalty
        if remaining_range < 10:
            score -= 0.5

        ##################################################
        # BATTERY %
        ##################################################
        energy_used = distance * efficiency
        battery_drop = (energy_used / battery_capacity) * 100
        estimated_battery = max(user_battery - battery_drop, 0)

        results.append({
            "id": charger.id,
            "station_name": charger.station.name,
            "connector": charger.connector_type,
            "distance": round(distance, 2),
            "cost": cost,
            "power": power,
            "lat": lat,
            "lng": lng,
            "eta": round(eta),
            "remaining_range": round(remaining_range, 2),
            "estimated_battery": round(estimated_battery, 1),
            "is_risky": remaining_range < 10,
            "score": score,
            "is_best": False
        })

    results = sorted(results, key=lambda x: x["score"], reverse=True)

    if results:
        results[0]["is_best"] = True

    return {
        "chargers": results[:5],
        "max_range": round(max_range, 2)
    }


@api_view(['POST'])
def recommend_api(request):

    user = request.user

    vehicle_id = request.data.get("vehicle_id")
    start_lat = request.data.get("start_lat")
    start_lon = request.data.get("start_lon")
    battery = request.data.get("battery")

    if not all([vehicle_id, start_lat, start_lon, battery]):
        return Response({"error": "Missing data"}, status=400)

    results = recommend_chargers(
        user=user,
        vehicle_id=vehicle_id,
        start_lat=float(start_lat),
        start_lon=float(start_lon),
        user_battery=float(battery)
    )

    return Response(results)