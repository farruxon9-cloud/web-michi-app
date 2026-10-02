// ============================================================
// JOB & SCHOOL POSTING NORMALIZER UTILITY FOR MICHI SERVER
// Ensures 100% UI and filter compatibility for Jobs and Schools
// ============================================================

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

export function normalizeJobPosting(rawJob) {
  if (!rawJob) return null;

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

  // Normalize salary (handling object { min: 420000, max: 550000 } or numeric or string)
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

  return {
    id: rawJob.id || Date.now(),
    company: rawJob.company || 'Kompaniya',
    title: rawJob.title || 'Ish o\'rni',
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
    shoukai: rawJob.shoukai || '¥30,000',
    shoukaiAmount: rawJob.shoukaiAmount || '¥30,000',
    image: rawJob.image || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
    verified: rawJob.verified !== undefined ? rawJob.verified : true,
    location: typeof rawJob.location === 'string' ? rawJob.location : fullAddr,
    prefecture,
    city,
    ward,
    lat: lat ? parseFloat(lat) : 35.6812,
    lng: lng ? parseFloat(lng) : 139.7671,
    fullAddress: fullAddr,
    nearestStation: rawJob.nearestStation || '東京駅 (Tokyo Station)',
    walkTime: rawJob.walkTime !== undefined ? Number(rawJob.walkTime) : 8,
    hours: rawJob.hours || '08:00 - 17:00',
    dayOff: rawJob.dayOff || 'shanba_yakshanba',
    bonus: rawJob.bonus || 'bonus_2',
    insurance: rawJob.insurance || 'insurance_full',
    foreigners: rawJob.foreigners || 'foreigners_visa',
    housing: rawJob.housing || 'housing_none',
    license: rawJob.license || (licenses[0] || 'lic_futsu'),
    licenses,
    tags: Array.isArray(rawJob.tags) ? rawJob.tags : [],
    description: rawJob.description || '',
    logo: rawJob.logo || 'https://ui-avatars.com/api/?name=Company&background=0D8ABC&color=fff&size=100',
    phone: rawJob.phone || '',
    phoneMode: rawJob.phoneMode || 'public',
    isInternational: rawJob.isInternational !== undefined ? rawJob.isInternational : false,
    isActive: rawJob.isActive !== undefined ? rawJob.isActive : true
  };
}

export function normalizeSchoolPosting(rawSchool) {
  if (!rawSchool) return null;

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
    else if (fullAddr.includes('Osaka') || fullAddr.includes('大阪')) prefecture = 'Osaka';
    else if (fullAddr.includes('Saitama') || fullAddr.includes('埼玉')) prefecture = 'Saitama';
    else if (fullAddr.includes('Kanagawa') || fullAddr.includes('神奈川')) prefecture = 'Kanagawa';
    else if (fullAddr.includes('Aichi') || fullAddr.includes('愛知')) prefecture = 'Aichi';
    else prefecture = 'Tokyo';
  }

  let licenses = Array.isArray(rawSchool.licenses) ? rawSchool.licenses : [];
  if (licenses.length === 0 && Array.isArray(rawSchool.courses)) {
    licenses = rawSchool.courses.map(c => typeof c === 'object' ? c.license : c).filter(Boolean);
  }
  if (licenses.length === 0 && rawSchool.license) {
    licenses = [rawSchool.license];
  }

  let rawPrice = rawSchool.price || rawSchool.fee;
  if (!rawPrice && Array.isArray(rawSchool.courses) && rawSchool.courses[0]) {
    rawPrice = rawSchool.courses[0].price;
  }
  rawPrice = rawPrice || 300000;

  const priceDisplay = typeof rawPrice === 'number' 
    ? `¥${rawPrice.toLocaleString('ja-JP')}` 
    : String(rawPrice);

  return {
    id: rawSchool.id || Date.now(),
    name: rawSchool.name || rawSchool.schoolName || 'Avtomaktab',
    title: rawSchool.title || rawSchool.name || 'Avtomaktab ta\'lim kursi',
    price: priceDisplay,
    priceNum: typeof rawPrice === 'number' ? rawPrice : 300000,
    duration: rawSchool.duration || '14 kun (Gasshuku)',
    prefecture,
    location: typeof rawSchool.location === 'string' ? rawSchool.location : (fullAddr || 'Tokyo, Japan'),
    lat: lat ? parseFloat(lat) : 35.6812,
    lng: lng ? parseFloat(lng) : 139.7671,
    licenses,
    hasAccommodation: rawSchool.hasAccommodation !== undefined ? Boolean(rawSchool.hasAccommodation) : true,
    hasEnglishSupport: rawSchool.hasEnglishSupport !== undefined ? Boolean(rawSchool.hasEnglishSupport) : true,
    hasUzbekSupport: rawSchool.hasUzbekSupport !== undefined ? Boolean(rawSchool.hasUzbekSupport) : false,
    rating: rawSchool.rating ? Number(rawSchool.rating) : 4.8,
    reviewsCount: rawSchool.reviewsCount ? Number(rawSchool.reviewsCount) : 42,
    image: rawSchool.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
    phone: rawSchool.phone || '+81-3-1234-5678',
    features: Array.isArray(rawSchool.features) ? rawSchool.features : ['Yotoqxona mavjud', 'Oson imtihon'],
    description: rawSchool.description || ''
  };
}


