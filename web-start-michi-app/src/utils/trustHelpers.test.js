import { describe, it, expect } from 'vitest';
import {
  formatDate, formatYearMonth, daysUntil, isVerifiedListing, listingVerifiedAt,
  normalizeVerification, canRequestVerification, missingItemTarget, listingExpiryInfo,
  LICENSE_TYPES, licenseTypeLabel, licenseEffectiveStatus, fitWithin, dataUrlBytes,
  notifKindKey, notifParams, validateTicketDraft, suspensionInfo,
} from './trustHelpers';

const NOW = Date.parse('2026-10-05T12:00:00Z');

describe('dates', () => {
  it('formats YYYY-MM-DD / YYYY-MM and rejects junk', () => {
    expect(formatDate('2026-03-09T10:00:00')).toBe('2026-03-09');
    expect(formatYearMonth('2026-03-09T10:00:00')).toBe('2026-03');
    expect(formatDate('nope')).toBe('');
    expect(formatYearMonth(null)).toBe('');
  });
  it('counts days until a date (ceil, negative when past)', () => {
    expect(daysUntil('2026-10-08T12:00:00Z', NOW)).toBe(3);
    expect(daysUntil('2026-10-05T13:00:00Z', NOW)).toBe(1);
    expect(daysUntil('2026-10-01T12:00:00Z', NOW)).toBe(-4);
    expect(Number.isNaN(daysUntil(undefined, NOW))).toBe(true);
  });
});

describe('verified listing', () => {
  it('only trusts the server flag (authorVerified → verified)', () => {
    expect(isVerifiedListing({ authorVerified: true })).toBe(true);
    expect(isVerifiedListing({ verified: true })).toBe(true);
    expect(isVerifiedListing({ verified: 'yes' })).toBe(false);
    expect(isVerifiedListing({})).toBe(false);
    expect(isVerifiedListing(null)).toBe(false);
  });
  it('reads verifiedAt from raw or normalized fields', () => {
    expect(listingVerifiedAt({ authorVerifiedAt: 'a' })).toBe('a');
    expect(listingVerifiedAt({ verifiedAt: 'b' })).toBe('b');
    expect(listingVerifiedAt(null)).toBe(null);
  });
});

describe('normalizeVerification', () => {
  it('defaults to none and keeps server fields', () => {
    const vm = normalizeVerification(null, NOW);
    expect(vm).toMatchObject({ status: 'none', eligible: false, missing: [], note: '', cooldownUntil: null });
  });
  it('computes expired from expiresAt', () => {
    expect(normalizeVerification({ status: 'verified', expiresAt: '2026-10-01T00:00:00Z' }, NOW).status).toBe('expired');
    expect(normalizeVerification({ status: 'verified', expiresAt: '2027-10-01T00:00:00Z' }, NOW).status).toBe('verified');
  });
  it('keeps the note only when rejected and drops past cooldowns', () => {
    const r = normalizeVerification({ status: 'rejected', note: 'bad name', cooldownUntil: '2026-10-06T00:00:00Z' }, NOW);
    expect(r.note).toBe('bad name');
    expect(r.cooldownUntil).toBe('2026-10-06T00:00:00Z');
    expect(normalizeVerification({ status: 'pending', note: 'x' }, NOW).note).toBe('');
    expect(normalizeVerification({ status: 'rejected', cooldownUntil: '2026-10-01T00:00:00Z' }, NOW).cooldownUntil).toBe(null);
  });
  it('canRequestVerification: eligible, not pending/verified, no cooldown', () => {
    expect(canRequestVerification({ status: 'none', eligible: true })).toBe(true);
    expect(canRequestVerification({ status: 'expired', eligible: true })).toBe(true);
    expect(canRequestVerification({ status: 'none', eligible: false })).toBe(false);
    expect(canRequestVerification({ status: 'pending', eligible: true })).toBe(false);
    expect(canRequestVerification({ status: 'verified', eligible: true })).toBe(false);
    expect(canRequestVerification({ status: 'rejected', eligible: true, cooldownUntil: 'x' })).toBe(false);
  });
  it('maps missing items to where they are fixed', () => {
    expect(missingItemTarget('listing')).toBe('post_job');
    expect(missingItemTarget('phone')).toBe('personalInfo');
  });
});

