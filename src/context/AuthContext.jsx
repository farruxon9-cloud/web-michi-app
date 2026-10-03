// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  loginUser, 
  registerUser, 
  fetchCurrentUser, 
  logoutUser, 
  getStoredUser, 
  getStoredToken 
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [userRole, setUserRoleState] = useState(() => {
    const stored = getStoredUser();
    if (stored?.role) return stored.role;
    try {
      if (localStorage.getItem('michi_guest_session') === 'true') return 'guest';
    } catch {}
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const setUserRole = useCallback((role) => {
    setUserRoleState(role);
    try {
      if (role === 'guest') {
        localStorage.setItem('michi_guest_session', 'true');
      } else {
        localStorage.removeItem('michi_guest_session');
      }
    } catch {}
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      try {
        if (localStorage.getItem('michi_guest_session') === 'true') {
          setUserRoleState('guest');
        } else {
          setUserRoleState(null);
        }
      } catch {}
      setIsLoading(false);
      return null;
    }

    try {
      const currentUser = await fetchCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setUserRole(currentUser.role || 'driver');
        setIsLoading(false);
        return currentUser;
      }
      // Token was rejected by the server → clear stale in-memory session
      if (!getStoredToken()) {
        setUser(null);
        setUserRoleState(null);
      }
    } catch (err) {
      // fetchCurrentUser already falls back to the cached session on network errors,
      // so reaching here is unexpected — keep the user signed in rather than logging out offline.
      console.warn('AuthContext refresh error:', err);
    }
    
    setIsLoading(false);
    return null;
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res.user) {
        setUser(res.user);
        setUserRole(res.user.role || 'driver');
      }
      setIsLoading(false);
      return res;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const handleRegister = async (userData) => {
    setIsLoading(true);
    try {
      const res = await registerUser(userData);
      if (res.user) {
        setUser(res.user);
        setUserRole(res.user.role || 'driver');
      }
      setIsLoading(false);
      return res;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const handleLogout = () => {
    logoutUser();
    try {
      localStorage.removeItem('michi_guest_session');
    } catch {}
    setUser(null);
    setUserRole(null);
  };

  const value = {
    user,
    userRole,
    setUserRole,
    isAuthenticated: Boolean(user && getStoredToken()),
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
