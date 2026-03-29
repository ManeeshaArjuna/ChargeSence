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

  // OTP LOGIC (UNCHANGED)
  const sendOTP = (user) => {
    setSelectedUser(user);

    API.post("admin/password/send-otp/", { user_id: user.id })
      .then(() => {
        alert("OTP sent to user");
        setShowOTPModal(true);
      });
  };

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
        <h2 style={styles.logo}>⚡ Admin</h2>

        <div style={styles.navItem} onClick={()=>window.location.href="/admin-dashboard"}>Dashboard</div>
        <div style={{...styles.navItem, ...styles.active}}>Users</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-stations"}>Stations</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-chargers"}>Chargers</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-bookings"}>Bookings</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-vehicles"}>Vehicles</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-notifications"}>Notifications</div>
      </div>

      {/* MAIN */}
      <div style={styles.container}>

        <div style={styles.header}>
          <h1>User Management</h1>
          <button onClick={openCreate} style={styles.primaryBtn}>+ Add User</button>
        </div>

        <input
          placeholder="🔍 Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />

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
                    <button onClick={() => openEdit(u)} style={styles.editBtn}>Edit</button>
                    <button onClick={() => sendOTP(u)} style={styles.secondaryBtn}>Reset</button>
                    <button onClick={() => deleteUser(u.id)} style={styles.deleteBtn}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODALS (UNCHANGED LOGIC, ONLY STYLE) */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>{editingUser ? "Edit User" : "Create User"}</h3>

            <input style={styles.input} placeholder="Username" value={form.username} onChange={e => setForm({...form, username: e.target.value})}/>
            <input style={styles.input} placeholder="First Name" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}/>
            <input style={styles.input} placeholder="Last Name" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}/>
            <input style={styles.input} placeholder="Phone Number" value={form.phone_number} onChange={e => setForm({...form, phone_number: e.target.value})}/>
            <input style={styles.input} placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>

            {!editingUser && (
              <input style={styles.input} type="password" placeholder="Password" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}/>
            )}

            <label>
              <input type="checkbox"
                checked={form.is_admin}
                onChange={e => setForm({...form, is_admin: e.target.checked})}/>
              Admin
            </label>

            <button style={styles.primaryBtn} onClick={saveUser}>Save</button>
            <button style={styles.secondaryBtn} onClick={()=>setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showOTPModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>🔐 Reset Password</h3>

            {!otpVerified ? (
              <>
                <input style={styles.input} value={otp} onChange={e => setOtp(e.target.value)} />
                <button style={styles.primaryBtn} onClick={verifyOTP}>Verify OTP</button>
              </>
            ) : (
              <>
                <input style={styles.input} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <button style={styles.primaryBtn} onClick={resetPassword}>Update Password</button>
              </>
            )}

            <button style={styles.secondaryBtn} onClick={()=>setShowOTPModal(false)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

//////////////////////////////////////////////////
// STYLES (ONLY CHANGED PART)
//////////////////////////////////////////////////

const styles = {
  layout: { display:"flex", height:"100vh", fontFamily:"Segoe UI" },

  sidebar:{
    width:"240px",
    background:"#0f172a",
    color:"#fff",
    padding:"20px"
  },

  logo:{ marginBottom:"30px" },

  navItem:{
    padding:"12px",
    borderRadius:"10px",
    marginBottom:"8px",
    cursor:"pointer"
  },

  active:{
    background:"linear-gradient(135deg,#00e676,#00c6ff)",
    color:"#000",
    fontWeight:"bold"
  },

  container:{
    flex:1,
    padding:"25px",
    background:"#f1f5f9"
  },

  header:{
    display:"flex",
    justifyContent:"space-between",
    marginBottom:"20px"
  },

  search:{
    padding:"12px",
    borderRadius:"10px",
    border:"1px solid #ddd",
    marginBottom:"20px",
    width:"300px"
  },

  tableWrapper:{
    background:"#fff",
    borderRadius:"16px",
    padding:"15px",
    boxShadow:"0 8px 25px rgba(0,0,0,0.08)"
  },

  table:{ width:"100%", borderCollapse:"collapse" },

  primaryBtn:{
    background:"linear-gradient(135deg,#00e676,#00c6ff)",
    border:"none",
    padding:"10px",
    borderRadius:"8px",
    fontWeight:"bold"
  },

  secondaryBtn:{
    marginTop:"8px",
    padding:"8px",
    borderRadius:"8px",
    border:"none",
    background:"#ddd"
  },

  editBtn:{
    background:"#00e676",
    border:"none",
    padding:"6px",
    borderRadius:"6px"
  },

  deleteBtn:{
    background:"#ff5252",
    color:"#fff",
    border:"none",
    padding:"6px",
    borderRadius:"6px"
  },

  adminTag:{ background:"#00e676", padding:"4px 8px", borderRadius:"8px" },
  userTag:{ background:"#ccc", padding:"4px 8px", borderRadius:"8px" },

  overlay:{
    position:"fixed",
    top:0,left:0,width:"100%",height:"100%",
    background:"rgba(0,0,0,0.6)",
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  },

  modal:{
    background:"#fff",
    padding:"20px",
    borderRadius:"16px",
    width:"320px",
    display:"flex",
    flexDirection:"column",
    gap:"10px"
  },

  input:{
    padding:"10px",
    borderRadius:"8px",
    border:"1px solid #ccc"
  }
};

export default AdminUsers;