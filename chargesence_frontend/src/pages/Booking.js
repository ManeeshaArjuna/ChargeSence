import React, { useState, useEffect } from "react";
import { colors } from "../styles/colors";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
  Autocomplete
} from "@react-google-maps/api";

function Booking() {

  const navigate = useNavigate();

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

  // 📍 USER LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => console.log(err)
    );
  }, []);

  // 🚗 VEHICLES
  useEffect(() => {
    API.get("vehicles/list/")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error(err));
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
        console.log("CHARGERS:", res.data); // ✅ DEBUG
        setChargers(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  // 🤖 ML CALL → NAVIGATE
  const findBestCharger = () => {

    if (!battery || chargers.length === 0) {
      alert("Enter data and load route first");
      return;
    }

  // 🔥 GET SELECTED VEHICLE OBJECT
  const selected = vehicles.find(v => v.id === selectedVehicle);

  API.post("recommend/", {
    battery: battery,
    range: 400,
    chargers: chargers,
    connector: selected ? selected.connector : null
  })
      .then((res) => {

        // ✅ SAFE DATA EXTRACTION
        const best = res.data.best;
        const others = res.data.others || [];

        // 🚀 NAVIGATE WITH CLEAN SERIALIZABLE DATA
        navigate("/recommendation", {
          state: {
            best: best
              ? {
                  ...best,
                  start: start,
                  destination: destination
                }
              : null,
            others: others
          }
        });

      })
      .catch((err) => {
        console.error("Recommendation error:", err);
        alert("Failed to get recommendations");
      });
  };

  return (
    <div style={styles.container}>

      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={["places"]}
      >
        <GoogleMap
          mapContainerStyle={styles.map}
          center={userLocation}
          zoom={12}
        >

          <Marker position={userLocation} label="📍" />

          {directions && <DirectionsRenderer directions={directions} />}

          {chargers.map((c, i) => (
            <Marker key={i} position={{ lat: c.lat, lng: c.lng }} label="⚡" />
          ))}

        </GoogleMap>

        {/* FORM */}
        <div style={styles.overlay}>

          <h3>⚡ Book Charging</h3>

          {/* VEHICLE */}
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
            onLoad={setStartAuto}
            onPlaceChanged={() => {
              if (startAuto) {
                const p = startAuto.getPlace();
                setStart(p.formatted_address);
              }
            }}
          >
            <input
              style={styles.input}
              placeholder="Start Location"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </Autocomplete>

          {/* DESTINATION */}
          <Autocomplete
            onLoad={setDestAuto}
            onPlaceChanged={() => {
              if (destAuto) {
                const p = destAuto.getPlace();
                setDestination(p.formatted_address);
              }
            }}
          >
            <input
              style={styles.input}
              placeholder="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
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
              const val = 10 + i * 5;
              return (
                <option key={val} value={val}>
                  {val} minutes
                </option>
              );
            })}
          </select>

          <button style={styles.button} onClick={findBestCharger}>
            Find Best Charger
          </button>

        </div>

      </LoadScript>

      {/* NAV */}
      <div style={styles.nav}>
        <p onClick={() => (window.location.href = "/dashboard")}>Home</p>
        <p style={styles.active}>Booking</p>
        <p onClick={() => (window.location.href = "/history")}>History</p>
        <p onClick={() => (window.location.href = "/wallet")}>Wallet</p>
        <p onClick={() => (window.location.href = "/more")}>More</p>
      </div>

    </div>
  );
}

const styles = {
  container: { height: "100vh", position: "relative" },
  map: { height: "100%", width: "100%" },

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
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: "10px",
  },

  active: {
    color: colors.primary,
    fontWeight: "bold",
  }
};

export default Booking;