import React, { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

// Example default center (Colombo)
const center = {
  lat: 6.9271,
  lng: 79.8612,
};

function MapPage() {
  const [directions, setDirections] = useState(null);

  const userLocation = { lat: 6.9271, lng: 79.8612 };

  // 🔥 Replace this later with API response
  const stationLocation = { lat: 7.2906, lng: 80.6337 };

  const calculateRoute = () => {
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: userLocation,
        destination: stationLocation,
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
    <LoadScript googleMapsApiKey="AIzaSyDzfpD_cy9ykfG-y-v9RY0tA94suwod990">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={8}>
        
        {/* User Marker */}
        <Marker position={userLocation} />

        {/* Station Marker */}
        <Marker position={stationLocation} />

        {/* Route */}
        {directions && <DirectionsRenderer directions={directions} />}

      </GoogleMap>

      <button onClick={calculateRoute} style={{ marginTop: "10px" }}>
        Show Route
      </button>
    </LoadScript>
  );
}

export default MapPage;