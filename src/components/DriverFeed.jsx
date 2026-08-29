import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Share2, Clock, Banknote, Shield, Home, Globe, Award, Briefcase, Car, Phone, Edit3, CheckCircle2, SlidersHorizontal, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import VerifiedBadge from './VerifiedBadge';
import './DriverFeed.css';

// ============================================================
// TOWNWORK-STYLE JAPANESE RECRUITMENT LOCATION DATASETS
// ============================================================
export const JAPAN_TRAIN_LINES = [
  {
    id: 'line_tohoku',
    name: 'JR東北本線 (黒磯〜利府・盛岡)',
    prefecture: 'Miyagi',
    stations: ['黒磯駅', '高久駅', '黒田原駅', '豊原駅', '白坂駅', '新白河駅', '白河駅', '久田野駅', '泉崎駅', '矢吹駅', '鏡石駅', '須賀川駅']
  },
  {
    id: 'line_senzan',
    name: 'JR仙山線',
    prefecture: 'Miyagi',
    stations: ['仙台駅', '東照宮駅', '北仙台駅', '北山駅', '東北福祉大前駅', '国見駅', '葛岡駅', '陸前落合駅', '愛子駅']
  },
  {
    id: 'line_senseki',
    name: 'JR仙石線',
    prefecture: 'Miyagi',
    stations: ['あおば通駅', '仙台駅', '榴ケ岡駅', '宮城野原駅', '陸前原ノ町駅', '苦竹駅', '小鶴新田駅', '福田町駅', '陸前高砂駅']
  },
  {
    id: 'line_yamanote',
    name: 'JR山手線',
    prefecture: 'Tokyo',
    stations: ['東京駅', '品川駅', '渋谷駅', '新宿駅', '池袋駅', '上野駅', '秋葉原駅', '有楽町駅', '新橋駅', '恵比寿駅']
  },
  {
    id: 'line_chuo',
    name: 'JR中央本線',
    prefecture: 'Tokyo',
    stations: ['東京駅', '神田駅', '御茶ノ水駅', '四ツ谷駅', '新宿駅', '中野駅', '高円寺駅', '阿佐ケ谷駅', '荻窪駅', '吉祥寺駅', '三鷹駅']
  },
  {
    id: 'line_tokaido',
    name: 'JR東海道本線',
    prefecture: 'Kanagawa',
    stations: ['川崎駅', '横浜駅', '戸塚駅', '大船駅', '藤沢駅', '辻堂駅', '茅ケ崎駅', '平塚駅', '大磯駅', '二宮駅', '小田原駅']
  },
  {
    id: 'line_loop',
    name: 'JR大阪環状線',
    prefecture: 'Osaka',
    stations: ['大阪駅', '福島駅', '西九条駅', '弁天町駅', '大正駅', '新今宮駅', '天王寺駅', '鶴橋駅', '京橋駅']
  }
];

export const JAPAN_CITIES = [
  {
    id: 'city_sendai',
    name: '仙台市',
    prefecture: 'Miyagi',
    wards: ['青葉区', '宮城野区', '若林区', '太白区', '泉区']
  },
  { id: 'city_ishinomaki', name: '石巻市', prefecture: 'Miyagi', wards: [] },
  { id: 'city_shiogama', name: '塩竈市', prefecture: 'Miyagi', wards: [] },
  { id: 'city_kesennuma', name: '気仙沼市', prefecture: 'Miyagi', wards: [] },
  { id: 'city_natori', name: '名取市', prefecture: 'Miyagi', wards: [] },
  { id: 'city_tagajo', name: '多賀城市', prefecture: 'Miyagi', wards: [] },
  {
    id: 'city_tokyo23',
    name: '東京23区',
    prefecture: 'Tokyo',
    wards: ['千代田区', '中央区', '港区', '新宿区', '文京区', '品川区', '目黒区', '大田区', '世田谷区', '渋谷区', '江東区', '江戸川区', '足立区']
  },
  { id: 'city_hachioji', name: '八王子市', prefecture: 'Tokyo', wards: [] },
  { id: 'city_tachikawa', name: '立川市', prefecture: 'Tokyo', wards: [] },
  {
    id: 'city_yokohama',
    name: '横浜市',
    prefecture: 'Kanagawa',
    wards: ['鶴見区', '神奈川区', '西区', '中区', '南区', '港北区', '戸塚区']
  },
  { id: 'city_kawasaki', name: '川崎市', prefecture: 'Kanagawa', wards: ['川崎区', '幸区', '中原区', '高津区'] },
  {
    id: 'city_osakashi',
    name: '大阪市',
    prefecture: 'Osaka',
    wards: ['北区', '都島区', '福島区', '此花区', '中央区', '西区', '港区', '大正区', '浪速区', '淀川区', '住之江区']
  }
];

export const RADIUS_OPTIONS = [
  { value: 1, label: '1km以内', sublabel: '徒歩15分くらい (15 daq. piyoda)' },
  { value: 2, label: '2km以内', sublabel: '徒歩30分くらい (30 daq. piyoda)' },
  { value: 3, label: '3km以内', sublabel: '車10分くらい (Avto 10 daq.)' },
  { value: 5, label: '5km以内', sublabel: '車15分くらい (Avto 15 daq.)' },
  { value: 7, label: '7km以内', sublabel: '車20分くらい (Avto 20 daq.)' },
  { value: 10, label: '10km以内', sublabel: '車30分くらい (Avto 30 daq.)' },
  { value: 15, label: '15km以内', sublabel: '車45分くらい (Avto 45 daq.)' },
  { value: 20, label: '20km以内', sublabel: '車1時間くらい (Avto 1 soat)' }
];

