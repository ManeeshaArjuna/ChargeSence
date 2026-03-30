from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from core.models import User


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_settings(request):
    user = request.user
    threshold = request.data.get("threshold")

    if threshold is None:
        return Response({"error": "Threshold required"}, status=400)

    user.threshold = int(threshold)
    user.save()

    return Response({"message": "Settings saved"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_settings(request):
    user = request.user

    return Response({
        "threshold": user.threshold
    })