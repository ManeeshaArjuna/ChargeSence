import React, { useEffect, useState } from "react";
import API from "../api/api";

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
  // STATUS STYLE
  //////////////////////////////////////////////////
  const getStatusStyle = (status) => {
    switch (status) {
      case "PAID":
        return { background: "#00c6ff", color: "#000" };
      case "COMPLETED":
        return { background: "#00e676", color: "#000" };
      case "CANCELLED":
        return { background: "#ff5252", color: "#fff" };
      default:
        return {};
    }
  };

  //////////////////////////////////////////////////
  // CARD UI
  //////////////////////////////////////////////////
  const BookingCard = ({ b, actions }) => (
    <div style={styles.card}>

      <div style={styles.cardHeader}>
        <h4 style={{ margin: 0 }}>⚡ {b.station}</h4>

        <span style={{
          ...styles.statusBadge,
          ...getStatusStyle(b.status)
        }}>
          {b.status}
        </span>
      </div>

      <p style={styles.sub}>🔌 {b.connector}</p>
      <p style={styles.sub}>
        🕒 {new Date(b.start_time).toLocaleString()}
      </p>

      {b.final_amount && (
        <p style={styles.amount}>Final: Rs {b.final_amount}</p>
      )}

      <p style={styles.sub}>Booking Fee: Rs {b.amount}</p>

      {actions && (
        <div style={styles.actionRow}>
          {actions}
        </div>
      )}

    </div>
  );

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>📊 Activity</h2>

      {/* ONGOING */}
      <section>
        <h3 style={styles.sectionTitle}>🔵 Ongoing</h3>
        {ongoing.length === 0 && <p style={styles.empty}>No ongoing bookings</p>}

        {ongoing.map(b => (
          <BookingCard
            key={b.id}
            b={b}
            actions={
              <>
                <button
                  style={styles.buttonPrimary}
                  onClick={() => completeBooking(b.id)}
                >
                  Complete
                </button>

                <button
                  style={styles.buttonDanger}
                  onClick={() => cancelBooking(b.id)}
                >
                  Cancel
                </button>
              </>
            }
          />
        ))}
      </section>

      {/* COMPLETED */}
      <section>
        <h3 style={styles.sectionTitle}>🟢 Completed</h3>
        {completed.length === 0 && <p style={styles.empty}>No completed bookings</p>}

        {completed.map(b => (
          <BookingCard key={b.id} b={b} />
        ))}
      </section>

      {/* CANCELLED */}
      <section>
        <h3 style={styles.sectionTitle}>🔴 Cancelled</h3>
        {cancelled.length === 0 && <p style={styles.empty}>No cancelled bookings</p>}

        {cancelled.map(b => (
          <BookingCard key={b.id} b={b} />
        ))}
      </section>

      {/* NAV */}
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
// STYLES (UPGRADED)
//////////////////////////////////////////////////

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    paddingBottom: "90px",
    fontFamily: "'Segoe UI', sans-serif",
    background: "linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #00c6ff)",
    color: "#fff"
  },

  title: {
    textAlign: "center",
    marginBottom: "20px"
  },

  sectionTitle: {
    marginTop: "20px",
    marginBottom: "10px",
    fontSize: "16px",
    opacity: 0.9
  },

  empty: {
    opacity: 0.6,
    fontSize: "14px"
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    padding: "18px",
    borderRadius: "18px",
    marginBottom: "12px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.1)"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  statusBadge: {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold"
  },

  sub: {
    fontSize: "13px",
    opacity: 0.8,
    marginTop: "5px"
  },

  amount: {
    fontWeight: "bold",
    marginTop: "8px",
    color: "#00e676"
  },

  actionRow: {
    display: "flex",
    gap: "10px",
    marginTop: "12px"
  },

  buttonPrimary: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "none",
    background: "linear-gradient(135deg, #00e676, #00c6ff)",
    color: "#000",
    fontWeight: "bold"
  },

  buttonDanger: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "none",
    background: "#ff5252",
    color: "#fff",
    fontWeight: "bold"
  },

  nav: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    background: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(15px)",
    padding: "14px",
    borderTop: "1px solid rgba(255,255,255,0.1)"
  },

  active: {
    color: "#00e676",
    fontWeight: "bold"
  }
};

export default ActivityPage;