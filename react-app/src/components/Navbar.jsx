import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from 'axios';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && token) {
      axios.get('http://localhost:5000/api/notify/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setUnreadCount(res.data.count))
        .catch(() => {});
    }
  }, [user, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ background: 'var(--primary)', color: 'white', display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center', height: '60px' }}>
      <h2 style={{ margin: 0 }}>Alumni Connect</h2>
      {user && (
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/directory" style={{ color: 'white', textDecoration: 'none' }}>Directory</Link>
          <Link to="/opportunities" style={{ color: 'white', textDecoration: 'none' }}>Opportunities</Link>
          
          <Link to="/notifications" style={{ color: 'white', textDecoration: 'none' }}>
            Notifications {unreadCount > 0 && <span style={{ background: 'red', borderRadius: '50%', padding: '2px 6px', fontSize: '12px' }}>{unreadCount}</span>}
          </Link>
          <Link to="/networking" style={{ color: 'white', textDecoration: 'none' }}>
            Networking
          </Link>

          {user.role === 'alumni' && (
            <>
              <Link to="/my-listings" style={{ color: 'white', textDecoration: 'none' }}>My Listings</Link>
              <Link to="/post-job" style={{ color: 'white', textDecoration: 'none' }}>Post Job</Link>
            </>
          )}

          {user.role === 'student' && (
            <Link to="/my-applications" style={{ color: 'white', textDecoration: 'none' }}>My Applications</Link>
          )}

          {user.role === 'admin' && (
            <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin Panel</Link>
          )}

          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '4px 10px' }}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
