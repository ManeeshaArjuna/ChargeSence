from core.models import Charger
from core.services.distance_service import get_distance_km
from core.models import ChargingQueue


def calculate_priority_score(vehicle, charger, user_lat, user_lng, battery_level):

    # Distance
    distance = get_distance_km(
        user_lat,
        user_lng,
        charger.station.latitude,
        charger.station.longitude
    )

    if distance is None or distance == 0:
        distance = 50

    # Queue length
    queue_length = ChargingQueue.objects.filter(
        charger=charger,
        status="WAITING"
    ).count()

    # AI Factors
    battery_score = (100 - float(battery_level)) * 0.3
    power_score = float(charger.power_kw) * 0.2
    price_score = (1 / float(charger.unit_cost)) * 100 * 0.15
    distance_score = (1 / distance) * 100 * 0.15

    # New factors
    availability_score = 20 if charger.is_available else 0
    queue_score = max(0, 20 - queue_length * 5)

    total_score = (
        battery_score +
        power_score +
        price_score +
        distance_score +
        availability_score +
        queue_score
    )

    return total_score, distance, queue_length


def recommend_charger(vehicle, user_lat, user_lng, battery_level):

    chargers = Charger.objects.all()

    best_charger = None
    best_score = -1
    best_distance = None
    best_queue = None

    for charger in chargers:

        if vehicle.connector_type.strip().upper() != charger.connector_type.strip().upper():
            continue

        score, distance, queue_length = calculate_priority_score(
            vehicle,
            charger,
            user_lat,
            user_lng,
            battery_level
        )

        if score > best_score:
            best_score = score
            best_charger = charger
            best_distance = distance
            best_queue = queue_length

    return best_charger, best_score, best_distance, best_queue

def normalize_connector(conn):
    conn = conn.strip().upper()

    if conn == "CCS":
        return "CCS2"

    return conn