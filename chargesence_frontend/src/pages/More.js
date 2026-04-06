import React, { useState, useEffect } from "react";
import API from "../api/api";

function More() {

  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const [user, setUser] = useState({});
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = () => {
    API.get("user/profile/")
      .then(res => setUser(res.data))
      .catch(err => console.error(err));
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div style={styles.container}>

      {/* PROFILE */}
      <div style={styles.profileCard}>
        <h2>{user.username}</h2>
        <p style={styles.sub}>{user.email}</p>
        <p style={styles.sub}>{user.phone}</p>
      </div>

      {/* LOGO */}
      <h2 style={styles.logo}>⚡ ChargeSense</h2>

      {/* MENU */}
      <div style={styles.menu}>
        <MenuBtn label="👤 Profile Details" onClick={() => setActiveModal("profile")} />
        <MenuBtn label="🚗 Vehicle Management" onClick={() => setActiveModal("vehicles")} />
        <MenuBtn label="⚙️ Settings" onClick={() => setActiveModal("settings")} />
        <MenuBtn label="📄 Terms & Conditions" onClick={() => setActiveModal("terms")} />

        {role === "ADMIN" && (
        <MenuBtn
            label="🛠 Admin Dashboard"
            onClick={() => (window.location.href = "/admin-dashboard")}
          />
        )}
        <MenuBtn label="🚪 Logout" onClick={logout} danger />
      </div>

      {/* MODAL */}
      {activeModal && (
        <div style={styles.overlay} onClick={() => setActiveModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

            {activeModal === "profile" && (
              <ProfileModal user={user} setUser={setUser} setActiveModal={setActiveModal} />
            )}

            {activeModal === "vehicles" && <VehicleModal />}
            {activeModal === "settings" && <SettingsModal />}
            {activeModal === "terms" && <TermsModal />}

            <button onClick={() => setActiveModal(null)} style={styles.secondaryBtn}>
              Close
            </button>

          </div>
        </div>
      )}

      {/* NAV */}
      <div style={styles.nav}>
        <p onClick={() => (window.location.href = "/dashboard")}>Home</p>
        <p onClick={() => (window.location.href = "/booking")}>Booking</p>
        <p onClick={() => (window.location.href = "/activity")}>Activity</p>
        <p onClick={() => (window.location.href = "/wallet")}>Wallet</p>
        <p style={styles.active}>More</p>
      </div>

    </div>
  );
}

//////////////////////////////////////////////////////
// MENU BUTTON
//////////////////////////////////////////////////////

const MenuBtn = ({ label, onClick, danger }) => (
  <button
    onClick={onClick}
    style={{
      ...styles.menuBtn,
      ...(danger ? styles.danger : {})
    }}
  >
    {label}
  </button>
);

//////////////////////////////////////////////////////
// PROFILE MODAL
//////////////////////////////////////////////////////

function ProfileModal({ user, setUser, setActiveModal }) {

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setEmail(user.email || "");
    setPhone(user.phone || "");
  }, [user]);

  const handleUpdate = () => {
    API.put("user/update/", { email, phone })
      .then(() => {
        alert("Profile updated");
        API.get("user/profile/").then(res => {
          setUser(res.data);
          setActiveModal(null);
        });
      })
      .catch(() => alert("Update failed"));
  };

  const changePassword = () => {
    if (!password) return alert("Enter password");

    API.post("user/change-password/", { password })
      .then(() => alert("Password updated"))
      .catch(() => alert("Failed"));
  };

  return (
    <>
      <h3>👤 Profile</h3>

      <input style={styles.input} value={user.username || ""} disabled />
      <input style={styles.input} value={user.role || ""} disabled />
      <input style={styles.input} value={user.date_joined ? new Date(user.date_joined).toLocaleDateString() : ""} disabled />

      <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />

      <button style={styles.primaryBtn} onClick={handleUpdate}>
        Update Profile
      </button>

      <hr />

      <h4>🔒 Change Password</h4>

      <input
        type="password"
        style={styles.input}
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.primaryBtn} onClick={changePassword}>
        Change Password
      </button>
    </>
  );
}

