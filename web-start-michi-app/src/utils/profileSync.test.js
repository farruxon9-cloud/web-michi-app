import { describe, it, expect } from 'vitest';
import { buildServerProfile, buildProfilePatch, profileFingerprint } from './profileSync';
import { normalizeSchoolPosting } from './jobPostingNormalizer';

describe('profileSync', () => {
  const profile = {
    fullName: 'Ali Valiyev', phone: '090-1111-2222', avatar: 'https://x/a.png', resume: { exp: 3 },
    savedItems: [1, 2], userId: 'dev_1', accountId: 'usr_1', id: 'x', companyId: 'c', role: 'driver',
    token: 't', refreshToken: 'r', password: 'p', onClick: () => {}, empty: undefined,
  };

  it('never sends local-only / secret keys to the server', () => {
    const out = buildServerProfile(profile);
    ['savedItems', 'userId', 'accountId', 'id', 'companyId', 'role', 'token', 'refreshToken', 'password', 'onClick', 'empty']
      .forEach((k) => expect(out).not.toHaveProperty(k));
    expect(out).toMatchObject({ fullName: 'Ali Valiyev', avatar: 'https://x/a.png', resume: { exp: 3 } });
  });

  it('builds the PATCH body with fullName and phone', () => {
    expect(buildProfilePatch(profile)).toMatchObject({ fullName: 'Ali Valiyev', phone: '090-1111-2222' });
  });

  it('omits a blank or guest name (server rejects empty fullName)', () => {
    expect(buildProfilePatch({ fullName: '  ' })).not.toHaveProperty('fullName');
    expect(buildProfilePatch({ fullName: 'Mehmon' })).not.toHaveProperty('fullName');
  });

  it('fingerprint ignores local-only changes', () => {
    expect(profileFingerprint(profile)).toBe(profileFingerprint({ ...profile, savedItems: [9], userId: 'dev_2' }));
    expect(profileFingerprint(profile)).not.toBe(profileFingerprint({ ...profile, phone: '080' }));
  });
});

describe('normalizeSchoolPosting — keeps company-entered fields', () => {
  const server = {
    id: 'sch_1', authorId: 'usr_9', name: 'Koyama', prefecture: 'Tokyo', city: 'Fuchu',
    location: { prefecture: 'Tokyo', city: 'Fuchu', lat: 35.6, lng: 139.4 },
    courses: [{ name: 'Oogata', license: 'Oogata', price: null }], languages: ['UZ', 'JP'],
    description: 'Hello', type: '大型', price: '¥300,000', discount: '¥5,000', phone: '090', email: 'a@b.jp',
    postalCode: '183-0001', addressLine: '1-2-3', building: 'B1', shoukaiConditions: '3 months',
    shoukai: { enabled: true, amount: 20000 }, image: 'https://x/i.png', logo: 'https://x/l.png',
  };

  it('maps backend shape to the UI shape', () => {
    const s = normalizeSchoolPosting(server);
    expect(s).toMatchObject({
      id: 'sch_1', authorId: 'usr_9', companyId: 'usr_9', description: 'Hello', type: '大型', price: '¥300,000',
      discount: '¥5,000', phone: '090', email: 'a@b.jp', langs: ['UZ', 'JP'], shoukaiFee: 20000, shoukai: '¥20,000',
      shoukaiConditions: '3 months', postalCode: '183-0001', detailAddress: 'Fuchu', townAddress: '1-2-3',
      buildingAddress: 'B1', location: 'Tokyo, Fuchu', logo: 'https://x/l.png', image: 'https://x/i.png',
    });
    expect(s.fullAddress).toBe('〒183-0001 TokyoFuchu1-2-3 B1');
  });

  it('disabled referral → no fee; missing fields stay empty (no invented values)', () => {
    const s = normalizeSchoolPosting({ id: 's2', name: 'X', shoukai: { enabled: false, amount: 9 } });
    expect(s.shoukaiFee).toBe(0);
    expect(s.shoukai).toBe('0');
    expect(s.description).toBe('');
    expect(s.phone).toBe('');
    expect(s.langs).toEqual([]);
    expect(s.authorId).toBe('');
  });
});
