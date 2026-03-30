import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminNotifications() {

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  //////////////////////////////////////////////////
  // FETCH USERS (UNCHANGED)
  //////////////////////////////////////////////////
  useEffect(() => {
    API.get("admin/users/")
      .then(res => setUsers(res.data));
  }, []);

  //////////////////////////////////////////////////
  // SELECT USER (UNCHANGED)
  //////////////////////////////////////////////////
  const toggleUser = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(u => u !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  //////////////////////////////////////////////////
  // SELECT ALL (UNCHANGED)
  //////////////////////////////////////////////////
  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(users.map(u => u.id));
      setSelectAll(true);
    }
  };

  //////////////////////////////////////////////////
  // SEND (UNCHANGED)
  //////////////////////////////////////////////////
  const sendNotifications = () => {

    if (!message) {
      alert("Enter message");
      return;
    }

    if (selected.length === 0) {
      alert("Select users");
      return;
    }

    API.post("admin/notifications/send/", {
      users: selected,
      message: message
    })
    .then(res => {
      alert(res.data.message);
      setMessage("");
      setSelected([]);
      setSelectAll(false);
    })
    .catch(() => {
      alert("Error sending notifications");
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
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-users"}>Users</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-stations"}>Stations</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-chargers"}>Chargers</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-bookings"}>Bookings</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-vehicles"}>Vehicles</div>
        <div style={{...styles.navItem, ...styles.active}}>Notifications</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/dashboard"}>ChargeSence Home</div>
        <div style={{ marginTop: "auto" }}>
          <div
            style={{ ...styles.navItem, background: "#ff5252", color: "#fff" }}
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              window.location.href = "/";
            }}
          >
             Logout
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.container}>

        <h1 style={styles.title}>Send Notifications</h1>

        {/* MESSAGE CARD */}
        <div style={styles.card}>
          <p style={styles.label}>Message</p>

          <textarea
            placeholder="Enter message..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            style={styles.textarea}
          />

          <button onClick={sendNotifications} style={styles.primaryBtn}>
            🚀 Send SMS
          </button>
        </div>

        {/* SELECT ALL */}
        <div style={styles.selectAll}>
          <label>
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />
            Select All Users
          </label>
        </div>

        {/* USERS TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Select</th>
                <th>Username</th>
                <th>Phone</th>
              </tr>
            </thead>

            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(u.id)}
                      onChange={()=>toggleUser(u.id)}
                    />
                  </td>
                  <td>{u.username}</td>
                  <td>{u.phone_number}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}

//////////////////////////////////////////////////
// ADMIN DESIGN SYSTEM (FINAL)
//////////////////////////////////////////////////

const styles = {

  layout:{display:"flex",height:"100vh",fontFamily:"Segoe UI"},

  sidebar:{
    width:"240px",
    background:"#0f172a",
    color:"#fff",
    padding:"20px"
  },

  logo:{marginBottom:"30px"},

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

  title:{
    marginBottom:"20px"
  },

  card:{
    background:"#fff",
    padding:"20px",
    borderRadius:"16px",
    boxShadow:"0 8px 25px rgba(0,0,0,0.08)",
    marginBottom:"20px"
  },

  label:{
    fontSize:"13px",
    opacity:0.7,
    marginBottom:"5px"
  },

  textarea:{
    width:"98%",
    height:"120px",
    padding:"12px",
    borderRadius:"10px",
    border:"1px solid #ddd",
    marginBottom:"10px",
    resize:"none"
  },

  primaryBtn:{
    background:"linear-gradient(135deg,#00e676,#00c6ff)",
    border:"none",
    padding:"12px",
    borderRadius:"10px",
    fontWeight:"bold",
    width:"100%"
  },

  selectAll:{
    marginBottom:"10px"
  },

  tableWrapper:{
    background:"#fff",
    borderRadius:"16px",
    padding:"15px",
    boxShadow:"0 8px 25px rgba(0,0,0,0.08)"
  },

  table:{
    width:"100%",
    borderCollapse:"collapse"
  }
};

export default AdminNotifications;