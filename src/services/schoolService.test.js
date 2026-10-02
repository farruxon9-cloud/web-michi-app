import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchSchoolsFromBackend, submitSchoolToBackend } from './schoolService';
import { API_ENDPOINTS } from '../config/api';

global.fetch = vi.fn();

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

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.SCHOOLS);
    expect(data).toEqual(mockSchools);
  });

  it('should handle fetch schools error gracefully and return empty array', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    const data = await fetchSchoolsFromBackend();

    expect(data).toEqual([]);
  });

  it('should submit new school via POST /api/schools with auth header', async () => {
    localStorage.setItem('michi_jwt_token', 'school_jwt_token_999');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'sch_new_1' })
    });

    const schoolData = {
      name: 'Fuji Gasshuku School',
      prefecture: 'Shizuoka',
      priceNum: 290000,
      license: 'Heavy',
      phone: '054-123-4567'
    };

    const res = await submitSchoolToBackend(schoolData);

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.SCHOOLS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer school_jwt_token_999'
      },
      body: expect.stringContaining('"name":"Fuji Gasshuku School"')
    });

    expect(res).toEqual({ success: true, id: 'sch_new_1' });
  });
});
