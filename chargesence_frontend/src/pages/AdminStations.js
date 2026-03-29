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
  // FETCH
  //////////////////////////////////////////////////
  const fetchStations = () => {
    API.get(`admin/stations/?search=${search}`)
      .then(res => setStations(res.data));
  };

  useEffect(() => {
    fetchStations();
  }, [search]);

  //////////////////////////////////////////////////
  // MODAL
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
  // SAVE
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
  // DELETE
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
        <h2 style={{marginBottom:"30px"}}>⚡ Admin</h2>

        <div style={styles.navItem}>
          <p onClick={() => window.location.href="/admin-dashboard"} style={{cursor:"pointer"}}>Dashboard</p>
        </div>

        <div style={styles.navItem}>
          <p onClick={() => window.location.href="/admin-users"} style={{cursor:"pointer"}}>Users</p>
        </div>

        <div style={{...styles.navItem, ...styles.active}}>
          <p onClick={() => window.location.href="/admin-stations"} style={{cursor:"pointer"}}>Stations</p>
        </div>

        <div style={styles.navItem}>
          <p onClick={() => window.location.href="/admin-chargers"} style={{cursor:"pointer"}}>Chargers</p>
        </div>
        <div style={styles.navItem}>
          <p onClick={() => window.location.href="/admin-bookings"} style={{cursor:"pointer"}}>Bookings</p>
        </div>
        <div style={styles.navItem}>
          <p onClick={() => window.location.href="/admin-vehicles"} style={{cursor:"pointer"}}>Vehicles</p>
        </div>
        <div style={styles.navItem}>
          <p onClick={() => window.location.href="/admin-notifications"} style={{cursor:"pointer"}}>Notifications</p>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.container}>

        <div style={styles.header}>
          <h1>Charging Stations</h1>

          <button onClick={openCreate} style={styles.primaryBtn}>
            + Add Station
          </button>
        </div>

        {/* SEARCH */}
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
                <th>Latitude</th>
                <th>Longitude</th>
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
                        View Map
                      </a>
                    ) : "-"}
                  </td>
                  <td>{s.lat}</td>
                  <td>{s.lng}</td>
                  <td>
                    <button onClick={() => openEdit(s)} style={styles.editBtn}>
                      Edit
                    </button>
                    <button onClick={() => deleteStation(s.id)} style={styles.deleteBtn}>
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
            <h3>{editing ? "Edit Station" : "Create Station"}</h3>

            <input style={styles.input} placeholder="Station Name" value={form.station_name} onChange={e=>setForm({...form, station_name:e.target.value})}/>
            <input style={styles.input} placeholder="Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})}/>
            <input style={styles.input} placeholder="Phone" value={form.telephone} onChange={e=>setForm({...form, telephone:e.target.value})}/>
            <input style={styles.input} placeholder="Google Map Link" value={form.google_map_link} onChange={e=>setForm({...form, google_map_link:e.target.value})}/>
            <input style={styles.input} placeholder="Latitude" value={form.lat} onChange={e=>setForm({...form, lat:e.target.value})}/>
            <input style={styles.input} placeholder="Longitude" value={form.lng} onChange={e=>setForm({...form, lng:e.target.value})}/>

            <div style={{display:"flex", gap:"10px"}}>
              <button onClick={saveStation} style={styles.primaryBtn}>Save</button>
              <button onClick={()=>setShowModal(false)} style={styles.secondaryBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

//////////////////////////////////////////////////
// 🎨 STYLES (MATCHED WITH USERS PAGE)
//////////////////////////////////////////////////

const styles = {
  layout: { display: "flex", height: "100vh", fontFamily: "Arial" },

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

  link: {
    color: "#00c6ff",
    textDecoration: "none",
    fontWeight: "bold"
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
  },

  input: {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "6px"
  }
};

export default AdminStations;