import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [u, s] = await Promise.all([api('/admin/users'), api('/admin/stats')]);
      setUsers(u.users);
      setStats(s);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setError('');
    try {
      await api(`/admin/users/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Admin panel</h1>
      {error && <p className="error">{error}</p>}

      {stats && (
        <div className="stats">
          {stats.usersByRole.map((s) => (
            <div className="card stat" key={s._id}><h2>{s.count}</h2><p className="muted">{s._id}s</p></div>
          ))}
          {stats.bookingsByStatus.map((s) => (
            <div className="card stat" key={s._id}><h2>{s.count}</h2><p className="muted">{s._id} bookings</p></div>
          ))}
        </div>
      )}

      <h2>All users</h2>
      <table className="card table">
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.role}</td>
              <td>
                {u.role !== 'admin' && (
                  <button className="btn small danger" onClick={() => handleDelete(u._id)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
