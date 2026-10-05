import { describe, it, expect } from 'vitest';
import {
  buildApplicantSnapshot,
  licenseSummary,
  mapServerApplication,
  mapServerApplications,
  splitApplications,
  findStatusChanges,
  hasActiveApplication,
} from './applicationMapper';

describe('applicationMapper', () => {
  it('buildApplicantSnapshot drops empty values and saved items', () => {
    const snap = buildApplicantSnapshot({
      fullName: 'Taro', phone: '', driverLicenses: [], savedItems: { jobs: [1] }, licenseType: '中型',
    });
    expect(snap.fullName).toBe('Taro');
    expect(snap).not.toHaveProperty('phone');
    expect(snap).not.toHaveProperty('driverLicenses');
    expect(snap).not.toHaveProperty('savedItems');
    expect(snap.licenseType).toBe('中型');
  });

  it('licenseSummary prefers the license list', () => {
    expect(licenseSummary({ driverLicenses: ['普通', '中型'] })).toBe('普通,中型');
    expect(licenseSummary({ licenseType: '大型' })).toBe('大型');
    expect(licenseSummary({})).toBe('');
  });

  it('maps a job application with target summary and resume', () => {
    const m = mapServerApplication({
      id: 'a1', type: 'job', targetId: 'j1', applicantId: 'u1', status: 'interview',
      createdAt: '2026-10-01T00:00:00.000Z', referrerId: 'r1', branchName: '東京営業所',
      applicantData: { name: 'Taro', phone: '090', email: 't@x.jp', license: '普通, 中型', applicantInfo: { experience: '3年' } },
      target: { title: 'ドライバー', company: 'ABC運輸', logo: 'l.png', shoukaiAmount: 30000, status: 'active' },
    });
    expect(m).toMatchObject({
      id: 'a1', jobId: 'j1', title: 'ドライバー', company: 'ABC運輸', status: 'interview',
      shoukaiId: 'r1', branchName: '東京営業所', shoukaiAmount: '¥30,000', targetRemoved: false,
    });
    expect(m.applicantInfo).toMatchObject({ fullName: 'Taro', phone: '090', experience: '3年', driverLicenses: ['普通', '中型'] });
    expect(m.appliedDate).not.toBe('');
  });

  it('maps a school application and flags removed targets', () => {
    const m = mapServerApplication({ id: 's1', type: 'school', targetId: 'sc1', status: 'bogus', target: null });
    expect(m).toMatchObject({ isSchool: true, schoolId: 'sc1', status: 'submitted', targetRemoved: true });
  });

  it('drops junk and splits by type', () => {
    const list = mapServerApplications([null, {}, { id: 'a', type: 'job' }, { id: 'b', type: 'school' }]);
    expect(list).toHaveLength(2);
    const { jobs, schools } = splitApplications(list);
    expect(jobs.map((a) => a.id)).toEqual(['a']);
    expect(schools.map((a) => a.id)).toEqual(['b']);
  });

  it('findStatusChanges reports only notifiable moves', () => {
    const prev = [{ serverId: 'a', status: 'submitted' }, { serverId: 'b', status: 'submitted' }];
    const next = [{ serverId: 'a', status: 'interview' }, { serverId: 'b', status: 'withdrawn' }, { serverId: 'c', status: 'accepted' }];
    expect(findStatusChanges(prev, next).map((a) => a.serverId)).toEqual(['a']);
  });

  it('hasActiveApplication ignores withdrawn and simulated entries', () => {
    const list = [
      { jobId: 1, status: 'withdrawn' },
      { jobId: 2, status: 'submitted', isSimulatedReferral: true },
      { schoolId: 's', status: 'reviewed' },
    ];
    expect(hasActiveApplication(list, { jobId: '1' })).toBe(false);
    expect(hasActiveApplication(list, { jobId: 2 })).toBe(false);
    expect(hasActiveApplication(list, { schoolId: 's' })).toBe(true);
    expect(hasActiveApplication([...list, { jobId: 1, status: 'submitted' }], { jobId: 1 })).toBe(true);
  });
});
