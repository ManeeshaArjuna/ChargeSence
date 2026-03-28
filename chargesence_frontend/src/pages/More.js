import React, { useState, useEffect } from "react";
import API from "../api/api";
import { colors } from "../styles/colors";

function More() {

  const [user, setUser] = useState({});
  const [activeModal, setActiveModal] = useState(null);

  //////////////////////////////////////////////////
  // LOAD USER
  //////////////////////////////////////////////////
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

      {/* PROFILE CARD */}
      <div style={styles.profileCard}>
        <h2>{user.username}</h2>
        <p>{user.email}</p>
        <p>{user.phone}</p>
      </div>

      {/* APP TITLE */}
      <div style={styles.logoBox}>
        <h1 style={{ color: colors.primary }}>⚡ ChargeSense</h1>
      </div>

      {/* MENU */}
      <div style={styles.menu}>
        <MenuBtn label="👤 Profile Details" onClick={() => setActiveModal("profile")} />
        <MenuBtn label="🚗 Vehicle Management" onClick={() => setActiveModal("vehicles")} />
        <MenuBtn label="⚙️ Settings" onClick={() => setActiveModal("settings")} />
        <MenuBtn label="📄 Terms & Conditions" onClick={() => setActiveModal("terms")} />
        <MenuBtn label="🚪 Logout" onClick={logout} danger />
      </div>

      {/* MODAL */}
      {activeModal && (
        <div style={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

            {activeModal === "profile" && (
              <ProfileModal
                user={user}
                setUser={setUser}
                setActiveModal={setActiveModal}
              />
            )}

            {activeModal === "vehicles" && <VehicleModal />}
            {activeModal === "settings" && <SettingsModal />}
            {activeModal === "terms" && <TermsModal />}

            <button onClick={() => setActiveModal(null)} style={styles.closeBtn}>
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
// MENU BUTTON COMPONENT
//////////////////////////////////////////////////////

const MenuBtn = ({ label, onClick, danger }) => (
  <button
    onClick={onClick}
    style={{
      ...styles.menuBtn,
      color: danger ? "red" : "#333"
    }}
  >
    {label}
  </button>
);

//////////////////////////////////////////////////////
// PROFILE MODAL (FIXED + IMPROVED)
//////////////////////////////////////////////////////

function ProfileModal({ user, setUser, setActiveModal }) {

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleUpdate = () => {
    API.put("user/update/", { email, phone })
      .then(() => {
        alert("Profile updated");

        // ✅ REFRESH USER
        API.get("user/profile/").then(res => {
          setUser(res.data);
          setActiveModal(null); // close modal
        });
      })
      .catch(() => alert("Update failed"));
  };

  const changePassword = () => {
    if (!password) return alert("Enter new password");

    API.post("user/change-password/", { password })
      .then(() => alert("Password updated"))
      .catch(() => alert("Password change failed"));
  };

  return (
    <>
      <h3>👤 Profile Details</h3>

      <input style={styles.input} value={user.username || ""} disabled />
      <input style={styles.input} value={user.role || ""} disabled />
      <input
        style={styles.input}
        value={user.date_joined ? new Date(user.date_joined).toLocaleDateString() : ""}
        disabled
      />

      <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />

      <button style={styles.button} onClick={handleUpdate}>
        Update Profile
      </button>

      <hr />

      <h4>🔒 Change Password</h4>

      <input
        type="password"
        placeholder="New Password"
        style={styles.input}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.button} onClick={changePassword}>
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

  //////////////////////////////////////////////////
  // LOAD VEHICLES
  //////////////////////////////////////////////////
  const fetchVehicles = () => {
    API.get("vehicles/list/")
      .then((res) => setVehicles(res.data));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  //////////////////////////////////////////////////
  // ADD VEHICLE
  //////////////////////////////////////////////////
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

        setManufacturer("");
        setModel("");
        setConnector("");
        setBattery("");
        setEfficiency("");

        setShowForm(false);
        fetchVehicles();
      })
      .catch(err => {
        console.log("ERROR:", err.response.data);
        alert("Add failed");
      });
  };

  //////////////////////////////////////////////////
  // DELETE VEHICLE
  //////////////////////////////////////////////////
  const deleteVehicle = (id) => {
    API.delete(`vehicles/${id}/`)
      .then(() => {
        alert("Deleted");
        setVehicles(prev => prev.filter(v => v.id !== id));
      })
      .catch(() => alert("Delete failed"));
  };

  return (
    <>
      <h3>🚗 Vehicle Management</h3>

      {/* ADD BUTTON */}
      <button
        style={styles.button}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Cancel" : "+ Add Vehicle"}
      </button>

      {/* ADD FORM */}
      {showForm && (
        <div style={styles.formBox}>

          <input
            style={styles.input}
            placeholder="Manufacturer (e.g. Tesla)"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Model (e.g. Model 3)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />

          <select
            style={styles.input}
            value={connector}
            onChange={(e) => setConnector(e.target.value)}
          >
            <option value="">Select Connector</option>

            <option value="TYPE1">Type 1</option>
            <option value="TYPE2">Type 2</option>
            <option value="CCS">CCS</option>
            <option value="CCS2">CCS2</option>
            <option value="CHADEMO">CHAdeMO</option>
          </select>

          <input
            style={styles.input}
            placeholder="Battery Capacity (kWh)"
            value={battery}
            onChange={(e) => setBattery(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Efficiency (Wh/km)"
            value={efficiency}
            onChange={(e) => setEfficiency(e.target.value)}
          />

          <button style={styles.button} onClick={addVehicle}>
            Save Vehicle
          </button>

        </div>
      )}

      {/* LIST */}
      {vehicles.length === 0 && <p>No vehicles found</p>}

      {vehicles.map(v => (
        <div key={v.id} style={styles.vehicleCard}>
          <b>{v.manufacturer} {v.model}</b>
          <p>{v.connector_type}</p>

          <button style={styles.deleteBtn} onClick={() => deleteVehicle(v.id)}>
            Delete
          </button>
        </div>
      ))}
    </>
  );
}

//////////////////////////////////////////////////////
// SETTINGS MODAL
//////////////////////////////////////////////////////

function SettingsModal() {
  const [threshold, setThreshold] = useState(20);

  const save = () => {
    API.post("settings/", { threshold })
      .then(() => alert("Saved"))
      .catch(() => alert("Save failed"));
  };

  return (
    <>
      <h3>⚙️ Battery Threshold</h3>

      <input
        style={styles.input}
        type="number"
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
      />

      <button style={styles.button} onClick={save}>Save</button>
    </>
  );
}

//////////////////////////////////////////////////////
// TERMS
//////////////////////////////////////////////////////

function TermsModal() {
  return (
    <>
      <h3>📄 Terms</h3>
      <p>• Charging must be completed within booking time</p>
      <p>• Late fees apply</p>
    </>
  );
}

//////////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////////

const styles = {
  container: {
    padding: "20px",
    paddingBottom: "80px",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh"
  },

  profileCard: {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "12px",
    textAlign: "center",
    marginBottom: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },

  logoBox: {
    textAlign: "center",
    marginBottom: "15px"
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  menuBtn: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#fff",
    textAlign: "left",
    fontSize: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)"
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
    maxWidth: "400px"
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },

  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: "8px"
  },

  deleteBtn: {
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    padding: "6px",
    borderRadius: "6px"
  },

  vehicleCard: {
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "8px"
  },

  closeBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "8px"
  },

  nav: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: "10px",
    borderTop: "1px solid #ddd"
  },

  active: {
    color: colors.primary,
    fontWeight: "bold"
  }
};

export default More;