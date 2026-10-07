import { describe, it, expect } from 'vitest';
import { normalizeJobPosting, normalizeSchoolPosting, normalizeBranch, formatSalaryJPY, jobValueLabel, isOwnJob } from './jobPostingNormalizer';

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
    // Unknown perks are never invented
    expect(normalized.transportPaid).toBe(false);
    expect(normalized.noExperienceOk).toBe(false);
    expect(normalized.hours).toBe('');
    expect(normalized.insurance).toBe('');
    expect(normalized.verified).toBe(false);
  });

  it('reads the backend storage shape (conditions/contact/shoukai/location)', () => {
    const n = normalizeJobPosting({
      id: 'job_9', title: 'Driver', company: 'ABC', authorId: 'u_1',
      salary: '月給30万円〜', minSalary: 300000, maxSalary: 0, employmentType: 'contract', bonusPrivilege: 'bonus_2',
      location: { prefecture: 'Osaka', city: '大阪市', postalCode: '530-0001', addressLine: '梅田1-1', building: 'Aビル', nearestStation: '梅田駅', walkMinutes: 5, lat: 34.7, lng: 135.5 },
      conditions: { workShift: 'wh_day', holidayType: 'do_weekend', socialInsurance: 'insurance_full', dormitorySupport: 'housing_dorm' },
      foreignerSupport: ['foreigners_visa'],
      contact: { phone: '06-1111-2222', email: 'hr@abc.jp', callReceptionStyle: '一般公開' },
      shoukai: { enabled: true, amount: 30000 },
      licenses: ['lic_chugata'],
    });
    expect(n.salary).toBe('月給30万円〜');
    expect(n.salaryMin).toBe(300000);
    expect(n.salaryMax).toBeNull();
    expect(n.type).toBe('contract');
    expect(n.bonus).toBe('bonus_2');
    expect(n).toMatchObject({
      hours: 'wh_day', dayOff: 'do_weekend', insurance: 'insurance_full', housing: 'housing_dorm',
      foreigners: 'foreigners_visa', phone: '06-1111-2222', email: 'hr@abc.jp', phoneMode: 'public',
      hasShoukai: true, shoukaiFee: 30000, shoukaiAmount: '¥30,000', companyId: 'u_1',
      postalCode: '530-0001', detailAddress: '大阪市', townAddress: '梅田1-1', buildingAddress: 'Aビル',
      nearestStation: '梅田駅', walkTime: 5, license: 'lic_chugata',
    });
  });

  it('builds a salary label from the range and never invents one', () => {
    expect(normalizeJobPosting({ id: 1, minSalary: 250000, maxSalary: 320000 }).salary).toBe('¥250,000〜¥320,000');
    expect(normalizeJobPosting({ id: 2 }).salary).toBe('');
    expect(formatSalaryJPY('')).toBe('');
  });

  it('jobValueLabel shows 未入力 for empty values and maps alias keys', () => {
    const t = (k, d) => ({ notProvided: '未入力', ins_koyo: '雇用保険' }[k] || d || k);
    expect(jobValueLabel(t, '')).toBe('未入力');
    expect(jobValueLabel(t, undefined)).toBe('未入力');
    expect(jobValueLabel(t, 'insurance_employment')).toBe('雇用保険');
    expect(jobValueLabel(t, '自由入力')).toBe('自由入力');
  });

  it('isOwnJob matches by account id, name only for legacy records', () => {
    expect(isOwnJob({ companyId: 'u_1', company: 'X' }, { accountId: 'u_1' })).toBe(true);
    expect(isOwnJob({ companyId: 'u_2', company: 'ABC' }, { accountId: 'u_1', fullName: 'ABC' })).toBe(false);
    expect(isOwnJob({ company: 'ABC' }, { fullName: 'ABC' })).toBe(true);
    expect(isOwnJob({ company: 'Mehmon' }, { fullName: 'Mehmon' })).toBe(false);
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

  it('⭐ verified comes only from the server-set authorVerified flag', () => {
    expect(normalizeJobPosting({ id: 'j1', authorVerified: true }).verified).toBe(true);
    expect(normalizeJobPosting({ id: 'j2', verified: true }).verified).toBe(false);
    expect(normalizeSchoolPosting({ id: 's1', authorId: 'u1' }).verified).toBe(false);
    expect(normalizeSchoolPosting({ id: 's2', authorId: 'u1', authorVerified: true }).verified).toBe(true);
  });

  it('keeps moderation status and reason for the owner view', () => {
    const j = normalizeJobPosting({ id: 'j3', status: 'hidden', moderation: { status: 'hidden', reason: 'phone missing' } });
    expect(j.status).toBe('hidden');
    expect(j.moderation.reason).toBe('phone missing');
    expect(normalizeJobPosting({ id: 'j4' }).status).toBe('active');
  });
});
