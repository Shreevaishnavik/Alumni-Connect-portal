import API_BASE from '../config/api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ProfileCard from '../components/ProfileCard';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Directory = () => {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [meData, setMeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [connecting, setConnecting] = useState(null);
  const navigate = useNavigate();

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (search) params.search = search;

      const [dirRes, meRes] = await Promise.all([
        axios.get(`${API_BASE}/api/users/directory`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        }),
        axios.get(`${API_BASE}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setUsers(dirRes.data.users);
      setMeData(meRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [filters, search]);

  const handleConnect = async (targetId) => {
    setConnecting(targetId);
    try {
      await axios.post(`${API_BASE}/api/users/connect/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSentRequests(prev => new Set([...prev, targetId.toString()]));
    } catch (err) {
      showToast(err.response?.data?.message || 'Error sending request', 'error');
    } finally {
      setConnecting(null);
    }
  };

  const getConnectionStatus = (targetId) => {
    if (!meData) return null;
    if (meData.connections.some(c => c.toString() === targetId.toString())) return 'connected';
    if (sentRequests.has(targetId.toString())) return 'pending';
    return null;
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div>
      <h2>Alumni Directory</h2>
      <SearchBar onSearch={setSearch} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px' }}>
        <div>
          <FilterPanel onFilter={setFilters} />
        </div>
        <div>
          {users.length === 0 ? <p>No alumni found.</p> : (
            users.map(u => (
              <div key={u._id} onClick={(e) => {
                if (e.target.tagName !== 'BUTTON') {
                  navigate(`/alumni/${u._id}`);
                }
              }} style={{ cursor: 'pointer' }}>
                <ProfileCard
                  user={u}
                  onConnect={handleConnect}
                  connectionStatus={getConnectionStatus(u._id)}
                  connecting={connecting === u._id}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Directory;
