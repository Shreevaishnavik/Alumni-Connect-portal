import API_BASE from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';

const MyProfile = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setEditForm({
        name: res.data.name || '',
        company: res.data.company || '',
        designation: res.data.designation || '',
        bio: res.data.bio || '',
        skills: Array.isArray(res.data.skills) ? [...res.data.skills] : [],
        batch: res.data.batch || '',
        department: res.data.department || ''
      });
    } catch (err) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editForm.name,
        company: editForm.company,
        designation: editForm.designation,
        bio: editForm.bio,
        skills: editForm.skills,
        batch: editForm.batch ? Number(editForm.batch) : undefined,
        department: editForm.department
      };
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      await axios.put(`${API_BASE}/api/users/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchProfile();
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    }
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !editForm.skills.includes(trimmed)) {
      setEditForm(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill) => {
    setEditForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const roleBadgeColor = {
    alumni: '#1E3A5F',
    student: '#27AE60',
    admin: '#E74C3C'
  };

  // Role-aware field labels:
  // Students: "College/University" and "Course/Program" instead of Company/Designation
  const isStudent = profile?.role === 'student';
  const companyLabel     = isStudent ? 'College / University' : 'Company';
  const companyPlaceholder = isStudent ? 'e.g. MIT, IIT Bombay, VIT...' : 'Company name';
  const designationLabel   = isStudent ? 'Course / Program' : 'Designation';
  const designationPlaceholder = isStudent ? 'e.g. B.Tech CSE, BCA, MCA...' : 'Your role/title';

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  if (!profile) return <div>Could not load profile.</div>;

  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0' }}>{profile.name}</h2>
          <span style={{
            background: roleBadgeColor[profile.role] || '#666',
            color: 'white', padding: '3px 10px', borderRadius: '12px',
            fontSize: '12px', textTransform: 'capitalize'
          }}>
            {profile.role}
          </span>
        </div>
        <button className="btn-secondary" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave}>
          <label>Full Name</label>
          <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Full Name" />

          <label>{companyLabel}</label>
          <input type="text" value={editForm.company} onChange={e => setEditForm({ ...editForm, company: e.target.value })} placeholder={companyPlaceholder} />

          <label>{designationLabel}</label>
          <input type="text" value={editForm.designation} onChange={e => setEditForm({ ...editForm, designation: e.target.value })} placeholder={designationPlaceholder} />

          <label>Batch Year</label>
          <input type="number" value={editForm.batch} onChange={e => setEditForm({ ...editForm, batch: e.target.value })} placeholder="e.g. 2025" />

          <label>Department</label>
          <input type="text" value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })} placeholder="e.g. Computer Science" />

          <label>Bio</label>
          <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} placeholder="Tell us about yourself..." rows="4" />

          <label>Skills</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {editForm.skills.map((skill, i) => (
              <span key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--danger)', fontWeight: 'bold', fontSize: '14px' }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Add a skill"
              value={newSkill}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              style={{ marginBottom: 0 }}
            />
            <button type="button" className="btn-secondary" onClick={addSkill}>Add</button>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '20px', width: '100%' }}>Save Changes</button>
        </form>
      ) : (
        <div>
          {/* Role-aware display */}
          {profile.designation && (
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 5px 0', fontSize: '16px' }}>
              <strong>{designationLabel}:</strong> {profile.designation}
            </p>
          )}
          {profile.company && (
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 10px 0', fontSize: '16px' }}>
              <strong>{companyLabel}:</strong> {profile.company}
            </p>
          )}
          <p style={{ marginBottom: '5px' }}><strong>Email:</strong> {profile.email}</p>
          {profile.batch && <p style={{ marginBottom: '5px' }}><strong>Batch:</strong> {profile.batch}</p>}
          {profile.department && <p style={{ marginBottom: '5px' }}><strong>Department:</strong> {profile.department}</p>}
          {profile.bio && (
            <div style={{ margin: '15px 0' }}>
              <strong>Bio</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>{profile.bio}</p>
            </div>
          )}
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <strong>Skills</strong>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {profile.skills.map((s, i) => (
                  <span key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '16px' }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          <p style={{ marginTop: '20px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            Member since {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
