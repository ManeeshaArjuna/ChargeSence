import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer
} from "@react-google-maps/api";

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
  // STATE
  //////////////////////////////////////////////////
  const [battery, setBattery] = useState(0);
  const [range, setRange] = useState(0);

  useEffect(() => {
    if (data?.battery) {
      setBattery(data.battery);
      localStorage.setItem("battery", data.battery);
    } else {
      const savedBattery = localStorage.getItem("battery");
      if (savedBattery) setBattery(Number(savedBattery));
    }

    if (data?.range) {
      setRange(data.range);
      localStorage.setItem("range", data.range);
    } else {
      const savedRange = localStorage.getItem("range");
      if (savedRange) setRange(Number(savedRange));
    }
  }, [data]);

  //////////////////////////////////////////////////
  // CENTER MAP
  //////////////////////////////////////////////////
  useEffect(() => {
    if (best?.lat && best?.lng) {
      setCenter({ lat: best.lat, lng: best.lng });
    }
  }, [best]);

  //////////////////////////////////////////////////
  // ROUTES
  //////////////////////////////////////////////////
  useEffect(() => {
    if (!mapLoaded) return;
    if (!best?.start || !best?.destination || !best?.lat || !best?.lng) return;

    const service = new window.google.maps.DirectionsService();

    service.route(
      {
        origin: best.start,
        destination: { lat: best.lat, lng: best.lng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") setDirections(result);
      }
    );

    service.route(
      {
        origin: { lat: best.lat, lng: best.lng },
        destination: best.destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK") setSecondRoute(result);
      }
    );

  }, [best, mapLoaded]);

  //////////////////////////////////////////////////
  // ETA
  //////////////////////////////////////////////////
  const getETA = (charger) => Math.ceil(charger?.eta || 0);

  //////////////////////////////////////////////////
  // NAVIGATION
  //////////////////////////////////////////////////
  const goToBooking = (charger) => {
    navigate("/bookingpage", {
      state: {
        charger: {
          ...charger,
          connector: charger.connector || charger.chargers?.[0]?.connector,
          power: charger.power || charger.chargers?.[0]?.power,
          cost: charger.cost || charger.chargers?.[0]?.cost
        },
        eta: getETA(charger),
        best,
        others,
        battery,
        range
      }
    });
  };

  //////////////////////////////////////////////////
  // BADGE LOGIC 
  //////////////////////////////////////////////////
  const getBadge = (c) => {
    if (c.is_best) return "🔥 Best Choice";
    if (c.is_risky) return "⚠ Risky";
    return "⚡ Reachable";
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

      {/* MAP */}
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
                  polylineOptions: { strokeColor: "#FF0000" }
                }}
              />
            )}

            {best?.lat && (
              <Marker position={{ lat: best.lat, lng: best.lng }} label="⭐" />
            )}

            {others.map((c, i) =>
              c.lat ? (
                <Marker key={i} position={{ lat: c.lat, lng: c.lng }} label="⚡" />
              ) : null
            )}

          </GoogleMap>
        </LoadScript>
      </div>

      {/* FLOATING PANEL */}
      <div style={styles.panel}>

        <button
          style={styles.button}
          onClick={() =>
            navigate("/booking", {
              state: {
                battery: data?.battery,
                start: best?.start,
                destination: data?.destination,
                vehicle_id: data?.vehicle_id,
                startCoords: data?.startCoords
              }
            })
          }
        >
          ← Back
        </button>

        {/*  SUMMARY */}
        <div style={{ marginBottom: "10px" }}>
          <p style={styles.sub}>🔋 Current Battery: <b>{battery}%</b></p>
          <p style={styles.sub}>📍 Estimated Range Before Threshold: <b>{range} km</b></p>
        </div>

        {best && (
          <div style={styles.bestCard}>
            <h3>⭐ Recommended Charger</h3>

            <h4>{best.station_name}</h4>
            <p style={styles.address}>{best.address}</p>

            {/* BADGE */}
            <p style={styles.sub}>{getBadge(best)}</p>

            {/* NEW DATA */}
            <p style={styles.sub}>🔋 Estimated Battery at Arrival: {best.estimated_battery}%</p>
            <p style={styles.sub}>📉 Predicted Remaining Range: {best.remaining_range} km</p>

            {best.chargers ? (
              best.chargers.map((ch, i) => (
                <div key={i} style={styles.chargerRow}>
                  🔌 {ch.connector} | ⚡ Connector Power: {ch.power} kW | 💰 LKR {ch.cost}
                </div>
              ))
            ) : (
              <>
                <p>🔌 {best.connector}</p>
                <p>⚡ {best.power} kW</p>
                <p>💰 LKR {best.cost}</p>
              </>
            )}

            <p style={styles.highlight}>📍 Distance to reach: {best.distance} km</p>
            <p style={styles.highlight}>⏱ {getETA(best)} mins away</p>

            <button style={styles.primaryBtn} onClick={() => goToBooking(best)}>
              🚀 Book Now
            </button>
          </div>
        )}

        <h4 style={{ marginTop: "10px" }}>Other Options</h4>

        {others.map((c, i) => (
          <div key={i} style={styles.card}>

            <h4>{c.station_name}</h4>
            <p style={styles.address}>{c.address}</p>

            {/* BADGE */}
            <p style={styles.sub}>{getBadge(c)}</p>

            {/* NEW DATA */}
            <p style={styles.sub}>🔌 {c.connector}</p>
            <p style={styles.sub}>⚡ Connector Power:{c.power} kW</p>
            <p style={styles.sub}>💰 LKR {c.cost}</p>
            <p style={styles.sub}>🔋 Estimated Battery at Arrival: {c.estimated_battery}%</p>
            <p style={styles.sub}>📉 Predicted Remaining Range: {c.remaining_range} km</p>

            <p style={styles.sub}>📍 Distance to reach: {c.distance} km</p>
            <p style={styles.sub}>⏱ {getETA(c)} mins</p>

            <button
              style={styles.secondaryBtn}
              onClick={() => goToBooking(c)}
            >
              Select
            </button>

          </div>
        ))}

      </div>

      {/* NAV */}
      <div style={styles.nav}>
        <p onClick={() => (window.location.href = "/home")}>Home</p>
        <p onClick={() => (window.location.href = "/booking")}>Booking</p>
        <p onClick={() => (window.location.href = "/activity")}>Activity</p>
        <p onClick={() => (window.location.href = "/wallet")}>Wallet</p>
        <p onClick={() => (window.location.href = "/more")}>More</p>
      </div>

    </div>
  );
}

