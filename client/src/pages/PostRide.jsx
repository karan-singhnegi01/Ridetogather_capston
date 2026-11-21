import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function PostRide() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ source: '', destination: '', departureTime: '', fare: '', totalSeats: 3 });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/rides', {
        method: 'POST',
        body: {
          ...form,
          departureTime: new Date(form.departureTime).toISOString(),
          fare: Number(form.fare),
          totalSeats: Number(form.totalSeats),
        },
      });
      navigate('/my-rides');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Post a ride</h2>
      {error && <p className="error">{error}</p>}
      <label>From</label>
      <input name="source" value={form.source} onChange={handleChange} required />
      <label>To</label>
      <input name="destination" value={form.destination} onChange={handleChange} required />
      <label>Departure date and time</label>
      <input type="datetime-local" name="departureTime" value={form.departureTime} onChange={handleChange} required />
      <label>Fare per seat (Rs.)</label>
      <input type="number" min="0" name="fare" value={form.fare} onChange={handleChange} required />
      <label>Seats available</label>
      <input type="number" min="1" max="8" name="totalSeats" value={form.totalSeats} onChange={handleChange} required />
      <button className="btn" type="submit">Post ride</button>
    </form>
  );
}
