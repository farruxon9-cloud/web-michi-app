import { API_ENDPOINTS } from '../config/api';
import { apiFetch } from './apiClient';

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

/** One payload for POST/PUT /api/schools built from the company form's school object. */
export function buildSchoolPayload(schoolData = {}) {
  const courses = (Array.isArray(schoolData.courses) ? schoolData.courses : [])
    .map((c) => (typeof c === 'string' ? { name: c, license: c } : c))
    .filter((c) => c && (c.name || c.license));
  const payload = {
    name: schoolData.name,
    prefecture: schoolData.prefecture,
    city: schoolData.city || schoolData.detailAddress || '',
    postalCode: schoolData.postalCode || '',
    addressLine: schoolData.addressLine || schoolData.townAddress || '',
    building: schoolData.building || schoolData.buildingAddress || '',
    lat: Number(schoolData.lat) || 35.6686,
    lng: Number(schoolData.lng) || 139.4776,
    courses,
    tags: schoolData.tags || [],
    languages: Array.isArray(schoolData.langs) ? schoolData.langs : (schoolData.languages || []),
    type: schoolData.type || '',
    price: schoolData.price != null ? String(schoolData.price) : '',
    discount: schoolData.discount || '',
    phone: schoolData.phone || '',
    email: schoolData.email || '',
    description: schoolData.description || '',
    hasShoukai: Number(schoolData.shoukaiFee) > 0,
    shoukaiAmount: Number(schoolData.shoukaiFee) || 0,
    shoukaiConditions: schoolData.shoukaiConditions || '',
  };
  if (schoolData.image) payload.image = schoolData.image;
  if (schoolData.logo) payload.logo = schoolData.logo;
  return payload;
}

async function schoolRequest(url, method, body) {
  const res = await apiFetch(url, { method, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || data.message || `School ${method} failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

/** @returns {Promise<object>} the saved school record */
export const createSchoolInBackend = async (schoolData) => {
  const data = await schoolRequest(API_ENDPOINTS.SCHOOLS, 'POST', buildSchoolPayload(schoolData));
  return data.school || data.data || data;
};

/** @returns {Promise<object>} the saved school record */
export const updateSchoolInBackend = async (schoolId, schoolData) => {
  if (!schoolId) throw new Error('School ID is required for update');
  const data = await schoolRequest(`${API_ENDPOINTS.SCHOOLS}/${encodeURIComponent(schoolId)}`, 'PUT', buildSchoolPayload(schoolData));
  return data.school || data.data || data;
};

export const deleteSchoolInBackend = async (schoolId) => {
  if (!schoolId) throw new Error('School ID is required for deletion');
  return schoolRequest(`${API_ENDPOINTS.SCHOOLS}/${encodeURIComponent(schoolId)}`, 'DELETE');
};

export const submitSchoolToBackend = async (schoolData) => {
  return createSchoolInBackend(schoolData);
};

export default {
  fetchSchoolsFromBackend,
  createSchoolInBackend,
  updateSchoolInBackend,
  deleteSchoolInBackend,
  submitSchoolToBackend
};