//////////////////////////////////////////////////
// ORIGINAL STYLES (UNCHANGED)
//////////////////////////////////////////////////

const styles = {
  container: {
    height: "100vh",
    position: "relative",
    fontFamily: "'Segoe UI', sans-serif"
  },
  mapContainer: { height: "100%", width: "100%" },
  map: { height: "100%", width: "100%" },
  panel: {
    position: "absolute",
    bottom: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "95%",
    maxWidth: "420px",
    maxHeight: "60%",
    overflowY: "auto",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(16px)",
    padding: "15px",
    borderRadius: "20px",
    color: "#fff"
  },
  bestCard: {
    background: "linear-gradient(135deg, #00e676, #00c6ff)",
    padding: "15px",
    borderRadius: "16px",
    marginBottom: "10px",
    color: "#000"
  },
  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "12px",
    borderRadius: "14px",
    marginBottom: "10px"
  },
  chargerRow: { fontSize: "13px", marginTop: "4px" },
  address: { fontSize: "12px", opacity: 0.8 },
  sub: { fontSize: "13px", opacity: 0.8 },
  highlight: { fontWeight: "bold", marginTop: "5px" },
  primaryBtn: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "25px",
    border: "none",
    background: "#000",
    color: "#fff",
    fontWeight: "bold"
  },
  secondaryBtn: {
    width: "100%",
    padding: "10px",
    marginTop: "8px",
    borderRadius: "20px",
    border: "1px solid #00e676",
    background: "transparent",
    color: "#00e676"
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
  button: {
    padding: "10px",
    borderRadius: "20px",
    border: "none",
    background: "#00e676",
    color: "#000"
  },
  empty: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};

export default Recommendation;