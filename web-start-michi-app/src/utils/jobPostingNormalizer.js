// ============================================================
// JOB POSTING NORMALIZER UTILITY FOR JAPAN RECRUITMENT SEARCH
// Ensures 100% filter compatibility for any employer job posting
// ============================================================

export function normalizeJobPosting(rawJob) {
  if (!rawJob) return null;

  // Extract prefecture, city, ward, and address parts
  const fullAddr = rawJob.fullAddress || rawJob.location || '';
  let prefecture = rawJob.prefecture || '';
  let city = rawJob.city || '';
  let ward = rawJob.ward || '';

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

  return {
    id: rawJob.id || Date.now(),
    company: rawJob.company || 'Kompaniya',
    title: rawJob.title || 'Ish o\'rni',
    salary: rawJob.salary || '¥250,000 / oyiga',
    type: rawJob.type || 'fulltime', // fulltime | parttime | contract | dispatch
    category: rawJob.category || 'delivery_driver',
    subcategory: rawJob.subcategory || 'delivery_local',
    payType: rawJob.payType || (rawJob.salary?.includes('soat') ? 'hourly' : 'monthly'),
    duration: rawJob.duration || 'long', // long | short_1m | short_1w | single_day
    startTime: rawJob.startTime || '8',
    transportPaid: rawJob.transportPaid !== undefined ? rawJob.transportPaid : true,
    noExperienceOk: rawJob.noExperienceOk !== undefined ? rawJob.noExperienceOk : true,
    shoukai: rawJob.shoukai || '¥30,000',
    shoukaiAmount: rawJob.shoukaiAmount || '¥30,000',
    image: rawJob.image || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800',
    verified: rawJob.verified !== undefined ? rawJob.verified : true,
    location: rawJob.location || fullAddr,
    prefecture,
    city,
    ward,
    lat: rawJob.lat || 35.6812,
    lng: rawJob.lng || 139.7671,
    fullAddress: fullAddr,
    nearestStation: rawJob.nearestStation || '東京駅 (Tokyo Station)',
    walkTime: rawJob.walkTime !== undefined ? Number(rawJob.walkTime) : 8,
    hours: rawJob.hours || '08:00 - 17:00',
    dayOff: rawJob.dayOff || 'shanba_yakshanba',
    bonus: rawJob.bonus || 'bonus_2',
    insurance: rawJob.insurance || 'insurance_full',
    foreigners: rawJob.foreigners || 'foreigners_visa',
    housing: rawJob.housing || 'housing_none',
    license: rawJob.license || 'lic_futsu',
    description: rawJob.description || '',
    logo: rawJob.logo || 'https://ui-avatars.com/api/?name=Company&background=0D8ABC&color=fff&size=100',
    phone: rawJob.phone || '',
    phoneMode: rawJob.phoneMode || 'public',
    isInternational: rawJob.isInternational !== undefined ? rawJob.isInternational : false,
    isActive: rawJob.isActive !== undefined ? rawJob.isActive : true
  };
}
