/**
 * 🚛 Michi Server — Jobs Central API Service
 * 
 * Base API URL: https://api.michi.jp.net
 * Headers: { "Content-Type": "application/json", "Accept": "application/json" }
 * 
 * Endpoints:
 * 1. GET  /api/jobs (?prefecture=Tokyo&license=Heavy&minSalary=350000&q=Sagawa)
 * 2. POST /api/jobs (Validates payload via FAZA 1 validateJobPayload)
 * 3. GET  /api/jobs/:id
 */

import { validateJobPayload, buildValidationError } from './schemaValidationService';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { apiFetch } from './apiClient';
import { normalizeBranch } from '../utils/jobPostingNormalizer';

export const MICHI_BASE_API_URL = API_BASE_URL;
export const MICHI_JOBS_API_ENDPOINT = API_ENDPOINTS.JOBS;

export const DEFAULT_API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};


/**
 * Builds full URL with query parameters for GET /api/jobs
 */
export function buildJobsQueryUrl(params = {}) {
  const url = new URL(MICHI_JOBS_API_ENDPOINT);

  if (params.prefecture && typeof params.prefecture === 'string') {
    url.searchParams.append('prefecture', params.prefecture.trim());
  }

  if (params.license && typeof params.license === 'string') {
    url.searchParams.append('license', params.license.trim());
  }

  if (params.minSalary !== undefined && params.minSalary !== null && params.minSalary !== '') {
    url.searchParams.append('minSalary', String(params.minSalary));
  }

  if (params.authorId && typeof params.authorId === 'string' && params.authorId.trim()) {
    url.searchParams.append('authorId', params.authorId.trim());
  }

  const companyQuery = params.company || params.companyId;
  if (!params.authorId && companyQuery && typeof companyQuery === 'string' && companyQuery.trim()) {
    url.searchParams.append('company', companyQuery.trim());
  }

  const querySearch = params.q || params.search;
  if (querySearch && typeof querySearch === 'string' && querySearch.trim()) {
    url.searchParams.append('q', querySearch.trim());
  }

  return url.toString();
}

/**
 * 1. GET /api/jobs
 * Fetch list of driver job postings with optional query filtering
 * 
 * @param {Object} [queryParams] Query filters ({ prefecture, license, minSalary, q, search })
 * @returns {Promise<Array>} List of job objects
 */
