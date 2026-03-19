from core.models import Charger

def calculate_priority_score(vehicle, charger):

    battery_level = vehicle.battery_capacity_kwh
    charger_power = charger.power_kw
    unit_cost = charger.unit_cost

    score = (
        (100 - float(battery_level)) * 0.5 +
        float(charger_power) * 0.3 +
        (1 / float(unit_cost)) * 100 * 0.2
    )

    return score


def recommend_charger(vehicle):

    chargers = Charger.objects.filter(is_available=True)

    best_charger = None
    best_score = -1

    for charger in chargers:

        if vehicle.connector_type != charger.connector_type:
            continue

        score = calculate_priority_score(vehicle, charger)

        if score > best_score:
            best_score = score
            best_charger = charger

    return best_charger, best_score