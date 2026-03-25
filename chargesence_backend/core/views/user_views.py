from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from core.serializers.user_serializer import UserRegistrationSerializer


@api_view(['POST'])
def register_user(request):

    serializer = UserRegistrationSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user

    return Response({
        "username": user.username,
        "email": user.email,
        "phone": user.phone_number,
        "role": user.role,
        "date_joined": user.date_joined,
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    new_password = request.data.get('password')

    if not new_password:
        return Response({"error": "Password required"}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password updated"})