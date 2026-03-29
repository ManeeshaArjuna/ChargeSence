import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);

  const [fpUsername, setFpUsername] = useState("");
  const [last4, setLast4] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [hoverBtn, setHoverBtn] = useState(false);

  const navigate = useNavigate();

  //////////////////////////////////////////////////
  // LOGIN
  //////////////////////////////////////////////////
  const handleLogin = async () => {
    try {
      const response = await API.post("login/", {
        username,
        password,
      });

      const { access, is_superuser } = response.data;

      localStorage.setItem("token", access);

      alert("Login successful!");

      if (is_superuser) {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.log("Login Error:", error.response?.data);
      alert("Login failed. Check username/password.");
    }
  };

  //////////////////////////////////////////////////
  // OTP FLOW (UNCHANGED)
  //////////////////////////////////////////////////
  const requestOTP = () => {
    API.post("password/request-otp/", {
      username: fpUsername,
      last4
    })
      .then(() => {
        alert("OTP sent");
        setStep(2);
      })
      .catch(() => alert("Invalid details"));
  };

  const verifyOTP = () => {
    API.post("password/verify-otp/", {
      username: fpUsername,
      otp
    })
      .then(() => setStep(3))
      .catch(() => alert("Invalid OTP"));
  };

  const resetPassword = () => {

    if (newPass !== confirmPass) {
      alert("Passwords do not match");
      return;
    }

    API.post("password/reset/", {
      username: fpUsername,
      password: newPass
    })
      .then(() => {
        alert("Password reset successful");
        setShowModal(false);
        setStep(1);
      })
      .catch(() => alert("Error resetting password"));
  };

  return (
    <div style={styles.container}>

      {/* BACKGROUND */}
      <div style={styles.background}></div>
      <div style={styles.overlay}></div>

      <div style={styles.card}>

        <h1 style={styles.title}>⚡ ChargeSense</h1>
        <h2 style={styles.subtitle}>Welcome Back</h2>

        <input
          type="text"
          placeholder="Username"
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <p style={styles.link} onClick={() => setShowModal(true)}>
          Forgot Password?
        </p>

        <button
          style={{
            ...styles.button,
            ...(hoverBtn ? styles.buttonHover : {})
          }}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
          onClick={handleLogin}
        >
          Login
        </button>

        <p style={styles.divider}>OR</p>

        <button style={styles.googleBtn}>Login with Google</button>
        <button style={styles.appleBtn}>Login with Apple</button>

        <p style={{ marginTop: "20px" }}>
          New to ChargeSense?{" "}
          <span style={styles.link} onClick={() => navigate("/signup")}>
            SIGN UP
          </span>
        </p>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>

            {step === 1 && (
              <>
                <h3>Verify User</h3>
                <input placeholder="Username" style={styles.input} value={fpUsername} onChange={(e) => setFpUsername(e.target.value)} />
                <input placeholder="Last 4 digits of phone" style={styles.input} value={last4} onChange={(e) => setLast4(e.target.value)} />
                <button style={styles.button} onClick={requestOTP}>Send OTP</button>
              </>
            )}

            {step === 2 && (
              <>
                <h3>Enter OTP</h3>
                <input placeholder="OTP" style={styles.input} value={otp} onChange={(e) => setOtp(e.target.value)} />
                <button style={styles.button} onClick={verifyOTP}>Verify OTP</button>
              </>
            )}

            {step === 3 && (
              <>
                <h3>Reset Password</h3>
                <input type="password" placeholder="New Password" style={styles.input} value={newPass} onChange={(e) => setNewPass(e.target.value)} />
                <input type="password" placeholder="Confirm Password" style={styles.input} value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} />
                <button style={styles.button} onClick={resetPassword}>Reset Password</button>
              </>
            )}

            <button style={styles.closeBtn} onClick={() => setShowModal(false)}>Close</button>

          </div>
        </div>
      )}

    </div>
  );
}

//////////////////////////////////////////////////
//  STYLES (MATCH LANDING PAGE)
//////////////////////////////////////////////////

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', sans-serif",
    position: "relative",
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
    width: "350px",
    padding: "30px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
    textAlign: "center",
    color: "#fff",
  },

  title: { fontSize: "28px" },
  subtitle: { marginBottom: "20px", opacity: 0.8 },

  input: {
    width: "95%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "25px",
    border: "none",
    background: "#00e676",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },

  buttonHover: {
    transform: "scale(1.05)",
    boxShadow: "0 8px 25px rgba(0,230,118,0.6)",
  },

  divider: { margin: "15px 0" },

  googleBtn: { width: "100%", padding: "10px", marginBottom: "10px", borderRadius: "8px" },
  appleBtn: { width: "100%", padding: "10px", borderRadius: "8px" },

  link: { color: "#00e676", cursor: "pointer" },

  modalOverlay: {
    position: "fixed",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
  },

  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    width: "300px",
  },

  closeBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
  }
};

export default Login;