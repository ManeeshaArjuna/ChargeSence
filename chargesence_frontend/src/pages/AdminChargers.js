import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminChargers() {

  const [chargers, setChargers] = useState([]);
  const [stations, setStations] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    station: "",
    charger_type: "L2",
    connector_type: "TYPE2",
    power_kw: "",
    unit_cost: "",
    is_available: true
  });

  //////////////////////////////////////////////////
  // FETCH (UNCHANGED)
  //////////////////////////////////////////////////
  const fetchData = () => {
    API.get(`admin/chargers/?search=${search}`)
      .then(res => setChargers(res.data));

    API.get("admin/stations/")
      .then(res => setStations(res.data));
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
      station: "",
      charger_type: "L2",
      connector_type: "TYPE2",
      power_kw: "",
      unit_cost: "",
      is_available: true
    });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      station: c.station_id,
      charger_type: c.charger_type,
      connector_type: c.connector_type,
      power_kw: c.power_kw,
      unit_cost: c.unit_cost,
      is_available: c.is_available
    });
    setShowModal(true);
  };

  //////////////////////////////////////////////////
  // SAVE (UNCHANGED)
  //////////////////////////////////////////////////
  const saveCharger = () => {
    if (editing) {
      API.put(`admin/chargers/${editing.id}/`, form)
        .then(() => {
          alert("Updated");
          setShowModal(false);
          fetchData();
        });
    } else {
      API.post("admin/chargers/create/", form)
        .then(() => {
          alert("Created");
          setShowModal(false);
          fetchData();
        });
    }
  };

  //////////////////////////////////////////////////
  // DELETE (UNCHANGED)
  //////////////////////////////////////////////////
  const deleteCharger = (id) => {
    if (!window.confirm("Delete charger?")) return;

    API.delete(`admin/chargers/${id}/delete/`)
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
        <div style={{...styles.navItem, ...styles.active}}>Chargers</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-bookings"}>Bookings</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-vehicles"}>Vehicles</div>
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
          <h1>Charger Management</h1>
          <button onClick={openCreate} style={styles.primaryBtn}>
            + Add Charger
          </button>
        </div>

        {/* SEARCH */}
        <input
          placeholder="🔍 Search chargers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />

        {/* TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Station</th>
                <th>Type</th>
                <th>Connector</th>
                <th>Power</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {chargers.map(c => (
                <tr key={c.id}>
                  <td>{c.station_name}</td>
                  <td>{c.charger_type}</td>
                  <td>{c.connector_type}</td>
                  <td>{c.power_kw} kW</td>
                  <td>Rs {c.unit_cost}</td>

                  <td>
                    <span style={c.is_available ? styles.activeTag : styles.inactiveTag}>
                      {c.is_available ? "Available" : "Maintenance"}
                    </span>
                  </td>

                  <td>
                    <button onClick={()=>openEdit(c)} style={styles.editBtn}>Edit</button>
                    <button onClick={()=>deleteCharger(c.id)} style={styles.deleteBtn}>Delete</button>
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
            <h3>{editing ? "Edit Charger" : "Create Charger"}</h3>

            <select style={styles.input}
              value={form.station}
              onChange={e=>setForm({...form, station:e.target.value})}
            >
              <option value="">Select Station</option>
              {stations.map(s => (
                <option key={s.id} value={s.id}>
                  {s.station_name}
                </option>
              ))}
            </select>

            <select style={styles.input}
              value={form.charger_type}
              onChange={e=>setForm({...form, charger_type:e.target.value})}
            >
              <option value="L2">L2</option>
              <option value="L3">L3 Fast</option>
            </select>

            <select style={styles.input}
              value={form.connector_type}
              onChange={e=>setForm({...form, connector_type:e.target.value})}
            >
              <option value="TYPE1">Type1</option>
              <option value="TYPE2">Type2</option>
              <option value="CCS">CCS</option>
              <option value="CCS2">CCS2</option>
              <option value="CHADEMO">CHAdeMO</option>
              <option value="GBT">GBT</option>
            </select>

            <input style={styles.input}
              placeholder="Power (kW)"
              value={form.power_kw}
              onChange={e=>setForm({...form, power_kw:e.target.value})}
            />

            <input style={styles.input}
              placeholder="Cost per kWh"
              value={form.unit_cost}
              onChange={e=>setForm({...form, unit_cost:e.target.value})}
            />

            <label>
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={e=>setForm({...form, is_available:e.target.checked})}
              />
              Available
            </label>

            <button onClick={saveCharger} style={styles.primaryBtn}>Save</button>
            <button onClick={()=>setShowModal(false)} style={styles.secondaryBtn}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

//////////////////////////////////////////////////
// ADMIN DESIGN SYSTEM (CONSISTENT)
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

  activeTag:{
    background:"#00e676",
    color:"#000",
    padding:"4px 8px",
    borderRadius:"8px",
    fontWeight:"bold"
  },

  inactiveTag:{
    background:"#ff5252",
    color:"#fff",
    padding:"4px 8px",
    borderRadius:"8px",
    fontWeight:"bold"
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

export default AdminChargers;