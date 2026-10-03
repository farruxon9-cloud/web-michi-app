import { describe, it, expect } from 'vitest';
import { normalizeJobPosting, normalizeSchoolPosting, normalizeBranch, formatSalaryJPY } from './jobPostingNormalizer';

describe('Job & School Posting Normalizer Tests', () => {
  it('should normalize minimal raw job object with all required Townwork fields', () => {
    const raw = {
      id: 'job_1',
      title: 'Yangi yuk mashinasi haydovchisi',
      location: 'Tokyo, Koto-ku',
      salary: '¥350,000 / oyiga'
    };

    const normalized = normalizeJobPosting(raw);

    expect(normalized).toBeDefined();
    expect(normalized.id).toBe('job_1');
    expect(normalized.prefecture).toBe('Tokyo');
    expect(normalized.type).toBe('fulltime');
    expect(normalized.category).toBe('delivery_driver');
    expect(normalized.transportPaid).toBe(true);
    expect(normalized.noExperienceOk).toBe(true);
    expect(normalized.verified).toBe(false);
  });

  it('should return null if rawJob or id is missing', () => {
    expect(normalizeJobPosting(null)).toBeNull();
    expect(normalizeJobPosting({ title: 'No ID' })).toBeNull();
  });

  it('should format numeric salary into JPY string', () => {
    expect(formatSalaryJPY(350000)).toBe('¥350,000 / oyiga');
    expect(formatSalaryJPY('400000')).toBe('¥400,000 / oyiga');

    const raw = {
      id: 2,
      title: 'Kuryer',
      company: 'Sagawa',
      salary: 350000,
      licenses: ['oogata', 'futsu']
    };

    const normalized = normalizeJobPosting(raw);
    expect(normalized.id).toBe('2');
    expect(normalized.salary).toBe('¥350,000 / oyiga');
    expect(normalized.licenses).toEqual(['oogata', 'futsu']);
  });

  it('should preserve custom fields and branches when provided', () => {
    const raw = {
      id: 'job_3',
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
      walkTime: 3,
      branches: [
        { id: 'b1', name: 'Sendai Branch', prefecture: 'Miyagi', city: 'Sendai' }
      ]
    };

    const normalized = normalizeJobPosting(raw);

    expect(normalized.company).toBe('Yamato Logistics');
    expect(normalized.payType).toBe('hourly');
    expect(normalized.prefecture).toBe('Miyagi');
    expect(normalized.city).toBe('仙台市');
    expect(normalized.ward).toBe('青葉区');
    expect(normalized.nearestStation).toBe('仙台駅 (Sendai Station)');
    expect(normalized.walkTime).toBe(3);
    expect(normalized.branches.length).toBe(1);
    expect(normalized.branches[0].name).toBe('Sendai Branch');
  });

  it('should normalize branch object correctly', () => {
    const branch = normalizeBranch({
      id: 'b_100',
      name: 'Shinjuku Branch',
      postalCode: '160-0022',
      prefecture: 'Tokyo',
      city: 'Shinjuku-ku',
      phone: '03-1234-5678',
      phonePublic: true
    }, 0);

    expect(branch).toBeDefined();
    expect(branch.id).toBe('b_100');
    expect(branch.name).toBe('Shinjuku Branch');
    expect(branch.phone).toBe('03-1234-5678');
    expect(branch.phonePublic).toBe(true);
  });

  it('should normalize school posting correctly', () => {
    const rawSchool = {
      id: 'school_1',
      name: 'Tokyo Driving School',
      location: 'Tokyo, Shinjuku',
      courses: ['oogata', 'futsu']
    };

    const normalized = normalizeSchoolPosting(rawSchool);

    expect(normalized).toBeDefined();
    expect(normalized.id).toBe('school_1');
    expect(normalized.name).toBe('Tokyo Driving School');
    expect(normalized.prefecture).toBe('Tokyo');
    expect(normalized.courses).toEqual(['oogata', 'futsu']);
  });
});
