import joblib
import os

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

def recommend_chargers(chargers, battery, vehicle_range, vehicle_connector=None):

    results = []

    # 🚗 max reachable distance
    max_distance = (battery / 100) * vehicle_range

    for c in chargers:
        try:
            distance = float(c.get("distance", 0))
            cost = float(c.get("cost", 0))
            power = float(c.get("power", 0))

            # 🚫 skip unreachable chargers
            if distance > max_distance:
                continue

            # 🔌 GET ALL CONNECTORS IN STATION
            charger_connectors = [
                ch.get("connector") for ch in c.get("chargers", [])
            ]

            # 🚫 HARD FILTER (only compatible chargers)
            if vehicle_connector:
                if vehicle_connector not in charger_connectors:
                    continue

            # 🤖 ML prediction
            if model:
                features = [[distance, cost, power, battery]]
                prob = model.predict_proba(features)[0][1]
            else:
                prob = 0.5

            # 🎯 SCORE CALCULATION
            score = prob

            # distance penalty
            score -= distance * 0.01

            # power bonus
            score += power * 0.002

            # connector bonus
            if vehicle_connector and vehicle_connector in charger_connectors:
                score += 0.2

            # ⏱ ETA (minutes)
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
            print("⚠️ Charger processing error:", e)
            continue

    # 🔽 SORT BEST FIRST
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

        # 🔌 NEW: get connector
        vehicle_connector = request.data.get("connector", None)

        if not chargers:
            return Response(
                {"error": "No chargers provided"},
                status=status.HTTP_400_BAD_REQUEST
            )

        ranked = recommend_chargers(
            chargers,
            battery,
            vehicle_range,
            vehicle_connector
        )

        return Response({
            "best": ranked[0] if ranked else None,
            "others": ranked[1:]
        })

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )