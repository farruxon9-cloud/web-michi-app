import { describe, it, expect } from 'vitest';
import { getProfileCompleteness, isProfileCompleteData } from './profileCompleteness';

const full = {
  fullName: 'Taro Yamada',
  birthDate: '1990-01-01',
  phone: '090-0000-0000',
  address: 'Tokyo',
  education: 'High school',
};

describe('getProfileCompleteness', () => {
  it('full profile is 100% complete', () => {
    expect(getProfileCompleteness(full)).toEqual({ percent: 100, missing: [], complete: true });
  });

  it('empty / null profile is 0%', () => {
    expect(getProfileCompleteness(null).percent).toBe(0);
    expect(getProfileCompleteness({}).missing).toEqual(['fullName', 'birthDate', 'phone', 'address', 'education']);
  });

  it('Mehmon and whitespace names count as missing', () => {
    expect(getProfileCompleteness({ ...full, fullName: 'Mehmon' }).missing).toEqual(['fullName']);
    expect(getProfileCompleteness({ ...full, fullName: '   ' }).missing).toEqual(['fullName']);
  });

  it('history arrays satisfy address/education', () => {
    const p = { ...full, address: '', education: '', addressHistory: [{}], educationHistory: [{}] };
    expect(isProfileCompleteData(p)).toBe(true);
  });

  it('percent rounds per field (3/5 = 60)', () => {
    const r = getProfileCompleteness({ ...full, phone: ' ', education: '' });
    expect(r.percent).toBe(60);
    expect(r.complete).toBe(false);
  });

  it('admin emails are always complete', () => {
    expect(isProfileCompleteData({ email: 'admin@driver.jp' })).toBe(true);
    expect(isProfileCompleteData({ email: 'admin@sagawa.jp' })).toBe(true);
  });

  it('non-string values do not throw', () => {
    expect(() => getProfileCompleteness({ fullName: 5, phone: null, address: {} })).not.toThrow();
  });
});
