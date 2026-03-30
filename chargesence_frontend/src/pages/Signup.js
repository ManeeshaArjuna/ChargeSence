import React, { useState } from "react";
import API from "../api/api";

function Signup() {

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    country_code: "+94",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [hoverBtn, setHoverBtn] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await API.post("register/", {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        username: form.username,
        password: form.password,
        phone_number: form.country_code + form.phone,
      });

      alert("Registration successful!");
      window.location.href = "/";

    } catch (error) {
      console.error(error);
      alert("Signup failed");
    }
  };

  return (
    <div style={styles.container}>

      {/* BACKGROUND */}
      <div style={styles.background}></div>
      <div style={styles.overlay}></div>

      {/* SCROLL WRAPPER */}
      <div style={styles.wrapper}>

        <div style={styles.card}>

          <h1 style={styles.title}>⚡ ChargeSense</h1>
          <h3 style={styles.subtitle}>Create Your Account</h3>

          {/* PERSONAL */}
          <p style={styles.section}>Personal Information</p>

          <input name="first_name" placeholder="First Name" style={styles.input} onChange={handleChange} />
          <input name="last_name" placeholder="Last Name" style={styles.input} onChange={handleChange} />
          <input name="email" placeholder="Email" type="email" style={styles.input} onChange={handleChange} />

          {/* PHONE */}
          <div style={styles.phoneRow}>
            <select name="country_code" style={styles.select} onChange={handleChange}>
              <option value="+94">🇱🇰 +94</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+1">🇺🇸 +1</option>
            </select>

            <input name="phone" placeholder="Phone Number" style={styles.phoneInput} onChange={handleChange} />
          </div>

          {/* SECURITY */}
          <p style={styles.section}>Security</p>

          <input name="username" placeholder="Username" style={styles.input} onChange={handleChange} />
          <input name="password" type="password" placeholder="Password" style={styles.input} onChange={handleChange} />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" style={styles.input} onChange={handleChange} />

          <button
            style={{
              ...styles.button,
              ...(hoverBtn ? styles.buttonHover : {})
            }}
            onMouseEnter={() => setHoverBtn(true)}
            onMouseLeave={() => setHoverBtn(false)}
            onClick={handleSignup}
          >
            Create Account
          </button>

          <p style={{ marginTop: "15px", textAlign: "center" }}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => (window.location.href = "/login")}>
              LOGIN
            </span>
          </p>

        </div>

      </div>
    </div>
  );
}

//////////////////////////////////////////////////
//  STYLES (MATCH LOGIN + LANDING)
//////////////////////////////////////////////////

const styles = {
  container: {
    height: "100vh",
    position: "relative",
    fontFamily: "'Segoe UI', sans-serif",
  },

  wrapper: {
    height: "100vh",
    overflowY: "auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
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

  card: {
    width: "100%",
    maxWidth: "400px",
    padding: "25px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
    color: "#fff",
  },

  title: {
    textAlign: "center",
    fontSize: "26px",
  },

  subtitle: {
    textAlign: "center",
    marginBottom: "20px",
    opacity: 0.8,
  },

  section: {
    marginTop: "15px",
    marginBottom: "10px",
    fontWeight: "bold",
    fontSize: "14px",
  },

  input: {
    width: "calc(100% - 24px)",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
    margin: "10px 12px",
    boxSizing: "border-box"
  },

  phoneRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
    margin: "10px 12px",
    boxSizing: "border-box"
  },

  select: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
  },

  phoneInput: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    margin: "10px 12px",
    boxSizing: "border-box"
  },

  button: {
    width: "calc(100% - 24px)",
    padding: "12px",
    borderRadius: "25px",
    border: "none",
    background: "#00e676",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
    margin: "10px 12px",
    boxSizing: "border-box"
  },

  buttonHover: {
    transform: "scale(1.05)",
    boxShadow: "0 8px 25px rgba(0,230,118,0.6)",
  },

  link: {
    color: "#00e676",
    cursor: "pointer",
  },
};

export default Signup;