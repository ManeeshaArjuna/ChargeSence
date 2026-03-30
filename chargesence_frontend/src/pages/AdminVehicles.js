import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminVehicles() {

  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    user: "",
    manufacturer: "",
    model: "",
    battery: "",
    efficiency: "",
    connector_type: "TYPE2"
  });

  //////////////////////////////////////////////////
  // FETCH (UNCHANGED)
  //////////////////////////////////////////////////
  const fetchData = () => {
    API.get(`admin/vehicles/?search=${search}`)
      .then(res => setVehicles(res.data));

    API.get("admin/users/")
      .then(res => setUsers(res.data));
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  //////////////////////////////////////////////////
  // MODAL (UNCHANGED)
  //////////////////////////////////////////////////
  const openCreate = () => {
    setEditing(null);
    setForm({
      user: "",
      manufacturer: "",
      model: "",
      battery: "",
      efficiency: "",
      connector_type: "TYPE2"
    });
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      user: v.user_id,
      manufacturer: v.manufacturer,
      model: v.model,
      battery: v.battery,
      efficiency: v.efficiency,
      connector_type: v.connector_type
    });
    setShowModal(true);
  };

  //////////////////////////////////////////////////
  // SAVE (UNCHANGED)
  //////////////////////////////////////////////////
  const saveVehicle = () => {

    if (!form.user) {
        alert("Please select a user");
        return;
    }

    if (!form.manufacturer || !form.model) {
        alert("Please fill vehicle details");
        return;
    }

    const payload = {
        user: form.user,
        manufacturer: form.manufacturer,
        model: form.model,
        battery_capacity_kwh: form.battery,
        efficiency_wh_per_km: form.efficiency,
        connector_type: form.connector_type
    };

    if (editing) {
        API.put(`admin/vehicles/${editing.id}/`, payload)
        .then(() => {
            alert("Updated");
            setShowModal(false);
            fetchData();
        });
    } else {
        API.post("admin/vehicles/create/", payload)
        .then(() => {
            alert("Created");
            setShowModal(false);
            fetchData();
        })
        .catch(err => {
            console.log("ERROR:", err.response);
            alert(JSON.stringify(err.response?.data));
        });
    }
  };

  //////////////////////////////////////////////////
  // DELETE (UNCHANGED)
  //////////////////////////////////////////////////
  const deleteVehicle = (id) => {
    if (!window.confirm("Delete vehicle?")) return;

    API.delete(`admin/vehicles/${id}/delete/`)
      .then(() => fetchData());
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
        <div style={{...styles.navItem, ...styles.active}}>Vehicles</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-notifications"}>Notifications</div>
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

        <div style={styles.header}>
          <h1>Vehicle Management</h1>
          <button onClick={openCreate} style={styles.primaryBtn}>
            + Add Vehicle
          </button>
        </div>

        {/* SEARCH */}
        <input
          placeholder="🔍 Search vehicles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />

        {/* TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Vehicle</th>
                <th>Battery</th>
                <th>Efficiency</th>
                <th>Connector</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td>{v.user}</td>
                  <td>{v.manufacturer} {v.model}</td>
                  <td>{v.battery} kWh</td>
                  <td>{v.efficiency}</td>
                  <td>{v.connector_type}</td>

                  <td>
                    <button onClick={()=>openEdit(v)} style={styles.editBtn}>Edit</button>
                    <button onClick={()=>deleteVehicle(v.id)} style={styles.deleteBtn}>Delete</button>
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
            <h3>{editing ? "Edit Vehicle" : "Create Vehicle"}</h3>

            <select
              style={styles.input}
              value={form.user}
              onChange={e => setForm({
                ...form,
                user: parseInt(e.target.value)
              })}
            >
              <option value="">Select User</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>

            <input style={styles.input} placeholder="Manufacturer" value={form.manufacturer} onChange={e=>setForm({...form, manufacturer:e.target.value})}/>
            <input style={styles.input} placeholder="Model" value={form.model} onChange={e=>setForm({...form, model:e.target.value})}/>
            <input style={styles.input} placeholder="Battery (kWh)" value={form.battery} onChange={e=>setForm({...form, battery:e.target.value})}/>
            <input style={styles.input} placeholder="Efficiency (Wh/km)" value={form.efficiency} onChange={e=>setForm({...form, efficiency:e.target.value})}/>

            <select style={styles.input} value={form.connector_type} onChange={e=>setForm({...form, connector_type:e.target.value})}>
              <option value="TYPE1">Type1</option>
              <option value="TYPE2">Type2</option>
              <option value="CCS">CCS</option>
              <option value="CCS2">CCS2</option>
              <option value="CHADEMO">CHAdeMO</option>
            </select>

            <button onClick={saveVehicle} style={styles.primaryBtn}>Save</button>
            <button onClick={()=>setShowModal(false)} style={styles.secondaryBtn}>Cancel</button>

          </div>
        </div>
      )}

    </div>
  );
}

//////////////////////////////////////////////////
//  ADMIN DESIGN SYSTEM
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

  table:{width:"100%",borderCollapse:"collapse"},

  primaryBtn:{
    background:"linear-gradient(135deg,#00e676,#00c6ff)",
    border:"none",
    padding:"10px",
    borderRadius:"8px",
    fontWeight:"bold"
  },

  secondaryBtn:{
    marginTop:"8px",
    padding:"10px",
    borderRadius:"8px",
    border:"none",
    background:"#ddd"
  },

  editBtn:{
    background:"#00e676",
    border:"none",
    padding:"6px",
    borderRadius:"6px",
    marginRight:"5px"
  },

  deleteBtn:{
    background:"#ff5252",
    color:"#fff",
    border:"none",
    padding:"6px",
    borderRadius:"6px"
  },

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

export default AdminVehicles;