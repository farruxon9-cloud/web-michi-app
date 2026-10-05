import { describe, it, expect } from 'vitest';
import { weekAround, localeFor } from './HomeClock';

describe('HomeClock helpers', () => {
  it('weekAround returns 7 days centred on today, across month boundaries', () => {
    const days = weekAround(new Date(2026, 9, 1, 23, 59));
    expect(days).toHaveLength(7);
    expect(days[3].getDate()).toBe(1);
    expect(days[0].getMonth()).toBe(8);
    expect(days[0].getDate()).toBe(28);
    expect(days[6].getDate()).toBe(4);
  });
  it('maps all 7 app languages to a locale', () => {
    ['ja', 'en', 'uz', 'ru', 'zh', 'vi', 'ne'].forEach((l) => expect(localeFor(l)).toMatch(/^[a-z]{2}-[A-Z]{2}$/));
    expect(localeFor('xx')).toBe('en-US');
  });
});
