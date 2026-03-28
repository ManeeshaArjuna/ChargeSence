import joblib
import os
import requests

from rest_framework.decorators import api_view
from rest_framework.response import Response
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "ml", "ml_model.pkl"))

try:
    model = joblib.load(MODEL_PATH)
except:
    model = None

GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


# ==============================
# GOOGLE DISTANCE MATRIX (FINAL)
# ==============================
def get_distance_eta(user_lat, user_lng, lat, lng):
    try:
        url = "https://maps.googleapis.com/maps/api/distancematrix/json"

        params = {
            "origins": f"{float(user_lat)},{float(user_lng)}",
            "destinations": f"{float(lat)},{float(lng)}",
            "key": GOOGLE_API_KEY,
        }

        res = requests.get(url, params=params).json()

        el = res["rows"][0]["elements"][0]

        if el["status"] == "OK":
            distance = el["distance"]["value"] / 1000
            eta = el["duration"]["value"] / 60

            return round(distance, 2), round(eta, 1)

    except Exception as e:
        print("Distance API error:", e)

    return None, None


# ==============================
# RECOMMEND LOGIC
# ==============================
def recommend_chargers(chargers, battery, vehicle_range, vehicle_connector, user_lat, user_lng):

    results = []
    max_distance = (battery / 100) * vehicle_range

    for c in chargers:
        try:
            connectors = [ch["connector"] for ch in c["chargers"]]

            if vehicle_connector and vehicle_connector not in connectors:
                continue

            real_dist, eta = get_distance_eta(
                user_lat, user_lng,
                c["lat"], c["lng"]
            )

            # ❌ REMOVE FAKE FALLBACK
            if real_dist is None:
                continue

            power = float(c["power"])
            cost = float(c["cost"])

            if model:
                prob = model.predict_proba([[real_dist, cost, power, battery]])[0][1]
            else:
                prob = 0.5

            score = prob
            score -= real_dist * 0.01
            score -= cost * 0.002
            score += power * 0.003

            results.append({
                **c,
                "distance": real_dist,
                "eta": eta,
                "score": float(score)
            })

        except Exception as e:
            print("Charger error:", e)

    results.sort(key=lambda x: x["score"], reverse=True)
    return results


# ==============================
# API
# ==============================
@api_view(['POST'])
def recommend_api(request):

    chargers = request.data.get("chargers", [])
    battery = float(request.data.get("battery", 20))
    vehicle_range = float(request.data.get("range", 400))
    connector = request.data.get("connector")

    # ✅ FIX TYPE
    user_lat = float(request.data.get("user_lat"))
    user_lng = float(request.data.get("user_lng"))

    ranked = recommend_chargers(
        chargers, battery, vehicle_range, connector, user_lat, user_lng
    )

    return Response({
        "best": ranked[0] if ranked else None,
        "others": ranked[1:]
    })