//////////////////////////////////////////////////////
// VEHICLE MODAL
//////////////////////////////////////////////////////

function VehicleModal() {

  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [connector, setConnector] = useState("");
  const [battery, setBattery] = useState("");
  const [efficiency, setEfficiency] = useState("");

  const fetchVehicles = () => {
    API.get("vehicles/list/").then(res => setVehicles(res.data));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const addVehicle = () => {

    if (!manufacturer || !model || !connector || !battery || !efficiency) {
      alert("Fill all fields");
      return;
    }

    API.post("vehicles/", {
      manufacturer,
      model,
      connector_type: connector,
      battery_capacity_kwh: battery,
      efficiency_wh_per_km: efficiency
    })
      .then(() => {
        alert("Vehicle added");
        setShowForm(false);
        fetchVehicles();
      })
      .catch(() => alert("Error"));
  };

  const deleteVehicle = (id) => {
    API.delete(`vehicles/${id}/`)
      .then(() => setVehicles(prev => prev.filter(v => v.id !== id)))
      .catch(() => alert("Delete failed"));
  };

  return (
    <>
      <h3>🚗 Vehicles</h3>

      <button style={styles.primaryBtn} onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ Add Vehicle"}
      </button>

      {showForm && (
        <div style={styles.card}>
          <input style={styles.input} placeholder="Manufacturer" onChange={(e) => setManufacturer(e.target.value)} />
          <input style={styles.input} placeholder="Model" onChange={(e) => setModel(e.target.value)} />

          <select style={styles.input} onChange={(e) => setConnector(e.target.value)}>
            <option value="">Select Connector</option>
            <option value="TYPE2">Type 2</option>
            <option value="CCS2">CCS2</option>
            <option value="CHADEMO">CHAdeMO</option>
          </select>

          <input style={styles.input} placeholder="Battery (kWh)" onChange={(e) => setBattery(e.target.value)} />
          <input style={styles.input} placeholder="Efficiency (Wh/km)" onChange={(e) => setEfficiency(e.target.value)} />

          <button style={styles.primaryBtn} onClick={addVehicle}>
            Save Vehicle
          </button>
        </div>
      )}

      {vehicles.map(v => (
        <div key={v.id} style={styles.card}>
          <b>{v.manufacturer} {v.model}</b>
          <p style={styles.sub}>{v.connector_type}</p>

          <button style={styles.dangerBtn} onClick={() => deleteVehicle(v.id)}>
            Delete
          </button>
        </div>
      ))}
    </>
  );
}

//////////////////////////////////////////////////////
// SETTINGS
//////////////////////////////////////////////////////

function SettingsModal() {
  const [threshold, setThreshold] = useState(20);

  useEffect(() => {
    API.get("settings/get/")
      .then(res => setThreshold(res.data.threshold))
      .catch(() => console.log("No settings"));
  }, []);

  const save = () => {
    API.post("settings/", { threshold })
      .then(() => alert("Saved"))
      .catch(() => alert("Error"));
  };

  return (
    <>
      <h3>⚙️ Settings</h3>

      <input
        style={styles.input}
        type="number"
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
      />

      <button style={styles.primaryBtn} onClick={save}>
        Save
      </button>
    </>
  );
}

//////////////////////////////////////////////////////
// TERMS
//////////////////////////////////////////////////////

function TermsModal() {
  return (
    <>
      <h3>📄 Terms & Conditions</h3>

      <h4>⚡ Booking Policy</h4>
      <p>• Users must provide accurate vehicle and battery details to receive optimal charging recommendations.</p>
      <p>• Charging slots are reserved based on the selected time and duration.</p>
      <p>• Users must arrive within the reserved time window; otherwise, the booking may be cancelled or reassigned.</p>
      <p>• Failure to arrive on time may result in loss of the reserved slot.</p>

      <h4>💳 Payment Policy</h4>
      <p>• All bookings must be paid in advance using the in-app wallet system.</p>
      <p>• Final charging cost may vary depending on actual energy consumption during the charging session.</p>
      <p>• Wallet balances must be sufficient before confirming a booking.</p>

      <h4>🔌 Charging & Usage</h4>
      <p>• Users are responsible for selecting compatible charger connectors for their vehicles.</p>
      <p>• Charging must be completed within the booked duration unless extended through the system.</p>
      <p>• Additional fees may apply for exceeding the reserved charging time.</p>

      <h4>📍 Smart Recommendations</h4>
      <p>• The system provides charger recommendations based on user inputs, vehicle data, and predictive models.</p>
      <p>• Recommendations are estimates and may be affected by real-world conditions such as traffic or charger availability.</p>

      <h4>⚠️ User Responsibility</h4>
      <p>• Users must use the system responsibly and avoid making false or duplicate bookings.</p>
      <p>• Misuse of the platform may result in account suspension or restricted access.</p>

      <h4>🚫 Liability Disclaimer</h4>
      <p>• ChargeSense is not responsible for delays, inaccuracies, or disruptions caused by external factors such as traffic, weather, or third-party services.</p>
      <p>• The platform provides guidance and booking services but does not guarantee charger availability at all times.</p>

      <h4>✅ Acceptance</h4>
      <p>• By using ChargeSense, users agree to comply with all terms and conditions stated above.</p>
    </>
  );
}

//////////////////////////////////////////////////////
// STYLES (PREMIUM)
//////////////////////////////////////////////////////

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    paddingBottom: "90px",
    fontFamily: "'Segoe UI', sans-serif",
    background: "linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #00c6ff)",
    color: "#fff"
  },

  logo: {
    textAlign: "center",
    marginBottom: "15px"
  },

  profileCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "18px",
    borderRadius: "18px",
    textAlign: "center",
    marginBottom: "15px"
  },

  sub: {
    fontSize: "13px",
    opacity: 0.8
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  menuBtn: {
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    textAlign: "left"
  },

  menuBtnHover: {
    transform: "scale(1.05)",
    boxShadow: "0 8px 25px rgba(0,230,118,0.6)",
  },

  danger: {
    color: "#ff5252"
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999
  },

  modal: {
    background: "rgba(92, 77, 77, 0.7)",
    backdropFilter: "blur(16px)",
    padding: "20px",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "400px",
    maxHeight: "80vh", 
    overflowY: "auto" 
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "12px",
    borderRadius: "14px",
    marginTop: "10px"
  },

  input: {
    width: "calc(100% - 24px)",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    marginBottom: "10px",
    margin: "10px 12px",
    boxSizing: "border-box"
  },

  primaryBtn: {
    width: "calc(100% - 24px)",
    padding: "12px",
    borderRadius: "25px",
    border: "none",
    background: "linear-gradient(135deg, #00e676, #00c6ff)",
    color: "#000",
    fontWeight: "bold",
    margin: "10px 12px",
    boxSizing: "border-box"
  },

  secondaryBtn: {
    width: "calc(100% - 24px)",
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #fff",
    background: "transparent",
    color: "#fff",
    marginTop: "10px",
    margin: "10px 12px",
    boxSizing: "border-box"
  },

  dangerBtn: {
    marginTop: "8px",
    padding: "8px",
    borderRadius: "10px",
    border: "none",
    background: "#ff5252",
    color: "#fff"
  },

  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100vw",
    display: "flex",
    justifyContent: "space-around",
    padding: "14px 0",
    margin: 0,
    boxSizing: "border-box",
    background: "rgba(227, 181, 18, 0.4)",
    backdropFilter: "blur(15px)",
    borderTop: "1px solid rgba(255,255,255,0.1)"
  },

  active: {
    color: "#00e676",
    fontWeight: "bold"
  }
};

export default More;