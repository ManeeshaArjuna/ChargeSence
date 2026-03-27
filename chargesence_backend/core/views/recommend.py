import joblib
import os
import requests

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from dotenv import load_dotenv
import os

load_dotenv()


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "ml", "ml_model.pkl"))

try:
    model = joblib.load(MODEL_PATH)
except:
    model = None


GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")


def get_distance_eta(user_lat, user_lng, lat, lng):
    try:
        url = "https://maps.googleapis.com/maps/api/distancematrix/json"

        params = {
            "origins": f"{user_lat},{user_lng}",
            "destinations": f"{lat},{lng}",
            "key": GOOGLE_API_KEY,
        }

        res = requests.get(url, params=params).json()
        el = res["rows"][0]["elements"][0]

        distance = el["distance"]["value"] / 1000
        eta = el["duration"]["value"] / 60

        return round(distance, 2), round(eta, 1)
    except:
        return 0, 0


def recommend_chargers(chargers, battery, vehicle_range, vehicle_connector, user_lat, user_lng):

    results = []
    max_distance = (battery / 100) * vehicle_range

    for c in chargers:

        try:
            distance = float(c["distance"])

            if distance > max_distance:
                continue

            connectors = [ch["connector"] for ch in c["chargers"]]

            if vehicle_connector and vehicle_connector not in connectors:
                continue

            #  REAL DISTANCE + ETA
            real_dist, eta = get_distance_eta(
                user_lat, user_lng,
                c["lat"], c["lng"]
            )

            power = float(c["power"])
            cost = float(c["cost"])

            #  ML
            if model:
                prob = model.predict_proba([[real_dist, cost, power, battery]])[0][1]
            else:
                prob = 0.5

            #  scoring
            score = prob
            score -= real_dist * 0.01
            score -= cost * 0.002
            score += power * 0.003

            progress = c.get("progress", 0.5)
            score += (1 - abs(progress - 0.5)) * 0.2

            results.append({
                **c,
                "distance": real_dist,
                "eta": eta,
                "score": float(score)
            })

        except Exception as e:
            print("error:", e)

    results.sort(key=lambda x: x["score"], reverse=True)

    return results


@api_view(['POST'])
def recommend_api(request):

    chargers = request.data.get("chargers", [])
    battery = float(request.data.get("battery", 20))
    vehicle_range = float(request.data.get("range", 400))
    connector = request.data.get("connector")
    user_lat = request.data.get("user_lat")
    user_lng = request.data.get("user_lng")

    ranked = recommend_chargers(
        chargers, battery, vehicle_range, connector, user_lat, user_lng
    )

    return Response({
        "best": ranked[0] if ranked else None,
        "others": ranked[1:]
    })