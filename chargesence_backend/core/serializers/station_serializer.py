from rest_framework import serializers
from core.models import ChargingStation


class ChargingStationSerializer(serializers.ModelSerializer):

    class Meta:
        model = ChargingStation
        fields = '__all__'