import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitJobToBackend, notifyJobCreatedConfirmation, updateJobInBackend, buildJobPayload, buildJobsQueryUrl } from './michiJobsApiService';
import { API_ENDPOINTS } from '../config/api';

globalThis.fetch = vi.fn();

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

  it('should send job publication confirmation email via notifyJobCreatedConfirmation', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Job notification sent' })
    });

    const res = await notifyJobCreatedConfirmation({
      companyEmail: 'hr@yamato.jp',
      companyName: 'Yamato Transport',
      jobTitle: 'Deliver Driver'
    });

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFY_COMPANY, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        companyEmail: 'hr@yamato.jp',
        companyName: 'Yamato Transport',
        jobTitle: 'Deliver Driver',
        type: 'job_published'
      })
    }));

    expect(res).toEqual({ success: true, message: 'Job notification sent' });
  });

  it('PUT sends the same nested payload as POST (conditions, contact, logo)', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, job: { id: 'job_1' } }) });
    const form = {
      title: 'T', company: 'C', salary: '月給30万円', minSalary: 300000, hours: 'wh_day', dayOff: 'do_weekend',
      insurance: 'insurance_full', housing: 'housing_dorm', foreigners: 'foreigners_ok', phone: '090', email: 'a@b.jp',
      phoneMode: 'public', hasShoukai: true, shoukaiFee: 20000, logo: 'https://x/logo.png', license: 'lic_futsu',
    };
    await updateJobInBackend('job_1', form);
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toBe(`${API_ENDPOINTS.JOBS}/job_1`);
    expect(opts.method).toBe('PUT');
    const body = JSON.parse(opts.body);
    expect(body).toEqual(buildJobPayload(form));
    expect(body.conditions).toEqual({ workShift: 'wh_day', holidayType: 'do_weekend', socialInsurance: 'insurance_full', dormitorySupport: 'housing_dorm' });
    expect(body.contact).toMatchObject({ phone: '090', email: 'a@b.jp' });
    expect(body.logo).toBe('https://x/logo.png');
    expect(body.licenses).toEqual(['lic_futsu']);
    expect(body.shoukaiAmount).toBe(20000);
  });

  it('buildJobPayload invents nothing for empty optional fields', () => {
    const p = buildJobPayload({ title: 'T', company: 'C' });
    expect(p.salary).toBe('');
    expect(p.licenses).toEqual([]);
    expect(p.employmentType).toBe('');
    expect(p).not.toHaveProperty('logo');
  });

  it('buildJobsQueryUrl filters by authorId instead of company name', () => {
    const url = new URL(buildJobsQueryUrl({ authorId: 'u_1', company: 'ABC' }));
    expect(url.searchParams.get('authorId')).toBe('u_1');
    expect(url.searchParams.get('company')).toBeNull();
  });
});
