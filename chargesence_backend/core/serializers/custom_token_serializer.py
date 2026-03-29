from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        #  ADD ROLE DATA
        data["username"] = self.user.username
        data["is_superuser"] = self.user.is_superuser
        data["is_staff"] = self.user.is_staff

        return data