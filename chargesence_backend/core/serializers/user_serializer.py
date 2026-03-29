from rest_framework import serializers
from core.models import User


class UserRegistrationSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'first_name',         
            'last_name',          
            'phone_number'         
        ]

        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):

        password = validated_data.pop('password')

        #  Create user with all fields
        user = User(**validated_data)

        #  Hash password properly
        user.set_password(password)

        user.save()

        return user
    
    def validate_phone_number(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("Invalid phone number")
        return value