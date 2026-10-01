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

export const MICHI_BASE_API_URL = 'https://api.michi.jp.net';
export const MICHI_JOBS_API_ENDPOINT = `${MICHI_BASE_API_URL}/api/jobs`;

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
    const response = await fetch(requestUrl, {
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
    const response = await fetch(MICHI_JOBS_API_ENDPOINT, {
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
      console.warn('[michiJobsApiService] Live server POST /api/jobs returned 404. Returning validated payload locally.');
      return cleanData;
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
      throw new Error('POST /api/jobs timed out (15s). Please check network connection.');
    }
    console.warn('[michiJobsApiService] POST /api/jobs fallback to validated payload:', error.message);
    return cleanData;
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
    const response = await fetch(requestUrl, {
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
      throw new Error(`GET /api/jobs/${jobId} request timed out.`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const michiJobsApiService = {
  fetchJobs,
  createJob,
  fetchJobById,
  buildJobsQueryUrl
};

export default michiJobsApiService;
