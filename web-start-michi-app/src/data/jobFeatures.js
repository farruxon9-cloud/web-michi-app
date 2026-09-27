// ============================================================
// JOB FEATURES DATABASE — Townwork-style Filter Conditions (特徴・こだわり条件)
// Pure Single-Language attributes for 100% clean i18n rendering
// ============================================================

export const JOB_FEATURES = {
  // 1. Shartnoma turi (Employment Type)
  employment: {
    title: '雇用形態',
    titleUz: 'Ish Turi / Shartnoma',
    titleEn: 'Employment Type',
    icon: '📋',
    options: [
      { id: 'fulltime', name: '正社員', nameUz: 'Doimiy Xodim', nameEn: 'Full-Time' },
      { id: 'contract', name: '契約社員', nameUz: 'Shartnomali', nameEn: 'Contract' },
      { id: 'parttime', name: 'アルバイト・パート', nameUz: 'Part-time (Arubaito)', nameEn: 'Part-Time' },
      { id: 'outsourcing', name: '業務委託・一人親方', nameUz: 'Pudrat / Mustaqil Haydovchi (Gyoumu Itaku)', nameEn: 'Outsourcing / Freelance' },
      { id: 'dispatch', name: '派遣社員', nameUz: 'Dispetcherli Xodim', nameEn: 'Dispatch Staff' },
      { id: 'intern', name: 'インターン・研修生', nameUz: 'Stajiyor / Shogird', nameEn: 'Intern / Trainee' }
    ]
  },
  // 2. Ish muddati (Duration)
  duration: {
    title: '期間',
    titleUz: 'Ish Muddati',
    titleEn: 'Duration',
    icon: '📅',
    options: [
      { id: 'short_1w', name: '短期(1週間以内)', nameUz: 'Qisqa muddat (1 hafta)', nameEn: 'Short term (1 week)' },
      { id: 'short_1m', name: '短期(1ヶ月以内)', nameUz: 'Qisqa muddat (1 oy)', nameEn: 'Short term (1 month)' },
      { id: 'long', name: '長期', nameUz: 'Uzoq muddat (6 oy+)', nameEn: 'Long term (6+ months)' },
      { id: 'single_day', name: '単発・1日のみ', nameUz: 'Bir kunlik', nameEn: 'Single day' }
    ]
  },
  // 3. Maosh (Salary Thresholds)
  salary: {
    title: '給与',
    titleUz: 'Maosh Shartlari',
    titleEn: 'Salary Conditions',
    icon: '💰',
    options: [
      { id: 'hourly_1000', name: '時給1000円以上', nameUz: '¥1,000+/soat', nameEn: '¥1,000+/hr' },
      { id: 'hourly_1200', name: '時給1200円以上', nameUz: '¥1,200+/soat', nameEn: '¥1,200+/hr' },
      { id: 'hourly_1500', name: '時給1500円以上', nameUz: '¥1,500+/soat', nameEn: '¥1,500+/hr' },
      { id: 'daily_10000', name: '日給1万円以上', nameUz: '¥10,000+/kun', nameEn: '¥10,000+/day' },
      { id: 'monthly_200k', name: '月給20万円以上', nameUz: '¥200,000+/oy', nameEn: '¥200,000+/mo' },
      { id: 'monthly_250k', name: '月給25万円以上', nameUz: '¥250,000+/oy', nameEn: '¥250,000+/mo' },
      { id: 'monthly_350k', name: '月給35万円以上', nameUz: '¥350,000+/oy', nameEn: '¥350,000+/mo' }
    ]
  },
  // 4. Ish vaqti (Time Slots)
  timeSlot: {
    title: '時間帯',
    titleUz: 'Ish Vaqti Bandligi',
    titleEn: 'Time Slots',
    icon: '🕐',
    options: [
      { id: 'morning', name: '朝(6時〜9時)', nameUz: 'Erta tong (6:00-9:00)', nameEn: 'Morning (6:00-9:00)' },
      { id: 'daytime', name: '昼(9時〜18時)', nameUz: 'Kunduz (9:00-18:00)', nameEn: 'Daytime (9:00-18:00)' },
      { id: 'evening', name: '夕方(16時〜20時)', nameUz: 'Kechqurun (16:00-20:00)', nameEn: 'Evening (16:00-20:00)' },
      { id: 'night', name: '夜(20時〜24時)', nameUz: 'Kech (20:00-24:00)', nameEn: 'Night (20:00-24:00)' },
      { id: 'midnight', name: '深夜(0時〜6時)', nameUz: 'Tun (0:00-6:00)', nameEn: 'Midnight (0:00-6:00)' }
    ]
  },
  // 5. Maxsus xususiyatlar (Special Features)
  special: {
    title: '特徴',
    titleUz: 'Maxsus Sharoitlar',
    titleEn: 'Special Features',
    icon: '⭐',
    options: [
      { id: 'foreigner_welcome', name: '外国人歓迎', nameUz: 'Chet elliklar uchun ochiq', nameEn: 'Foreigners Welcome' },
      { id: 'no_experience', name: '未経験OK', nameUz: 'Tajribasiz ham mumkin', nameEn: 'No Experience OK' },
      { id: 'daily_pay', name: '日払い', nameUz: 'Kunlik to\'lov', nameEn: 'Daily Pay' },
      { id: 'weekly_pay', name: '週払い', nameUz: 'Haftalik to\'lov', nameEn: 'Weekly Pay' },
      { id: 'transport_paid', name: '交通費支給', nameUz: 'Yo\'l kira beriladi', nameEn: 'Transport Paid' },
      { id: 'dormitory', name: '寮・社宅あり', nameUz: 'Yotoqxona va Uy-joy bor', nameEn: 'Dormitory Available' },
      { id: 'insurance', name: '社会保険完備', nameUz: 'Sug\'urta to\'liq', nameEn: 'Full Insurance' },
      { id: 'promotion', name: '社員登用あり', nameUz: 'Doimiy xodimga o\'tish', nameEn: 'Career Promotion' },
      { id: 'tokutei_ginou', name: '特定技能', nameUz: 'Tokutei Ginou vizasi', nameEn: 'Specified Skilled Worker' },
      { id: 'visa_support', name: 'ビザサポート', nameUz: 'Viza yordami bor', nameEn: 'Visa Support' },
      { id: 'signon_bonus', name: '入社祝い金あり', nameUz: 'Ishga kirish puli bor (Sign-on Bonus)', nameEn: 'Sign-on Hiring Bonus' }
    ]
  },
  // 6. Smena va Ish Vaqti (Shift & Working Pattern)
  shift: {
    title: '勤務形態・シフト',
    titleUz: 'Smena va Ish Vaqti',
    titleEn: 'Shift & Working Pattern',
    icon: '⏰',
    options: [
      { id: 'shift_day', name: '日勤のみ', nameUz: 'Faqat kunduzgi smena', nameEn: 'Day Shift Only' },
      { id: 'shift_night', name: '夜勤・深夜あり', nameUz: 'Tungi smena bor', nameEn: 'Night Shift Included' },
      { id: 'shift_rotation', name: 'シフト制・交代制', nameUz: 'Smenali grafik', nameEn: 'Rotational Shift' }
    ]
  },
  // 7. Dam olish (Days Off & Leave)
  holiday: {
    title: '休日・休暇',
    titleUz: 'Dam Olish va Ta\'til',
    titleEn: 'Days Off & Leave',
    icon: '🗓️',
    options: [
      { id: 'off_2days_full', name: '完全週休2日制', nameUz: 'Haftada qat\'iy 2 kun dam', nameEn: 'Strict 2 Days Off/Week' },
      { id: 'off_paid', name: '有給休暇あり', nameUz: 'To\'lanadigan ta\'til bor', nameEn: 'Paid Leave Available' }
    ]
  },
  // 8. Yuk mashinasi jihozlari (Truck Equipment & Safety)
  truckEquip: {
    title: 'トラック設備・仕様',
    titleUz: 'Yuk Mashinasi Jihozlari',
    titleEn: 'Truck Equipment & Safety',
    icon: '🚚',
    options: [
      { id: 'truck_at', name: 'AT車限定・ATトラック', nameUz: 'Avtomat korobka', nameEn: 'Automatic Transmission' },
      { id: 'truck_etc_navi', name: 'カーナビ・ETC完備', nameUz: 'Navigatsiya va ETC bor', nameEn: 'GPS & ETC Toll Mounted' },
      { id: 'truck_camera', name: 'バックカメラ・ドラレコ', nameUz: 'Orqa kamera va Videoregistrator', nameEn: 'Rear Camera & Dashcam' },
      { id: 'truck_dedicated', name: '一人一本専用車', nameUz: 'Shaxsiy biriktirilgan mashina', nameEn: 'Dedicated Personal Truck' }
    ]
  },
  // 9. Yuk ortish usuli (Cargo Loading Method)
  loading: {
    title: '荷積み・荷降ろし方法',
    titleUz: 'Yuk Ortish Usuli',
    titleEn: 'Cargo Loading Method',
    icon: '📦',
    options: [
      { id: 'load_pallet', name: 'パレット積み主体', nameUz: 'Pallet bilan (qo\'l mehnatisiz)', nameEn: 'Pallet Loading Only' },
      { id: 'load_forklift', name: 'フォークリフト積み', nameUz: 'Forklift yordamida ortish', nameEn: 'Forklift Loading' },
      { id: 'load_hand', name: '手積み・手降ろしあり', nameUz: 'Qo\'lda ortish bor', nameEn: 'Hand Loading Included' }
    ]
  },
  // 10. Magistral yo'l haqi (Expressway Toll Usage)
  highway: {
    title: '高速道路利用',
    titleUz: 'Magistral Yo\'l Xarajatlari',
    titleEn: 'Expressway Toll Usage',
    icon: '🛣️',
    options: [
      { id: 'highway_ok', name: '高速道路全線利用OK', nameUz: 'Magistral yo\'l kompaniya hisobidan', nameEn: 'Highway Toll Paid' }
    ]
  }
};
