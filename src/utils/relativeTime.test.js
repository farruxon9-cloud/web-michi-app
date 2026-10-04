import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from './relativeTime';

const NOW = Date.parse('2026-10-04T12:00:00Z');
const ago = (sec) => new Date(NOW - sec * 1000).toISOString();

describe('formatRelativeTime', () => {
  it('returns empty for missing / invalid input', () => {
    expect(formatRelativeTime(null, 'ja', NOW)).toBe('');
    expect(formatRelativeTime('', 'ja', NOW)).toBe('');
    expect(formatRelativeTime('not-a-date', 'ja', NOW)).toBe('');
  });

  it('formats days in Japanese', () => {
    expect(formatRelativeTime(ago(3 * 86400), 'ja', NOW)).toBe('3 日前');
  });

  it('uses numeric:auto (yesterday)', () => {
    expect(formatRelativeTime(ago(86400), 'en', NOW)).toBe('yesterday');
  });

  it('formats hours and weeks in English', () => {
    expect(formatRelativeTime(ago(5 * 3600), 'en', NOW)).toBe('5 hours ago');
    expect(formatRelativeTime(ago(14 * 86400), 'en', NOW)).toBe('2 weeks ago');
  });

  it('very recent is "now"-ish, not empty', () => {
    expect(formatRelativeTime(ago(10), 'en', NOW)).toBe('this minute');
  });

  it('accepts Date and timestamp, and unknown locale falls back without throwing', () => {
    expect(formatRelativeTime(new Date(NOW - 2 * 86400 * 1000), 'en', NOW)).toBe('2 days ago');
    expect(formatRelativeTime(NOW - 2 * 86400 * 1000, 'en', NOW)).toBe('2 days ago');
    expect(() => formatRelativeTime(ago(86400), 'xx-invalid-@@', NOW)).not.toThrow();
  });
});
