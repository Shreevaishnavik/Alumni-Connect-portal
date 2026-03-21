import API_BASE from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import ApplicationStatusBadge from '../components/ApplicationStatusBadge';
import { useToast } from '../context/ToastContext';

const MyListings = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [listings, setListings] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/jobs/my/listings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleStatusUpdate = async (jobId, userId, status) => {
    try {
      await axios.put(`${API_BASE}/api/jobs/${jobId}/applicant/${userId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchListings();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div>
      <h2>My Listings</h2>
      {listings.length === 0 ? <p>You haven't posted any listings.</p> : (
        listings.map(job => (
          <div key={job._id} className="card">
            <div onClick={() => toggleExpand(job._id)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{job.title} <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-secondary)' }}>({job.isActive ? 'Active' : 'Inactive'})</span></h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Applicants: {job.applicants.length} | Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <span style={{ textTransform: 'capitalize', padding: '4px 8px', background: 'var(--bg)', borderRadius: '4px' }}>{job.type}</span>
              </div>
            </div>

            {expandedId === job._id && (
              <div style={{ marginTop: '20px', paddingBefore: '20px', borderTop: '1px solid var(--border)' }}>
                <h4>Applicants</h4>
                {job.applicants.length === 0 ? <p>No applicants yet.</p> : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '8px' }}>Name</th>
                        <th style={{ padding: '8px' }}>Email</th>
                        <th style={{ padding: '8px' }}>Applied On</th>
                        <th style={{ padding: '8px' }}>Status</th>
                        <th style={{ padding: '8px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.applicants.map((app, idx) => (
                        <tr key={app.userId?._id || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px' }}>{app.userId?.name}</td>
                          <td style={{ padding: '8px' }}>{app.userId?.email}</td>
                          <td style={{ padding: '8px' }}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                          <td style={{ padding: '8px' }}><ApplicationStatusBadge status={app.status} /></td>
                          <td style={{ padding: '8px' }}>
                            {app.userId ? (
                              <select
                                value={app.status}
                                onChange={(e) => handleStatusUpdate(job._id, app.userId._id, e.target.value)}
                                style={{ width: 'auto', marginBottom: 0, padding: '4px' }}
                              >
                                <option value="applied">Applied</option>
                                <option value="under_review">Under Review</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            ) : <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>User deleted</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyListings;
