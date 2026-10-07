import { describe, it, expect } from 'vitest';
import { JOB_FEATURES } from './jobFeatures';
import { JOB_CATEGORIES } from './jobCategories';
import { pickField } from '../utils/localize';

const SUFFIXES = ['Uz', 'En', 'Ru', 'Zh', 'Vi', 'Ne'];

function expectAllLangs(obj, field, where) {
  expect(typeof obj[field] === 'string' && obj[field].trim().length > 0, `${where}.${field}`).toBe(true);
  for (const s of SUFFIXES) {
    const v = obj[`${field}${s}`];
    expect(typeof v === 'string' && v.trim().length > 0, `${where}.${field}${s}`).toBe(true);
  }
}

describe('JOB_FEATURES i18n', () => {
  for (const [key, group] of Object.entries(JOB_FEATURES)) {
    it(`group "${key}" has title + options in all languages`, () => {
      expectAllLangs(group, 'title', key);
      expect(group.options.length).toBeGreaterThan(0);
      for (const opt of group.options) expectAllLangs(opt, 'name', `${key}.${opt.id}`);
    });
  }
});

describe('JOB_CATEGORIES i18n', () => {
  for (const cat of JOB_CATEGORIES) {
    it(`category "${cat.id}" and subcategories have all languages`, () => {
      expectAllLangs(cat, 'name', cat.id);
      for (const sub of cat.subcategories) expectAllLangs(sub, 'name', `${cat.id}.${sub.id}`);
    });
  }
});

describe('pickField with job data', () => {
  it('returns language-specific names', () => {
    const opt = JOB_FEATURES.employment.options[0];
    expect(pickField(opt, 'name', 'ja')).toBe(opt.name);
    expect(pickField(opt, 'name', 'uz')).toBe(opt.nameUz);
    expect(pickField(opt, 'name', 'en')).toBe(opt.nameEn);
    expect(pickField(opt, 'name', 'ru')).toBe(opt.nameRu);
    expect(pickField(opt, 'name', 'zh')).toBe(opt.nameZh);
    expect(pickField(opt, 'name', 'vi')).toBe(opt.nameVi);
    expect(pickField(opt, 'name', 'ne')).toBe(opt.nameNe);
  });
});

// RADIUS_OPTIONS lives in DriverFeed.jsx (imports leaflet/CSS). Import lazily
// so a heavy-environment failure is reported clearly rather than breaking the data tests.
describe('RADIUS_OPTIONS i18n', () => {
  it('every radius option has label + sublabel in all languages', async () => {
    const { RADIUS_OPTIONS } = await import('../components/DriverFeed.jsx');
    expect(RADIUS_OPTIONS.length).toBeGreaterThan(0);
    for (const opt of RADIUS_OPTIONS) {
      expectAllLangs(opt, 'label', `radius${opt.value}`);
      expectAllLangs(opt, 'sublabel', `radius${opt.value}`);
    }
  });
});
