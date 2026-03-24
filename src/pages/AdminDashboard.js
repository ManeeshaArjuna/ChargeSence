import React, { useEffect, useState } from "react";
import API from "../api/api";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("admin/dashboard/")
    .then((res) => {
        console.log("API SUCCESS:", res.data);
        setData(res.data);
    })
    .catch((err) => {
        console.error("API ERROR:", err);
    });
  }, []);

  if (!data) return <h3>Loading...</h3>;

  const chartData = {
    labels: data.popular_stations.map((s) => s.station),
    datasets: [
      {
        label: "Bookings",
        data: data.popular_stations.map((s) => s.bookings),
      },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Admin Dashboard</h2>

      <p>Total Bookings: {data.total_bookings}</p>
      <p>Total Revenue: LKR {data.total_revenue}</p>

      <div style={{ width: "600px" }}>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

export default AdminDashboard;