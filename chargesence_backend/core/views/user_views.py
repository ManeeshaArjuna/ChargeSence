import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.views import TokenObtainPairView
from core.serializers.custom_token_serializer import CustomTokenSerializer

from core.serializers.user_serializer import UserRegistrationSerializer
from core.models import User
from core.views.booking_view import send_sms

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


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

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = request.user

    email = request.data.get("email")
    phone = request.data.get("phone")

    if email:
        user.email = email

    if phone:
        user.phone_number = phone  #  match your model field

    user.save()

    return Response({"message": "Profile updated"})

# For password reset flow

OTP_STORE = {}

@api_view(['POST'])
def request_otp(request):
    username = request.data.get("username")
    last4 = request.data.get("last4")

    try:
        user = User.objects.get(username=username)

        #  SAFE CHECK (IMPORTANT)
        if not user.phone_number:
            return Response({"error": "No phone number registered"}, status=400)

        if not user.phone_number.endswith(last4):
            return Response({"error": "Invalid phone verification"}, status=400)

        otp = str(random.randint(1000, 9999))
        OTP_STORE[username] = otp

        #  SEND SMS
        send_sms(user.phone_number, f"Please don't share this with anyone: Use ChargeSense OTP: {otp} to reset your password. Didn't request? Call 3737. ")
        print("OTP:", otp)

        return Response({"message": "OTP sent"})

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    except Exception as e:
        print("OTP ERROR:", e)  #  VERY IMPORTANT DEBUG
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def verify_otp(request):
    username = request.data.get("username")
    otp = request.data.get("otp")

    if OTP_STORE.get(username) == otp:
        return Response({"message": "OTP verified"})
    else:
        return Response({"error": "Invalid OTP"}, status=400)


@api_view(['POST'])
def reset_password(request):
    username = request.data.get("username")
    password = request.data.get("password")

    try:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.save()

        OTP_STORE.pop(username, None)

        return Response({"message": "Password reset successful"})
    except:
        return Response({"error": "Error"}, status=400)