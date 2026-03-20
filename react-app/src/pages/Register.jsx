import React, { useState } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student', batch: '', department: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, batch: Number(formData.batch) };
      const res = await axios.post('http://localhost:5000/api/users/register', payload);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container card">
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password (min 6 chars)" onChange={handleChange} required />
        <select name="role" onChange={handleChange} value={formData.role}>
          <option value="student">Student</option>
          <option value="alumni">Alumni</option>
        </select>
        <input type="number" name="batch" placeholder="Batch Year (e.g. 2024)" onChange={handleChange} required />
        <input type="text" name="department" placeholder="Department" onChange={handleChange} required />
        
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Register</button>
      </form>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
};

export default Register;
