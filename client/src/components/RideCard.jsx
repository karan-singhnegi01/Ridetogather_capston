import { Link } from 'react-router-dom';

export const formatDate = (d) =>
  new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function RideCard({ ride }) {
  return (
    <div className="card ride-card">
      <div>
        <h3>{ride.source} to {ride.destination}</h3>
        <p className="muted">{formatDate(ride.departureTime)}</p>
        <p className="muted">Driver: {ride.driver?.name}</p>
      </div>
      <div className="ride-right">
        <p className="fare">Rs. {ride.fare}</p>
        <p className="muted">{ride.availableSeats} seat(s) left</p>
        <Link to={`/rides/${ride._id}`} className="btn small">View</Link>
      </div>
    </div>
  );
}
