import React, { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import { Link } from 'react-router-dom';


const Dashboard = () => {
  const { user, token } = useAuth();
  const [meData, setMeData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (token) {
      axios.get('http://localhost:5000/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setMeData(res.data))
        .catch(console.error);
        
      if (user?.role === 'alumni') {
        axios.get('http://localhost:5000/api/jobs/my/listings', { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            const listings = res.data;
            const totalApplicants = listings.reduce((acc, curr) => acc + curr.applicants.length, 0);
            setStats({ listingCount: listings.length, totalApplicants });
          })
          .catch(console.error);
      }
      
      if (user?.role === 'admin') {
        Promise.all([
          axios.get('http://localhost:5000/api/users/admin/all?limit=1000', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/jobs?limit=1000', { headers: { Authorization: `Bearer ${token}` } })
        ]).then(([usersRes, jobsRes]) => {
          setStats({ usersCount: usersRes.data.length, jobsCount: jobsRes.data.length });
        }).catch(console.error);
      }
    }
  }, [user, token]);

  const handleConnectionResponse = async (requesterId, action) => {
    try {
      await axios.put(`http://localhost:5000/api/users/connect/${requesterId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMeData(prev => ({
        ...prev,
        connectionRequests: prev.connectionRequests.filter(req => req.from._id !== requesterId)
      }));
    } catch (err) {
      alert('Failed to process request');
    }
  };

  if (!meData) return <div>Loading...</div>;

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
