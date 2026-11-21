import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { formatDate } from '../components/RideCard.jsx';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  const load = () =>
    api('/bookings/mine')
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    setError('');
    try {
      await api(`/bookings/${id}/cancel`, { method: 'PATCH' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>My bookings</h1>
      {error && <p className="error">{error}</p>}
      {bookings.length === 0 && <p className="muted">You have not requested any rides yet.</p>}

      {bookings.map((b) => (
        <div className="card ride-card" key={b._id}>
          <div>
            <h3>{b.ride?.source} to {b.ride?.destination}</h3>
            <p className="muted">{b.ride && formatDate(b.ride.departureTime)}</p>
            <p className="muted">Seats: {b.seats} | Total: Rs. {b.seats * (b.ride?.fare || 0)}</p>
            {b.status === 'accepted' && (
              <p>Driver contact: <b>{b.ride?.driver?.name}</b> ({b.ride?.driver?.phone})</p>
            )}
          </div>
          <div className="ride-right">
            <span className={`tag ${b.status}`}>{b.status}</span>
            {['pending', 'accepted'].includes(b.status) && (
              <button className="btn small danger" onClick={() => handleCancel(b._id)}>Cancel</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
