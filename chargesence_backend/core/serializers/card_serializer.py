from rest_framework import serializers
from core.models import Card

class CardSerializer(serializers.ModelSerializer):
    masked = serializers.SerializerMethodField()

    class Meta:
        model = Card
        fields = ['id', 'masked', 'card_holder', 'expiry']

    def get_masked(self, obj):
        return obj.masked_number()