describe('listingExpiryInfo', () => {
  it('classifies expiry', () => {
    expect(listingExpiryInfo({}, NOW)).toEqual({ state: 'none', days: null });
    expect(listingExpiryInfo({ status: 'expired' }, NOW).state).toBe('expired');
    expect(listingExpiryInfo({ expiresAt: '2026-10-01T00:00:00Z' }, NOW).state).toBe('expired');
    expect(listingExpiryInfo({ expiresAt: '2026-10-08T12:00:00Z' }, NOW)).toEqual({ state: 'soon', days: 3 });
    expect(listingExpiryInfo({ expiresAt: '2026-12-01T00:00:00Z' }, NOW).state).toBe('ok');
  });
});

describe('licence helpers', () => {
  it('lists the 9 licence types with Japanese names', () => {
    expect(LICENSE_TYPES.map((l) => l.id)).toEqual(['futsu', 'junchugata', 'chugata', 'ogata', 'ogata_tokushu', 'kenin', 'futsu2', 'chugata2', 'ogata2']);
    expect(licenseTypeLabel('ogata2')).toBe('大型二種');
    expect(licenseTypeLabel('x')).toBe('');
  });
  it('effective status: none / expired / passthrough', () => {
    expect(licenseEffectiveStatus(null, NOW)).toBe('none');
    expect(licenseEffectiveStatus({ type: 'futsu', status: 'verified', expiresAt: '2026-01-01' }, NOW)).toBe('expired');
    expect(licenseEffectiveStatus({ type: 'futsu', status: 'verified', expiresAt: '2030-01-01' }, NOW)).toBe('verified');
    expect(licenseEffectiveStatus({ type: 'futsu', status: 'rejected', expiresAt: '2020-01-01' }, NOW)).toBe('rejected');
  });
  it('fits images within 1600px keeping the aspect ratio', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(1000, 3200)).toEqual({ width: 500, height: 1600 });
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(0, 10)).toEqual({ width: 0, height: 0 });
  });
  it('estimates data URL byte size', () => {
    expect(dataUrlBytes('data:image/jpeg;base64,AAAA')).toBe(3);
    expect(dataUrlBytes('data:image/jpeg;base64,AA==')).toBe(1);
    expect(dataUrlBytes('')).toBe(0);
  });
});

describe('notifications', () => {
  it('builds the i18n key from the kind', () => {
    expect(notifKindKey('verification.approved')).toBe('notifKind_verification_approved');
    expect(notifKindKey('account.deletion_scheduled')).toBe('notifKind_account_deletion_scheduled');
  });
  it('formats ISO dates in params', () => {
    expect(notifParams({ date: '2026-11-04T00:00:00Z', days: 30, note: null })).toMatchObject({ days: 30, note: '' });
    expect(notifParams({ date: '2026-11-04T09:00:00' }).date).toBe('2026-11-04');
    expect(notifParams(undefined)).toEqual({});
  });
});

describe('validateTicketDraft', () => {
  it('requires subject, category and body within limits', () => {
    expect(validateTicketDraft({ subject: 'Hi', category: 'bug', body: 'Broken' })).toEqual({});
    expect(validateTicketDraft({ subject: ' ', category: 'nope', body: '' })).toEqual({ subject: 'required', category: 'required', body: 'required' });
    expect(validateTicketDraft({ subject: 'x'.repeat(121), category: 'other', body: 'y'.repeat(4001) })).toEqual({ subject: 'tooLong', body: 'tooLong' });
  });
});

describe('suspensionInfo', () => {
  it('extracts until/reason only for SUSPENDED', () => {
    expect(suspensionInfo({ code: 'SUSPENDED', until: '2026-12-01', reason: 'spam' })).toEqual({ until: '2026-12-01', reason: 'spam' });
    expect(suspensionInfo({ code: 'SUSPENDED' })).toEqual({ until: null, reason: '' });
    expect(suspensionInfo({ status: 401 })).toBe(null);
    expect(suspensionInfo(null)).toBe(null);
  });
});
