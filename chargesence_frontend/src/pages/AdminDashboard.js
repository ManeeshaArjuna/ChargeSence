import React, { useEffect, useState } from "react";
import API from "../api/api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

function AdminDashboard() {

  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("admin/stats/")
      .then(res => setStats(res.data))
      .catch(() => alert("Error loading admin stats"));
  }, []);

  if (!stats) return <h2 style={{textAlign:"center"}}>Loading...</h2>;

  //////////////////////////////////////////////////
  // DATA
  //////////////////////////////////////////////////
  const bookingData = stats.bookings_per_day.map(i => ({
    day: i.date,
    bookings: i.count
  }));

  const revenueData = stats.revenue_per_day.map(i => ({
    name: i.date,
    revenue: i.total
  }));

  const chargerData = [
    { name: "Active", value: stats.active_chargers },
    { name: "Maintenance", value: stats.maintenance_chargers }
  ];

  const bookingStatusData = [
    { name: "Completed", value: stats.completed_bookings },
    { name: "Cancelled", value: stats.cancelled_bookings }
  ];

  const revenueSplit = [
    { name: "Charging", value: stats.charging_revenue },
    { name: "Booking Fees", value: stats.booking_revenue }
  ];

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////
  return (
    <div style={styles.layout}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={{marginBottom:"30px"}}>⚡ Admin</h2>

        <div style={{...styles.navItem, ...styles.active}}>Dashboard</div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-users"}>Users</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-stations"}>Stations</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-chargers"}>Chargers</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-bookings"}>Bookings</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-vehicles"}>Vehicles</p></div>
        <div style={styles.navItem}><p onClick={()=>window.location.href="/admin-notifications"}>Notifications</p></div>
      </div>

      {/* MAIN */}
      <div style={styles.container}>

        <h1>Admin Dashboard</h1>

        {/* CARDS */}
        <div style={styles.cards}>
          <div style={styles.card}><h4>👥 Users</h4><p>{stats.total_users}</p></div>
          <div style={styles.card}><h4>📦 Bookings</h4><p>{stats.total_bookings}</p></div>
          <div style={styles.card}><h4>💰 Charging Revenue</h4><p>LKR {stats.total_revenue}</p></div>
          <div style={styles.card}><h4>🔌 Active Chargers</h4><p>{stats.active_chargers}</p></div>
        </div>

        {/* CHARTS */}
        <div style={styles.charts}>

          {/* BOOKINGS TREND */}
          <div style={styles.chartBox}>
            <h3>Bookings Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line dataKey="bookings" stroke="#00c6ff" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* REVENUE TREND */}
          <div style={styles.chartBox}>
            <h3>Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CHARGER STATUS */}
          <div style={styles.chartBox}>
            <h3>Charger Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chargerData} dataKey="value" outerRadius={90} label>
                  <Cell fill="#4caf50" />
                  <Cell fill="#f44336" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* BOOKING STATUS */}
          <div style={styles.chartBox}>
            <h3>Booking Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={bookingStatusData} dataKey="value" outerRadius={90} label>
                  <Cell fill="#4caf50" />
                  <Cell fill="#f44336" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* REVENUE SPLIT */}
          <div style={styles.chartBox}>
            <h3>Revenue Split</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={revenueSplit} dataKey="value" outerRadius={90} label>
                  <Cell fill="#00c6ff" />
                  <Cell fill="#ff9800" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </div>
  );
}

const styles = {
  layout:{display:"flex",height:"100vh"},
  sidebar:{width:"220px",background:"#111",color:"#fff",padding:"20px"},
  navItem:{padding:"10px",borderRadius:"6px",marginBottom:"5px",cursor:"pointer"},
  active:{background:"#00c6ff"},
  container:{flex:1,padding:"25px",background:"#f5f7fa"},
  cards:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"15px",marginBottom:"25px"},
  card:{background:"#fff",padding:"20px",borderRadius:"10px"},
  charts:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"20px"},
  chartBox:{background:"#fff",padding:"15px",borderRadius:"10px"}
};

export default AdminDashboard;