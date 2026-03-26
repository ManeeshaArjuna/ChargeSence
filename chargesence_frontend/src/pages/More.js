import React, { useState, useEffect } from "react";
import API from "../api/api";
import { colors } from "../styles/colors";

function More() {

  const [user, setUser] = useState({});
  const [activeModal, setActiveModal] = useState(null);

  // GET REAL USER DATA
  useEffect(() => {
    API.get("user/profile/")
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div style={styles.container}>

      {/* USER HEADER */}
      <div style={styles.profileHeader}>
        <h2>{user.username}</h2>
        <p>{user.phone}</p>
        <p>{user.email}</p>
      </div>

      {/* LOGO */}
      <div style={styles.logoBox}>
        <h1 style={{ color: colors.primary }}>⚡ ChargeSence</h1>
      </div>

      {/* MENU */}
      <div style={styles.menu}>
        <button onClick={() => setActiveModal("profile")}>Profile Details</button>
        <button onClick={() => setActiveModal("vehicles")}>Vehicle Management</button>
        <button onClick={() => setActiveModal("settings")}>Settings</button>
        <button onClick={() => setActiveModal("terms")}>Terms & Conditions</button>
        <button onClick={logout} style={{ color: "red" }}>Logout</button>
      </div>

      {/* MODALS */}
      {activeModal && (
        <div style={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

            {activeModal === "profile" && <ProfileModal user={user} />}
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
        <p>History</p>
        <p onClick={() => (window.location.href = "/wallet")}>Wallet</p>
        <p style={styles.active}>More</p>
      </div>

    </div>
  );
}

//////////////////////////////////////////////////////
// PROFILE MODAL (UPDATED)
//////////////////////////////////////////////////////

function ProfileModal({ user }) {

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
      .then(() => alert("Profile updated"))
      .catch(() => alert("Update failed"));
  };

  const changePassword = () => {
    if (!password) {
      alert("Enter new password");
      return;
    }

    API.post("user/change-password/", { password })
      .then(() => alert("Password updated"))
      .catch(() => alert("Password change failed"));
  };

  return (
    <>
      <h3>Profile Details</h3>

      {/* READ ONLY */}
      <label>Username</label>
      <input style={styles.input} value={user.username || ""} disabled />

      <label>Role</label>
      <input style={styles.input} value={user.role || ""} disabled />

      <label>Joined</label>
      <input
        style={styles.input}
        value={user.date_joined ? new Date(user.date_joined).toLocaleDateString() : ""}
        disabled
      />

      {/* EDITABLE */}
      <label>Email</label>
      <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />

      <label>Phone</label>
      <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />

      <button style={styles.button} onClick={handleUpdate}>
        Update Profile
      </button>

      <hr />

      {/* PASSWORD */}
      <h4>Change Password</h4>

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

  const fetchVehicles = () => {
    API.get("vehicles/list/")
      .then((res) => setVehicles(res.data));
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const deleteVehicle = (id) => {
    API.delete(`vehicles/${id}/`)
      .then(() => {
        alert("Deleted");
        fetchVehicles();
      })
      .catch(() => alert("Delete failed"));
  };

  return (
    <>
      <h3>Vehicle Management</h3>

      {vehicles.length === 0 && <p>No vehicles found</p>}

      {vehicles.map((v) => (
        <div key={v.id} style={styles.vehicleCard}>
          <p><b>{v.manufacturer} {v.model}</b></p>
          <p>{v.connector_type}</p>

          <button onClick={() => deleteVehicle(v.id)} style={styles.deleteBtn}>
            Delete
          </button>
        </div>
      ))}

      <button style={styles.button}>+ Add Vehicle</button>
    </>
  );
}

//////////////////////////////////////////////////////
// SETTINGS MODAL
//////////////////////////////////////////////////////

function SettingsModal() {

  const [threshold, setThreshold] = useState(20);

  const save = () => {
    if (threshold < 5 || threshold > 100) {
      alert("Enter value between 5% and 100%");
      return;
    }

    API.post("settings/", { threshold })
      .then(() => alert("Saved"))
      .catch(() => alert("Save failed"));
  };

  return (
    <>
      <h3>Battery Threshold (%)</h3>

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
// TERMS MODAL
//////////////////////////////////////////////////////

function TermsModal() {
  return (
    <>
      <h3>Terms & Conditions</h3>

      <p>• Charging must be completed within booking time</p>
      <p>• Late fees will apply</p>
      <p>• Refund policy applies</p>
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
    backgroundColor: colors.light,
    minHeight: "100vh",
  },

  profileHeader: {
    textAlign: "center",
    marginBottom: "15px",
  },

  logoBox: {
    textAlign: "center",
    marginBottom: "20px",
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 100,
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
    maxWidth: "400px",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    marginTop: "10px",
  },

  deleteBtn: {
    backgroundColor: "red",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px",
  },

  vehicleCard: {
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
  },

  closeBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "8px",
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

export default More;