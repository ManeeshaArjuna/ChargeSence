import joblib
import os
from datetime import datetime, timedelta

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


##################################################
# ✅ LOAD ML MODEL
##################################################

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "ml", "ml_model.pkl"))

try:
    model = joblib.load(MODEL_PATH)
    print("✅ ML Model loaded successfully")
except Exception as e:
    print("❌ Model load error:", e)
    model = None


##################################################
# 🔥 CORE LOGIC
##################################################

def recommend_chargers(chargers, battery, vehicle_range):

    results = []

    max_distance = (battery / 100) * vehicle_range

    for c in chargers:
        try:
            distance = float(c.get("distance", 0))
            cost = float(c.get("cost", 0))
            power = float(c.get("power", 0))

            if distance > max_distance:
                continue

            # ML
            if model:
                features = [[distance, cost, power, battery]]
                prob = model.predict_proba(features)[0][1]
            else:
                prob = 0.5

            # ✅ BETTER SCORE
            score = prob
            score -= distance * 0.01
            score += power * 0.002

            # ✅ FIX ETA BUG
            eta = round((distance / 40) * 60, 1)

            charger_data = {
                "station_name": c.get("station_name", "Unknown Station"),
                "address": c.get("address", "No address"),

                "connector": c.get("connector", "Unknown"),
                "power": power,
                "cost": cost,

                "chargers": c.get("chargers", []),

                "distance": distance,
                "lat": c.get("lat"),
                "lng": c.get("lng"),

                "score": float(score),
                "eta": eta,
                "reachable": True
            }

            results.append(charger_data)

        except Exception as e:
            print("⚠️ Error:", e)

    results.sort(key=lambda x: x["score"], reverse=True)

    return results


##################################################
# 🚀 API
##################################################

@api_view(['POST'])
def recommend_api(request):

    try:
        chargers = request.data.get("chargers", [])
        battery = float(request.data.get("battery", 20))
        vehicle_range = float(request.data.get("range", 400))

        if not chargers:
            return Response(
                {"error": "No chargers provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        ranked = recommend_chargers(chargers, battery, vehicle_range)

        return Response({
            "best": ranked[0] if ranked else None,
            "others": ranked[1:]
        })

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )