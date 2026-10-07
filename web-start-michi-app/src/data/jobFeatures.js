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
    titleRu: 'Тип занятости',
    titleZh: '雇佣形式',
    titleVi: 'Hình thức tuyển dụng',
    titleNe: 'रोजगारीको प्रकार',
    icon: '📋',
    options: [
      { id: 'fulltime', name: '正社員', nameUz: 'Doimiy Xodim', nameEn: 'Full-Time', nameRu: 'Штатный сотрудник', nameZh: '正式员工', nameVi: 'Nhân viên chính thức', nameNe: 'पूर्णकालीन कर्मचारी' },
      { id: 'contract', name: '契約社員', nameUz: 'Shartnomali', nameEn: 'Contract', nameRu: 'Контрактный сотрудник', nameZh: '合同工', nameVi: 'Nhân viên hợp đồng', nameNe: 'करार कर्मचारी' },
      { id: 'parttime', name: 'アルバイト・パート', nameUz: 'Part-time (Arubaito)', nameEn: 'Part-Time', nameRu: 'Подработка (арбайто)', nameZh: '兼职・小时工', nameVi: 'Làm thêm (Arubaito)', nameNe: 'पार्ट-टाइम (अरुबाइतो)' },
      { id: 'outsourcing', name: '業務委託・一人親方', nameUz: 'Pudrat / Mustaqil Haydovchi (Gyoumu Itaku)', nameEn: 'Outsourcing / Freelance', nameRu: 'Подряд / самозанятый водитель', nameZh: '业务委托・个体司机', nameVi: 'Nhận khoán / Tài xế tự do', nameNe: 'ठेक्का / स्वतन्त्र चालक' },
      { id: 'dispatch', name: '派遣社員', nameUz: 'Dispetcherli Xodim', nameEn: 'Dispatch Staff', nameRu: 'Сотрудник через агентство', nameZh: '派遣员工', nameVi: 'Nhân viên phái cử', nameNe: 'डिस्प्याच (एजेन्सी) कर्मचारी' },
      { id: 'intern', name: 'インターン・研修生', nameUz: 'Stajiyor / Shogird', nameEn: 'Intern / Trainee', nameRu: 'Стажёр / практикант', nameZh: '实习生・研修生', nameVi: 'Thực tập sinh', nameNe: 'इन्टर्न / प्रशिक्षार्थी' }
    ]
  },
  // 2. Ish muddati (Duration)
  duration: {
    title: '期間',
    titleUz: 'Ish Muddati',
    titleEn: 'Duration',
    titleRu: 'Срок работы',
    titleZh: '工作期限',
    titleVi: 'Thời hạn làm việc',
    titleNe: 'कामको अवधि',
    icon: '📅',
    options: [
      { id: 'short_1w', name: '短期(1週間以内)', nameUz: 'Qisqa muddat (1 hafta)', nameEn: 'Short term (1 week)', nameRu: 'Краткосрочно (до 1 недели)', nameZh: '短期（1周以内）', nameVi: 'Ngắn hạn (trong 1 tuần)', nameNe: 'छोटो अवधि (१ हप्ताभित्र)' },
      { id: 'short_1m', name: '短期(1ヶ月以内)', nameUz: 'Qisqa muddat (1 oy)', nameEn: 'Short term (1 month)', nameRu: 'Краткосрочно (до 1 месяца)', nameZh: '短期（1个月以内）', nameVi: 'Ngắn hạn (trong 1 tháng)', nameNe: 'छोटो अवधि (१ महिनाभित्र)' },
      { id: 'long', name: '長期', nameUz: 'Uzoq muddat (6 oy+)', nameEn: 'Long term (6+ months)', nameRu: 'Долгосрочно (6+ месяцев)', nameZh: '长期（6个月以上）', nameVi: 'Dài hạn (6 tháng trở lên)', nameNe: 'लामो अवधि (६+ महिना)' },
      { id: 'single_day', name: '単発・1日のみ', nameUz: 'Bir kunlik', nameEn: 'Single day', nameRu: 'Разовая работа (1 день)', nameZh: '单次・仅1天', nameVi: 'Làm 1 ngày', nameNe: 'एक दिनको काम' }
    ]
  },
  // 3. Maosh (Salary Thresholds)
  salary: {
    title: '給与',
    titleUz: 'Maosh Shartlari',
    titleEn: 'Salary Conditions',
    titleRu: 'Условия оплаты',
    titleZh: '薪资条件',
    titleVi: 'Điều kiện lương',
    titleNe: 'तलबका सर्तहरू',
    icon: '💰',
    options: [
      { id: 'hourly_1000', name: '時給1000円以上', nameUz: '¥1,000+/soat', nameEn: '¥1,000+/hr', nameRu: '¥1,000+/час', nameZh: '时薪¥1,000以上', nameVi: '¥1,000+/giờ', nameNe: '¥1,000+/घण्टा' },
      { id: 'hourly_1200', name: '時給1200円以上', nameUz: '¥1,200+/soat', nameEn: '¥1,200+/hr', nameRu: '¥1,200+/час', nameZh: '时薪¥1,200以上', nameVi: '¥1,200+/giờ', nameNe: '¥1,200+/घण्टा' },
      { id: 'hourly_1500', name: '時給1500円以上', nameUz: '¥1,500+/soat', nameEn: '¥1,500+/hr', nameRu: '¥1,500+/час', nameZh: '时薪¥1,500以上', nameVi: '¥1,500+/giờ', nameNe: '¥1,500+/घण्टा' },
      { id: 'daily_10000', name: '日給1万円以上', nameUz: '¥10,000+/kun', nameEn: '¥10,000+/day', nameRu: '¥10,000+/день', nameZh: '日薪¥10,000以上', nameVi: '¥10,000+/ngày', nameNe: '¥10,000+/दिन' },
      { id: 'monthly_200k', name: '月給20万円以上', nameUz: '¥200,000+/oy', nameEn: '¥200,000+/mo', nameRu: '¥200,000+/мес', nameZh: '月薪¥200,000以上', nameVi: '¥200,000+/tháng', nameNe: '¥200,000+/महिना' },
      { id: 'monthly_250k', name: '月給25万円以上', nameUz: '¥250,000+/oy', nameEn: '¥250,000+/mo', nameRu: '¥250,000+/мес', nameZh: '月薪¥250,000以上', nameVi: '¥250,000+/tháng', nameNe: '¥250,000+/महिना' },
      { id: 'monthly_350k', name: '月給35万円以上', nameUz: '¥350,000+/oy', nameEn: '¥350,000+/mo', nameRu: '¥350,000+/мес', nameZh: '月薪¥350,000以上', nameVi: '¥350,000+/tháng', nameNe: '¥350,000+/महिना' }
    ]
  },
  // 4. Ish vaqti (Time Slots)
  timeSlot: {
    title: '時間帯',
    titleUz: 'Ish Vaqti Bandligi',
    titleEn: 'Time Slots',
    titleRu: 'Время работы',
    titleZh: '工作时段',
    titleVi: 'Khung giờ làm việc',
    titleNe: 'कामको समय',
    icon: '🕐',
    options: [
      { id: 'morning', name: '朝(6時〜9時)', nameUz: 'Erta tong (6:00-9:00)', nameEn: 'Morning (6:00-9:00)', nameRu: 'Утро (6:00-9:00)', nameZh: '早晨（6:00-9:00）', nameVi: 'Sáng sớm (6:00-9:00)', nameNe: 'बिहान (६:००-९:००)' },
      { id: 'daytime', name: '昼(9時〜18時)', nameUz: 'Kunduz (9:00-18:00)', nameEn: 'Daytime (9:00-18:00)', nameRu: 'День (9:00-18:00)', nameZh: '白天（9:00-18:00）', nameVi: 'Ban ngày (9:00-18:00)', nameNe: 'दिउँसो (९:००-१८:००)' },
      { id: 'evening', name: '夕方(16時〜20時)', nameUz: 'Kechqurun (16:00-20:00)', nameEn: 'Evening (16:00-20:00)', nameRu: 'Вечер (16:00-20:00)', nameZh: '傍晚（16:00-20:00）', nameVi: 'Chiều tối (16:00-20:00)', nameNe: 'साँझ (१६:००-२०:००)' },
      { id: 'night', name: '夜(20時〜24時)', nameUz: 'Kech (20:00-24:00)', nameEn: 'Night (20:00-24:00)', nameRu: 'Ночь (20:00-24:00)', nameZh: '夜间（20:00-24:00）', nameVi: 'Buổi tối (20:00-24:00)', nameNe: 'राति (२०:००-२४:००)' },
      { id: 'midnight', name: '深夜(0時〜6時)', nameUz: 'Tun (0:00-6:00)', nameEn: 'Midnight (0:00-6:00)', nameRu: 'Глубокая ночь (0:00-6:00)', nameZh: '深夜（0:00-6:00）', nameVi: 'Đêm khuya (0:00-6:00)', nameNe: 'मध्यरात (०:००-६:००)' }
    ]
  },
  // 5. Maxsus xususiyatlar (Special Features)
  special: {
    title: '特徴',
    titleUz: 'Maxsus Sharoitlar',
    titleEn: 'Special Features',
    titleRu: 'Особенности',
    titleZh: '特色条件',
    titleVi: 'Đặc điểm nổi bật',
    titleNe: 'विशेष सुविधाहरू',
    icon: '⭐',
    options: [
      { id: 'foreigner_welcome', name: '外国人歓迎', nameUz: 'Chet elliklar uchun ochiq', nameEn: 'Foreigners Welcome', nameRu: 'Иностранцы приветствуются', nameZh: '欢迎外国人', nameVi: 'Chào đón người nước ngoài', nameNe: 'विदेशीलाई स्वागत छ' },
      { id: 'no_experience', name: '未経験OK', nameUz: 'Tajribasiz ham mumkin', nameEn: 'No Experience OK', nameRu: 'Без опыта', nameZh: '无经验可', nameVi: 'Không cần kinh nghiệm', nameNe: 'अनुभव नभए पनि हुन्छ' },
      { id: 'daily_pay', name: '日払い', nameUz: 'Kunlik to\'lov', nameEn: 'Daily Pay', nameRu: 'Ежедневная оплата', nameZh: '日结', nameVi: 'Trả lương theo ngày', nameNe: 'दैनिक भुक्तानी' },
      { id: 'weekly_pay', name: '週払い', nameUz: 'Haftalik to\'lov', nameEn: 'Weekly Pay', nameRu: 'Еженедельная оплата', nameZh: '周结', nameVi: 'Trả lương theo tuần', nameNe: 'साप्ताहिक भुक्तानी' },
      { id: 'transport_paid', name: '交通費支給', nameUz: 'Yo\'l kira beriladi', nameEn: 'Transport Paid', nameRu: 'Оплата проезда', nameZh: '提供交通费', nameVi: 'Hỗ trợ phí đi lại', nameNe: 'यातायात खर्च दिइन्छ' },
      { id: 'dormitory', name: '寮・社宅あり', nameUz: 'Yotoqxona va Uy-joy bor', nameEn: 'Dormitory Available', nameRu: 'Есть общежитие / жильё', nameZh: '提供宿舍・员工住房', nameVi: 'Có ký túc xá / nhà ở', nameNe: 'छात्रावास / आवास उपलब्ध' },
      { id: 'insurance', name: '社会保険完備', nameUz: 'Sug\'urta to\'liq', nameEn: 'Full Insurance', nameRu: 'Полное соцстрахование', nameZh: '社会保险齐全', nameVi: 'Bảo hiểm xã hội đầy đủ', nameNe: 'पूर्ण सामाजिक बीमा' },
      { id: 'promotion', name: '社員登用あり', nameUz: 'Doimiy xodimga o\'tish', nameEn: 'Career Promotion', nameRu: 'Перевод в штат', nameZh: '可转正式员工', nameVi: 'Có cơ hội lên nhân viên chính thức', nameNe: 'स्थायी कर्मचारी बन्ने अवसर' },
      { id: 'tokutei_ginou', name: '特定技能', nameUz: 'Tokutei Ginou vizasi', nameEn: 'Specified Skilled Worker', nameRu: 'Виза «Токутэй гино»', nameZh: '特定技能', nameVi: 'Kỹ năng đặc định (Tokutei Ginou)', nameNe: 'विशिष्ट सीप (तोकुतेई गिनो)' },
      { id: 'visa_support', name: 'ビザサポート', nameUz: 'Viza yordami bor', nameEn: 'Visa Support', nameRu: 'Визовая поддержка', nameZh: '签证支持', nameVi: 'Hỗ trợ visa', nameNe: 'भिसा सहयोग' },
      { id: 'signon_bonus', name: '入社祝い金あり', nameUz: 'Ishga kirish puli bor (Sign-on Bonus)', nameEn: 'Sign-on Hiring Bonus', nameRu: 'Бонус при трудоустройстве', nameZh: '入职奖金', nameVi: 'Có thưởng khi vào công ty', nameNe: 'जागिर सुरु गर्दा बोनस' }
    ]
  },
  // 6. Smena va Ish Vaqti (Shift & Working Pattern)
  shift: {
    title: '勤務形態・シフト',
    titleUz: 'Smena va Ish Vaqti',
    titleEn: 'Shift & Working Pattern',
    titleRu: 'Смены и график',
    titleZh: '工作形态・排班',
    titleVi: 'Ca làm và hình thức làm việc',
    titleNe: 'सिफ्ट र कार्य तालिका',
    icon: '⏰',
    options: [
      { id: 'shift_day', name: '日勤のみ', nameUz: 'Faqat kunduzgi smena', nameEn: 'Day Shift Only', nameRu: 'Только дневная смена', nameZh: '仅白班', nameVi: 'Chỉ ca ngày', nameNe: 'दिउँसोको सिफ्ट मात्र' },
      { id: 'shift_night', name: '夜勤・深夜あり', nameUz: 'Tungi smena bor', nameEn: 'Night Shift Included', nameRu: 'Есть ночные смены', nameZh: '含夜班・深夜班', nameVi: 'Có ca đêm', nameNe: 'रातको सिफ्ट समेत' },
      { id: 'shift_rotation', name: 'シフト制・交代制', nameUz: 'Smenali grafik', nameEn: 'Rotational Shift', nameRu: 'Сменный график', nameZh: '轮班制', nameVi: 'Làm theo ca luân phiên', nameNe: 'पालो-पालो सिफ्ट' }
    ]
  },
  // 7. Dam olish (Days Off & Leave)
  holiday: {
    title: '休日・休暇',
    titleUz: 'Dam Olish va Ta\'til',
    titleEn: 'Days Off & Leave',
    titleRu: 'Выходные и отпуск',
    titleZh: '休息日・休假',
    titleVi: 'Ngày nghỉ & phép',
    titleNe: 'बिदा र छुट्टी',
    icon: '🗓️',
    options: [
      { id: 'off_2days_full', name: '完全週休2日制', nameUz: 'Haftada qat\'iy 2 kun dam', nameEn: 'Strict 2 Days Off/Week', nameRu: 'Строго 2 выходных в неделю', nameZh: '完全双休', nameVi: 'Nghỉ đủ 2 ngày/tuần', nameNe: 'हप्तामा निश्चित २ दिन बिदा' },
      { id: 'off_paid', name: '有給休暇あり', nameUz: 'To\'lanadigan ta\'til bor', nameEn: 'Paid Leave Available', nameRu: 'Оплачиваемый отпуск', nameZh: '有带薪休假', nameVi: 'Có nghỉ phép hưởng lương', nameNe: 'सशुल्क बिदा उपलब्ध' }
    ]
  },
  // 8. Yuk mashinasi jihozlari (Truck Equipment & Safety)
  truckEquip: {
    title: 'トラック設備・仕様',
    titleUz: 'Yuk Mashinasi Jihozlari',
    titleEn: 'Truck Equipment & Safety',
    titleRu: 'Оснащение грузовика',
    titleZh: '卡车设备・规格',
    titleVi: 'Trang bị xe tải',
    titleNe: 'ट्रकका उपकरण र सुरक्षा',
    icon: '🚚',
    options: [
      { id: 'truck_at', name: 'AT車限定・ATトラック', nameUz: 'Avtomat korobka', nameEn: 'Automatic Transmission', nameRu: 'Автоматическая КПП', nameZh: '自动挡卡车', nameVi: 'Xe số tự động', nameNe: 'अटोमेटिक गियर' },
      { id: 'truck_etc_navi', name: 'カーナビ・ETC完備', nameUz: 'Navigatsiya va ETC bor', nameEn: 'GPS & ETC Toll Mounted', nameRu: 'Навигатор и ETC', nameZh: '配备导航・ETC', nameVi: 'Có định vị & ETC', nameNe: 'नेभिगेसन र ETC जडित' },
      { id: 'truck_camera', name: 'バックカメラ・ドラレコ', nameUz: 'Orqa kamera va Videoregistrator', nameEn: 'Rear Camera & Dashcam', nameRu: 'Камера заднего вида и видеорегистратор', nameZh: '倒车影像・行车记录仪', nameVi: 'Camera lùi & camera hành trình', nameNe: 'पछाडिको क्यामेरा र ड्यासक्याम' },
      { id: 'truck_dedicated', name: '一人一本専用車', nameUz: 'Shaxsiy biriktirilgan mashina', nameEn: 'Dedicated Personal Truck', nameRu: 'Закреплённый личный грузовик', nameZh: '专人专车', nameVi: 'Xe riêng cho mỗi người', nameNe: 'व्यक्तिगत रूपमा तोकिएको ट्रक' }
    ]
  },
  // 9. Yuk ortish usuli (Cargo Loading Method)
  loading: {
    title: '荷積み・荷降ろし方法',
    titleUz: 'Yuk Ortish Usuli',
    titleEn: 'Cargo Loading Method',
    titleRu: 'Способ погрузки',
    titleZh: '装卸货方式',
    titleVi: 'Phương thức bốc dỡ hàng',
    titleNe: 'माल लोड गर्ने तरिका',
    icon: '📦',
    options: [
      { id: 'load_pallet', name: 'パレット積み主体', nameUz: 'Pallet bilan (qo\'l mehnatisiz)', nameEn: 'Pallet Loading Only', nameRu: 'Погрузка на паллетах', nameZh: '以托盘装载为主', nameVi: 'Chủ yếu xếp pallet', nameNe: 'प्यालेटमा लोड (मुख्य रूपमा)' },
      { id: 'load_forklift', name: 'フォークリフト積み', nameUz: 'Forklift yordamida ortish', nameEn: 'Forklift Loading', nameRu: 'Погрузка погрузчиком', nameZh: '叉车装载', nameVi: 'Bốc hàng bằng xe nâng', nameNe: 'फोर्कलिफ्टबाट लोड' },
      { id: 'load_hand', name: '手積み・手降ろしあり', nameUz: 'Qo\'lda ortish bor', nameEn: 'Hand Loading Included', nameRu: 'Есть ручная погрузка', nameZh: '含人工装卸', nameVi: 'Có bốc dỡ bằng tay', nameNe: 'हातले लोड/अनलोड समेत' }
    ]
  },
  // 10. Magistral yo'l haqi (Expressway Toll Usage)
  highway: {
    title: '高速道路利用',
    titleUz: 'Magistral Yo\'l Xarajatlari',
    titleEn: 'Expressway Toll Usage',
    titleRu: 'Платные автомагистрали',
    titleZh: '高速公路使用',
    titleVi: 'Sử dụng đường cao tốc',
    titleNe: 'एक्सप्रेसवे प्रयोग',
    icon: '🛣️',
    options: [
      { id: 'highway_ok', name: '高速道路全線利用OK', nameUz: 'Magistral yo\'l kompaniya hisobidan', nameEn: 'Highway Toll Paid', nameRu: 'Платные дороги за счёт компании', nameZh: '高速费公司承担', nameVi: 'Công ty trả phí cao tốc', nameNe: 'एक्सप्रेसवे शुल्क कम्पनीले तिर्छ' }
    ]
  }
};
