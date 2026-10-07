import { describe, it, expect } from 'vitest';
import { validateBranch, formatBranchAddress, publicBranchPhone, branchMapsUrl, HIDDEN_PHONE_TEXT } from './branchUtils';
import { normalizeBranch } from './jobPostingNormalizer';

const valid = {
  name: '横浜営業所',
  postalCode: '231-0001',
  prefecture: 'Kanagawa',
  city: '横浜市中区',
  town: '新港1-2-3',
  phone: '045-123-4567',
};

describe('branchUtils', () => {
  it('accepts a complete branch', () => {
    expect(validateBranch(valid)).toEqual({});
  });

  it('reports Japanese errors for missing / malformed fields', () => {
    const e = validateBranch({ ...valid, name: '', postalCode: '12', phone: 'abc', town: '' });
    expect(e.name).toMatch('支店');
    expect(e.postalCode).toMatch('7桁');
    expect(e.phone).toMatch('電話番号');
    expect(e.town).toBeTruthy();
  });

  it('validates optional numeric fields', () => {
    expect(validateBranch({ ...valid, walkMinutes: 'x' }).walkMinutes).toBeTruthy();
    expect(validateBranch({ ...valid, headcount: '0' }).headcount).toBeTruthy();
    expect(validateBranch({ ...valid, walkMinutes: '5', headcount: '3' })).toEqual({});
  });

  it('formats the address with 〒 and prefecture kanji', () => {
    expect(formatBranchAddress({ ...valid, building: 'みちビル3階' })).toBe('〒231-0001 神奈川県 横浜市中区 新港1-2-3 みちビル3階');
  });

  it('hides private phones for job seekers', () => {
    const seekerView = normalizeBranch({ ...valid, phonePublic: false }, 0);
    expect(seekerView.phone).toBe('');
    expect(publicBranchPhone(seekerView)).toBeNull();
    expect(HIDDEN_PHONE_TEXT).toBe('面接時にお知らせします');

    const ownView = normalizeBranch({ ...valid, phonePublic: false }, 0, { keepPrivatePhone: true });
    expect(ownView.phone).toBe('045-123-4567');
    expect(publicBranchPhone(ownView)).toBeNull(); // still not shown publicly
  });

  it('builds a Google Maps URL', () => {
    expect(branchMapsUrl(valid)).toContain('https://www.google.com/maps/search/?api=1&query=');
    expect(branchMapsUrl({ ...valid, lat: 35.4, lng: 139.6 })).toContain('35.4,139.6');
  });
});
