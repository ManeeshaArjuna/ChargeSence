import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Chargers from "./pages/Chargers";
import Wallet from "./pages/Wallet";
import Booking from "./pages/Booking";
import More from "./pages/More";
import Recommendation from "./pages/Recommendation";
import BookingPage from "./pages/BookingPage";
import ActivityPage from "./pages/ActivityPage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Home />} />
      <Route path="/chargers" element={<Chargers />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/more" element={<More />} />
      <Route path="/recommendation" element={<Recommendation />} />
      <Route path="/bookingpage" element={<BookingPage />} />
      <Route path="/activity" element={<ActivityPage />} />
    </Routes>
  );
}

export default App;