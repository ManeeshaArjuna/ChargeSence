import requests


GOOGLE_MAPS_API_KEY = "AIzaSyDzfpD_cy9ykfG-y-v9RY0tA94suwod990"


def get_distance_km(origin_lat, origin_lng, dest_lat, dest_lng):

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"

    params = {
        "origins": f"{origin_lat},{origin_lng}",
        "destinations": f"{dest_lat},{dest_lng}",
        "key": GOOGLE_MAPS_API_KEY
    }

    response = requests.get(url, params=params)
    data = response.json()

    try:
        distance_meters = data['rows'][0]['elements'][0]['distance']['value']
        return distance_meters / 1000  # km
    except:
        return None