export async function fetchJobs(queryParams = {}) {
  const requestUrl = buildJobsQueryUrl(queryParams);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await apiFetch(requestUrl, {
      method: 'GET',
      headers: DEFAULT_API_HEADERS,
      signal: controller.signal
    });

    if (response.status === 429) {
      throw new Error("So'rovlar chegarasi oshib ketdi. Iltimos, 1 daqiqadan so'ng qayta urinib ko'ring.");
    }

    if (response.status === 404) {
      console.warn('[michiJobsApiService] Live server /api/jobs returned 404 Not Found. Express router on VPS requires /api/jobs endpoint deployment.');
      return [];
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API Error (${response.status}): ${errText || response.statusText}`);
    }

    const data = await response.json();
    const rawJobs = Array.isArray(data) ? data : (data.jobs || data.data || []);

    // Filter and normalize validated job records
    return rawJobs.map(job => {
      const validRes = validateJobPayload(job);
      return validRes.isValid ? validRes.data : job;
    });

  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('[michiJobsApiService] GET /api/jobs request timed out.');
      return [];
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 2. POST /api/jobs
 * Post a new job vacancy ad. Enforces FAZA 1 schema validation before dispatch.
 * 
 * @param {Object} jobPayload Job ad schema payload
 * @returns {Promise<Object>} Saved job record
 */
export async function createJob(jobPayload) {
  // Validate schema before making network request
  const validationResult = validateJobPayload(jobPayload);
  if (!validationResult.isValid) {
    throw validationResult; // Throws standard 400 Bad Request error object
  }

  const cleanData = validationResult.data;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await apiFetch(MICHI_JOBS_API_ENDPOINT, {
      method: 'POST',
      headers: DEFAULT_API_HEADERS,
      body: JSON.stringify(cleanData),
      signal: controller.signal
    });

    if (response.status === 400) {
      const errJson = await response.json().catch(() => null);
      throw buildValidationError(errJson?.message || '400 Bad Request: Invalid job format', errJson?.errors || []);
    }

    if (response.status === 404) {
      throw new Error('Server /api/jobs endpoint mavjud emas (404). Backend ni tekshiring.');
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API Error (${response.status}): ${errText || response.statusText}`);
    }

    const data = await response.json();
    return data.job || data.data || data;

  } catch (error) {
    if (error.isValid === false) throw error; // Re-throw validation error
    if (error.name === 'AbortError') {
      throw new Error('POST /api/jobs timed out (15s). Please check network connection.', { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 3. GET /api/jobs/:id
 * Fetch single job details by ID
 * 
 * @param {string|number} jobId Job ID
 * @returns {Promise<Object>} Job details object
 */
export async function fetchJobById(jobId) {
  if (!jobId) {
    throw new Error('Job ID is required.');
  }

  const requestUrl = `${MICHI_JOBS_API_ENDPOINT}/${encodeURIComponent(jobId)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await apiFetch(requestUrl, {
      method: 'GET',
      headers: DEFAULT_API_HEADERS,
      signal: controller.signal
    });

    if (response.status === 404) {
      throw new Error(`Job post not found (ID: ${jobId}).`);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API Error (${response.status}): ${errText || response.statusText}`);
    }

    const data = await response.json();
    const jobRecord = data.job || data.data || data;
    const validRes = validateJobPayload(jobRecord);
    return validRes.isValid ? validRes.data : jobRecord;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`GET /api/jobs/${jobId} request timed out.`, { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * One payload shape for POST and PUT /api/jobs (the backend stores nested
 * `conditions` / `contact` and flat salary/location fields).
 */
export function buildJobPayload(formData = {}) {
  const minSalary = Number(formData.minSalary) || 0;
  const maxSalary = Number(formData.maxSalary) || 0;
  const licenses = (Array.isArray(formData.licenses) ? formData.licenses
    : Array.isArray(formData.license) ? formData.license : [formData.license]).filter(Boolean);
  const phoneMode = formData.callReceptionStyle || formData.phoneMode || 'public';
  const payload = {
    title: formData.title,
    company: formData.company,
    minSalary,
    maxSalary,
    salary: formData.salary || (minSalary ? `¥${minSalary.toLocaleString()}` : ''),
    employmentType: formData.employmentType || formData.type || '',
    bonusPrivilege: formData.bonusPrivilege || formData.bonus || '',
    postalCode: formData.postalCode || '',
    prefecture: formData.prefecture || 'Tokyo',
    city: formData.city || formData.detailAddress || '',
    addressLine: formData.addressLine || formData.townAddress || '',
    building: formData.building || formData.buildingAddress || '',
    trainLine: formData.trainLine || '',
    nearestStation: formData.nearestStation || '',
    walkMinutes: Number(formData.walkMinutes || formData.walkTime) || 0,
    lat: Number(formData.lat) || 35.6812,
    lng: Number(formData.lng) || 139.7671,
    licenses,
    category: formData.category || 'delivery_driver',
    subcategory: formData.subcategory || 'delivery_local',
    image: formData.image || '',
    conditions: {
      workShift: formData.workShift || formData.hours || '',
      holidayType: formData.holidayType || formData.dayOff || '',
      socialInsurance: formData.socialInsurance || formData.insurance || '',
      dormitorySupport: formData.dormitorySupport || formData.housing || ''
    },
    foreignerSupport: (Array.isArray(formData.foreignerSupport) ? formData.foreignerSupport : [formData.foreigners]).filter(Boolean),
    contact: {
      phone: formData.phone || '',
      email: formData.email || '',
      callReceptionStyle: phoneMode
    },
    phoneMode,
    isInternational: Boolean(formData.isInternational),
    description: formData.description || '',
    hasShoukai: Boolean(formData.hasShoukai),
    shoukaiAmount: Number(formData.shoukaiAmount || formData.shoukaiFee) || 0,
    shoukaiConditions: formData.shoukaiConditions || '',
    hiringScope: formData.hiringScope === 'branch' ? 'branch' : 'headquarters',
    branches: formData.hiringScope === 'branch'
      ? (Array.isArray(formData.branches) ? formData.branches : []).map((b, i) => normalizeBranch(b, i, { keepPrivatePhone: true })).filter(Boolean)
      : []
  };
  if (formData.logo) payload.logo = formData.logo;
  return payload;
}

export const submitJobToBackend = async (formData) => {
  const payload = buildJobPayload(formData);

  const response = await apiFetch(API_ENDPOINTS.JOBS, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'E‘lonni saqlashda xatolik yuz berdi');
  }

  const result = await response.json().catch(() => ({}));

  // Trigger company confirmation email webhook on job creation
  const targetCompanyEmail = payload.contact?.email || formData.email || formData.companyEmail;
  if (targetCompanyEmail) {
    notifyJobCreatedConfirmation({
      companyEmail: targetCompanyEmail,
      companyName: payload.company || formData.company,
      jobTitle: payload.title || formData.title
    }).catch(err => console.warn('[michiJobsApiService] Email notify warning:', err.message));
  }

  return result;
};

export const notifyJobCreatedConfirmation = async ({ companyEmail, companyName, jobTitle }) => {
  if (!companyEmail) return null;
  try {
    const notifyUrl = API_ENDPOINTS.NOTIFY_COMPANY || API_ENDPOINTS.SEND_OTP.replace('send-otp', 'notify-company');
    const response = await apiFetch(notifyUrl, {
      method: 'POST',
      body: JSON.stringify({
        companyEmail,
        companyName,
        jobTitle,
        type: 'job_published'
      })
    });
    return await response.json().catch(() => ({}));
  } catch (err) {
    console.warn('[michiJobsApiService] Failed to send job creation email notification:', err.message);
    return null;
  }
};

export const postJob = createJob;

/**
 * Updates an existing job ad on VPS backend via PUT /api/jobs/:id
 */
export const updateJobInBackend = async (jobId, formData) => {
  if (!jobId) throw new Error('Job ID is required for update');
  const body = buildJobPayload(formData || {});
  const response = await apiFetch(`${API_ENDPOINTS.JOBS}/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'E‘lonni yangilashda xatolik yuz berdi');
  }
  return await response.json().catch(() => ({ success: true }));
};

/**
 * Deletes an existing job ad on VPS backend via DELETE /api/jobs/:id
 */
export const deleteJobInBackend = async (jobId) => {
  if (!jobId) throw new Error('Job ID is required for deletion');
  const response = await apiFetch(`${API_ENDPOINTS.JOBS}/${jobId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'E‘lonni o‘chirishda xatolik yuz berdi');
  }
  return await response.json().catch(() => ({ success: true }));
};

export const michiJobsApiService = {
  fetchJobs,
  fetchJobsPage,
  createJob,
  postJob: createJob,
  submitJobToBackend,
  updateJobInBackend,
  deleteJobInBackend,
  notifyJobCreatedConfirmation,
  fetchJobById,
  buildJobsQueryUrl
};

/**
 * GET /api/jobs?limit=&cursor=&since=
 * Returns { items, nextCursor, serverTime, legacy }.
 * - legacy=true  → server returned a plain array (no cursor/since support).
 * - serverTime   → only when the server sends it (never the client clock).
 * Network/5xx errors are thrown so the feed can keep its cached list.
 */
export async function fetchJobsPage({ limit = 20, cursor = null, since = null } = {}) {
  const url = new URL(MICHI_JOBS_API_ENDPOINT);
  if (limit) url.searchParams.set('limit', String(limit));
  if (cursor) url.searchParams.set('cursor', cursor);
  if (since) url.searchParams.set('since', since);

  const res = await apiFetch(url.toString(), { method: 'GET', headers: DEFAULT_API_HEADERS });

  if (res.status === 404) {
    return { items: [], nextCursor: null, serverTime: null, legacy: true };
  }
  if (!res.ok) {
    throw new Error(`GET /api/jobs failed (${res.status})`);
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return { items: data, nextCursor: null, serverTime: null, legacy: true };
  }
  const items = data.items || data.jobs || data.data || [];
  const supportsCursor = 'nextCursor' in data || 'serverTime' in data;
  return {
    items: Array.isArray(items) ? items : [],
    nextCursor: data.nextCursor || null,
    serverTime: data.serverTime || null,
    legacy: !supportsCursor
  };
}

export default michiJobsApiService;


