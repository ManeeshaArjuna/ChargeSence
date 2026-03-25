from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.models import Wallet, WalletTransaction
from decimal import Decimal

# ---------------- WALLET VIEWS ----------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_dashboard(request):
    user = request.user

    wallet, _ = Wallet.objects.get_or_create(user=user)

    transactions = WalletTransaction.objects.filter(wallet=wallet).order_by('-created_at')

    tx_data = []
    for t in transactions:
        tx_data.append({
            "type": t.transaction_type,
            "amount": float(t.amount),
            "date": t.created_at.strftime("%Y-%m-%d %H:%M"),
            "card": t.card_last4   # 👈 ADD THIS LINE
        })

    return Response({
        "name": user.username,
        "balance": float(wallet.balance),
        "transactions": tx_data
    })

# ---------------- TOP-UP VIEW ----------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def topup_wallet(request):
    user = request.user
    amount = Decimal(request.data.get("amount", 0))

    wallet, _ = Wallet.objects.get_or_create(user=user)

    wallet.balance += amount
    wallet.save()

    card_last4 = request.data.get("card_last4", "")

    WalletTransaction.objects.create(
        wallet=wallet,
        transaction_type="TOPUP",
        amount=amount,
        card_last4=card_last4
    )

    return Response({
        "message": "Top-up successful",
        "balance": float(wallet.balance)
    })