// ============================================================
// MOCK_JOBS — Yaponiyada ish qidiruvchilar uchun to'liq e'lon ma'lumotlari
// Har bir e'lon kompaniyalar tomonidan kiritiladigan barcha muhim maydonlarni o'z ichiga oladi.
// Bu maydonlar ish qidiruvchiga aniq va to'liq ma'lumot berish uchun zarur.
// ============================================================
export const MOCK_JOBS = [
  {
    id: 1,
    company: "Sagawa Express",
    title: "Mahalliy yetkazib berish (Local Delivery)",
    salary: "¥300,000 / oyiga",
    type: "fulltime", // fulltime | parttime | contract
    shoukai: "¥50,000",
    shoukaiAmount: "¥50,000",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Tokyo, Koto-ku",
    lat: 35.6329,
    lng: 139.7904,
    fullAddress: "〒135-0063 Tokyo, Koto-ku, Ariake 3-1-1",
    nearestStation: "Kokusai-tenjijo Station",
    walkTime: 8,
    hours: "08:00 - 17:00",
    dayOff: "shanba_yakshanba",
    bonus: "bonus_2",
    insurance: "insurance_full",
    foreigners: "foreigners_n3",
    housing: "housing_none",
    license: "lic_futsu",
    description: "Koto-ku bo'ylab kichik posilkalarni mijozlarga yetkazib berish. Kuniga o'rtacha 80-100 ta posilka. Yo'nalishlar aniq belgilangan.",
    logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100",
    phone: "03-1234-5678",
    phoneMode: "public",
    isActive: true
  },
  {
    id: 2,
    company: "Nippon Express",
    title: "Xalqaro yuk tashish (Trailer)",
    salary: "¥500,000 / oyiga",
    type: "fulltime",
    shoukai: "¥100,000",
    shoukaiAmount: "¥100,000",
    image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Kanagawa, Yokohama",
    lat: 35.4437,
    lng: 139.6380,
    fullAddress: "〒231-0023 Kanagawa, Yokohama, Naka-ku, Yamashitacho 12",
    nearestStation: "Motomachi-Chukagai Station",
    walkTime: 12,
    hours: "shift",
    dayOff: "shift_rotation",
    bonus: "bonus_3",
    insurance: "insurance_full",
    foreigners: "foreigners_visa", // visa support (implies N4)
    housing: "housing_dorm",
    license: "lic_kenin",
    description: "Yokohama portidan Kanto hududi bo'ylab dengiz konteynerlarini tashish. Tirkama (Ken'in) guvohnomasi majburiy.",
    logo: "https://ui-avatars.com/api/?name=Nippon+Express&background=E63946&color=fff&size=100",
    phone: "045-222-3333",
    phoneMode: "interview_only",
    isInternational: true,
    isActive: true
  },
  {
    id: 3,
    company: "Yamato Transport",
    title: "Tungi reys haydovchisi (10t yuk mashinasi)",
    salary: "¥450,000 / oyiga",
    type: "contract",
    shoukai: "¥80,000",
    shoukaiAmount: "¥80,000",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Saitama, Omiya",
    lat: 35.9064,
    lng: 139.6235,
    fullAddress: "〒330-0854 Saitama, Omiya-ku, Sakuragicho 2-1",
    nearestStation: "Omiya Station",
    walkTime: 5,
    hours: "20:00 - 05:00",
    dayOff: "shanba_yakshanba",
    bonus: "bonus_2",
    insurance: "insurance_basic",
    foreigners: "foreigners_visa_renew",
    housing: "housing_half",
    license: "lic_oogata",
    description: "Kanto va Kansai o'rtasida yirik omborlar aro logistika tashish. Katta yuk mashinasi (Oogata) guvohnomasi majburiy.",
    logo: "https://ui-avatars.com/api/?name=Yamato+Transport&background=2A9D8F&color=fff&size=100",
    phone: "048-444-5555",
    phoneMode: "public",
    isActive: true
  },
  {
    id: 4,
    company: "Seino Transportation",
    title: "Ekskavator va Maxsus texnika haydovchisi",
    salary: "¥380,000 / oyiga",
    type: "fulltime",
    shoukai: "0",
    shoukaiAmount: "0",
    image: "https://images.unsplash.com/photo-1541888062837-7b247f082e05?auto=format&fit=crop&q=80&w=800",
    verified: false,
    location: "Chiba, Matsudo",
    lat: 35.7915,
    lng: 139.9015,
    fullAddress: "〒270-2253 Chiba, Matsudo, Tokiwadaira 3-2-1",
    nearestStation: "Tokiwadaira Station",
    walkTime: 15,
    hours: "07:00 - 16:00",
    dayOff: "shanba_yakshanba",
    bonus: "bonus_none",
    insurance: "insurance_basic",
    foreigners: "foreigners_n2",
    housing: "housing_none",
    license: "lic_oogata_tokushu",
    description: "Qurilish maydonchalarida maxsus texnika (Ekskavator) boshqarish. Sharyo-kei litsenziyasi bo'lishi shart.",
    logo: "https://ui-avatars.com/api/?name=Seino+Transport&background=E9C46A&color=333&size=100",
    phone: "047-666-7777",
    phoneMode: "interview_only",
    isActive: true
  },
  {
    id: 5,
    company: "Fukuyama Transporting",
    title: "Omborxona Forklift operatori",
    salary: "¥250,000 / oyiga",
    type: "parttime",
    shoukai: "¥30,000",
    shoukaiAmount: "¥30,000",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c28ea?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Aichi, Nagoya",
    lat: 35.1815,
    lng: 136.9066,
    fullAddress: "〒450-0002 Aichi, Nagoya, Nakamura-ku, Meieki 1-1-4",
    nearestStation: "Nagoya Station",
    walkTime: 10,
    hours: "09:00 - 14:00",
    dayOff: "flexible",
    bonus: "bonus_none",
    insurance: "insurance_partial",
    foreigners: "foreigners_visa",
    housing: "housing_none",
    license: "tech_forklift",
    description: "Omborda yuklarni tushirish va joylash. Forklift guvohnomasi talab etiladi.",
    logo: "https://ui-avatars.com/api/?name=Fukuyama+Trans&background=264653&color=fff&size=100",
    phone: "052-888-9999",
    phoneMode: "public",
    isInternational: true,
    isActive: true
  }
];

