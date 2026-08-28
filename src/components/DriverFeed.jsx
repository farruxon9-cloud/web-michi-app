import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Share2, Clock, Banknote, Shield, Home, Globe, Award, Briefcase, Car, Phone, Edit3, CheckCircle2, SlidersHorizontal, X } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import './DriverFeed.css';

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
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [localLoading, setLocalLoading] = useState(false);
  const markersRef = React.useRef([]);

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
    selectedPrefecture, selectedCity, stationQuery, onlyNearStation
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
    || onlyNearStation === true;

  const handleResetFilters = () => {
    setSelectedLicenses([]);
    setSelectedLangLevel('all');
    setSelectedBenefits([]);
    setMinSalary(0);
    setSelectedPrefecture('all');
    setSelectedCity('all');
    setStationQuery('');
    setOnlyNearStation(false);
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

    return matchSegment && matchSearch && matchLicense && matchLang && 
      matchBenefits && matchSalary && matchPrefecture && matchCity && matchStation && matchWalkTime;
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
                      <span className="job-chip">
                        <MapPin size={12} />
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

      {/* ====== PREMIUM FILTER DRAWER ====== */}
      {isFilterDrawerOpen && createPortal(
        <div className="filter-drawer-overlay animate-fade-in" onClick={() => setIsFilterDrawerOpen(false)}>
          <div className="filter-drawer glass animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="filter-drawer-header">
              <h3>{t('advancedFilters', 'Kengaytirilgan filtrlar')}</h3>
              <button className="filter-close-btn" onClick={() => setIsFilterDrawerOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            
            <div className="filter-drawer-content hide-scrollbar">

              {/* Shortcut: View Jobs on Real Map */}
              <div className="filter-section" style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  className="btn-map-shortcut glass squircle animate-scale-up"
                  onClick={() => {
                    setIsFilterDrawerOpen(false);
                    setIsMapModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.15) 0%, rgba(52, 199, 89, 0.15) 100%)',
                    border: '1px solid var(--primary)',
                    borderRadius: '16px',
                    color: 'var(--primary)',
                    fontSize: '14.5px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(10, 132, 255, 0.2)'
                  }}
                >
                  <MapPin size={20} color="var(--primary)" />
                  <span>🗺️ {t('jobMapTitle', '求人マップ検索')}</span>
                </button>
              </div>

              {/* Category 1: Location (Prefecture & City & Station) */}
              <div className="filter-section">
                <h4>{t('filterLocation', 'Hudud bo\'yicha qidiruv')}</h4>
                <div className="filter-tags" style={{ marginBottom: '14px' }}>
                  {[
                    { id: 'all', label: t('allRegions', '全ての地域') },
                    { id: 'Tokyo', label: 'Tokyo (東京)' },
                    { id: 'Kanagawa', label: 'Kanagawa (神奈川)' },
                    { id: 'Saitama', label: 'Saitama (埼玉)' },
                    { id: 'Chiba', label: 'Chiba (千葉)' },
                    { id: 'Osaka', label: 'Osaka (大阪)' },
                    { id: 'Kyoto', label: 'Kyoto (京都)' },
                    { id: 'Aichi', label: 'Aichi (愛知)' },
                    { id: 'Fukuoka', label: 'Fukuoka (福岡)' }
                  ].map(item => {
                    const isSelected = selectedPrefecture === item.id;
                    return (
                      <button 
                        key={item.id} 
                        className={`filter-tag-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedPrefecture(item.id);
                          setSelectedCity('all'); // Reset city on prefecture change
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {/* Nested Cities Select */}
                {selectedPrefecture !== 'all' && ['Tokyo', 'Kanagawa', 'Saitama', 'Chiba', 'Osaka', 'Kyoto', 'Aichi'].includes(selectedPrefecture) && (
                  <div className="nested-cities-block fade-in" style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px dashed var(--glass-border)', marginBottom: '14px' }}>
                    <h5 style={{ margin: '0 0 10px 0', fontSize: '12.5px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                      📍 {t('cityLabel', 'Shahar / Tuman')} ({selectedPrefecture}):
                    </h5>
                    <div className="filter-tags">
                      {(
                        {
                          'Tokyo': ['all', 'Koto-ku', 'Shinjuku-ku', 'Minato-ku', 'Chiyoda-ku'],
                          'Kanagawa': ['all', 'Yokohama', 'Kawasaki'],
                          'Saitama': ['all', 'Omiya-ku', 'Omiya', 'Kawagoe'],
                          'Chiba': ['all', 'Matsudo', 'Funabashi'],
                          'Osaka': ['all', 'Osaka-shi', 'Sakai'],
                          'Kyoto': ['all', 'Kyoto-shi'],
                          'Aichi': ['all', 'Nagoya', 'Toyohashi']
                        }[selectedPrefecture] || ['all']
                      ).map(city => {
                        const isCitySelected = selectedCity === city;
                        return (
                          <button
                            key={city}
                            type="button"
                            className={`filter-tag-chip ${isCitySelected ? 'active' : ''}`}
                            onClick={() => setSelectedCity(city)}
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            {city === 'all' ? t('lang_all', 'Barchasi') : city}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Subway/Train Station filter */}
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                    🚉 {t('nearestStationLabel', 'Eng yaqin metro/poyezd bekati')}
                  </label>
                  <input
                    type="text"
                    value={stationQuery}
                    onChange={e => setStationQuery(e.target.value)}
                    placeholder={t('searchStationPlaceholder', 'Bekat nomini yozing...')}
                    className="auth-input"
                    style={{ fontSize: '12.5px', padding: '10px 12px' }}
                  />

                  {/* Near Station Toggle Chip */}
                  <div style={{ marginTop: '4px' }}>
                    <button
                      type="button"
                      className={`filter-tag-chip ${onlyNearStation ? 'active' : ''}`}
                      onClick={() => setOnlyNearStation(!onlyNearStation)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12.5px',
                        borderRadius: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {t('nearStationOnlyFilter', '🚶‍♂️ Metroga yaqin (10 daq. piyoda)')}
                    </button>
                  </div>
                </div>
              </div>


              {/* Category 2: Licenses */}
              <div className="filter-section">
                <h4>{t('filterLicenses', 'Haydovchilik guvohnomasi')}</h4>
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

              {/* Category 3: Japanese Level */}
              <div className="filter-section">
                <h4>{t('filterJapanese', 'Yapon tili darajasi')}</h4>
                <div className="filter-tags">
                  {[
                    { id: 'all', label: t('lang_all', 'Barchasi') },
                    { id: 'none', label: t('lang_none', 'Talab etilmaydi') },
                    { id: 'n5_n4', label: t('lang_n5_n4', 'N5 / N4 (Boshlang\'ich)') },
                    { id: 'n3', label: t('lang_n3', 'N3 (Suhbat)') },
                    { id: 'n2_n1', label: t('lang_n2_n1', 'N2 / N1 (Erkin)') }
                  ].map(item => {
                    const isSelected = selectedLangLevel === item.id;
                    return (
                      <button 
                        key={item.id} 
                        className={`filter-tag-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedLangLevel(item.id)}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 4: Benefits */}
              <div className="filter-section">
                <h4>{t('filterBenefits', 'Imtiyozlar va Sharoitlar')}</h4>
                <div className="filter-tags">
                  {[
                    { id: 'housing', label: t('housing_dorm', 'Yotoqxona / Uy-joy') },
                    { id: 'foreigner', label: t('foreigners_ok', 'Chet elliklarga mos') },
                    { id: 'bonus', label: t('bonus_2', 'Bonuslar bor') },
                    { id: 'insurance', label: t('insurance_full', 'Sug\'urta mavjud') }
                  ].map(item => {
                    const isSelected = selectedBenefits.includes(item.id);
                    return (
                      <button 
                        key={item.id} 
                        className={`filter-tag-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedBenefits(prev => 
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

              {/* Category 5: Minimum Salary */}
              <div className="filter-section">
                <h4>{t('filterSalary', 'Minimal oylik maosh')}</h4>
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

            {/* Action buttons */}
            <div className="filter-drawer-actions">
              <button className="filter-action-btn btn-reset" onClick={handleResetFilters}>
                {t('clearFilters', 'Tozalash')}
              </button>
              <button className="filter-action-btn btn-apply" onClick={() => setIsFilterDrawerOpen(false)}>
                {t('applyFilters', 'Filtrni qo\'llash')}
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('root') || document.body
      )}

      {/* ====== REAL LEAFLET MAP MODAL ====== */}
      <JobMapModal 
        isOpen={isMapModalOpen} 
        onClose={() => setIsMapModalOpen(false)} 
        jobs={filteredJobs} 
        onSelectJob={onJobClick} 
        t={t} 
      />
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

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      let map = mapInstanceRef.current;
      if (!map) {
        if (!window.L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = initLeaflet;
          document.head.appendChild(script);

          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        } else {
          initLeaflet();
        }
      } else {
        map.invalidateSize();
        updateMarkers();
      }
    }, 150);

    return () => clearTimeout(timer);

    function initLeaflet() {
      const L = window.L;
      if (!L || mapInstanceRef.current || !mapContainerRef.current) return;

      map = L.map(mapContainerRef.current, {
        center: [35.6812, 139.7671],
        zoom: 9,
        zoomControl: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      mapInstanceRef.current = map;
      updateMarkers();
    }

    function updateMarkers() {
      const L = window.L;
      const map = mapInstanceRef.current;
      if (!L || !map) return;

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
          html: `<div style="
            background: rgba(10, 132, 255, 0.95);
            border: 2px solid #ffffff;
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 6px 16px rgba(0,0,0,0.3);
            cursor: pointer;
            white-space: nowrap;
          ">
            <span>🚛</span>
            <span>${job.company}</span>
          </div>`,
          iconSize: [120, 36],
          iconAnchor: [60, 18]
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
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        } catch (e) {
          console.warn('fitBounds error:', e);
        }
      }
    }
  }, [isOpen, jobs]);

  if (!isOpen) return null;

  return createPortal(
    <div className="job-map-modal-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column' }}>
      <div className="job-map-modal-header glass" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
            🗺️ {t('jobMapTitle', '求人マップ検索')} ({jobs.length})
          </h3>
        </div>
        <button className="icon-btn glass" onClick={onClose} style={{ padding: '8px', borderRadius: '12px', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>

      <div className="job-map-modal-body" style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#e5e3df' }} />

        {/* Selected Job Card Preview Overlay */}
        {selectedMapJob && (
          <div className="job-map-preview-card glass squircle animate-slide-up" style={{ position: 'absolute', bottom: '24px', left: '16px', right: '16px', zIndex: 1000, padding: '16px', border: '1px solid var(--primary)', borderRadius: '20px', background: 'var(--card-bg)', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
            <div className="preview-card-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <img src={selectedMapJob.logo} alt={selectedMapJob.company} style={{ width: '44px', height: '44px', borderRadius: '12px', objectFit: 'cover' }} />
              <div className="preview-title-block" style={{ flex: 1 }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {selectedMapJob.company} {selectedMapJob.verified && <VerifiedBadge />}
                </h4>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', margin: '2px 0 0 0' }}>{selectedMapJob.title}</h3>
              </div>
              <button className="icon-btn glass" onClick={() => setSelectedMapJob(null)} style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>
            <div className="preview-card-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              <span style={{ background: 'rgba(52, 199, 89, 0.12)', color: '#34C759', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>💰 {selectedMapJob.salary}</span>
              <span style={{ background: 'rgba(10, 132, 255, 0.12)', color: '#0A84FF', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>📍 {selectedMapJob.location}</span>
              {selectedMapJob.shoukai !== '0' && (
                <span style={{ background: 'rgba(255, 159, 10, 0.12)', color: '#FF9F0A', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>🎁 {t('shoukaiAvailable', 'Shoukai')} {selectedMapJob.shoukai}</span>
              )}
            </div>
            <button 
              className="btn-primary"
              onClick={() => {
                onClose();
                onSelectJob(selectedMapJob);
              }}
              style={{ width: '100%', padding: '12px', borderRadius: '14px', fontSize: '14px', fontWeight: '700' }}
            >
              {t('viewDetails', '詳細を見る')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
