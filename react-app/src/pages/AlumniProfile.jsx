import API_BASE, { ANGULAR_URL } from '../config/api';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const AlumniProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [meData, setMeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, meRes] = await Promise.all([
        axios.get(`${API_BASE}/api/users/profile/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProfile(profRes.data);
      setEditForm(profRes.data);
      setMeData(meRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      await axios.post(`${API_BASE}/api/users/connect/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      showToast('Connection request sent!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error sending request', 'error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { name, company, designation, bio, skills, batch, department } = editForm;
      const payload = {
        name,
        company,
        designation,
        bio,
        batch: batch ? Number(batch) : undefined,
        department,
        skills: typeof skills === 'string'
          ? skills.split(',').map(s => s.trim()).filter(s => s)
          : skills
      };
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await axios.put(`${API_BASE}/api/users/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchData();
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!profile || !meData) return <div>Could not load profile.</div>;

  const isConnected = meData.connections.some(c => c.toString() === profile._id.toString());
  const isPending = profile.connectionRequests?.some(
    r => (r.from?._id?.toString() || r.from?.toString()) === meData._id?.toString()
    && r.status === 'pending'
  );
  const isOwnProfile = currentUser.id === profile._id;

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>{profile.name}</h2>
        {isOwnProfile && <button className="btn-secondary" onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</button>}
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <label>Full Name</label>
          <input type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="Full Name" />
          <label>Designation</label>
          <input type="text" value={editForm.designation || ''} onChange={e => setEditForm({...editForm, designation: e.target.value})} placeholder="Designation" />
          <label>Company</label>
          <input type="text" value={editForm.company || ''} onChange={e => setEditForm({...editForm, company: e.target.value})} placeholder="Company" />
          <label>Batch Year</label>
          <input type="number" value={editForm.batch || ''} onChange={e => setEditForm({...editForm, batch: e.target.value})} placeholder="Batch Year" />
          <label>Department</label>
          <input type="text" value={editForm.department || ''} onChange={e => setEditForm({...editForm, department: e.target.value})} placeholder="Department" />
          <label>Bio</label>
          <textarea value={editForm.bio || ''} onChange={e => setEditForm({...editForm, bio: e.target.value})} placeholder="Bio" rows="4"></textarea>
          <label>Skills</label>
          <input type="text" value={Array.isArray(editForm.skills) ? editForm.skills.join(', ') : editForm.skills} onChange={e => setEditForm({...editForm, skills: e.target.value})} placeholder="Skills (comma separated)" />
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      ) : (
        <div>
          <h4 style={{ color: 'var(--text-secondary)' }}>{profile.designation} {profile.company && `at ${profile.company}`}</h4>
          <p><strong>Batch:</strong> {profile.batch} | <strong>Dept:</strong> {profile.department}</p>
          <p><strong>Bio:</strong> {profile.bio || 'No bio provided.'}</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '15px 0' }}>
            {profile.skills?.map((s, i) => (
              <span key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '16px' }}>{s}</span>
            ))}
          </div>

          {!isOwnProfile && (
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              {isConnected ? (
                <a href={`${ANGULAR_URL}/chat/${profile._id}?userId=${currentUser.id}&token=${token}&backendUrl=${encodeURIComponent(API_BASE || window.location.origin)}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Open Chat</a>
              ) : isPending ? (
                <button className="btn-secondary" disabled>Request Pending</button>
              ) : (
                <button className="btn-primary" onClick={handleConnect}>Send Request</button>
              )}
            </div>
          )}

          {/* Display Connections List */}
          <div style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Connections ({profile.connections?.length || 0})</h3>
            
            {profile.connections && profile.connections.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {profile.connections.map(conn => (
                  <div 
                    key={conn._id} 
                    className="card" 
                    style={{ padding: '15px', cursor: 'pointer', margin: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                    onClick={() => {
                      navigate(`/alumni/${conn._id}`);
                      window.scrollTo(0, 0); // Scroll to top when changing profile
                    }}
                  >
                    <h5 style={{ margin: '0 0 5px 0' }}>{conn.name}</h5>
                    <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                      {conn.designation} {conn.company && `at ${conn.company}`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                This user doesn't have any connections yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniProfile;
