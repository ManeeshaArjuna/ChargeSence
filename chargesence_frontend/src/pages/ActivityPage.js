import React, { useEffect, useState } from "react";
import API from "../api/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function ActivityPage() {

  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

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
  // PDF DOWNLOAD
  //////////////////////////////////////////////////
  const downloadReceipt = async (booking) => {
    const element = document.getElementById(`receipt-${booking.id}`);
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save(`receipt_${booking.id}.pdf`);
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

  const openMap = (b) => {
    if (b.map_url) {
      window.open(b.map_url, "_blank");
    } else {
      alert("Location not available");
    }

  const url = `https://www.google.com/maps?q=${b.latitude},${b.longitude}`;
  window.open(url, "_blank");
};

  //////////////////////////////////////////////////
  // CARD
  //////////////////////////////////////////////////
  const BookingCard = ({ b, actions }) => (
    <div style={styles.card}>

      <div style={styles.cardHeader}>
        <h4 style={{ margin: 0 }}>⚡ {b.station}</h4>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          
          {/* 📍 MAP BUTTON */}
          <button
            style={styles.mapBtn}
            onClick={() => openMap(b)}
            title="Open in Google Maps"
          >
            📍
          </button>

          <span style={{
            ...styles.statusBadge,
            ...getStatusStyle(b.status)
          }}>
            {b.status}
          </span>
        </div>
      </div>

      <p style={styles.sub}>🔌 {b.connector}</p>
      <p style={styles.sub}>
        🕒 {new Date(b.start_time).toLocaleString()}
      </p>

      {b.final_amount && (
        <p style={styles.amount}>Final: Rs {b.final_amount}</p>
      )}

      <p style={styles.sub}>Booking Fee: Rs {b.amount}</p>

      <div style={styles.actionRow}>
        {actions}

        {/* PREVIEW BUTTON */}
        <button
          style={styles.buttonSecondary}
          onClick={() => setSelectedBooking(b)}
        >
          📄 Receipt
        </button>
      </div>

      {/* HIDDEN RECEIPT TEMPLATE */}
      <div
        id={`receipt-${b.id}`}
        style={{
          position: "absolute",
          left: "-9999px",
          background: "#fff",
          color: "#000",
          padding: "20px",
          width: "300px"
        }}
      >
        <h3>⚡ ChargeSense Receipt</h3>

        <p><b>Station:</b> {b.station}</p>
        <p><b>Connector:</b> {b.connector}</p>
        <p><b>Status:</b> {b.status}</p>

        <p><b>Start:</b> {new Date(b.start_time).toLocaleString()}</p>

        {b.end_time && (
          <p><b>End:</b> {new Date(b.end_time).toLocaleString()}</p>
        )}

        <hr />

        <p><b>Booking Fee:</b> Rs {b.amount}</p>

        {b.final_amount && (
          <p><b>Total Paid:</b> Rs {b.final_amount}</p>
        )}

        <hr />

        <p style={{ fontSize: "12px" }}>
          Thank you for using ChargeSense 🚀
        </p>
      </div>

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
                <button style={styles.buttonPrimary} onClick={() => completeBooking(b.id)}>
                  Complete
                </button>

                <button style={styles.buttonDanger} onClick={() => cancelBooking(b.id)}>
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

      {/* RECEIPT MODAL */}
      {selectedBooking && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>📄 Receipt Preview</h3>

            <p><b>Station:</b> {selectedBooking.station}</p>
            <p><b>Connector:</b> {selectedBooking.connector}</p>
            <p><b>Status:</b> {selectedBooking.status}</p>

            <p><b>Start:</b> {new Date(selectedBooking.start_time).toLocaleString()}</p>

            {selectedBooking.end_time && (
              <p><b>End:</b> {new Date(selectedBooking.end_time).toLocaleString()}</p>
            )}

            <hr />

            <p><b>Booking Fee:</b> Rs {selectedBooking.amount}</p>

            {selectedBooking.final_amount && (
              <p><b>Total Paid:</b> Rs {selectedBooking.final_amount}</p>
            )}

            <div style={styles.modalActions}>
              <button
                style={styles.buttonPrimary}
                onClick={() => downloadReceipt(selectedBooking)}
              >
                ⬇️ Download
              </button>

              <button
                style={styles.buttonDanger}
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
// STYLES
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

  title: { textAlign: "center", marginBottom: "20px" },

  sectionTitle: { marginTop: "20px", marginBottom: "10px", fontSize: "16px", opacity: 0.9 },

  empty: { opacity: 0.6, fontSize: "14px" },

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    padding: "18px",
    borderRadius: "18px",
    marginBottom: "12px"
  },

  cardHeader: { display: "flex", justifyContent: "space-between" },

  statusBadge: { padding: "5px 10px", borderRadius: "20px", fontSize: "12px" },

  sub: { fontSize: "13px", opacity: 0.8 },

  amount: { fontWeight: "bold", color: "#00e676" },

  actionRow: { display: "flex", gap: "10px", marginTop: "12px" },

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
    color: "#fff"
  },

  buttonSecondary: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    border: "1px solid #fff",
    background: "transparent",
    color: "#fff"
  },

  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100%", height: "100%",
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    background: "#fff",
    color: "#000",
    padding: "20px",
    borderRadius: "16px",
    width: "300px"
  },

  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px"
  },

  nav: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    padding: "14px"
  },

  mapBtn: {
    border: "none",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    fontSize: "16px",
    cursor: "pointer"
  },

  active: { color: "#00e676", fontWeight: "bold" }
};

export default ActivityPage;