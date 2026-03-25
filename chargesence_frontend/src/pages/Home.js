import React, { useEffect, useState } from "react";
import API from "../api/api";
import { colors } from "../styles/colors";

function Home() {

  const [data, setData] = useState({
    name: "",
    balance: 0,
    rewards: 0,
    favorites: [],
    promotions: [],
    stations: []
  });

  useEffect(() => {
    //  Get user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Call API with location
        API.get(`home/?lat=${lat}&lng=${lng}`)
          .then((res) => {
            setData({
              name: res.data.name || "",
              balance: res.data.balance || 0,
              rewards: res.data.rewards || 0,
              favorites: res.data.favorites || [],
              promotions: res.data.promotions || [],
              stations: res.data.stations || []
            });
          })
          .catch((err) => {
            console.error("Home API Error:", err);
          });
      },
      (error) => {
        console.error("Location error:", error);

        //  fallback (no location)
        API.get("home/")
          .then((res) => {
            setData({
              name: res.data.name || "",
              balance: res.data.balance || 0,
              rewards: res.data.rewards || 0,
              favorites: res.data.favorites || [],
              promotions: res.data.promotions || [],
              chargers: res.data.chargers || []
            });
          });
      }
    );
  }, []);

  if (!data.name) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.logo}>⚡ ChargeSence</h2>
        <p>Welcome, {data.name}</p>
      </div>

      {/* PROMOTION */}
      <div style={styles.banner}>
        <p>
          {data.promotions.length > 0
            ? data.promotions[0]
            : "⚡ Welcome to ChargeSence!"}
        </p>
      </div>

      {/* BALANCE */}
      <div style={styles.card}>
        <h3>ChargeSence Balance</h3>
        <p style={styles.amount}>LKR {data.balance}</p>
        <button style={styles.button} onClick={() => (window.location.href = "/wallet")}>
          Recharge
        </button>
      </div>

      {/* REWARDS */}
      <div style={styles.card}>
        <h3>Rewards Points</h3>
        <p style={styles.amount}>{data.rewards} pts</p>
        <button style={styles.buttonSecondary}>Redeem</button>
      </div>

      {/* FAVORITES */}
      <div style={styles.card}>
        <h3>Favorite Chargers</h3>

        {data.favorites && data.favorites.length > 0 ? (
          data.favorites.map((fav, index) => (
            <p key={index}>{fav.name}</p>
          ))
        ) : (
          <p>No favorites yet</p>
        )}

        <button style={styles.button}>+ Add Favorite</button>
      </div>

      {/* NEARBY STATIONS */}
      <div style={styles.card}>
        <h3>Nearby Charging Stations</h3>

        {data.stations.length > 0 ? (
          data.stations.map((s, index) => (
            <div key={index} style={styles.card}>
              <h4>{s.station_name}</h4>
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

              {s.chargers.map((c, i) => (
                <div key={i} style={styles.chargerRow}>
                  <span>{getConnectorIcon(c.connector)}</span>
                  <span>{c.connector}</span>
                  <span>{c.power} kW</span>
                  <span>LKR {c.cost}</span>
                </div>
              ))}

              <p style={{ fontSize: "12px", color: "#888" }}>
                {s.distance?.toFixed(2)} km away
              </p>
            </div>
          ))
        ) : (
          <p>No nearby stations</p>
        )}

        <button
          style={styles.buttonSecondary}
          onClick={() => (window.location.href = "/chargers")}
        >
          View All Chargers
        </button>
      </div>

      {/* NAVIGATION */}
      <div style={styles.nav}>
        <p style={styles.active}>Home</p>
        <p onClick={() => (window.location.href = "/booking")}>Booking</p>
        <p onClick={() => (window.location.href = "/history")}>History</p>
        <p onClick={() => (window.location.href = "/wallet")}>Wallet</p>
        <p onClick={() => (window.location.href = "/more")}>More</p>
      </div>

    </div>
  );
}

/* Styles */
const styles = {
  container: {
    padding: "20px",
    backgroundColor: colors.light,
    minHeight: "100vh",
  },

  header: {
    marginBottom: "20px",
  },

  logo: {
    color: colors.primary,
    marginBottom: "5px",
  },

  banner: {
    backgroundColor: colors.primary,
    color: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    textAlign: "center",
  },

  card: {
    backgroundColor: colors.white,
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  amount: {
    fontSize: "20px",
    fontWeight: "bold",
    margin: "10px 0",
  },

  button: {
    padding: "10px",
    width: "100%",
    borderRadius: "8px",
    border: "none",
    backgroundColor: colors.primary,
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  buttonSecondary: {
    padding: "10px",
    width: "100%",
    borderRadius: "8px",
    border: `1px solid ${colors.primary}`,
    backgroundColor: colors.white,
    color: colors.primary,
    cursor: "pointer",
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
    padding: "10px",
    borderTop: `1px solid ${colors.gray}`,
  },

  active: {
    color: colors.primary,
    fontWeight: "bold",
  },

  grid: {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  },

  tile: {
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    textAlign: "center",
  },

  
};

function getConnectorIcon(type) {
  switch (type) {
    case "TYPE2": return "🔌";
    case "CCS2": return "⚡";
    case "CHADEMO": return "🔋";
    default: return "🔌";
  }
}

export default Home;