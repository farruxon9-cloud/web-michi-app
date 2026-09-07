/**
 * ==========================================================================
 * DRIVING ACADEMY (AVTOMAKTABLAR BO'LIMI) KOMPONENTI
 * ==========================================================================
 * 
 * Bu komponent avtomaktablar bo'limining barcha UI mantiqini boshqaradi:
 * 
 * 1. RO'YXAT SAHIFASI (List Page):
 *    - Barcha maktablarni kartochka shaklida ko'rsatadi
 *    - Har bir kartochkada: rasm, nom, joylashuv, til badge, narx
 *    - "Topshirish" va "Shoukai" tugmalari pill shaklida
 *    - Kartochkaga bosilganda batafsil sahifa ochiladi
 * 
 * 2. BATAFSIL SAHIFA (Detail Page):
 *    - Tanlangan maktabning to'liq ma'lumotlari
 *    - Kurslar ro'yxati, narx, tavsif, kontakt ma'lumotlari
 *    - Shoukai (tavsiya) bo'limi — faqat shoukaiFee > 0 bo'lganda
 *    - Pastki tugmalar: Qo'ng'iroq, Topshirish, Shoukai (pill shakl)
 * 
 * NAVIGATSIYA MANTIQ:
 *    - selectedSchool holati App.jsx ga ko'tarilgan (lifted state)
 *    - Profil "Saqlanganlar"dan kelganda onBackPress orqali profilga qaytaradi
 *    - Oddiy holatda setSelectedSchool(null) bilan ro'yxatga qaytadi
 * 
 * TUGMALAR DIZAYNI:
 *    - Pill shakl (border-radius: 20px) — squircle emas
 *    - Barcha tugmalar bir xil balandlik (38px)
 *    - Ixcham shrift (12.5px) — turli tillarda sig'ishi uchun
 *    - Bosilganda scale(0.96) micro-animatsiya
 * 
 * STILLAR: DrivingAcademy.css va DriverFeed.css (job-card stillari)
 * ==========================================================================
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Info, ArrowLeft, Phone, Mail, MapPin, Share2, CheckCircle2, Bookmark, Search, Banknote, Edit3, SlidersHorizontal, X } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import CustomInlineDropdown from './CustomInlineDropdown';
import './DrivingAcademy.css';
import './DriverFeed.css'; // job-card stillarini ishlatish uchun import qilinadi


/**
 * ==========================================================================
 * MOCK MA'LUMOTLAR — TEST UCHUN AVTOMAKTABLAR RO'YXATI
 * ==========================================================================
 * 
 * Har bir maktab obyektining tuzilishi:
 * - id:          Noyob identifikator
 * - name:        Maktab nomi
 * - type:        Maktab turi (masalan: "Barcha toifalar")
 * - discount:    A'zolar uchun chegirma summasi
 * - shoukai:     Shoukai mukofoti (matn ko'rinishda)
 * - image:       Unsplash dan olingan rasm URL
 * - verified:    Tasdiqlangan maktab yoki yo'qligi (boolean)
 * - location:    Qisqa joylashuv (Shahar, tuman)
 * - fullAddress: To'liq pochta manzili
 * - description: Maktab haqida tavsif matni
 * - courses:     Taklif qilinadigan kurslar massivi
 * - price:       Boshlang'ich narx
 * - phone:       Telefon raqami
 * - email:       Email manzili
 * - langs:       Dars tillar massivi
 * - shoukaiFee:  Shoukai mukofoti summasi (raqam, 0 bo'lsa shoukai yo'q)
 * ==========================================================================
 */
