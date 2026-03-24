from rest_framework.decorators import api_view
from rest_framework.response import Response

from core.models import ChargingStation, Charger
from core.serializers.station_serializer import ChargingStationSerializer
from core.serializers.charger_serializer import ChargerSerializer


@api_view(['GET'])
def list_stations(request):

    stations = ChargingStation.objects.all()

    serializer = ChargingStationSerializer(stations, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def station_chargers(request, station_id):

    chargers = Charger.objects.filter(station_id=station_id)

    serializer = ChargerSerializer(chargers, many=True)

    return Response(serializer.data)