// ============================================================
// SkeletonCard — premium shishasimon (glassmorphism shimmer) yuklagich
// ============================================================
export function SkeletonCard() {
  return (
    <div className="job-card-hz skeleton-card glass" style={{ minHeight: '156px', width: '100%', marginBottom: '12px' }}>
      <div className="job-card-main-layout">
        {/* Chap qism: Rasm o'rniga shimmer */}
        <div className="job-card-img skeleton-shimmer" style={{ height: '100px', borderRadius: '8px' }} />

        {/* O'ng qism: Ma'lumotlar o'rniga shimmer */}
        <div className="job-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 8px' }}>
          <div className="skeleton-shimmer" style={{ width: '40%', height: '12px', borderRadius: '4px' }} />
          <div className="skeleton-shimmer" style={{ width: '80%', height: '18px', borderRadius: '4px', marginTop: '4px' }} />
          <div className="skeleton-shimmer" style={{ width: '50%', height: '14px', borderRadius: '4px' }} />
          
          <div className="job-card-chips" style={{ display: 'flex', gap: '6px', marginTop: '8px', border: 'none', padding: '0' }}>
            <div className="skeleton-shimmer" style={{ width: '60px', height: '22px', borderRadius: '12px' }} />
            <div className="skeleton-shimmer" style={{ width: '70px', height: '22px', borderRadius: '12px' }} />
          </div>
        </div>
      </div>
      
      {/* Pastki qism: Tugmalar */}
      <div className="job-card-actions" style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: '10px' }}>
        <div className="skeleton-shimmer" style={{ flex: 1, height: '32px', borderRadius: '8px' }} />
        <div className="skeleton-shimmer" style={{ flex: 1, height: '32px', borderRadius: '8px' }} />
      </div>
    </div>
  );
}

