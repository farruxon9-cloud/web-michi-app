import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useHiddenItems from './useHiddenItems';

describe('useHiddenItems', () => {
  beforeEach(() => localStorage.clear());

  it('hides, persists per user, and unhides', () => {
    const { result } = renderHook(() => useHiddenItems('apps', 'u1'));
    expect(result.current.hiddenSet.size).toBe(0);

    act(() => result.current.hide(['job:1', 'school:2']));
    expect(result.current.hiddenSet.has('job:1')).toBe(true);
    expect(JSON.parse(localStorage.getItem('michi_draft:hidden_apps:u1'))).toEqual(['job:1', 'school:2']);

    act(() => result.current.unhide('job:1'));
    expect(result.current.hiddenSet.has('job:1')).toBe(false);

    act(() => result.current.unhideAll());
    expect(result.current.hiddenSet.size).toBe(0);
  });

  it('keeps users separate and reloads on account switch', () => {
    localStorage.setItem('michi_draft:hidden_apps:u2', JSON.stringify(['job:9']));
    const { result, rerender } = renderHook(({ uid }) => useHiddenItems('apps', uid), { initialProps: { uid: 'u1' } });
    expect(result.current.hiddenSet.size).toBe(0);
    rerender({ uid: 'u2' });
    expect(result.current.hiddenSet.has('job:9')).toBe(true);
  });

  it('ignores corrupted storage', () => {
    localStorage.setItem('michi_draft:hidden_apps:u3', '{not json');
    const { result } = renderHook(() => useHiddenItems('apps', 'u3'));
    expect(result.current.hiddenSet.size).toBe(0);
    localStorage.setItem('michi_draft:hidden_apps:u4', JSON.stringify([1, null, 'job:1']));
    const { result: r2 } = renderHook(() => useHiddenItems('apps', 'u4'));
    expect(Array.from(r2.current.hiddenSet)).toEqual(['job:1']);
  });
});
