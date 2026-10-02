import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitApplicationToBackend } from './applicationService';
import { API_ENDPOINTS } from '../config/api';

global.fetch = vi.fn();

describe('5-BOSQICH: Application & Referral Tracking Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('should capture referrerId from sessionStorage and submit payload to POST /api/applications', async () => {
    sessionStorage.setItem('michi_referrer_id', 'REF_MEMBER_777');
    localStorage.setItem('michi_jwt_token', 'jwt_applicant_999');

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, applicationId: 'app_vps_123' })
    });

    const applicantData = {
      fullName: 'Farrux Kanoatov',
      phone: '080-1234-5678',
      email: 'farrux@michi.jp',
      visaType: '特定技能',
      japaneseLevel: 'N2'
    };

    const res = await submitApplicationToBackend(101, applicantData);

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.APPLICATIONS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'job',
        targetId: 101,
        applicantData: {
          name: 'Farrux Kanoatov',
          phone: '080-1234-5678',
          email: 'farrux@michi.jp',
          license: ''
        },
        referrerId: 'REF_MEMBER_777'
      })
    });

    expect(res).toEqual({ success: true, applicationId: 'app_vps_123' });
  });

  it('should handle submission errors gracefully', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Ish topilmadi' })
    });

    await expect(
      submitApplicationToBackend(999, { fullName: 'Test', phone: '080' })
    ).rejects.toThrow('Ish topilmadi');
  });
});
