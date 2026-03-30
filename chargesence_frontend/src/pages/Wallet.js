import React, { useEffect, useState } from "react";
import API from "../api/api";

function Wallet() {
  const [data, setData] = useState({
    name: "",
    balance: 0,
    transactions: []
  });

  const [showModal, setShowModal] = useState(false);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);

  const [newCard, setNewCard] = useState({
    number: "",
    name: "",
    expiry: ""
  });

  const [mode, setMode] = useState("TOPUP");
  const [amount, setAmount] = useState("");

  //////////////////////////////////////////////////
  // LOAD DATA
  //////////////////////////////////////////////////
  useEffect(() => {
    API.get("wallet/")
      .then((res) => setData(res.data));

    API.get("cards/")
      .then((res) => setCards(res.data))
      .catch((err) => console.error(err));
  }, []);

  //////////////////////////////////////////////////
  // TOPUP
  //////////////////////////////////////////////////
  const handleTopup = () => {
    if (!selectedCard) {
      alert("Please select a card");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    API.post("wallet/topup/", {
      amount: Number(amount),
      card_id: selectedCard.id
    })
      .then(() => {
        alert("Top-up successful!");

        API.get("wallet/")
          .then((res) => setData(res.data));

        setAmount("");
      })
      .catch((err) => {
        console.log(err.response?.data);
        alert("Top-up failed");
      });
  };

  //////////////////////////////////////////////////
  // SAVE CARD
  //////////////////////////////////////////////////
  const saveCard = () => {
    if (!newCard.number) {
      alert("Enter card details");
      return;
    }

    API.post("cards/add/", {
      number: newCard.number,
      name: newCard.name,
      expiry: newCard.expiry
    })
      .then(() => {
        alert("Card saved");

        API.get("cards/").then(res => setCards(res.data));

        setNewCard({ number: "", name: "", expiry: "" });
      })
      .catch(() => alert("Error saving card"));
  };

  //////////////////////////////////////////////////
  // DELETE CARD
  //////////////////////////////////////////////////
  const deleteCard = (id) => {
    API.delete(`cards/${id}/`)
      .then(() => {
        setCards(cards.filter(c => c.id !== id));
      })
      .catch(() => alert("Delete failed"));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.logo}>⚡ ChargeSence</h2>
      <p>Welcome, {data.name}</p>

      {/* SWITCH */}
      <div style={styles.switch}>
        <button
          style={mode === "TOPUP" ? styles.activeBtn : styles.btn}
          onClick={() => setMode("TOPUP")}
        >
          TopUp
        </button>

        <button
          style={mode === "HISTORY" ? styles.activeBtn : styles.btn}
          onClick={() => setMode("HISTORY")}
        >
          History
        </button>
      </div>

      {/* TOPUP */}
      {mode === "TOPUP" && (
        <>
          <div style={styles.card}>
            <h2>ChargeSence</h2>
            <p>Balance</p>
            <h2>LKR {data.balance}</h2>
            <p>{data.name}</p>
          </div>

          <button
            style={styles.buttonSecondary}
            onClick={() => setShowModal(true)}
          >
            {selectedCard ? "Card Selected ✅" : "Select Payment Method"}
          </button>

          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />

          <button style={styles.button} onClick={handleTopup}>
            Recharge
          </button>
        </>
      )}

      {/* HISTORY */}
      {mode === "HISTORY" && (
        <div>
          {data.transactions.length > 0 ? (
            data.transactions.map((t, i) => (
              <div key={i} style={styles.tx}>
                <p>{t.type}</p>
                <p>LKR {t.amount}</p>
                <p style={styles.date}>{t.date}</p>
              </div>
            ))
          ) : (
            <p>No transactions</p>
          )}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Select Card</h3>

            {/* EXISTING CARDS */}
            {cards.length > 0 ? (
              cards.map((c) => (
                <div key={c.id} style={styles.cardItem}>
                  <div
                    onClick={() => {
                      setSelectedCard(c);
                      setShowModal(false);
                    }}
                  >
                    {c.masked}
                  </div>

                  <button
                    style={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCard(c.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p>No saved cards</p>
            )}

            <hr />

            {/* VIRTUAL CARD */}
            <div style={styles.cardPreview}>
              <div style={styles.cardTop}>
                {getCardType(newCard.number)}
              </div>

              <div style={styles.cardNumber}>
                {newCard.number || "#### #### #### ####"}
              </div>

              <div style={styles.cardBottom}>
                <span>{newCard.name || "CARD HOLDER"}</span>
                <span>{newCard.expiry || "MM/YY"}</span>
              </div>
            </div>

            <h4>Add New Card</h4>

            <input
              placeholder="Card Number"
              value={newCard.number}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "");
                value = value.substring(0, 16);
                value = value.replace(/(.{4})/g, "$1 ").trim();

                setNewCard({ ...newCard, number: value });
              }}
              style={styles.input}
            />

            <input
              placeholder="Card Name"
              value={newCard.name}
              onChange={(e) =>
                setNewCard({ ...newCard, name: e.target.value })
              }
              style={styles.input}
            />

            <input
              placeholder="Expiry"
              value={newCard.expiry}
              onChange={(e) =>
                setNewCard({ ...newCard, expiry: e.target.value })
              }
              style={styles.input}
            />

            <button style={styles.button} onClick={saveCard}>
              Save Card
            </button>

            <button
              style={styles.buttonSecondary}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <div style={styles.nav}>
        <p onClick={() => (window.location.href = "/dashboard")}>Home</p>
        <p onClick={() => (window.location.href = "/booking")}>Booking</p>
        <p onClick={() => (window.location.href = "/activity")}>Activity</p>
        <p style={styles.active}>Wallet</p>
        <p onClick={() => (window.location.href = "/more")}>More</p>
      </div>
    </div>
  );
}

//////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////

function getCardType(number) {
  const num = number.replace(/\s/g, "");
  if (num.startsWith("4")) return "VISA";
  if (num.startsWith("5")) return "MASTERCARD";
  return "CARD";
}

//////////////////////////////////////////////////
// STYLES
//////////////////////////////////////////////////

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    paddingBottom: "80px",
    fontFamily: "'Segoe UI', sans-serif",
    background: "linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #00c6ff)",
    color: "#fff"
  },

  logo: {
    textAlign: "center",
    fontSize: "22px",
    marginBottom: "10px"
  },

  switch: {
    display: "flex",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "5px",
    margin: "20px 0"
  },

  btn: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    background: "transparent",
    color: "#fff"
  },

  activeBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    background: "#00e676",
    color: "#000",
    fontWeight: "bold"
  },

  card: {
    background: "linear-gradient(135deg, #00e676, #00c6ff)",
    padding: "20px",
    borderRadius: "16px",
    marginBottom: "20px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.3)"
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    marginBottom: "10px"
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "25px",
    background: "#00e676",
    border: "none",
    fontWeight: "bold",
    color: "#000"
  },

  buttonSecondary: {
    width: "100%",
    padding: "12px",
    borderRadius: "25px",
    border: "1px solid #fff",
    background: "transparent",
    color: "#fff",
    marginBottom: "10px"
  },

  tx: {
    background: "rgba(255,255,255,0.1)",
    padding: "12px",
    borderRadius: "12px",
    marginBottom: "10px"
  },

  date: {
    fontSize: "12px",
    opacity: 0.7
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

  modalOverlay: {
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
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(12px)",
    padding: "40px",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "350px",
    color: "#fff"
  },

  cardItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.1)",
    marginBottom: "10px"
  },

  deleteBtn: {
    background: "#ff5252",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "4px 8px"
  },

  cardPreview: {
    background: "linear-gradient(135deg, #00e676, #00c6ff)",
    padding: "15px",
    borderRadius: "14px",
    marginBottom: "15px"
  },

  cardTop: {
    textAlign: "right",
    fontWeight: "bold"
  },

  cardNumber: {
    fontSize: "18px",
    margin: "10px 0"
  },

  cardBottom: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px"
  }
};

export default Wallet;