// ============================================================
// DriverFeed — Ish e'lonlari ro'yxati (Goo-net uslubida gorizontal kartochkalar)
// Har bir kartochkada: chapda rasm, o'ngda ma'lumotlar, pastda ikonkali chiplar
// ============================================================
export default function DriverFeed({ 
  onJobClick, isContractActive, verifiedCompanies = [], onShoukai, 
  jobs = MOCK_JOBS, userRole, profileData, onEditJob, onApply, applications = [],
  searchQuery = '', setSearchQuery, activeSegment = 'all', setActiveSegment,
  selectedLicenses = [], setSelectedLicenses,
  selectedLangLevel = 'all', setSelectedLangLevel,
  selectedBenefits = [], setSelectedBenefits,
  minSalary = 0, setMinSalary,
  selectedPrefecture = 'all', setSelectedPrefecture,
  selectedCity = 'all', setSelectedCity,
  stationQuery = '', setStationQuery,
  onlyNearStation = false, setOnlyNearStation,
  isLoading = false
}) {
  const { t } = useTranslation();
  const ENABLE_MAP_SEARCH = false; // Feature flag: Set to true in future to activate Map Search
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [localLoading, setLocalLoading] = useState(false);
  const markersRef = React.useRef([]);

  // Townwork-style Location Filter States
  const [locationTab, setLocationTab] = useState('stations'); // 'stations' | 'cities' | 'radius'
  const [selectedRadius, setSelectedRadius] = useState(0); // 0 = off, 1, 2, 3, 5, 7, 10, 15, 20
  const [expandedLines, setExpandedLines] = useState({ line_tohoku: true, line_senzan: true });
  const [expandedCities, setExpandedCities] = useState({ city_sendai: true });
  const [selectedStations, setSelectedStations] = useState([]);
  const [selectedCitiesList, setSelectedCitiesList] = useState([]);

  // Reset pagination when any filter changes
  useEffect(() => {
    setVisibleCount(10);
    setLocalLoading(true);
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [
    searchQuery, activeSegment, selectedLicenses,
    selectedLangLevel, selectedBenefits, minSalary,
    selectedPrefecture, selectedCity, stationQuery, onlyNearStation,
    locationTab, selectedRadius, selectedStations, selectedCitiesList
  ]);

  const showLoading = isLoading || localLoading;

  const getSalaryNumber = (salaryStr) => {
    if (!salaryStr) return 0;
    const num = parseInt(salaryStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const hasActiveFilters = selectedLicenses.length > 0 
    || selectedLangLevel !== 'all' 
    || selectedBenefits.length > 0 
    || minSalary > 0 
    || selectedPrefecture !== 'all'
    || selectedCity !== 'all'
    || stationQuery !== ''
    || onlyNearStation === true
    || selectedRadius > 0
    || selectedStations.length > 0
    || selectedCitiesList.length > 0;

  const handleResetFilters = () => {
    setSelectedLicenses([]);
    setSelectedLangLevel('all');
    setSelectedBenefits([]);
    setMinSalary(0);
    setSelectedPrefecture('all');
    setSelectedCity('all');
    setStationQuery('');
    setOnlyNearStation(false);
    setLocationTab('stations');
    setSelectedRadius(0);
    setSelectedStations([]);
    setSelectedCitiesList([]);
  };

  // Filtrlash: segment, qidiruv va yangi filtrlar bo'yicha
  // Filtrlash: segment, qidiruv va yangi filtrlar bo'yicha
  const filteredJobs = (jobs || []).filter(job => {
    if (!job) return false;

    const matchSegment = !activeSegment || activeSegment === 'all' 
      || (activeSegment === 'international' && job.isInternational === true)
      || (activeSegment === 'permanent' && job.type === 'fulltime')
      || (activeSegment === 'hourly' && (job.type === 'parttime' || job.type === 'contract'));
      
    const sq = (searchQuery || '').toLowerCase();
    const matchSearch = !sq || 
      (job.title && job.title.toLowerCase().includes(sq)) ||
      (job.company && job.company.toLowerCase().includes(sq)) ||
      (job.location && job.location.toLowerCase().includes(sq)) ||
      (job.description && job.description.toLowerCase().includes(sq));

    // 1. License filter
    const matchLicense = !selectedLicenses || selectedLicenses.length === 0 || selectedLicenses.includes(job.license);

    // 2. Japanese level filter (visible if user level >= job required level)
    const langMap = { 'all': 4, 'none': 0, 'n5_n4': 1, 'n3': 2, 'n2_n1': 3, 'N5': 1, 'N4': 1, 'N3': 2, 'N2': 3, 'N1': 3 };
    const userVal = langMap[selectedLangLevel] ?? 4;
    const jobVal = {
      'foreigners_n4': 1,
      'foreigners_nolang': 1,
      'foreigners_ok': 1,
      'foreigners_visa': 1,
      'foreigners_visa_renew': 1,
      'foreigners_n3': 2,
      'foreigners_n2': 3
    }[job.foreigners] || 0;
    const matchLang = userVal >= jobVal;

    // 3. Benefits filter (all selected benefits must match)
    const matchBenefits = !selectedBenefits || selectedBenefits.length === 0 || selectedBenefits.every(benefit => {
      if (benefit === 'housing') return job.housing && job.housing !== 'housing_none';
      if (benefit === 'foreigner') return job.foreigners && job.foreigners !== 'foreigners_none';
      if (benefit === 'bonus') return job.bonus && job.bonus !== 'bonus_none';
      if (benefit === 'insurance') return job.insurance && job.insurance.startsWith('insurance_');
      if (benefit === 'international') return job.isInternational === true;
      return true;
    });

    // 4. Salary filter
    const matchSalary = !minSalary || minSalary === 0 || getSalaryNumber(job.salary) >= minSalary;

    // 5. Prefecture and City location filter
    const prefSq = (selectedPrefecture && selectedPrefecture !== 'all') ? selectedPrefecture.toLowerCase() : '';
    const matchPrefecture = !prefSq || 
      (job.location && job.location.toLowerCase().includes(prefSq)) ||
      (job.fullAddress && job.fullAddress.toLowerCase().includes(prefSq)) ||
      (job.prefecture && job.prefecture.toLowerCase().includes(prefSq));

    const citySq = (selectedCity && selectedCity !== 'all') ? selectedCity.toLowerCase() : '';
    const matchCity = !citySq || 
      (job.location && job.location.toLowerCase().includes(citySq)) ||
      (job.fullAddress && job.fullAddress.toLowerCase().includes(citySq)) ||
      (job.detailAddress && job.detailAddress.toLowerCase().includes(citySq));

    // 6. Station query filter
    const stSq = (stationQuery || '').toLowerCase();
    const matchStation = !stSq || 
      (job.nearestStation && job.nearestStation.toLowerCase().includes(stSq)) ||
      (job.fullAddress && job.fullAddress.toLowerCase().includes(stSq));

    // 7. Near station walk time filter (<10 min walk)
    const matchWalkTime = !onlyNearStation || 
      (job.walkTime !== undefined && job.walkTime !== '' && Number(job.walkTime) <= 10);

    // 8. Multi-selected Station Checkboxes Filter
    const matchSelectedStations = !selectedStations || selectedStations.length === 0 || selectedStations.some(st => {
      const stClean = st.replace('駅', '').toLowerCase();
      return (job.nearestStation && job.nearestStation.toLowerCase().includes(stClean)) ||
             (job.location && job.location.toLowerCase().includes(stClean)) ||
             (job.fullAddress && job.fullAddress.toLowerCase().includes(stClean));
    });

    // 9. Multi-selected Cities/Wards Checkboxes Filter
    const matchSelectedCitiesList = !selectedCitiesList || selectedCitiesList.length === 0 || selectedCitiesList.some(c => {
      const cClean = c.replace('区', '').replace('市', '').toLowerCase();
      return (job.location && job.location.toLowerCase().includes(cClean)) ||
             (job.fullAddress && job.fullAddress.toLowerCase().includes(cClean));
    });

    return matchSegment && matchSearch && matchLicense && matchLang && 
           matchBenefits && matchSalary && matchPrefecture && matchCity && 
           matchStation && matchWalkTime && matchSelectedStations && matchSelectedCitiesList;
  });

  return (
    <div className="feed-container fade-in">
      {/* ====== QIDIRUV VA SEGMENT BOSHQARUVI ====== */}
      <div className="feed-header glass">
        <div className="search-row">
          <div className="search-bar">
            <Search size={20} color="#8E8E93" />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder', "Shahar yoki kompaniya nomi...")} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {ENABLE_MAP_SEARCH && (
            <button 
              type="button"
              className="map-view-toggle-btn glass"
              onClick={() => setIsMapModalOpen(true)}
              title={t('jobMapTitle', '求人マップ検索')}
              style={{
                padding: '10px 14px',
                borderRadius: '14px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(10, 132, 255, 0.12)',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <MapPin size={20} color="var(--primary)" />
            </button>
          )}
          <button 
            className={`filter-toggle-btn ${hasActiveFilters ? 'active' : ''}`}
            onClick={() => setIsFilterDrawerOpen(true)}
            title={t('advancedFilters', 'Kengaytirilgan filtrlar')}
          >
            <SlidersHorizontal size={20} />
            {hasActiveFilters && <span className="filter-badge"></span>}
          </button>
        </div>

        <div className="segmented-control">
          <div 
            className={`segment ${activeSegment === 'all' ? 'active' : ''}`}
            onClick={() => setActiveSegment('all')}
          >
            {t('allJobs', "Barchasi")}
          </div>
          <div 
            className={`segment ${activeSegment === 'international' ? 'active' : ''}`}
            onClick={() => setActiveSegment('international')}
          >
            {t('tokuteiGinouSegment', 'Tokutei Ginou')}
          </div>
          <div 
            className={`segment ${activeSegment === 'permanent' ? 'active' : ''}`}
            onClick={() => setActiveSegment('permanent')}
          >
            {t('fullTime', "Doimiy ish")}
          </div>
          <div 
            className={`segment ${activeSegment === 'hourly' ? 'active' : ''}`}
            onClick={() => setActiveSegment('hourly')}
          >
            {t('partTime', "Soatbay ish")}
          </div>
        </div>
      </div>

      {/* ====== E'LONLAR RO'YXATI (GOO-NET USLUBIDA) ====== */}
      <div className="jobs-list hide-scrollbar">
        {showLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filteredJobs.length === 0 ? (
          <div className="no-jobs glass" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', borderRadius: '12px', width: '100%' }}>
            {t('noJobsFound', 'Mos ish e\'lonlari topilmadi')}
          </div>
        ) : (
          filteredJobs.slice(0, visibleCount).map(job => {
            const showVerified = (verifiedCompanies || []).includes(job.company) || isContractActive;
            return (
              <div key={job.id} className={`job-card-hz glass ${job.isInternational ? 'job-card-international' : ''}`} onClick={() => onJobClick({...job, verified: showVerified})}>
                <div className="job-card-main-layout">
                  {/* ---- Chap qism: E'lon rasmi ---- */}
                  <div className="job-card-img">
                    <img 
                      src={job.image} 
                      alt={t(`job_${job.id}_title`, job.title)} 
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800"; }}
                    />
                    {/* Ish turi belgisi (rasm ustida) */}
                    <span className={`job-type-badge type-${job.type}`}>
                      {t(`jobType_${job.type}`, job.type === 'fulltime' ? '正社員' : job.type === 'parttime' ? 'アルバイト' : '契約')}
                    </span>
                  </div>

                  {/* ---- O'ng qism: Ma'lumotlar ---- */}
                  <div className="job-card-body">
                    {job.isInternational ? (
                      <div className="international-card-tag">
                        <Globe size={10} style={{ marginRight: '2px' }} />
                        <span>{t('foreigners_visa', 'Tokutei Ginou • Xalqaro Ish')}</span>
                      </div>
                    ) : job.foreigners === 'foreigners_visa_renew' ? (
                      <div className="local-visa-renew-tag">
                        <span className="briefcase-icon">💼</span>
                        <span>{t('foreigners_visa_renew', 'Vizani Uzaytirish Ko\'magi')}</span>
                      </div>
                    ) : job.foreigners === 'foreigners_ok' ? (
                      <div className="local-foreigner-ok-tag">
                        <span className="users-icon">👥</span>
                        <span>{t('foreigners_ok', 'Chet elliklar ochiq (Vizasiz)')}</span>
                      </div>
                    ) : null}
                    {/* Kompaniya nomi va tasdiqlash belgisi */}
                    <div className="job-card-company">
                      <img src={job.logo} alt={job.company} className="job-card-company-logo" />
                      <span>{job.company}</span>
                      {showVerified && <VerifiedBadge size={14} />}
                    </div>

                    {/* E'lon sarlavhasi */}
                    <h3 className="job-card-title">{t(`job_${job.id}_title`, job.title)}</h3>

                    {/* Maosh — eng muhim ma'lumot */}
                    <div className="job-card-salary">
                      <Banknote size={15} />
                      <span>{job.salary ? job.salary.replace('/ oyiga', `/ ${t('perMonth', 'oyiga')}`) : ''}</span>
                    </div>

                    {/* Qisqa ma'lumot chiplari (minimalistik ikonkalar bilan) */}
                    <div className="job-card-chips">
                      <span 
                        className={`job-chip ${ENABLE_MAP_SEARCH ? 'job-location-chip-clickable' : ''}`}
                        onClick={(e) => {
                          if (!ENABLE_MAP_SEARCH) return;
                          e.stopPropagation();
                          setSelectedMapJob(job);
                          setIsMapModalOpen(true);
                        }}
                      >
                        <MapPin size={12} color="var(--primary)" />
                        {t(`job_${job.id}_location`, job.location)}
                      </span>
                      <span className="job-chip">
                        <Clock size={12} />
                        {job.hours === 'shift' ? t('shiftWork', 'Smenali') : (job.hours ? t(job.hours, job.hours) : '')}
                      </span>
                      {job.foreigners && job.foreigners !== 'foreigners_none' && (
                        <span className="job-chip chip-highlight">
                          <Globe size={12} />
                          {t(job.foreigners, 'Chet elliklar')}
                        </span>
                      )}
                      {job.housing && job.housing !== 'housing_none' && (
                        <span className="job-chip chip-green">
                          <Home size={12} />
                          {t(job.housing, 'Uy-joy')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pastki qism: Tugmalar (job-card-main-layout tashqarisida) */}
                <div className="job-card-actions">
                  {userRole === 'company' ? (
                    // KOMPANIYA: O'z e'lonlarida "Tahrirlash", boshqalarda "Tel" va "Shoukai"
                    profileData?.fullName === job.company ? (
                      <button 
                        className="job-card-btn btn-apply"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditJob && onEditJob(job);
                        }}
                        style={{ flex: 1, background: '#1c1c1e', color: '#fff' }}
                      >
                        <Edit3 size={13} />
                        {t('editJob', 'Tahrirlash')}
                      </button>
                    ) : (
                      <>
                        <a 
                          href={`tel:${job.phone || '+81 90-1234-5678'}`}
                          className="job-card-btn btn-apply"
                          onClick={(e) => e.stopPropagation()}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', fontWeight: '700' }}
                        >
                          <Phone size={13} />
                          {t('callSchool', "Qo'ng'iroq")}
                        </a>
                        <button 
                          className="job-card-btn btn-shoukai"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            onShoukai && onShoukai(job); 
                          }}
                          style={{ flex: 1 }}
                        >
                          <Share2 size={13} />
                          {((job.shoukai && job.shoukai !== "0") || job.hasShoukai) 
                            ? `${t('shoukai', 'Shoukai')} (${t('shoukaiAvailableLabel', 'Puli Bor')})` 
                            : t('shoukai', 'Shoukai')}
                        </button>
                      </>
                    )
                  ) : (
                    // HAYDOVCHI / MEHMON: Ariza topshirish + Shoukai
                    <>
                  {(() => {
                    const alreadyApplied = (applications || []).some(a => a.jobId === job.id && !a.isSimulatedReferral);
                    if (alreadyApplied) {
                      return (
                        <button 
                          className="job-card-btn btn-apply applied"
                          disabled
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <CheckCircle2 size={13} />
                          {t('appliedStatus', 'Topshirilgan')}
                        </button>
                      );
                    }
                    return (
                      <button 
                        className="job-card-btn btn-apply"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onApply && onApply(job); 
                        }}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Briefcase size={13} />
                        {t('applyJob', 'Ishga topshirish')}
                      </button>
                    );
                  })()}
                  <button 
                    className="job-card-btn btn-shoukai"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onShoukai && onShoukai(job); 
                    }}
                    style={{ flex: 1 }}
                  >
                    <Share2 size={13} />
                    {((job.shoukai && job.shoukai !== "0") || job.hasShoukai) 
                      ? `${t('shoukai', 'Shoukai')} (${t('shoukaiAvailableLabel', 'Puli Bor')})` 
                      : t('shoukai', 'Shoukai')}
                  </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

        {visibleCount < filteredJobs.length && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 8px 0', width: '100%' }}>
            <button 
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="glass squircle animate-scale-up"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-main)',
                padding: '12px 24px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'var(--glass-border)';
              }}
            >
              <span>{t('loadMore', 'Ko\'proq yuklash')}</span>
            </button>
          </div>
        )}
        {filteredJobs.length === 0 && (
          <div className="empty-feed">
            <Search size={40} color="#C7C7CC" />
            <p>{t('noJobsFound', "Mos e'lon topilmadi")}</p>
          </div>
        )}
      </div>

      {/* ====== TOWNWORK-STYLE RECRUITMENT LOCATION FILTER DRAWER ====== */}
      {isFilterDrawerOpen && createPortal(
        <div className="filter-drawer-overlay animate-fade-in" onClick={() => setIsFilterDrawerOpen(false)}>
          <div className="townwork-filter-drawer glass animate-slide-up" onClick={(e) => e.stopPropagation()}>
            
            {/* Yellow / Primary Branded Header Banner */}
            <div className="townwork-filter-banner">
              <div className="townwork-banner-title-row">
                <h3>勤務地から探す (Hudud bo'yicha qidiruv)</h3>
                <button className="filter-close-btn" onClick={() => setIsFilterDrawerOpen(false)} aria-label="Close">
                  <X size={18} />
                </button>
              </div>

              {/* 3 Top Location Tabs */}
              <div className="townwork-banner-tabs">
                <button 
                  type="button" 
                  className={`townwork-tab-btn ${locationTab === 'stations' ? 'active' : ''}`}
                  onClick={() => setLocationTab('stations')}
                >
                  駅・路線
                </button>
                <button 
                  type="button" 
                  className={`townwork-tab-btn ${locationTab === 'cities' ? 'active' : ''}`}
                  onClick={() => setLocationTab('cities')}
                >
                  市区町村
                </button>
                <button 
                  type="button" 
                  className={`townwork-tab-btn ${locationTab === 'radius' ? 'active' : ''}`}
                  onClick={() => setLocationTab('radius')}
                >
                  現在地
                </button>
              </div>
            </div>

            {/* Prefecture Pill Dropdown Header Bar */}
            {locationTab !== 'radius' && (
              <div className="prefecture-selector-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Prefecture:</span>
                  <select 
                    value={selectedPrefecture} 
                    onChange={(e) => setSelectedPrefecture(e.target.value)}
                    className="prefecture-pill-btn"
                  >
                    <option value="Miyagi">📍 宮城県 (Miyagi)</option>
                    <option value="Tokyo">📍 東京都 (Tokyo)</option>
                    <option value="Kanagawa">📍 神奈川県 (Kanagawa)</option>
                    <option value="Osaka">📍 大阪府 (Osaka)</option>
                    <option value="all">📍 全ての地域 (All)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Scrollable Main Filter Content */}
            <div className="filter-drawer-content hide-scrollbar" style={{ padding: 0 }}>
              
              {/* TAB 1: Train Lines & Stations (駅・路線) */}
              {locationTab === 'stations' && (
                <div className="tab-stations-wrapper">
                  {JAPAN_TRAIN_LINES.filter(l => selectedPrefecture === 'all' || l.prefecture === selectedPrefecture).map(line => {
                    const isExpanded = !!expandedLines[line.id];
                    const isLineSelected = line.stations.every(st => selectedStations.includes(st));

                    return (
                      <div key={line.id} className="townwork-accordion-item">
                        <div className="townwork-accordion-header">
                          <label className="townwork-checkbox-label">
                            <div 
                              className={`townwork-square-checkbox ${isLineSelected ? 'checked' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isLineSelected) {
                                  setSelectedStations(prev => prev.filter(st => !line.stations.includes(st)));
                                } else {
                                  setSelectedStations(prev => Array.from(new Set([...prev, ...line.stations])));
                                }
                              }}
                            >
                              {isLineSelected && <Check size={14} color="#FFF" />}
                            </div>
                            <span>{line.name}</span>
                          </label>
                          <div 
                            onClick={() => setExpandedLines(prev => ({ ...prev, [line.id]: !prev[line.id] }))}
                            style={{ padding: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        </div>

                        {/* Station Checkboxes Body */}
                        {isExpanded && (
                          <div className="townwork-accordion-body">
                            {line.stations.map(st => {
                              const isStChecked = selectedStations.includes(st);
                              return (
                                <div 
                                  key={st} 
                                  className="townwork-sub-checkbox-item"
                                  onClick={() => {
                                    setSelectedStations(prev => 
                                      prev.includes(st) ? prev.filter(item => item !== st) : [...prev, st]
                                    );
                                  }}
                                >
                                  <div className={`townwork-square-checkbox ${isStChecked ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                                    {isStChecked && <Check size={11} color="#FFF" />}
                                  </div>
                                  <span>{st}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: Cities & Municipalities (市区町村) */}
              {locationTab === 'cities' && (
                <div className="tab-cities-wrapper">
                  {JAPAN_CITIES.filter(c => selectedPrefecture === 'all' || c.prefecture === selectedPrefecture).map(city => {
                    const isExpanded = !!expandedCities[city.id];
                    const hasWards = city.wards && city.wards.length > 0;
                    const isCityChecked = selectedCitiesList.includes(city.name);

                    return (
                      <div key={city.id} className="townwork-accordion-item">
                        <div className="townwork-accordion-header">
                          <label className="townwork-checkbox-label">
                            <div 
                              className={`townwork-square-checkbox ${isCityChecked ? 'checked' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCitiesList(prev => 
                                  prev.includes(city.name) ? prev.filter(c => c !== city.name) : [...prev, city.name]
                                );
                              }}
                            >
                              {isCityChecked && <Check size={14} color="#FFF" />}
                            </div>
                            <span>{city.name}</span>
                          </label>
                          {hasWards && (
                            <div 
                              onClick={() => setExpandedCities(prev => ({ ...prev, [city.id]: !prev[city.id] }))}
                              style={{ padding: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          )}
                        </div>

                        {/* Wards Checkboxes Body */}
                        {hasWards && isExpanded && (
                          <div className="townwork-accordion-body">
                            {city.wards.map(ward => {
                              const isWardChecked = selectedCitiesList.includes(ward);
                              return (
                                <div 
                                  key={ward} 
                                  className="townwork-sub-checkbox-item"
                                  onClick={() => {
                                    setSelectedCitiesList(prev => 
                                      prev.includes(ward) ? prev.filter(w => w !== ward) : [...prev, ward]
                                    );
                                  }}
                                >
                                  <div className={`townwork-square-checkbox ${isWardChecked ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                                    {isWardChecked && <Check size={11} color="#FFF" />}
                                  </div>
                                  <span>{ward}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: Current Location Radius (現在地) */}
              {locationTab === 'radius' && (
                <div className="townwork-radius-list">
                  {RADIUS_OPTIONS.map(opt => {
                    const isSelected = selectedRadius === opt.value;
                    return (
                      <div 
                        key={opt.value} 
                        className={`townwork-radius-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedRadius(opt.value)}
                      >
                        <div className="townwork-radio-circle">
                          {isSelected && <div className="townwork-radio-inner" />}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{opt.label}</span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{opt.sublabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Additional Filters (Licenses, Japanese Level, Salary, Benefits) */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '1px solid var(--glass-border)' }}>
                {/* Licenses */}
                <div className="filter-section">
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-main)' }}>{t('filterLicenses', 'Haydovchilik guvohnomasi')}</h4>
                  <div className="filter-tags">
                    {[
                      { id: 'lic_futsu', label: t('lic_futsu', 'Futsu (Yengil)') },
                      { id: 'lic_chugata', label: t('lic_chugata', 'Chugata (O\'rta)') },
                      { id: 'lic_oogata', label: t('lic_oogata', 'Oogata (Katta)') },
                      { id: 'lic_kenin', label: t('lic_kenin', 'Ken\'in (Trailer)') },
                      { id: 'tech_forklift', label: t('tech_forklift', 'Forklift') }
                    ].map(item => {
                      const isSelected = selectedLicenses.includes(item.id);
                      return (
                        <button 
                          key={item.id} 
                          className={`filter-tag-chip ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedLicenses(prev => 
                              prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                            );
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Salary */}
                <div className="filter-section">
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-main)' }}>{t('filterSalary', 'Minimal oylik maosh')}</h4>
                  <div className="filter-tags">
                    {[
                      { id: 0, label: t('salary_all', 'Barchasi') },
                      { id: 250000, label: '¥250,000+' },
                      { id: 350000, label: '¥350,000+' },
                      { id: 450000, label: '¥450,000+' }
                    ].map(item => {
                      const isSelected = minSalary === item.id;
                      return (
                        <button 
                          key={item.id} 
                          className={`filter-tag-chip ${isSelected ? 'active' : ''}`}
                          onClick={() => setMinSalary(item.id)}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Bottom Sticky Bar */}
            <div className="townwork-filter-bottom-bar">
              <button type="button" className="townwork-btn-clear" onClick={handleResetFilters}>
                クリア (Tozalash)
              </button>
              <button 
                type="button" 
                className="townwork-btn-search-cta" 
                onClick={() => setIsFilterDrawerOpen(false)}
              >
                {filteredJobs.length}件 検索
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('root') || document.body
      )}

      {/* ====== REAL LEAFLET MAP MODAL (Behind ENABLE_MAP_SEARCH feature flag) ====== */}
      {ENABLE_MAP_SEARCH && (
        <JobMapModal 
          isOpen={isMapModalOpen} 
          onClose={() => setIsMapModalOpen(false)} 
          jobs={filteredJobs} 
          onSelectJob={onJobClick} 
          t={t} 
        />
      )}
    </div>
  );
}

// ============================================================
// JobMapModal — Real Leaflet Map modal with interactive pins across Japan
// ============================================================
function JobMapModal({ isOpen, onClose, jobs, onSelectJob, t }) {
  const mapContainerRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const markersGroupRef = React.useRef(null);
  const [selectedMapJob, setSelectedMapJob] = React.useState(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const timers = [];

    const setupMap = () => {
      if (!mapContainerRef.current) return;

      let map = mapInstanceRef.current;
      if (!map) {
        try {
          map = L.map(mapContainerRef.current, {
            center: [35.6812, 139.7671],
            zoom: 9,
            zoomControl: false
          });

          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '© OpenStreetMap © CARTO'
          }).addTo(map);

          mapInstanceRef.current = map;
        } catch (e) {
          console.warn('[JobMapModal] Leaflet map init error:', e);
          return;
        }
      }

      map.invalidateSize();

      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();
      } else {
        markersGroupRef.current = L.layerGroup().addTo(map);
      }

      const bounds = [];

      (jobs || []).forEach(job => {
        if (!job || !job.lat || !job.lng) return;

        const customIcon = L.divIcon({
          className: 'real-job-map-pin-marker',
          html: `<div class="job-pin-badge">
            <span class="pin-icon">🚛</span>
          </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });

        const marker = L.marker([job.lat, job.lng], { icon: customIcon });
        marker.on('click', () => {
          setSelectedMapJob(job);
        });

        markersGroupRef.current.addLayer(marker);
        bounds.push([job.lat, job.lng]);
      });

      if (bounds.length > 0) {
        try {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
        } catch (e) {
          console.warn('fitBounds error:', e);
        }
      }
    };

    timers.push(setTimeout(setupMap, 50));
    timers.push(setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200));
    timers.push(setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 500));

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [isOpen, jobs]);

  if (!isOpen) return null;

  const targetContainer = document.getElementById('root') || document.body;

  return createPortal(
    <div className="job-map-modal-overlay animate-fade-in">
      <div className="job-map-modal-card glass animate-slide-up">
        {/* Header */}
        <div className="job-map-modal-header glass" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', borderBottom: '1px solid var(--glass-border)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
              🗺️ {t('jobMapTitle', '求人マップ検索')} ({jobs.length})
            </h3>
          </div>
          <button className="icon-btn glass" onClick={onClose} style={{ padding: '6px 10px', borderRadius: '12px', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Map Body */}
        <div className="job-map-modal-body" style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#e5e3df' }} />

          {/* Selected Job Card Preview Overlay */}
          {selectedMapJob && (
            <div className="job-map-preview-card glass squircle animate-slide-up" style={{ position: 'absolute', bottom: '16px', left: '12px', right: '12px', zIndex: 1000, padding: '14px', border: '1px solid var(--primary)', borderRadius: '20px', background: 'var(--card-bg)', boxShadow: '0 12px 32px rgba(0,0,0,0.45)' }}>
              <div className="preview-card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <img src={selectedMapJob.logo} alt={selectedMapJob.company} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                <div className="preview-title-block" style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {selectedMapJob.company} {selectedMapJob.verified && <VerifiedBadge />}
                  </h4>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: '2px 0 0 0' }}>{selectedMapJob.title}</h3>
                </div>
                <button className="icon-btn glass" onClick={() => setSelectedMapJob(null)} style={{ padding: '6px' }}>
                  <X size={16} />
                </button>
              </div>
              <div className="preview-card-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                <span style={{ background: 'rgba(52, 199, 89, 0.12)', color: '#34C759', padding: '4px 8px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '700' }}>💰 {selectedMapJob.salary}</span>
                <span style={{ background: 'rgba(10, 132, 255, 0.12)', color: '#0A84FF', padding: '4px 8px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '600' }}>📍 {selectedMapJob.location}</span>
                {selectedMapJob.shoukai !== '0' && (
                  <span style={{ background: 'rgba(255, 159, 10, 0.12)', color: '#FF9F0A', padding: '4px 8px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '700' }}>🎁 {t('shoukaiAvailable', 'Shoukai')} {selectedMapJob.shoukai}</span>
                )}
              </div>
              <button 
                className="btn-primary"
                onClick={() => {
                  onClose();
                  onSelectJob(selectedMapJob);
                }}
                style={{ width: '100%', padding: '11px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '700' }}
              >
                {t('viewDetails', '詳細を見る')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    targetContainer
  );
}
