import React from "react";

function LandingPage() {

  const goToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div style={styles.container}>

      {/* BACKGROUND ANIMATION */}
      <div style={styles.background}></div>

      {/* CONTENT */}
      <div style={styles.content}>

        {/* LOGO */}
        <h1 style={styles.logo}>⚡ ChargeSense</h1>

        {/* TAGLINE */}
        <h2 style={styles.tagline}>
          Smart EV Charging Made Simple
        </h2>

        <p style={styles.description}>
          Discover nearby charging stations, plan routes, book slots, 
          and manage payments — all in one intelligent platform.
        </p>

        {/* BUTTON */}
        <button style={styles.button} onClick={goToLogin}>
          🚀 Start Charging
        </button>

      </div>

      {/* FEATURES SECTION */}
      <div style={styles.features}>

        <div style={styles.card}>
          <h3>📍 Smart Navigation</h3>
          <p>Find the best charging stations with real-time routes</p>
        </div>

        <div style={styles.card}>
          <h3>⚡ Fast Booking</h3>
          <p>Reserve charging slots instantly with ease</p>
        </div>

        <div style={styles.card}>
          <h3>💳 Wallet System</h3>
          <p>Secure payments and reward-based charging</p>
        </div>

      </div>

    </div>
  );
}

//////////////////////////////////////////////////
// 🎨 STYLES
//////////////////////////////////////////////////

const styles = {
  container: {
    height: "100vh",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
    color: "#fff",
    position: "relative",
  },

  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #00c6ff)",
    backgroundSize: "400% 400%",
    animation: "gradient 10s ease infinite",
    zIndex: -1,
  },

  content: {
    textAlign: "center",
    paddingTop: "120px",
    animation: "fadeIn 2s ease",
  },

  logo: {
    fontSize: "48px",
    fontWeight: "bold",
  },

  tagline: {
    fontSize: "24px",
    marginTop: "10px",
  },

  description: {
    marginTop: "10px",
    fontSize: "14px",
    maxWidth: "400px",
    marginLeft: "auto",
    marginRight: "auto",
  },

  button: {
    marginTop: "25px",
    padding: "12px 25px",
    fontSize: "16px",
    borderRadius: "30px",
    border: "none",
    background: "#00e676",
    color: "#000",
    cursor: "pointer",
    transition: "0.3s",
  },

  features: {
    position: "absolute",
    bottom: "20px",
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    padding: "0 20px",
  },

  card: {
    background: "rgba(255,255,255,0.1)",
    padding: "15px",
    borderRadius: "10px",
    width: "30%",
    backdropFilter: "blur(10px)",
    textAlign: "center",
  },
};

export default LandingPage;