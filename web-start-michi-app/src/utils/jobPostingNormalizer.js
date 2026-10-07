// ============================================================
// JOB & SCHOOL POSTING NORMALIZER UTILITY FOR MICHI SERVER
// Ensures 100% UI and filter compatibility for Jobs and Schools
// ============================================================

const s = (v) => (typeof v === 'string' ? v.trim() : '');

export function formatSalaryJPY(val) {
  if (!val) return ''; // never invent a salary — the UI shows 未入力
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

// Backend employmentType may be a key ('fulltime') or legacy Japanese text ('正社員').
const EMPLOYMENT_TYPE_ALIASES = {
  '正社員': 'fulltime', '契約社員': 'contract', 'アルバイト': 'parttime', 'パート': 'parttime',
  'アルバイト・パート': 'parttime', '業務委託': 'outsourcing', '派遣': 'dispatch', '派遣社員': 'dispatch', 'インターン': 'intern',
};
const PHONE_MODE_ALIASES = { '一般公開': 'public' };

/**
 * Stored form values whose translation key differs from the value itself
 * (e.g. the insurance chip stores 'insurance_employment' but the label key is 'ins_koyo').
 */
const VALUE_LABEL_KEYS = {
  insurance_employment: 'ins_koyo',
  insurance_none: 'ins_none',
  housing_rent: 'hou_rent',
  housing_move: 'hou_move',
  lic_none: 'lic_none_opt',
};

/**
 * Display label for a stored job condition value. Empty → 未入力 (`notProvided`).
 * Unknown free text (custom bonus etc.) is shown as typed.
 */
export function jobValueLabel(t, value) {
  if (value === null || value === undefined || value === '') return t('notProvided', '未入力');
  const v = String(value);
  if (v === 'shift') return t('shiftWork', 'シフト制');
  const key = VALUE_LABEL_KEYS[v] || v;
  return t(key, v);
}

/**
 * True when the job belongs to the signed-in company. Uses the server account id
 * (jobs.authorId); exact company-name match only for legacy records without an author.
 */
export function isOwnJob(job, profile) {
  if (!job || !profile) return false;
  if (job.isMine) return true;
  const myId = profile.accountId;
  if (myId && job.companyId) return String(job.companyId) === String(myId);
  const myName = (profile.fullName || '').trim();
  if (!myName || myName === 'Mehmon') return false;
  return !job.companyId && job.company === myName;
}

const firstStr = (...vals) => {
  for (const v of vals) {
    const out = s(v);
    if (out) return out;
  }
  return '';
};

const yenLabel = (n) => (Number(n) > 0 ? `¥${Number(n).toLocaleString('ja-JP')}` : '');

export function normalizeJobPosting(rawJob) {
  if (!rawJob || !rawJob.id) return null;
  const jobId = String(rawJob.id);
  const loc = typeof rawJob.location === 'object' && rawJob.location !== null ? rawJob.location : null;
  const cond = rawJob.conditions && typeof rawJob.conditions === 'object' ? rawJob.conditions : {};
  const contact = rawJob.contact && typeof rawJob.contact === 'object' ? rawJob.contact : {};
  const shoukaiObj = rawJob.shoukai && typeof rawJob.shoukai === 'object' ? rawJob.shoukai : null;

  // Extract prefecture, city, ward, and address parts
  let fullAddr = '';
  let prefecture = rawJob.prefecture || '';
  let city = rawJob.city || '';
  let ward = rawJob.ward || '';
  let lat = rawJob.lat;
  let lng = rawJob.lng;

  if (loc) {
    prefecture = prefecture || loc.prefecture || '';
    city = city || loc.city || '';
    lat = lat !== undefined ? lat : loc.lat;
    lng = lng !== undefined ? lng : loc.lng;
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
  let licenses = Array.isArray(rawJob.licenses) ? rawJob.licenses.filter(Boolean) : [];
  if (licenses.length === 0 && rawJob.license) {
    licenses = Array.isArray(rawJob.license) ? rawJob.license.filter(Boolean) : [rawJob.license];
  }

  // Salary: only what the company entered — never a made-up range.
  const salaryObj = typeof rawJob.salary === 'object' && rawJob.salary !== null ? rawJob.salary : null;
  const salaryMin = numOrNull(salaryObj ? salaryObj.min : (rawJob.minSalary ?? rawJob.salaryMin)) || null;
  const salaryMax = numOrNull(salaryObj ? salaryObj.max : (rawJob.maxSalary ?? rawJob.salaryMax)) || null;
  const salaryText = salaryObj ? '' : s(typeof rawJob.salary === 'number' ? String(rawJob.salary) : rawJob.salary);
  let salaryDisplay = salaryText ? formatSalaryJPY(salaryText) : '';
  if (!salaryDisplay && salaryMin) {
    salaryDisplay = `${yenLabel(salaryMin)}${salaryMax && salaryMax !== salaryMin ? `〜${yenLabel(salaryMax)}` : ''}`;
  }

  // 紹介 (referral bonus): flat legacy fields or backend `shoukai{enabled,amount}`
  const shoukaiFee = Number(rawJob.shoukaiFee) > 0 ? Number(rawJob.shoukaiFee) : (shoukaiObj && Number(shoukaiObj.amount) > 0 ? Number(shoukaiObj.amount) : 0);
  const hasShoukai = rawJob.hasShoukai === true || rawJob.has_shoukai === true || Boolean(shoukaiObj && shoukaiObj.enabled) || shoukaiFee > 0;
  const shoukaiLabel = shoukaiFee > 0 ? yenLabel(shoukaiFee) : '';
  const legacyShoukai = typeof rawJob.shoukai === 'string' ? s(rawJob.shoukai) : '';

  const employmentRaw = firstStr(rawJob.type, rawJob.employmentType);
  const walkRaw = numOrNull(rawJob.walkTime ?? rawJob.walkMinutes ?? (loc ? loc.walkMinutes : null));
  const foreignerList = Array.isArray(rawJob.foreignerSupport) ? rawJob.foreignerSupport.filter(Boolean) : [];
  const phoneModeRaw = firstStr(rawJob.phoneMode, rawJob.callReceptionStyle, contact.callReceptionStyle);
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);

  return {
    id: jobId,
    publishedAt: rawJob.publishedAt || rawJob.published_at || rawJob.createdAt || rawJob.created_at || null,
    updatedAt: rawJob.updatedAt || null,
    companyId: rawJob.companyId ? String(rawJob.companyId) : (rawJob.company_id ? String(rawJob.company_id) : (rawJob.authorId ? String(rawJob.authorId) : null)),
    authorId: rawJob.authorId ? String(rawJob.authorId) : null,
    // Moderation (owner view via ?mine=1): 'active' | 'hidden' | 'rejected' | 'pending' + moderator reason
    status: s(rawJob.status) || 'active',
    moderation: rawJob.moderation && typeof rawJob.moderation === 'object' ? rawJob.moderation : null,
    company: s(rawJob.company) || 'Kompaniya',
    title: s(rawJob.title) || 'Ish o\'rni',
    salary: salaryDisplay,
    salaryMin,
    salaryMax,
    type: EMPLOYMENT_TYPE_ALIASES[employmentRaw] || employmentRaw || 'fulltime', // fulltime | parttime | contract | dispatch
    category: rawJob.category || 'delivery_driver',
    subcategory: rawJob.subcategory || 'delivery_local',
    payType: rawJob.payType || (/soat|時給/.test(salaryDisplay) ? 'hourly' : /日給/.test(salaryDisplay) ? 'daily' : 'monthly'),
    duration: rawJob.duration || 'long', // long | short_1m | short_1w | single_day
    startTime: rawJob.startTime || null,
    transportPaid: rawJob.transportPaid === true,
    noExperienceOk: rawJob.noExperienceOk === true,
    shoukai: shoukaiLabel || legacyShoukai || (hasShoukai ? '' : '0'),
    shoukaiAmount: shoukaiLabel || s(rawJob.shoukaiAmount),
    shoukaiFee,
    hasShoukai,
    shoukaiConditions: s(rawJob.shoukaiConditions || rawJob.shoukai_conditions),
    image: rawJob.image || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
    // ⭐ only for companies verified by an admin (set by the server, never by the posting company)
    verified: rawJob.authorVerified === true,
    verifiedAt: rawJob.authorVerified === true ? (rawJob.authorVerifiedAt || null) : null,
    // Listing expiry (server: createdAt + LISTING_TTL_DAYS); owner view gets status 'expired' when passed
    expiresAt: rawJob.expiresAt || null,
    location: typeof rawJob.location === 'string' ? rawJob.location : fullAddr,
    prefecture,
    city,
    ward,
    // Structured address parts (used by the company edit form)
    postalCode: firstStr(rawJob.postalCode, loc && loc.postalCode),
    detailAddress: firstStr(rawJob.detailAddress, city),
    townAddress: firstStr(rawJob.townAddress, rawJob.addressLine, loc && loc.addressLine),
    buildingAddress: firstStr(rawJob.buildingAddress, rawJob.building, loc && loc.building),
    trainLine: s(rawJob.trainLine),
    lat: Number.isFinite(parsedLat) ? parsedLat : null,
    lng: Number.isFinite(parsedLng) ? parsedLng : null,
    fullAddress: fullAddr,
    nearestStation: firstStr(rawJob.nearestStation, rawJob.nearest_station, loc && loc.nearestStation),
    walkTime: walkRaw && walkRaw > 0 ? walkRaw : null,
    // Conditions: '' when the company left them empty (UI shows 未入力)
    hours: firstStr(rawJob.hours, rawJob.workShift, cond.workShift, rawJob.workHours, cond.workHours),
    dayOff: firstStr(rawJob.dayOff, rawJob.holidayType, cond.holidayType),
    bonus: firstStr(rawJob.bonus, rawJob.bonusPrivilege),
    insurance: firstStr(rawJob.insurance, rawJob.socialInsurance, cond.socialInsurance),
    foreigners: firstStr(typeof rawJob.foreigners === 'string' ? rawJob.foreigners : '', foreignerList[0]),
    foreignerSupport: foreignerList,
    housing: firstStr(rawJob.housing, rawJob.dormitorySupport, cond.dormitorySupport),
    license: (typeof rawJob.license === 'string' && rawJob.license) || licenses[0] || '',
    licenses,
    tags: Array.isArray(rawJob.tags) ? rawJob.tags : [],
    description: s(rawJob.description),
    logo: rawJob.logo || 'https://ui-avatars.com/api/?name=Company&background=0D8ABC&color=fff&size=100',
    phone: firstStr(rawJob.phone, contact.phone),
    email: firstStr(rawJob.email, contact.email),
    phoneMode: PHONE_MODE_ALIASES[phoneModeRaw] || phoneModeRaw || 'public',
    isInternational: rawJob.isInternational === true,
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
  const locObj = typeof rawSchool.location === 'object' && rawSchool.location !== null ? rawSchool.location : {};
  const city = s(rawSchool.city || locObj.city || rawSchool.detailAddress);

  if (typeof rawSchool.location === 'object' && rawSchool.location !== null) {
    prefecture = prefecture || rawSchool.location.prefecture || '';
    lat = lat !== undefined ? lat : rawSchool.location.lat;
    lng = lng !== undefined ? lng : rawSchool.location.lng;
    fullAddr = [prefecture, city].filter(Boolean).join(', ');
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

  const shoukaiObj = rawSchool.shoukai && typeof rawSchool.shoukai === 'object' ? rawSchool.shoukai : null;
  const shoukaiFee = shoukaiObj
    ? (shoukaiObj.enabled ? Number(shoukaiObj.amount) || 0 : 0)
    : Number(rawSchool.shoukaiFee ?? rawSchool.shoukaiAmount) || 0;
  const authorId = rawSchool.authorId != null ? String(rawSchool.authorId) : (rawSchool.companyId != null ? String(rawSchool.companyId) : '');
  const postalCode = s(rawSchool.postalCode || locObj.postalCode);
  const townAddress = s(rawSchool.addressLine || rawSchool.townAddress);
  const buildingAddress = s(rawSchool.building || rawSchool.buildingAddress);
  const fullAddress = typeof rawSchool.fullAddress === 'string' && rawSchool.fullAddress
    ? rawSchool.fullAddress
    : [postalCode ? `〒${postalCode}` : '', `${prefecture}${city}${townAddress}`, buildingAddress].filter(Boolean).join(' ');

  return {
    id: schoolId,
    name: s(rawSchool.name) || 'Avtomaktab',
    price: formattedPrice,
    prefecture,
    city,
    location: fullAddr,
    fullAddress,
    postalCode,
    detailAddress: city,
    townAddress,
    buildingAddress,
    image: rawSchool.image || 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
    logo: s(rawSchool.logo),
    lat: Number.isFinite(parsedLat) ? parsedLat : null,
    lng: Number.isFinite(parsedLng) ? parsedLng : null,
    courses: Array.isArray(rawSchool.courses) ? rawSchool.courses : [],
    licenses: Array.isArray(rawSchool.licenses) ? rawSchool.licenses : [],
    tags: Array.isArray(rawSchool.tags) ? rawSchool.tags : [],
    langs: Array.isArray(rawSchool.languages) ? rawSchool.languages : (Array.isArray(rawSchool.langs) ? rawSchool.langs : []),
    description: s(rawSchool.description),
    type: s(rawSchool.type),
    discount: s(rawSchool.discount),
    phone: s(rawSchool.phone),
    email: s(rawSchool.email),
    shoukaiFee,
    shoukai: shoukaiFee > 0 ? `¥${shoukaiFee.toLocaleString('ja-JP')}` : '0',
    shoukaiConditions: s(rawSchool.shoukaiConditions),
    shoukaiAmount: s(rawSchool.shoukaiAmount) || (shoukaiFee > 0 ? String(shoukaiFee) : ''),
    authorId,
    companyId: authorId,
    // ⭐ only for companies verified by an admin (set by the server, never by the posting company)
    verified: rawSchool.authorVerified === true,
    verifiedAt: rawSchool.authorVerified === true ? (rawSchool.authorVerifiedAt || null) : null,
    expiresAt: rawSchool.expiresAt || null,
    status: s(rawSchool.status) || 'active',
    moderation: rawSchool.moderation && typeof rawSchool.moderation === 'object' ? rawSchool.moderation : null,
    hasAccommodation: rawSchool.hasAccommodation !== undefined ? rawSchool.hasAccommodation : false,
    isActive: rawSchool.isActive !== false,
    ...(rawSchool.isMine ? { isMine: true } : {})
  };
}
