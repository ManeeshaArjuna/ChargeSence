import React, { useEffect, useState } from "react";
import API from "../api/api";
import { colors } from "../styles/colors";

function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("home/")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  if (!data) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.logo}>⚡ ChargeSence</h2>
        <p>Welcome, {data.name}</p>
      </div>

      {/* PROMOTION */}
      <div style={styles.banner}>
        <p>{data.promotions[0]}</p>
      </div>

      {/* BALANCE */}
      <div style={styles.card}>
        <h3>ChargeSence Balance</h3>
        <p style={styles.amount}>LKR {data.balance}</p>
        <button style={styles.button}>Recharge</button>
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

        {data.favorites.length === 0 ? (
          <p>No favorites yet</p>
        ) : (
          data.favorites.map((fav, index) => (
            <p key={index}>{fav.name}</p>
          ))
        )}

        <button style={styles.button}>+ Add Favorite</button>
      </div>

      {/* NAVIGATION */}
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

/* Styles OUTSIDE component */
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
};

export default Home;