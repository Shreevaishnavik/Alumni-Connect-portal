import API_BASE from '../config/api';
import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const [meData, setMeData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [user, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const meRes = await axios.get(`${API_BASE}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
      setMeData(meRes.data);

      if (user?.role === 'alumni') {
        const listingsRes = await axios.get(`${API_BASE}/api/jobs/my/listings`, { headers: { Authorization: `Bearer ${token}` } });
        const listings = listingsRes.data;
        const totalApplicants = listings.reduce((acc, curr) => acc + curr.applicants.length, 0);
        setStats({ listingCount: listings.length, totalApplicants });
      }

      if (user?.role === 'admin') {
        const [usersRes, jobsRes] = await Promise.all([
          axios.get(`${API_BASE}/api/users/admin/all?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/api/jobs?limit=1000`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats({ usersCount: usersRes.data.length, jobsCount: jobsRes.data.length });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionResponse = async (requesterId, action) => {
    try {
      await axios.put(`${API_BASE}/api/users/connect/${requesterId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeData(prev => ({
        ...prev,
        connectionRequests: prev.connectionRequests.filter(req => req.from._id !== requesterId)
      }));
    } catch (err) {
      showToast('Failed to process request', 'error');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!meData) return <div>Could not load dashboard.</div>;

  const pendingRequests = meData.connectionRequests.filter(r => r.status === 'pending');

  return (
    <div>
      {/* user from JWT only has {id, role} — use meData for the name */}
      <h2>Welcome back, {meData.name}!</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div>
          <div className="card">
            <h3>Pending Connection Requests</h3>
            {pendingRequests.length === 0 ? <p>No pending requests.</p> : (
              pendingRequests.map(req => (
                <div key={req.from._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '10px', background: 'var(--bg)', borderRadius: '4px' }}>
                  <div>
                    <strong>{req.from.name}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{req.from.designation}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="btn-primary" onClick={() => handleConnectionResponse(req.from._id, 'accept')}>Accept</button>
                    <button className="btn-secondary" onClick={() => handleConnectionResponse(req.from._id, 'decline')}>Decline</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {user.role === 'student' && (
             <div className="card">
               <h3>Quick Links</h3>
               <Link to="/my-applications" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>View My Applications</Link>
             </div>
          )}
        </div>

        <div>
          {user.role === 'alumni' && stats && (
            <div className="card">
              <h3>Alumni Stats</h3>
              <p>Active Listings: <strong>{stats.listingCount}</strong></p>
              <p>Total Applicants: <strong>{stats.totalApplicants}</strong></p>
            </div>
          )}
          {user.role === 'admin' && stats && (
            <div className="card">
              <h3>Platform Stats</h3>
              <p>Total Users: <strong>{stats.usersCount}</strong></p>
              <p>Total Job Listings: <strong>{stats.jobsCount}</strong></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
