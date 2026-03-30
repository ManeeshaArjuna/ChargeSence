import React, { useEffect, useState } from "react";
import API from "../api/api";

function Home() {

  const [data, setData] = useState({
    name: "",
    balance: 0,
    rewards: 0,
    favorites: [],
    promotions: [],
    stations: []
  });

  //  Vehicle onboarding states
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [connector, setConnector] = useState("");
  const [battery, setBattery] = useState("");
  const [efficiency, setEfficiency] = useState("");

  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState("");

  //  REDEEM REWARDS

  const redeemRewards = () => {
    const points = parseInt(redeemPoints);

    if (!points || points < 100) {
      alert("Minimum 100 points required");
      return;
    }

    if (points > data.rewards) {
      alert("Not enough reward points");
      return;
    }

    API.post("redeem-rewards/", { points })
      .then(() => {
        alert("Rewards redeemed successfully!");

        setShowRedeemModal(false);
        setRedeemPoints("");

        //  refresh data
        API.get("home/")
          .then(res => {
            setData({
              name: res.data.name || "",
              balance: res.data.balance || 0,
              rewards: res.data.rewards || 0,
              favorites: res.data.favorites || [],
              promotions: res.data.promotions || [],
              stations: res.data.stations || []
            });
          });
      })
      .catch(() => {
        alert("Error redeeming rewards");
      });
  };

  useEffect(() => {

    //  CHECK VEHICLES
    API.get("vehicles/list/")
      .then(res => {
        if (res.data.length === 0) {
          setShowVehicleModal(true);
        }
      })
      .catch(() => {});

    //  EXISTING LOCATION + HOME API 
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        API.get(`home/?lat=${lat}&lng=${lng}`)
          .then((res) => {
            setData({
              name: res.data.name || "",
              balance: res.data.balance || 0,
              rewards: res.data.rewards || 0,
              favorites: res.data.favorites || [],
              promotions: res.data.promotions || [],
              stations: res.data.stations || []
            });
          })
          .catch((err) => {
            console.error("Home API Error:", err);
          });
      },
      (error) => {
        console.error("Location error:", error);

        API.get("home/")
          .then((res) => {
            setData({
              name: res.data.name || "",
              balance: res.data.balance || 0,
              rewards: res.data.rewards || 0,
              favorites: res.data.favorites || [],
              promotions: res.data.promotions || [],
              stations: res.data.stations || []
            });
          });
      }
    );
  }, []);

  //////////////////////////////////////////////////
  // ADD VEHICLE
  //////////////////////////////////////////////////
  const addVehicle = () => {

    if (!manufacturer || !model || !connector || !battery || !efficiency) {
      alert("Fill all fields");
      return;
    }

    API.post("vehicles/", {
      manufacturer,
      model,
      connector_type: connector,
      battery_capacity_kwh: parseFloat(battery),
      efficiency_wh_per_km: parseFloat(efficiency)
    })
      .then(() => {
        alert("Vehicle added");
        setShowVehicleModal(false);
      })
      .catch(err => {
        console.log("ERROR:", err.response?.data);
        alert("Error adding vehicle");
      });
  };

  if (!data.name) {
    return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
  }

  return (
    <div style={styles.container}>

      {/*  VEHICLE REQUIRED MODAL */}
      {showVehicleModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>

            <h3>🚗 Add Your Vehicle</h3>
            <p>You need to add a vehicle to continue</p>

            {!showForm ? (
              <>
                <button style={styles.button} onClick={() => setShowForm(true)}>
                  Add Vehicle Now
                </button>

                <button
                  style={styles.buttonSecondary}
                  onClick={() => setShowVehicleModal(false)}
                >
                  Add Later
                </button>
              </>
            ) : (
              <>
                <input
                  style={styles.input}
                  placeholder="Manufacturer"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />

                <select
                  style={styles.input}
                  value={connector}
                  onChange={(e) => setConnector(e.target.value)}
                >
                  <option value="">Select Connector</option>
                  <option value="TYPE1">Type 1</option>
                  <option value="TYPE2">Type 2</option>
                  <option value="CCS">CCS</option>
                  <option value="CCS2">CCS2</option>
                  <option value="CHADEMO">CHAdeMO</option>
                </select>

                <input
                  style={styles.input}
                  placeholder="Battery (kWh)"
                  value={battery}
                  onChange={(e) => setBattery(e.target.value)}
                />

                <input
                  style={styles.input}
                  placeholder="Efficiency (Wh/km)"
                  value={efficiency}
                  onChange={(e) => setEfficiency(e.target.value)}
                />

                <button style={styles.button} onClick={addVehicle}>
                  Save Vehicle
                </button>
              </>
            )}

          </div>
        </div>
        
      )}

            {/*  REDEEM MODAL (FIXED POSITION) */}
      {showRedeemModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>🎁 Redeem Rewards</h3>

            <p>You have {data.rewards} points</p>

            {data.rewards < 100 ? (
              <p style={{ color: "red" }}>Minimum 100 points required</p>
            ) : (
              <>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Enter points"
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                />

                <button style={styles.button} onClick={redeemRewards}>
                  Redeem
                </button>
              </>
            )}

            <button
              style={{ ...styles.buttonSecondary, marginTop: "10px" }}
              onClick={() => setShowRedeemModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ===== UI ===== */}

      <div style={styles.header}>
        <h2 style={styles.logo}>⚡ ChargeSence</h2>
        <p>Welcome, {data.name}</p>
      </div>

      <div style={styles.banner}>
        <p>
          {data.promotions.length > 0
            ? data.promotions[0]
            : "⚡ Welcome to ChargeSence!"}
        </p>
      </div>

      <div style={styles.card}>
        <h3>ChargeSence Balance</h3>
        <p style={styles.amount}>LKR {data.balance}</p>
        <button style={styles.button} onClick={() => (window.location.href = "/wallet")}>
          Recharge
        </button>
      </div>

      <div style={styles.rewardCard}>
        <div style={styles.rewardHeader}>
          <span>🎁 Rewards</span>
          <span style={styles.rewardValue}>{data.rewards} pts</span>
        </div>

        <p style={styles.rewardSub}>
          Earn 1 point for every LKR 100 spent
        </p>

        <button
          style={styles.buttonSecondary}
          onClick={() => setShowRedeemModal(true)}
        >
          Redeem Rewards
        </button>
      </div>

      <div style={styles.card}>
        <h3>Nearby Charging Stations</h3>

        {data.stations.length > 0 ? (
          data.stations.map((s, index) => (
            <div key={index} style={styles.card}>
              <h4>{s.station_name}</h4>
              <p style={styles.address}>{s.address}</p>

              <div style={styles.iconRow}>
                {s.phone && (
                  <a href={`tel:${s.phone}`} style={styles.icon}>📞</a>
                )}
                {s.map && (
                  <a href={s.map} target="_blank" rel="noreferrer" style={styles.icon}>
                    📍
                  </a>
                )}
              </div>

              {s.chargers.map((c, i) => (
                <div key={i} style={styles.chargerRow}>
                  <span>{getConnectorIcon(c.connector)}</span>
                  <span>{c.connector}</span>
                  <span>{c.power} kW</span>
                  <span>LKR {c.cost}</span>
                </div>
              ))}

              <p style={{ fontSize: "12px", color: "#00e676" }}>
                {s.distance?.toFixed(2)} km away
              </p>
            </div>
          ))
        ) : (
          <p>No nearby stations</p>
        )}

        <button
          style={styles.buttonSecondary}
          onClick={() => (window.location.href = "/chargers")}
        >
          View All Chargers
        </button>
      </div>

      <div style={styles.nav}>
        <p style={styles.active}>Home</p>
        <p onClick={() => (window.location.href = "/booking")}>Booking</p>
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
    minHeight: "100vh",
    paddingBottom: "80px",
    fontFamily: "'Segoe UI', sans-serif",
    background: "linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #00c6ff)",
    color: "#fff"
  },

  header: {
    padding: "20px 10px",
    textAlign: "center"
  },

  logo: {
    fontSize: "22px",
    fontWeight: "bold"
  },

  banner: {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "15px",
    textAlign: "center"
  },

  card: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    padding: "15px",
    borderRadius: "16px",
    marginBottom: "15px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
  },

  amount: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "10px 0"
  },

  button: {
    padding: "10px",
    width: "100%",
    borderRadius: "20px",
    border: "none",
    background: "#00e676",
    color: "#000",
    fontWeight: "bold",
    marginTop: "10px"
  },

  buttonSecondary: {
    padding: "10px",
    width: "100%",
    borderRadius: "20px",
    border: "1px solid #6d6363",
    background:"transparent",
    color: "#f3f3f4",
    marginTop: "10px",
  },

  rewardCard: {
    background: "linear-gradient(135deg, #FFD54F, #FFA000)",
    padding: "15px",
    borderRadius: "16px",
    marginBottom: "15px",
    color: "#000",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
  },

  rewardHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "bold"
  },

  rewardValue: {
    fontSize: "20px"
  },

  rewardSub: {
    fontSize: "12px"
  },

  address: {
    fontSize: "12px",
    opacity: 0.8
  },

  chargerRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    marginTop: "5px"
  },

  iconRow: {
    display: "flex",
    gap: "10px",
    marginTop: "8px"
  },

  icon: {
    fontSize: "18px"
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
    fontWeight: "bold",
    color: "#00e676"
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  modal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "#fff",
    color: "#000",
    padding: "20px",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    zIndex: 10000
  },

  input: {
    width: "95%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  }
};

function getConnectorIcon(type) {
  switch (type) {
    case "TYPE2": return "🔌";
    case "CCS2": return "⚡";
    case "CHADEMO": return "🔋";
    default: return "🔌";
  }
}

export default Home;