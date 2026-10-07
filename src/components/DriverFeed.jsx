import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Share2, Clock, Banknote, Shield, Home, Globe, Award, Briefcase, Car, Phone, Edit3, CheckCircle2, SlidersHorizontal, X, ChevronDown, ChevronUp, Check, ArrowLeft, Train, Navigation, Sparkles, RotateCcw, Building2, FileText, Calendar, Target, Star, ShieldCheck } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import VerifiedBadge from './VerifiedBadge';
import CustomMobilePickerModal from './CustomMobilePickerModal';
import NewJobsPill from './NewJobsPill';
import './DriverFeed.css';
import './trust.css';
import { REGIONS, PREFECTURES, CITIES_BY_PREFECTURE, TRAIN_LINES_BY_PREFECTURE, getAllTrainLines, getAllCities } from '../data/japanLocationDB';
import { JOB_CATEGORIES } from '../data/jobCategories';
import { JOB_FEATURES } from '../data/jobFeatures';
import { compareJobs } from '../utils/jobOrdering';
import { hasActiveApplication } from '../utils/applicationMapper';
import { jobValueLabel, isOwnJob } from '../utils/jobPostingNormalizer';
import { isVerifiedListing, listingVerifiedAt } from '../utils/trustHelpers';
import { pickField } from '../utils/localize';

