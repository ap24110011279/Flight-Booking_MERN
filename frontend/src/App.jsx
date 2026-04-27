import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Search from './pages/Search.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import SeatSelect from './pages/SeatSelect.jsx';
import Payment from './pages/Payment.jsx';
import Confirmation from './pages/Confirmation.jsx';
import MyBookings from './pages/MyBookings.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/seat/:flightId" element={<ProtectedRoute><SeatSelect /></ProtectedRoute>} />
          <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/confirmation/:bookingId" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        </Routes>
      </main>
      <footer className="text-center text-xs text-slate-400 py-4">© SkyVault — Demo MERN App</footer>
    </div>
  );
}
