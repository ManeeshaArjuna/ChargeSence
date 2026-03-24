from rest_framework import serializers
from core.models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Vehicle
        fields = [
            'id',
            'manufacturer',
            'model',
            'battery_capacity_kwh',
            'efficiency_wh_per_km',
            'connector_type'
        ]