import { describe, it, expect } from 'vitest';
import { normalizeJobPosting, normalizeSchoolPosting, formatSalaryJPY } from './jobPostingNormalizer';

describe('Job & School Posting Normalizer Tests', () => {
  it('should normalize minimal raw job object with all required Townwork fields', () => {
    const raw = {
      title: 'Yangi yuk mashinasi haydovchisi',
      location: 'Tokyo, Koto-ku',
      salary: '¥350,000 / oyiga'
    };

    const normalized = normalizeJobPosting(raw);

    expect(normalized).toBeDefined();
    expect(normalized.prefecture).toBe('Tokyo');
    expect(normalized.type).toBe('fulltime');
    expect(normalized.category).toBe('delivery_driver');
    expect(normalized.nearestStation).toBe('東京駅 (Tokyo Station)');
    expect(normalized.walkTime).toBe(8);
    expect(normalized.transportPaid).toBe(true);
    expect(normalized.noExperienceOk).toBe(true);
  });

  it('should format numeric salary into JPY string', () => {
    expect(formatSalaryJPY(350000)).toBe('¥350,000 / oyiga');
    expect(formatSalaryJPY('400000')).toBe('¥400,000 / oyiga');

    const raw = {
      title: 'Kuryer',
      company: 'Sagawa',
      salary: 350000,
      licenses: ['oogata', 'futsu']
    };

    const normalized = normalizeJobPosting(raw);
    expect(normalized.salary).toBe('¥350,000 / oyiga');
    expect(normalized.licenses).toEqual(['oogata', 'futsu']);
  });

  it('should preserve custom fields when provided', () => {
    const raw = {
      company: 'Yamato Logistics',
      title: 'Forklift operatori',
      salary: '¥1,500 / soatiga',
      type: 'parttime',
      category: 'warehouse_light',
      subcategory: 'tech_forklift',
      prefecture: 'Miyagi',
      city: '仙台市',
      ward: '青葉区',
      nearestStation: '仙台駅 (Sendai Station)',
      walkTime: 3
    };

    const normalized = normalizeJobPosting(raw);

    expect(normalized.company).toBe('Yamato Logistics');
    expect(normalized.payType).toBe('hourly');
    expect(normalized.prefecture).toBe('Miyagi');
    expect(normalized.city).toBe('仙台市');
    expect(normalized.ward).toBe('青葉区');
    expect(normalized.nearestStation).toBe('仙台駅 (Sendai Station)');
    expect(normalized.walkTime).toBe(3);
  });

  it('should normalize school posting correctly', () => {
    const rawSchool = {
      name: 'Tokyo Driving School',
      price: 320000,
      location: 'Tokyo, Shinjuku',
      licenses: ['oogata', 'futsu'],
      hasAccommodation: true
    };

    const normalized = normalizeSchoolPosting(rawSchool);

    expect(normalized).toBeDefined();
    expect(normalized.name).toBe('Tokyo Driving School');
    expect(normalized.price).toBe('¥320,000');
    expect(normalized.prefecture).toBe('Tokyo');
    expect(normalized.licenses).toEqual(['oogata', 'futsu']);
    expect(normalized.hasAccommodation).toBe(true);
  });
});

