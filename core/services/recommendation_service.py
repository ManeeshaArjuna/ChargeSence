from core.models import Charger
from core.services.distance_service import get_distance_km


def calculate_priority_score(vehicle, charger, user_lat, user_lng):

    # Distance
    distance = get_distance_km(
        user_lat,
        user_lng,
        charger.station.latitude,
        charger.station.longitude
    )

    if distance is None:
        distance = 100  # fallback

    # Factors
    battery_score = (100 - float(vehicle.battery_capacity_kwh)) * 0.4
    power_score = float(charger.power_kw) * 0.3
    price_score = (1 / float(charger.unit_cost)) * 100 * 0.2
    distance_score = (1 / distance) * 100 * 0.1

    total_score = battery_score + power_score + price_score + distance_score

    return total_score, distance


def recommend_charger(vehicle, user_lat, user_lng):

    chargers = Charger.objects.filter(is_available=True)

    best_charger = None
    best_score = -1
    best_distance = None

    for charger in chargers:

        print("Vehicle connector:", vehicle.connector_type)
        print("Charger connector:", charger.connector_type)

        if vehicle.connector_type.upper() != charger.connector_type.upper():
            continue

        score, distance = calculate_priority_score(
            vehicle,
            charger,
            user_lat,
            user_lng
        )

        if score > best_score:
            best_score = score
            best_charger = charger
            best_distance = distance

    return best_charger, best_score, best_distance