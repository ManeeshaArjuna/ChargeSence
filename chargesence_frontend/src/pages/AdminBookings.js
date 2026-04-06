import React, { useEffect, useState } from "react";
import API from "../api/api";

function AdminBookings() {

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const [chargingRevenue, setChargingRevenue] = useState(0);
  const [bookingRevenue, setBookingRevenue] = useState(0);

  //////////////////////////////////////////////////
  // FETCH (UNCHANGED)
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
  // CANCEL (UNCHANGED)
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
        <h2 style={styles.logo}>⚡ Admin</h2>

        <div style={styles.navItem} onClick={()=>window.location.href="/admin-dashboard"}>Dashboard</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-users"}>Users</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-stations"}>Stations</div>
        <div style={styles.navItem} onClick={()=>window.location.href="/admin-chargers"}>Chargers</div>
        <div style={{...styles.navItem, ...styles.active}}>Bookings</div>
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

        <h1 style={styles.title}>Booking Management</h1>

        {/* 💰 REVENUE CARDS */}
        <div style={styles.cards}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Charging Revenue</p>
            <h2 style={styles.cardValue}>Rs. {chargingRevenue}</h2>
          </div>

          <div style={styles.card}>
            <p style={styles.cardLabel}>Booking Revenue</p>
            <h2 style={styles.cardValue}>Rs. {bookingRevenue}</h2>
          </div>
        </div>

        {/* FILTER BAR */}
        <div style={styles.filterBar}>
          <input
            placeholder="🔍 Search by user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.search}
          />

          <select
            value={filter}
            onChange={e=>setFilter(e.target.value)}
            style={styles.select}
          >
            <option value="">All</option>
            <option value="PAID">Paid</option>
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
                <th>Fee</th>
                <th>Charge</th>
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

                  <td>Rs {b.booking_fee}</td>
                  <td>Rs {b.charging_amount}</td>

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
                    {b.status === "PAID" ? (
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
//  ADMIN DESIGN SYSTEM (CONSISTENT)
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

  title:{marginBottom:"20px"},

  cards:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
    gap:"15px",
    marginBottom:"20px"
  },

  card:{
    background:"#fff",
    padding:"20px",
    borderRadius:"16px",
    boxShadow:"0 8px 25px rgba(0,0,0,0.08)"
  },

  cardLabel:{
    fontSize:"13px",
    opacity:0.7
  },

  cardValue:{
    marginTop:"5px"
  },

  filterBar:{
    display:"flex",
    gap:"10px",
    marginBottom:"20px"
  },

  search:{
    padding:"12px",
    borderRadius:"10px",
    border:"1px solid #ddd",
    flex:1
  },

  select:{
    padding:"12px",
    borderRadius:"10px",
    border:"1px solid #ddd"
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
  },

  deleteBtn:{
    background:"#ff5252",
    color:"#fff",
    padding:"6px 10px",
    borderRadius:"6px",
    border:"none"
  },

  noActionBtn:{
    background:"#e0e0e0",
    color:"#666",
    padding:"6px 10px",
    borderRadius:"6px",
    border:"none",
    cursor:"not-allowed"
  },

  green:{
    background:"#00e676",
    color:"#000",
    padding:"4px 8px",
    borderRadius:"8px",
    fontWeight:"bold"
  },

  red:{
    background:"#ff5252",
    color:"#fff",
    padding:"4px 8px",
    borderRadius:"8px",
    fontWeight:"bold"
  },

  gray:{
    background:"#999",
    color:"#fff",
    padding:"4px 8px",
    borderRadius:"8px",
    fontWeight:"bold"
  }
};

export default AdminBookings;