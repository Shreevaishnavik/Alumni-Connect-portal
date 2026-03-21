import API_BASE from '../config/api';
import React, { useState } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const PostJob = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', company: '', type: 'job', description: '', requiredSkills: '', deadline: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      await axios.post(`${API_BASE}/api/jobs`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Job posted successfully!', 'success');
      navigate('/my-listings');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error posting job', 'error');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Post an Opportunity</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Job Title" onChange={handleChange} required />
        <input type="text" name="company" placeholder="Company Name" onChange={handleChange} required />
        <select name="type" onChange={handleChange} value={formData.type}>
          <option value="job">Job</option>
          <option value="internship">Internship</option>
          <option value="mentorship">Mentorship</option>
        </select>
        <textarea name="description" placeholder="Description" rows="5" onChange={handleChange} required></textarea>
        <input type="text" name="requiredSkills" placeholder="Required Skills (comma separated)" onChange={handleChange} />
        <label style={{ display: 'block', marginBottom: '5px' }}>Deadline (optional)</label>
        <input type="date" name="deadline" onChange={handleChange} />

        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Post</button>
      </form>
    </div>
  );
};

export default PostJob;
