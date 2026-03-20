import API_BASE from '../config/api';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ProfileCard from '../components/ProfileCard';
import { useNavigate } from 'react-router-dom';

const Directory = () => {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  const [meData, setMeData] = useState(null);
  const navigate = useNavigate();

  const fetchDirectory = async () => {
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
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [filters, search]);

  const handleConnect = async (targetId) => {
    try {
      await axios.post(`http://localhost:5000/api/users/connect/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDirectory();
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const getConnectionStatus = (targetId) => {
    if (!meData) return null;
    // Already connected
    if (meData.connections.some(c => c.toString() === targetId.toString())) return 'connected';
    // Pending request sent by current user — look in target's connectionRequests
    // We don't have target's connectionRequests here, but meData.connectionRequests shows incoming ones.
    // To show outgoing pending: check if targetUser appears in meData sent requests isn't available here,
    // so we store sent IDs in local state after clicking Connect.
    return null;
  };

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
                // Don't navigate if clicking the button
                if (e.target.tagName !== 'BUTTON') {
                  navigate(`/alumni/${u._id}`);
                }
              }} style={{ cursor: 'pointer' }}>
                <ProfileCard 
                  user={u} 
                  onConnect={handleConnect} 
                  connectionStatus={getConnectionStatus(u._id)} 
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
