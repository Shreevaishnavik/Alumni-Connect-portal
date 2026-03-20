import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

const AdminPanel = () => {
  const { token } = useAuth();
  const [tab, setTab] = useState('users'); // users, listings, stats
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchJobs();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) { }
  };

  const fetchJobs = async () => {
    try {
      // Actually /api/jobs only returns active jobs and needs no admin check,
      // But for admin to delete, they can use it.
      const res = await axios.get('http://localhost:5000/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    } catch (err) { }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm('Are you sure?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/admin/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { alert('Failed to delete user'); }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.put(`http://localhost:5000/api/users/admin/${id}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      fetchUsers();
    } catch (err) { alert('Failed to change role'); }
  };

  const handleDeleteJob = async (id) => {
    if(!window.confirm('Delete this listing?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/jobs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchJobs();
    } catch (err) { alert('Failed to delete listing'); }
  };

  const renderStats = () => {
    const studentsCount = users.filter(u => u.role === 'student').length;
    const alumniCount = users.filter(u => u.role === 'alumni').length;
    const totalApplications = jobs.reduce((acc, job) => acc + (job.applicants ? job.applicants.length : 0), 0);

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3>User Stats</h3>
          <p>Total Students: {studentsCount}</p>
          <p>Total Alumni: {alumniCount}</p>
          <p>Admins: {users.filter(u => u.role === 'admin').length}</p>
        </div>
        <div className="card">
          <h3>Platform Stats</h3>
          <p>Total Job Listings: {jobs.length}</p>
          <p>Total Applications Submitted: {totalApplications}</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={tab === 'users' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('users')}>Manage Users</button>
        <button className={tab === 'listings' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('listings')}>Manage Listings</button>
        <button className={tab === 'stats' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('stats')}>Platform Stats</button>
      </div>

      {tab === 'stats' && renderStats()}

      {tab === 'users' && (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th>Name</th><th>Email</th><th>Role</th><th>Batch</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px' }}>{u.name}</td>
                  <td style={{ padding: '8px' }}>{u.email}</td>
                  <td style={{ padding: '8px' }}>
                    <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} style={{ margin: 0 }}>
                      <option value="student">Student</option>
                      <option value="alumni">Alumni</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '8px' }}>{u.batch || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>
                    <button onClick={() => handleDeleteUser(u._id)} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'listings' && (
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th>Title</th><th>Company</th><th>Type</th><th>Posted By</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px' }}>{j.title}</td>
                  <td style={{ padding: '8px' }}>{j.company}</td>
                  <td style={{ padding: '8px', textTransform: 'capitalize' }}>{j.type}</td>
                  <td style={{ padding: '8px' }}>{j.postedBy?.name || 'Unknown'}</td>
                  <td style={{ padding: '8px' }}>
                    <button onClick={() => handleDeleteJob(j._id)} style={{ background: 'var(--danger)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
