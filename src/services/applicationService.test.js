import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitApplicationToBackend, notifyCompanyNewApplication, notifyApplicantStatusChange } from './applicationService';
import { API_ENDPOINTS } from '../config/api';

globalThis.fetch = vi.fn();

describe('5-BOSQICH: Application & Referral Tracking Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('includes the selected branchId (one application = one branch)', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    await submitApplicationToBackend('job1', { fullName: 'A', phone: '080', email: 'a@b.jp' }, 'br_1');
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.branchId).toBe('br_1');
    expect(body.targetId).toBe('job1');
  });

  it('omits branchId when no branch was selected', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    await submitApplicationToBackend('job1', { fullName: 'A', phone: '080', email: 'a@b.jp' });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect('branchId' in body).toBe(false);
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

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.APPLICATIONS, expect.objectContaining({
      method: 'POST',
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
    }));

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

  it('should send company notification email payload via notifyCompanyNewApplication', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Notification sent' })
    });

    const res = await notifyCompanyNewApplication({
      companyEmail: 'hr@tokyotruck.jp',
      applicantName: 'Farrux Kanoatov',
      jobTitle: 'Heavy Truck Driver'
    });

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFY_COMPANY, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        companyEmail: 'hr@tokyotruck.jp',
        applicantName: 'Farrux Kanoatov',
        jobTitle: 'Heavy Truck Driver',
        type: 'new_application'
      })
    }));

    expect(res).toEqual({ success: true, message: 'Notification sent' });
  });

  it('should send applicant status change email notification via notifyApplicantStatusChange', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Status email sent' })
    });

    const res = await notifyApplicantStatusChange({
      applicantEmail: 'candidate@michi.jp',
      applicantName: 'Farrux Kanoatov',
      companyName: 'Yamato Logistics',
      jobTitle: 'Regional Driver',
      newStatus: 'accepted'
    });

    expect(fetch).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFY_COMPANY, expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        applicantEmail: 'candidate@michi.jp',
        applicantName: 'Farrux Kanoatov',
        companyName: 'Yamato Logistics',
        jobTitle: 'Regional Driver',
        status: 'accepted',
        type: 'application_status_update'
      })
    }));

    expect(res).toEqual({ success: true, message: 'Status email sent' });
  });
});
