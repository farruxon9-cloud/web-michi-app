import { describe, it, expect, vi } from 'vitest';
import { pressable, tabProps } from './a11y';

const keyEvent = (key, sameTarget = true) => {
  const el = {};
  return { key, target: el, currentTarget: sameTarget ? el : {}, preventDefault: vi.fn() };
};

describe('pressable', () => {
  it('adds role/tabIndex and keeps onClick', () => {
    const fn = vi.fn();
    const p = pressable(fn);
    expect(p.role).toBe('button');
    expect(p.tabIndex).toBe(0);
    expect(p.onClick).toBe(fn);
    expect(p['aria-label']).toBeUndefined();
  });

  it('activates on Enter and Space, prevents default scroll', () => {
    const fn = vi.fn();
    const p = pressable(fn);
    const e1 = keyEvent('Enter');
    const e2 = keyEvent(' ');
    p.onKeyDown(e1);
    p.onKeyDown(e2);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(e1.preventDefault).toHaveBeenCalled();
  });

  it('ignores other keys and events bubbling from children', () => {
    const fn = vi.fn();
    const p = pressable(fn);
    p.onKeyDown(keyEvent('a'));
    p.onKeyDown(keyEvent('Enter', false));
    expect(fn).not.toHaveBeenCalled();
  });

  it('sets aria-label when given', () => {
    expect(pressable(() => {}, 'Label')['aria-label']).toBe('Label');
  });
});

describe('tabProps', () => {
  it('returns tab role and boolean aria-selected', () => {
    expect(tabProps(1)).toEqual({ role: 'tab', 'aria-selected': true });
    expect(tabProps(undefined)).toEqual({ role: 'tab', 'aria-selected': false });
  });
});
