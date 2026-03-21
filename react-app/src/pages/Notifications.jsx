import API_BASE from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

const typeIcon = (type) => {
  if (type === 'new_message') return '💬';
  if (type === 'connection_request' || type === 'connection_accepted') return '🤝';
  if (type === 'job_application' || type === 'application_status') return '💼';
  return '🔔';
};

const Notifications = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/notify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await axios.put(`${API_BASE}/api/notify/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id, alreadyRead) => {
    if (alreadyRead) return;
    try {
      await axios.put(`${API_BASE}/api/notify/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Notifications</h2>
        {unreadCount > 0 && (
          <button className="btn-primary" onClick={markAllRead}>
            Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No notifications.</p>
      ) : (
        notifications.map(notif => (
          <div
            key={notif._id}
            className="card"
            onClick={() => markAsRead(notif._id, notif.read)}
            style={{
              display: 'flex',
              gap: '15px',
              alignItems: 'flex-start',
              padding: '15px',
              cursor: notif.read ? 'default' : 'pointer',
              background: notif.read ? 'var(--card-bg, white)' : '#e8f5e9',
              marginBottom: '10px',
              transition: 'background 0.2s'
            }}
          >
            <div style={{ fontSize: '24px', paddingTop: '2px' }}>
              {typeIcon(notif.type)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong>{notif.fromUser?.name || 'System'}</strong>
                <small style={{ color: 'var(--text-secondary)' }}>
                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{notif.message}</p>
            </div>
            {!notif.read && (
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success, #4caf50)', marginTop: '8px', flexShrink: 0 }} />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
