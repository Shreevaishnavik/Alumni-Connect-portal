import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Decode JWT and check expiry. Returns null if token is missing, invalid, or expired.
const decodeToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Check expiry: payload.exp is in seconds, Date.now() is in milliseconds
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token is expired — clear it immediately so we don't carry stale state
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      return null;
    }
    return { id: payload.id, role: payload.role };
  } catch (e) {
    return null;
  }
};

const storedToken = localStorage.getItem('token') || null;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(storedToken);
  // Decode synchronously on first render — catches expired tokens immediately
  const [user, setUser] = useState(() => decodeToken(storedToken));

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    if (userData && userData._id) {
      localStorage.setItem('userId', userData._id);
    }
    setToken(newToken);
    setUser(decodeToken(newToken));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUser(null);
  };

  // Global axios interceptor: auto-logout on any 401 Unauthorized response.
  // This handles mid-session token expiry without requiring per-page error handling.
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Only log out if there is a current session — avoid logout loops on the login page itself
          const currentToken = localStorage.getItem('token');
          if (currentToken) {
            logout();
            // Redirect to login — use window.location so the router resets fully
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor when provider unmounts (StrictMode safety)
    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
