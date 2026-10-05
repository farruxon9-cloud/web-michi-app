// src/services/apiClient.js
import { getStoredToken, refreshAccessToken, logoutUser, SESSION_EXPIRED_EVENT } from './authService';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const notifySessionExpired = () => {
  try {
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  } catch { /* non-browser env */ }
};

export async function apiFetch(url, options = {}) {
  const customHeaders = options.headers || {};
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders
    }
  };

  const token = getStoredToken();
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  {
    let response = await fetch(url, config);

    const isAuthEndpoint = typeof url === 'string' && (
      url.includes('/api/auth/refresh') || 
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/register')
    );

    if (response.status === 401 && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(newToken => {
          const retryHeaders = {
            ...config.headers,
            'Authorization': `Bearer ${newToken}`
          };
          return fetch(url, { ...config, headers: retryHeaders });
        });
      }

      isRefreshing = true;

      try {
        const refreshed = await refreshAccessToken();
        if (refreshed === true) {
          const newToken = getStoredToken();
          isRefreshing = false;
          processQueue(null, newToken);

          const retryHeaders = {
            ...config.headers,
            'Authorization': `Bearer ${newToken}`
          };
          return await fetch(url, { ...config, headers: retryHeaders });
        }
        isRefreshing = false;
        processQueue(new Error('Token refresh failed'), null);
        if (refreshed === false) {
          // Server rejected the session: clear it and tell the UI (AuthContext) to sign out.
          logoutUser();
          notifySessionExpired();
        }
        // refreshed === null → offline / server busy: keep the session, caller sees the 401.
        return response;
      } catch (refreshErr) {
        isRefreshing = false;
        processQueue(refreshErr, null);
        throw refreshErr;
      }
    }

    return response;
  }
}

export const apiClient = {
  get: (url, options = {}) => apiFetch(url, { ...options, method: 'GET' }),
  post: (url, body, options = {}) => apiFetch(url, {
    ...options,
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body)
  }),
  put: (url, body, options = {}) => apiFetch(url, {
    ...options,
    method: 'PUT',
    body: typeof body === 'string' ? body : JSON.stringify(body)
  }),
  delete: (url, options = {}) => apiFetch(url, { ...options, method: 'DELETE' })
};
