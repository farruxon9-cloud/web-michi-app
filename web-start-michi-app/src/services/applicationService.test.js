import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitApplication, submitApplicationToBackend, fetchApplications, updateApplicationStatus, notifyCompanyNewApplication, notifyApplicantStatusChange } from './applicationService';
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
      japaneseLevel: 'N2',
      avatar: 'data:image/png;base64,AAAA',
      driverLicenses: ['oogata', 'futsuu'],
      workHistory: [{ company: 'Sagawa' }],
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
          license: 'oogata,futsuu',
          applicantInfo: {
            fullName: 'Farrux Kanoatov',
            phone: '080-1234-5678',
            email: 'farrux@michi.jp',
            workHistory: [{ company: 'Sagawa' }],
            driverLicenses: ['oogata', 'futsuu'],
          }
        },
        referrerId: 'REF_MEMBER_777'
      })
    }));

    expect(res).toEqual({ success: true, applicationId: 'app_vps_123', mapped: null });
  });

  it('prefers the referral id picked in the modal and sends branchName with the branch', async () => {
    sessionStorage.setItem('michi_referrer_id', 'URL_REF');
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    await submitApplicationToBackend('job1', { fullName: 'A' }, 'br_1', { referrerId: 'MODAL_REF', branchName: '東京営業所' });
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.referrerId).toBe('MODAL_REF');
    expect(body.branchName).toBe('東京営業所');
  });

  it('school applications go to the same endpoint with type=school', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });
    await submitApplication('sch_1', { fullName: 'A' }, null, { type: 'school' });
    expect(JSON.parse(fetch.mock.calls[0][1].body).type).toBe('school');
  });

  it('fetchApplications maps the server shape (title, date, resume, referrer)', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ applications: [{
        id: 'app_1', type: 'job', targetId: 'job_9', status: 'interview', createdAt: '2026-10-01T00:00:00Z',
        referrerId: 'u_ref', branchName: '大阪支店',
        applicantData: { name: '太郎', phone: '090', email: 't@x.jp', license: 'oogata', applicantInfo: { fullName: '山田太郎', workHistory: [{ company: 'A' }] } },
        target: { title: '大型ドライバー', company: '道運輸', logo: '', shoukaiAmount: 30000 },
      }] })
    });
    const [a] = await fetchApplications();
    expect(a).toMatchObject({
      id: 'app_1', jobId: 'job_9', title: '大型ドライバー', company: '道運輸', status: 'interview',
      shoukaiId: 'u_ref', shoukaiAmount: '¥30,000', branchName: '大阪支店', appliedAt: '2026-10-01T00:00:00Z',
    });
    expect(a.applicantInfo).toMatchObject({ fullName: '山田太郎', phone: '090', email: 't@x.jp', driverLicenses: ['oogata'] });
    expect(a.appliedDate).not.toBe('');
  });

  it('updateApplicationStatus PATCHes and surfaces server errors', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ application: { id: 'app_1', type: 'job', targetId: 'j', status: 'accepted' } }) });
    const out = await updateApplicationStatus('app_1', 'accepted');
    expect(fetch.mock.calls[0][0]).toBe(`${API_ENDPOINTS.APPLICATIONS}/app_1`);
    expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'PATCH', body: JSON.stringify({ status: 'accepted' }) });
    expect(out.status).toBe('accepted');

    fetch.mockResolvedValueOnce({ ok: false, status: 403, json: async () => ({ error: 'Ruxsat yo‘q' }) });
    await expect(updateApplicationStatus('app_1', 'accepted')).rejects.toThrow('Ruxsat yo‘q');
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
