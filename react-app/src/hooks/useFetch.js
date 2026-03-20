import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const useFetch = (url, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api${url}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchData();
    }
  }, [url, token, ...dependencies]);

  return { data, loading, error, setData };
};

export default useFetch;
