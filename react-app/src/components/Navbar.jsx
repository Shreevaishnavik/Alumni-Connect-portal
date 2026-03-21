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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (user && token) {
      axios.get(`${API_BASE}/api/notify/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setUnreadCount(res.data.count))
        .catch(() => {});
    }
  }, [user, token]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      height: '70px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 32px',
      background: scrolled
        ? 'rgba(255, 255, 255, 0.8)'
        : 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      borderBottom: scrolled ? '1px solid rgba(108, 56, 255, 0.1)' : '1px solid transparent',
      boxShadow: scrolled ? '0 10px 40px rgba(108, 56, 255, 0.08)' : 'none',
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* Brand */}
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 800,
          background: 'var(--grad-ui)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.01em',
        }}>
          Alumni Connect
        </h2>
      </Link>

      {/* Navigation Links */}
      {user && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/directory', label: 'Directory' },
            { to: '/opportunities', label: 'Opportunities' },
            { to: '/networking', label: 'Networking' },
            { to: '/profile', label: 'My Profile' },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} label={label} active={isActive(to)} />
          ))}

          {/* Notifications with badge */}
          <Link to="/notifications" style={{
            position: 'relative',
            color: isActive('/notifications') ? 'var(--primary)' : 'var(--text-secondary)',
            textDecoration: 'none',
            fontSize: '15px',
            fontWeight: isActive('/notifications') ? 600 : 500,
            padding: '8px 16px',
            borderRadius: '8px',
            background: isActive('/notifications') ? 'rgba(108, 56, 255, 0.08)' : 'transparent',
            transition: 'all 0.2s ease',
          }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px',
                background: 'var(--accent)', color: 'white',
                borderRadius: '50%', width: '18px', height: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700,
                boxShadow: '0 2px 6px rgba(236, 72, 153, 0.4)',
              }}>
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Role-based links */}
          {user.role === 'alumni' && (
            <>
              <NavLink to="/my-listings" label="My Listings" active={isActive('/my-listings')} />
              <NavLink to="/post-job" label="Post Job" active={isActive('/post-job')} />
            </>
          )}
          {user.role === 'student' && (
            <NavLink to="/my-applications" label="My Applications" active={isActive('/my-applications')} />
          )}
          {user.role === 'admin' && (
            <NavLink to="/admin" label="Admin Panel" active={isActive('/admin')} />
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              marginLeft: '12px', padding: '8px 20px', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600, fontFamily: "'Inter', sans-serif",
              cursor: 'pointer', border: 'none',
              background: 'rgba(30, 26, 52, 0.05)',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(239, 68, 68, 0.1)'; e.target.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(30, 26, 52, 0.05)'; e.target.style.color = 'var(--text-secondary)'; }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, label, active }) => (
  <Link to={to} style={{
    color: active ? 'var(--primary)' : 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: active ? 600 : 500,
    padding: '8px 16px',
    borderRadius: '8px',
    background: active ? 'rgba(108, 56, 255, 0.08)' : 'transparent',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  }}>
    {label}
  </Link>
);

export default Navbar;
