import API_BASE from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Networking = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch conversations
      const convRes = await axios.get(`${API_BASE}/api/messages/conversations/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(convRes.data);

      // Fetch pending connection requests
      const meRes = await axios.get(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (meRes.data?.connectionRequests) {
        setPendingRequests(meRes.data.connectionRequests.filter(r => r.status === 'pending'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRequest = async (requesterId) => {
    try {
      await axios.put(`http://localhost:5000/api/users/connect/${requesterId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(prev => prev.filter(r => r.from._id !== requesterId));
      alert('Connection accepted!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting request');
    }
  };

  const getOtherParticipant = (participants) => {
    return participants?.find(p => p._id !== user?.id) || {};
  };

  const openChat = (conv) => {
    const other = getOtherParticipant(conv.participants);
    if (other._id) {
      navigate(`/alumni/${other._id}`);
    }
  };

  return (
    <div>
      <h2>Networking &amp; Connections</h2>

      {pendingRequests.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Pending Requests</h3>
          {pendingRequests.map(req => (
            <div key={req.from._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border, #eee)' }}>
              <div>
                <strong style={{ fontSize: '16px' }}>{req.from.name}</strong>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>{req.from.designation}</p>
              </div>
              <button className="btn-primary" onClick={() => acceptRequest(req.from._id)}>
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Recent Conversations</h3>
        {conversations.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No conversations yet.</p>
        ) : (
          conversations.map(conv => {
            const other = getOtherParticipant(conv.participants);
            return (
              <div
                key={conv._id}
                onClick={() => openChat(conv)}
                style={{ cursor: 'pointer', padding: '15px 0', borderBottom: '1px solid var(--border, #eee)', display: 'flex', alignItems: 'center', gap: '15px' }}
              >
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent, #1a73e8)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px', flexShrink: 0 }}>
                  {other.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0' }}>{other.name}</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{other.designation || (other.role ? other.role.charAt(0).toUpperCase() + other.role.slice(1) : 'User')}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Networking;
