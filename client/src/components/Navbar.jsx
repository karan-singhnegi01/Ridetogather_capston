import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">RideTogether</Link>
      <div className="links">
        <NavLink to="/">Find rides</NavLink>

        {user?.role === 'driver' && (
          <>
            <NavLink to="/post-ride">Post a ride</NavLink>
            <NavLink to="/my-rides">My rides</NavLink>
            <NavLink to="/reports">Reports</NavLink>
          </>
        )}
        {user?.role === 'passenger' && <NavLink to="/my-bookings">My bookings</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}

        {user ? (
          <>
            <span className="hello">Hi, {user.name.split(' ')[0]} ({user.role})</span>
            <button className="btn small" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
