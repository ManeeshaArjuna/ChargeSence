import React, { useState } from "react";
import API from "../api/api";
import { colors } from "../styles/colors";
import { useNavigate } from "react-router-dom";

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  //  Forgot password states
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);

  const [fpUsername, setFpUsername] = useState("");
  const [last4, setLast4] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

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

    //  EXTRACT DATA
    const { access, is_superuser } = response.data;

    //  SAVE TOKEN
    localStorage.setItem("token", access);

    alert("Login successful!");

    //  ROLE REDIRECT
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
  // OTP FLOW
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
      <div style={styles.card}>

        <h1 style={styles.title}>⚡ ChargeSence</h1>
        <h2 style={styles.subtitle}>LOGIN</h2>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Forgot Password */}
        <p style={styles.link} onClick={() => setShowModal(true)}>
          Forgot Password?
        </p>

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>

        {/* Divider */}
        <p style={{ margin: "15px 0" }}>OR</p>

        {/*  PRESERVED */}
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
            onClick={() => navigate("/signup")}
          >
            SIGN UP
          </span>
        </p>
      </div>

      {/*  MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>

            {step === 1 && (
              <>
                <h3>Verify User</h3>
                <input
                  placeholder="Username"
                  style={styles.input}
                  value={fpUsername}
                  onChange={(e) => setFpUsername(e.target.value)}
                />
                <input
                  placeholder="Last 4 digits of phone"
                  style={styles.input}
                  value={last4}
                  onChange={(e) => setLast4(e.target.value)}
                />
                <button style={styles.button} onClick={requestOTP}>
                  Send OTP
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h3>Enter OTP</h3>
                <input
                  placeholder="OTP"
                  style={styles.input}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button style={styles.button} onClick={verifyOTP}>
                  Verify OTP
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <h3>Reset Password</h3>
                <input
                  type="password"
                  placeholder="New Password"
                  style={styles.input}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  style={styles.input}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
                <button style={styles.button} onClick={resetPassword}>
                  Reset Password
                </button>
              </>
            )}

            <button
              style={{ marginTop: "10px" }}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

//////////////////////////////////////////////////
// STYLES (UNCHANGED + MODAL)
//////////////////////////////////////////////////

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

  //  Modal styles
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "350px"
  }
};

export default Login;