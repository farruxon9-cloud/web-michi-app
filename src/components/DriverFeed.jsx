import React, { useState } from 'react';
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
    fullAddress: "〒135-0063 Tokyo, Koto-ku, Ariake 3-1-1",
    hours: "08:00 - 17:00",
    dayOff: "shanba_yakshanba",
    bonus: "bonus_2",
    insurance: "insurance_full",
    foreigners: "foreigners_n3",
    housing: "housing_none",
    license: "lic_futsu",
    description: "Koto-ku bo'ylab kichik posilkalarni mijozlarga yetkazib berish. Kuniga o'rtacha 80-100 ta posilka. Yo'nalishlar aniq belgilangan.",
    logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100",
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
    fullAddress: "〒231-0023 Kanagawa, Yokohama, Naka-ku, Yamashitacho 12",
    hours: "shift",
    dayOff: "shift_rotation",
    bonus: "bonus_3",
    insurance: "insurance_full",
    foreigners: "foreigners_visa",
    housing: "housing_dorm",
    license: "lic_kenin",
    description: "Yokohama portidan Kanto hududi bo'ylab dengiz konteynerlarini tashish. Tirkama (Ken'in) guvohnomasi majburiy.",
    logo: "https://ui-avatars.com/api/?name=Nippon+Express&background=E63946&color=fff&size=100",
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
    fullAddress: "〒330-0854 Saitama, Omiya-ku, Sakuragicho 2-1",
    hours: "20:00 - 05:00",
    dayOff: "shanba_yakshanba",
    bonus: "bonus_2",
    insurance: "insurance_basic",
    foreigners: "foreigners_ok",
    housing: "housing_half",
    license: "lic_oogata",
    description: "Kanto va Kansai o'rtasida yirik omborlar aro logistika tashish. Katta yuk mashinasi (Oogata) guvohnomasi majburiy.",
    logo: "https://ui-avatars.com/api/?name=Yamato+Transport&background=2A9D8F&color=fff&size=100",
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
    fullAddress: "〒270-2253 Chiba, Matsudo, Tokiwadaira 3-2-1",
    hours: "07:00 - 16:00",
    dayOff: "shanba_yakshanba",
    bonus: "bonus_none",
    insurance: "insurance_basic",
    foreigners: "foreigners_n2",
    housing: "housing_none",
    license: "lic_oogata_tokushu",
    description: "Qurilish maydonchalarida maxsus texnika (Ekskavator) boshqarish. Sharyo-kei litsenziyasi bo'lishi shart.",
    logo: "https://ui-avatars.com/api/?name=Seino+Transport&background=E9C46A&color=333&size=100",
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
    fullAddress: "〒450-0002 Aichi, Nagoya, Nakamura-ku, Meieki 1-1-4",
    hours: "09:00 - 14:00",
    dayOff: "flexible",
    bonus: "bonus_none",
    insurance: "insurance_partial",
    foreigners: "foreigners_nolang",
    housing: "housing_none",
    license: "tech_forklift",
    description: "Omborda yuklarni tushirish va joylash. Forklift guvohnomasi talab etiladi.",
    logo: "https://ui-avatars.com/api/?name=Fukuyama+Trans&background=264653&color=fff&size=100",
    isActive: true
  }
];

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
  selectedPrefecture = 'all', setSelectedPrefecture
}) {
  const { t } = useTranslation();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const getSalaryNumber = (salaryStr) => {
    if (!salaryStr) return 0;
    const num = parseInt(salaryStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const hasActiveFilters = selectedLicenses.length > 0 || selectedLangLevel !== 'all' || selectedBenefits.length > 0 || minSalary > 0 || selectedPrefecture !== 'all';

  const handleResetFilters = () => {
    setSelectedLicenses([]);
    setSelectedLangLevel('all');
    setSelectedBenefits([]);
    setMinSalary(0);
    setSelectedPrefecture('all');
  };

  // Filtrlash: segment, qidiruv va yangi filtrlar bo'yicha
  const filteredJobs = jobs.filter(job => {
    const matchSegment = activeSegment === 'all' 
      || (activeSegment === 'permanent' && job.type === 'fulltime')
      || (activeSegment === 'hourly' && (job.type === 'parttime' || job.type === 'contract'));
      
    const matchSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());

    // 1. License filter
    const matchLicense = selectedLicenses.length === 0 || selectedLicenses.includes(job.license);

    // 2. Japanese level filter (visible if user level >= job required level)
    const userVal = { 'all': 4, 'none': 0, 'n5_n4': 1, 'n3': 2, 'n2_n1': 3 }[selectedLangLevel];
    const jobVal = {
      'foreigners_nolang': 0,
      'foreigners_ok': 0,
      'foreigners_visa': 1,
      'foreigners_n3': 2,
      'foreigners_n2': 3
    }[job.foreigners] || 0;
    const matchLang = userVal >= jobVal;

    // 3. Benefits filter (all selected benefits must match)
    const matchBenefits = selectedBenefits.every(benefit => {
      if (benefit === 'housing') return job.housing && job.housing !== 'housing_none';
      if (benefit === 'foreigner') return job.foreigners && job.foreigners !== 'foreigners_none';
      if (benefit === 'bonus') return job.bonus && job.bonus !== 'bonus_none';
      if (benefit === 'insurance') return job.insurance && job.insurance.startsWith('insurance_');
      return true;
    });

    // 4. Salary filter
    const matchSalary = minSalary === 0 || getSalaryNumber(job.salary) >= minSalary;

    // 5. Prefecture location filter
    const matchPrefecture = selectedPrefecture === 'all' || 
      (job.location && job.location.toLowerCase().includes(selectedPrefecture.toLowerCase())) ||
      (job.fullAddress && job.fullAddress.toLowerCase().includes(selectedPrefecture.toLowerCase()));

    return matchSegment && matchSearch && matchLicense && matchLang && matchBenefits && matchSalary && matchPrefecture;
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
        {filteredJobs.map(job => {
          const showVerified = verifiedCompanies.includes(job.company) || isContractActive;
          return (
            <div key={job.id} className="job-card-hz glass" onClick={() => onJobClick({...job, verified: showVerified})}>
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
                  return alreadyApplied ? (
                    <button 
                      className="job-card-btn btn-apply applied" 
                      disabled
                      onClick={(e) => e.stopPropagation()}
                      style={{ flex: 1, cursor: 'default' }}
                    >
                      <CheckCircle2 size={13} />
                      {t('applied', 'Topshirilgan')}
                    </button>
                  ) : (
                    <button 
                      className="job-card-btn btn-apply" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onApply && onApply(job);
                      }}
                      style={{ flex: 1 }}
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
        })}
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
              {/* Category 1: Location (Prefecture) */}
              <div className="filter-section">
                <h4>{t('filterLocation', 'Hudud bo\'yicha qidiruv')}</h4>
                <div className="filter-tags">
                  {[
                    { id: 'all', label: t('lang_all', 'Barchasi') },
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
                        onClick={() => setSelectedPrefecture(item.id)}
                      >
                        {item.label}
                      </button>
                    );
                  })}
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
    </div>
  );
}
