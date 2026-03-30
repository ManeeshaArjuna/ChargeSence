import React, { useEffect, useState } from "react";
import API from "../api/api";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

function AdminDashboard() {

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "ADMIN") {
      alert("Unauthorized access");
      window.location.href = "/dashboard";
    }
  }, []);

  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("admin/stats/")
      .then(res => setStats(res.data))
      .catch(() => alert("Error loading admin stats"));
  }, []);

  if (!stats) return <h2 style={styles.loading}>Loading Dashboard...</h2>;

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
        <h2 style={styles.logo}>⚡ Admin</h2>

        <NavItem label="Dashboard" active />
        <NavItem label="Users" link="/admin-users" />
        <NavItem label="Stations" link="/admin-stations" />
        <NavItem label="Chargers" link="/admin-chargers" />
        <NavItem label="Bookings" link="/admin-bookings" />
        <NavItem label="Vehicles" link="/admin-vehicles" />
        <NavItem label="Notifications" link="/admin-notifications" />
        <NavItem label="ChargeSence Home" link="/dashboard" />
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

        <h1 style={styles.title}>Dashboard Overview</h1>

        {/* KPI CARDS */}
        <div style={styles.cards}>
          <StatCard title="Users" value={stats.total_users} />
          <StatCard title="Bookings" value={stats.total_bookings} />
          <StatCard title="Revenue" value={`LKR ${stats.total_revenue}`} />
          <StatCard title="Active Chargers" value={stats.active_chargers} />
        </div>

        {/* CHARTS */}
        <div style={styles.charts}>

          <ChartBox title="Bookings Trend">
            <LineChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line dataKey="bookings" stroke="#00e676" />
            </LineChart>
          </ChartBox>

          <ChartBox title="Revenue Trend">
            <BarChart data={revenueData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#00c6ff" />
            </BarChart>
          </ChartBox>

          <ChartBox title="Charger Status">
            <PieChart>
              <Pie data={chargerData} dataKey="value" outerRadius={90}>
                <Cell fill="#00e676" />
                <Cell fill="#ff5252" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ChartBox>

          <ChartBox title="Booking Status">
            <PieChart>
              <Pie data={bookingStatusData} dataKey="value" outerRadius={90}>
                <Cell fill="#00e676" />
                <Cell fill="#ff5252" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ChartBox>

          <ChartBox title="Revenue Split">
            <PieChart>
              <Pie data={revenueSplit} dataKey="value" outerRadius={90}>
                <Cell fill="#00c6ff" />
                <Cell fill="#ff9800" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ChartBox>

        </div>

      </div>
    </div>
  );
}

//////////////////////////////////////////////////
// COMPONENTS
//////////////////////////////////////////////////

const NavItem = ({ label, link, active }) => (
  <div
    onClick={() => link && (window.location.href = link)}
    style={{
      ...styles.navItem,
      ...(active ? styles.activeNav : {})
    }}
  >
    {label}
  </div>
);

const StatCard = ({ title, value }) => (
  <div style={styles.card}>
    <p style={styles.cardTitle}>{title}</p>
    <h2 style={styles.cardValue}>{value}</h2>
  </div>
);

const ChartBox = ({ title, children }) => (
  <div style={styles.chartBox}>
    <h3 style={styles.chartTitle}>{title}</h3>
    <ResponsiveContainer width="100%" height={250}>
      {children}
    </ResponsiveContainer>
  </div>
);

//////////////////////////////////////////////////
// STYLES (ADMIN DESIGN SYSTEM)
//////////////////////////////////////////////////

const styles = {

  layout: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Segoe UI', sans-serif"
  },

  sidebar: {
    width: "240px",
    background: "#0f172a",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column"
  },

  logo: {
    marginBottom: "30px"
  },

  navItem: {
    padding: "12px",
    borderRadius: "10px",
    marginBottom: "8px",
    cursor: "pointer",
    transition: "0.2s"
  },

  activeNav: {
    background: "linear-gradient(135deg, #00e676, #00c6ff)",
    color: "#000",
    fontWeight: "bold"
  },

  container: {
    flex: 1,
    padding: "25px",
    background: "#f1f5f9",
    overflowY: "auto"
  },

  title: {
    marginBottom: "20px"
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
    gap: "15px",
    marginBottom: "25px"
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
  },

  cardTitle: {
    fontSize: "13px",
    opacity: 0.7
  },

  cardValue: {
    marginTop: "5px"
  },

  charts: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))",
    gap: "20px"
  },

  chartBox: {
    background: "#fff",
    padding: "15px",
    borderRadius: "16px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
  },

  chartTitle: {
    marginBottom: "10px"
  },

  loading: {
    textAlign: "center",
    marginTop: "50px"
  }
};

export default AdminDashboard;