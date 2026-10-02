// src/config/api.js
export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) 
  ? import.meta.env.VITE_API_BASE_URL 
  : 'https://api.michi.jp.net';


export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  ME: `${API_BASE_URL}/api/auth/me`,
  SEND_OTP: `${API_BASE_URL}/api/auth/send-otp`,
  
  // Data
  JOBS: `${API_BASE_URL}/api/jobs`,
  SCHOOLS: `${API_BASE_URL}/api/schools`,
  APPLICATIONS: `${API_BASE_URL}/api/applications`,
  CHAT: `${API_BASE_URL}/api/chat`
};

export const getAuthHeaders = () => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('michi_jwt_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
