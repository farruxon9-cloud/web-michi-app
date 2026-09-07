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
import { 
  Info, ArrowLeft, Phone, Mail, MapPin, Share2, CheckCircle2, Bookmark, Search, 
  Banknote, Edit3, SlidersHorizontal, X, ChevronDown, RotateCcw,
  Car, GraduationCap, Sparkles, Globe, Truck, Bus, CreditCard, ShieldCheck, 
  Clock, Gift, Users, Award, Shield, Check, Layers, Building2
} from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import CustomMobilePickerModal from './CustomMobilePickerModal';
import { PREFECTURES } from '../data/japanLocationDB';
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
    name: "Koyama Driving School (Futako-Tamagawa)",
    type: "大型・普通・中型・二輪",
    discount: "¥20,000",
    shoukai: "¥10,000",
    image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Tokyo, Futako-Tamagawa",
    prefecture: "Tokyo",
    fullAddress: "〒158-0094 Tokyo, Setagaya City, Tamagawa 3-1-1",
    description: "Yaponiyadagi eng zamonaviy avtomaktablardan biri. Barcha turdagi litsenziyalar mavjud. Chet elliklar uchun ingliz va o'zbek tilida darslar mavjud.",
    courses: ['Futsu', 'Oogata', 'Chugata', 'Tokushu', 'Forklift', 'Nirin'],
    trainingStyle: ['Tsugaku', 'ShortTerm', 'OnlineTheory'],
    priceValue: 280000,
    price: '¥280,000~',
    phone: '+81 3-1234-5678',
    email: 'info@koyama.jp',
    langs: ['UZ', 'JP', 'EN'],
    features: ['shuttle', 'subsidy', 'installment', 'nightClass', 'femaleInstructor', 'shoukai'],
    shoukaiFee: 10000
  },
  {
    id: 2,
    name: "Saitama Automobile School (Omiya)",
    type: "全車種対応・合宿免許完備",
    discount: "¥15,000",
    shoukai: "¥5,000",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Saitama, Omiya",
    prefecture: "Saitama",
    fullAddress: "〒330-0854 Saitama, Omiya-ku, Sakuragicho 2-1",
    description: "Saitama markazidagi yirik o'quv maydoniga ega avtomaktab. Yotoqxona va bepul ovqatlanish paketlari bor.",
    courses: ['Futsu', 'Oogata', 'Chugata', 'JunChugata', 'OogataNishu'],
    trainingStyle: ['Gashuku', 'Tsugaku', 'ShortTerm'],
    priceValue: 245000,
    price: '¥245,000~',
    phone: '+81 48-555-1234',
    email: 'info@saitama-auto.jp',
    langs: ['UZ', 'JP'],
    features: ['dormitory', 'shuttle', 'installment', 'shoukai'],
    shoukaiFee: 5000
  },
  {
    id: 3,
    name: "Chiba Driving Center (Matsudo)",
    type: "大型トラック・フォークリフト専門",
    discount: "¥10,000",
    shoukai: "0",
    image: "https://images.unsplash.com/photo-1541888062837-7b247f082e05?auto=format&fit=crop&q=80&w=800",
    verified: false,
    location: "Chiba, Matsudo",
    prefecture: "Chiba",
    fullAddress: "〒270-2253 Chiba, Matsudo, Tokiwadaira 3-2-1",
    description: "Faqat yuk mashinalari va maxsus texnikalar (Ekskavator, Forklift) litsenziyalari o'rgatiladi. Davlat subsidiyasi mavjud.",
    courses: ['Oogata', 'Forklift', 'Tokushu', 'JunChugata'],
    trainingStyle: ['Tsugaku', 'ShortTerm'],
    priceValue: 198000,
    price: '¥198,000~',
    phone: '+81 47-333-9876',
    email: 'contact@chiba-drive.jp',
    langs: ['JP'],
    features: ['subsidy', 'nightClass', 'installment'],
    shoukaiFee: 0
  },
  {
    id: 4,
    name: "Yokohama Driving College",
    type: "普通車・自動二輪・女性専用コース",
    discount: "¥5,000",
    shoukai: "¥3,000",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Kanagawa, Yokohama",
    prefecture: "Kanagawa",
    fullAddress: "〒231-0023 Kanagawa, Yokohama, Naka-ku 4-12",
    description: "Chiroyli dengiz manzarasi. Tajribali ayol ustozlar va bolalar parvarish xonasi. Rus va O'zbek tillarida tarjimonlar mavjud.",
    courses: ['Futsu', 'Nirin'],
    trainingStyle: ['Tsugaku', 'OnlineTheory'],
    priceValue: 310000,
    price: '¥310,000~',
    phone: '+81 45-222-3456',
    email: 'info@yokohama-dc.jp',
    langs: ['UZ', 'JP', 'RU', 'EN'],
    features: ['femaleInstructor', 'kidsRoom', 'shuttle', 'shoukai'],
    shoukaiFee: 3000
  },
  {
    id: 5,
    name: "Osaka Central Auto Driving Academy",
    type: "全車種・合宿短期集中パック",
    discount: "¥30,000",
    shoukai: "¥15,000",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c28ea?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Osaka, Namba",
    prefecture: "Osaka",
    fullAddress: "〒542-0076 Osaka, Chuo Ward, Namba 1-1",
    description: "Kansai hududidagi eng mashhur avtomaktab. Qisqa muddatda Gashuku (yashab o'qish) va kredit bo'lib to'lash imkoniyati.",
    courses: ['Futsu', 'Oogata', 'Chugata', 'FutsuNishu', 'Nirin'],
    trainingStyle: ['Gashuku', 'ShortTerm', 'Tsugaku'],
    priceValue: 330000,
    price: '¥330,000~',
    phone: '+81 6-7777-8888',
    email: 'info@osaka-central.jp',
    langs: ['UZ', 'JP', 'EN'],
    features: ['dormitory', 'installment', 'shuttle', 'shoukai'],
    shoukaiFee: 15000
  },
  {
    id: 6,
    name: "Nagoya West Driving School",
    type: "準中型・大型二種・教育訓練給付",
    discount: "¥18,000",
    shoukai: "¥8,000",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
    verified: true,
    location: "Aichi, Nagoya",
    prefecture: "Aichi",
    fullAddress: "〒453-0015 Aichi, Nagoya, Nakamura-ku 5-8",
    description: "Chubu mintaqasidagi haydovchilik akademiyasi. Avtobus (Nishu) va yuk mashinalari litsenziyasiga davlat subsidiyasi 20% gacha qaytariladi.",
    courses: ['JunChugata', 'OogataNishu', 'FutsuNishu', 'Oogata'],
    trainingStyle: ['Tsugaku', 'OnlineTheory'],
    priceValue: 290000,
    price: '¥290,000~',
    phone: '+81 52-444-5566',
    email: 'info@nagoya-west.jp',
    langs: ['JP', 'EN', 'ZH'],
    features: ['subsidy', 'nightClass', 'shuttle', 'shoukai'],
    shoukaiFee: 8000
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

  // Filter States
  const [selectedPrefecture, setSelectedPrefecture] = useState('all');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [activeFilterTab, setActiveFilterTab] = useState('course');
  const [isPrefPickerOpen, setIsPrefPickerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Accordion open/close states (default false per Rule 20)
  const [isLocationSectionOpen, setIsLocationSectionOpen] = useState(false);
  const [isCourseSectionOpen, setIsCourseSectionOpen] = useState(false);
  const [isStyleSectionOpen, setIsStyleSectionOpen] = useState(false);
  const [isLangSectionOpen, setIsLangSectionOpen] = useState(false);
  const [isPriceSectionOpen, setIsPriceSectionOpen] = useState(false);
  const [isFeatureSectionOpen, setIsFeatureSectionOpen] = useState(false);

  const hasActiveFilters = selectedPrefecture !== 'all' || 
    selectedCourses.length > 0 || 
    selectedStyles.length > 0 || 
    selectedLang !== 'all' || 
    selectedPriceRange !== 'all' || 
    selectedFeatures.length > 0 || 
    (searchQuery && searchQuery.length > 0);

  const resetFilters = () => {
    setSelectedPrefecture('all');
    setSelectedCourses([]);
    setSelectedStyles([]);
    setSelectedLang('all');
    setSelectedPriceRange('all');
    setSelectedFeatures([]);
    if (setSearchQuery) setSearchQuery('');
  };

  // Reset pagination when search query or filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, selectedPrefecture, selectedCourses, selectedStyles, selectedLang, selectedPriceRange, selectedFeatures]);


  // Filtrlash: qidiruv, kurs, uslub, prefektura, til, narx va imkoniyatlar bo'yicha
  const filteredSchools = schools.filter(school => {
    const query = (searchQuery || '').toLowerCase();
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

    const matchesCourse = selectedCourses.length === 0 || 
      selectedCourses.some(c => (school.courses || []).includes(c) || (school.type || '').includes(c));

    const matchesStyle = selectedStyles.length === 0 ||
      selectedStyles.some(s => (school.trainingStyle || []).includes(s));

    const matchesPrefecture = selectedPrefecture === 'all' ||
      (school.prefecture && school.prefecture.toLowerCase() === selectedPrefecture.toLowerCase()) ||
      (school.location && school.location.toLowerCase().includes(selectedPrefecture.toLowerCase())) ||
      (school.fullAddress && school.fullAddress.toLowerCase().includes(selectedPrefecture.toLowerCase()));

    const matchesLang = selectedLang === 'all' ||
      (school.langs && school.langs.includes(selectedLang));

    const price = school.priceValue || 250000;
    let matchesPrice = true;
    if (selectedPriceRange === 'under250k') matchesPrice = price <= 250000;
    else if (selectedPriceRange === '250k_300k') matchesPrice = price > 250000 && price <= 300000;
    else if (selectedPriceRange === '300k_350k') matchesPrice = price > 300000 && price <= 350000;
    else if (selectedPriceRange === 'over350k') matchesPrice = price > 350000;

    const matchesFeatures = selectedFeatures.length === 0 ||
      selectedFeatures.every(f => f === 'shoukai' ? school.shoukaiFee > 0 : (school.features || []).includes(f));

    return matchesSearch && matchesCourse && matchesStyle && matchesPrefecture && matchesLang && matchesPrice && matchesFeatures;
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
     Townwork uslubidagi boyitilgan avtomaktablar filtri sahifasi.
     ======================================================================== */
  if (isFilterOpen) {
    const courseOptions = [
      { id: 'Futsu', icon: <Car size={15} />, name: t('lic_futsu', '普通自動車 (Futsu)') },
      { id: 'Oogata', icon: <Truck size={15} />, name: t('lic_oogata', '大型自動車 (Oogata)') },
      { id: 'Chugata', icon: <Truck size={15} />, name: t('lic_chugata', '中型自動車 (Chugata)') },
      { id: 'JunChugata', icon: <Truck size={15} />, name: t('lic_junchugata', '準中型自動車 (Jun-Chugata)') },
      { id: 'FutsuNishu', icon: <Car size={15} />, name: t('lic_futsunishu', '普通二種 (Taksi)') },
      { id: 'OogataNishu', icon: <Bus size={15} />, name: t('lic_oogatanishu', '大型二種 (Avtobus)') },
      { id: 'Forklift', icon: <Layers size={15} />, name: t('lic_forklift', 'フォークリフト (Forklift)') },
      { id: 'Tokushu', icon: <Award size={15} />, name: t('lic_tokushu', '大型特殊 (Tokushu)') },
      { id: 'Nirin', icon: <Car size={15} />, name: t('lic_nirin', '自動二輪車 (Nirin)') }
    ];

    const styleOptions = [
      { id: 'Tsugaku', icon: <Building2 size={15} />, name: t('style_tsugaku', '通学コース (Qatnab o\'qish)') },
      { id: 'Gashuku', icon: <GraduationCap size={15} />, name: t('style_gashuku', '合宿免許 (Yashab/Lagerda o\'qish)') },
      { id: 'ShortTerm', icon: <Clock size={15} />, name: t('style_shortterm', '短期集中コース (Tezlashtirilgan)') },
      { id: 'OnlineTheory', icon: <Globe size={15} />, name: t('style_onlinetheory', 'オンライン学科対応 (Masofaviy nazariya)') }
    ];

    const featureOptions = [
      { id: 'shuttle', icon: <Bus size={15} />, name: t('feat_shuttle', '無料送迎バスあり (Free Shuttle)') },
      { id: 'dormitory', icon: <GraduationCap size={15} />, name: t('feat_dormitory', '宿舎・食事付き (Dormitory/Meals)') },
      { id: 'subsidy', icon: <ShieldCheck size={15} />, name: t('feat_subsidy', '教育訓練給付金対象 (Govt Subsidy)') },
      { id: 'installment', icon: <CreditCard size={15} />, name: t('feat_installment', 'ローン・分割払いOK (Installment)') },
      { id: 'nightClass', icon: <Clock size={15} />, name: t('feat_nightclass', 'ナイター教習対応 (Night Classes)') },
      { id: 'femaleInstructor', icon: <Users size={15} />, name: t('feat_female', '女性指導員在籍 (Female Instructors)') },
      { id: 'kidsRoom', icon: <Users size={15} />, name: t('feat_kidsroom', '託児所・キッズルーム (Kids Room)') },
      { id: 'shoukai', icon: <Gift size={15} />, name: t('feat_shoukai', '紹介手当・キャッシュバック (Referral Bonus)') }
    ];

    const toggleMultiSelect = (setter, list, item) => {
      if (list.includes(item)) {
        setter(list.filter(i => i !== item));
      } else {
        setter([...list, item]);
      }
    };

    return (
      <div className="feed-container fade-in hide-scrollbar" style={{ flex: 1, height: '100%', maxHeight: '100%', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '16px 14px 160px 14px', boxSizing: 'border-box', position: 'relative' }}>
        
        {/* ONLY Pinned Sticky Back Button (Stays sticky at top: 0, z-index: 300) */}
        <div style={{
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 300,
          pointerEvents: 'none',
          marginBottom: '-40px',
          display: 'flex',
          alignItems: 'center',
          height: '40px',
          width: '40px'
        }}>
          <button 
            type="button" 
            onClick={() => setIsFilterOpen(false)}
            style={{
              pointerEvents: 'auto',
              width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--glass-border)',
              background: 'var(--card-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)', transition: 'transform 0.15s ease', flexShrink: 0
            }}
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* Scrollable Header Title Row (Title & Reset scroll away naturally) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          minHeight: '40px',
          marginBottom: '16px',
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: '900',
            color: 'var(--text-main)',
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap'
          }}>
            {t('schoolFilters', '自動車学校の絞り込み')}
          </h3>

          <button 
            type="button" 
            onClick={resetFilters}
            style={{
              pointerEvents: 'auto',
              position: 'absolute',
              right: 0,
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(10, 132, 255, 0.08)', border: 'none',
              color: 'var(--primary)', fontWeight: '700', fontSize: '12.5px',
              padding: '6px 12px', borderRadius: '14px', cursor: 'pointer',
              transition: 'all 0.15s ease', flexShrink: 0
            }}
          >
            <RotateCcw size={12} color="var(--primary)" />
            <span>{t('clearAll', 'リセット')}</span>
          </button>
        </div>

        {/* Townwork Signature 3-Tab Header Invariant */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          {[
            { id: 'course', icon: <Car size={15} color={activeFilterTab === 'course' ? '#000000' : 'var(--primary)'} />, label: t('coursesTab', '取得可能免許') },
            { id: 'location', icon: <MapPin size={15} color={activeFilterTab === 'location' ? '#000000' : '#0A84FF'} />, label: t('prefectureTab', '都道府県・地域') },
            { id: 'features', icon: <Sparkles size={15} color={activeFilterTab === 'features' ? '#000000' : '#FF2D55'} />, label: t('perksTab', 'こだわり条件') }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveFilterTab(tab.id);
                if (tab.id === 'course') setIsCourseSectionOpen(true);
                if (tab.id === 'location') setIsLocationSectionOpen(true);
                if (tab.id === 'features') setIsFeatureSectionOpen(true);
              }}
              style={{
                flex: 1, padding: '10px 8px', borderRadius: '14px', border: 'none',
                background: activeFilterTab === tab.id ? '#FFCC00' : 'var(--card-bg)',
                color: activeFilterTab === tab.id ? '#000000' : 'var(--text-secondary)',
                fontWeight: activeFilterTab === tab.id ? '800' : '600', fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                boxShadow: activeFilterTab === tab.id ? '0 4px 14px rgba(255, 204, 0, 0.35)' : 'none',
                cursor: 'pointer', transition: 'all 0.15s ease'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Sections Sequence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* SECTION 1: Prefektura va Joylashuv (都道府県・市区町村から探す) */}
          <div className="job-category-section" style={{
            background: 'var(--card-bg)', borderRadius: '20px', padding: '16px',
            border: '1px solid var(--glass-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <button
              type="button"
              onClick={() => setIsLocationSectionOpen(!isLocationSectionOpen)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: '#0A84FF15',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <MapPin size={18} color="#0A84FF" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {t('prefectureHeader', '都道府県・市区町村から探す')}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedPrefecture === 'all' ? t('allLocations', 'すべての地域') : selectedPrefecture}
                  </p>
                </div>
              </div>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: isLocationSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
              }}>
                <ChevronDown size={16} color="var(--text-secondary)" />
              </div>
            </button>

            {isLocationSectionOpen && (
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsPrefPickerOpen(true)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '14px',
                    border: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
                    color: 'var(--text-main)', fontSize: '14px', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="#0A84FF" />
                    <span>{selectedPrefecture === 'all' ? t('selectPrefecture', '都道府県を選択') : selectedPrefecture}</span>
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800' }}>{t('change', '変更')} →</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: Litsenziya toifalari / Kurslar (取得希望の免許・コース) */}
          <div className="job-category-section" style={{
            background: 'var(--card-bg)', borderRadius: '20px', padding: '16px',
            border: '1px solid var(--glass-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <button
              type="button"
              onClick={() => setIsCourseSectionOpen(!isCourseSectionOpen)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: '#34C75915',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Car size={18} color="#34C759" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {t('coursesOfferedHeader', '取得希望の免許・コース')}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedCourses.length === 0 ? t('allCourses', 'すべてのコース') : `${selectedCourses.length} ${t('selected', '件選択中')}`}
                  </p>
                </div>
              </div>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: isCourseSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
              }}>
                <ChevronDown size={16} color="var(--text-secondary)" />
              </div>
            </button>

            {isCourseSectionOpen && (
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {courseOptions.map(c => {
                  const isSelected = selectedCourses.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleMultiSelect(setSelectedCourses, selectedCourses, c.id)}
                      style={{
                        padding: '8px 12px', borderRadius: '12px', border: isSelected ? '1px solid #0A84FF' : '1px solid var(--glass-border)',
                        background: isSelected ? 'rgba(10, 132, 255, 0.12)' : 'var(--glass-bg)',
                        color: isSelected ? '#0A84FF' : 'var(--text-main)',
                        fontWeight: isSelected ? '800' : '600', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                    >
                      {c.icon}
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: O'quv uslubi (教習スタイル・受講形態) */}
          <div className="job-category-section" style={{
            background: 'var(--card-bg)', borderRadius: '20px', padding: '16px',
            border: '1px solid var(--glass-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <button
              type="button"
              onClick={() => setIsStyleSectionOpen(!isStyleSectionOpen)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: '#FF950015',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <GraduationCap size={18} color="#FF9500" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {t('trainingStyleHeader', '教習スタイル・受講形態')}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedStyles.length === 0 ? t('allStyles', 'すべての受講形態') : `${selectedStyles.length} ${t('selected', '件選択中')}`}
                  </p>
                </div>
              </div>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: isStyleSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
              }}>
                <ChevronDown size={16} color="var(--text-secondary)" />
              </div>
            </button>

            {isStyleSectionOpen && (
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {styleOptions.map(s => {
                  const isSelected = selectedStyles.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleMultiSelect(setSelectedStyles, selectedStyles, s.id)}
                      style={{
                        padding: '8px 12px', borderRadius: '12px', border: isSelected ? '1px solid #FF9500' : '1px solid var(--glass-border)',
                        background: isSelected ? 'rgba(255, 149, 0, 0.12)' : 'var(--glass-bg)',
                        color: isSelected ? '#FF9500' : 'var(--text-main)',
                        fontWeight: isSelected ? '800' : '600', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                    >
                      {s.icon}
                      <span>{s.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 4: Dars tillari (授業言語・通訳サポート) */}
          <div className="job-category-section" style={{
            background: 'var(--card-bg)', borderRadius: '20px', padding: '16px',
            border: '1px solid var(--glass-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <button
              type="button"
              onClick={() => setIsLangSectionOpen(!isLangSectionOpen)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: '#AF52DE15',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Globe size={18} color="#AF52DE" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {t('languageHeader', '授業言語・通訳サポート')}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedLang === 'all' ? t('allLanguages', 'すべての言語') : selectedLang}
                  </p>
                </div>
              </div>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: isLangSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
              }}>
                <ChevronDown size={16} color="var(--text-secondary)" />
              </div>
            </button>

            {isLangSectionOpen && (
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { id: 'all', label: t('allLanguages', 'すべての言語') },
                  { id: 'UZ', label: "O'zbekcha (UZ)" },
                  { id: 'JP', label: 'Yaponcha (JP)' },
                  { id: 'EN', label: 'Inglizcha (EN)' },
                  { id: 'RU', label: 'Ruscha (RU)' }
                ].map(l => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSelectedLang(l.id)}
                    style={{
                      padding: '8px 12px', borderRadius: '12px', border: selectedLang === l.id ? '1px solid #AF52DE' : '1px solid var(--glass-border)',
                      background: selectedLang === l.id ? 'rgba(175, 82, 222, 0.12)' : 'var(--glass-bg)',
                      color: selectedLang === l.id ? '#AF52DE' : 'var(--text-main)',
                      fontWeight: selectedLang === l.id ? '800' : '600', fontSize: '13px',
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: Narxlar diapazoni (受講料・価格帯) */}
          <div className="job-category-section" style={{
            background: 'var(--card-bg)', borderRadius: '20px', padding: '16px',
            border: '1px solid var(--glass-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <button
              type="button"
              onClick={() => setIsPriceSectionOpen(!isPriceSectionOpen)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: '#30D15815',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Banknote size={18} color="#30D158" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {t('priceHeader', '受講料・価格帯')}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedPriceRange === 'all' ? t('allPrices', 'すべての価格帯') : selectedPriceRange}
                  </p>
                </div>
              </div>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: isPriceSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
              }}>
                <ChevronDown size={16} color="var(--text-secondary)" />
              </div>
            </button>

            {isPriceSectionOpen && (
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  { id: 'all', label: t('allPrices', 'すべての価格帯') },
                  { id: 'under250k', label: '~¥250,000' },
                  { id: '250k_300k', label: '¥250,000 ~ ¥300,000' },
                  { id: '300k_350k', label: '¥300,000 ~ ¥350,000' },
                  { id: 'over350k', label: '¥350,000~' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPriceRange(p.id)}
                    style={{
                      padding: '8px 12px', borderRadius: '12px', border: selectedPriceRange === p.id ? '1px solid #30D158' : '1px solid var(--glass-border)',
                      background: selectedPriceRange === p.id ? 'rgba(48, 209, 88, 0.12)' : 'var(--glass-bg)',
                      color: selectedPriceRange === p.id ? '#30D158' : 'var(--text-main)',
                      fontWeight: selectedPriceRange === p.id ? '800' : '600', fontSize: '13px',
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 6: Imkoniyatlar va Imtiyozlar (こだわり条件・特典) */}
          <div className="job-category-section" style={{
            background: 'var(--card-bg)', borderRadius: '20px', padding: '16px',
            border: '1px solid var(--glass-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
          }}>
            <button
              type="button"
              onClick={() => setIsFeatureSectionOpen(!isFeatureSectionOpen)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: '#FF2D5515',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Sparkles size={18} color="#FF2D55" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {t('featuresHeader', 'こだわり条件・特典')}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedFeatures.length === 0 ? t('allFeatures', 'すべてのこだわり条件') : `${selectedFeatures.length} ${t('selected', '件選択中')}`}
                  </p>
                </div>
              </div>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: isFeatureSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
              }}>
                <ChevronDown size={16} color="var(--text-secondary)" />
              </div>
            </button>

            {isFeatureSectionOpen && (
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {featureOptions.map(f => {
                  const isSelected = selectedFeatures.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleMultiSelect(setSelectedFeatures, selectedFeatures, f.id)}
                      style={{
                        padding: '8px 12px', borderRadius: '12px', border: isSelected ? '1px solid #FF2D55' : '1px solid var(--glass-border)',
                        background: isSelected ? 'rgba(255, 45, 85, 0.12)' : 'var(--glass-bg)',
                        color: isSelected ? '#FF2D55' : 'var(--text-main)',
                        fontWeight: isSelected ? '800' : '600', fontSize: '13px',
                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                    >
                      {f.icon}
                      <span>{f.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Pinned Search CTA Button Dock — floating 12px above BottomNav */}
        <div style={{
          position: 'fixed',
          bottom: '96px',
          left: 'var(--screen-margin-x, 14px)',
          width: 'var(--card-width-full, calc(100% - 28px))',
          zIndex: 250,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button 
            type="button" 
            className="townwork-btn-search-cta" 
            onClick={() => setIsFilterOpen(false)}
            style={{
              pointerEvents: 'auto',
              width: '100%', height: '52px', fontSize: '16px', fontWeight: '800',
              borderRadius: '26px', background: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)',
              color: '#FFFFFF', boxShadow: '0 10px 28px rgba(10, 132, 255, 0.45)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0
            }}
          >
            <Search size={19} color="#FFF" />
            <span>{t('searchSchoolCountBtn', '{{count}}件の教習所を検索', { count: filteredSchools.length })}</span>
          </button>
        </div>

        {/* Custom Mobile Prefecture Picker Modal Sheet */}
        {isPrefPickerOpen && (
          <CustomMobilePickerModal
            isOpen={isPrefPickerOpen}
            onClose={() => setIsPrefPickerOpen(false)}
            title={t('selectPrefecture', '都道府県を選択')}
            options={[
              { value: 'all', label: `📍 ${t('allPrefectures', '全ての地域')}` },
              ...PREFECTURES.map(p => ({
                value: p.nameEn,
                label: `${p.name} (${p.nameEn})`
              }))
            ]}
            selectedValue={selectedPrefecture}
            onSelect={(val) => {
              setSelectedPrefecture(val);
              setIsPrefPickerOpen(false);
            }}
          />
        )}
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
