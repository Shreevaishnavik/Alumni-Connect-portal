import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

// Decode token synchronously so user is never null on first render
const decodeToken = (token) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.id, role: payload.role };
  } catch (e) {
    return null;
  }
};

const storedToken = localStorage.getItem('token') || null;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(storedToken);
  // Initialize user at the same time as token — fixes the race condition
  // where useEffect hadn't run yet and ProtectedRoute saw user===null
  const [user, setUser] = useState(() => decodeToken(storedToken));

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    if (userData && userData._id) {
      localStorage.setItem('userId', userData._id); // for Angular app compat
    }
    setToken(newToken);
    // Always decode user from the token so it's consistent with what
    // ProtectedRoute sees on fresh page loads
    setUser(decodeToken(newToken));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
