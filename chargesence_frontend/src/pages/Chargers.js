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

            {/* HEADER */}
            <div style={styles.header}>
              <div>
                <h3 style={styles.stationName}>{s.station_name}</h3>
                <p style={styles.address}>{s.address}</p>
              </div>
            </div>

            {/* ACTION ICONS */}
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

            {/* CHARGERS */}
            <div style={styles.sectionTitle}>Available Connectors</div>

            {s.chargers.map((c, i) => (
              <div key={i} style={styles.chargerRow}>

                {/* LEFT */}
                <div style={styles.left}>
                  <span style={styles.connectorIcon}>
                    {getConnectorIcon(c.connector)}
                  </span>
                  <span style={styles.connectorType}>{c.connector}</span>

                  {/* 🔥 STATUS */}
                  <span
                    style={{
                      ...styles.status,
                      backgroundColor: c.available ? "#fff3e0" : "#e6f9ed",
                      color: c.available ? "#ef6c00" : "#2e7d32",
                    }}
                  >
                    {c.available ? "Maintenance" : "Available"}
                  </span>
                </div>

                {/* RIGHT */}
                <div style={styles.right}>
                  <span style={styles.power}>{c.power} kW</span>
                  <span style={styles.price}>LKR {c.cost}</span>
                </div>

              </div>
            ))}

          </div>
        ))
      ) : (
        <p style={{ textAlign: "center" }}>No stations available</p>
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
//  STYLES
//////////////////////////////////////////////////

const styles = {
  container: {
    padding: "20px",
    backgroundColor: colors.light,
    minHeight: "100vh",
    paddingBottom: "90px",
  },

  title: {
    marginBottom: "20px",
    color: colors.primary,
    fontSize: "22px",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: colors.white,
    padding: "18px",
    borderRadius: "14px",
    marginBottom: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  header: {
    marginBottom: "10px",
  },

  stationName: {
    margin: 0,
    fontSize: "18px",
  },

  address: {
    fontSize: "13px",
    color: "#777",
  },

  iconRow: {
    display: "flex",
    gap: "10px",
    margin: "10px 0",
  },

  iconBtn: {
    backgroundColor: "#f5f5f5",
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "13px",
    textDecoration: "none",
    color: "#333",
  },

  sectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    marginTop: "10px",
    marginBottom: "5px",
    color: "#555",
  },

  chargerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid #eee",
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  right: {
    display: "flex",
    gap: "12px",
    fontSize: "13px",
  },

  connectorIcon: {
    fontSize: "16px",
  },

  connectorType: {
    fontWeight: "500",
  },

  power: {
    color: "#444",
  },

  price: {
    color: colors.primary,
    fontWeight: "bold",
  },

  status: {
    marginLeft: "8px",
    padding: "2px 8px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "bold",
  },

  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: colors.white,
    padding: "12px",
    borderTop: `1px solid ${colors.gray}`,
  },
};

export default Chargers;