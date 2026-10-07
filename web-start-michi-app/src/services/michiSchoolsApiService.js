/**
 * 🏫 Michi Server — Driving Schools Central API Service
 * 
 * Base API URL: https://api.michi.jp.net
 * Headers: { "Content-Type": "application/json", "Accept": "application/json" }
 * 
 * Endpoints:
 * 1. GET  /api/schools (?license=Heavy&search=Fuchu&q=Tokyo)
 * 2. POST /api/schools (Validates payload via FAZA 1 validateSchoolPayload)
 * 3. GET  /api/schools/:id
 */

import { validateSchoolPayload, buildValidationError } from './schemaValidationService';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '../config/api';
import { apiFetch } from './apiClient';

export const MICHI_BASE_API_URL = API_BASE_URL;
export const MICHI_SCHOOLS_API_ENDPOINT = API_ENDPOINTS.SCHOOLS;

export const DEFAULT_API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};


/**
 * Builds full URL with query parameters for GET /api/schools
 */
export function buildSchoolsQueryUrl(params = {}) {
  const url = new URL(MICHI_SCHOOLS_API_ENDPOINT);

  if (params.license && typeof params.license === 'string' && params.license.trim()) {
    url.searchParams.append('license', params.license.trim());
  }

  const querySearch = params.search || params.q;
  if (querySearch && typeof querySearch === 'string' && querySearch.trim()) {
    url.searchParams.append('search', querySearch.trim());
  }

  return url.toString();
}

/**
 * 1. GET /api/schools
 * Fetch list of driving school courses with optional query filtering
 * 
 * @param {Object} [queryParams] Query filters ({ license, search, q })
 * @returns {Promise<Array>} List of driving school objects
 */
export async function fetchSchools(queryParams = {}) {
  const requestUrl = buildSchoolsQueryUrl(queryParams);
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
      console.warn('[michiSchoolsApiService] Live server /api/schools returned 404 Not Found.');
      return [];
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API Error (${response.status}): ${errText || response.statusText}`);
    }

    const data = await response.json();
    const rawSchools = Array.isArray(data) ? data : (data.schools || data.data || []);

    // Validation only fills/normalizes known keys; keep every other server field (description, image, contacts…)
    return rawSchools.map(school => {
      const validRes = validateSchoolPayload(school);
      return validRes.isValid ? { ...school, ...validRes.data } : school;
    });

  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('[michiSchoolsApiService] GET /api/schools request timed out.');
      return [];
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 2. POST /api/schools
 * Post a new driving school course ad. Enforces FAZA 1 schema validation before dispatch.
 * 
 * @param {Object} schoolPayload Driving school schema payload
 * @returns {Promise<Object>} Saved school record
 */
export async function createSchool(schoolPayload) {
  // Validate schema before making network request
  const validationResult = validateSchoolPayload(schoolPayload);
  if (!validationResult.isValid) {
    throw validationResult; // Throws standard 400 Bad Request error object
  }

  const cleanData = validationResult.data;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await apiFetch(MICHI_SCHOOLS_API_ENDPOINT, {
      method: 'POST',
      headers: DEFAULT_API_HEADERS,
      body: JSON.stringify(cleanData),
      signal: controller.signal
    });

    if (response.status === 400) {
      const errJson = await response.json().catch(() => null);
      throw buildValidationError(errJson?.message || '400 Bad Request: Invalid driving school format', errJson?.errors || []);
    }

    if (response.status === 404) {
      throw new Error('Server /api/schools endpoint mavjud emas (404). Backend ni tekshiring.');
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API Error (${response.status}): ${errText || response.statusText}`);
    }

    const data = await response.json();
    return data.school || data.data || data;

  } catch (error) {
    if (error.isValid === false) throw error; // Re-throw validation error
    if (error.name === 'AbortError') {
      throw new Error('POST /api/schools timed out (15s). Please check network connection.', { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 3. GET /api/schools/:id
 * Fetch single driving school details by ID
 * 
 * @param {string|number} schoolId School ID
 * @returns {Promise<Object>} Driving school details object
 */
export async function fetchSchoolById(schoolId) {
  if (!schoolId) {
    throw new Error('School ID is required.');
  }

  const requestUrl = `${MICHI_SCHOOLS_API_ENDPOINT}/${encodeURIComponent(schoolId)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await apiFetch(requestUrl, {
      method: 'GET',
      headers: DEFAULT_API_HEADERS,
      signal: controller.signal
    });

    if (response.status === 404) {
      throw new Error(`Driving school post not found (ID: ${schoolId}).`);
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`API Error (${response.status}): ${errText || response.statusText}`);
    }

    const data = await response.json();
    const schoolRecord = data.school || data.data || data;
    const validRes = validateSchoolPayload(schoolRecord);
    return validRes.isValid ? { ...schoolRecord, ...validRes.data } : schoolRecord;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`GET /api/schools/${schoolId} request timed out.`, { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const fetchSchoolsFromBackend = async () => {
  try {
    const res = await apiFetch(API_ENDPOINTS.SCHOOLS);
    if (!res.ok) throw new Error('Maktablar ma‘lumotini olib bo‘lmadi');
    return await res.json();
  } catch (err) {
    console.error('Fetch Schools Error:', err);
    return [];
  }
};

export const submitSchoolToBackend = async (schoolData) => {
  const payload = {
    name: schoolData.name || schoolData.title || 'Avtomaktab',
    location: {
      prefecture: schoolData.prefecture || 'Tokyo',
      city: schoolData.city || '',
      lat: Number(schoolData.lat) || 35.6812,
      lng: Number(schoolData.lng) || 139.7671
    },
    courses: Array.isArray(schoolData.courses) ? schoolData.courses : [{
      name: schoolData.type || schoolData.title || 'Driving Course',
      license: schoolData.license || 'Heavy',
      price: Number(schoolData.priceNum || schoolData.price) || 300000
    }],
    phone: schoolData.phone || '',
    email: schoolData.email || '',
    description: schoolData.description || '',
    hasAccommodation: Boolean(schoolData.hasAccommodation)
  };

  const res = await apiFetch(API_ENDPOINTS.SCHOOLS, {
    method: 'POST',
    headers: DEFAULT_API_HEADERS,
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Avtomaktab e‘lonini saqlashda xatolik yuz berdi');
  }

  return await res.json();
};

export const postSchool = createSchool;

export const michiSchoolsApiService = {
  fetchSchools,
  createSchool,
  postSchool: createSchool,
  fetchSchoolsFromBackend,
  submitSchoolToBackend,
  fetchSchoolById,
  buildSchoolsQueryUrl
};

export default michiSchoolsApiService;

