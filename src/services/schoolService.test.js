import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchSchoolsFromBackend,
  createSchoolInBackend,
  updateSchoolInBackend,
  deleteSchoolInBackend,
  submitSchoolToBackend
} from './schoolService';
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
      json: async () => ({ success: true, school: { id: 'sch_new_888', name: 'Fuji Gasshuku School' } })
    });

    const schoolData = {
      name: 'Fuji Gasshuku School',
      prefecture: 'Shizuoka',
      detailAddress: 'Gotemba',
      lat: 35.3000,
      lng: 138.9333,
      courses: ['Oogata'],
      langs: ['UZ'],
      price: '¥300,000',
      description: 'Desc',
      phone: '090',
      shoukaiFee: 20000,
      shoukaiConditions: '3 months'
    };

    const res = await createSchoolInBackend(schoolData);
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toBe(API_ENDPOINTS.SCHOOLS);
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toMatchObject({
      name: 'Fuji Gasshuku School',
      prefecture: 'Shizuoka',
      city: 'Gotemba',
      lat: 35.3,
      lng: 138.9333,
      courses: [{ name: 'Oogata', license: 'Oogata' }],
      languages: ['UZ'],
      price: '¥300,000',
      description: 'Desc',
      phone: '090',
      hasShoukai: true,
      shoukaiAmount: 20000,
      shoukaiConditions: '3 months'
    });
    expect(res).toEqual({ id: 'sch_new_888', name: 'Fuji Gasshuku School' });
  });

  it('should update via PUT /api/schools/:id with the same payload shape', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, school: { id: 'sch_1', price: '¥1' } }) });
    const res = await updateSchoolInBackend('sch_1', { name: 'A', prefecture: 'Tokyo', price: '¥1', courses: [] });
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toBe(`${API_ENDPOINTS.SCHOOLS}/sch_1`);
    expect(opts.method).toBe('PUT');
    expect(JSON.parse(opts.body)).toMatchObject({ name: 'A', price: '¥1', hasShoukai: false, shoukaiAmount: 0 });
    expect(res).toEqual({ id: 'sch_1', price: '¥1' });
  });

  it('should throw with status when the server refuses (no silent local-only save)', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 403, json: async () => ({ error: 'Forbidden' }) });
    await expect(createSchoolInBackend({ name: 'A' })).rejects.toMatchObject({ status: 403 });
    fetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) });
    await expect(deleteSchoolInBackend('sch_x')).rejects.toMatchObject({ status: 404 });
  });

  it('submitSchoolToBackend stays an alias of create', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ school: { id: 's2' } }) });
    expect(await submitSchoolToBackend({ name: 'B' })).toEqual({ id: 's2' });
  });
});
