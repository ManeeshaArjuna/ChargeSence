import React, { useState, useEffect } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
  Autocomplete
} from "@react-google-maps/api";

function Booking() {

  const location = useLocation();
  const navData = location.state || {};

  const navigate = useNavigate();

  const [battery, setBattery] = useState(navData.battery || "");
  const [start, setStart] = useState(navData.start || "");
  const [destination, setDestination] = useState(navData.destination || "");
  const [duration, setDuration] = useState("");

  const [directions, setDirections] = useState(null);
  const [chargers, setChargers] = useState([]);

  const [userLocation, setUserLocation] = useState({
    lat: 6.9271,
    lng: 79.8612
  });

  const [startCoords, setStartCoords] = useState(null);
  const [startAuto, setStartAuto] = useState(null);
  const [destAuto, setDestAuto] = useState(null);

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(navData.vehicle_id || "");

  useEffect(() => {
    if (navData.startCoords) {
      setStartCoords(navData.startCoords);
    }
  }, []);

  //////////////////////////////////////////////////
  // USER LOCATION
  //////////////////////////////////////////////////
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

  //////////////////////////////////////////////////
  // VEHICLES
  //////////////////////////////////////////////////
  useEffect(() => {
    API.get("vehicles/list/")
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error(err));
  }, []);

  //////////////////////////////////////////////////
  // AUTO ROUTE
  //////////////////////////////////////////////////
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

  //////////////////////////////////////////////////
  // FETCH CHARGERS
  //////////////////////////////////////////////////
  const fetchChargers = (points) => {
    API.post("route-chargers/", { points })
      .then((res) => setChargers(res.data.data))
      .catch((err) => console.error(err));
  };

  //////////////////////////////////////////////////
  // FIND BEST CHARGER
  //////////////////////////////////////////////////
  // REPLACE ONLY THIS FUNCTION IN YOUR FILE

  const findBestCharger = () => {

    if (!battery || chargers.length === 0) {
      alert("Enter data and load route first");
      return;
    }

    if (!startCoords) {
      alert("Please select start location from dropdown");
      return;
    }

    if (!selectedVehicle) {
      alert("Please select a vehicle");
      return;
    }

    API.post("recommend/", {
      vehicle_id: selectedVehicle,
      start_lat: startCoords.lat,
      start_lon: startCoords.lng,
      battery: battery
    })
      .then((res) => {

        const chargers = res.data.chargers || [];

        if (chargers.length === 0) {
          alert("No suitable chargers found");
          return;
        }

        const best = chargers[0];
        const others = chargers.slice(1);

        navigate("/recommendation", {
          state: {
            best: {
              ...best,
              start: start,
              destination: destination
            },
            others: others,
            battery: battery,
            range: res.data.max_range,
            vehicle_id: selectedVehicle,
            startCoords
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

        {/* PREMIUM FORM OVERLAY */}
        <div style={styles.overlay}>

          <h3 style={styles.title}>⚡ Smart Booking</h3>

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

          <input
            type="number"
            placeholder="Battery Level (%)"
            value={battery}
            onChange={(e) => setBattery(e.target.value)}
            style={styles.input}
          />

          <Autocomplete
            onLoad={setStartAuto}
            onPlaceChanged={() => {
              if (startAuto) {
                const p = startAuto.getPlace();

                if (!p.geometry) {
                  alert("Select location from dropdown");
                  return;
                }

                setStart(p.formatted_address);

                const loc = p.geometry.location;

                setStartCoords({
                  lat: loc.lat(),
                  lng: loc.lng()
                });
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
            🚀 Find Best Charger
          </button>

        </div>

      </LoadScript>

      {/* NAV */}
      <div style={styles.nav}>
        <p onClick={() => (window.location.href = "/dashboard")}>Home</p>
        <p style={styles.active}>Booking</p>
        <p onClick={() => (window.location.href = "/activity")}>Activity</p>
        <p onClick={() => (window.location.href = "/wallet")}>Wallet</p>
        <p onClick={() => (window.location.href = "/more")}>More</p>
      </div>

    </div>
  );
}

//////////////////////////////////////////////////
// STYLES (PREMIUM UPGRADE)
//////////////////////////////////////////////////

const styles = {
  container: {
    height: "100vh",
    position: "relative",
    fontFamily: "'Segoe UI', sans-serif"
  },

  map: {
    height: "100%",
    width: "100%"
  },

  overlay: {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "92%",
    maxWidth: "420px",
    background: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(16px)",
    padding: "20px",
    borderRadius: "20px",
    zIndex: 10,
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#fff"
  },

  title: {
    textAlign: "center",
    marginBottom: "15px"
  },

  input: {
    width: "calc(100% - 24px)",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    outline: "none",
    margin: "10px 12px",
    boxSizing: "border-box"
  },

  button: {
    width: "calc(100% - 24px)",
    padding: "14px",
    borderRadius: "30px",
    border: "none",
    background: "linear-gradient(135deg, #00e676, #00c6ff)",
    color: "#000",
    fontWeight: "bold",
    marginTop: "10px",
    margin: "10px 12px",
    boxSizing: "border-box"
  },

  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100vw",
    display: "flex",
    justifyContent: "space-around",
    padding: "14px 0",
    margin: 0,
    boxSizing: "border-box",
    background: "rgba(227, 181, 18, 0.4)",
    backdropFilter: "blur(15px)",
    borderTop: "1px solid rgba(255,255,255,0.1)"
  },

  active: {
    color: "#00e676",
    fontWeight: "bold"
  }
};

export default Booking;