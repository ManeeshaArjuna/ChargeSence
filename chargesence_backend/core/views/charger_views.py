from decimal import Decimal

from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.models import Charger


@api_view(['GET'])
def estimate_charging_cost(request, charger_id):

    duration = request.query_params.get("duration")

    if not duration:
        return Response({"error": "duration parameter required"}, status=400)

    duration = int(duration)

    try:
        charger = Charger.objects.get(id=charger_id)
    except Charger.DoesNotExist:
        return Response({"error": "Charger not found"}, status=404)

    # ENERGY COST
    estimated_energy = charger.power_kw * (Decimal(duration) / Decimal(60))
    energy_cost = estimated_energy * charger.unit_cost

    # BOOKING COST
    base_cost = Decimal(250)

    if duration > 10:
        extra_blocks = (duration - 10) // 5
        booking_cost = base_cost + Decimal(extra_blocks * 25)
    else:
        booking_cost = base_cost

    # TOTAL COST
    total_estimated_cost = energy_cost + booking_cost

    return Response({
        "charger_power_kw": charger.power_kw,
        "duration_minutes": duration,

        "estimated_energy_kwh": round(estimated_energy, 2),
        "energy_cost_lkr": round(energy_cost, 2),

        "booking_cost_lkr": booking_cost,

        "total_estimated_cost_lkr": round(total_estimated_cost, 2),

        "overstay_rate_lkr_per_min": 20
    })