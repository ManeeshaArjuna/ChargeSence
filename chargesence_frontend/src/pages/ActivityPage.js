import React, { useEffect, useState } from "react";
import API from "../api/api";
import { colors } from "../styles/colors";

function ActivityPage() {

  const [bookings, setBookings] = useState([]);

  //////////////////////////////////////////////////
  // LOAD BOOKINGS
  //////////////////////////////////////////////////
  useEffect(() => {
    API.get("my-bookings/")
      .then(res => setBookings(res.data))
      .catch(err => console.error(err));
  }, []);

  //////////////////////////////////////////////////
  // FILTER BOOKINGS
  //////////////////////////////////////////////////
  const ongoing = bookings.filter(b => b.status === "PAID");
  const completed = bookings.filter(b => b.status === "COMPLETED");
  const cancelled = bookings.filter(b => b.status === "CANCELLED");

  //////////////////////////////////////////////////
  // COMPLETE BOOKING
  //////////////////////////////////////////////////
  const completeBooking = (id) => {
    const energy = prompt("Enter energy used (kWh):");
    if (!energy) return;

    API.post("complete-booking/", {
      booking_id: id,
      energy_used: energy
    })
      .then(() => {
        alert("Charging completed!");
        window.location.reload();
      })
      .catch(err => {
        alert(err.response?.data?.error || "Error");
      });
  };

  //////////////////////////////////////////////////
  // CANCEL BOOKING
  //////////////////////////////////////////////////
  const cancelBooking = (id) => {
    if (!window.confirm("Cancel this booking?")) return;

    API.post("cancel-booking/", {
      booking_id: id
    })
      .then(() => {
        alert("Cancelled!");
        window.location.reload();
      })
      .catch(err => {
        alert(err.response?.data?.error || "Error");
      });
  };

  //////////////////////////////////////////////////
  // CARD UI
  //////////////////////////////////////////////////
  const BookingCard = ({ b, actions }) => (
    <div style={styles.card}>
      <h4>⚡ {b.station}</h4>
      <p>Connector: {b.connector}</p>
      <p>Start: {new Date(b.start_time).toLocaleString()}</p>
      <p>Status: {b.status}</p>

      {b.final_amount && <p>Final Cost: Rs {b.final_amount}</p>}
      <p>Booking Fee: Rs {b.amount}</p>

      <div style={{ marginTop: "10px" }}>
        {actions}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>

      <h2>📊 Activity</h2>

      {/* ONGOING */}
      <h3>🔵 Ongoing Bookings</h3>
      {ongoing.length === 0 && <p>No ongoing bookings</p>}
      {ongoing.map(b => (
        <BookingCard
          key={b.id}
          b={b}
          actions={
            <>
              <button onClick={() => completeBooking(b.id)}>
                ✅ Complete
              </button>

              <button
                onClick={() => cancelBooking(b.id)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                ❌ Cancel
              </button>
            </>
          }
        />
      ))}

      {/* COMPLETED */}
      <h3>🟢 Completed Bookings</h3>
      {completed.length === 0 && <p>No completed bookings</p>}
      {completed.map(b => (
        <BookingCard key={b.id} b={b} />
      ))}

      {/* CANCELLED */}
      <h3>🔴 Cancelled Bookings</h3>
      {cancelled.length === 0 && <p>No cancelled bookings</p>}
      {cancelled.map(b => (
        <BookingCard key={b.id} b={b} />
      ))}

      {/* ✅ NAVIGATION BAR */}
      <div style={styles.nav}>
        <p onClick={() => (window.location.href = "/dashboard")}>Home</p>
        <p onClick={() => (window.location.href = "/booking")}>Booking</p>
        <p style={styles.active}>Activity</p>
        <p onClick={() => (window.location.href = "/wallet")}>Wallet</p>
        <p onClick={() => (window.location.href = "/more")}>More</p>
      </div>

    </div>
  );
}

//////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////

const styles = {
  container: {
    padding: "20px",
    paddingBottom: "80px", //  space for nav
    minHeight: "100vh",
    backgroundColor: "#f5f5f5"
  },

  card: {
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "10px",
    backgroundColor: "#fff"
  },

  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: "10px",
    borderTop: "1px solid #ddd"
  },

  active: {
    color: colors.primary,
    fontWeight: "bold"
  }
};

export default ActivityPage;