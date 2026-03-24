import React from "react";
import { colors } from "../styles/colors";

function Home() {
  const user = "Maneesha"; // later from API

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.logo}>⚡ ChargeSence</h2>
        <p>Welcome, {user}</p>
      </div>

      {/* PROMOTION BANNER */}
      <div style={styles.banner}>
        <p>🚗 Get 20% OFF on fast charging today!</p>
      </div>

      {/* BALANCE CARD */}
      <div style={styles.card}>
        <h3>ChargeSence Balance</h3>
        <p style={styles.amount}>LKR 1200</p>
        <button style={styles.button}>Recharge</button>
      </div>

      {/* REWARDS CARD */}
      <div style={styles.card}>
        <h3>Rewards Points</h3>
        <p style={styles.amount}>350 pts</p>
        <button style={styles.buttonSecondary}>Redeem</button>
      </div>

      {/* FAVORITE CHARGERS */}
      <div style={styles.card}>
        <h3>Favorite Chargers</h3>
        <button style={styles.button}>+ Add Favorite</button>
      </div>

      {/* VIEW ALL CHARGERS */}
      <div style={styles.card}>
        <button style={styles.button}>View All Chargers</button>
      </div>

      {/* BOTTOM NAVIGATION */}
      <div style={styles.nav}>
        <p style={styles.active}>Home</p>
        <p>Booking</p>
        <p>History</p>
        <p>Wallet</p>
        <p>More</p>
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: "15px",
    backgroundColor: colors.light,
    minHeight: "100vh",
  },
  header: {
    marginBottom: "15px",
  },
  logo: {
    color: colors.primary,
  },
  banner: {
    backgroundColor: colors.primary,
    color: "#fff",
    padding: "10px",
    borderRadius: "10px",
    marginBottom: "15px",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  amount: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  button: {
    marginTop: "10px",
    padding: "8px",
    width: "100%",
    backgroundColor: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  buttonSecondary: {
    marginTop: "10px",
    padding: "8px",
    width: "100%",
    backgroundColor: colors.secondary,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "space-around",
    padding: "10px 0",
    borderTop: "1px solid #ccc",
  },
  active: {
    color: colors.primary,
    fontWeight: "bold",
  },
};

export default Home;