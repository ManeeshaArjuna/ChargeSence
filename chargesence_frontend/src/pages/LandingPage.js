import React, { useState } from "react";

function LandingPage() {

  const goToLogin = () => {
    window.location.href = "/login";
  };

  const [hoverBtn, setHoverBtn] = useState(false);
  const [hoverCard, setHoverCard] = useState(null);

  return (
    <div style={styles.container}>

      {/* BACKGROUND */}
      <div style={styles.background}></div>
      <div style={styles.overlay}></div>

      {/* SCROLL WRAPPER */}
      <div style={styles.wrapper}>

        {/* CONTENT */}
        <div style={styles.content}>

          <h1 style={styles.logo}>⚡ ChargeSense</h1>

          <h2 style={styles.tagline}>
            Smart EV Charging Made Simple
          </h2>

          <p style={styles.description}>
            Discover nearby charging stations, plan routes, book slots,
            and manage payments.
            All in one intelligent platform.
          </p>

          <button
            style={{
              ...styles.button,
              ...(hoverBtn ? styles.buttonHover : {})
            }}
            onMouseEnter={() => setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
            onClick={goToLogin}
          >
            🚀 Start Charging
          </button>

        </div>

        {/* FEATURES */}
        <div style={styles.features}>

          {[
            {
              title: "📍 Smart Navigation",
              text: "Find the best charging stations with real-time routes"
            },
            {
              title: "⚡ Fast Booking",
              text: "Reserve charging slots instantly with ease"
            },
            {
              title: "💳 Wallet System",
              text: "Secure payments and reward-based charging"
            }
          ].map((item, index) => (
            <div
              key={index}
              style={{
                ...styles.card,
                ...(hoverCard === index ? styles.cardHover : {})
              }}
              onMouseEnter={() => setHoverCard(index)}
              onMouseLeave={() => setHoverCard(null)}
            >
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

//////////////////////////////////////////////////
//  STYLES (MOBILE FIXED)
//////////////////////////////////////////////////

const styles = {
  container: {
    height: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#fff",
    position: "relative",
  },

  wrapper: {
    height: "100vh",
    overflowY: "auto", 
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: "40px",
  },

  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #00c6ff)",
    backgroundSize: "400% 400%",
    animation: "gradient 12s ease infinite",
    zIndex: -2,
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    zIndex: -1,
  },

  content: {
    textAlign: "center",
    paddingTop: "100px",
    paddingLeft: "20px",
    paddingRight: "20px",
  },

  logo: {
    fontSize: "42px", 
    fontWeight: "bold",
    animation: "float 3s ease-in-out infinite",
  },

  tagline: {
    fontSize: "22px",
    marginTop: "10px",
  },

  description: {
    marginTop: "15px",
    fontSize: "14px",
    maxWidth: "400px",
    lineHeight: "1.6",
  },

  button: {
    marginTop: "25px",
    padding: "12px 25px",
    borderRadius: "30px",
    background: "#00e676",
    border: "none",
    fontWeight: "bold",
  },

  buttonHover: {
    transform: "scale(1.05)",
    boxShadow: "0 8px 25px rgba(0, 230, 118, 0.6)",
  },

  features: {
    marginTop: "40px",
    display: "flex",
    flexDirection: "column", 
    gap: "15px",
    width: "100%",
    alignItems: "center",
    padding: "0 20px",
  },

  card: {
    width: "100%", 
    maxWidth: "320px",
    background: "rgba(255,255,255,0.08)",
    padding: "15px",
    borderRadius: "12px",
    textAlign: "center",
  },

  cardHover: {
    transform: "translateY(-6px)",
  },
};

export default LandingPage;