const EMPTY_ARRAY = [];


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
  { value: 1, label: '1km以内', labelUz: '1km radiusda', labelEn: 'Within 1km', labelRu: 'В радиусе 1 км', labelZh: '1公里以内', labelVi: 'Trong vòng 1km', labelNe: '१ किमीभित्र', sublabel: '徒歩15分くらい', sublabelUz: '15 daqiqa piyoda', sublabelEn: '~15 mins walk', sublabelRu: '~15 мин пешком', sublabelZh: '步行约15分钟', sublabelVi: 'Đi bộ ~15 phút', sublabelNe: 'हिँडेर ~१५ मिनेट' },
  { value: 2, label: '2km以内', labelUz: '2km radiusda', labelEn: 'Within 2km', labelRu: 'В радиусе 2 км', labelZh: '2公里以内', labelVi: 'Trong vòng 2km', labelNe: '२ किमीभित्र', sublabel: '徒歩30分くらい', sublabelUz: '30 daqiqa piyoda', sublabelEn: '~30 mins walk', sublabelRu: '~30 мин пешком', sublabelZh: '步行约30分钟', sublabelVi: 'Đi bộ ~30 phút', sublabelNe: 'हिँडेर ~३० मिनेट' },
  { value: 3, label: '3km以内', labelUz: '3km radiusda', labelEn: 'Within 3km', labelRu: 'В радиусе 3 км', labelZh: '3公里以内', labelVi: 'Trong vòng 3km', labelNe: '३ किमीभित्र', sublabel: '車10分くらい', sublabelUz: 'Moshinada 10 daqiqa', sublabelEn: '~10 mins by car', sublabelRu: '~10 мин на машине', sublabelZh: '开车约10分钟', sublabelVi: 'Ô tô ~10 phút', sublabelNe: 'गाडीमा ~१० मिनेट' },
  { value: 5, label: '5km以内', labelUz: '5km radiusda', labelEn: 'Within 5km', labelRu: 'В радиусе 5 км', labelZh: '5公里以内', labelVi: 'Trong vòng 5km', labelNe: '५ किमीभित्र', sublabel: '車15分くらい', sublabelUz: 'Moshinada 15 daqiqa', sublabelEn: '~15 mins by car', sublabelRu: '~15 мин на машине', sublabelZh: '开车约15分钟', sublabelVi: 'Ô tô ~15 phút', sublabelNe: 'गाडीमा ~१५ मिनेट' },
  { value: 7, label: '7km以内', labelUz: '7km radiusda', labelEn: 'Within 7km', labelRu: 'В радиусе 7 км', labelZh: '7公里以内', labelVi: 'Trong vòng 7km', labelNe: '७ किमीभित्र', sublabel: '車20分くらい', sublabelUz: 'Moshinada 20 daqiqa', sublabelEn: '~20 mins by car', sublabelRu: '~20 мин на машине', sublabelZh: '开车约20分钟', sublabelVi: 'Ô tô ~20 phút', sublabelNe: 'गाडीमा ~२० मिनेट' },
  { value: 10, label: '10km以内', labelUz: '10km radiusda', labelEn: 'Within 10km', labelRu: 'В радиусе 10 км', labelZh: '10公里以内', labelVi: 'Trong vòng 10km', labelNe: '१० किमीभित्र', sublabel: '車30分くらい', sublabelUz: 'Moshinada 30 daqiqa', sublabelEn: '~30 mins by car', sublabelRu: '~30 мин на машине', sublabelZh: '开车约30分钟', sublabelVi: 'Ô tô ~30 phút', sublabelNe: 'गाडीमा ~३० मिनेट' },
  { value: 15, label: '15km以内', labelUz: '15km radiusda', labelEn: 'Within 15km', labelRu: 'В радиусе 15 км', labelZh: '15公里以内', labelVi: 'Trong vòng 15km', labelNe: '१५ किमीभित्र', sublabel: '車45分くらい', sublabelUz: 'Moshinada 45 daqiqa', sublabelEn: '~45 mins by car', sublabelRu: '~45 мин на машине', sublabelZh: '开车约45分钟', sublabelVi: 'Ô tô ~45 phút', sublabelNe: 'गाडीमा ~४५ मिनेट' },
  { value: 20, label: '20km以内', labelUz: '20km radiusda', labelEn: 'Within 20km', labelRu: 'В радиусе 20 км', labelZh: '20公里以内', labelVi: 'Trong vòng 20km', labelNe: '२० किमीभित्र', sublabel: '車1時間くらい', sublabelUz: 'Moshinada 1 soat', sublabelEn: '~1 hour by car', sublabelRu: '~1 час на машине', sublabelZh: '开车约1小时', sublabelVi: 'Ô tô ~1 giờ', sublabelNe: 'गाडीमा ~१ घण्टा' }
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
    category: "delivery_driver",
    subcategory: "delivery_local",
    payType: "monthly",
    duration: "long",
    startTime: "8",
    transportPaid: true,
    noExperienceOk: true,
    shoukai: "¥50,000",
    shoukaiAmount: "¥50,000",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800",
    verified: false, // sample data never shows the ⭐ (only server-verified authors do)
    location: "東京都江東区 (Tokyo, Koto-ku)",
    prefecture: "Tokyo",
    city: "東京23区",
    ward: "江東区",
    lat: 35.6329,
    lng: 139.7904,
    fullAddress: "〒135-0063 東京都江東区有明3-1-1 (Tokyo, Koto-ku, Ariake 3-1-1)",
    nearestStation: "東京駅 (Tokyo Station)",
    walkTime: 8,
    hours: "08:00 - 17:00",
    dayOff: "shanba_yakshanba",
    bonus: "bonus_2",
    insurance: "insurance_full",
    foreigners: "foreigners_n3",
    housing: "housing_none",
    license: "lic_futsu",
    description: "Koto-ku bo'ylab kichik posilkalarni mijozlarga yetkazib berish. Kuniga o'rtacha 80-100 ta posilka.",
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
    category: "delivery_driver",
    subcategory: "driver_truck",
    payType: "monthly",
    duration: "long",
    startTime: "9",
    transportPaid: true,
    noExperienceOk: false,
    shoukai: "¥100,000",
    shoukaiAmount: "¥100,000",
    image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800",
    verified: false, // sample data never shows the ⭐ (only server-verified authors do)
    location: "神奈川県横浜市 (Kanagawa, Yokohama)",
    prefecture: "Kanagawa",
    city: "横浜市",
    ward: "中区",
    lat: 35.4437,
    lng: 139.6380,
    fullAddress: "〒231-0023 神奈川県横浜市中区山下町12 (Kanagawa, Yokohama, Naka-ku)",
    nearestStation: "横浜駅 (Yokohama Station)",
    walkTime: 12,
    hours: "shift",
    dayOff: "shift_rotation",
    bonus: "bonus_3",
    insurance: "insurance_full",
    foreigners: "foreigners_visa",
    housing: "housing_dorm",
    license: "lic_kenin",
    description: "Yokohama portidan Kanto hududi bo'ylab dengiz konteynerlarini tashish.",
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
    category: "delivery_driver",
    subcategory: "driver_truck",
    payType: "monthly",
    duration: "long",
    startTime: "20",
    transportPaid: true,
    noExperienceOk: true,
    shoukai: "¥80,000",
    shoukaiAmount: "¥80,000",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
    verified: false, // sample data never shows the ⭐ (only server-verified authors do)
    location: "埼玉県さいたま市 (Saitama, Omiya)",
    prefecture: "Saitama",
    city: "さいたま市",
    ward: "大宮区",
    lat: 35.9064,
    lng: 139.6235,
    fullAddress: "〒330-0854 埼玉県さいたま市大宮区桜木町2-1 (Saitama, Omiya-ku)",
    nearestStation: "大宮駅 (Omiya Station)",
    walkTime: 5,
    hours: "20:00 - 05:00",
    dayOff: "shanba_yakshanba",
    bonus: "bonus_2",
    insurance: "insurance_basic",
    foreigners: "foreigners_visa_renew",
    housing: "housing_half",
    license: "lic_oogata",
    description: "Kanto va Kansai o'rtasida yirik omborlar aro logistika tashish.",
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
    category: "construction",
    subcategory: "construction_general",
    payType: "monthly",
    duration: "long",
    startTime: "7",
    transportPaid: true,
    noExperienceOk: false,
    shoukai: "0",
    shoukaiAmount: "0",
    image: "https://images.unsplash.com/photo-1541888062837-7b247f082e05?auto=format&fit=crop&q=80&w=800",
    verified: false,
    location: "千葉県松戸市 (Chiba, Matsudo)",
    prefecture: "Chiba",
    city: "松戸市",
    ward: "",
    lat: 35.7915,
    lng: 139.9015,
    fullAddress: "〒270-2253 千葉県松戸市常盤平3-2-1 (Chiba, Matsudo)",
    nearestStation: "船橋駅 (Funabashi Station)",
    walkTime: 15,
    hours: "07:00 - 16:00",
    dayOff: "shanba_yakshanba",
    bonus: "bonus_none",
    insurance: "insurance_basic",
    foreigners: "foreigners_n2",
    housing: "housing_none",
    license: "lic_oogata_tokushu",
    description: "Qurilish maydonchalarida maxsus texnika boshqarish.",
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
    category: "warehouse_light",
    subcategory: "tech_forklift",
    payType: "monthly",
    duration: "long",
    startTime: "9",
    transportPaid: true,
    noExperienceOk: true,
    shoukai: "¥30,000",
    shoukaiAmount: "¥30,000",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c28ea?auto=format&fit=crop&q=80&w=800",
    verified: false, // sample data never shows the ⭐ (only server-verified authors do)
    location: "愛知県名古屋市 (Aichi, Nagoya)",
    prefecture: "Aichi",
    city: "名古屋市",
    ward: "中村区",
    lat: 35.1815,
    lng: 136.9066,
    fullAddress: "〒450-0002 愛知県名古屋市中村区名駅1-1-4 (Aichi, Nagoya, Nakamura-ku)",
    nearestStation: "名古屋駅 (Nagoya Station)",
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
  },
  {
    id: 6,
    company: "Sendai Logi Service",
    title: "Sendai Shahri Ombor Saralash Ishchisi",
    salary: "¥1,200 / soatiga",
    type: "parttime",
    category: "warehouse_light",
    subcategory: "packing",
    payType: "hourly",
    duration: "short_1m",
    startTime: "9",
    transportPaid: true,
    noExperienceOk: true,
    shoukai: "¥20,000",
    shoukaiAmount: "¥20,000",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    verified: false, // sample data never shows the ⭐ (only server-verified authors do)
    location: "宮城県仙台市 (Miyagi, Sendai, Aoba-ku)",
    prefecture: "Miyagi",
    city: "仙台市",
    ward: "青葉区",
    lat: 38.2682,
    lng: 140.8694,
    fullAddress: "〒980-0021 宮城県仙台市青葉区中央1-1 (Miyagi, Sendai, Aoba-ku)",
    nearestStation: "仙台駅 (Sendai Station)",
    walkTime: 4,
    hours: "09:00 - 17:00",
    dayOff: "flexible",
    bonus: "bonus_none",
    insurance: "insurance_full",
    foreigners: "foreigners_nolang",
    housing: "housing_none",
    license: "none",
    description: "Sendai bekati yaqinida ombor mahsulotlarini saralash va stiker yopishtirish.",
    logo: "https://ui-avatars.com/api/?name=Sendai+Logi&background=2B2D42&color=fff&size=100",
    phone: "022-111-2222",
    phoneMode: "public",
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
  onJobClick, verifiedCompanies = EMPTY_ARRAY, onShoukai, 
  jobs = MOCK_JOBS, feed, userRole, profileData, onEditJob, onApply, applications = EMPTY_ARRAY,
  searchQuery = '', setSearchQuery, activeSegment = 'all', setActiveSegment,
  selectedLicenses = EMPTY_ARRAY, setSelectedLicenses,
  selectedLangLevel = 'all', setSelectedLangLevel,
  selectedBenefits = EMPTY_ARRAY, setSelectedBenefits,
  minSalary = 0, setMinSalary,
  selectedPrefecture = 'all', setSelectedPrefecture,
  selectedCity = 'all', setSelectedCity,
  stationQuery = '', setStationQuery,
  onlyNearStation = false, setOnlyNearStation,
  isLoading = false
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n?.language || 'uz';
  const ENABLE_MAP_SEARCH = false; // Feature flag: header 📍 map-search button (off: off-design & unreliable, v1.1)
  const ENABLE_JOB_LOCATION_MAP = true; // Job-card location chip opens the map focused on that job
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapFocusJob, setMapFocusJob] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const markersRef = React.useRef([]);
  const sentinelRef = useRef(null);
  // Refs keep the observer stable: `feed` is a new object every render,
  // so depending on it would recreate the observer (and double-fire loadMore).
  const loadMoreRef = useRef(null);
  const hasMoreRef = useRef(false);
  useEffect(() => {
    loadMoreRef.current = feed?.loadMore;
    hasMoreRef.current = Boolean(feed?.hasMore);
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setVisibleCount(prev => prev + 10);
      if (hasMoreRef.current && typeof loadMoreRef.current === 'function') {
        loadMoreRef.current();
      }
    }, { rootMargin: '400px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Townwork-style Location Filter States
  const [locationTab, setLocationTab] = useState('stations'); // 'stations' | 'cities' | 'radius'
  const [selectedRadius, setSelectedRadius] = useState(0); // 0 = off, 1, 2, 3, 5, 7, 10, 15, 20
  const [isPrefPickerOpen, setIsPrefPickerOpen] = useState(false);
  const [expandedLines, setExpandedLines] = useState({ line_tohoku: true, line_senzan: true });
  const [expandedCities, setExpandedCities] = useState({ city_sendai: true });
  const [selectedStations, setSelectedStations] = useState([]);
  const [selectedCitiesList, setSelectedCitiesList] = useState([]);

  // Townwork-style Category & Feature Filter States
  const [selectedJobCategories, setSelectedJobCategories] = useState([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedEmploymentTypes, setSelectedEmploymentTypes] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'salary_high' | 'salary_low'
  // ⭐ "Verified companies only" (client-side: listing.authorVerified → normalized `verified`)
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [expandedJobCats, setExpandedJobCats] = useState({});
  const [isLocationSectionOpen, setIsLocationSectionOpen] = useState(false);
  const [isStationsSectionOpen, setIsStationsSectionOpen] = useState(false);
  const [isRadiusSectionOpen, setIsRadiusSectionOpen] = useState(false);
  const [isJobCatSectionOpen, setIsJobCatSectionOpen] = useState(false);
  const [isFeatureSectionOpen, setIsFeatureSectionOpen] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos && pos.coords) {
            setUserCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          }
        },
        (err) => {
          console.warn('[DriverFeed] Geolocation acquisition skipped/denied:', err?.message || err);
        },
        { timeout: 10000, maximumAge: 600000 }
      );
    }
  }, []);

  // Reset pagination when any filter changes
  useEffect(() => {
    setVisibleCount(10);
  }, [
    searchQuery, activeSegment, selectedLicenses,
    selectedLangLevel, selectedBenefits, minSalary,
    selectedPrefecture, selectedCity, stationQuery, onlyNearStation,
    locationTab, selectedRadius, selectedStations, selectedCitiesList,
    selectedJobCategories, selectedEmploymentTypes, selectedDurations,
    selectedTimeSlots, selectedFeatures, sortBy, verifiedOnly
  ]);

  const showLoading = isLoading || (feed?.status === "loading" && (jobs || []).length === 0);


  const getSalaryNumber = (salaryStr) => {
    if (!salaryStr) return 0;
    const num = parseInt(String(salaryStr).replace(/[^0-9]/g, ''), 10);
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
    || selectedCitiesList.length > 0
    || selectedJobCategories.length > 0
    || selectedSubcategories.length > 0
    || selectedEmploymentTypes.length > 0
    || selectedDurations.length > 0
    || selectedTimeSlots.length > 0
    || selectedFeatures.length > 0;

  const handleResetFilters = () => {
    setSelectedLicenses?.([]);
    setSelectedLangLevel?.('all');
    setSelectedBenefits?.([]);
    setMinSalary?.(0);
    setSelectedPrefecture?.('all');
    setSelectedCity?.('all');
    setStationQuery?.('');
    setOnlyNearStation?.(false);
    setLocationTab?.('stations');
    setSelectedRadius?.(0);
    setSelectedStations?.([]);
    setSelectedCitiesList?.([]);
    setSelectedJobCategories?.([]);
    setSelectedSubcategories?.([]);
    setSelectedEmploymentTypes?.([]);
    setSelectedDurations?.([]);
    setSelectedTimeSlots?.([]);
    setSelectedFeatures?.([]);
    setIsLocationSectionOpen(false);
    setIsStationsSectionOpen(false);
    setIsRadiusSectionOpen(false);
    setIsJobCatSectionOpen(false);
    setIsFeatureSectionOpen(false);
  };

  // Single source of truth: the shared feed from useJobFeed (App.jsx).
  // Filters below run client-side so every device shows the same order.
  const activeJobsList = jobs || EMPTY_ARRAY;

  // Filtrlash: segment, qidiruv va yangi filtrlar bo'yicha
  const filteredJobs = useMemo(() => {
    return (activeJobsList || []).filter(job => {

      if (!job) return false;
      if (verifiedOnly && !isVerifiedListing(job)) return false;

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
        if (benefit === 'housing') return job.housing && job.housing !== 'housing_none' && job.housing !== 'hou_none' && job.housing !== "Yo'q" && job.housing !== 'none' && !job.housing.includes('Yo\'q');
        if (benefit === 'foreigner') return job.foreigners && job.foreigners !== 'foreigners_none';
        if (benefit === 'bonus') return job.bonus && job.bonus !== 'bonus_none' && !job.bonus.includes('なし') && !job.bonus.includes('Yo\'q') && !job.bonus.includes('No Bonus');
        if (benefit === 'insurance') return job.insurance && job.insurance.startsWith('insurance_') && job.insurance !== 'insurance_none';
        if (benefit === 'international') return job.isInternational === true;
        if (benefit === 'signon_bonus') return (job.hasShoukai === true || job.hasShoukai === 'yes' || Number(job.shoukaiFee) > 0 || (job.shoukai && job.shoukai !== '0' && job.shoukai !== 'Yo\'q'));
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
        (job.detailAddress && job.detailAddress.toLowerCase().includes(citySq)) ||
        (job.city && job.city.toLowerCase().includes(citySq)) ||
        (job.ward && job.ward.toLowerCase().includes(citySq));

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
        const cClean = c.replace(/(区|市)$/g, '').toLowerCase();
        return (job.location && job.location.toLowerCase().includes(cClean)) ||
               (job.fullAddress && job.fullAddress.toLowerCase().includes(cClean)) ||
               (job.city && job.city.toLowerCase().includes(cClean)) ||
               (job.ward && job.ward.toLowerCase().includes(cClean));
      });

      // 10. Job Category & Subcategory Filter
      const matchJobCategory = (!selectedJobCategories || selectedJobCategories.length === 0 || selectedJobCategories.some(catId => job.category === catId || job.subcategory === catId))
        && (!selectedSubcategories || selectedSubcategories.length === 0 || selectedSubcategories.some(subId => job.subcategory === subId || job.category === subId));

      // 11. Employment Type Filter
      const matchEmploymentType = !selectedEmploymentTypes || selectedEmploymentTypes.length === 0 || selectedEmploymentTypes.includes(job.type);

      // 12. Duration Filter
      const matchDuration = !selectedDurations || selectedDurations.length === 0 || selectedDurations.some(d => {
        if (d === 'long') return job.duration === 'long' || !job.duration;
        if (d === 'short_1w') return job.duration === 'short_1w';
        if (d === 'short_1m') return job.duration === 'short_1m';
        if (d === 'single_day') return job.duration === 'single_day';
        return true;
      });

      // 13. Time Slot Filter
      const matchTimeSlot = !selectedTimeSlots || selectedTimeSlots.length === 0 || selectedTimeSlots.some(ts => {
        const st = parseInt(job.startTime || '8', 10);
        if (ts === 'morning') return st >= 6 && st < 9;
        if (ts === 'daytime') return st >= 9 && st < 18;
        if (ts === 'evening') return st >= 16 && st < 20;
        if (ts === 'night') return st >= 20 && st < 24;
        if (ts === 'midnight') return st >= 0 && st < 6;
        return true;
      });

      // 14. Special Features Filter
      const matchFeatures = !selectedFeatures || selectedFeatures.length === 0 || selectedFeatures.every(f => {
        if (f === 'foreigner_welcome') return job.foreigners && job.foreigners !== 'foreigners_none';
        if (f === 'no_experience') return job.noExperienceOk === true || job.experienceRequired === false;
        if (f === 'daily_pay') return job.payType === 'daily';
        if (f === 'weekly_pay') return job.payType === 'weekly';
        if (f === 'transport_paid') return job.transportPaid === true;
        if (f === 'dormitory') return job.housing && job.housing !== 'housing_none' && job.housing !== 'hou_none' && job.housing !== "Yo'q" && job.housing !== 'none' && !job.housing.includes('Yo\'q');
        if (f === 'insurance') return job.insurance && job.insurance.startsWith('insurance_') && job.insurance !== 'insurance_none';
        if (f === 'tokutei_ginou') return job.isInternational === true;
        if (f === 'visa_support') return job.foreigners === 'foreigners_visa' || job.foreigners === 'foreigners_visa_renew';
        if (f === 'promotion') return job.bonus && job.bonus !== 'bonus_none';
        if (f === 'signon_bonus') return (job.hasShoukai === true || job.hasShoukai === 'yes' || Number(job.shoukaiFee) > 0 || (job.shoukai && job.shoukai !== '0' && job.shoukai !== 'Yo\'q'));
        if (f === 'shift_day') return job.hours === 'day' || job.hours === 'daytime' || (job.description && job.description.includes('日勤'));
        if (f === 'shift_night') return job.hours === 'night' || job.hours === 'midnight' || (job.description && (job.description.includes('夜勤') || job.description.includes('深夜')));
        if (f === 'shift_rotation') return job.hours === 'shift' || (job.description && job.description.includes('シフト'));
        if (f === 'off_2days_full') return job.dayOff?.includes('2') || (job.description && job.description.includes('完全週休2日'));
        if (f === 'off_paid') return job.hasPaidLeave === true || (job.description && job.description.includes('有給'));
        if (f === 'truck_at') return job.truckType?.includes('AT') || (job.description && job.description.includes('AT'));
        if (f === 'truck_etc_navi') return job.hasNavi === true || (job.description && (job.description.includes('カーナビ') || job.description.includes('ETC')));
        if (f === 'truck_camera') return job.hasCamera === true || (job.description && (job.description.includes('バックカメラ') || job.description.includes('ドラレコ')));
        if (f === 'truck_dedicated') return job.dedicatedTruck === true || (job.description && job.description.includes('専用車'));
        if (f === 'load_pallet') return job.loadingMethod === 'pallet' || (job.description && job.description.includes('パレット'));
        if (f === 'load_forklift') return job.loadingMethod === 'forklift' || (job.description && job.description.includes('フォークリフト'));
        if (f === 'load_hand') return job.loadingMethod === 'hand' || (job.description && job.description.includes('手積み'));
        if (f === 'highway_ok') return job.highwayOk === true || (job.description && job.description.includes('高速'));
        return true;
      });

      // 15. GPS Radius Distance Filter (Haversine formula)
      const matchRadius = !selectedRadius || selectedRadius === 0 || (() => {
        if (!job.lat || !job.lng) return true;
        const refLat = userCoords?.lat || 35.6812; // Dynamic user GPS coordinate with Tokyo center fallback
        const refLng = userCoords?.lng || 139.7671;
        const dLat = (job.lat - refLat) * (Math.PI / 180);
        const dLon = (job.lng - refLng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(refLat * (Math.PI / 180)) * Math.cos(job.lat * (Math.PI / 180)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distKm = 6371 * c;
        return distKm <= selectedRadius;
      })();

      return matchSegment && matchSearch && matchLicense && matchLang && 
             matchBenefits && matchSalary && matchPrefecture && matchCity && 
             matchStation && matchWalkTime && matchSelectedStations && 
             matchSelectedCitiesList && matchJobCategory && matchEmploymentType && 
             matchDuration && matchTimeSlot && matchFeatures && matchRadius;
    }).sort((a, b) => {
      if (sortBy === 'salary_high') return getSalaryNumber(b.salary) - getSalaryNumber(a.salary);
      if (sortBy === 'salary_low') return getSalaryNumber(a.salary) - getSalaryNumber(b.salary);
      return compareJobs(a, b);
    });
  }, [
    activeJobsList, activeSegment, searchQuery, selectedLicenses, selectedLangLevel,
    selectedBenefits, minSalary, selectedPrefecture, selectedCity,
    stationQuery, onlyNearStation, selectedStations, selectedCitiesList,
    selectedJobCategories, selectedSubcategories, selectedEmploymentTypes,
    selectedDurations, selectedTimeSlots, selectedFeatures, selectedRadius, sortBy, userCoords, verifiedOnly
  ]);

  const getJobCategoryLabel = (catId) => {
    for (const cat of JOB_CATEGORIES) {
      if (cat.id === catId) {
        return pickField(cat, 'name', currentLang);
      }
      for (const sub of cat.subcategories) {
        if (sub.id === catId) {
          return pickField(sub, 'name', currentLang);
        }
      }
    }
    return catId;
  };

  const getEmploymentLabel = (empId) => {
    const item = JOB_FEATURES.employment.options.find(opt => opt.id === empId);
    if (!item) return empId;
    return pickField(item, 'name', currentLang);
  };

  const getDurationLabel = (durId) => {
    const item = JOB_FEATURES.duration?.options?.find(opt => opt.id === durId);
    if (!item) return durId;
    return pickField(item, 'name', currentLang);
  };

  const getTimeSlotLabel = (tsId) => {
    const item = JOB_FEATURES.timeSlot?.options?.find(opt => opt.id === tsId);
    if (!item) return tsId;
    return pickField(item, 'name', currentLang);
  };

  const getFeatureLabel = (fId) => {
    for (const groupKey of Object.keys(JOB_FEATURES)) {
      const options = JOB_FEATURES[groupKey]?.options;
      if (Array.isArray(options)) {
        const item = options.find(opt => opt.id === fId);
        if (item) {
          return pickField(item, 'name', currentLang);
        }
      }
    }
    return fId;
  };

  if (isFilterDrawerOpen) {
    return (
      <div className="feed-container fade-in hide-scrollbar" style={{ flex: 1, height: '100%', maxHeight: '100%', minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '6px 14px 0 14px', boxSizing: 'border-box', position: 'relative' }}>
        
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
            onClick={() => setIsFilterDrawerOpen(false)}
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
          marginBottom: '4px',
          boxSizing: 'border-box'
        }}>
          {/* Centered Title */}
          <h3 style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: '900',
            color: 'var(--text-main)',
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap'
          }}>
            {t('advancedFilters', '詳細検索')}
          </h3>

          {/* Reset Button (Scrolls away naturally with title) */}
          <button 
            type="button" 
            onClick={handleResetFilters}
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

        {/* Scrollable Filter Form Body in sequence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* SECTION 1: Prefektura va Shaharlar (市区町村) */}
          <div className="job-category-section" style={{
            background: 'var(--card-bg)', borderRadius: '20px',
            border: selectedCitiesList.length > 0 ? '1px solid rgba(10, 132, 255, 0.4)' : '1px solid var(--glass-border)',
            boxShadow: selectedCitiesList.length > 0 ? '0 8px 24px rgba(10, 132, 255, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', transition: 'all 0.25s ease'
          }}>
            <div 
              className="category-section-header"
              onClick={() => setIsLocationSectionOpen(!isLocationSectionOpen)}
              style={{ cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(10, 132, 255, 0.35)', flexShrink: 0
                }}>
                  <MapPin size={20} color="#FFFFFF" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
                    {t('searchByCities', '都道府県・市区町村から探す')}
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    {t('filterAreaSub', 'エリア・勤務地の指定')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedCitiesList.length > 0 && (
                  <span style={{
                    fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', color: '#FFF',
                    boxShadow: '0 2px 8px rgba(10, 132, 255, 0.3)'
                  }}>
                    {selectedCitiesList.length}件
                  </span>
                )}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(118, 118, 128, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isLocationSectionOpen ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
                </div>
              </div>
            </div>

            {isLocationSectionOpen && (
              <div style={{ padding: '14px 16px' }}>
                {/* Option B: Premium Apple-style Banner Card */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '16px', padding: '12px 16px',
                  background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.07) 0%, rgba(94, 92, 230, 0.07) 100%)',
                  borderRadius: '16px', border: '1px solid rgba(10, 132, 255, 0.2)',
                  boxShadow: '0 4px 14px rgba(10, 132, 255, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '10px',
                      background: 'rgba(10, 132, 255, 0.15)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <MapPin size={17} color="var(--primary)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                        {t('targetAreaLabel', '対象エリア (地域)')}
                      </span>
                      <span style={{ fontSize: '14.5px', fontWeight: '900', color: 'var(--text-main)', marginTop: '1px' }}>
                        {selectedPrefecture === 'all' 
                          ? t('allPrefectures', '全ての地域 (全国)') 
                          : PREFECTURES.find(p => p.nameEn === selectedPrefecture)?.name || selectedPrefecture}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="button"
                    className="prefecture-pill-btn"
                    onClick={() => setIsPrefPickerOpen(true)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                      border: 'none', background: 'var(--primary)',
                      color: '#FFFFFF', fontWeight: '800', fontSize: '12.5px',
                      padding: '7px 14px', borderRadius: '14px',
                      boxShadow: '0 4px 12px rgba(10, 132, 255, 0.3)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <span>{t('changeBtn', '変更')}</span>
                    <ChevronDown size={14} color="#FFF" />
                  </button>
                </div>

                {/* Cities / Wards checkboxes */}
                <div className="tab-cities-wrapper">
                  {(() => {
                    const prefKey = (selectedPrefecture || 'all').toLowerCase();
                    const citiesList = prefKey === 'all' ? getAllCities() : (CITIES_BY_PREFECTURE[prefKey] || []);
                    return citiesList.map(city => {
                      const isExpanded = !!expandedCities[city.id];
                      const hasWards = city.wards && city.wards.length > 0;
                      const isCityChecked = selectedCitiesList.includes(city.name);

                      return (
                        <div key={city.id} className="townwork-accordion-item">
                          <div className="townwork-accordion-header">
                            <label 
                              className="townwork-checkbox-label"
                              onClick={() => {
                                setSelectedCitiesList(prev => 
                                  prev.includes(city.name) ? prev.filter(c => c !== city.name) : [...prev, city.name]
                                );
                              }}
                            >
                              <div className={`townwork-square-checkbox ${isCityChecked ? 'checked' : ''}`}>
                                {isCityChecked && <Check size={14} color="#FFF" />}
                              </div>
                              <span>{city.name}</span>
                            </label>
                            {hasWards && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedCities(prev => ({ ...prev, [city.id]: !prev[city.id] }));
                                }}
                                style={{ padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                              >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </div>
                            )}
                          </div>

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
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: Bekat va Liniyalar (駅・路線) */}
          <div className="job-category-section" style={{
            background: 'var(--card-bg)', borderRadius: '20px',
            border: selectedStations.length > 0 ? '1px solid rgba(48, 209, 88, 0.4)' : '1px solid var(--glass-border)',
            boxShadow: selectedStations.length > 0 ? '0 8px 24px rgba(48, 209, 88, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', transition: 'all 0.25s ease'
          }}>
            <div 
              className="category-section-header"
              onClick={() => setIsStationsSectionOpen(!isStationsSectionOpen)}
              style={{ cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #30D158 0%, #248A3D 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(48, 209, 88, 0.35)', flexShrink: 0
                }}>
                  <Train size={20} color="#FFFFFF" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
                    {t('searchByStations', '沿線・駅から探す')}
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    {t('filterStationSub', '路線名・最寄り駅の指定')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedStations.length > 0 && (
                  <span style={{
                    fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #30D158, #248A3D)', color: '#FFF',
                    boxShadow: '0 2px 8px rgba(48, 209, 88, 0.3)'
                  }}>
                    {selectedStations.length}件
                  </span>
                )}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(118, 118, 128, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isStationsSectionOpen ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
                </div>
              </div>
            </div>

            {isStationsSectionOpen && (
              <div style={{ padding: '14px 16px' }}>
                <div className="tab-stations-wrapper">
                  {(() => {
                    const prefKey = (selectedPrefecture || 'all').toLowerCase();
                    const linesList = prefKey === 'all' ? getAllTrainLines() : (TRAIN_LINES_BY_PREFECTURE[prefKey] || []);
                    return linesList.map(line => {
                      const isExpanded = !!expandedLines[line.id];
                      const isLineSelected = line.stations.length > 0 && line.stations.every(st => selectedStations.includes(st));

                      return (
                        <div key={line.id} className="townwork-accordion-item">
                          <div className="townwork-accordion-header">
                            <label 
                              className="townwork-checkbox-label"
                              onClick={() => {
                                if (isLineSelected) {
                                  setSelectedStations(prev => prev.filter(st => !line.stations.includes(st)));
                                } else {
                                  setSelectedStations(prev => Array.from(new Set([...prev, ...line.stations])));
                                }
                              }}
                            >
                              <div className={`townwork-square-checkbox ${isLineSelected ? 'checked' : ''}`}>
                                {isLineSelected && <Check size={14} color="#FFF" />}
                              </div>
                              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: line.color, boxShadow: `0 0 6px ${line.color}` }} />
                              <span>{line.name}</span>
                            </label>
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedLines(prev => ({ ...prev, [line.id]: !prev[line.id] }));
                              }}
                              style={{ padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                          </div>

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
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Joriy Joylashuvdan Masofa (現在地) */}
          <div className="job-category-section" style={{
            background: 'var(--card-bg)', borderRadius: '20px',
            border: selectedRadius > 0 ? '1px solid rgba(255, 159, 10, 0.4)' : '1px solid var(--glass-border)',
            boxShadow: selectedRadius > 0 ? '0 8px 24px rgba(255, 159, 10, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', transition: 'all 0.25s ease'
          }}>
            <div 
              className="category-section-header"
              onClick={() => setIsRadiusSectionOpen(!isRadiusSectionOpen)}
              style={{ cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FF9F0A 0%, #C27803 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(255, 159, 10, 0.35)', flexShrink: 0
                }}>
                  <Navigation size={20} color="#FFFFFF" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
                    {t('searchByRadius', '現在地からの距離')}
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    {t('filterRadiusSub', '指定半径・周辺エリア')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedRadius > 0 && (
                  <span style={{
                    fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FF9F0A, #FFB340)', color: '#FFF',
                    boxShadow: '0 2px 8px rgba(255, 159, 10, 0.3)'
                  }}>
                    {selectedRadius} km
                  </span>
                )}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(118, 118, 128, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isRadiusSectionOpen ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
                </div>
              </div>
            </div>

            {isRadiusSectionOpen && (
              <div style={{ padding: '14px 16px' }}>
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
                          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>
                            {pickField(opt, 'label', currentLang)}
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                            {pickField(opt, 'sublabel', currentLang)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Job Categories */}
          <div className="job-category-section" style={{
            background: 'var(--card-bg)', borderRadius: '20px',
            border: (selectedJobCategories.length + selectedSubcategories.length) > 0 ? '1px solid rgba(175, 82, 222, 0.4)' : '1px solid var(--glass-border)',
            boxShadow: (selectedJobCategories.length + selectedSubcategories.length) > 0 ? '0 8px 24px rgba(175, 82, 222, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', transition: 'all 0.25s ease'
          }}>
            <div 
              className="category-section-header"
              onClick={() => setIsJobCatSectionOpen(!isJobCatSectionOpen)}
              style={{ cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #AF52DE 0%, #7928CA 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(175, 82, 222, 0.35)', flexShrink: 0
                }}>
                  <Briefcase size={20} color="#FFFFFF" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
                    {t('searchByJobCategory', '職種から探す')}
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    {t('filterCategorySub', 'トラック・ドライバー種別')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(selectedJobCategories.length + selectedSubcategories.length) > 0 && (
                  <span style={{
                    fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #AF52DE, #C770F0)', color: '#FFF',
                    boxShadow: '0 2px 8px rgba(175, 82, 222, 0.3)'
                  }}>
                    {selectedJobCategories.length + selectedSubcategories.length}件
                  </span>
                )}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(118, 118, 128, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isJobCatSectionOpen ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
                </div>
              </div>
            </div>

            {isJobCatSectionOpen && (
              <div className="category-accordion-list" style={{ padding: '4px 14px 14px 14px' }}>
                {JOB_CATEGORIES.map(cat => {
                  const isCatExpanded = !!expandedJobCats[cat.id];
                  return (
                    <div key={cat.id} className="townwork-accordion-item">
                      <div 
                        className="townwork-accordion-header"
                        onClick={() => {
                          if (cat.subcategories && cat.subcategories.length > 0) {
                            setExpandedJobCats(prev => ({ ...prev, [cat.id]: !prev[cat.id] }));
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <label className="townwork-checkbox-label" style={{ cursor: 'pointer' }}>
                          <span>{cat.icon} {pickField(cat, 'name', currentLang)}</span>
                        </label>
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div 
                            style={{ padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                          >
                            {isCatExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </div>
                        )}
                      </div>

                      {cat.subcategories && isCatExpanded && (
                        <div className="townwork-accordion-body">
                          {cat.subcategories.map(sub => {
                            const isSubChecked = selectedSubcategories.includes(sub.id);
                            return (
                              <div 
                                key={sub.id} 
                                className="townwork-sub-checkbox-item"
                                onClick={() => {
                                  setSelectedSubcategories(prev => 
                                    prev.includes(sub.id) ? prev.filter(s => s !== sub.id) : [...prev, sub.id]
                                  );
                                }}
                              >
                                <div className={`townwork-square-checkbox ${isSubChecked ? 'checked' : ''}`} style={{ width: '16px', height: '16px' }}>
                                  {isSubChecked && <Check size={11} color="#FFF" />}
                                </div>
                                <span>{pickField(sub, 'name', currentLang)}</span>
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
          </div>

          {/* SECTION 5: Features */}
          <div className="job-category-section" style={{
            background: 'var(--card-bg)', borderRadius: '20px',
            border: (selectedEmploymentTypes.length + selectedFeatures.length) > 0 ? '1px solid rgba(255, 214, 10, 0.5)' : '1px solid var(--glass-border)',
            boxShadow: (selectedEmploymentTypes.length + selectedFeatures.length) > 0 ? '0 8px 24px rgba(255, 214, 10, 0.12)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', transition: 'all 0.25s ease'
          }}>
            <div 
              className="category-section-header"
              onClick={() => setIsFeatureSectionOpen(!isFeatureSectionOpen)}
              style={{ cursor: 'pointer', padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FFD60A 0%, #D4A300 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(255, 214, 10, 0.35)', flexShrink: 0
                }}>
                  <Sparkles size={20} color="#FFFFFF" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
                    {t('searchByFeatures', 'こだわり条件から探す')}
                  </span>
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '1px' }}>
                    {t('filterFeatureSub', '雇用形態・給与・設備条件')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(selectedEmploymentTypes.length + selectedFeatures.length) > 0 && (
                  <span style={{
                    fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FFD60A, #FF9F0A)', color: '#000',
                    boxShadow: '0 2px 8px rgba(255, 214, 10, 0.3)'
                  }}>
                    {selectedEmploymentTypes.length + selectedFeatures.length}件
                  </span>
                )}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(118, 118, 128, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isFeatureSectionOpen ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
                </div>
              </div>
            </div>

            {isFeatureSectionOpen && (
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="filter-section">
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {JOB_FEATURES.employment.icon} {pickField(JOB_FEATURES.employment, 'title', currentLang)}
                  </h4>
                  <div className="filter-tags">
                    {JOB_FEATURES.employment.options.map(item => {
                      const isSelected = selectedEmploymentTypes.includes(item.id);
                      return (
                        <button 
                          key={item.id} 
                          type="button"
                          className={`filter-tag-chip ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedEmploymentTypes(prev => 
                              prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]
                            );
                          }}
                        >
                          {pickField(item, 'name', currentLang)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {[JOB_FEATURES.shift, JOB_FEATURES.holiday, JOB_FEATURES.truckEquip, JOB_FEATURES.loading, JOB_FEATURES.highway].map(cat => cat && (
                  <div key={cat.title} className="filter-section">
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13.5px', fontWeight: '800', color: 'var(--text-main)' }}>
                      {cat.icon} {pickField(cat, 'title', currentLang)}
                    </h4>
                    <div className="filter-tags">
                      {cat.options.map(item => {
                        const isSelected = selectedFeatures.includes(item.id);
                        return (
                          <button 
                            key={item.id} 
                            type="button"
                            className={`filter-tag-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedFeatures(prev => 
                                prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]
                              );
                            }}
                          >
                            {pickField(item, 'name', currentLang)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 160px clearance spacer so filter drawer content halts cleanly 12px above 52px floating search CTA button at bottom 96px */}
        <div style={{ height: '160px', minHeight: '160px', width: '100%', flexShrink: 0, clear: 'both' }} />

        {/* Pinned Search CTA Button Dock — aligned 1:1 on single vertical margin line */}
        <div 
          className="floating-search-cta-dock"
          style={{
            position: 'fixed',
            bottom: '96px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'var(--card-width-full, calc(100% - 28px))',
            maxWidth: '792px',
            zIndex: 250,
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}
        >
          <button 
            type="button" 
            className="townwork-btn-search-cta" 
            onClick={() => setIsFilterDrawerOpen(false)}
            style={{
              pointerEvents: 'auto',
              width: '100%',
              height: '52px',
              fontSize: '16px',
              fontWeight: '800',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 16px rgba(10, 132, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0
            }}
          >
            <Search size={19} color="#FFF" />
            <span>{t('searchCountBtn', '{{count}}件 検索', { count: filteredJobs.length })}</span>
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
            title={t('advancedFilters', '詳細検索')}
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
            {t('allJobs', "すべて")}
          </div>
          <div 
            className={`segment ${activeSegment === 'international' ? 'active' : ''}`}
            onClick={() => setActiveSegment('international')}
          >
            {t('tokuteiGinouSegment', '特定技能')}
          </div>
          <div 
            className={`segment ${activeSegment === 'permanent' ? 'active' : ''}`}
            onClick={() => setActiveSegment('permanent')}
          >
            {t('fullTime', "正社員")}
          </div>
          <div 
            className={`segment ${activeSegment === 'hourly' ? 'active' : ''}`}
            onClick={() => setActiveSegment('hourly')}
          >
            {t('partTime', "アルバイト")}
          </div>
        </div>

        {/* Active Filter Chips Row */}
        {hasActiveFilters && (
          <div className="active-filter-chips-container" style={{ marginTop: '8px' }}>
            <div className="active-filter-chips-row hide-scrollbar">
              {selectedPrefecture !== 'all' && (
                <span className="active-chip" onClick={() => setSelectedPrefecture('all')}>
                  <MapPin size={13} className="chip-svg-icon" /> {selectedPrefecture} <span className="active-chip-close"><X size={11} /></span>
                </span>
              )}
              {selectedCity !== 'all' && (
                <span className="active-chip" onClick={() => setSelectedCity('all')}>
                  <Building2 size={13} className="chip-svg-icon" /> {selectedCity} <span className="active-chip-close"><X size={11} /></span>
                </span>
              )}
              {minSalary > 0 && (
                <span className="active-chip" onClick={() => setMinSalary(0)}>
                  <Banknote size={13} className="chip-svg-icon" /> {minSalary.toLocaleString()}円+ <span className="active-chip-close"><X size={11} /></span>
                </span>
              )}
              {selectedLicenses.length > 0 && (
                selectedLicenses.length <= 2 ? (
                  selectedLicenses.map(lic => (
                    <span key={lic} className="active-chip" onClick={() => setSelectedLicenses(prev => prev.filter(i => i !== lic))}>
                      <ShieldCheck size={13} className="chip-svg-icon" /> {lic} <span className="active-chip-close"><X size={11} /></span>
                    </span>
                  ))
                ) : (
                  <span className="active-chip" onClick={() => setSelectedLicenses([])} title={selectedLicenses.join(', ')}>
                    <ShieldCheck size={13} className="chip-svg-icon" /> {selectedLicenses[0]} <span className="active-chip-count">+{selectedLicenses.length - 1}</span> <span className="active-chip-close"><X size={11} /></span>
                  </span>
                )
              )}
              {selectedStations.length > 0 && (
                selectedStations.length <= 2 ? (
                  selectedStations.map(st => (
                    <span key={st} className="active-chip" onClick={() => setSelectedStations(prev => prev.filter(item => item !== st))}>
                      <Train size={13} className="chip-svg-icon" /> {st} <span className="active-chip-close"><X size={11} /></span>
                    </span>
                  ))
                ) : (
                  <span className="active-chip" onClick={() => setSelectedStations([])} title={selectedStations.join(', ')}>
                    <Train size={13} className="chip-svg-icon" /> {selectedStations[0]} <span className="active-chip-count">+{selectedStations.length - 1}</span> <span className="active-chip-close"><X size={11} /></span>
                  </span>
                )
              )}
              {selectedCitiesList.length > 0 && (
                selectedCitiesList.length <= 2 ? (
                  selectedCitiesList.map(c => (
                    <span key={c} className="active-chip" onClick={() => setSelectedCitiesList(prev => prev.filter(item => item !== c))}>
                      <MapPin size={13} className="chip-svg-icon" /> {c} <span className="active-chip-close"><X size={11} /></span>
                    </span>
                  ))
                ) : (
                  <span className="active-chip" onClick={() => setSelectedCitiesList([])} title={selectedCitiesList.join(', ')}>
                    <MapPin size={13} className="chip-svg-icon" /> {selectedCitiesList[0]} <span className="active-chip-count">+{selectedCitiesList.length - 1}</span> <span className="active-chip-close"><X size={11} /></span>
                  </span>
                )
              )}
              {selectedJobCategories.map(catId => (
                <span key={catId} className="active-chip" onClick={() => setSelectedJobCategories(prev => prev.filter(item => item !== catId))}>
                  <Briefcase size={13} className="chip-svg-icon" /> {getJobCategoryLabel(catId)} <span className="active-chip-close"><X size={11} /></span>
                </span>
              ))}
              {selectedEmploymentTypes.map(emp => (
                <span key={emp} className="active-chip" onClick={() => setSelectedEmploymentTypes(prev => prev.filter(item => item !== emp))}>
                  <FileText size={13} className="chip-svg-icon" /> {getEmploymentLabel(emp)} <span className="active-chip-close"><X size={11} /></span>
                </span>
              ))}
              {selectedDurations.map(dur => (
                <span key={dur} className="active-chip" onClick={() => setSelectedDurations(prev => prev.filter(item => item !== dur))}>
                  <Calendar size={13} className="chip-svg-icon" /> {getDurationLabel(dur)} <span className="active-chip-close"><X size={11} /></span>
                </span>
              ))}
              {selectedTimeSlots.map(ts => (
                <span key={ts} className="active-chip" onClick={() => setSelectedTimeSlots(prev => prev.filter(item => item !== ts))}>
                  <Clock size={13} className="chip-svg-icon" /> {getTimeSlotLabel(ts)} <span className="active-chip-close"><X size={11} /></span>
                </span>
              ))}
              {selectedFeatures.length > 0 && (
                selectedFeatures.length <= 2 ? (
                  selectedFeatures.map(f => (
                    <span key={f} className="active-chip" onClick={() => setSelectedFeatures(prev => prev.filter(item => item !== f))}>
                      <Star size={13} className="chip-svg-icon" /> {getFeatureLabel(f)} <span className="active-chip-close"><X size={11} /></span>
                    </span>
                  ))
                ) : (
                  <span className="active-chip" onClick={() => setSelectedFeatures([])} title={selectedFeatures.map(getFeatureLabel).join(', ')}>
                    <Star size={13} className="chip-svg-icon" /> {getFeatureLabel(selectedFeatures[0])} <span className="active-chip-count">+{selectedFeatures.length - 1}</span> <span className="active-chip-close"><X size={11} /></span>
                  </span>
                )
              )}
              {selectedRadius > 0 && (
                <span className="active-chip" onClick={() => setSelectedRadius(0)}>
                  <Target size={13} className="chip-svg-icon" /> {selectedRadius}km <span className="active-chip-close"><X size={11} /></span>
                </span>
              )}
              {onlyNearStation && (
                <span className="active-chip" onClick={() => setOnlyNearStation(false)}>
                  <Navigation size={13} className="chip-svg-icon" /> {t('nearStationChip', '駅から徒歩10分')} <span className="active-chip-close"><X size={11} /></span>
                </span>
              )}
            </div>
            <button type="button" className="clear-all-chip sticky-reset-btn" onClick={handleResetFilters} title={t('clearAll', 'リセット')}>
              <RotateCcw size={13} className="reset-spin-icon" />
              <span>{t('clearAll', 'リセット')}</span>
            </button>
          </div>
        )}

        {/* Sort & Results Bar */}
        <div className="sort-results-bar">
          <span className="result-count">{t('jobsCountResult', '{{count}} 件の求人', { count: filteredJobs.length })}</span>
          <button
            type="button"
            id="verified-only-toggle"
            className={`verified-only-toggle ${verifiedOnly ? 'active' : ''}`}
            aria-pressed={verifiedOnly}
            onClick={() => setVerifiedOnly(v => !v)}
          >
            <VerifiedBadge size={13} />
            <span>{t('verifiedOnlyFilter', '認証企業のみ')}</span>
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
            <option value="newest">{t('newest', '新着順')}</option>
            <option value="salary_high">{t('salary_high', '給与が高い順')}</option>
            <option value="salary_low">{t('salary_low', '給与が低い順')}</option>
          </select>
        </div>
      </div>

      {/* Qalqib chiquvchi real-vaqt yangi e'lonlar pill tugmasi */}
      <NewJobsPill count={feed?.pendingCount} onClick={feed?.showPending} isOnline={feed?.isOnline !== false} />

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
            {t('noJobsFound', '該当する求人が見つかりませんでした')}
          </div>
        ) : (
          filteredJobs.slice(0, visibleCount).map(job => {
            // ⭐ = company verified by a Michi admin (server sets authorVerified); a viewer's own contract never badges others
            const showVerified = isVerifiedListing(job);
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
                        <span>{t('foreigners_visa', '特定技能 • 海外人材')}</span>
                      </div>
                    ) : job.foreigners === 'foreigners_visa_renew' ? (
                      <div className="local-visa-renew-tag">
                        <span className="briefcase-icon">💼</span>
                        <span>{t('foreigners_visa_renew', 'ビザ更新支援あり')}</span>
                      </div>
                    ) : job.foreigners === 'foreigners_ok' ? (
                      <div className="local-foreigner-ok-tag">
                        <span className="users-icon">👥</span>
                        <span>{t('foreigners_ok', '外国人歓迎')}</span>
                      </div>
                    ) : null}
                    {/* Kompaniya nomi va tasdiqlash belgisi */}
                    <div className="job-card-company">
                      <img src={job.logo} alt={job.company} className="job-card-company-logo" />
                      <span>{job.company}</span>
                      {showVerified && <VerifiedBadge size={14} verifiedAt={listingVerifiedAt(job)} />}
                    </div>

                    {/* E'lon sarlavhasi */}
                    <h3 className="job-card-title">{t(`job_${job.id}_title`, job.title)}</h3>

                    {/* Maosh — eng muhim ma'lumot */}
                    <div className="job-card-salary">
                      <Banknote size={15} />
                      <span>{job.salary ? job.salary.replace('/ oyiga', `/ ${t('perMonth', '月給')}`) : t('notProvided', '未入力')}</span>
                    </div>

                    {/* Qisqa ma'lumot chiplari (minimalistik ikonkalar bilan) */}
                    <div className="job-card-chips">
                      <span 
                        className={`job-chip ${ENABLE_JOB_LOCATION_MAP ? 'job-location-chip-clickable' : ''}`}
                        onClick={(e) => {
                          if (!ENABLE_JOB_LOCATION_MAP) return;
                          e.stopPropagation();
                          setMapFocusJob(job);
                          setIsMapModalOpen(true);
                        }}
                      >
                        <MapPin size={12} color="var(--primary)" />
                        {t(`job_${job.id}_location`, job.location)}
                      </span>
                      <span className="job-chip">
                        <Clock size={12} />
                        {jobValueLabel(t, job.hours)}
                      </span>
                      {job.foreigners && job.foreigners !== 'foreigners_none' && (
                        <span className="job-chip chip-highlight">
                          <Globe size={12} />
                          {t(job.foreigners, '外国人歓迎')}
                        </span>
                      )}
                      {job.housing && job.housing !== 'housing_none' && (
                        <span className="job-chip chip-green">
                          <Home size={12} />
                          {t(job.housing, '寮あり')}
                        </span>
                      )}
                      {(job.hasShoukai || job.shoukaiFee > 0 || (job.shoukai && job.shoukai !== '0')) && (
                        <span className="job-chip chip-gold" style={{ background: 'rgba(255, 215, 0, 0.15)', color: '#D4AF37', borderColor: 'rgba(255, 215, 0, 0.4)', fontWeight: '700' }}>
                          🎁 {t('signonBonusBadgeLabel', '入社祝い金')} {job.shoukaiFee ? `¥${Number(job.shoukaiFee).toLocaleString()}` : (job.shoukaiAmount || (job.shoukai !== '0' ? job.shoukai : '') || '')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pastki qism: Tugmalar (job-card-main-layout tashqarisida) */}
                <div className="job-card-actions">
                  {userRole === 'company' ? (
                    // KOMPANIYA: O'z e'lonlarida "Tahrirlash", boshqalarda "Tel" va "Shoukai"
                    isOwnJob(job, profileData) ? (
                      <button 
                        className="job-card-btn btn-apply"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditJob && onEditJob(job);
                        }}
                        style={{ flex: 1, background: '#1c1c1e', color: '#fff' }}
                      >
                        <Edit3 size={13} />
                        {t('editJob', '編集')}
                      </button>
                    ) : (
                      <>
                        <a 
                          href={job.phone ? `tel:${job.phone}` : undefined}
                          aria-disabled={!job.phone}
                          className="job-card-btn btn-apply"
                          onClick={(e) => { e.stopPropagation(); if (!job.phone) e.preventDefault(); }}
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', fontWeight: '700', opacity: job.phone ? 1 : 0.5 }}
                        >
                          <Phone size={13} />
                          {t('callSchool', "電話する")}
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
                            ? `${t('shoukai', '紹介')} (${t('shoukaiAvailableLabel', '特典あり')})` 
                            : t('shoukai', '紹介')}
                        </button>
                      </>
                    )
                  ) : (
                    // HAYDOVCHI / MEHMON: Ariza topshirish + Shoukai
                    <>
                  {(() => {
                    const alreadyApplied = hasActiveApplication(applications, { jobId: job.id });
                    if (alreadyApplied) {
                      return (
                        <button 
                          className="job-card-btn btn-apply applied"
                          disabled
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <CheckCircle2 size={13} />
                          {t('appliedStatus', '応募済み')}
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
                        {t('applyJob', '応募する')}
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
                      ? `${t('shoukai', '紹介')} (${t('shoukaiAvailableLabel', '特典あり')})` 
                      : t('shoukai', '紹介')}
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
            >
              {t('loadMore', 'Motto miru (Ko\'proq ko\'rish)')}
            </button>
          </div>
        )}

        {/* Infinite Scroll Sentinel element */}
        <div ref={sentinelRef} style={{ height: '20px', width: '100%' }} />
      </div>

      {/* 92px clearance spacer yielding exact visual clearance above floating BottomNav */}
      <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />

      {/* ====== REAL LEAFLET MAP MODAL (header button and/or job location chip) ====== */}
      {(ENABLE_MAP_SEARCH || ENABLE_JOB_LOCATION_MAP) && (
        <JobMapModal 
          isOpen={isMapModalOpen} 
          onClose={() => { setIsMapModalOpen(false); setMapFocusJob(null); }} 
          jobs={filteredJobs} 
          focusJob={mapFocusJob}
          onSelectJob={onJobClick} 
          t={t} 
        />
      )}
    </div>
  );
}

// Asl dizayn, shaffoflik va layout 100% saqlangan xarita modali
function JobMapModal({ isOpen, onClose, jobs = [], focusJob = null, onSelectJob, t }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const [selectedMapJob, setSelectedMapJob] = useState(null);

  // Opened from a job card's location chip: preselect that job
  useEffect(() => {
    if (isOpen && focusJob) setSelectedMapJob(focusJob);
  }, [isOpen, focusJob]);

  useEffect(() => {
    if (!isOpen) return;

    const timers = [];

    const setupMap = () => {
      const mapL = (typeof window !== 'undefined' && window.L) || L;
      if (!mapContainerRef.current || !mapL) return;

      const L = mapL;
      let map = mapInstanceRef.current;

      if (!map) {
        try {
          map = L.map(mapContainerRef.current, {
            center: [35.6812, 139.7671],
            zoom: 9,
            zoomControl: false
          });

          // Carto raster tiles now require an API key (they serve an "API KEY REQUIRED" image),
          // so use 国土地理院 淡色地図 — free, keyless, Japanese labels; attribution is required.
          L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
            maxZoom: 18,
            minZoom: 5,
            attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">地理院タイル</a>'
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

      (jobs || []).forEach((job) => {
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
        } catch (e) {}
      }
    };

    timers.push(setTimeout(setupMap, 50));
    timers.push(setTimeout(() => {
      if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
    }, 200));

    return () => {
      timers.forEach(clearTimeout);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {}
      }
    };
  }, [isOpen, jobs]);

  if (!isOpen) return null;

  const targetContainer = typeof document !== 'undefined' ? (document.getElementById('root') || document.body) : null;
  if (!targetContainer) return null;

  return createPortal(
    <div className="job-map-modal-overlay animate-fade-in" role="dialog" aria-modal="true" aria-label={t('jobMapTitle', '求人マップ検索')}>
      <div className="job-map-modal-card glass animate-slide-up">
        {/* Header */}
        <div className="job-map-modal-header glass" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', borderBottom: '1px solid var(--glass-border)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: 'var(--text-main)' }}>
              🗺️ {t('jobMapTitle', '求人マップ検索')} ({jobs.length})
            </h3>
          </div>
          <button 
            type="button" 
            className="icon-btn glass" 
            onClick={onClose} 
            aria-label="Close"
            style={{ padding: '6px 10px', borderRadius: '12px', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
          >
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
                    {selectedMapJob.company}
                  </h4>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: '2px 0 0 0' }}>{selectedMapJob.title}</h3>
                </div>
                <button type="button" className="icon-btn glass" onClick={() => setSelectedMapJob(null)} aria-label="Close preview" style={{ padding: '6px' }}>
                  <X size={16} />
                </button>
              </div>
              <div className="preview-card-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                <span style={{ background: 'rgba(52, 199, 89, 0.12)', color: '#34C759', padding: '4px 8px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '700' }}>💰 {selectedMapJob.salary}</span>
                <span style={{ background: 'rgba(10, 132, 255, 0.12)', color: '#0A84FF', padding: '4px 8px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '600' }}>📍 {selectedMapJob.location}</span>
                {selectedMapJob.shoukai && selectedMapJob.shoukai !== '0' && (
                  <span style={{ background: 'rgba(255, 159, 10, 0.12)', color: '#FF9F0A', padding: '4px 8px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '700' }}>🎁 {t('shoukaiAvailable', 'Shoukai')} {selectedMapJob.shoukai}</span>
                )}
              </div>
              <button 
                type="button" 
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

