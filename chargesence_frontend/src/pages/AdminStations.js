import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminStations() {

  const [stations, setStations] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    station_name: "",
    address: "",
    lat: "",
    lng: "",
    google_map_link: "",
    telephone: ""
  });

  //////////////////////////////////////////////////
  // FETCH (UNCHANGED)
  //////////////////////////////////////////////////
  const fetchStations = () => {
    API.get(`admin/stations/?search=${search}`)
      .then(res => setStations(res.data));
  };

  useEffect(() => {
    fetchStations();
  }, [search]);

  //////////////////////////////////////////////////
  // MODAL (UNCHANGED)
  //////////////////////////////////////////////////
  const openCreate = () => {
    setEditing(null);
    setForm({
      station_name: "",
      address: "",
      lat: "",
      lng: "",
      google_map_link: "",
      telephone: ""
    });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      station_name: s.station_name,
      address: s.address,
      lat: s.lat,
      lng: s.lng,
      google_map_link: s.google_map_link || "",
      telephone: s.telephone || ""
    });
    setShowModal(true);
  };

  //////////////////////////////////////////////////
  // SAVE (UNCHANGED)
  //////////////////////////////////////////////////
  const saveStation = () => {
    if (editing) {
      API.put(`admin/stations/${editing.id}/`, form)
        .then(() => {
          alert("Updated");
          setShowModal(false);
          fetchStations();
        });
    } else {
      API.post("admin/stations/create/", form)
        .then(() => {
          alert("Created");
          setShowModal(false);
          fetchStations();
        });
    }
  };

  //////////////////////////////////////////////////
  // DELETE (UNCHANGED)
  //////////////////////////////////////////////////
  const deleteStation = (id) => {
    if (!window.confirm("Delete station?")) return;

    API.delete(`admin/stations/${id}/delete/`)
      .then(() => fetchStations());
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
        <div style={{...styles.navItem, ...styles.active}}>Stations</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-chargers"}>Chargers</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-bookings"}>Bookings</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-vehicles"}>Vehicles</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-notifications"}>Notifications</div>
      </div>

      {/* MAIN */}
      <div style={styles.container}>

        <div style={styles.header}>
          <h1>Charging Stations</h1>
          <button onClick={openCreate} style={styles.primaryBtn}>+ Add Station</button>
        </div>

        <input
          placeholder="🔍 Search stations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.search}
        />

        {/* TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Map</th>
                <th>Lat</th>
                <th>Lng</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {stations.map(s => (
                <tr key={s.id}>
                  <td>{s.station_name}</td>
                  <td>{s.address}</td>
                  <td>{s.telephone}</td>

                  <td>
                    {s.google_map_link ? (
                      <a href={s.google_map_link} target="_blank" rel="noreferrer" style={styles.link}>
                        View
                      </a>
                    ) : "-"}
                  </td>

                  <td>{s.lat}</td>
                  <td>{s.lng}</td>

                  <td>
                    <button onClick={() => openEdit(s)} style={styles.editBtn}>Edit</button>
                    <button onClick={() => deleteStation(s.id)} style={styles.deleteBtn}>Delete</button>
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
            <h3>{editing ? "Edit Station" : "Create Station"}</h3>

            <input style={styles.input} placeholder="Station Name" value={form.station_name} onChange={e=>setForm({...form, station_name:e.target.value})}/>
            <input style={styles.input} placeholder="Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})}/>
            <input style={styles.input} placeholder="Phone" value={form.telephone} onChange={e=>setForm({...form, telephone:e.target.value})}/>
            <input style={styles.input} placeholder="Google Map Link" value={form.google_map_link} onChange={e=>setForm({...form, google_map_link:e.target.value})}/>
            <input style={styles.input} placeholder="Latitude" value={form.lat} onChange={e=>setForm({...form, lat:e.target.value})}/>
            <input style={styles.input} placeholder="Longitude" value={form.lng} onChange={e=>setForm({...form, lng:e.target.value})}/>

            <button onClick={saveStation} style={styles.primaryBtn}>Save</button>
            <button onClick={()=>setShowModal(false)} style={styles.secondaryBtn}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

//////////////////////////////////////////////////
// 🎨 ADMIN DESIGN SYSTEM (CONSISTENT)
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

  link:{
    color:"#00c6ff",
    fontWeight:"bold",
    textDecoration:"none"
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

export default AdminStations;