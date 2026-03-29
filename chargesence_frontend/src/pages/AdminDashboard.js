import React, { useEffect, useState } from "react";
import API from "../api/api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

function AdminDashboard() {

  //////////////////////////////////////////////////
  // STATE
  //////////////////////////////////////////////////
  const [stats, setStats] = useState(null);

  //////////////////////////////////////////////////
  // FETCH DATA
  //////////////////////////////////////////////////
  useEffect(() => {
    API.get("admin/stats/")
      .then(res => setStats(res.data))
      .catch(err => {
        console.log(err);
        alert("Error loading admin stats");
      });
  }, []);

  //////////////////////////////////////////////////
  // LOADING
  //////////////////////////////////////////////////
  if (!stats) {
    return <h2 style={{ textAlign: "center" }}>Loading dashboard...</h2>;
  }

  //////////////////////////////////////////////////
  // FORMAT DATA FOR CHARTS
  //////////////////////////////////////////////////
  const bookingData = stats.bookings_per_day.map(item => ({
    day: item.date,
    bookings: item.count
  }));

  const revenueData = stats.revenue_per_day.map(item => ({
    name: item.date,
    revenue: item.total
  }));

  const chargerData = [
    { name: "Active", value: stats.active_chargers },
    { name: "Others", value: 0 }
  ];

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////
  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2>⚡ Admin</h2>
        <p>Dashboard</p>
        <p onClick={() => window.location.href = "/admin-users"} style={{cursor:"pointer"}}>Users</p>
        <p>Stations</p>
        <p>Chargers</p>
        <p>Bookings</p>
        <p>Vehicles</p>
      </div>

      {/* MAIN */}
      <div style={styles.main}>

        <h1>Admin Dashboard</h1>

        {/* STATS */}
        <div style={styles.stats}>
          <div style={styles.card}>👥 Users: {stats.total_users}</div>
          <div style={styles.card}>📦 Bookings: {stats.total_bookings}</div>
          <div style={styles.card}>💰 Revenue: LKR {stats.total_revenue}</div>
          <div style={styles.card}>🔌 Chargers: {stats.active_chargers}</div>
        </div>

        {/* CHARTS */}
        <div style={styles.charts}>

          {/* BOOKINGS LINE */}
          <div style={styles.chartBox}>
            <h3>Bookings Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* REVENUE BAR */}
          <div style={styles.chartBox}>
            <h3>Revenue</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CHARGER PIE */}
          <div style={styles.chartBox}>
            <h3>Charger Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chargerData}
                  dataKey="value"
                  outerRadius={90}
                  fill="#8884d8"
                  label
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </div>
  );
}

//////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial",
  },

  sidebar: {
    width: "220px",
    background: "#111",
    color: "#fff",
    padding: "20px",
  },

  main: {
    flex: 1,
    padding: "20px",
    background: "#f5f7fa",
  },

  stats: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },

  card: {
    flex: 1,
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },

  charts: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
  },

  chartBox: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
  },
};

export default AdminDashboard;