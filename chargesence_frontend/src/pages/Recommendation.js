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

  const [center, setCenter] = useState({ lat: 6.9271, lng: 79.8612 });
  const [directions, setDirections] = useState(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  //////////////////////////////////////////////////
  //  CENTER MAP TO BEST
  //////////////////////////////////////////////////
  useEffect(() => {
    if (best?.lat && best?.lng) {
      setCenter({ lat: best.lat, lng: best.lng });
    }
  }, [best]);

  //////////////////////////////////////////////////
  //  RE-CALCULATE ROUTE
  //////////////////////////////////////////////////
  useEffect(() => {
    if (!mapLoaded) return;
    if (!best?.start || !best?.destination) return;

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: best.start,
        destination: best.destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        } else {
          console.log("Route error:", status);
        }
      }
    );
  }, [best, mapLoaded]);

  //////////////////////////////////////////////////
  //  FALLBACK
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
          <GoogleMap mapContainerStyle={styles.map} center={center} zoom={13}>

            {/* ROUTE */}
            {directions && <DirectionsRenderer directions={directions} />}

            {/* BEST */}
            {best?.lat && (
              <Marker position={{ lat: best.lat, lng: best.lng }} label="⭐" />
            )}

            {/* OTHERS */}
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

            {/* MULTIPLE CHARGERS */}
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

            {/* MULTIPLE CHARGERS */}
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
//  STYLES
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

  chargerRow: {
    fontSize: "13px",
    marginTop: "4px",
  },

  address: {
    fontSize: "13px",
    color: "#666",
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