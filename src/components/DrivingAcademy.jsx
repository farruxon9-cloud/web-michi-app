import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, ArrowLeft, Phone, Mail, MapPin, Share2, CheckCircle2, Bookmark, Search } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import './DrivingAcademy.css';
import './DriverFeed.css'; // Use job-card styles

const MOCK_SCHOOLS = [
  {
    id: 1,
    name: "Koyama Driving School",
    type: "Katta yuk va maxsus",
    discount: "¥20,000",
    shoukai: "¥10,000",
    image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Tokyo, Futako-Tamagawa",
    fullAddress: "〒158-0094 Tokyo, Setagaya City, Tamagawa 3-1-1",
    description: "Yaponiyadagi eng zamonaviy avtomaktablardan biri. Barcha turdagi litsenziyalar mavjud. Chet elliklar uchun ingliz tilida darslar mavjud.",
    courses: ['Oogata', 'Chugata', 'Futsu', 'Tokushu'],
    price: '¥280,000~',
    phone: '+81 3-1234-5678',
    email: 'info@koyama.jp',
    langs: ['UZ', 'JP', 'EN'],
    shoukaiFee: 10000
  },
  {
    id: 2,
    name: "Saitama Automobile School",
    type: "Barcha toifalar",
    discount: "¥15,000",
    shoukai: "¥5,000",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Saitama, Omiya",
    fullAddress: "〒330-0854 Saitama, Omiya-ku, Sakuragicho 2-1",
    description: "Saitama markazidagi yirik o'quv maydoniga ega avtomaktab. Yotoqxonalar bor.",
    courses: ['Oogata', 'Chugata', 'Futsu'],
    price: '¥250,000~',
    phone: '+81 48-555-1234',
    email: 'info@saitama-auto.jp',
    langs: ['UZ', 'JP'],
    shoukaiFee: 5000
  },
  {
    id: 3,
    name: "Chiba Driving Center",
    type: "Yuk va Forklift",
    discount: "¥10,000",
    shoukai: "0",
    image: "https://images.unsplash.com/photo-1541888062837-7b247f082e05?auto=format&fit=crop&q=80&w=800",
    verified: false,
    location: "Chiba, Matsudo",
    fullAddress: "〒270-2253 Chiba, Matsudo, Tokiwadaira 3-2-1",
    description: "Faqat yuk mashinalari va maxsus texnikalar (Ekskavator, Forklift) litsenziyalari o'rgatiladi.",
    courses: ['Oogata', 'Forklift', 'Tokushu'],
    price: '¥200,000~',
    phone: '+81 47-333-9876',
    email: 'contact@chiba-drive.jp',
    langs: ['JP'],
    shoukaiFee: 0
  },
  {
    id: 4,
    name: "Yokohama Driving College",
    type: "Yengil va Motosikl",
    discount: "¥5,000",
    shoukai: "¥3,000",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Kanagawa, Yokohama",
    fullAddress: "〒231-0023 Kanagawa, Yokohama, Naka-ku",
    description: "Chiroyli dengiz manzarasi. Tajribali ustozlar. Rus va O'zbek tillarida tarjimonlar mavjud.",
    courses: ['Futsu', 'Nirin'],
    price: '¥300,000~',
    phone: '+81 45-222-3456',
    email: 'info@yokohama-dc.jp',
    langs: ['UZ', 'JP', 'RU'],
    shoukaiFee: 3000
  },
  {
    id: 5,
    name: "Osaka Central Auto",
    type: "Barcha toifalar",
    discount: "¥30,000",
    shoukai: "¥15,000",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c28ea?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Osaka, Namba",
    fullAddress: "〒542-0076 Osaka, Chuo Ward, Namba 1-1",
    description: "Kansai hududidagi eng mashhur avtomaktab. Qisqa muddatda Gashuku (yashab o'qish) kurslari.",
    courses: ['Oogata', 'Chugata', 'Futsu', 'Nirin'],
    price: '¥320,000~',
    phone: '+81 6-7777-8888',
    email: 'info@osaka-central.jp',
    langs: ['UZ', 'JP', 'EN'],
    shoukaiFee: 15000
  }
];

