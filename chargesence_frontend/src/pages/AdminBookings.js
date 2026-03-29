import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminBookings() {

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const [chargingRevenue, setChargingRevenue] = useState(0);
  const [bookingRevenue, setBookingRevenue] = useState(0);

  //////////////////////////////////////////////////
  // FETCH
  //////////////////////////////////////////////////
  const fetchBookings = () => {
    API.get(`admin/bookings/?search=${search}`)
      .then(res => {
        let data = res.data.bookings;

        if (filter) {
          data = data.filter(b => b.status === filter);
        }

        setBookings(data);
        setChargingRevenue(res.data.charging_revenue);
        setBookingRevenue(res.data.booking_revenue);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, [search, filter]);

  //////////////////////////////////////////////////
  // CANCEL ONLY
  //////////////////////////////////////////////////
  const cancelBooking = (id) => {
    API.put(`admin/bookings/${id}/`, { status: "CANCELLED" })
      .then(() => {
        alert("Cancelled");
        fetchBookings();
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
        <div style={{...styles.navItem, ...styles.active}}>Bookings</div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-vehicles"}>Vehicles</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-notifications"}>Notifications</p></div>
      </div>

      {/* MAIN */}
      <div style={styles.container}>

        <h1>Booking Management</h1>

        {/* 🔥 REVENUE CARDS */}
        <div style={styles.cards}>
          <div style={styles.card}>
            <h3>Charging Revenue</h3>
            <p>Rs. {chargingRevenue}</p>
          </div>

          <div style={styles.card}>
            <h3>Booking Fee Revenue</h3>
            <p>Rs. {bookingRevenue}</p>
          </div>
        </div>

        {/* SEARCH */}
        <div style={{display:"flex", gap:"10px", marginBottom:"20px"}}>
          <input
            placeholder="🔍 Search by user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.search}
          />

          <select value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* TABLE */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Station</th>
                <th>Charger</th>
                <th>Date</th>
                <th>Time</th>
                <th>Booking Fee</th>
                <th>Charging Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>{b.user}</td>
                  <td>{b.station}</td>
                  <td>#{b.charger}</td>
                  <td>{b.date}</td>
                  <td>{b.start_time} - {b.end_time}</td>

                  <td>Rs. {b.booking_fee}</td>
                  <td>Rs. {b.charging_amount}</td>

                  <td>
                    <span style={
                      b.status === "COMPLETED" ? styles.green :
                      b.status === "CANCELLED" ? styles.red :
                      styles.gray
                    }>
                      {b.status}
                    </span>
                  </td>

                  <td>
                    {b.status === "PENDING" ? (
                      <button
                        onClick={()=>cancelBooking(b.id)}
                        style={styles.deleteBtn}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button style={styles.noActionBtn} disabled>
                        No Action
                      </button>
                    )}
                  </td>

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

  cards:{
    display:"flex",
    gap:"20px",
    marginBottom:"20px"
  },

  card:{
    background:"#fff",
    padding:"20px",
    borderRadius:"10px",
    boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
    minWidth:"200px"
  },

  search:{padding:"10px",borderRadius:"8px",border:"1px solid #ccc"},

  tableWrapper:{background:"#fff",borderRadius:"10px",padding:"15px"},
  table:{width:"100%"},

  deleteBtn:{background:"#f44336",color:"#fff",padding:"5px 10px",borderRadius:"5px"},

  noActionBtn:{
    background:"#e0e0e0",
    color:"#666",
    padding:"5px 10px",
    borderRadius:"5px",
    border:"none",
    cursor:"not-allowed"
  },

  green:{background:"#4caf50",color:"#fff",padding:"4px 8px",borderRadius:"5px"},
  red:{background:"#f44336",color:"#fff",padding:"4px 8px",borderRadius:"5px"},
  gray:{background:"#999",color:"#fff",padding:"4px 8px",borderRadius:"5px"}
};

export default AdminBookings;