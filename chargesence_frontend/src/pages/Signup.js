import React, { useState } from "react";
import API from "../api/api";
import { colors } from "../styles/colors";

function Signup() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country_code: "+94",
    username: "",
    password: "",
    confirmPassword: "",
  });

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
        phone: form.country_code + form.phone,
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
      <div style={styles.card}>
        <h1 style={styles.title}>⚡ ChargeSence</h1>
        <h3 style={styles.subtitle}>SIGN UP</h3>

        {/* PERSONAL SECTION */}
        <p style={styles.section}>Personal</p>

        <input
          name="first_name"
          placeholder="First Name"
          style={styles.input}
          onChange={handleChange}
        />

        <input
          name="last_name"
          placeholder="Last Name"
          style={styles.input}
          onChange={handleChange}
        />

        <input
          name="email"
          placeholder="Email"
          type="email"
          style={styles.input}
          onChange={handleChange}
        />

        {/* Phone with country code */}
        <div style={styles.phoneRow}>
          <select
            name="country_code"
            style={styles.select}
            onChange={handleChange}
          >
            <option value="+94">🇱🇰 +94</option>
            <option value="+91">🇮🇳 +91</option>
            <option value="+1">🇺🇸 +1</option>
          </select>

          <input
            name="phone"
            placeholder="Phone Number"
            style={styles.phoneInput}
            onChange={handleChange}
          />
        </div>

        {/* SECURITY SECTION */}
        <p style={styles.section}>Security</p>

        <input
          name="username"
          placeholder="Username"
          style={styles.input}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          style={styles.input}
          onChange={handleChange}
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          style={styles.input}
          onChange={handleChange}
        />

        <button style={styles.button} onClick={handleSignup}>
          Create Account
        </button>

        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <span
            style={styles.link}
            onClick={() => (window.location.href = "/")}
          >
            LOGIN
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
    width: "380px",
    padding: "30px",
    borderRadius: "12px",
    backgroundColor: colors.white,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    color: colors.primary,
    marginBottom: "5px",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: "20px",
  },
  section: {
    fontWeight: "bold",
    marginTop: "10px",
    marginBottom: "10px",
    color: colors.dark,
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "8px",
    border: `1px solid ${colors.gray}`,
  },
  phoneRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${colors.gray}`,
  },
  phoneInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${colors.gray}`,
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: colors.primary,
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  link: {
    color: colors.secondary,
    cursor: "pointer",
  },
};

export default Signup;