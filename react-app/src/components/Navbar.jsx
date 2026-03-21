import API_BASE from '../config/api';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from 'axios';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && token) {
      axios.get(`${API_BASE}/api/notify/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setUnreadCount(res.data.count))
        .catch(() => {});
    }
  }, [user, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    color: 'white',
    textDecoration: 'none',
    fontWeight: isActive(path) ? 'bold' : 'normal',
    borderBottom: isActive(path) ? '2px solid white' : '2px solid transparent',
    paddingBottom: '2px'
  });

  return (
    <nav style={{ background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center', height: '60px' }}>
      <h2 style={{ margin: 0 }}>Alumni Connect</h2>
      {user && (
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
          <Link to="/directory" style={linkStyle('/directory')}>Directory</Link>
          <Link to="/opportunities" style={linkStyle('/opportunities')}>Opportunities</Link>
          <Link to="/notifications" style={linkStyle('/notifications')}>
            Notifications {unreadCount > 0 && <span style={{ background: 'red', borderRadius: '50%', padding: '2px 6px', fontSize: '12px' }}>{unreadCount}</span>}
          </Link>
          <Link to="/networking" style={linkStyle('/networking')}>
            Networking
          </Link>
          <Link to="/profile" style={linkStyle('/profile')}>My Profile</Link>

          {user.role === 'alumni' && (
            <>
              <Link to="/my-listings" style={linkStyle('/my-listings')}>My Listings</Link>
              <Link to="/post-job" style={linkStyle('/post-job')}>Post Job</Link>
            </>
          )}

          {user.role === 'student' && (
            <Link to="/my-applications" style={linkStyle('/my-applications')}>My Applications</Link>
          )}

          {user.role === 'admin' && (
            <Link to="/admin" style={linkStyle('/admin')}>Admin Panel</Link>
          )}

          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '4px 10px' }}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
