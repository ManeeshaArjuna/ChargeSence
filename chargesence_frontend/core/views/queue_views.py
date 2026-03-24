from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import ChargingQueue

from core.models import ChargingQueue, Charger, Vehicle


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_queue(request):

    charger_id = request.data.get("charger")
    vehicle_id = request.data.get("vehicle")
    duration = request.data.get("duration_minutes")
    requested_time = request.data.get("requested_time")

    try:
        charger = Charger.objects.get(id=charger_id)
        vehicle = Vehicle.objects.get(id=vehicle_id)
    except:
        return Response({"error": "Invalid charger or vehicle"}, status=400)

    # Calculate priority score (LOW battery = HIGH priority)
    battery_level = float(request.data.get("battery_level", 50))
    priority_score = 100 - battery_level

    # Get existing queue
    existing_queue = ChargingQueue.objects.filter(
        charger=charger,
        status="WAITING"
    ).order_by('-priority_score')

    # Determine position based on priority
    position = 1
    for q in existing_queue:
        if priority_score < q.priority_score:
            position += 1

    queue = ChargingQueue.objects.create(
        user=request.user,
        charger=charger,
        vehicle=vehicle,
        duration_minutes=duration,
        requested_time=requested_time,
        queue_position=position,
        priority_score=priority_score
    )

    return Response({
        "message": "Added to queue",
        "queue_position": position,
        "priority_score": priority_score
    })