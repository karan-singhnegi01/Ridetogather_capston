import { useEffect, useState } from 'react';
import { api } from '../api.js';
import RideCard from '../components/RideCard.jsx';

const emptyFilters = { source: '', destination: '', date: '', seats: '', maxFare: '', sort: 'time' };

export default function Home() {
  const [filters, setFilters] = useState(emptyFilters);
  const [rides, setRides] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async (p = 1, f = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: p });
      Object.entries(f).forEach(([k, v]) => v && params.append(k, v));
      const data = await api(`/rides?${params.toString()}`);
      setRides(data.rides);
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  const handleReset = () => {
    setFilters(emptyFilters);
    load(1, emptyFilters);
  };

  return (
    <div>
      <h1>Find a ride</h1>
      <p className="muted">Search rides going your way and request a seat.</p>

      <form className="card filter-form" onSubmit={handleSearch}>
        <input name="source" placeholder="From" value={filters.source} onChange={handleChange} />
        <input name="destination" placeholder="To" value={filters.destination} onChange={handleChange} />
        <input type="date" name="date" value={filters.date} onChange={handleChange} />
        <input type="number" min="1" name="seats" placeholder="Seats needed" value={filters.seats} onChange={handleChange} />
        <input type="number" min="0" name="maxFare" placeholder="Max fare" value={filters.maxFare} onChange={handleChange} />
        <select name="sort" value={filters.sort} onChange={handleChange}>
          <option value="time">Earliest first</option>
          <option value="fare_asc">Fare: low to high</option>
          <option value="fare_desc">Fare: high to low</option>
        </select>
        <button className="btn" type="submit">Search</button>
        <button className="btn outline" type="button" onClick={handleReset}>Reset</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p className="center">Loading rides...</p>}
      {!loading && rides.length === 0 && !error && (
        <p className="center muted">No rides found. Try changing the filters.</p>
      )}

      {rides.map((ride) => <RideCard key={ride._id} ride={ride} />)}

      {pages > 1 && (
        <div className="pagination">
          <button className="btn small" disabled={page <= 1} onClick={() => load(page - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button className="btn small" disabled={page >= pages} onClick={() => load(page + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
