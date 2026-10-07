import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
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

// Guard: fallbackLng is 'en', so a key that exists in en.js but is missing in another locale shows
// ENGLISH to that user (e.g. Japanese profile seeing English filter labels). Every used key must exist everywhere.
describe('locale completeness for keys used in code', () => {
  const srcDir = path.resolve(process.cwd(), 'src');
  const used = new Set();
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) { if (name !== 'locales' && name !== 'node_modules') walk(p); }
      else if (/\.(jsx?|tsx?)$/.test(name) && !/\.test\./.test(name)) {
        const s = fs.readFileSync(p, 'utf8');
        for (const m of s.matchAll(/\bt\(\s*['"`]([A-Za-z0-9_.-]+)['"`]/g)) used.add(m[1]);
      }
    }
  };
  walk(srcDir);
  const en = resources.en.translation;
  const keys = [...used].filter((k) => Object.prototype.hasOwnProperty.call(en, k));

  it.each(Object.keys(resources).filter((l) => l !== 'en'))('%s has every used key that en has', (lang) => {
    const dict = resources[lang].translation;
    const missing = keys.filter((k) => !Object.prototype.hasOwnProperty.call(dict, k));
    expect(missing).toEqual([]);
  });
});

// Guard: a key used in user-facing code but missing from en.js (and other locales) silently renders the
// hardcoded inline default (often Japanese/Uzbek) for EVERY user. src/admin has its own i18n, so it is excluded.
describe('every statically used key exists in all locales (non-admin code)', () => {
  const srcDir = path.resolve(process.cwd(), 'src');
  const used = new Map(); // key -> first file using it
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) {
        if (!['locales', 'node_modules', 'admin'].includes(name)) walk(p);
      } else if (/\.(jsx?|tsx?)$/.test(name) && !/\.test\./.test(name)) {
        const s = fs.readFileSync(p, 'utf8');
        for (const m of s.matchAll(/\bt\(\s*(['"`])([A-Za-z0-9_.-]+)\1/g)) {
          if (!used.has(m[2])) used.set(m[2], path.relative(srcDir, p));
        }
      }
    }
  };
  walk(srcDir);

  it('finds used keys', () => {
    expect(used.size).toBeGreaterThan(100);
  });

  it.each(Object.keys(resources))('%s defines every key used via t() in non-admin src', (lang) => {
    const dict = resources[lang].translation;
    const missing = [...used.entries()]
      .filter(([k]) => !Object.prototype.hasOwnProperty.call(dict, k))
      .map(([k, f]) => `${k} (${f})`);
    expect(missing).toEqual([]);
  });
});