export default function DrivingAcademy({ isContractActive, onApplySchool, schoolApplications = [], onShoukaiPaid, profileData, onShoukai, verifiedCompanies = [], onToggleSave, userRole }) {
  const { t } = useTranslation();
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showShoukaiInput, setShowShoukaiInput] = useState(false);
  const [referrerName, setReferrerName] = useState('');

  // Detail page
  if (selectedSchool) {
    const school = selectedSchool;
    const existingApp = schoolApplications.find(a => a.schoolId === school.id);
    const hasApplied = !!existingApp;
    const isSaved = profileData?.savedItems?.schools?.some(s => s.id === school.id);

    return (
      <div className="academy-container fade-in">
        <div className="school-detail-scroll hide-scrollbar">
          {/* Sticky Header Actions */}
          <div className="academy-header-actions">
            <button className="icon-btn glass" onClick={() => { setSelectedSchool(null); setShowShoukaiInput(false); }}>
              <ArrowLeft size={20} />
            </button>
            <button className="icon-btn glass" onClick={() => onToggleSave(school, 'schools')}>
              <Bookmark size={20} fill={isSaved ? "var(--primary)" : "none"} color={isSaved ? "var(--primary)" : "currentColor"} />
            </button>
          </div>
          {/* School Image */}
          <div className="school-image-container">
            <img src={school.image} alt={school.name} className="school-image" />
            <div className="langs-badge glass">{school.langs ? school.langs.join(', ') : 'UZ, JP'}</div>
          </div>

          <div className="school-detail-body">
            {/* Title & Location */}
            <div className="school-header-row" style={{ marginBottom: '4px' }}>
              <h2 className="school-name" style={{ fontSize: '22px' }}>{school.name}</h2>
              {(school.verified || isContractActive) && <VerifiedBadge size={20} />}
            </div>
            <p className="school-location" style={{ marginBottom: '20px' }}>
              <MapPin size={14} /> {school.location}
            </p>

            {/* Courses */}
            <div className="detail-section">
              <h4>{t('courseOffered')}</h4>
              <div className="categories-row">
                {(school.courses || [school.type]).map(course => (
                  <span key={course} className="category-tag">{course}</span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="detail-section">
              <div className="price-wrap">
                <span className="price-amount" style={{ fontSize: '24px' }}>{school.price || 'Maxsus narx'}</span>
                {school.discount && (
                  <span className="discount-tag">{t('memberDiscount')}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="detail-section">
              <h4>{t('schoolDesc')}</h4>
              <p className="school-description">{school.description}</p>
            </div>

            {/* Contact Info */}
            <div className="detail-section contact-section glass squircle">
              <div className="contact-row">
                <Phone size={16} color="#34C759" />
                <span>{t('schoolPhone')}: {school.phone || '+81 90-1234-5678'}</span>
              </div>
              <div className="contact-row">
                <Mail size={16} color="#0A84FF" />
                <span>{t('emailLabel')}: {school.email || 'info@academy.jp'}</span>
              </div>
              <div className="contact-row">
                <MapPin size={16} color="#AF52DE" />
                <span>{t('fullAddress')}: {school.fullAddress}</span>
              </div>
            </div>

            {/* 
              ASOSIY QISM (MAIN BO'LIMI) O'ZGARISHI:
              Shoukai qismi faqatgina maktab tomonidan shoukai mukofoti kiritilganda 
              (ya'ni 0 dan katta bo'lganda) ekranda alohida o'ziga xos ko'rinadi.
              Agar shoukai summasi bo'lmasa, bu qism umuman chiqmaydi.
            */}
            {school.shoukaiFee > 0 && (
              <div className="detail-section shoukai-section glass squircle">
                <div className="shoukai-header">
                  <Share2 size={18} color="#FF9F0A" />
                  <h4>{t('shoukaiShare', 'Ulashish / Shoukai')}</h4>
                </div>
                <p className="shoukai-desc">{t('shoukaiDesc', "Do'stingizni taklif qiling va mukofot oling")}</p>
                <div className="shoukai-amount" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {t('shoukaiReward', 'Shoukai mukofoti')}: <span style={{ color: '#FF9F0A' }}>¥{school.shoukaiFee.toLocaleString()}</span>
                </div>

                {showShoukaiInput && !hasApplied && (
                  <div className="shoukai-input-wrap">
                    <input 
                      type="text"
                      className="auth-input"
                      placeholder={t('shoukaiBy')}
                      value={referrerName}
                      onChange={(e) => setReferrerName(e.target.value)}
                    />
                    <button 
                      className="shoukai-apply-btn squircle"
                      onClick={() => {
                        onApplySchool(school, referrerName);
                        setShowShoukaiInput(false);
                      }}
                    >
                      {t('applyToSchool')} + {t('shoukaiShare')}
                    </button>
                  </div>
                )}

                {/* Shoukai tracking for school view */}
                {existingApp && existingApp.referrerName && (
                  <div className={`shoukai-track ${existingApp.paid ? 'paid' : 'unpaid'}`}>
                    <div className="shoukai-track-info">
                      <span className="shoukai-referrer">{t('shoukaiBy')}: {existingApp.referrerName}</span>
                      <span className="shoukai-fee">¥{school.shoukaiFee.toLocaleString()}</span>
                    </div>
                    {!existingApp.paid ? (
                      <button 
                        className="shoukai-pay-btn squircle"
                        onClick={() => onShoukaiPaid(existingApp.id)}
                      >
                        {t('shoukaiPaid')}
                      </button>
                    ) : (
                      <div className="shoukai-paid-badge">
                        <CheckCircle2 size={16} /> {t('shoukaiPaid')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}              </div>

            {/* Bottom actions (not sticky anymore) */}
            <div className="school-sticky-actions glass" style={{ display: 'flex', gap: '8px', padding: '16px 20px', borderTop: '1px solid var(--glass-border)' }}>
              <a href={`tel:${school.phone || '+819012345678'}`} className="call-btn squircle" style={{ flex: 1, padding: '14px 10px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                <Phone size={16} /> Qo'ng'iroq
              </a>
              {!hasApplied ? (
                <button 
                  className="apply-school-btn squircle"
                  onClick={() => onApplySchool(school, '')}
                  style={{ flex: 1, padding: '14px 10px', fontSize: '14px', whiteSpace: 'nowrap' }}
                >
                  {t('applyToSchool', 'Maktabga topshirish')}
                </button>
              ) : (
                <button className="apply-school-btn squircle applied" disabled style={{ flex: 1, padding: '14px 10px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                  <CheckCircle2 size={16} /> {t('appliedToSchool', 'Topshirilgan')}
                </button>
              )}
              <button 
                className="shoukai-btn squircle"
                onClick={() => setShowShoukaiInput(true)}
                style={{ flex: 1, background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', padding: '14px 10px', fontSize: '14px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Share2 size={16} /> {school.shoukaiFee ? `Shoukai (${school.shoukaiFee.toLocaleString()})` : 'Shoukai'}
              </button>
            </div>
          </div>
        </div>
    );
  }

  // List page
  return (
    <div className="feed-container fade-in">
      {/* Header */}
      <div className="feed-header glass">
        <div className="search-bar">
          <Search size={20} color="#8E8E93" />
          <input type="text" placeholder="Avtomaktab yoki shahar nomi..." />
        </div>
      </div>

      <div className="jobs-list hide-scrollbar">
        {MOCK_SCHOOLS.map(school => {
          const showVerified = school.verified || isContractActive;
          return (
            <div key={school.id} className="job-card" onClick={() => setSelectedSchool(school)}>
              <div className="job-image-container">
                <img src={school.image} alt={school.name} className="job-image" />
                <div className="langs-badge glass">
                  {school.langs ? school.langs.join(', ') : 'UZ, JP'}
                </div>
                <div className="price-tag glass">
                  {school.price}
                </div>
              </div>
              
              <div className="job-info">
                <p style={{ fontSize: '12px', color: '#8E8E93', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {school.name} {showVerified && <VerifiedBadge size={14} />}
                </p>
                <h3 className="job-title" style={{ margin: '0 0 4px 0' }}>{school.name}</h3>
                <p className="job-location" style={{ margin: '0 0 4px 0' }}>
                  <MapPin size={14} /> {school.location}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button style={{ flex:1, padding:'8px 12px', background:'#2C2C2E', color:'white', border:'none', borderRadius:'12px', fontSize:'13px', fontWeight:'600' }}>
                    {t('applyToSchool', 'Maktabga topshirish')}
                  </button>
                  <button style={{ flex:1, padding:'8px 12px', background:'rgba(255,159,10,0.1)', color:'#FF9F0A', border:'1px solid rgba(255,159,10,0.2)', borderRadius:'12px', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                    <Share2 size={14} /> {school.shoukaiFee ? `Shoukai (¥${school.shoukaiFee.toLocaleString()})` : 'Shoukai'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
