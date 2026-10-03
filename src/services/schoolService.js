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

export const createSchoolInBackend = async (schoolData) => {
  const payload = {
    name: schoolData.name,
    prefecture: schoolData.prefecture,
    city: schoolData.city || '',
    lat: Number(schoolData.lat) || 35.6686,
    lng: Number(schoolData.lng) || 139.4776,
    courses: schoolData.courses || [], // [{ name, license, price }]
    tags: schoolData.tags || []
  };

  const res = await apiFetch(API_ENDPOINTS.SCHOOLS, {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return await res.json();
};

export const submitSchoolToBackend = async (schoolData) => {
  return createSchoolInBackend(schoolData);
};

export default {
  fetchSchoolsFromBackend,
  createSchoolInBackend,
  submitSchoolToBackend
};
