import React, { useEffect, useState } from "react";
import API from "../api/api";

function Chargers() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    API.get("chargers/")
      .then((res) => setStations(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>⚡ Charging Stations</h2>

      {stations.length > 0 ? (
        stations.map((s, index) => (
          <div key={index} style={styles.card}>

            {/* HEADER */}
            <div style={styles.header}>
              <h3 style={styles.stationName}>{s.station_name}</h3>
              <p style={styles.address}>{s.address}</p>
            </div>

            {/* ACTIONS */}
            <div style={styles.iconRow}>
              {s.phone && (
                <a href={`tel:${s.phone}`} style={styles.iconBtn}>
                  📞 Call
                </a>
              )}

              {s.map && (
                <a
                  href={s.map}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.iconBtn}
                >
                  📍 Directions
                </a>
              )}
            </div>

            {/* CONNECTORS */}
            <p style={styles.sectionTitle}>Available Connectors</p>

            {s.chargers.map((c, i) => (
              <div key={i} style={styles.chargerRow}>

                <div style={styles.left}>
                  <span style={styles.connectorIcon}>
                    {getConnectorIcon(c.connector)}
                  </span>

                  <div>
                    <div style={styles.connectorType}>{c.connector}</div>

                    <span
                      style={{
                        ...styles.status,
                        ...(c.available ? styles.available : styles.maintenance)
                      }}
                    >
                      {c.available ? "Available" : "Maintenance"}
                    </span>
                  </div>
                </div>

                <div style={styles.right}>
                  <span style={styles.power}>{c.power} kW</span>
                  <span style={styles.price}>LKR {c.cost}</span>
                </div>

              </div>
            ))}

          </div>
        ))
      ) : (
        <p style={styles.empty}>No stations available</p>
      )}

      {/* NAV */}
      <div style={styles.nav}>
        <p onClick={() => (window.location.href = "/dashboard")}>Home</p>
        <p onClick={() => (window.location.href = "/booking")}>Booking</p>
        <p onClick={() => (window.location.href = "/activity")}>Activity</p>
        <p onClick={() => (window.location.href = "/wallet")}>Wallet</p>
        <p onClick={() => (window.location.href = "/more")}>More</p>
      </div>

    </div>
  );
}

/* ICON */
function getConnectorIcon(type) {
  switch (type) {
    case "TYPE2": return "🔌";
    case "CCS2": return "⚡";
    case "CHADEMO": return "🔋";
    default: return "🔌";
  }
}

//////////////////////////////////////////////////
// STYLES (PREMIUM)
//////////////////////////////////////////////////

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    paddingBottom: "90px",
    fontFamily: "'Segoe UI', sans-serif",
    background: "linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #00c6ff)",
    color: "#fff"
  },

  title: {
    textAlign: "center",
    marginBottom: "20px"
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    padding: "18px",
    borderRadius: "18px",
    marginBottom: "15px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)"
  },

  header: {
    marginBottom: "10px"
  },

  stationName: {
    margin: 0,
    fontSize: "18px"
  },

  address: {
    fontSize: "13px",
    opacity: 0.8
  },

  iconRow: {
    display: "flex",
    gap: "10px",
    margin: "10px 0"
  },

  iconBtn: {
    padding: "8px 12px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    textDecoration: "none",
    fontSize: "12px"
  },

  sectionTitle: {
    fontSize: "13px",
    fontWeight: "bold",
    marginTop: "10px",
    marginBottom: "5px",
    opacity: 0.8
  },

  chargerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid rgba(255,255,255,0.1)"
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  right: {
    display: "flex",
    gap: "12px",
    fontSize: "13px"
  },

  connectorIcon: {
    fontSize: "18px"
  },

  connectorType: {
    fontWeight: "bold"
  },

  power: {
    opacity: 0.8
  },

  price: {
    color: "#00e676",
    fontWeight: "bold"
  },

  status: {
    marginTop: "2px",
    padding: "3px 8px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: "bold",
    display: "inline-block"
  },

  available: {
    background: "#00e676",
    color: "#000"
  },

  maintenance: {
    background: "#ff5252",
    color: "#fff"
  },

  empty: {
    textAlign: "center",
    opacity: 0.6
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
};

export default Chargers;