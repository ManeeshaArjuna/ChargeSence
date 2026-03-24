from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from core.models import Vehicle
from core.serializers.vehicle_serializer import VehicleSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_vehicle(request):

    serializer = VehicleSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_vehicles(request):

    vehicles = Vehicle.objects.filter(user=request.user)

    serializer = VehicleSerializer(vehicles, many=True)

    return Response(serializer.data)