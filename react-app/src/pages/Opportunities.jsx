import API_BASE from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import JobCard from '../components/JobCard';
import { useToast } from '../context/ToastContext';

const Opportunities = () => {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ type: 'all', skills: '' });
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.skills) params.skills = filters.skills;

      const res = await axios.get(`${API_BASE}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleApply = async (jobId) => {
    try {
      await axios.post(`${API_BASE}/api/jobs/${jobId}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Applied successfully!', 'success');
      fetchJobs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error applying', 'error');
    }
  };

  return (
    <div>
      <h2>Opportunities</h2>
      <div className="card" style={{ display: 'flex', gap: '15px', background: 'var(--bg)' }}>
        <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} style={{ width: '200px', marginBottom: 0 }}>
          <option value="all">All Types</option>
          <option value="job">Job</option>
          <option value="internship">Internship</option>
          <option value="mentorship">Mentorship</option>
        </select>
        <input
          type="text"
          placeholder="Filter by skills (comma separated)"
          value={filters.skills}
          onChange={e => setFilters({...filters, skills: e.target.value})}
          style={{ marginBottom: 0 }}
        />
        <button className="btn-secondary" onClick={() => setFilters({ type: 'all', skills: '' })}>Clear</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {jobs.length === 0 ? <p>No opportunities found.</p> : (
            jobs.map(job => (
              <JobCard
                key={job._id}
                job={job}
                onApply={handleApply}
                hasApplied={job.applicants?.some(a => a.userId?.toString() === user?.id?.toString())}
                isStudent={user?.role === 'student'}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Opportunities;
