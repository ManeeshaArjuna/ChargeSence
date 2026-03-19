from rest_framework import serializers
from core.models import Charger


class ChargerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Charger
        fields = '__all__'