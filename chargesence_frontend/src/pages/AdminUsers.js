import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminUsers() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

 const [showOTPModal, setShowOTPModal] = useState(false);
 const [selectedUser, setSelectedUser] = useState(null);
 const [otp, setOtp] = useState("");
 const [newPassword, setNewPassword] = useState("");
 const [otpVerified, setOtpVerified] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    is_admin: false
  });

  //////////////////////////////////////////////////
  // FETCH USERS
  //////////////////////////////////////////////////
  const fetchUsers = () => {
    API.get(`admin/users/?search=${search}`)
      .then(res => setUsers(res.data))
      .catch(() => alert("Error loading users"));
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  //////////////////////////////////////////////////
  // OPEN MODAL
  //////////////////////////////////////////////////
  const openCreate = () => {
    setEditingUser(null);
    setForm({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      is_admin: false
    });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      ...user,
      password: ""
    });
    setShowModal(true);
  };

  //////////////////////////////////////////////////
  // SAVE USER
  //////////////////////////////////////////////////
  const saveUser = () => {
    if (editingUser) {
      API.put(`admin/users/${editingUser.id}/`, form)
        .then(() => {
          alert("Updated");
          setShowModal(false);
          fetchUsers();
        });
    } else {
      API.post("admin/users/create/", form)
        .then(() => {
          alert("Created");
          setShowModal(false);
          fetchUsers();
        });
    }
  };

  //////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////
  const deleteUser = (id) => {
    if (!window.confirm("Delete user?")) return;

    API.delete(`admin/users/${id}/delete/`)
      .then(() => fetchUsers());
  };

    // SEND OTP
    const sendOTP = (user) => {
    setSelectedUser(user);

    API.post("admin/password/send-otp/", { user_id: user.id })
        .then(() => {
        alert("OTP sent to user");
        setShowOTPModal(true);
        });
    };

    // VERIFY OTP
    const verifyOTP = () => {
    API.post("admin/password/verify-otp/", {
        user_id: selectedUser.id,
        otp
    })
        .then(() => {
        alert("OTP verified");
        setOtpVerified(true);
        })
        .catch(() => alert("Invalid OTP"));
    };

    // RESET PASSWORD
    const resetPassword = () => {
    API.post("admin/password/reset/", {
        user_id: selectedUser.id,
        password: newPassword
    })
        .then(() => {
        alert("Password updated");
        setShowOTPModal(false);
        setOtpVerified(false);
        setOtp("");
        setNewPassword("");
        });
    };

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////
  return (
    <div style={styles.layout}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={{marginBottom:"30px"}}>⚡ Admin</h2>

        <div style={styles.navItem}> <p onClick={() => window.location.href = "/admin-dashboard"} style={{cursor:"pointer"}}>Dashboard</p></div>
        <div style={{...styles.navItem, ...styles.active}}>Users</div>
        <div style={styles.navItem}><p onClick={() => window.location.href = "/admin-stations"} style={{cursor:"pointer"}}>Stations</p></div>
        <div style={styles.navItem}><p onClick={() => window.location.href = "/admin-chargers"} style={{cursor:"pointer"}}>Chargers</p></div>
        <div style={styles.navItem}><p onClick={() => window.location.href = "/admin-bookings"} style={{cursor:"pointer"}}>Bookings</p></div>
        <div style={styles.navItem}><p onClick={() => window.location.href = "/admin-vehicles"} style={{cursor:"pointer"}}>Vehicles</p></div>
        <div style={styles.navItem}><p onClick={() => window.location.href = "/admin-notifications"} style={{cursor:"pointer"}}>Notifications</p></div>
      </div>

      {/* MAIN */}
      <div style={styles.container}>

        <div style={styles.header}>
          <h1>User Management</h1>

          <button onClick={openCreate} style={styles.primaryBtn}>
            + Add User
          </button>
        </div>

        {/* SEARCH */}
        <input
          placeholder="🔍 Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />

        {/* TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.phone_number}</td>
                  <td>{u.email}</td>
                  <td>
                    <span style={u.is_superuser ? styles.adminTag : styles.userTag}>
                      {u.is_superuser ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => openEdit(u)} style={styles.editBtn}>
                      Edit
                    </button>
                    <button onClick={() => sendOTP(u)} style={styles.secondaryBtn}>
                    Reset Password
                    </button>
                    <button onClick={() => deleteUser(u.id)} style={styles.deleteBtn}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{editingUser ? "Edit User" : "Create User"}</h3>

            <input placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})} />
            <input placeholder="First Name" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} />
            <input placeholder="Last Name" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} />
            <input placeholder="Phone" value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})} />
            <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />

            {!editingUser && (
              <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
            )}

            <label>
              <input type="checkbox"
                checked={form.is_admin}
                onChange={e => setForm({...form, is_admin: e.target.checked})}
              />
              Admin
            </label>

            <div style={{display:"flex", gap:"10px"}}>
              <button onClick={saveUser} style={styles.primaryBtn}>Save</button>
              <button onClick={() => setShowModal(false)} style={styles.secondaryBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showOTPModal && (
        <div style={styles.overlay}>
            <div style={styles.modal}>
            <h3>🔐 Reset Password</h3>

            {!otpVerified ? (
                <>
                <input
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                />
                <button onClick={verifyOTP}>Verify OTP</button>
                </>
            ) : (
                <>
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                />
                <button onClick={resetPassword}>Update Password</button>
                </>
            )}

            <button onClick={() => setShowOTPModal(false)}>Cancel</button>
            </div>
        </div>
        )}

    </div>
  );
}

//////////////////////////////////////////////////
//  STYLES (PRO LEVEL)
//////////////////////////////////////////////////

const styles = {
  layout: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial"
  },

  sidebar: {
    width: "220px",
    background: "#111",
    color: "#fff",
    padding: "20px"
  },

  navItem: {
    padding: "10px",
    cursor: "pointer",
    borderRadius: "6px",
    marginBottom: "5px"
  },

  active: {
    background: "#00c6ff"
  },

  container: {
    flex: 1,
    padding: "25px",
    background: "#f5f7fa"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },

  search: {
    padding: "10px",
    width: "300px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "20px"
  },

  tableWrapper: {
    background: "#fff",
    borderRadius: "10px",
    padding: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  primaryBtn: {
    background: "#00c6ff",
    color: "#fff",
    padding: "8px 15px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  secondaryBtn: {
    background: "#ccc",
    padding: "8px 15px",
    border: "none",
    borderRadius: "6px"
  },

  editBtn: {
    marginRight: "5px",
    padding: "5px 10px",
    background: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "5px"
  },

  deleteBtn: {
    padding: "5px 10px",
    background: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "5px"
  },

  adminTag: {
    background: "#4caf50",
    color: "#fff",
    padding: "3px 8px",
    borderRadius: "5px"
  },

  userTag: {
    background: "#999",
    color: "#fff",
    padding: "3px 8px",
    borderRadius: "5px"
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)"
  },

  modal: {
    background: "#fff",
    padding: "20px",
    margin: "80px auto",
    width: "320px",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.2)"
  }
};

export default AdminUsers;