import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Share2, Clock, Banknote, Shield, Home, Globe, Award, Briefcase, Car, Phone } from 'lucide-react';
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
export default function DriverFeed({ onJobClick, isContractActive, verifiedCompanies = [], onShoukai, jobs = MOCK_JOBS, userRole }) {
  const { t } = useTranslation();
  const [activeSegment, setActiveSegment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrlash: segment va qidiruv bo'yicha
  const filteredJobs = jobs.filter(job => {
    const matchSegment = activeSegment === 'all' 
      || (activeSegment === 'permanent' && job.type === 'fulltime')
      || (activeSegment === 'hourly' && (job.type === 'parttime' || job.type === 'contract'));
    const matchSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSegment && matchSearch;
  });

  return (
    <div className="feed-container fade-in">
      {/* ====== QIDIRUV VA SEGMENT BOSHQARUVI ====== */}
      <div className="feed-header glass">
        <div className="search-bar">
          <Search size={20} color="#8E8E93" />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder', "Shahar yoki kompaniya nomi...")} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
            <div key={job.id} className="job-card-hz glass squircle" onClick={() => onJobClick({...job, verified: showVerified})}>
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

                {/* Pastki qism: Tugmalar */}
                <div className="job-card-actions">
                  {userRole === 'company' ? (
                    <>
                      <button 
                        className="job-card-btn btn-call"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `tel:${job.phone || '080-1234-5678'}`;
                        }}
                        style={{ flex: 1, background: '#30D158', color: '#fff', border: 'none' }}
                      >
                        <Phone size={13} />
                        {t('callBtn', 'Qo\'ng\'iroq qilish')}
                      </button>
                      {((job.shoukai && job.shoukai !== "0") || job.hasShoukai) && (
                        <button 
                          className="job-card-btn btn-shoukai"
                          onClick={(e) => { e.stopPropagation(); onShoukai && onShoukai(job); }}
                          style={{ flex: 1 }}
                        >
                          <Share2 size={13} />
                          {t('shoukaiAvailableLabel', 'Puli Bor')}
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button className="job-card-btn btn-apply" style={{ flex: 1 }}>
                        <Briefcase size={13} />
                        {t('applyJob', 'Ariza berish')}
                      </button>
                      {((job.shoukai && job.shoukai !== "0") || job.hasShoukai) && (
                        <button 
                          className="job-card-btn btn-shoukai"
                          onClick={(e) => { e.stopPropagation(); onShoukai && onShoukai(job); }}
                          style={{ flex: 1 }}
                        >
                          <Share2 size={13} />
                          {t('shoukaiAvailableLabel', 'Puli Bor')}
                        </button>
                      )}
                    </>
                  )}
                </div>
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
        <div style={{ height: '10px' }}></div>
      </div>
    </div>
  );
}
