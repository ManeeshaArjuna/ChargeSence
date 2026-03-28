import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer   // ✅ FIX 1
} from "@react-google-maps/api";
import { colors } from "../styles/colors";

function Recommendation() {

  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state || {};

  const best = data.best || null;
  const others = data.others || [];

  const [center, setCenter] = useState({ lat: 6.9271, lng: 79.8612 });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [directions, setDirections] = useState(null);

  const [secondRoute, setSecondRoute] = useState(null);

  //////////////////////////////////////////////////
  // CENTER MAP
  //////////////////////////////////////////////////
  useEffect(() => {
    if (best?.lat && best?.lng) {
      setCenter({ lat: best.lat, lng: best.lng });
    }
  }, [best]);

  //////////////////////////////////////////////////
  // ROUTE (VISUAL ONLY)
  //////////////////////////////////////////////////
useEffect(() => {
  if (!mapLoaded) return;
  if (!best?.start || !best?.destination || !best?.lat || !best?.lng) return;

  const service = new window.google.maps.DirectionsService();

  // 🔹 Route 1: Start → Charger
  service.route(
    {
      origin: best.start,
      destination: { lat: best.lat, lng: best.lng },
      travelMode: window.google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === "OK") {
        setDirections(result);
      }
    }
  );

  // 🔹 Route 2: Charger → Destination
  service.route(
    {
      origin: { lat: best.lat, lng: best.lng },
      destination: best.destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === "OK") {
        setSecondRoute(result);
      }
    }
  );

}, [best, mapLoaded]);

  //////////////////////////////////////////////////
  // ETA (FROM BACKEND ONLY)
  //////////////////////////////////////////////////
  const getETA = (charger) => {
    return Math.ceil(charger?.eta || 0);
  };

  //////////////////////////////////////////////////
  // NAVIGATION
  //////////////////////////////////////////////////
  const goToBooking = (charger) => {
    navigate("/bookingpage", {
      state: {
        charger: charger,
        eta: getETA(charger),
        best,
        others
      }
    });
  };

  //////////////////////////////////////////////////
  // FALLBACK
  //////////////////////////////////////////////////
  if (!best && others.length === 0) {
    return (
      <div style={styles.empty}>
        <h3>No recommendation data</h3>
        <button style={styles.button} onClick={() => navigate("/booking")}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* 🗺 MAP */}
      <div style={styles.mapContainer}>
        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          onLoad={() => setMapLoaded(true)}
        >
          <GoogleMap
            mapContainerStyle={styles.map}
            center={center}
            zoom={13}
          >
              {directions && <DirectionsRenderer directions={directions} />}

              {secondRoute && (
                <DirectionsRenderer
                  directions={secondRoute}
                  options={{
                    polylineOptions: {
                      strokeColor: "#FF0000"
                    }
                  }}
                />
              )}

              {/* ⭐ BEST */}
              {best?.lat && (
                <Marker position={{ lat: best.lat, lng: best.lng }} label="⭐" />
              )}

            {/* ✅ FIX 2: correct placement */}
            {directions && <DirectionsRenderer directions={directions} />}

            {/* ⭐ BEST */}
            {best?.lat && (
              <Marker position={{ lat: best.lat, lng: best.lng }} label="⭐" />
            )}

            {/* ⚡ OTHERS */}
            {others.map((c, i) =>
              c.lat ? (
                <Marker
                  key={i}
                  position={{ lat: c.lat, lng: c.lng }}
                  label="⚡"
                />
              ) : null
            )}

          </GoogleMap>
        </LoadScript>
      </div>

      {/* 📋 PANEL */}
      <div style={styles.panel}>

        {/* ⭐ BEST */}
        {best && (
          <div style={styles.bestCard}>
            <h3>⭐ Best Charger</h3>

            <h4>{best.station_name}</h4>
            <p style={styles.address}>{best.address}</p>

            {best.chargers ? (
              best.chargers.map((ch, i) => (
                <div key={i} style={styles.chargerRow}>
                  🔌 {ch.connector} | ⚡ {ch.power} kW | 💰 LKR {ch.cost}
                </div>
              ))
            ) : (
              <>
                <p>🔌 {best.connector}</p>
                <p>⚡ {best.power} kW</p>
                <p>💰 LKR {best.cost}</p>
              </>
            )}

            <p>📍 {best.distance} km</p>
            <p>⏱ ETA: {getETA(best)} mins</p>

            <button
              style={styles.primaryBtn}
              onClick={() => goToBooking(best)}
            >
              Book Now
            </button>
          </div>
        )}

        {/* 📋 OTHERS */}
        <h4 style={{ marginTop: "10px" }}>Other Chargers</h4>

        {others.map((c, i) => (
          <div key={i} style={styles.card}>

            <h4>{c.station_name}</h4>
            <p style={styles.address}>{c.address}</p>

            {c.chargers ? (
              c.chargers.map((ch, i) => (
                <div key={i} style={styles.chargerRow}>
                  🔌 {ch.connector} | ⚡ {ch.power} kW | 💰 LKR {ch.cost}
                </div>
              ))
            ) : (
              <>
                <p>🔌 {c.connector}</p>
                <p>⚡ {c.power} kW</p>
                <p>💰 LKR {c.cost}</p>
              </>
            )}

            <p>📍 {c.distance} km</p>
            <p>⏱ {getETA(c)} mins</p>

            <button
              style={styles.secondaryBtn}
              onClick={() => goToBooking(c)}
            >
              Select
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}

//////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////

const styles = {
  container: { display: "flex", height: "100vh" },
  mapContainer: { flex: 1 },
  map: { height: "100%", width: "100%" },
  panel: {
    width: "380px",
    overflowY: "auto",
    backgroundColor: "#fff",
    padding: "15px",
    borderLeft: "1px solid #eee",
  },
  bestCard: {
    border: `2px solid ${colors.primary}`,
    backgroundColor: "#f0f8ff",
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  card: {
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  chargerRow: { fontSize: "13px", marginTop: "4px" },
  address: { fontSize: "13px", color: "#666" },
  primaryBtn: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    backgroundColor: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
  },
  secondaryBtn: {
    width: "100%",
    padding: "8px",
    marginTop: "8px",
    backgroundColor: "#fff",
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
    borderRadius: "6px",
  },
  button: {
    padding: "10px",
    backgroundColor: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
  },
  empty: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default Recommendation;