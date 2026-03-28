import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/api";
import { colors } from "../styles/colors";

function BookingPage() {

  const { state } = useLocation();
  const navigate = useNavigate();

  const charger = state?.charger;
  const eta = state?.eta || 0;

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(10);
  const [connector, setConnector] = useState("");
  const [amount, setAmount] = useState(0);
  const [vehicleId, setVehicleId] = useState(null);

  const recommendationData = {
    best: state?.best,
    others: state?.others
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
    if (!connector) return alert("Select connector");
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
        alert("Booking failed");
      });
  };

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////
  if (!charger) return <h3>No charger selected</h3>;

  return (
    <div style={styles.container}>

      <h2>⚡ Booking</h2>

      <h3>{charger.station_name}</h3>
      <p>{charger.address}</p>

      {/* CONNECTOR */}
      <label>Connector</label>
      <select
        value={connector}
        onChange={(e) => setConnector(e.target.value)}
        style={styles.input}
      >
        <option value="">Select</option>
        {charger.chargers?.map((c, i) => (
          <option key={i} value={c.connector}>
            {c.connector} ({c.power}kW)
          </option>
        ))}
      </select>

      {/* SLOTS */}
      <label>Time Slot</label>
      <div style={styles.slotContainer}>
        {slots.length === 0 && <p>No available slots</p>}

        {slots.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelectedSlot(s)}
            style={{
              ...styles.slotBtn,
              backgroundColor:
                selectedSlot === s ? colors.primary : "#ddd",
              color: selectedSlot === s ? "#fff" : "#000",
            }}
          >
            {new Date(s.start).toLocaleTimeString()}
          </button>
        ))}
      </div>

      {/* DURATION */}
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

      {/* AMOUNT */}
      <h4>💰 Rs {amount}</h4>

      {/* ACTION BUTTONS */}
      <button style={styles.primaryBtn} onClick={confirmBooking}>
        Confirm & Pay
      </button>

      {/* ✅ BACK BUTTON */}
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

      {/* ✅ NAVIGATION BAR */}
      <div style={styles.nav}>
        <p onClick={() => (window.location.href = "/dashboard")}>Home</p>
        <p style={styles.active}>Booking Page</p>
        <p onClick={() => (window.location.href = "/activity")}>Activity</p>
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
    paddingBottom: "80px",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5"
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },

  slotContainer: {
    marginBottom: "10px"
  },

  slotBtn: {
    margin: "5px",
    padding: "8px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  primaryBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: colors.primary,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    marginTop: "10px"
  },

  secondaryBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#fff",
    color: colors.primary,
    border: `1px solid ${colors.primary}`,
    borderRadius: "8px",
    marginTop: "10px"
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

export default BookingPage;