import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RideDetails from './pages/RideDetails.jsx';
import PostRide from './pages/PostRide.jsx';
import MyRides from './pages/MyRides.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Reports from './pages/Reports.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rides/:id" element={<RideDetails />} />

          <Route path="/post-ride" element={<ProtectedRoute roles={['driver']}><PostRide /></ProtectedRoute>} />
          <Route path="/my-rides" element={<ProtectedRoute roles={['driver']}><MyRides /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute roles={['driver']}><Reports /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute roles={['passenger']}><MyBookings /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />

          <Route path="*" element={<p className="center">Page not found</p>} />
        </Routes>
      </main>
    </>
  );
}
