import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer
} from "@react-google-maps/api";
import { colors } from "../styles/colors";

function Recommendation() {

  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state || {};

  const best = data.best || null;
  const others = data.others || [];
  const directions = data.directions || null;

  const [center, setCenter] = useState({ lat: 6.9271, lng: 79.8612 });

  useEffect(() => {
    if (best && best.lat && best.lng) {
      setCenter({ lat: best.lat, lng: best.lng });
    }
  }, [best]);

  // 🛡 SAFE FALLBACK (IMPORTANT)
  if (!best && others.length === 0) {
    return (
      <div style={styles.empty}>
        <h3>No recommendation data</h3>
        <button
          style={styles.button}
          onClick={() => navigate("/booking")}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* 🗺 LEFT MAP */}
      <div style={styles.mapContainer}>
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={styles.map}
            center={center}
            zoom={13}
          >

            {directions && (
              <DirectionsRenderer directions={directions} />
            )}

            {/* ⭐ BEST */}
            {best?.lat && (
              <Marker
                position={{ lat: best.lat, lng: best.lng }}
                label="⭐"
              />
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

      {/* 📋 RIGHT PANEL */}
      <div style={styles.panel}>

        {/* ⭐ BEST */}
        {best && (
          <div style={styles.bestCard}>
            <h3>⭐ Best Charger</h3>

            <h4>{best.station_name}</h4>
            <p style={styles.address}>{best.address}</p>

            <div style={styles.row}>
              <span>🔌 {best.connector}</span>
              <span>⚡ {best.power} kW</span>
            </div>

            <div style={styles.row}>
              <span>💰 LKR {best.cost}</span>
              <span>📍 {best.distance} km</span>
            </div>

            <p>⏱ ETA: {best.eta} mins</p>

            <button
              style={styles.primaryBtn}
              onClick={() => alert("Booking step next")}
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

            <div style={styles.row}>
              <span>🔌 {c.connector}</span>
              <span>⚡ {c.power} kW</span>
            </div>

            <div style={styles.row}>
              <span>💰 LKR {c.cost}</span>
              <span>📍 {c.distance} km</span>
            </div>

            <p>⏱ {c.eta} mins</p>

            <button
              style={styles.secondaryBtn}
              onClick={() => alert("Select charger")}
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
// 🎨 STYLES
//////////////////////////////////////////////////

const styles = {
  container: {
    display: "flex",
    height: "100vh",
  },

  mapContainer: {
    flex: 1,
  },

  map: {
    height: "100%",
    width: "100%",
  },

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

  address: {
    fontSize: "13px",
    color: "#666",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "5px",
  },

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