export const MOCK_SCHOOLS = [
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


/**
 * ==========================================================================
 * ASOSIY KOMPONENT — DrivingAcademy
 * ==========================================================================
 * 
 * PROPS (Tashqaridan olinadigan ma'lumotlar):
 * 
 * @param {boolean} isContractActive     — Kompaniya shartnomasi faolmi (verified badge uchun)
 * @param {function} onApplySchool       — Maktabga ariza topshirish funksiyasi (school, referrerName)
 * @param {Array} schoolApplications     — Topshirilgan arizalar ro'yxati
 * @param {function} onShoukaiPaid       — Shoukai to'lovi tasdiqlash funksiyasi
 * @param {Object} profileData           — Foydalanuvchi profil ma'lumotlari (saqlangan elementlar uchun)
 * @param {function} onShoukai           — Shoukai (tavsiya) funksiyasini boshlash
 * @param {Array} verifiedCompanies      — Tasdiqlangan kompaniyalar ro'yxati
 * @param {function} onToggleSave        — Elementni saqlash/o'chirish funksiyasi
 * @param {string} userRole              — Foydalanuvchi roli ('driver', 'company', 'guest')
 * @param {Object|null} selectedSchool   — Hozir tanlangan maktab (null = ro'yxat ko'rinishi)
 * @param {function} setSelectedSchool   — Maktab tanlash/bekor qilish funksiyasi
 * @param {function|null} onBackPress    — Profilga qaytish funksiyasi (saqlanganlardan kelganda)
 * ==========================================================================
 */
export default function DrivingAcademy({ 
  isContractActive, onApplySchool, schoolApplications = [], onShoukaiPaid, 
  profileData, onShoukai, verifiedCompanies = [], onToggleSave, userRole,
  selectedSchool, setSelectedSchool, onBackPress, schools = MOCK_SCHOOLS, setSchools,
  onEditJob, searchQuery = '', setSearchQuery
}) {
  const { t } = useTranslation();
  
  const getMaskedAddress = (fullAddress) => {
    if (!fullAddress) return '';
    const parts = fullAddress.split(',');
    if (parts.length > 1) {
      return parts[0] + (parts[1] ? ', ' + parts[1] : '') + ` (${t('addressMaskedNotice')})`;
    }
    const words = fullAddress.trim().split(/\s+/);
    if (words.length > 2) {
      return words.slice(0, 3).join(' ') + ` (${t('addressMaskedNotice')})`;
    }
    return fullAddress + ` (${t('addressMaskedNotice')})`;
  };
  
  /**
   * showShoukaiInput — Shoukai input maydoni ko'rinishi holati.
   * true bo'lganda do'st ismini kiritish maydoni ochiladi.
   */
  const [showShoukaiInput, setShowShoukaiInput] = useState(false);
  
  /**
   * referrerName — Shoukai orqali tavsiya qiluvchi shaxsning ismi.
   * Input maydoni to'ldirilgandan keyin onApplySchool ga uzatiladi.
   */
  const [referrerName, setReferrerName] = useState('');

  const [visibleCount, setVisibleCount] = useState(10);

  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedPrefecture, setSelectedPrefecture] = useState('all');
  const [selectedLang, setSelectedLang] = useState('all');
  const [onlyShoukai, setOnlyShoukai] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const hasActiveFilters = selectedCourse !== 'all' || selectedPrefecture !== 'all' || selectedLang !== 'all' || onlyShoukai;

  const resetFilters = () => {
    setSelectedCourse('all');
    setSelectedPrefecture('all');
    setSelectedLang('all');
    setOnlyShoukai(false);
    if (setSearchQuery) setSearchQuery('');
  };

  // Reset pagination when search query or filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, selectedCourse, selectedPrefecture, selectedLang, onlyShoukai]);


  // Filtrlash: qidiruv, toifa, prefektura, til va shoukai bo'yicha
  const filteredSchools = schools.filter(school => {
    const query = searchQuery.toLowerCase();
    const localizedName = t(`school_${school.id}_name`, school.name).toLowerCase();
    const localizedLocation = t(`school_${school.id}_location`, school.location).toLowerCase();
    const localizedType = t(`school_${school.id}_type`, school.type).toLowerCase();
    
    const matchesSearch = !searchQuery || 
      localizedName.includes(query) ||
      school.name.toLowerCase().includes(query) ||
      localizedLocation.includes(query) ||
      school.location.toLowerCase().includes(query) ||
      localizedType.includes(query) ||
      school.type.toLowerCase().includes(query);

    const matchesCourse = selectedCourse === 'all' || 
      (school.courses && school.courses.includes(selectedCourse)) ||
      (school.type && school.type.includes(selectedCourse));

    const matchesPrefecture = selectedPrefecture === 'all' ||
      (school.location && school.location.toLowerCase().includes(selectedPrefecture.toLowerCase())) ||
      (school.fullAddress && school.fullAddress.toLowerCase().includes(selectedPrefecture.toLowerCase()));

    const matchesLang = selectedLang === 'all' ||
      (school.langs && school.langs.includes(selectedLang));

    const matchesShoukai = !onlyShoukai || (school.shoukaiFee > 0);

    return matchesSearch && matchesCourse && matchesPrefecture && matchesLang && matchesShoukai;
  });


  /* ========================================================================
     BATAFSIL SAHIFA (DETAIL VIEW)
     Maktab tanlanganda (selectedSchool !== null) bu qism renderlanadi.
     ======================================================================== */
  if (selectedSchool) {
    const school = selectedSchool;
    
    /**
     * existingApp — Foydalanuvchining ushbu maktabga topshirgan arizasini topadi.
     * isSimulatedReferral — Simulyatsiya tavsiyalarini hisobga olmaydi,
     * faqat foydalanuvchining o'z arizalarini tekshiradi.
     */
    const existingApp = schoolApplications.find(a => a.schoolId === school.id && !a.isSimulatedReferral);
    const hasApplied = !!existingApp;
    
    /** isSaved — Ushbu maktab profilning "Saqlanganlar" bo'limida bormi */
    const isSaved = profileData?.savedItems?.schools?.some(s => s.id === school.id);

    return (
      <div className="academy-container detail-view fade-in">
        <div className="school-detail-scroll hide-scrollbar">
          
          {/* ============================================================
              STICKY HEADER TUGMALARI
              Ortga va Saqlash tugmalari — rasmning ustida doimiy turadi.
              Sticky pozitsiyada, scroll qilinganda ham ko'rinib turadi.
              ============================================================ */}
          <div className="academy-header-actions">
            {/* 
              ORTGA TUGMASI:
              - onBackPress mavjud bo'lsa → Profilga qaytaradi 
                (Profil > Saqlanganlar > Maktab dan kelgan holat)
              - onBackPress yo'q bo'lsa → Ro'yxatga qaytaradi
                (Akademiya tab dan to'g'ridan-to'g'ri ochilgan holat)
            */}
            <button className="icon-btn glass" onClick={() => { 
              if (onBackPress) {
                onBackPress(); // App.jsx dagi handleSchoolBack — profilga qaytish
              } else {
                setSelectedSchool(null); // Shunchaki ro'yxatga qaytish
              }
              setShowShoukaiInput(false); // Shoukai inputni yopish
            }}>
              <ArrowLeft size={20} />
            </button>
            
            {/* SAQLASH TUGMASI — Bookmark ikonka, tanlangan bo'lsa to'ldirilgan */}
            <button className="icon-btn glass" onClick={() => onToggleSave(school, 'schools')}>
              <Bookmark size={20} fill={isSaved ? "var(--primary)" : "none"} color={isSaved ? "var(--primary)" : "currentColor"} />
            </button>
          </div>

          {/* ============================================================
              MAKTAB RASMI
              To'liq kenglikda, yuqori burchakda til badge ko'rsatiladi.
              onError — rasm yuklanmasa zaxira rasm ko'rsatiladi.
              ============================================================ */}
          <div className="school-image-container">
            <img 
              src={school.image} 
              alt={school.name} 
              className="school-image" 
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800"; }}
            />
            <div className="langs-badge glass">{school.langs ? school.langs.join(', ') : 'UZ, JP'}</div>
          </div>

          {/* ============================================================
              MA'LUMOTLAR TANASI (BODY)
              Rasmning ustiga 32px chiqib turadi (overlap effekti).
              Yuqori burchaklar yumaloq — karta ko'rinishi.
              ============================================================ */}
          <div className="school-detail-body">
            
            {/* ------- SARLAVHA: Nom + Verified Badge ------- */}
            <div className="school-header-row" style={{ marginBottom: '4px' }}>
              <h2 className="school-name" style={{ fontSize: '22px' }}>{t(`school_${school.id}_name`, school.name)}</h2>
              {(school.verified || isContractActive) && <VerifiedBadge size={20} />}
            </div>
            
            {/* ------- JOYLASHUV ------- */}
            <p className="school-location" style={{ marginBottom: '20px' }}>
              <MapPin size={14} /> {t(`school_${school.id}_location`, school.location)}
            </p>

            {/* ------- KURSLAR BO'LIMI ------- */}
            <div className="detail-section">
              <h4>{t('courseOffered')}</h4>
              <div className="categories-row">
                {(school.courses || [school.type]).map(course => {
                  const translationKey = course === school.type ? `school_${school.id}_type` : `lic_${course.toLowerCase()}`;
                  return <span key={course} className="category-tag">{t(translationKey, course)}</span>;
                })}
              </div>
            </div>

            {/* ------- NARX BO'LIMI ------- */}
            <div className="detail-section">
              <div className="price-wrap">
                <span className="price-amount" style={{ fontSize: '24px' }}>{school.price || 'Maxsus narx'}</span>
                {school.discount && (
                  <span className="discount-tag">{t('memberDiscount')}</span>
                )}
              </div>
            </div>

            {/* ------- TAVSIF BO'LIMI ------- */}
            <div className="detail-section">
              <h4>{t('schoolDesc')}</h4>
              <p className="school-description">{t(`school_${school.id}_description`, school.description)}</p>
            </div>

            {/* ------- KONTAKT MA'LUMOTLARI ------- 
                Glass squircle kartochka ichida telefon, email, manzil */}
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
                <span>{t('fullAddress')}: {getMaskedAddress(school.fullAddress)}</span>
              </div>
            </div>

            {/* ============================================================
                SHOUKAI (TAVSIYA) BO'LIMI
                Faqat maktab shoukai mukofoti belgilagan bo'lsa ko'rsatiladi.
                shoukaiFee > 0 bo'lganda — do'stni taklif qilish imkoniyati.
                shoukaiFee = 0 bo'lganda — bu qism umuman chiqmaydi.
                ============================================================ */}
            {school.shoukaiFee > 0 && (
              <div className="detail-section shoukai-section glass squircle">
                {/* Shoukai sarlavhasi */}
                <div className="shoukai-header">
                  <Share2 size={18} color="#FF9F0A" />
                  <h4>{t('shoukaiShare', 'Ulashish / Shoukai')}</h4>
                </div>
                <p className="shoukai-desc">{t('shoukaiDesc', "Do'stingizni taklif qiling va mukofot oling")}</p>
                
                {/* Mukofot summasi */}
                <div className="shoukai-amount" style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9F0A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎉 {t('shoukaiAvailable', 'Shoukai puli bor')}</span>
                </div>
                
                <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.15)', padding: '12px', borderRadius: '12px', lineHeight: '1.4' }}>
                  <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>{t('shoukaiConditionsTitle', 'Shoukai shartlari va izohlari')}:</strong>
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {school.shoukaiConditions || t('defaultSchoolShoukaiConditions', 'Sinov/O\'qish boshlash muddatidan so\'ng tavsiya qiluvchiga mukofot to\'lanadi.')}
                  </div>
                </div>

                {/* 
                  SHOUKAI INPUT MAYDONI:
                  Faqat showShoukaiInput = true va ariza topshirilmagan bo'lganda ko'rinadi.
                  Do'st ismini kiritib, "Topshirish + Shoukai" tugmasini bosish mumkin.
                */}
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
                      {userRole === 'company' ? t('recommendEmployee', 'Xodimni tavsiya etish') : `${t('applyToSchool')} + ${t('shoukaiShare')}`}
                    </button>
                  </div>
                )}

                {/* 
                  SHOUKAI TRACKING (KUZATUV):
                  Ariza topshirilgan va referrer ismi bo'lganda ko'rsatiladi.
                  Ikki holat: to'langan (paid) va to'lanmagan (unpaid).
                */}
                {existingApp && existingApp.referrerName && (
                  <div className={`shoukai-track ${existingApp.paid ? 'paid' : 'unpaid'}`}>
                    <div className="shoukai-track-info">
                      <span className="shoukai-referrer">{t('shoukaiBy')}: {existingApp.referrerName}</span>
                      <span className="shoukai-fee">{t('shoukaiAvailable', 'Shoukai puli bor')}</span>
                    </div>
                    {!existingApp.paid ? (
                      /* To'lov tugmasi — admin/kompaniya tomonidan bosiladi */
                      <button 
                        className="shoukai-pay-btn squircle"
                        onClick={() => onShoukaiPaid(existingApp.id)}
                      >
                        {t('shoukaiPaid')}
                      </button>
                    ) : (
                      /* To'langan holat — yashil badge */
                      <div className="shoukai-paid-badge">
                        <CheckCircle2 size={16} /> {t('shoukaiPaid')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

            {/* ============================================================
                PASTKI TUGMALAR PANELI (PILL SHAKL)
                
                3 ta tugma gorizontal bir qatorda:
                📞 Qo'ng'iroq (call-btn)  — yashil, maktabga telefon
                📝 Topshirish (apply-btn) — binafsha, asosiy harakat
                🔗 Shoukai (shoukai-btn)  — sariq, tavsiya qilish
                
                DIZAYN: 
                - Pill shakl (border-radius: 20px)
                - Bir xil balandlik (38px)
                - squircle klassi ISHLATILMAYDI
                - Bosilganda scale(0.96) micro-animatsiya
                ============================================================ */}
            <div className="school-sticky-actions glass">
              {userRole === 'company' ? (
                profileData?.fullName === school.name ? (
                  <button 
                    className="academy-apply-btn"
                    style={{ width: '100%', background: '#1c1c1e', color: '#fff', fontSize: '15px', fontWeight: 'bold', border: 'none', borderRadius: '20px', height: '38px', cursor: 'pointer' }}
                    onClick={() => onEditJob && onEditJob(school)}
                  >
                    <Edit3 size={15} style={{ marginRight: '6px' }} />
                    {t('editJob', 'Tahrirlash')}
                  </button>
                ) : (
                  <>
                    <a 
                      href={`tel:${school.phone || '+819012345678'}`} 
                      className="academy-apply-btn"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', fontWeight: '700' }}
                    >
                      <Phone size={15} /> {t('callSchool', "Qo'ng'iroq")}
                    </a>
                    <button 
                      className="academy-shoukai-btn"
                      onClick={() => onShoukai(school)}
                    >
                      <Share2 size={14} /> {t('shoukai', 'Shoukai')}
                    </button>
                  </>
                )
              ) : (
                <>
                  {!hasApplied ? (
                    <button 
                      className="academy-apply-btn"
                      onClick={() => onApplySchool(school, '')}
                    >
                      {t('applyToSchool', 'Topshirish')}
                    </button>
                  ) : (
                    <button className="academy-apply-btn applied" disabled>
                      <CheckCircle2 size={14} /> {t('appliedToSchool', 'Topshirilgan')}
                    </button>
                  )}
                  <button 
                    className="academy-shoukai-btn"
                    onClick={() => onShoukai(school)}
                  >
                    <Share2 size={14} /> {t('shoukai', 'Shoukai')}
                  </button>
                  <a 
                    href={`tel:${school.phone || '+819012345678'}`} 
                    className="academy-call-btn"
                  >
                    <Phone size={15} /> {t('callSchool', "Qo'ng'iroq")}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
    );
  }


  /* ========================================================================
     FILTR SAHIFASI (INLINE FILTER PAGE VIEW)
     Modal popupsiz, oddiy sahifa ketma-ketligida ko'rinadi.
     ======================================================================== */
  if (isFilterOpen) {
    return (
      <div className="feed-container fade-in hide-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '12px 16px 100px 16px' }}>
        {/* Pinned Back Button Bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 200, padding: '4px 0 8px 0', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
          <button 
            type="button" 
            onClick={() => setIsFilterOpen(false)}
            style={{
              pointerEvents: 'auto',
              width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--glass-border)',
              background: 'var(--card-bg)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
            }}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Unpinned Title & Reset Row (Scrolls naturally) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px 14px 6px', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
            {t('schoolFilters', '自動車学校の絞り込み')}
          </h3>
          <button 
            type="button" 
            onClick={resetFilters}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer' }}
          >
            {t('clearAll', 'リセット')}
          </button>
        </div>

        {/* Form section sequence matching CompanyHome.jsx */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* SECTION 1: Course / License Filter (コース・免許) */}
          <div className="glass squircle-form-card" style={{ padding: '18px 16px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px', display: 'block' }}>
              📚 {t('courseOffered', 'コース・免許')}
            </label>
            <CustomInlineDropdown
              value={selectedCourse}
              onChange={(val) => setSelectedCourse(val)}
              options={[
                { value: 'all', label: t('allCourses', 'すべてのコース') },
                { value: 'Oogata', label: t('lic_oogata', '大型自動車 (Oogata)') },
                { value: 'Chugata', label: t('lic_chugata', '中型自動車 (Chugata)') },
                { value: 'Futsu', label: t('lic_futsu', '普通自動車 (Futsu)') },
                { value: 'Forklift', label: t('lic_forklift', 'フォークリフト (Forklift)') },
                { value: 'Nirin', label: t('lic_nirin', '二輪車 (Nirin)') }
              ]}
              placeholder={t('allCourses', 'すべてのコース')}
            />
          </div>

          {/* SECTION 2: Prefecture Filter (都道府県) */}
          <div className="glass squircle-form-card" style={{ padding: '18px 16px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px', display: 'block' }}>
              📍 {t('prefectureLabel', '都道府県')}
            </label>
            <CustomInlineDropdown
              value={selectedPrefecture}
              onChange={(val) => setSelectedPrefecture(val)}
              options={[
                { value: 'all', label: t('allLocations', 'すべての地域') },
                { value: 'Tokyo', label: 'Tokyo (東京)' },
                { value: 'Saitama', label: 'Saitama (埼玉)' },
                { value: 'Chiba', label: 'Chiba (千葉)' },
                { value: 'Kanagawa', label: 'Kanagawa (神奈川)' },
                { value: 'Osaka', label: 'Osaka (大阪)' }
              ]}
              placeholder={t('selectPrefecture', '都道府県を選択')}
            />
          </div>

          {/* SECTION 3: Instruction Language Filter (授業言語) */}
          <div className="glass squircle-form-card" style={{ padding: '18px 16px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
            <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--primary)', marginBottom: '10px', display: 'block' }}>
              🗣️ {t('languageLabel', '授業言語')}
            </label>
            <CustomInlineDropdown
              value={selectedLang}
              onChange={(val) => setSelectedLang(val)}
              options={[
                { value: 'all', label: t('allLanguages', 'すべての言語') },
                { value: 'UZ', label: "O'zbekcha (UZ)" },
                { value: 'JP', label: 'Yaponcha (JP)' },
                { value: 'EN', label: 'Inglizcha (EN)' },
                { value: 'RU', label: 'Ruscha (RU)' }
              ]}
              placeholder={t('selectLanguage', '言語を選択')}
            />
          </div>

          {/* SECTION 4: Referral Reward Checkbox (紹介手当ありの学校のみ) */}
          <div className="glass squircle-form-card" style={{ padding: '18px 16px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              type="checkbox"
              id="onlyShoukaiCheckPage"
              checked={onlyShoukai}
              onChange={(e) => setOnlyShoukai(e.target.checked)}
              style={{ accentColor: 'var(--primary)', width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label htmlFor="onlyShoukaiCheckPage" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', cursor: 'pointer' }}>
              🎁 {t('onlyShoukaiBonus', '紹介手当ありの学校のみ')}
            </label>
          </div>

          {/* Bottom CTA Search Button */}
          <div style={{ marginTop: '12px' }}>
            <button 
              type="button" 
              className="townwork-btn-search-cta" 
              onClick={() => setIsFilterOpen(false)}
              style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: '800', borderRadius: '16px' }}
            >
              {t('searchCountBtn', '{{count}}件 検索', { count: filteredSchools.length })}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================================
     RO'YXAT SAHIFASI (LIST VIEW)
     Barcha maktablarni kartochkalar shaklida ko'rsatadi.
     DriverFeed.css dagi job-card stillarini qayta ishlatadi.
     ======================================================================== */
  return (
    <div className="feed-container fade-in">
      
      {/* ------- QIDIRUV VA FILTR PANELI ------- */}
      <div className="feed-header glass">
        <div className="search-row">
          <div className="search-bar">
            <Search size={20} color="#8E8E93" />
            <input 
              type="text" 
              placeholder={t('searchSchoolPlaceholder', "Avtomaktab yoki shahar nomi...")} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            type="button"
            className={`filter-toggle-btn ${hasActiveFilters ? 'active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            title={t('schoolFilters', 'Avtomaktab filtrlari')}
          >
            <SlidersHorizontal size={20} />
            {hasActiveFilters && <span className="filter-badge"></span>}
          </button>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="active-filter-chips-row hide-scrollbar" style={{ marginTop: '8px' }}>
            {selectedCourse !== 'all' && (
              <span className="active-chip" onClick={() => setSelectedCourse('all')}>
                📚 {selectedCourse} <X size={12} />
              </span>
            )}
            {selectedPrefecture !== 'all' && (
              <span className="active-chip" onClick={() => setSelectedPrefecture('all')}>
                📍 {selectedPrefecture} <X size={12} />
              </span>
            )}
            {selectedLang !== 'all' && (
              <span className="active-chip" onClick={() => setSelectedLang('all')}>
                🗣️ {selectedLang} <X size={12} />
              </span>
            )}
            {onlyShoukai && (
              <span className="active-chip" onClick={() => setOnlyShoukai(false)}>
                🎁 {t('shoukaiBonusOnly', 'Shoukai mukofotli')} <X size={12} />
              </span>
            )}
            <span className="clear-all-chip" onClick={resetFilters}>
              {t('clearFilters', 'Tozalash')}
            </span>
          </div>
        )}
      </div>

      {/* ------- MAKTABLAR RO'YXATI ------- */}
      <div className="jobs-list hide-scrollbar">
        {filteredSchools.slice(0, visibleCount).map(school => {
          /** showVerified — Maktab tasdiqlangan YOKI shartnoma faol bo'lsa badge ko'rsatiladi */
          const showVerified = school.verified || isContractActive;
          return (
            <div key={school.id} className="job-card-hz glass" onClick={() => setSelectedSchool(school)}>
              <div className="job-card-main-layout">
                {/* ---- Chap qism: Maktab rasmi ---- */}
                <div className="job-card-img">
                  <img 
                    src={school.image} 
                    alt={t(`school_${school.id}_name`, school.name)} 
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800"; }}
                  />
                  {/* Dars tillari belgisi (rasm ustida) */}
                  <div className="job-type-badge type-fulltime">
                    {school.langs ? school.langs.join(', ') : 'UZ, JP'}
                  </div>
                </div>

                {/* ---- O'ng qism: Batafsil ma'lumotlar ---- */}
                <div className="job-card-body">
                  {/* Maktab nomi + Verified badge */}
                  <div className="job-card-company">
                    <span>{t(`school_${school.id}_name`, school.name)}</span>
                    {showVerified && <VerifiedBadge size={14} />}
                  </div>

                  {/* Toifa turi */}
                  <h3 className="job-card-title">{t(`school_${school.id}_type`, school.type)}</h3>

                  {/* Narx — yashil rangda */}
                  <div className="job-card-salary">
                    <Banknote size={15} color="#30D158" />
                    <span>{school.price || 'Maxsus narx'}</span>
                    {school.discount && (
                      <span className="discount-tag" style={{ marginLeft: '4px', fontSize: '9px', padding: '1.5px 4px' }}>
                        -{school.discount}
                      </span>
                    )}
                  </div>

                  {/* Ikonkali chiplar (joylashuv, shoukai) */}
                  <div className="job-card-chips">
                    <span className="job-chip">
                      <MapPin size={10} />
                      {t(`school_${school.id}_location`, school.location)}
                    </span>
                    {school.shoukaiFee > 0 && (
                      <span className="job-chip chip-highlight">
                        <Share2 size={10} />
                        {t('shoukaiAvailable', 'Shoukai puli bor')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Amal tugmalari (job-card-main-layout tashqarisida) */}
              <div className="job-card-actions">
                {userRole === 'company' ? (
                  profileData?.fullName === school.name ? (
                    <button 
                      className="job-card-btn btn-apply"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditJob && onEditJob(school);
                      }}
                      style={{ flex: 1, background: '#1c1c1e', color: '#fff' }}
                    >
                      <Edit3 size={12} />
                      {t('editJob', 'Tahrirlash')}
                    </button>
                  ) : (
                    <button 
                      className="job-card-btn btn-call"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${school.phone || '080-1234-5678'}`;
                      }}
                    >
                      <Phone size={12} />
                      {t('callBtn', 'Qo\'ng\'iroq qilish')}
                    </button>
                  )
                ) : (
                  (() => {
                    const alreadyApplied = (schoolApplications || []).some(a => a.schoolId === school.id && !a.isSimulatedReferral);
                    return alreadyApplied ? (
                      <button 
                        className="job-card-btn btn-apply applied" 
                        disabled
                        onClick={(e) => e.stopPropagation()}
                        style={{ flex: 1, cursor: 'default' }}
                      >
                        <CheckCircle2 size={13} />
                        {t('appliedToSchool', 'Topshirilgan')}
                      </button>
                    ) : (
                      <button 
                        className="job-card-btn btn-apply"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplySchool && onApplySchool(school, '');
                        }}
                      >
                        {t('applyToSchool', 'Topshirish')}
                      </button>
                    );
                  })()
                )}
                <button 
                  className="job-card-btn btn-shoukai"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShoukai(school);
                  }}
                >
                  <Share2 size={12} />
                  {t('shoukai', 'Shoukai')}
                </button>
              </div>
            </div>
          );
        })}

        {visibleCount < filteredSchools.length && (
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
              <span>{t('loadMore', "Ko'proq yuklash")}</span>
            </button>
          </div>
        )}
        {filteredSchools.length === 0 && (
          <div className="empty-feed">
            <Search size={40} color="#C7C7CC" />
            <p>{t('noSchoolsFound', "Mos avtomaktab topilmadi")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
