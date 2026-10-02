import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitJobToBackend } from './michiJobsApiService';
import { API_ENDPOINTS } from '../config/api';

global.fetch = vi.fn();

describe('3-BOSQICH: submitJobToBackend API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should post formatted job payload to POST /api/jobs with auth headers', async () => {
    localStorage.setItem('michi_jwt_token', 'jwt_test_token_456');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, id: 'job_vps_999' })
    });

    const formData = {
      title: 'Taksi Haydovchisi',
      company: 'Sagawa Express',
      minSalary: 380000,
      maxSalary: 450000,
      prefecture: 'Tokyo',
      phone: '03-1234-5678',
      email: 'hr@sagawa.jp',
      description: 'Senior driver position'
    };

    const res = await submitJobToBackend(formData);

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.JOBS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer jwt_test_token_456'
      },
      body: expect.stringContaining('"title":"Taksi Haydovchisi"')
    });

    expect(res).toEqual({ success: true, id: 'job_vps_999' });
  });

  it('should throw error when server returns error payload', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Kompaniya nomi kiritilishi shart' })
    });

    await expect(submitJobToBackend({ title: 'Invalid' })).rejects.toThrow('Kompaniya nomi kiritilishi shart');
  });
});
