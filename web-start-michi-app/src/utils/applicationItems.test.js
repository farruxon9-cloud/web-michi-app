import { describe, it, expect } from 'vitest';
import {
  appItemKey,
  slimApplicationForStorage,
  slimApplicationsForStorage,
  sanitizeStoredApplications,
  filterHiddenApps,
} from './applicationItems';

describe('applicationItems', () => {
  it('appItemKey separates job and school ids that collide', () => {
    const job = { id: 1700000000000, jobId: 5 };
    const school = { id: 1700000000000, schoolId: 9 };
    expect(appItemKey(job)).toBe('job:1700000000000');
    expect(appItemKey(school)).toBe('school:1700000000000');
    expect(appItemKey({ id: 3, isSchool: true })).toBe('school:3');
    expect(appItemKey(null)).toBe('');
    expect(appItemKey({})).toBe('');
  });

  it('slimApplicationForStorage drops the embedded applicant profile', () => {
    const slim = slimApplicationForStorage({ id: 1, title: 'x', applicantInfo: { avatar: 'data:image/png;base64,AAAA' } });
    expect(slim).toEqual({ id: 1, title: 'x' });
    expect(slimApplicationForStorage(null)).toBeNull();
    expect(slimApplicationsForStorage('nope')).toEqual([]);
  });

  it('sanitizeStoredApplications rejects junk and defaults status', () => {
    const out = sanitizeStoredApplications([
      { id: 1, status: 'accepted' },
      { id: 2 },
      { id: {} },
      null,
      'str',
      { id: '' },
    ]);
    expect(out).toEqual([{ id: 1, status: 'accepted' }, { id: 2, status: 'submitted' }]);
    expect(sanitizeStoredApplications({})).toEqual([]);
  });

  it('filterHiddenApps hides only matching keys', () => {
    const list = [{ id: 1, jobId: 1 }, { id: 1, schoolId: 2 }, { id: 2, jobId: 3 }];
    const out = filterHiddenApps(list, new Set(['job:1']));
    expect(out).toEqual([{ id: 1, schoolId: 2 }, { id: 2, jobId: 3 }]);
    expect(filterHiddenApps(list, null)).toBe(list);
  });
});
