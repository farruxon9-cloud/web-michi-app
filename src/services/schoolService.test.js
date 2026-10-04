import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSchoolsFromBackend, createSchoolInBackend, submitSchoolToBackend } from './schoolService';
import { API_ENDPOINTS } from '../config/api';

globalThis.fetch = vi.fn();

describe('4-BOSQICH: Driving Schools Backend API Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should fetch driving schools via GET /api/schools', async () => {
    const mockSchools = [
      { id: 'sch_1', name: 'Koyama Driving School', price: 280000 }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSchools
    });

    const data = await fetchSchoolsFromBackend();

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.SCHOOLS, expect.anything());
    expect(data).toEqual(mockSchools);
  });

  it('should handle fetch schools error gracefully and return empty array', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const data = await fetchSchoolsFromBackend();

    expect(data).toEqual([]);
  });

  it('should create new school via createSchoolInBackend (POST /api/schools)', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'sch_new_888' })
    });

    const schoolData = {
      name: 'Fuji Gasshuku School',
      prefecture: 'Shizuoka',
      city: 'Gotemba',
      lat: 35.3000,
      lng: 138.9333,
      courses: [{ name: 'Heavy License', license: 'Heavy', price: 320000 }],
      tags: ['Gasshuku', 'UzbekSupport']
    };

    const res = await createSchoolInBackend(schoolData);

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.SCHOOLS, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        name: 'Fuji Gasshuku School',
        prefecture: 'Shizuoka',
        city: 'Gotemba',
        lat: 35.3,
        lng: 138.9333,
        courses: [{ name: 'Heavy License', license: 'Heavy', price: 320000 }],
        tags: ['Gasshuku', 'UzbekSupport']
      })
    }));

    expect(res).toEqual({ success: true, id: 'sch_new_888' });
  });
});
