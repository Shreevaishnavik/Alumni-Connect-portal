import API_BASE from '../config/api';
import React, { useState } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', batch: '', department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData, batch: Number(formData.batch) };
      const res = await axios.post(`${API_BASE}/api/users/register`, payload);
      login(res.data.token, res.data.user);
      // replace: true so back button doesn't return to register form after registering
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container card">
      <h2>Register</h2>
      {error && <p style={{ color: 'var(--danger)', marginBottom: '12px' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required autoComplete="name" />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required autoComplete="email" />
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password (min 6 chars)"
            onChange={handleChange}
            required
            style={{ paddingRight: '40px' }}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-60%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '16px' }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <select name="role" onChange={handleChange} value={formData.role}>
          <option value="student">Student</option>
          <option value="alumni">Alumni</option>
        </select>
        <input type="number" name="batch" placeholder="Batch Year (e.g. 2024)" onChange={handleChange} required />
        <input type="text" name="department" placeholder="Department" onChange={handleChange} required />
        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Please wait...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '16px' }}>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
};

export default Register;
