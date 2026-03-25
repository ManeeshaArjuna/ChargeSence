import React, { useState, useEffect } from "react";
import { colors } from "../styles/colors";
import API from "../api/api";

import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
  Autocomplete
} from "@react-google-maps/api";

function Booking() {

  const [battery, setBattery] = useState("");
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");

  const [directions, setDirections] = useState(null);
  const [chargers, setChargers] = useState([]);

  const [userLocation, setUserLocation] = useState({
    lat: 6.9271,
    lng: 79.8612
  });

  const [startAuto, setStartAuto] = useState(null);
  const [destAuto, setDestAuto] = useState(null);

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  // 📍 GET USER LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => {
        console.log("Location error:", err);
      }
    );
  }, []);

  // 🚗 FETCH USER VEHICLES
  useEffect(() => {
    API.get("vehicles/list/")
      .then((res) => {
        console.log("Vehicles:", res.data); // debug
        setVehicles(res.data);
      })
      .catch((err) => {
        console.error("Vehicle fetch error:", err);
      });
  }, []);

  // 🔥 AUTO ROUTE
  useEffect(() => {
    if (!start || !destination) return;

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: start,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);

          const route = result.routes[0].overview_path;

          const points = route.map((p) => ({
            lat: p.lat(),
            lng: p.lng(),
          }));

          fetchChargers(points);
        }
      }
    );
  }, [start, destination]);

  // ⚡ FETCH CHARGERS
  const fetchChargers = (points) => {
    API.post("route-chargers/", { points })
      .then((res) => {
        setChargers(res.data);
      })
      .catch((err) => {
        console.error("Charger fetch error:", err);
      });
  };

  return (
    <div style={styles.container}>

      {/* 🌍 MAP */}
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={["places"]}
      >
        <GoogleMap
          mapContainerStyle={styles.map}
          center={userLocation}
          zoom={12}
        >

          {/* USER LOCATION */}
          <Marker position={userLocation} label="📍" />

          {/* ROUTE */}
          {directions && (
            <DirectionsRenderer directions={directions} />
          )}

          {/* CHARGERS */}
          {chargers.map((c, i) => (
            <Marker
              key={i}
              position={{ lat: c.lat, lng: c.lng }}
              label="⚡"
            />
          ))}

        </GoogleMap>

        {/* 🧾 OVERLAY */}
        <div style={styles.overlay}>

          <h3>⚡ Book Charging</h3>

          {/* VEHICLE SELECT (FIXED) */}
          <select
            style={styles.input}
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
          >
            <option value="">Select Vehicle</option>

            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.manufacturer} {v.model}
              </option>
            ))}
          </select>

          {/* BATTERY */}
          <input
            type="number"
            placeholder="Battery Level (%)"
            value={battery}
            onChange={(e) => setBattery(e.target.value)}
            style={styles.input}
          />

          {/* START */}
          <Autocomplete
            onLoad={(auto) => setStartAuto(auto)}
            onPlaceChanged={() => {
              if (startAuto) {
                const place = startAuto.getPlace();
                setStart(place.formatted_address || "");
              }
            }}
          >
            <input
              type="text"
              placeholder="Start Location"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              style={styles.input}
            />
          </Autocomplete>

          {/* DESTINATION */}
          <Autocomplete
            onLoad={(auto) => setDestAuto(auto)}
            onPlaceChanged={() => {
              if (destAuto) {
                const place = destAuto.getPlace();
                setDestination(place.formatted_address || "");
              }
            }}
          >
            <input
              type="text"
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={styles.input}
            />
          </Autocomplete>

          {/* DURATION */}
          <select
            style={styles.input}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            <option value="">Select Duration</option>

            {[...Array(12)].map((_, i) => {
              const value = 10 + i * 5;
              return (
                <option key={value} value={value}>
                  {value} minutes
                </option>
              );
            })}
          </select>

          <button style={styles.button}>
            Find Best Charger
          </button>

        </div>

      </LoadScript>

      {/* NAV */}
      <div style={styles.nav}>
        <p onClick={() => (window.location.href = "/dashboard")}>Home</p>
        <p style={styles.active}>Booking</p>
        <p>History</p>
        <p onClick={() => (window.location.href = "/wallet")}>Wallet</p>
        <p>More</p>
      </div>

    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100%",
    position: "relative",
  },

  map: {
    height: "100%",
    width: "100%",
  },

  overlay: {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    maxWidth: "400px",
    backgroundColor: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(10px)",
    padding: "15px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 10,
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: colors.primary,
    color: "#fff",
    borderRadius: "8px",
    border: "none",
  },

  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: colors.white,
    padding: "10px",
    borderTop: `1px solid ${colors.gray}`,
    zIndex: 20,
  },

  active: {
    color: colors.primary,
    fontWeight: "bold",
  },
};

export default Booking;