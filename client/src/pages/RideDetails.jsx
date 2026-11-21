import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../components/RideCard.jsx';

export default function RideDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [seats, setSeats] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api(`/rides/${id}`)
      .then((data) => setRide(data.ride))
      .catch((err) => setError(err.message));
  }, [id]);

  const handleBook = async () => {
    setError('');
    setMessage('');
    try {
      await api('/bookings', { method: 'POST', body: { rideId: id, seats: Number(seats) } });
      setMessage('Request sent! The driver will accept or reject it.');
      setTimeout(() => navigate('/my-bookings'), 1200);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !ride) return <p className="error">{error}</p>;
  if (!ride) return <p className="center">Loading...</p>;

  return (
    <div className="card">
      <h2>{ride.source} to {ride.destination}</h2>
      <p>Departure: <b>{formatDate(ride.departureTime)}</b></p>
      <p>Fare per seat: <b>Rs. {ride.fare}</b></p>
      <p>Seats left: <b>{ride.availableSeats}</b> of {ride.totalSeats}</p>
      <p>Driver: <b>{ride.driver?.name}</b></p>
      <p>Status: <span className={`tag ${ride.status}`}>{ride.status}</span></p>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {!user && <p className="muted"><Link to="/login">Login</Link> as a passenger to book this ride.</p>}
      {user?.role === 'driver' && <p className="muted">Drivers cannot book rides.</p>}
      {user?.role === 'passenger' && ride.status === 'open' && ride.availableSeats > 0 && (
        <div className="inline">
          <label>Seats</label>
          <input type="number" min="1" max={ride.availableSeats} value={seats} onChange={(e) => setSeats(e.target.value)} />
          <button className="btn" onClick={handleBook}>Request seat</button>
        </div>
      )}
    </div>
  );
}
