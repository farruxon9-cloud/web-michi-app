// src/services/schoolService.js
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

export const fetchSchoolsFromBackend = async () => {
  try {
    const res = await fetch(API_ENDPOINTS.SCHOOLS);
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

  const res = await fetch(API_ENDPOINTS.SCHOOLS, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Avtomaktab e‘lonini saqlashda xatolik yuz berdi');
  }

  return await res.json();
};

export default {
  fetchSchoolsFromBackend,
  submitSchoolToBackend
};
