// src/services/accountApi.js
// Client for the trust / account endpoints (shared contract with michi-gateway):
//   ⭐ verification, driver licence, account deletion, support tickets, listing renew,
//   personal notification read state.
// Every call throws an ApiError { status, code, data } on non-2xx so the UI can react to
// 404 (endpoint not deployed yet → hide the feature quietly), 422 NOT_ELIGIBLE, 429 COOLDOWN …
import { API_BASE_URL } from '../config/api';
import { apiFetch } from './apiClient';
import { setStoredUser } from './authService';

export class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = data && data.code ? data.code : undefined;
    this.data = data || {};
  }
}

/** True when the backend does not have the endpoint yet (feature should hide itself). */
export const isNotDeployed = (err) => Boolean(err && (err.status === 404 || err.status === 405 || err.status === 501));

async function call(path, { method = 'GET', body } = {}) {
  const res = await apiFetch(`${API_BASE_URL}${path}`, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || data.message || `Request failed (${res.status})`, res.status, data);
  return data;
}

const keepUser = (data) => {
  if (data && data.user) setStoredUser(data.user);
  return data;
};

// ---------------------------------------------------------------- ⭐ verification
export const getMyVerification = () => call('/api/auth/me/verification');
export const requestMyVerification = (payload = {}) => call('/api/auth/me/verification', { method: 'POST', body: payload }).then(keepUser);

// ---------------------------------------------------------------- driver licence
export const getMyLicense = () => call('/api/auth/me/license');
/** @param {{ type: string, expiresAt: string, image: string }} payload */
export const submitMyLicense = (payload) => call('/api/auth/me/license', { method: 'POST', body: payload }).then(keepUser);

// ---------------------------------------------------------------- account deletion (APPI)
export const requestAccountDeletion = (reason) => call('/api/auth/me/delete-request', { method: 'POST', body: reason ? { reason } : {} }).then(keepUser);
export const cancelAccountDeletion = () => call('/api/auth/me/delete-request/cancel', { method: 'POST', body: {} }).then(keepUser);

// ---------------------------------------------------------------- support tickets
export const listMyTickets = () => call('/api/support/tickets').then((d) => (Array.isArray(d) ? d : (d.items || d.tickets || [])));
export const getTicket = (id) => call(`/api/support/tickets/${encodeURIComponent(id)}`).then((d) => d.ticket || d);
export const createTicket = ({ subject, category, body }) => call('/api/support/tickets', { method: 'POST', body: { subject, category, body } }).then((d) => d.ticket || d);
export const replyTicket = (id, body) => call(`/api/support/tickets/${encodeURIComponent(id)}/messages`, { method: 'POST', body: { body } }).then((d) => d.ticket || d);
export const closeTicket = (id) => call(`/api/support/tickets/${encodeURIComponent(id)}/close`, { method: 'POST', body: {} }).then((d) => d.ticket || d);

// ---------------------------------------------------------------- listings
export const renewListing = (id) => call(`/api/listings/${encodeURIComponent(id)}/renew`, { method: 'POST', body: {} });

// ---------------------------------------------------------------- personal notifications
export const markNotificationRead = (id) => call(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'POST', body: {} });
export const markAllNotificationsRead = () => call('/api/notifications/read-all', { method: 'POST', body: {} });
