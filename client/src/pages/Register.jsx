import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'passenger' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Create account</h2>
      {error && <p className="error">{error}</p>}
      <label>Full name</label>
      <input name="name" value={form.name} onChange={handleChange} required />
      <label>Email</label>
      <input type="email" name="email" value={form.email} onChange={handleChange} required />
      <label>Phone (10 digits)</label>
      <input name="phone" value={form.phone} onChange={handleChange} maxLength={10} required />
      <label>Password (min 6 characters)</label>
      <input type="password" name="password" value={form.password} onChange={handleChange} required />
      <label>I want to</label>
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="passenger">Find rides (passenger)</option>
        <option value="driver">Offer rides (driver)</option>
      </select>
      <button className="btn" type="submit">Register</button>
      <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}
