import React, { useState } from "react";
import API from "../api/api";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

function RecommendationPage() {
  const [vehicleId, setVehicleId] = useState("");
  const [battery, setBattery] = useState(20);
  const [result, setResult] = useState(null);
  const [directions, setDirections] = useState(null);

  // Default user location (Colombo)
  const userLocation = { lat: 6.9271, lng: 79.8612 };

  const handleRecommend = async () => {
    try {
      const res = await API.get(
        `recommend-charger/${vehicleId}/?lat=${userLocation.lat}&lng=${userLocation.lng}&battery=${battery}`
      );

      setResult(res.data);
      calculateRoute(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to get recommendation");
    }
  };

  const calculateRoute = (data) => {
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: userLocation,
        destination: {
          lat: data.station_lat,
          lng: data.station_lng,
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        }
      }
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>⚡ Smart Charger Recommendation</h2>

      <input
        placeholder="Vehicle ID"
        value={vehicleId}
        onChange={(e) => setVehicleId(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Battery %"
        value={battery}
        onChange={(e) => setBattery(e.target.value)}
      />
      <br /><br />

      <button onClick={handleRecommend}>
        Find Best Charger
      </button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>📍 Recommended Station</h3>
          <p>Name: {result.recommended_station}</p>
          <p>Distance: {result.distance_km} km</p>
          <p>Queue: {result.queue_length}</p>
          <p>Score: {result.priority_score}</p>
        </div>
      )}

      <LoadScript googleMapsApiKey="YOUR_API_KEY">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation}
          zoom={10}
        >
          <Marker position={userLocation} />

          {result && (
            <Marker
              position={{
                lat: result.station_lat,
                lng: result.station_lng,
              }}
            />
          )}

          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default RecommendationPage;