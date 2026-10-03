import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadUserDraft, saveUserDraft, removeUserDraft, clearAllUserDrafts, pickProfileDraft
} from './localDraftStore';

describe('localDraftStore', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips data per user and kind', () => {
    expect(saveUserDraft('profile', 'u1', { fullName: 'A' })).toBe(true);
    saveUserDraft('profile', 'u2', { fullName: 'B' });
    expect(loadUserDraft('profile', 'u1')).toEqual({ fullName: 'A' });
    expect(loadUserDraft('profile', 'u2')).toEqual({ fullName: 'B' });
    expect(loadUserDraft('apps', 'u1', [])).toEqual([]);
  });

  it('returns fallback on corrupted JSON', () => {
    localStorage.setItem('michi_draft:profile:u1', '{not json');
    expect(loadUserDraft('profile', 'u1', null)).toBeNull();
  });

  it('returns false instead of throwing when storage is full', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    expect(saveUserDraft('profile', 'u1', { a: 1 })).toBe(false);
    spy.mockRestore();
  });

  it('clearAllUserDrafts removes only draft keys (logout privacy)', () => {
    saveUserDraft('profile', 'u1', { a: 1 });
    saveUserDraft('apps', 'u1', [1]);
    localStorage.setItem('michi_lang', 'ja');
    clearAllUserDrafts();
    expect(loadUserDraft('profile', 'u1')).toBeNull();
    expect(loadUserDraft('apps', 'u1')).toBeNull();
    expect(localStorage.getItem('michi_lang')).toBe('ja');
  });

  it('removeUserDraft removes a single entry', () => {
    saveUserDraft('profile', 'u1', { a: 1 });
    removeUserDraft('profile', 'u1');
    expect(loadUserDraft('profile', 'u1')).toBeNull();
  });

  it('pickProfileDraft keeps only resume fields', () => {
    const out = pickProfileDraft({ fullName: 'A', phone: '1', userId: 'x', token: 'secret', avatar: 'data:...' });
    expect(out).toEqual({ fullName: 'A', phone: '1' });
  });
});
