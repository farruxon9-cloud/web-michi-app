import { describe, it, expect } from 'vitest';
import { mapServerApplication } from './applicationMapper';

describe('mapServerApplication — trust fields', () => {
  it('carries authorVerified and applicantLicense only when present', () => {
    const withTrust = mapServerApplication({
      id: 'a1', type: 'job', targetId: 'j1',
      target: { title: 'T', company: 'C', authorVerified: true, authorVerifiedAt: '2026-01-02' },
      applicantLicense: { type: 'ogata', status: 'verified' },
    });
    expect(withTrust).toMatchObject({ authorVerified: true, authorVerifiedAt: '2026-01-02', applicantLicense: { type: 'ogata', status: 'verified' } });
    const plain = mapServerApplication({ id: 'a2', type: 'job', targetId: 'j1', target: { title: 'T', company: 'C', authorVerified: false } });
    expect(plain.authorVerified).toBeUndefined();
    expect(plain.applicantLicense).toBeUndefined();
  });
});
