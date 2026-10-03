// src/services/authService.js
import { API_ENDPOINTS } from '../config/api';
import { apiFetch } from './apiClient';

const TOKEN_KEY = 'michi_jwt_token';
const REFRESH_TOKEN_KEY = 'michi_refresh_token';
const USER_KEY = 'michi_user_session';
const AUTH_USER_KEY = 'michi_auth_user';

export const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to set token in storage:', err);
  }
};

export const getStoredRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredRefreshToken = (refreshToken) => {
  try {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } catch (err) {
    console.error('Failed to set refresh token in storage:', err);
  }
};

export const getStoredUser = () => {
  try {
    const data = localStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    if (user) {
      const safeUser = { ...user };
      delete safeUser.password;
      const userJson = JSON.stringify(safeUser);
      localStorage.setItem(USER_KEY, userJson);
      localStorage.setItem(AUTH_USER_KEY, userJson);
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (err) {
    console.error('Failed to set user in storage:', err);
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Login muvaffaqiyatsiz bo\'ldi');
    }

    const accessToken = data.token || data.accessToken;
    if (accessToken) {
      setStoredToken(accessToken);
    }
    if (data.refreshToken) {
      setStoredRefreshToken(data.refreshToken);
    }
    const user = data.user || data;
    if (user) {
      setStoredUser(user);
    }

    return { success: true, user, token: accessToken, refreshToken: data.refreshToken };
  } catch (err) {
    console.error('API Login Error:', err);
    throw err;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Ro\'yxatdan o\'tishda xatolik yuz berdi');
    }

    const accessToken = data.token || data.accessToken;
    if (accessToken) {
      setStoredToken(accessToken);
    }
    if (data.refreshToken) {
      setStoredRefreshToken(data.refreshToken);
    }
    const user = data.user || data;
    if (user) {
      setStoredUser(user);
    }

    return { success: true, user, token: accessToken, refreshToken: data.refreshToken };
  } catch (err) {
    console.error('API Register Error:', err);
    throw err;
  }
};

export const fetchCurrentUser = async () => {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const response = await apiFetch(API_ENDPOINTS.ME, {
      method: 'GET'
    });

    if (response.status === 401 || response.status === 403) {
      // Token rejected (apiFetch already tried a refresh): drop the cached session
      // so a stale role (e.g. admin) is never trusted.
      logoutUser();
      return null;
    }
    if (!response.ok) {
      // Server hiccup (5xx etc.): keep the user signed in with the cached profile
      return getStoredUser();
    }

    const data = await response.json();
    const user = data.user || data;
    if (user) {
      setStoredUser(user);
    }
    return user;
  } catch (err) {
    console.warn('Fetch current user network error, using cached session:', err);
    return getStoredUser();
  }
};

export const getMe = fetchCurrentUser;

export const refreshAccessToken = async () => {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token || data.accessToken) {
        setStoredToken(data.token || data.accessToken);
        if (data.refreshToken) {
          setStoredRefreshToken(data.refreshToken);
        }
        return true;
      }
    }
    return false;
  } catch (err) {
    console.warn('Refresh token error:', err);
    return false;
  }
};

export const logoutUser = () => {
  const refreshToken = getStoredRefreshToken();
  if (refreshToken) {
    try {
      fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      }).catch(() => {});
    } catch (e) {}
  }
  setStoredToken(null);
  setStoredRefreshToken(null);
  setStoredUser(null);
};

export const checkEmailExists = async (email) => {
  if (!email || !email.includes('@')) return false;

  try {
    const response = await apiFetch(API_ENDPOINTS.CHECK_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase() })
    });

    if (response.ok) {
      const data = await response.json();
      return Boolean(data.exists);
    }
    throw new Error('Serverda xatolik yuz berdi. (HTTP ' + response.status + ')');
  } catch (err) {
    console.warn('Check email network error:', err);
    throw new Error(err.message || 'Server bilan bog\'lanib bo\'lmadi. Qayta urinib ko\'ring.', { cause: err });
  }
};
