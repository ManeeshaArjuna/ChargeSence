import React, { useEffect, useState } from "react";
import API from "../api/api";
import { colors } from "../styles/colors";

function Chargers() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    API.get("chargers/")
      .then((res) => {
        setStations(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚡ Charging Stations</h2>

      {stations.length > 0 ? (
        stations.map((s, index) => (
          <div key={index} style={styles.card}>

            {/* STATION DETAILS */}
            <h3>{s.station_name}</h3>
            <p style={styles.address}>{s.address}</p>

            <div style={styles.iconRow}>
              {s.phone && (
                <a href={`tel:${s.phone}`} style={styles.icon}>📞</a>
              )}

              {s.map && (
                <a href={s.map} target="_blank" rel="noreferrer" style={styles.icon}>
                  📍
                </a>
              )}
            </div>

            {/* CHARGERS */}
            {s.chargers.map((c, i) => (
              <div key={i} style={styles.chargerRow}>
                <span style={styles.connectorIcon}>
                  {getConnectorIcon(c.connector)}
                </span>
                <span>{c.connector}</span>
                <span>{c.power} kW</span>
                <span>LKR {c.cost}</span>
              </div>
            ))}

          </div>
        ))
      ) : (
        <p>No stations available</p>
      )}

      {/* NAVIGATION */}
      <div style={styles.nav}>
        <p onClick={() => (window.location.href = "/dashboard")}>Home</p>
        <p>Booking</p>
        <p>History</p>
        <p>Wallet</p>
        <p style={styles.active}>More</p>
      </div>
    </div>
  );
}

/* CONNECTOR ICON FUNCTION */
function getConnectorIcon(type) {
  switch (type) {
    case "TYPE2": return "🔌";
    case "CCS2": return "⚡";
    case "CHADEMO": return "🔋";
    default: return "🔌";
  }
}

const styles = {
  container: {
    padding: "20px",
    backgroundColor: colors.light,
    minHeight: "100vh",
    paddingBottom: "80px",
  },

  title: {
    marginBottom: "20px",
    color: colors.primary,
  },

  card: {
    backgroundColor: colors.white,
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  address: {
    fontSize: "13px",
    color: "#666",
  },

  iconRow: {
    display: "flex",
    gap: "10px",
    margin: "10px 0",
  },

  icon: {
    fontSize: "18px",
    textDecoration: "none",
  },

  chargerRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderTop: "1px solid #eee",
    fontSize: "14px",
  },

  connectorIcon: {
    marginRight: "5px",
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
  },

  active: {
    color: colors.primary,
    fontWeight: "bold",
  },
};

export default Chargers;