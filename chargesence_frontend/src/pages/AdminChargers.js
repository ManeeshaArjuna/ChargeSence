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
  // FETCH
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
  // MODAL
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
  // SAVE
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
  // DELETE
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
        <h2 style={{marginBottom:"30px"}}>⚡ Admin</h2>

        <div style={styles.navItem}>
          <p onClick={()=>window.location.href="/admin-dashboard"}>Dashboard</p>
        </div>

        <div style={styles.navItem}>
          <p onClick={()=>window.location.href="/admin-users"}>Users</p>
        </div>

        <div style={styles.navItem}>
          <p onClick={()=>window.location.href="/admin-stations"}>Stations</p>
        </div>

        <div style={{...styles.navItem, ...styles.active}}>Chargers</div>

        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-bookings"}>Bookings</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-vehicles"}>Vehicles</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-notifications"}>Notifications</p></div>
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
                <th>Power (kW)</th>
                <th>Cost (Rs/kWh)</th>
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
                  <td>{c.power_kw}</td>
                  <td>{c.unit_cost}</td>
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

            {/* STATION */}
            <select
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

            {/* TYPE */}
            <select value={form.charger_type} onChange={e=>setForm({...form, charger_type:e.target.value})}>
              <option value="L2">L2</option>
              <option value="L3">L3 Fast</option>
            </select>

            {/* CONNECTOR */}
            <select value={form.connector_type} onChange={e=>setForm({...form, connector_type:e.target.value})}>
              <option value="TYPE1">Type1</option>
              <option value="TYPE2">Type2</option>
              <option value="CCS">CCS</option>
              <option value="CCS2">CCS2</option>
              <option value="CHADEMO">CHAdeMO</option>
              <option value="GBT">GBT</option>
            </select>

            <input placeholder="Power (kW)" value={form.power_kw} onChange={e=>setForm({...form, power_kw:e.target.value})}/>
            <input placeholder="Cost per kWh" value={form.unit_cost} onChange={e=>setForm({...form, unit_cost:e.target.value})}/>

            <label>
              <input
                type="checkbox"
                checked={form.is_available}
                onChange={e=>setForm({...form, is_available:e.target.checked})}
              />
              Available
            </label>

            <div style={{display:"flex", gap:"10px"}}>
              <button onClick={saveCharger} style={styles.primaryBtn}>Save</button>
              <button onClick={()=>setShowModal(false)} style={styles.secondaryBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

//////////////////////////////////////////////////
// 🎨 STYLES
//////////////////////////////////////////////////

const styles = {
  layout: { display:"flex", height:"100vh", fontFamily:"Arial" },

  sidebar:{ width:"220px", background:"#111", color:"#fff", padding:"20px" },

  navItem:{ padding:"10px", borderRadius:"6px", marginBottom:"5px", cursor:"pointer" },

  active:{ background:"#00c6ff" },

  container:{ flex:1, padding:"25px", background:"#f5f7fa" },

  header:{ display:"flex", justifyContent:"space-between", marginBottom:"20px" },

  search:{ padding:"10px", width:"300px", borderRadius:"8px", border:"1px solid #ccc", marginBottom:"20px" },

  tableWrapper:{ background:"#fff", borderRadius:"10px", padding:"15px", boxShadow:"0 2px 10px rgba(0,0,0,0.05)" },

  table:{ width:"100%", borderCollapse:"collapse" },

  primaryBtn:{ background:"#00c6ff", color:"#fff", padding:"8px 15px", border:"none", borderRadius:"6px" },

  secondaryBtn:{ background:"#ccc", padding:"8px 15px", border:"none", borderRadius:"6px" },

  editBtn:{ background:"#4caf50", color:"#fff", padding:"5px 10px", borderRadius:"5px", marginRight:"5px" },

  deleteBtn:{ background:"#f44336", color:"#fff", padding:"5px 10px", borderRadius:"5px" },

  activeTag:{ background:"#4caf50", color:"#fff", padding:"3px 8px", borderRadius:"5px" },

  inactiveTag:{ background:"#999", color:"#fff", padding:"3px 8px", borderRadius:"5px" },

  overlay:{ position:"fixed", top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.5)" },

  modal:{
    background:"#fff",
    padding:"20px",
    margin:"80px auto",
    width:"320px",
    borderRadius:"10px",
    display:"flex",
    flexDirection:"column",
    gap:"10px"
  }
};

export default AdminChargers;