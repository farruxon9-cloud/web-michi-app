import { describe, it, expect } from 'vitest';
import resources from './index';

// Guard: every locale must expose ONLY `translation` (keys placed next to it are unreachable by t()).
describe('locale resources shape', () => {
  it.each(Object.keys(resources))('%s exposes only the translation namespace', (lang) => {
    expect(Object.keys(resources[lang])).toEqual(['translation']);
  });
  it('recently added keys resolve', () => {
    ['homeAppsLabel', 'viewAsTitle', 'maintenanceTitle', 'broadcastLabel', 'newJobsPill'].forEach((k) => {
      expect(typeof resources.uz.translation[k]).toBe('string');
    });
  });
});
