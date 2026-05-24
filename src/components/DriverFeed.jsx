import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Share2 } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import './DriverFeed.css';

export const MOCK_JOBS = [
  {
    id: 1,
    company: "Sagawa Express",
    title: "Mahalliy yetkazib berish (Local Delivery)",
    salary: "¥300,000 / oyiga",
    type: "To'liq stavka (Seishain)",
    shoukai: "¥50,000",
    shoukaiAmount: "¥50,000",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Tokyo, Koto-ku",
    fullAddress: "〒135-0063 Tokyo, Koto-ku, Ariake 3-1-1",
    hours: "08:00 - 17:00",
    bonus: "Yiliga 2 marta",
    insurance: "To'liq ijtimoiy sug'urta",
    foreigners: "Qabul qilinadi (N3+)",
    housing: "Mavjud emas",
    description: "Koto-ku bo'ylab kichik posilkalarni mijozlarga yetkazib berish. Kuniga o'rtacha 80-100 ta posilka. Yo'nalishlar aniq belgilangan.",
    logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100"
  },
  {
    id: 2,
    company: "Nippon Express",
    title: "Xalqaro yuk tashish (Trailer)",
    salary: "¥500,000 / oyiga",
    type: "To'liq stavka",
    shoukai: "¥100,000",
    shoukaiAmount: "¥100,000",
    image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Kanagawa, Yokohama",
    fullAddress: "〒231-0023 Kanagawa, Yokohama, Naka-ku, Yamashitacho 12",
    hours: "Növbətli (Shift)",
    bonus: "Yiliga 3 marta",
    insurance: "To'liq ijtimoiy sug'urta",
    foreigners: "Viza yordami bor",
    housing: "Kompaniya yotoqxonasi bor",
    description: "Yokohama portidan Kanto hududi bo'ylab dengiz konteynerlarini tashish. Tirkama (Ken'in) guvohnomasi majburiy.",
    logo: "https://ui-avatars.com/api/?name=Nippon+Express&background=E63946&color=fff&size=100"
  },
  {
    id: 3,
    company: "Yamato Transport",
    title: "Tungi reys haydovchisi (10t yuk mashinasi)",
    salary: "¥450,000 / oyiga",
    type: "Shartnoma asosida",
    shoukai: "¥80,000",
    shoukaiAmount: "¥80,000",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Saitama, Omiya",
    fullAddress: "〒330-0854 Saitama, Omiya-ku, Sakuragicho 2-1",
    hours: "20:00 - 05:00",
    bonus: "Yiliga 2 marta",
    insurance: "Mavjud",
    foreigners: "Qabul qilinadi",
    housing: "Uy ijarasining 50% to'lanadi",
    description: "Kanto va Kansai o'rtasida yirik omborlar aro logistika tashish. Katta yuk mashinasi (Oogata) guvohnomasi majburiy.",
    logo: "https://ui-avatars.com/api/?name=Yamato+Transport&background=2A9D8F&color=fff&size=100"
  },
  {
    id: 4,
    company: "Seino Transportation",
    title: "Ekskavator va Maxsus texnika haydovchisi",
    salary: "¥380,000 / oyiga",
    type: "To'liq stavka",
    shoukai: "0",
    shoukaiAmount: "0",
    image: "https://images.unsplash.com/photo-1541888062837-7b247f082e05?auto=format&fit=crop&q=80&w=800",
    verified: false,
    location: "Chiba, Matsudo",
    fullAddress: "〒270-2253 Chiba, Matsudo, Tokiwadaira 3-2-1",
    hours: "07:00 - 16:00",
    bonus: "Mavjud emas",
    insurance: "Mavjud",
    foreigners: "Faqat Yapon tili N2 daraja",
    housing: "Mavjud emas",
    description: "Qurilish maydonchalarida maxsus texnika (Ekskavator) boshqarish. Sharyo-kei litsenziyasi bo'lishi shart.",
    logo: "https://ui-avatars.com/api/?name=Seino+Transport&background=E9C46A&color=333&size=100"
  },
  {
    id: 5,
    company: "Fukuyama Transporting",
    title: "Omborxona Forklift operatori",
    salary: "¥250,000 / oyiga",
    type: "Arubaito (Part-time)",
    shoukai: "¥30,000",
    shoukaiAmount: "¥30,000",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c28ea?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Aichi, Nagoya",
    fullAddress: "〒450-0002 Aichi, Nagoya, Nakamura-ku, Meieki 1-1-4",
    hours: "09:00 - 14:00 (Ixtiyoriy kunlar)",
    bonus: "Mavjud emas",
    insurance: "Qisman",
    foreigners: "Til talab qilinmaydi",
    housing: "Mavjud emas",
    description: "Omborda yuklarni tushirish va joylash. Forklift guvohnomasi talab etiladi.",
    logo: "https://ui-avatars.com/api/?name=Fukuyama+Trans&background=264653&color=fff&size=100"
  }
];

export default function DriverFeed({ onJobClick, isContractActive, verifiedCompanies = [] }) {
  const { t } = useTranslation();
  const [activeSegment, setActiveSegment] = useState('permanent');

  return (
    <div className="feed-container fade-in">
      {/* Header */}
      <div className="feed-header glass">
        <div className="search-bar">
          <Search size={20} color="#8E8E93" />
          <input type="text" placeholder={t('searchPlaceholder', "Shahar yoki kompaniya nomi...")} />
        </div>

        <div className="segmented-control">
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

      {/* Feed List */}
      <div className="jobs-list hide-scrollbar">
        {MOCK_JOBS.map(job => {
          const showVerified = verifiedCompanies.includes(job.company) || isContractActive;
          return (
            <div key={job.id} className="job-card" onClick={() => onJobClick({...job, verified: showVerified})}>
              <div className="job-image-container">
                <img 
                  src={job.image} 
                  alt={job.title} 
                  className="job-image" 
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800"; }}
                />
                <div className="company-logo-wrapper glass">
                  <img src={job.logo} alt={job.company} className="company-logo" />
                </div>
                <div className="price-tag glass">
                  {job.salary ? job.salary.replace('/ oyiga', `/ ${t('perMonth', 'oyiga')}`) : ''}
                </div>
              </div>
              
              <div className="job-info">
                <p style={{ fontSize: '12px', color: '#8E8E93', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {job.company} {showVerified && <VerifiedBadge size={14} />}
                </p>
                <h3 className="job-title" style={{ margin: '0 0 4px 0' }}>{job.title}</h3>
                <p className="job-location" style={{ margin: '0 0 4px 0' }}>
                  <MapPin size={14} /> {job.location}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button style={{ flex:1, padding:'8px 12px', background:'#2C2C2E', color:'white', border:'none', borderRadius:'12px', fontSize:'13px', fontWeight:'600' }}>
                    {t('applyJob', 'Ariza berish')}
                  </button>
                  <button style={{ flex:1, padding:'8px 12px', background:'rgba(255,159,10,0.1)', color:'#FF9F0A', border:'1px solid rgba(255,159,10,0.2)', borderRadius:'12px', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                    <Share2 size={14} /> {job.shoukai && job.shoukai !== "0" ? `${t('shoukai', 'Shoukai')} (${job.shoukai})` : t('shoukai', 'Shoukai')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: '10px' }}></div> {/* Spacer for bottom nav */}
      </div>
    </div>
  );
}
