import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { formatDate } from '../components/RideCard.jsx';

export default function MyRides() {
  const [rides, setRides] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  const loadAll = async () => {
    try {
      const [r, b] = await Promise.all([api('/rides/mine'), api('/bookings/requests')]);
      setRides(r.rides);
      setRequests(b.bookings);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const rideAction = async (id, type) => {
    setError('');
    try {
      if (type === 'cancel') {
        if (!window.confirm('Cancel this ride? All its bookings will be cancelled.')) return;
        await api(`/rides/${id}`, { method: 'DELETE' });
      } else {
        await api(`/rides/${id}/complete`, { method: 'PATCH' });
      }
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const respond = async (id, action) => {
    setError('');
    try {
      await api(`/bookings/${id}/respond`, { method: 'PATCH', body: { action } });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>My rides</h1>
      {error && <p className="error">{error}</p>}
      {rides.length === 0 && <p className="muted">You have not posted any rides yet.</p>}

      {rides.map((ride) => (
        <div className="card ride-card" key={ride._id}>
          <div>
            <h3>{ride.source} to {ride.destination}</h3>
            <p className="muted">{formatDate(ride.departureTime)}</p>
            <p className="muted">Rs. {ride.fare} per seat | {ride.availableSeats}/{ride.totalSeats} seats left</p>
          </div>
          <div className="ride-right">
            <span className={`tag ${ride.status}`}>{ride.status}</span>
            {ride.status === 'open' && (
              <div className="row">
                <button className="btn small" onClick={() => rideAction(ride._id, 'complete')}>Complete</button>
                <button className="btn small danger" onClick={() => rideAction(ride._id, 'cancel')}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      ))}

      <h2>Seat requests</h2>
      {requests.length === 0 && <p className="muted">No requests yet.</p>}
      {requests.map((b) => (
        <div className="card ride-card" key={b._id}>
          <div>
            <h3>{b.passenger?.name} <span className="muted">({b.passenger?.phone})</span></h3>
            <p className="muted">{b.ride?.source} to {b.ride?.destination} | {formatDate(b.ride?.departureTime)}</p>
            <p className="muted">Seats wanted: {b.seats}</p>
          </div>
          <div className="ride-right">
            <span className={`tag ${b.status}`}>{b.status}</span>
            {b.status === 'pending' && (
              <div className="row">
                <button className="btn small" onClick={() => respond(b._id, 'accept')}>Accept</button>
                <button className="btn small danger" onClick={() => respond(b._id, 'reject')}>Reject</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
