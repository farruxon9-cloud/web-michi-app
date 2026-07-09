import { describe, it, expect } from 'vitest';
import { getEraInfo, toJapaneseEra, calculateAge, toJapaneseEraYear } from './japaneseEra';

describe('Japanese Era Helpers', () => {
  describe('getEraInfo', () => {
    it('should identify Reiwa era correctly', () => {
      const info = getEraInfo('2020-05-15');
      expect(info).toBeDefined();
      expect(info.eraName).toBe('令和');
      expect(info.eraYear).toBe(2);
      expect(info.year).toBe(2020);
      expect(info.month).toBe(5);
      expect(info.day).toBe(15);
    });

    it('should identify first year of Reiwa correctly', () => {
      const info = getEraInfo('2019-06-01');
      expect(info.eraName).toBe('令和');
      expect(info.eraYear).toBe('元');
    });

    it('should identify Heisei era correctly', () => {
      const info = getEraInfo('1995-10-15');
      expect(info.eraName).toBe('平成');
      expect(info.eraYear).toBe(7);
    });

    it('should return null for invalid date string', () => {
      expect(getEraInfo(null)).toBeNull();
      expect(getEraInfo('invalid-date')).toBeNull();
    });
  });

  describe('toJapaneseEra', () => {
    it('should format full date string to Japanese Era representation', () => {
      expect(toJapaneseEra('2026-07-09')).toBe('令和8年7月9日');
      expect(toJapaneseEra('1989-01-08')).toBe('平成元年1月8日');
    });
  });

  describe('calculateAge', () => {
    it('should calculate correct age based on current date', () => {
      // Mock birthdate in the past
      const birth = '2000-01-01';
      const age = calculateAge(birth);
      const expected = new Date().getFullYear() - 2000;
      // We check if it is either expected or expected-1 depending on current date (past Jan 1)
      expect(age).toBeLessThanOrEqual(expected);
      expect(age).toBeGreaterThanOrEqual(expected - 1);
    });
  });

  describe('toJapaneseEraYear', () => {
    it('should map Gregorian years to Japanese Era Years', () => {
      expect(toJapaneseEraYear(2020)).toBe('令和2年');
      expect(toJapaneseEraYear(1989)).toBe('平成元年');
      expect(toJapaneseEraYear(1988)).toBe('昭和63年');
      expect(toJapaneseEraYear(1920)).toBe('1920年');
    });
  });
});
