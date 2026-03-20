import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

const AlumniProfile = () => {
  const { id } = useParams();
  const { token, user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [meData, setMeData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [profRes, meRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/users/profile/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProfile(profRes.data);
      setEditForm(profRes.data);
      setMeData(meRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async () => {
    try {
      await axios.post(`http://localhost:5000/api/users/connect/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      alert('Request sent');
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Only send the fields allowed by the Joi updateProfileSchema
      // Sending the full editForm (entire user object) causes Joi to reject
      // unknown fields like _id, email, role, connections, etc. → 400 error
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
      // Remove undefined keys to keep the payload clean
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await axios.put('http://localhost:5000/api/users/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchData();
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!profile || !meData) return <div>Loading...</div>;

  // Use .some() + toString() to reliably compare serialized ObjectId strings
  const isConnected = meData.connections.some(c => c.toString() === profile._id.toString());
  const isPending = profile.connectionRequests?.some(r => r.from?.toString() === meData._id?.toString() && r.status === 'pending');
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
          <input type="text" value={editForm.name || ''} onChange={e=>setEditForm({...editForm, name: e.target.value})} placeholder="Full Name" />
          <label>Designation</label>
          <input type="text" value={editForm.designation || ''} onChange={e=>setEditForm({...editForm, designation: e.target.value})} placeholder="Designation" />
          <label>Company</label>
          <input type="text" value={editForm.company || ''} onChange={e=>setEditForm({...editForm, company: e.target.value})} placeholder="Company" />
          <label>Batch Year</label>
          <input type="number" value={editForm.batch || ''} onChange={e=>setEditForm({...editForm, batch: e.target.value})} placeholder="Batch Year" />
          <label>Department</label>
          <input type="text" value={editForm.department || ''} onChange={e=>setEditForm({...editForm, department: e.target.value})} placeholder="Department" />
          <label>Bio</label>
          <textarea value={editForm.bio || ''} onChange={e=>setEditForm({...editForm, bio: e.target.value})} placeholder="Bio" rows="4"></textarea>
          <label>Skills</label>
          <input type="text" value={Array.isArray(editForm.skills) ? editForm.skills.join(', ') : editForm.skills} onChange={e=>setEditForm({...editForm, skills: e.target.value})} placeholder="Skills (comma separated)" />
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
                <a href={`http://localhost:4200/chat/${profile._id}?userId=${currentUser.id}&token=${token}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Open Chat</a>
              ) : isPending ? (
                <button className="btn-secondary" disabled>Request Pending</button>
              ) : (
                <button className="btn-primary" onClick={handleConnect}>Send Request</button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlumniProfile;
