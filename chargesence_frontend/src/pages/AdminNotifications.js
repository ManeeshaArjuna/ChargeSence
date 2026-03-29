import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminNotifications() {

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  //////////////////////////////////////////////////
  // FETCH USERS
  //////////////////////////////////////////////////
  useEffect(() => {
    API.get("admin/users/")
      .then(res => setUsers(res.data));
  }, []);

  //////////////////////////////////////////////////
  // SELECT USER
  //////////////////////////////////////////////////
  const toggleUser = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(u => u !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  //////////////////////////////////////////////////
  // SELECT ALL
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
  // SEND
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
    .catch(err => {
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
        <h2 style={{marginBottom:"30px"}}>⚡ Admin</h2>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-dashboard"}>Dashboard</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-users"}>Users</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-stations"}>Stations</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-chargers"}>Chargers</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-bookings"}>Bookings</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-vehicles"}>Vehicles</p></div>
        <div style={{...styles.navItem, ...styles.active}}>Notifications</div>
      </div>

      {/* MAIN */}
      <div style={styles.container}>

        <h1>Send Notifications</h1>

        {/* MESSAGE */}
        <textarea
          placeholder="Enter message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          style={styles.textarea}
        />

        <button onClick={sendNotifications} style={styles.primaryBtn}>
          Send SMS
        </button>

        {/* SELECT ALL */}
        <div style={{marginTop:"20px"}}>
          <label>
            <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
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
// STYLES
//////////////////////////////////////////////////

const styles = {
  layout:{display:"flex",height:"100vh"},
  sidebar:{width:"220px",background:"#111",color:"#fff",padding:"20px"},
  navItem:{padding:"10px",borderRadius:"6px",marginBottom:"5px",cursor:"pointer"},
  active:{background:"#00c6ff"},
  container:{flex:1,padding:"25px",background:"#f5f7fa"},
  textarea:{width:"100%",height:"100px",padding:"10px",marginBottom:"10px"},
  primaryBtn:{background:"#00c6ff",color:"#fff",padding:"10px 15px"},
  tableWrapper:{background:"#fff",borderRadius:"10px",padding:"15px",marginTop:"20px"},
  table:{width:"100%"}
};

export default AdminNotifications;