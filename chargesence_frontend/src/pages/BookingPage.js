import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";

function BookingPage() {

  const { state } = useLocation();
  const navigate = useNavigate();

  const charger = state?.charger;
  const eta = state?.eta || 0;

  //////////////////////////////////////////////////
  //  AUTO CONNECTOR (NEW)
  //////////////////////////////////////////////////
  const connector = charger?.connector;

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(10);
  const [amount, setAmount] = useState(0);
  const [vehicleId, setVehicleId] = useState(null);

  const recommendationData = {
    best: state?.best,
    others: state?.others,
    battery: state?.battery,
    range: state?.range 
  };

  //////////////////////////////////////////////////
  // LOAD VEHICLES
  //////////////////////////////////////////////////
  useEffect(() => {
    API.get("vehicles/list/")
      .then(res => {
        if (res.data.length > 0) {
          setVehicleId(res.data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  //////////////////////////////////////////////////
  // LOAD SLOTS
  //////////////////////////////////////////////////
  useEffect(() => {
    if (!charger?.id) return;

    API.get(`available-slots/?charger_id=${charger.id}&eta=${eta}`)
      .then(res => setSlots(res.data))
      .catch(err => console.error("Slot error:", err));

  }, [charger, eta]);

  //////////////////////////////////////////////////
  // CALCULATE AMOUNT
  //////////////////////////////////////////////////
  useEffect(() => {
    setAmount((duration / 5) * 25);
  }, [duration]);

  //////////////////////////////////////////////////
  // CONFIRM BOOKING
  //////////////////////////////////////////////////
  const confirmBooking = () => {

    if (!selectedSlot) return alert("Select time slot");
    if (!vehicleId) return alert("Add a vehicle first");

    const bookingData = {
      charger_id: charger.id,
      vehicle_id: vehicleId,
      connector,
      start: selectedSlot.start.split("+")[0],
      duration
    };

    API.post("create-booking/", bookingData)
      .then(res => {
        return API.post("pay-booking/", {
          booking_id: res.data.booking_id
        });
      })
      .then(() => {
        alert("✅ Booking Confirmed!");
        window.location.href = "/activity";
      })
      .catch(err => {
        console.error(err);
        alert("Booking failed. Insufficient Balance. Please top up your wallet.");
      });
  };

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////
  if (!charger) return <h3>No charger selected</h3>;

  return (
    <div style={styles.container}>

      <h2 style={styles.title}>⚡ Confirm Booking</h2>

  {/*  SMART COMPACT SUMMARY */}
  <div style={styles.card}>
    <h3 style={{ marginBottom: "10px" }}>⚡ Charging Summary</h3>

    <div style={styles.grid}>

      <div>
        <p style={styles.label}>🔌 Connector</p>
        <p style={styles.value}>{charger.connector}</p>
      </div>

      <div>
        <p style={styles.label}>⚡ Power</p>
        <p style={styles.value}>{charger.power} kW</p>
      </div>

      <div>
        <p style={styles.label}>💰 Cost</p>
        <p style={styles.value}>LKR {charger.cost}</p>
      </div>

      <div>
        <p style={styles.label}>⏱ ETA</p>
        <p style={styles.value}>{eta} mins</p>
      </div>

      <div>
        <p style={styles.label}>🔋 Arrival</p>
        <p style={styles.value}>{charger.estimated_battery}%</p>
      </div>

      <div>
        <p style={styles.label}>📉 Range Left</p>
        <p style={styles.value}>{charger.remaining_range} km</p>
      </div>

    </div>

    {/* Highlight row */}
    <div style={styles.highlightRow}>
      📍 {charger.distance} km away
    </div>

  </div>

      {/* CHARGER CARD */}
      <div style={styles.card}>
        <h3>{charger.station_name}</h3>
        <p style={styles.sub}>{charger.address}</p>
        <p style={styles.highlight}>ETA: {eta} mins</p>
      </div>

      {/* SLOTS */}
      <div style={styles.card}>
        <label>Time Slot</label>

        <div style={styles.slotContainer}>
          {slots.length === 0 && <p>No available slots</p>}

          {slots.map((s, i) => (
            <button
              key={i}
              onClick={() => setSelectedSlot(s)}
              style={{
                ...styles.slotBtn,
                ...(selectedSlot === s ? styles.slotActive : {})
              }}
            >
              {new Date(s.start).toLocaleTimeString()}
            </button>
          ))}
        </div>
      </div>

      {/* DURATION */}
      <div style={styles.card}>
        <label>Duration</label>
        <select
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          style={styles.input}
        >
          {[10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(d => (
            <option key={d} value={d}>{d} min</option>
          ))}
        </select>
      </div>

      {/* AMOUNT */}
      <div style={styles.amountCard}>
        <h3>Total</h3>
        <h2>Rs {amount}</h2>
      </div>

      {/* ACTION BUTTONS */}
      <button style={styles.primaryBtn} onClick={confirmBooking}>
        🚀 Confirm & Pay
      </button>

      <button
        style={styles.secondaryBtn}
        onClick={() =>
          navigate("/recommendation", {
            state: recommendationData
          })
        }
      >
        ← Back
      </button>

      {/* NAV */}
      <div style={styles.nav}>
        <p onClick={() => (window.location.href = "/dashboard")}>Home</p>
        <p style={styles.active}>Booking</p>
        <p onClick={() => (window.location.href = "/activity")}>Activity</p>
        <p onClick={() => (window.location.href = "/wallet")}>Wallet</p>
        <p onClick={() => (window.location.href = "/more")}>More</p>
      </div>

    </div>
  );
}

//////////////////////////////////////////////////
// STYLES (PREMIUM)
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
    marginBottom: "15px"
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    padding: "16px",
    borderRadius: "16px",
    marginBottom: "12px",
    border: "1px solid rgba(255,255,255,0.1)"
  },

  sub: {
    fontSize: "13px",
    opacity: 0.8
  },

  highlight: {
    marginTop: "5px",
    fontWeight: "bold",
    color: "#00e676"
  },

  input: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    marginTop: "8px"
  },

  slotContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px"
  },

  slotBtn: {
    padding: "10px",
    borderRadius: "20px",
    border: "none",
    background: "rgba(255,255,255,0.2)",
    color: "#fff"
  },

  slotActive: {
    background: "linear-gradient(135deg, #00e676, #00c6ff)",
    color: "#000",
    fontWeight: "bold"
  },

  amountCard: {
    background: "linear-gradient(135deg, #00e676, #00c6ff)",
    padding: "18px",
    borderRadius: "16px",
    textAlign: "center",
    marginBottom: "15px",
    color: "#000"
  },

  primaryBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "30px",
    border: "none",
    background: "linear-gradient(135deg, #00e676, #00c6ff)",
    color: "#000",
    fontWeight: "bold"
  },

  secondaryBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "25px",
    border: "1px solid #fff",
    background: "transparent",
    color: "#fff",
    marginTop: "10px"
  },

  nav: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100vw",
    display: "flex",
    justifyContent: "space-around",
    padding: "14px 0",
    margin: 0,
    boxSizing: "border-box",
    background: "rgba(227, 181, 18, 0.4)",
    backdropFilter: "blur(15px)",
    borderTop: "1px solid rgba(255,255,255,0.1)"
  },

  active: {
    color: "#00e676",
    fontWeight: "bold"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },

  label: {
    fontSize: "11px",
    opacity: 0.7
  },

  value: {
    fontSize: "15px",
    fontWeight: "bold"
  },

  highlightRow: {
    marginTop: "10px",
    padding: "8px",
    borderRadius: "10px",
    background: "rgba(0,230,118,0.15)",
    textAlign: "center",
    fontWeight: "bold",
    color: "#00e676"
  }
};

export default BookingPage;