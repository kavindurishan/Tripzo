import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tripzo_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('tripzo_token', token);
      fetchUserProfile(token);
    } else {
      localStorage.removeItem('tripzo_token');
      localStorage.removeItem('tripzo_user');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('tripzo_user', JSON.stringify(data.user));
      } else {
        // Token invalid, clear session
        setToken(null);
      }
    } catch (err) {
      // Offline fallback: Use cached details if server is down
      const cachedUser = localStorage.getItem('tripzo_user');
      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
      }
      console.warn('Network issue fetching user profile, using cached if available.');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('tripzo_user', JSON.stringify(data.user));
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  };

  const register = async (username, fullName, email, phone, password) => {
    const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, fullName, email, phone, password })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('tripzo_user', JSON.stringify(data.user));
      return { success: true };
    } else {
      return { success: false, message: data.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
