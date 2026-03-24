import React, { useState } from "react";
import API from "../api/api";
import { colors } from "../styles/colors";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await API.post("login/", {
        username,  
        password,
      });

      localStorage.setItem("token", response.data.access);

      alert("Login successful!");
      window.location.href = "/dashboard";

    } catch (error) {
      console.log("Login Error:", error.response?.data); //debug
      alert("Login failed. Check username/password.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚡ ChargeSence</h1>
        <h2 style={styles.subtitle}>LOGIN</h2>

        {/* USERNAME INPUT */}
        <input
          type="text"
          placeholder="Username"
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* PASSWORD INPUT */}
        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Forgot Password */}
        <p style={styles.link}>Forgot Password?</p>

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>

        {/* Divider */}
        <p style={{ margin: "15px 0" }}>OR</p>

        {/* Social Login */}
        <button style={styles.googleBtn}>
          Login with Google
        </button>

        <button style={styles.appleBtn}>
          Login with Apple
        </button>

        {/* Register */}
        <p style={{ marginTop: "20px" }}>
          New to ChargeSence?{" "}
          <span
            style={styles.link}
            onClick={() => (window.location.href = "/signup")}
          >
            SIGN UP
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light,
  },
  card: {
    width: "350px",
    padding: "30px",
    borderRadius: "12px",
    backgroundColor: colors.white,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    marginBottom: "10px",
    color: colors.primary,
  },
  subtitle: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: `1px solid ${colors.gray}`,
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: colors.primary,
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  googleBtn: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: `1px solid ${colors.gray}`,
    backgroundColor: colors.white,
    cursor: "pointer",
  },
  appleBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${colors.gray}`,
    backgroundColor: "#000",
    color: "#fff",
    cursor: "pointer",
  },
  link: {
    color: colors.secondary,
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Login;