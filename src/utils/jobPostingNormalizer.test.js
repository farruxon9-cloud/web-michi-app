import { describe, it, expect } from 'vitest';
import { normalizeJobPosting } from './jobPostingNormalizer';

describe('Job Posting Normalizer Tests', () => {
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
});
