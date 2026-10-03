// ============================================================
// JOB & SCHOOL POSTING NORMALIZER UTILITY FOR MICHI SERVER
// Ensures 100% UI and filter compatibility for Jobs and Schools
// ============================================================

const s = (v) => (typeof v === 'string' ? v.trim() : '');

export function formatSalaryJPY(val) {
  if (!val) return '¥250,000 / oyiga';
  if (typeof val === 'number') {
    return `¥${val.toLocaleString('ja-JP')} / oyiga`;
  }
  const str = String(val).trim();
  if (/^\d+$/.test(str)) {
    return `¥${Number(str).toLocaleString('ja-JP')} / oyiga`;
  }
  return str;
}

const numOrNull = (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * @param {object} raw
 * @param {number} idx
 * @param {{ keepPrivatePhone?: boolean }} opts
 *   keepPrivatePhone=true when sending to our own API (company owns the data);
 *   default false for anything rendered to job seekers.
 */
export function normalizeBranch(raw, idx = 0, { keepPrivatePhone = false } = {}) {
  if (!raw) return null;
  const phonePublic = raw.phonePublic !== false && raw.phone_public !== false;
  return {
    id: String(raw.id ?? `b${idx}`),
    name: s(raw.name),
    postalCode: s(raw.postalCode ?? raw.postal_code),
    prefecture: s(raw.prefecture),
    city: s(raw.city),
    town: s(raw.town),
    building: s(raw.building),
    phone: phonePublic || keepPrivatePhone ? s(raw.phone) : '',
    phonePublic,
    nearestStation: s(raw.nearestStation ?? raw.nearest_station),
    walkMinutes: numOrNull(raw.walkMinutes ?? raw.walk_minutes),
    headcount: numOrNull(raw.headcount),
    lat: numOrNull(raw.lat),
    lng: numOrNull(raw.lng),
  };
}

export function normalizeJobPosting(rawJob) {
  if (!rawJob || !rawJob.id) return null;
  const jobId = String(rawJob.id);

  // Extract prefecture, city, ward, and address parts
  let fullAddr = '';
  let prefecture = rawJob.prefecture || '';
  let city = rawJob.city || '';
  let ward = rawJob.ward || '';
  let lat = rawJob.lat;
  let lng = rawJob.lng;

  if (typeof rawJob.location === 'object' && rawJob.location !== null) {
    prefecture = prefecture || rawJob.location.prefecture || '';
    city = city || rawJob.location.city || '';
    lat = lat !== undefined ? lat : rawJob.location.lat;
    lng = lng !== undefined ? lng : rawJob.location.lng;
    fullAddr = [prefecture, city].filter(Boolean).join(', ');
  } else {
    fullAddr = typeof rawJob.fullAddress === 'string' ? rawJob.fullAddress : (typeof rawJob.location === 'string' ? rawJob.location : '');
  }

  if (!prefecture) {
    if (fullAddr.includes('Tokyo') || fullAddr.includes('東京')) prefecture = 'Tokyo';
    else if (fullAddr.includes('Miyagi') || fullAddr.includes('宮城')) prefecture = 'Miyagi';
    else if (fullAddr.includes('Kanagawa') || fullAddr.includes('神奈川')) prefecture = 'Kanagawa';
    else if (fullAddr.includes('Osaka') || fullAddr.includes('大阪')) prefecture = 'Osaka';
    else if (fullAddr.includes('Saitama') || fullAddr.includes('埼玉')) prefecture = 'Saitama';
    else if (fullAddr.includes('Chiba') || fullAddr.includes('千葉')) prefecture = 'Chiba';
    else if (fullAddr.includes('Aichi') || fullAddr.includes('愛知')) prefecture = 'Aichi';
    else if (fullAddr.includes('Hokkaido') || fullAddr.includes('北海道')) prefecture = 'Hokkaido';
    else if (fullAddr.includes('Fukuoka') || fullAddr.includes('福岡')) prefecture = 'Fukuoka';
    else if (fullAddr.includes('Kyoto') || fullAddr.includes('京都')) prefecture = 'Kyoto';
    else if (fullAddr.includes('Hyogo') || fullAddr.includes('兵庫')) prefecture = 'Hyogo';
    else prefecture = 'Tokyo';
  }

  // Ensure licenses is array
  let licenses = Array.isArray(rawJob.licenses) ? rawJob.licenses : [];
  if (licenses.length === 0 && rawJob.license) {
    licenses = [rawJob.license];
  }

  // Normalize salary
  let rawSalaryVal = rawJob.salary;
  let salaryMin = 250000;
  let salaryMax = 450000;

  if (typeof rawJob.salary === 'object' && rawJob.salary !== null) {
    salaryMin = rawJob.salary.min || 250000;
    salaryMax = rawJob.salary.max || salaryMin * 1.5;
    rawSalaryVal = salaryMin;
  } else if (typeof rawJob.salaryMin === 'number') {
    salaryMin = rawJob.salaryMin;
    salaryMax = rawJob.salaryMax || salaryMin * 1.5;
  }

  const salaryDisplay = formatSalaryJPY(rawSalaryVal);
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  return {
    id: jobId,
    publishedAt: rawJob.publishedAt || rawJob.published_at || rawJob.createdAt || rawJob.created_at || null,
    companyId: rawJob.companyId ? String(rawJob.companyId) : (rawJob.company_id ? String(rawJob.company_id) : null),
    company: s(rawJob.company) || 'Kompaniya',
    title: s(rawJob.title) || 'Ish o\'rni',
    salary: salaryDisplay,
    salaryMin,
    salaryMax,
    type: rawJob.type || 'fulltime', // fulltime | parttime | contract | dispatch
    category: rawJob.category || 'delivery_driver',
    subcategory: rawJob.subcategory || 'delivery_local',
    payType: rawJob.payType || (String(salaryDisplay).includes('soat') ? 'hourly' : 'monthly'),
    duration: rawJob.duration || 'long', // long | short_1m | short_1w | single_day
    startTime: rawJob.startTime || '8',
    transportPaid: rawJob.transportPaid !== undefined ? rawJob.transportPaid : true,
    noExperienceOk: rawJob.noExperienceOk !== undefined ? rawJob.noExperienceOk : true,
    shoukai: s(rawJob.shoukai),
    shoukaiAmount: s(rawJob.shoukaiAmount),
    hasShoukai: rawJob.hasShoukai === true || rawJob.has_shoukai === true,
    shoukaiConditions: s(rawJob.shoukaiConditions || rawJob.shoukai_conditions),
    image: rawJob.image || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
    verified: rawJob.verified === true,
    location: typeof rawJob.location === 'string' ? rawJob.location : fullAddr,
    prefecture,
    city,
    ward,
    lat: Number.isFinite(parsedLat) ? parsedLat : null,
    lng: Number.isFinite(parsedLng) ? parsedLng : null,
    fullAddress: fullAddr,
    nearestStation: s(rawJob.nearestStation || rawJob.nearest_station),
    walkTime: Number.isFinite(+rawJob.walkTime) ? +rawJob.walkTime : null,
    hours: rawJob.hours || '08:00 - 17:00',
    dayOff: rawJob.dayOff || 'shanba_yakshanba',
    bonus: rawJob.bonus || 'bonus_2',
    insurance: rawJob.insurance || 'insurance_full',
    foreigners: rawJob.foreigners || 'foreigners_visa',
    housing: rawJob.housing || 'housing_none',
    license: rawJob.license || (licenses[0] || 'lic_futsu'),
    licenses,
    tags: Array.isArray(rawJob.tags) ? rawJob.tags : [],
    description: s(rawJob.description),
    logo: rawJob.logo || 'https://ui-avatars.com/api/?name=Company&background=0D8ABC&color=fff&size=100',
    phone: s(rawJob.phone),
    email: s(rawJob.email),
    phoneMode: rawJob.phoneMode || 'public',
    isInternational: rawJob.isInternational !== undefined ? rawJob.isInternational : false,
    isActive: rawJob.isActive !== undefined ? rawJob.isActive : true,
    hiringScope: rawJob.hiringScope || rawJob.hiring_scope || 'headquarters',
    branches: (Array.isArray(rawJob.branches) ? rawJob.branches : [])
      .map((b, i) => normalizeBranch(b, i))
      .filter(Boolean)
  };
}

/**
 * Same as normalizeJobPosting, but for the owning company's dashboard:
 * hidden branch phones are preserved so editing a job doesn't erase them.
 * Never use this for data shown to job seekers.
 */
export function normalizeOwnJobPosting(rawJob) {
  const job = normalizeJobPosting(rawJob);
  if (!job) return null;
  job.branches = (Array.isArray(rawJob.branches) ? rawJob.branches : [])
    .map((b, i) => normalizeBranch(b, i, { keepPrivatePhone: true }))
    .filter(Boolean);
  return job;
}

export function normalizeSchoolPosting(rawSchool) {
  if (!rawSchool || !rawSchool.id) return null;
  const schoolId = String(rawSchool.id);

  let fullAddr = '';
  let prefecture = rawSchool.prefecture || '';
  let lat = rawSchool.lat;
  let lng = rawSchool.lng;

  if (typeof rawSchool.location === 'object' && rawSchool.location !== null) {
    prefecture = prefecture || rawSchool.location.prefecture || '';
    lat = lat !== undefined ? lat : rawSchool.location.lat;
    lng = lng !== undefined ? lng : rawSchool.location.lng;
    fullAddr = prefecture;
  } else {
    fullAddr = typeof rawSchool.fullAddress === 'string' ? rawSchool.fullAddress : (typeof rawSchool.location === 'string' ? rawSchool.location : '');
  }

  if (!prefecture) {
    if (fullAddr.includes('Tokyo') || fullAddr.includes('東京')) prefecture = 'Tokyo';
    else if (fullAddr.includes('Miyagi') || fullAddr.includes('宮城')) prefecture = 'Miyagi';
    else if (fullAddr.includes('Kanagawa') || fullAddr.includes('神奈川')) prefecture = 'Kanagawa';
    else if (fullAddr.includes('Osaka') || fullAddr.includes('大阪')) prefecture = 'Osaka';
    else if (fullAddr.includes('Saitama') || fullAddr.includes('埼玉')) prefecture = 'Saitama';
    else if (fullAddr.includes('Chiba') || fullAddr.includes('千葉')) prefecture = 'Chiba';
    else if (fullAddr.includes('Aichi') || fullAddr.includes('愛知')) prefecture = 'Aichi';
    else if (fullAddr.includes('Hokkaido') || fullAddr.includes('北海道')) prefecture = 'Hokkaido';
    else if (fullAddr.includes('Fukuoka') || fullAddr.includes('福岡')) prefecture = 'Fukuoka';
    else if (fullAddr.includes('Kyoto') || fullAddr.includes('京都')) prefecture = 'Kyoto';
    else if (fullAddr.includes('Hyogo') || fullAddr.includes('兵庫')) prefecture = 'Hyogo';
    else prefecture = 'Tokyo';
  }

  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  const formattedPrice = rawSchool.price !== undefined && rawSchool.price !== null
    ? (typeof rawSchool.price === 'number' ? `¥${rawSchool.price.toLocaleString('ja-JP')}` : String(rawSchool.price))
    : undefined;

  return {
    id: schoolId,
    name: s(rawSchool.name) || 'Avtomaktab',
    price: formattedPrice,
    prefecture,
    location: fullAddr,
    image: rawSchool.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
    lat: Number.isFinite(parsedLat) ? parsedLat : null,
    lng: Number.isFinite(parsedLng) ? parsedLng : null,
    courses: Array.isArray(rawSchool.courses) ? rawSchool.courses : [],
    licenses: Array.isArray(rawSchool.licenses) ? rawSchool.licenses : [],
    tags: Array.isArray(rawSchool.tags) ? rawSchool.tags : [],
    shoukaiAmount: s(rawSchool.shoukaiAmount),
    hasAccommodation: rawSchool.hasAccommodation !== undefined ? rawSchool.hasAccommodation : false,
    isActive: rawSchool.isActive !== false
  };
}
