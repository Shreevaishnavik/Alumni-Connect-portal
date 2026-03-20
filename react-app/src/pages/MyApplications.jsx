import API_BASE from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import ApplicationStatusBadge from '../components/ApplicationStatusBadge';

const MyApplications = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/jobs/my/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchApps();
  }, [token]);

  return (
    <div>
      <h2>My Applications</h2>
      {applications.length === 0 ? <p>You haven't applied to any opportunities.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {applications.map((app, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', fontSize: '12px' }}>{app.job.type}</span>
                <ApplicationStatusBadge status={app.status} />
              </div>
              <h3 style={{ margin: '0 0 5px 0' }}>{app.job.title}</h3>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{app.job.company}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
