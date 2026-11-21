import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { formatDate } from '../components/RideCard.jsx';

export default function Reports() {
  const [earnings, setEarnings] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('/reports/earnings'), api('/reports/popular-routes')])
      .then(([e, r]) => {
        setEarnings(e);
        setRoutes(r.routes);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!earnings) return <p className="center">Loading...</p>;

  return (
    <div>
      <h1>Reports</h1>

      <div className="stats">
        <div className="card stat"><h2>Rs. {earnings.totalEarnings}</h2><p className="muted">Total earnings</p></div>
        <div className="card stat"><h2>{earnings.totalPassengers}</h2><p className="muted">Passengers carried</p></div>
      </div>

      <h2>Earnings per ride</h2>
      {earnings.perRide.length === 0 ? (
        <p className="muted">No accepted bookings yet.</p>
      ) : (
        <table className="card table">
          <thead><tr><th>Route</th><th>Date</th><th>Passengers</th><th>Earnings</th></tr></thead>
          <tbody>
            {earnings.perRide.map((r) => (
              <tr key={r._id}>
                <td>{r.route}</td>
                <td>{formatDate(r.departureTime)}</td>
                <td>{r.passengers}</td>
                <td>Rs. {r.earnings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Popular routes</h2>
      {routes.length === 0 ? (
        <p className="muted">No data yet.</p>
      ) : (
        <table className="card table">
          <thead><tr><th>From</th><th>To</th><th>Rides posted</th><th>Average fare</th></tr></thead>
          <tbody>
            {routes.map((r, i) => (
              <tr key={i}>
                <td className="cap">{r.from}</td>
                <td className="cap">{r.to}</td>
                <td>{r.rides}</td>
                <td>Rs. {r.avgFare}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
