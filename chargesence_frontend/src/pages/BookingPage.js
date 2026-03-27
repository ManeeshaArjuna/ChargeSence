import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/api";

function BookingPage() {

  const { state } = useLocation();
  const charger = state?.charger;

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [duration, setDuration] = useState(10);
  const [connector, setConnector] = useState("");

  const [amount, setAmount] = useState(0);

  const [vehicleId, setVehicleId] = useState(null);

  // ===============================
  // 🔍 DEBUG
  // ===============================
  useEffect(() => {
    console.log("BookingPage charger:", charger);
  }, [charger]);

  // ===============================
  // 🚗 LOAD USER VEHICLE (FIX)
  // ===============================
  useEffect(() => {
    API.get("vehicles/list/")
      .then(res => {
        console.log("User vehicles:", res.data);

        if (res.data.length > 0) {
          setVehicleId(res.data[0].id); // pick first vehicle
        }
      })
      .catch(err => {
        console.error("Vehicle fetch error:", err);
      });
  }, []);

  // ===============================
  // 🚀 LOAD SLOTS
  // ===============================
  useEffect(() => {

    if (!charger || !charger.id) {
      console.error("❌ Charger ID missing:", charger);
      return;
    }

    API.get(`available-slots/?charger_id=${charger.id}`)
      .then(res => {
        setSlots(res.data);
      })
      .catch(err => {
        console.error("❌ Slot fetch error:", err);
      });

  }, [charger]);

  // ===============================
  // 💰 CALCULATE AMOUNT
  // ===============================
  useEffect(() => {
    setAmount((duration / 5) * 25);
  }, [duration]);

  // ===============================
  // 🧾 CONFIRM BOOKING
  // ===============================
  const confirmBooking = () => {

    if (!charger || !charger.id) {
      alert("Charger not selected");
      return;
    }

    if (!selectedSlot) {
      alert("Please select a time slot");
      return;
    }

    if (!connector) {
      alert("Please select connector");
      return;
    }

    if (!vehicleId) {
      alert("No vehicle found. Please add a vehicle first.");
      return;
    }

    const bookingData = {
      charger_id: charger.id,
      vehicle_id: vehicleId,
      connector,
      start: selectedSlot.start,
      duration
    };

    console.log("📦 Sending booking:", bookingData);

    API.post("create-booking/", bookingData)
      .then(res => {

        console.log("✅ Booking created:", res.data);

        API.post("pay-booking/", {
          booking_id: res.data.booking_id
        })
          .then(() => {
            alert("✅ Booking Confirmed!\n📩 SMS sent to your mobile");

            window.location.href = "/history";
          })
          .catch(err => {
            console.error("❌ Payment error:", err);
            alert("Payment failed");
          });

      })
      .catch(err => {
        console.error("❌ Booking error:", err.response?.data || err);
        alert("Booking failed: " + (err.response?.data?.error || "Unknown error"));
      });

  };

  // ===============================
  // ❌ NO DATA
  // ===============================
  if (!charger) {
    return <h3>⚠️ No charger selected</h3>;
  }

  return (
    <div style={{ padding: "20px" }}>

      <h2>⚡ Booking</h2>

      <h3>{charger.station_name}</h3>
      <p>{charger.address}</p>

      {/* CONNECTOR */}
      <label>Select Connector</label>
      <select
        value={connector}
        onChange={(e) => setConnector(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      >
        <option value="">Select Connector</option>
        {charger.chargers?.map((c, i) => (
          <option key={i} value={c.connector}>
            {c.connector} ({c.power}kW)
          </option>
        ))}
      </select>

      {/* SLOTS */}
      <label>Select Time Slot</label>
      <div style={{ marginBottom: "10px" }}>
        {slots.length === 0 && <p>No available slots</p>}

        {slots.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelectedSlot(s)}
            style={{
              margin: "5px",
              padding: "8px",
              backgroundColor:
                selectedSlot === s ? "#4CAF50" : "#ddd",
              color: selectedSlot === s ? "#fff" : "#000",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            {new Date(s.start).toLocaleTimeString()}
          </button>
        ))}
      </div>

      {/* DURATION */}
      <label>Select Duration</label>
      <select
        value={duration}
        onChange={(e) => setDuration(parseInt(e.target.value))}
        style={{ display: "block", marginBottom: "10px" }}
      >
        {[10, 15, 20, 25, 30].map(d => (
          <option key={d} value={d}>
            {d} minutes
          </option>
        ))}
      </select>

      {/* AMOUNT */}
      <h4>💰 Amount: Rs {amount}</h4>

      {/* BUTTON */}
      <button
        onClick={confirmBooking}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Confirm & Pay
      </button>

    </div>
  );
}

export default BookingPage;