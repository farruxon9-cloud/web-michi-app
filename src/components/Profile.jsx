import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Settings, FileText, Bell, LogOut, ChevronRight, CheckCircle2, ShieldCheck, 
  Briefcase, Globe, Building2, MapPin, Phone, Users, Camera, Sun, Moon, 
  Volume2, Vibrate, VolumeX, BellOff, Edit3, Save, X, Share2, Bookmark, ArrowLeft, Megaphone, Plus, Info, Sparkles, Mail, Wrench, Trash2, Bot, Navigation, Zap, Mic } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { MOCK_JOBS } from './DriverFeed';
import { MOCK_SCHOOLS } from './DrivingAcademy';
import VerifiedBadge from './VerifiedBadge';
import CompanyHome from './CompanyHome';
import ResumeBuilder from './ResumeBuilder';
import AssistHeroShowcase from './AssistHeroShowcase';
import './Profile.css';

const StatCounter = ({ target, suffix = '', duration = 1200 }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // cubicOut easing
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const STATUS_PIPELINE = ['submitted', 'reviewing', 'reviewed', 'interview', 'rejected', 'accepted'];
const STATUS_COLORS = {
  submitted: '#0A84FF', // Changed from grey to blue so it looks active
  reviewing: '#FF9F0A',
  reviewed: '#0A84FF',
  rejected: '#FF3B30',
  accepted: '#34C759',
  interview: '#AF52DE',
};

export default function Profile({ 
  onLogout, contractStatus, setContractStatus, profileData, userRole, 
  onChangeLanguage, onUpdateProfile, applications, onChangeAppStatus,
  notifications, onMarkRead, onMarkAllRead, unreadCount,
  darkMode, setDarkMode, soundSettings, setSoundSettings,
  companyEmployees, onAddEmployee, onAcceptEmployeeRequest, setNotifications,
  schoolApplications = [], onShoukaiPaid, onNavigate,
  activePage = 'main',
  setActivePage,
  profileActivePageSource,
  setProfileActivePageSource,
  onJobClick,
  onSchoolClick,
  showProfileBadges = true,
  setShowProfileBadges,
  notificationSound = true,
  setNotificationSound,
  jobs,
  schools,
  setJobs,
  setSchools,
  jobToEdit,
  setJobToEdit,
  onApply,
  onApplySchool,
  onShoukai,
  onTriggerRegister,
  isVoiceActive,
  setIsVoiceActive,
  isVoiceStandby,
  setIsVoiceStandby
}) {
  const { t, i18n } = useTranslation();

  if (!profileData) {
    return (
      <div className="profile-container fade-in">
        <div className="profile-skeleton-card glass squircle">
          <div className="skeleton-pulse skeleton-avatar" />
          <div className="skeleton-pulse skeleton-text-lg" />
          <div className="skeleton-pulse skeleton-text-sm" />
        </div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton-pulse skeleton-row" />
          <div className="skeleton-pulse skeleton-row" />
          <div className="skeleton-pulse skeleton-row" />
        </div>
      </div>
    );
  }

  // Sub-sahifa o'zgarganda scroll holatini tepaga reset qilish (Scroll Restoration)
  React.useEffect(() => {
    const container = document.querySelector('.profile-container');
    if (container) {
      container.scrollTop = 0;
    }
  }, [activePage]);

  // --- STATISTIKA VA SANARLARNI HISOBLASH (DYNAMIC MENUS & USER BADGES) ---
  // Hamma bo'limlar uchun bosilgan o'zgarishlar sanoqlari (badges) dynamic ravishda hisoblanadi.

  // 1. Foydalanuvchining shaxsiy arizalari soni (referral qilingan do'stlar arizalari hisobga olinmaydi)
  const ownApplicationsCount = applications.filter(a => !a.isSimulatedReferral).length;
  const ownSchoolApplicationsCount = (schoolApplications || []).filter(a => !a.isSimulatedReferral).length;
  const totalOwnApplications = ownApplicationsCount + (userRole !== 'company' ? ownSchoolApplicationsCount : 0);

  // 2. Faol bo'lgan saqlangan e'lonlar soni (MOCK ro'yxatida mavjud bo'lgan e'lonlar)
  const savedJobs = (profileData?.savedItems?.jobs || []).filter(job => 
    MOCK_JOBS.some(mj => mj.id === job.id && mj.isActive !== false)
  );
  const savedSchools = (profileData?.savedItems?.schools || []).filter(school => 
    MOCK_SCHOOLS.some(ms => ms.id === school.id && ms.isActive !== false)
  );
  const totalSavedCount = savedJobs.length + (userRole === 'driver' ? savedSchools.length : 0);

  // 3. Foydalanuvchining Shoukai takliflari soni (simulyatsiya qilingan do'stlar referral arizalari yoki haqiqiy takliflar)
  const referralsCount = userRole === 'company' 
    ? applications.filter(a => a.company === profileData.fullName && a.shoukaiId).length
    : (applications.filter(a => a.shoukaiId === profileData.userId).length + (schoolApplications || []).filter(a => a.shoukaiId === profileData.userId).length);

  // 4. Kompaniyaning HR xodimlari soni
  const employeesCount = (companyEmployees || []).length;
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [acceptingAppId, setAcceptingAppId] = useState(null);
  const [acceptDate, setAcceptDate] = useState('');
  const [empInputId, setEmpInputId] = useState('');
  const [empInputName, setEmpInputName] = useState('');
  const [empInputPhone, setEmpInputPhone] = useState('');
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [aboutTab, setAboutTab] = useState('platform');
  const fileInputRef = useRef(null);

  const DEFAULT_VEHICLES = [
    {
      id: 'v_1',
      type: 'car',
      make: 'Toyota',
      model: 'Harrier',
      bodyStyle: 'suv',
      trim: 'Z',
      year: '2024',
      color: '#5E5CE6',
      platePrefecture: '練馬',
      plateClass: '300',
      plateHira: 'あ',
      plateNumber: '12-34',
      isCommercial: false,
      plateType: 'private',
      driverMark: 'none',
      height: '1.69',
      width: '1.85',
      length: '4.74',
      weight: '1.70',
      axleLoad: '0.85',
      minTurnRadius: '5.3'
    },
    {
      id: 'v_2',
      type: 'truck_2t',
      make: 'Isuzu',
      model: 'Elf',
      bodyStyle: 'box_truck',
      trim: 'Standard',
      year: '2023',
      color: '#30D158',
      platePrefecture: '品川',
      plateClass: '100',
      plateHira: 'い',
      plateNumber: '56-78',
      isCommercial: true,
      plateType: 'commercial',
      driverMark: 'none',
      height: '1.98',
      width: '1.69',
      length: '4.69',
      weight: '4.60',
      axleLoad: '2.25',
      minTurnRadius: '4.8'
    },
    {
      id: 'v_3',
      type: 'truck_4t',
      make: 'Hino',
      model: 'Ranger',
      bodyStyle: 'wing_body',
      trim: 'Pro',
      year: '2022',
      color: '#FF9500',
      platePrefecture: '足立',
      plateClass: '100',
      plateHira: 'か',
      plateNumber: '88-88',
      isCommercial: true,
      plateType: 'commercial',
      driverMark: 'none',
      height: '3.42',
      width: '2.49',
      length: '8.55',
      weight: '7.90',
      axleLoad: '4.00',
      minTurnRadius: '7.0'
    },
    {
      id: 'v_4',
      type: 'truck_10t',
      make: 'Isuzu',
      model: 'Giga',
      bodyStyle: 'box_truck',
      trim: 'Premium',
      year: '2024',
      color: '#8E8E93',
      platePrefecture: '多摩',
      plateClass: '100',
      plateHira: 'さ',
      plateNumber: '99-99',
      isCommercial: true,
      plateType: 'commercial',
      driverMark: 'none',
      height: '3.78',
      width: '2.49',
      length: '11.99',
      weight: '19.90',
      axleLoad: '10.00',
      minTurnRadius: '9.2'
    },
    {
      id: 'v_5',
      type: 'trailer',
      make: 'Mitsubishi Fuso',
      model: 'Super Great',
      bodyStyle: 'trailer_container',
      trim: 'Heavy Duty',
      year: '2023',
      color: '#FF3B30',
      platePrefecture: '横浜',
      plateClass: '100',
      plateHira: 'た',
      plateNumber: '10-00',
      isCommercial: true,
      plateType: 'commercial',
      driverMark: 'none',
      height: '3.80',
      width: '2.50',
      length: '16.50',
      weight: '25.00',
      axleLoad: '10.00',
      minTurnRadius: '10.5'
    },
    {
      id: 'v_6',
      type: 'tanker',
      make: 'UD Quon',
      model: 'Chemical Tanker',
      bodyStyle: 'box_truck',
      trim: 'Chemical',
      year: '2024',
      color: '#0A84FF',
      platePrefecture: '川崎',
      plateClass: '100',
      plateHira: 'な',
      plateNumber: '77-77',
      isCommercial: true,
      plateType: 'commercial',
      driverMark: 'none',
      height: '3.40',
      width: '2.49',
      length: '11.95',
      weight: '20.00',
      axleLoad: '10.00',
      minTurnRadius: '9.5'
    },
    {
      id: 'v_7',
      type: 'kei_truck',
      make: 'Suzuki',
      model: 'Carry',
      bodyStyle: 'flatbed',
      trim: 'KC',
      year: '2021',
      color: '#BF5AF2',
      platePrefecture: '練馬',
      plateClass: '480',
      plateHira: 'り',
      plateNumber: '25-25',
      isCommercial: false,
      plateType: 'private',
      driverMark: 'none',
      height: '1.88',
      width: '1.47',
      length: '3.39',
      weight: '0.70',
      axleLoad: '0.35',
      minTurnRadius: '3.6'
    }
  ];

  const [myVehicles, setMyVehicles] = useState(() => {
    try {
      const savedList = localStorage.getItem('michi_user_vehicles');
      if (savedList) {
        return JSON.parse(savedList);
      }
      localStorage.setItem('michi_user_vehicles', JSON.stringify(DEFAULT_VEHICLES));
      return DEFAULT_VEHICLES;
    } catch {
      return DEFAULT_VEHICLES;
    }
  });

  const [myVehicle, setMyVehicle] = useState(() => {
    try {
      const savedActive = localStorage.getItem('michi_user_vehicle');
      if (savedActive) {
        return JSON.parse(savedActive);
      }
    } catch {}
    
    // Fallback to first vehicle in vehicles list
    const initial = myVehicles && myVehicles.length > 0 ? myVehicles[0] : DEFAULT_VEHICLES[0];
    try {
      localStorage.setItem('michi_user_vehicle', JSON.stringify(initial));
    } catch {}
    return initial;
  });

  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [editVehicleData, setEditVehicleData] = useState({ ...myVehicle });


  // JDM Prefectures & Hiragana Lists
  const JDM_PREFECTURES = [
    '練馬', '品川', '足立', '多摩', '世田谷', '杉並', '横浜', '川崎', '湘南', '相模', 
    '大宮', '川口', '所沢', '千葉', '成田', 'なにわ', '大阪', '和泉', '京都', '神戸', 
    '姫路', '名古屋', '三河', '福岡', '北九州', '札幌', '旭川', '仙台', '広島'
  ];
  
  const JDM_HIRAGANA = [
    'あ', 'い', 'う', 'え', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と', 'な', 'ni', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'ほ',
    'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ'
  ];

  const getVehiclePresetDimensions = (type, bodyStyle) => {
    const presets = {
      car: {
        sedan: { height: '1.43', width: '1.76', length: '4.60', weight: '1.35', axleLoad: '0.70', minTurnRadius: '5.1' },
        hatchback: { height: '1.45', width: '1.69', length: '3.99', weight: '1.05', axleLoad: '0.55', minTurnRadius: '4.7' },
        suv: { height: '1.69', width: '1.85', length: '4.74', weight: '1.70', axleLoad: '0.85', minTurnRadius: '5.3' },
        minivan: { height: '1.71', width: '1.69', length: '4.26', weight: '1.37', axleLoad: '0.75', minTurnRadius: '5.2' }
      },
      kei_truck: {
        flatbed: { height: '1.88', width: '1.47', length: '3.39', weight: '0.70', axleLoad: '0.35', minTurnRadius: '3.6' },
        box_truck: { height: '1.95', width: '1.47', length: '3.39', weight: '0.80', axleLoad: '0.40', minTurnRadius: '3.6' }
      },
      truck_2t: {
        flatbed: { height: '1.98', width: '1.69', length: '4.69', weight: '4.60', axleLoad: '2.25', minTurnRadius: '4.8' },
        box_truck: { height: '2.80', width: '1.80', length: '4.69', weight: '4.80', axleLoad: '2.40', minTurnRadius: '4.8' }
      },
      truck_3t: {
        flatbed: { height: '2.20', width: '1.95', length: '4.69', weight: '5.50', axleLoad: '2.75', minTurnRadius: '5.5' },
        box_truck: { height: '2.80', width: '2.10', length: '6.20', weight: '5.80', axleLoad: '2.90', minTurnRadius: '5.5' }
      },
      truck_4t: {
        flatbed: { height: '2.40', width: '2.25', length: '8.15', weight: '7.50', axleLoad: '3.75', minTurnRadius: '7.0' },
        box_truck: { height: '3.40', width: '2.30', length: '8.50', weight: '7.80', axleLoad: '3.90', minTurnRadius: '7.0' },
        wing_body: { height: '3.42', width: '2.49', length: '8.55', weight: '7.90', axleLoad: '4.00', minTurnRadius: '7.0' },
        dump_truck: { height: '2.60', width: '2.20', length: '5.90', weight: '7.00', axleLoad: '3.50', minTurnRadius: '6.5' }
      },
      truck_10t: {
        flatbed: { height: '3.20', width: '2.49', length: '11.99', weight: '19.00', axleLoad: '9.50', minTurnRadius: '9.2' },
        box_truck: { height: '3.75', width: '2.49', length: '11.99', weight: '19.50', axleLoad: '9.75', minTurnRadius: '9.2' },
        wing_body: { height: '3.78', width: '2.49', length: '11.99', weight: '19.90', axleLoad: '10.00', minTurnRadius: '9.2' },
        dump_truck: { height: '3.30', width: '2.49', length: '9.50', weight: '18.00', axleLoad: '9.00', minTurnRadius: '8.5' }
      },
      trailer: {
        trailer_container: { height: '3.80', width: '2.50', length: '16.50', weight: '25.00', axleLoad: '10.00', minTurnRadius: '10.5' }
      },
      tanker: {
        box_truck: { height: '3.40', width: '2.49', length: '11.95', weight: '20.00', axleLoad: '10.00', minTurnRadius: '9.5' }
      },
      moto: {
        scooter: { height: '1.10', width: '0.80', length: '2.10', weight: '0.12', axleLoad: '0.08', minTurnRadius: '2.0' },
        sportbike: { height: '1.15', width: '0.75', length: '2.05', weight: '0.19', axleLoad: '0.12', minTurnRadius: '2.2' }
      },
      velo: {
        standard: { height: '1.00', width: '0.60', length: '1.70', weight: '0.015', axleLoad: '0.01', minTurnRadius: '1.2' }
      },
      bus: {
        standard: { height: '3.20', width: '2.50', length: '11.50', weight: '12.00', axleLoad: '6.00', minTurnRadius: '9.0' }
      }
    };
    return presets[type]?.[bodyStyle] || presets[type]?.standard || presets[type]?.box_truck || presets[type]?.flatbed || presets[type]?.sedan || { height: '1.50', width: '1.80', length: '4.50', weight: '1.50', axleLoad: '0.75', minTurnRadius: '5.0' };
  };

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    setMyVehicle(editVehicleData);
    localStorage.setItem('michi_user_vehicle', JSON.stringify(editVehicleData));
    
    const updatedList = myVehicles.map(v => v.id === editVehicleData.id ? editVehicleData : v);
    if (!myVehicles.some(v => v.id === editVehicleData.id)) {
      updatedList.push(editVehicleData);
    }
    setMyVehicles(updatedList);
    localStorage.setItem('michi_user_vehicles', JSON.stringify(updatedList));
    
    setIsEditingVehicle(false);
    window.dispatchEvent(new CustomEvent('michi-vehicle-updated', { detail: editVehicleData }));
  };

  const handleSelectActiveVehicle = (vehicle) => {
    setMyVehicle(vehicle);
    localStorage.setItem('michi_user_vehicle', JSON.stringify(vehicle));
    window.dispatchEvent(new CustomEvent('michi-vehicle-updated', { detail: vehicle }));
  };

  const handleAddNewVehicle = () => {
    const newId = 'v_' + Date.now();
    const newVehicle = {
      id: newId,
      type: 'car',
      make: 'Toyota',
      model: 'Harrier',
      bodyStyle: 'suv',
      trim: 'Z',
      year: '2024',
      color: '#5E5CE6',
      platePrefecture: '練馬',
      plateClass: '300',
      plateHira: 'あ',
      plateNumber: '12-34',
      isCommercial: false,
      plateType: 'private',
      driverMark: 'none',
      height: '1.69',
      width: '1.85',
      length: '4.74',
      weight: '1.70',
      axleLoad: '0.85',
      minTurnRadius: '5.3'
    };
    setEditVehicleData(newVehicle);
    setIsEditingVehicle(true);
  };

  const handleDeleteVehicle = (id, event) => {
    event.stopPropagation();
    if (myVehicles.length <= 1) {
      alert('Kamida bitta transport boʻlishi kerak!');
      return;
    }
    const updated = myVehicles.filter(v => v.id !== id);
    setMyVehicles(updated);
    localStorage.setItem('michi_user_vehicles', JSON.stringify(updated));
    if (myVehicle.id === id) {
      handleSelectActiveVehicle(updated[0]);
    }
  };

  const renderVehicleSVG = (type, bodyStyle, color) => {
    const paintColor = color || '#5E5CE6';
    
    // Helper to calculate highlights and shadows from hex color dynamically
    const adjustBrightness = (hex, percent) => {
      try {
        let R = parseInt(hex.substring(1, 3), 16);
        let G = parseInt(hex.substring(3, 5), 16);
        let B = parseInt(hex.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        R = (R > 0) ? R : 0;
        G = (G > 0) ? G : 0;
        B = (B > 0) ? B : 0;

        const rHex = R.toString(16).padStart(2, '0');
        const gHex = G.toString(16).padStart(2, '0');
        const bHex = B.toString(16).padStart(2, '0');

        return `#${rHex}${gHex}${bHex}`;
      } catch (e) {
        return hex;
      }
    };

    const paintColorLight = adjustBrightness(paintColor, 40);
    const paintColorDark = adjustBrightness(paintColor, -30);
    const paintColorDarker = adjustBrightness(paintColor, -55);
    
    // Create unique ID based on color to prevent duplicate gradient collision
    const colId = paintColor.replace('#', '');
    const gId = `${bodyStyle}-paint-${colId}`;

    switch (bodyStyle) {
      // 🚗 PASSENGER CAR BODIES
      case 'minivan':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="45%" stopColor={paintColor} />
                <stop offset="85%" stopColor={paintColorDark} />
                <stop offset="100%" stopColor={paintColorDarker} />
              </linearGradient>
              <linearGradient id="mini-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121d2c" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="42" ry="4.2" fill="rgba(0,0,0,0.22)" />
            <circle cx="28" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
            <circle cx="72" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
            
            {/* Boxy Minivan body (Toyota Alphard / Freed style) */}
            <path fill={`url(#${gId})`} d="M12,37 L10,33 C10,29 11,20 16,19 L72,19 C75,19 78,20 80,24 L85,31 C87,35 86,37 84,37 Z" />
            
            {/* Side Window Glass */}
            <path fill="url(#mini-glass)" d="M22,21 L35,21 L35,27 L22,27 Z" />
            <path fill="url(#mini-glass)" d="M38,21 L55,21 L55,27 L38,27 Z" />
            <path fill="url(#mini-glass)" d="M58,21 L72,21 L70,27 L58,27 Z" />
            <path fill="url(#mini-glass)" d="M75,22 L80,27 L76,27 Z" />
            
            {/* Seams and door trims */}
            <path fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" d="M36,20 L36,36 M56,36 L56,20" />
            <rect x="52" y="28" width="3" height="1" fill="#d1d1d6" />
            <rect x="33" y="28" width="3" height="1" fill="#d1d1d6" />
            
            {/* Headlights and taillights */}
            <path fill="#ffffff" d="M83,30 L85,32 L83,34 Z" />
            <path fill="#FFD60A" opacity="0.8" d="M84,31 L85,32 L84,33 Z" />
            <path fill="#FF3B30" d="M10,23 L12,23 L12,28 L10,28 Z" />
            
            {/* Detailed alloy wheels */}
            <circle cx="28" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="28" cy="38" r="5.5" fill="#8e8e93" />
            <path d="M28,33 L28,43 M23,38 L33,38 M25,35 L31,41 M25,41 L31,35" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="28" cy="38" r="2" fill="#545456" />

            <circle cx="72" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="72" cy="38" r="5.5" fill="#8e8e93" />
            <path d="M72,33 L72,43 M67,38 L77,38 M69,35 L75,41 M69,41 L75,35" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="72" cy="38" r="2" fill="#545456" />
          </svg>
        );

      case 'suv':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="40%" stopColor={paintColor} />
                <stop offset="80%" stopColor={paintColorDark} />
                <stop offset="100%" stopColor={paintColorDarker} />
              </linearGradient>
              <linearGradient id="suv-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#121a24" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="42" ry="4.5" fill="rgba(0,0,0,0.22)" />
            <circle cx="28" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
            <circle cx="72" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
            
            {/* Harrier SUV Body */}
            <path fill={`url(#${gId})`} d="M12,35 L10,31 C9,27 12,20 18,19 C25,18 36,12 48,12 C62,12 76,15 82,22 C88,27 88,31 85,34 L83,38 L14,38 Z" />
            
            {/* Bottom plastic protection skirt */}
            <path fill="#2c2c2e" d="M10,34 L12,38 L83,38 L85,34 L82,35 L74,35 C74,33 70,30 66,32 L60,35 L34,35 C32,32 26,32 24,35 L12,35 Z" />
            
            {/* Window Glass */}
            <path fill="url(#suv-glass)" d="M30,20 L44,15 L56,15 L66,20 L64,26 L30,26 Z" />
            <rect x="43" y="15" width="2" height="11" fill="#1c1c1e" />
            <rect x="55" y="15" width="2" height="11" fill="#1c1c1e" />
            
            {/* Details */}
            <path fill="none" stroke="#d1d1d6" strokeWidth="0.8" d="M29,20 L44,14.5 L56,14.5 L67,20" />
            <rect x="36" y="28" width="5" height="1.5" rx="0.5" fill="#d1d1d6" />
            <rect x="48" y="28" width="5" height="1.5" rx="0.5" fill="#d1d1d6" />
            
            {/* Xenon Glow lights */}
            <path fill="#ffffff" d="M82,23 L85,25 L83,28 Z" />
            <path fill="#0A84FF" opacity="0.75" d="M83,24 L86,26 L84,28 Z" />
            <path fill="#FF453A" d="M10,24 L12,24 L13,28 L11,28 Z" />
            
            {/* Rims */}
            <circle cx="28" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="28" cy="38" r="6" fill="#8e8e93" />
            <path d="M28,32 L28,44 M22,38 L34,38 M24,34 L32,42 M24,42 L32,34" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="28" cy="38" r="2" fill="#545456" />

            <circle cx="72" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="72" cy="38" r="6" fill="#8e8e93" />
            <path d="M72,32 L72,44 M66,38 L78,38 M68,34 L76,42 M68,42 L76,34" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="72" cy="38" r="2" fill="#545456" />
          </svg>
        );

      case 'hatchback':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="40%" stopColor={paintColor} />
                <stop offset="85%" stopColor={paintColorDark} />
                <stop offset="100%" stopColor={paintColorDarker} />
              </linearGradient>
              <linearGradient id="hatch-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="38" ry="3.8" fill="rgba(0,0,0,0.18)" />
            <circle cx="28" cy="37" r="8.5" fill="rgba(0,0,0,0.25)" />
            <circle cx="68" cy="37" r="8.5" fill="rgba(0,0,0,0.25)" />
            
            {/* Honda Fit style body */}
            <path fill={`url(#${gId})`} d="M16,36 L12,33 C12,31 14,24 22,23 C30,22 38,16 46,16 C54,16 70,18 78,25 C86,32 84,35 80,36 Z" />
            
            {/* Windows */}
            <path fill="url(#hatch-glass)" d="M34,22 L45,18 L55,18 L65,22 L63,26 L34,26 Z" />
            <rect x="46" y="18" width="2" height="8" fill="#1c1c1e" />
            
            <rect x="36" y="28" width="4" height="1.2" rx="0.4" fill="#d1d1d6" />
            
            {/* Lights */}
            <path fill="#ffffff" d="M78,25 L81,27 L79,30 Z" />
            <path fill="#FFD60A" opacity="0.8" d="M79,26 L80,27 L79,28 Z" />
            <path fill="#FF3B30" d="M12,28 L14,28 L14,31 L12,31 Z" />
            
            {/* Rims */}
            <circle cx="28" cy="37" r="7" fill="#1c1c1e" />
            <circle cx="28" cy="37" r="5" fill="#8e8e93" />
            <path d="M28,32 L28,42 M23,37 L33,37" stroke="#ffffff" strokeWidth="0.6" />
            <circle cx="28" cy="37" r="2" fill="#545456" />

            <circle cx="68" cy="37" r="7" fill="#1c1c1e" />
            <circle cx="68" cy="37" r="5" fill="#8e8e93" />
            <path d="M68,32 L68,42 M63,37 L73,37" stroke="#ffffff" strokeWidth="0.6" />
            <circle cx="68" cy="37" r="2" fill="#545456" />
          </svg>
        );

      case 'sedan':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="45%" stopColor={paintColor} />
                <stop offset="85%" stopColor={paintColorDark} />
                <stop offset="100%" stopColor={paintColorDarker} />
              </linearGradient>
              <linearGradient id="sedan-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="40" ry="4" fill="rgba(0,0,0,0.18)" />
            <circle cx="28" cy="38" r="9.2" fill="rgba(0,0,0,0.25)" />
            <circle cx="72" cy="38" r="9.2" fill="rgba(0,0,0,0.25)" />
            
            {/* Aerodynamic Prius style sedan body */}
            <path fill={`url(#${gId})`} d="M15,35 L12,32 C12,32 15,26 22,25 C29,24 38,15 48,15 C58,15 78,17 84,26 C90,32 88,37 84,39 L15,39 Z" />
            
            {/* Windows */}
            <path fill="url(#sedan-glass)" d="M32,24 L45,17 L58,17 L68,24 L65,28 L32,28 Z" />
            <rect x="46" y="17" width="2" height="11" fill="#1c1c1e" />
            <rect x="58" y="17" width="1.5" height="11" fill="#1c1c1e" />
            
            <rect x="36" y="29" width="4" height="1.2" rx="0.4" fill="#d1d1d6" />
            <rect x="49" y="29" width="4" height="1.2" rx="0.4" fill="#d1d1d6" />
            
            {/* Lights */}
            <path fill="#ffffff" d="M83,27 L86,29 L84,32 Z" />
            <path fill="#0A84FF" opacity="0.8" d="M84,28 L85,29 L84,30 Z" />
            <path fill="#FF3B30" d="M11,31 L14,31 L14,35 L11,35 Z" />
            
            {/* Wheels */}
            <circle cx="28" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="28" cy="38" r="6" fill="#8e8e93" />
            <path d="M28,32 L28,44 M22,38 L34,38 M24,34 L32,42 M24,42 L32,34" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="28" cy="38" r="2" fill="#545456" />

            <circle cx="72" cy="38" r="8" fill="#1c1c1e" />
            <circle cx="72" cy="38" r="6" fill="#8e8e93" />
            <path d="M72,32 L72,44 M66,38 L78,38 M68,34 L76,42 M68,42 L76,34" stroke="#ffffff" strokeWidth="0.7" />
            <circle cx="72" cy="38" r="2" fill="#545456" />
          </svg>
        );

      // 🏍️ MOTORCYCLE BODIES
      case 'scooter':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="35" ry="3.5" fill="rgba(0,0,0,0.18)" />
            {/* Frame parts */}
            <path d="M22,38 L30,34 L46,34 L52,24 L56,16" stroke="#8e8e93" strokeWidth="2.5" fill="none" />
            <path fill="url(#gId)" d="M52,38 L58,24 L54,16 L48,16 L44,24 Z" />
            {/* Body covers */}
            <path fill="url(#gId)" d="M22,34 C25,28 35,26 44,28 L40,36 Z" />
            {/* Engine / Mechanical parts */}
            <rect x="36" y="34" width="12" height="6" fill="#3a3a3c" rx="1" />
            <circle cx="40" cy="37" r="2" fill="#8e8e93" />
            
            {/* Wheels with realistic thin spokes (Honda Cub classic) */}
            <circle cx="22" cy="38" r="10" fill="#1c1c1e" />
            <circle cx="22" cy="38" r="7.5" fill="#e5e5ea" />
            <path d="M22,30.5 L22,45.5 M14.5,38 L29.5,38 M16.7,32.7 L27.3,43.3 M16.7,43.3 L27.3,32.7" stroke="#8e8e93" strokeWidth="0.5" />
            <circle cx="22" cy="38" r="3" fill="#8e8e93" />

            <circle cx="78" cy="38" r="10" fill="#1c1c1e" />
            <circle cx="78" cy="38" r="7.5" fill="#e5e5ea" />
            <path d="M78,30.5 L78,45.5 M70.5,38 L85.5,38 M72.7,32.7 L83.3,43.3 M72.7,43.3 L83.3,32.7" stroke="#8e8e93" strokeWidth="0.5" />
            <circle cx="78" cy="38" r="3" fill="#8e8e93" />
          </svg>
        );

      case 'sportbike':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="35" ry="3.5" fill="rgba(0,0,0,0.2)" />
            {/* Mechanical details */}
            <path d="M25,38 L45,25 L65,25 L75,38" stroke="#3a3a3c" strokeWidth="3.5" fill="none" />
            <path d="M45,25 L50,15 L70,38" stroke="#1c1c1e" strokeWidth="3" fill="none" />
            <rect x="42" y="28" width="16" height="9" fill="#2c2c2e" rx="1.5" />
            
            {/* Painted Sport fairing */}
            <path fill="url(#gId)" d="M35,28 C32,25 35,22 45,21 C55,20 65,23 68,28 L56,33 Z" />
            <path fill="url(#gId)" d="M72,21 L78,21 L74,27 Z" />
            
            {/* Wheels */}
            <circle cx="22" cy="38" r="10" fill="#1c1c1e" />
            <circle cx="22" cy="38" r="6.5" fill="#8e8e93" />
            <path d="M22,31.5 L22,44.5 M15.5,38 L28.5,38" stroke="#ffffff" strokeWidth="1" />
            <circle cx="22" cy="38" r="3.5" fill="#1c1c1e" />

            <circle cx="78" cy="38" r="10" fill="#1c1c1e" />
            <circle cx="78" cy="38" r="6.5" fill="#8e8e93" />
            <path d="M78,31.5 L78,44.5 M71.5,38 L84.5,38" stroke="#ffffff" strokeWidth="1" />
            <circle cx="78" cy="38" r="3.5" fill="#1c1c1e" />
          </svg>
        );

      // 🚲 BICYCLE
      case 'velo':
      case 'standard':
        if (type === 'velo') {
          return (
            <svg viewBox="0 0 100 50" width="100%" height="100%">
              <ellipse cx="50" cy="43" rx="32" ry="3" fill="rgba(0,0,0,0.12)" />
              {/* Detailed bike frame */}
              <path d="M22,38 L45,38 L60,25 L35,25 Z" stroke={paintColor} strokeWidth="2" fill="none" />
              <path d="M22,38 L35,25 M45,38 L52,18" stroke={paintColor} strokeWidth="2" fill="none" />
              <path d="M28,21 L36,21" stroke="#1c1c1e" strokeWidth="1.8" fill="none" />
              <path d="M50,16 L56,16" stroke="#1c1c1e" strokeWidth="1.8" fill="none" />
              <circle cx="45" cy="38" r="3" fill="none" stroke="#e5e5ea" strokeWidth="1.2" />
              {/* Thin spoke wheels */}
              <circle cx="22" cy="38" r="10" stroke="#8e8e93" strokeWidth="1.2" fill="none" />
              <path d="M22,28 L22,48 M12,38 L32,38 M15,31 L29,45 M15,45 L29,31" stroke="#aeaeaf" strokeWidth="0.4" />
              <circle cx="78" cy="38" r="10" stroke="#8e8e93" strokeWidth="1.2" fill="none" />
              <path d="M78,28 L78,48 M68,38 L88,38 M71,31 L85,45 M71,45 L85,31" stroke="#aeaeaf" strokeWidth="0.4" />
            </svg>
          );
        } else if (type === 'bus') {
          return (
            <svg viewBox="0 0 100 50" width="100%" height="100%">
              <defs>
                <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={paintColorLight} />
                  <stop offset="50%" stopColor={paintColor} />
                  <stop offset="100%" stopColor={paintColorDark} />
                </linearGradient>
                <linearGradient id="bus-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#73a6e4" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#192330" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <ellipse cx="50" cy="43" rx="42" ry="4" fill="rgba(0,0,0,0.22)" />
              <circle cx="28" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
              <circle cx="72" cy="38" r="9" fill="rgba(0,0,0,0.3)" />
              
              {/* Isuzu Gala Highway Coach Bus body */}
              <path fill={`url(#${gId})`} d="M12,36 L12,16 Q12,14 15,14 L82,14 Q88,14 88,18 L88,36 Z" />
              
              {/* Windows */}
              <rect x="18" y="17" width="10" height="8" fill="url(#bus-glass)" />
              <rect x="31" y="17" width="10" height="8" fill="url(#bus-glass)" />
              <rect x="44" y="17" width="10" height="8" fill="url(#bus-glass)" />
              <rect x="57" y="17" width="10" height="8" fill="url(#bus-glass)" />
              <rect x="70" y="17" width="12" height="8" fill="url(#bus-glass)" />
              
              {/* Decal Lines */}
              <rect x="12" y="29" width="76" height="2.5" fill="#ffffff" opacity="0.8" />
              <rect x="12" y="32" width="76" height="1.2" fill="#FF9F0A" />
              
              <rect x="84" y="30" width="4" height="2" fill="#FFD60A" />
              <rect x="12" y="27" width="2" height="4" fill="#FF3B30" />
              
              {/* Axles */}
              <circle cx="28" cy="38" r="8" fill="#1c1c1e" />
              <circle cx="28" cy="38" r="4.5" fill="#8e8e93" stroke="#545456" strokeWidth="1" />
              
              <circle cx="72" cy="38" r="8" fill="#1c1c1e" />
              <circle cx="72" cy="38" r="4.5" fill="#8e8e93" stroke="#545456" strokeWidth="1" />
            </svg>
          );
        }
        break;
 
      // 🚚 TRUCK BODIES
      case 'flatbed':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="50%" stopColor={paintColor} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
              <linearGradient id="truck-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="42" ry="4" fill="rgba(0,0,0,0.22)" />
            
            {/* Chassis */}
            <rect x="10" y="34" width="78" height="4.5" fill="#1c1c1e" />
            
            {/* Cabin (Painted Isuzu Elf Cabin) */}
            <path fill={`url(#${gId})`} d="M64,34 L64,16 L76,16 Q84,16 84,23 L84,34 Z" />
            <path fill="url(#truck-glass)" d="M68,19 L76,19 L79,25 L68,25 Z" />
            
            {/* Flatbed Rails */}
            <rect x="12" y="26" width="51" height="8" fill="#d1d1d6" stroke="#8e8e93" strokeWidth="0.8" />
            <line x1="28" y1="26" x2="28" y2="34" stroke="#8e8e93" strokeWidth="0.8" />
            <line x1="44" y1="26" x2="44" y2="34" stroke="#8e8e93" strokeWidth="0.8" />
            
            {/* Wheels */}
            <circle cx="24" cy="38" r="7" fill="#1c1c1e" />
            <circle cx="24" cy="38" r="4" fill="#aeaeaf" />
            <circle cx="42" cy="38" r="7" fill="#1c1c1e" />
            <circle cx="42" cy="38" r="4" fill="#aeaeaf" />
            <circle cx="72" cy="38" r="7" fill="#1c1c1e" />
            <circle cx="72" cy="38" r="4" fill="#aeaeaf" />
          </svg>
        );

      case 'box_truck':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="50%" stopColor={paintColor} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
              <linearGradient id="container-sides" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e5e5ea" />
              </linearGradient>
              <linearGradient id="truck-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="44" ry="4.5" fill="rgba(0,0,0,0.22)" />
            <rect x="10" y="35" width="80" height="5" fill="#1c1c1e" />
            
            {/* Cabin (Painted) */}
            <path fill={`url(#${gId})`} d="M64,35 L64,15 L78,15 Q86,15 86,24 L86,35 Z" />
            <path fill="url(#truck-glass)" d="M68,18 L76,18 L81,25 L68,25 Z" />
            
            {/* Closed Aluminium Container Box */}
            <rect x="11" y="11" width="52" height="24" fill="url(#container-sides)" stroke="#8e8e93" strokeWidth="1" />
            <line x1="28" y1="11" x2="28" y2="35" stroke="#aeaeaf" strokeWidth="0.8" />
            <line x1="45" y1="11" x2="45" y2="35" stroke="#aeaeaf" strokeWidth="0.8" />
            
            {/* Wheels */}
            <circle cx="22" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="22" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="38" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="38" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="74" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="74" cy="39" r="4.2" fill="#aeaeaf" />
          </svg>
        );

      case 'wing_body':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="50%" stopColor={paintColor} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
              <linearGradient id="wing-container" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f2f2f7" />
                <stop offset="100%" stopColor="#d1d1d6" />
              </linearGradient>
              <linearGradient id="truck-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="44" ry="4.5" fill="rgba(0,0,0,0.22)" />
            <rect x="10" y="35" width="80" height="5" fill="#1c1c1e" />
            
            {/* Cabin (Painted Hino Ranger style) */}
            <path fill={`url(#${gId})`} d="M64,35 L64,15 L78,15 Q86,15 86,24 L86,35 Z" />
            <path fill="url(#truck-glass)" d="M68,18 L76,18 L81,25 L68,25 Z" />
            
            {/* Wing Container (Hino Wing Body side details) */}
            <rect x="11" y="11" width="52" height="24" fill="url(#wing-container)" stroke="#8e8e93" strokeWidth="1" />
            <line x1="11" y1="22" x2="63" y2="22" stroke="#8e8e93" strokeWidth="1.5" />
            <line x1="28" y1="11" x2="28" y2="35" stroke="#aeaeaf" strokeWidth="0.8" />
            <line x1="45" y1="11" x2="45" y2="35" stroke="#aeaeaf" strokeWidth="0.8" />
            
            {/* Wing hydraulic rod lines */}
            <line x1="14" y1="22" x2="14" y2="35" stroke="#8e8e93" strokeWidth="1" />
            <line x1="60" y1="22" x2="60" y2="35" stroke="#8e8e93" strokeWidth="1" />
            
            {/* Wheels */}
            <circle cx="22" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="22" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="38" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="38" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="74" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="74" cy="39" r="4.2" fill="#aeaeaf" />
          </svg>
        );

      case 'dump_truck':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="50%" stopColor={paintColor} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
              <linearGradient id="truck-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="40" ry="4" fill="rgba(0,0,0,0.22)" />
            <rect x="12" y="34" width="74" height="5.5" fill="#1c1c1e" />
            
            {/* Cabin (Painted) */}
            <path fill={`url(#${gId})`} d="M60,34 L60,18 L72,18 Q78,18 78,25 L78,34 Z" />
            <path fill="url(#truck-glass)" d="M64,21 L72,21 L74,27 L64,27 Z" />
            
            {/* Metal Cargo Bed (Realistic details, angle bars) */}
            <path fill="#8e8e93" d="M14,16 L56,16 L56,34 L14,34 Z" stroke="#3a3a3c" strokeWidth="1" />
            <line x1="20" y1="16" x2="20" y2="34" stroke="#545456" strokeWidth="1.2" />
            <line x1="32" y1="16" x2="32" y2="34" stroke="#545456" strokeWidth="1.2" />
            <line x1="44" y1="16" x2="44" y2="34" stroke="#545456" strokeWidth="1.2" />
            
            {/* Wheels */}
            <circle cx="26" cy="38" r="7.5" fill="#1c1c1e" />
            <circle cx="26" cy="38" r="4.2" fill="#aeaeaf" />
            <circle cx="44" cy="38" r="7.5" fill="#1c1c1e" />
            <circle cx="44" cy="38" r="4.2" fill="#aeaeaf" />
            <circle cx="69" cy="38" r="7.5" fill="#1c1c1e" />
            <circle cx="69" cy="38" r="4.2" fill="#aeaeaf" />
          </svg>
        );

      case 'trailer_container':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <defs>
              <linearGradient id={gId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={paintColorLight} />
                <stop offset="50%" stopColor={paintColor} />
                <stop offset="100%" stopColor={paintColorDark} />
              </linearGradient>
              <linearGradient id="container-body" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e5e5ea" />
              </linearGradient>
              <linearGradient id="truck-glass" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4a90e2" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#121820" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="43" rx="46" ry="4.8" fill="rgba(0,0,0,0.25)" />
            <rect x="6" y="36" width="88" height="5" fill="#1c1c1e" />
            
            {/* Cabin/Tractor (Paint color) */}
            <path fill={`url(#${gId})`} d="M68,36 L68,14 L82,14 Q88,14 88,22 L88,36 Z" />
            <path fill="url(#truck-glass)" d="M72,17 L80,17 L84,24 L72,24 Z" />
            <path fill={`url(#${gId})`} opacity="0.8" d="M68,14 L80,11 L82,14 Z" />
            
            {/* Long Trailer Box (Container seams) */}
            <rect x="8" y="13" width="56" height="23" fill="url(#container-body)" stroke="#8e8e93" strokeWidth="1" />
            <line x1="22" y1="13" x2="22" y2="36" stroke="#d1d1d6" strokeWidth="0.8" />
            <line x1="36" y1="13" x2="36" y2="36" stroke="#d1d1d6" strokeWidth="0.8" />
            <line x1="50" y1="13" x2="50" y2="36" stroke="#d1d1d6" strokeWidth="0.8" />
            
            {/* Wheels */}
            <circle cx="16" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="16" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="32" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="32" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="48" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="48" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="73" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="73" cy="39" r="4.2" fill="#aeaeaf" />
            <circle cx="83" cy="39" r="7.5" fill="#1c1c1e" />
            <circle cx="83" cy="39" r="4.2" fill="#aeaeaf" />
          </svg>
        );

      default: {
        let fallbackBodyStyle = 'sedan';
        if (type === 'moto') fallbackBodyStyle = 'scooter';
        else if (type === 'velo') fallbackBodyStyle = 'standard';
        else if (type === 'truck_3t') fallbackBodyStyle = 'box_truck';
        else if (type === 'truck_4t') fallbackBodyStyle = 'wing_body';
        else if (type === 'trailer') fallbackBodyStyle = 'trailer_container';
        else if (type === 'bus') fallbackBodyStyle = 'standard';
        
        if (bodyStyle !== fallbackBodyStyle) {
          return renderVehicleSVG(type, fallbackBodyStyle, color);
        }
        return null;
      }
    }
  };

  const renderJDMPlateBox = (plate, isPreview = false) => {
    const prefecture = plate.platePrefecture || '練馬';
    const classCode = plate.plateClass || '300';
    const hira = plate.plateHira || 'あ';
    const number = plate.plateNumber || '12-34';
    const plateType = plate.plateType || (plate.isCommercial ? 'commercial' : 'private');

    let bg = 'linear-gradient(135deg, #f8f9fa, #ffffff)';
    let border = '2.5px solid #2c3e2d';
    let textColor = '#24522a';
    let boltBg = '#8e8e93';
    let hasBgGraphic = false;
    let bgGraphicSvg = null;
    let shadow = '0.5px 0.5px 0px rgba(255,255,255,0.8), -0.5px -0.5px 0px rgba(0,0,0,0.15)';

    if (plateType === 'commercial') {
      bg = 'linear-gradient(135deg, #1b3d20, #24522a)';
      border = '2.5px solid #ffffff';
      textColor = '#ffffff';
      shadow = '0.5px 0.5px 0px rgba(0,0,0,0.4), -0.5px -0.5px 0px rgba(255,255,255,0.2)';
    } else if (plateType === 'kei_private') {
      bg = 'linear-gradient(135deg, #ffd83b, #ffd60a)';
      border = '2.5px solid #1c1c1e';
      textColor = '#1c1c1e';
    } else if (plateType === 'kei_commercial') {
      bg = 'linear-gradient(135deg, #2c2c2e, #1c1c1e)';
      border = '2.5px solid #ffd60a';
      textColor = '#ffd60a';
      shadow = '0.5px 0.5px 0px rgba(0,0,0,0.4), -0.5px -0.5px 0px rgba(255,255,255,0.2)';
    } else if (plateType === 'illustrated_fuji') {
      bg = 'linear-gradient(to bottom, #b3e5fc, #e1f5fe, #ffffff)';
      border = '2.5px solid #24522a';
      textColor = '#24522a';
      hasBgGraphic = true;
      bgGraphicSvg = (
        <svg viewBox="0 0 100 50" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '80%', opacity: 0.85, pointerEvents: 'none' }}>
          {/* Mount Fuji silhouette */}
          <path d="M10,50 L42,24 L58,24 L90,50 Z" fill="#7bb9e8" />
          {/* White Snowcap */}
          <path d="M42,24 L48,18 Q50,16 52,18 L58,24 L54,28 Q50,26 46,28 Z" fill="#ffffff" />
        </svg>
      );
    } else if (plateType === 'illustrated_expo') {
      bg = 'linear-gradient(135deg, #f8f9fa, #ffffff)';
      border = '2.5px solid #ff3b30';
      textColor = '#1c1c1e';
      hasBgGraphic = true;
      bgGraphicSvg = (
        <svg viewBox="0 0 100 50" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.8, pointerEvents: 'none' }}>
          {/* Expo mascot red bubbles on borders */}
          <circle cx="8" cy="8" r="5" fill="#ff3b30" />
          <circle cx="18" cy="6" r="4" fill="#ff3b30" />
          <circle cx="92" cy="12" r="6" fill="#ff3b30" />
          <circle cx="91" cy="22" r="4" fill="#ff3b30" />
          <circle cx="10" cy="42" r="5" fill="#ffffff" stroke="#ff3b30" strokeWidth="2" />
          <circle cx="88" cy="42" r="5" fill="#ff3b30" />
          {/* Mascot eye dots */}
          <circle cx="92" cy="12" r="1.5" fill="#ffffff" />
          <circle cx="92" cy="12" r="0.5" fill="#007aff" />
        </svg>
      );
    } else if (plateType === 'illustrated_flower') {
      bg = 'linear-gradient(135deg, #fff0f5, #ffe4e1)';
      border = '2.5px solid #ff2d55';
      textColor = '#881b37';
      hasBgGraphic = true;
      bgGraphicSvg = (
        <svg viewBox="0 0 100 50" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.9, pointerEvents: 'none' }}>
          {/* Pink cherry blossoms in corners */}
          <g transform="translate(12, 12)">
            <circle cx="0" cy="0" r="4" fill="#ff6b8b" />
            <circle cx="-3" cy="-3" r="3.5" fill="#ff8da1" opacity="0.9" />
            <circle cx="3" cy="-3" r="3.5" fill="#ff8da1" opacity="0.9" />
            <circle cx="3" cy="3" r="3.5" fill="#ff8da1" opacity="0.9" />
            <circle cx="-3" cy="3" r="3.5" fill="#ff8da1" opacity="0.9" />
            <circle cx="0" cy="0" r="1" fill="#ffd60a" />
          </g>
          <g transform="translate(88, 38)">
            <circle cx="0" cy="0" r="4.5" fill="#ff6b8b" />
            <circle cx="-3.5" cy="-3.5" r="4" fill="#ff8da1" opacity="0.9" />
            <circle cx="3.5" cy="-3.5" r="4" fill="#ff8da1" opacity="0.9" />
            <circle cx="3.5" cy="3.5" r="4" fill="#ff8da1" opacity="0.9" />
            <circle cx="-3.5" cy="3.5" r="4" fill="#ff8da1" opacity="0.9" />
            <circle cx="0" cy="0" r="1" fill="#ffd60a" />
          </g>
          <path d="M50,8 Q52,5 50,2 Q48,5 50,8 Z" fill="#ffb7c5" transform="rotate(15 50 8)" />
          <path d="M70,15 Q72,12 70,9 Q68,12 70,15 Z" fill="#ffb7c5" transform="rotate(-30 70 15)" />
        </svg>
      );
    } else if (plateType === 'illustrated_matsudo') {
      bg = 'linear-gradient(135deg, #fff0f5 0%, #e0f2f1 100%)';
      border = '2.5px solid #2e7d32';
      textColor = '#1c4224';
      hasBgGraphic = true;
      bgGraphicSvg = (
        <svg viewBox="0 0 100 50" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.9, pointerEvents: 'none' }}>
          {/* Tokiwadaira Sakura (Top Left pink branch) */}
          <g transform="translate(12, 10)">
            <circle cx="0" cy="0" r="3.5" fill="#ff6b8b" />
            <circle cx="-2.5" cy="-2.5" r="3" fill="#ff8da1" opacity="0.85" />
            <circle cx="2.5" cy="-2.5" r="3" fill="#ff8da1" opacity="0.85" />
            <circle cx="2.5" cy="2.5" r="3" fill="#ff8da1" opacity="0.85" />
            <circle cx="-2.5" cy="2.5" r="3" fill="#ff8da1" opacity="0.85" />
            <circle cx="0" cy="0" r="0.75" fill="#ffd60a" />
          </g>
          <g transform="translate(24, 7)">
            <circle cx="0" cy="0" r="2.5" fill="#ff8da1" opacity="0.8" />
            <circle cx="-2" cy="-2" r="2" fill="#ffccd5" opacity="0.8" />
            <circle cx="2" cy="-2" r="2" fill="#ffccd5" opacity="0.8" />
            <circle cx="2" cy="2" r="2" fill="#ffccd5" opacity="0.8" />
            <circle cx="-2" cy="2" r="2" fill="#ffccd5" opacity="0.8" />
          </g>
          {/* Hondo-ji Ajisai Hydrangeas (Bottom Right) */}
          <g transform="translate(88, 38)">
            <circle cx="-3" cy="-3" r="2.5" fill="#8c9eff" opacity="0.85" />
            <circle cx="2" cy="-3" r="2.5" fill="#b388ff" opacity="0.85" />
            <circle cx="-2" cy="2" r="2.5" fill="#80d8ff" opacity="0.85" />
            <circle cx="2" cy="2" r="2.5" fill="#b388ff" opacity="0.85" />
            <circle cx="0" cy="0" r="3" fill="#8c9eff" opacity="0.9" />
          </g>
          {/* Yagiri no Watashi Boat (Bottom Left/Center) */}
          <g transform="translate(45, 41)">
            {/* Water Waves */}
            <path d="M-25,3 Q-15,1 -5,3 Q5,1 15,3 Q25,1 35,3" fill="none" stroke="#4fc3f7" strokeWidth="0.75" />
            {/* Simple rowboat */}
            <path d="M-8,1 L8,1 L11,-1 L-6,-1 Z" fill="#8d6e63" />
            {/* Boatman / Passenger silhouette */}
            <circle cx="0" cy="-4" r="1.5" fill="#5d4037" />
            <path d="M-1.5,-2.5 L1.5,-2.5 L1,1 L-1,1 Z" fill="#5d4037" />
            <line x1="-3" y1="-1" x2="-8" y2="4" stroke="#3e2723" strokeWidth="0.5" />
          </g>
        </svg>
      );
    }

    const scale = isPreview ? 'scale(1.1)' : 'scale(1.2)';

    return (
      <div className={`jdm-plate-box ${plateType}`} style={{
        width: '120px',
        height: '72px',
        border: border,
        borderRadius: '5px',
        background: bg,
        color: textColor,
        padding: '4px 6px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        fontFamily: '"Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
        transform: scale,
        overflow: 'hidden'
      }}>
        {hasBgGraphic && bgGraphicSvg}
        
        {/* Left Screw Slotted Bolt */}
        <svg viewBox="0 0 10 10" style={{ position: 'absolute', top: '6px', left: '14px', width: '6px', height: '6px', zIndex: 2 }}>
          <circle cx="5" cy="5" r="4.5" fill="#d1d1d6" stroke="#48484a" strokeWidth="0.75" />
          <line x1="2.5" y1="5" x2="7.5" y2="5" stroke="#3a3a3c" strokeWidth="1" />
        </svg>

        {/* Right Screw Slotted Bolt */}
        <svg viewBox="0 0 10 10" style={{ position: 'absolute', top: '6px', right: '14px', width: '6px', height: '6px', zIndex: 2 }}>
          <circle cx="5" cy="5" r="4.5" fill="#d1d1d6" stroke="#48484a" strokeWidth="0.75" />
          <line x1="5" y1="2.5" x2="5" y2="7.5" stroke="#3a3a3c" strokeWidth="1" />
        </svg>

        {/* JDM Top Row (Prefecture and Class Code spaced between bolts) */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          fontSize: '9.5px', 
          lineHeight: 1, 
          padding: '0 26px', 
          marginTop: '3px', 
          zIndex: 2, 
          position: 'relative',
          fontWeight: '900',
          textShadow: shadow
        }}>
          <span>{prefecture}</span>
          <span>{classCode}</span>
        </div>

        {/* JDM Main Row (Hiragana Calligraphy Left, 4-digit number Right) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 6px', 
          marginBottom: '2px', 
          zIndex: 2, 
          position: 'relative',
          textShadow: shadow
        }}>
          <span style={{ 
            fontSize: '14px', 
            fontFamily: '"Hiragino Mincho ProN", serif', 
            fontWeight: 'bold' 
          }}>{hira}</span>
          <span style={{ 
            fontSize: '19px', 
            letterSpacing: '1px', 
            fontWeight: '900' 
          }}>{number}</span>
        </div>
      </div>
    );
  };

  const getProfileLangText = (key) => {
    const lang = i18n.language || 'uz';
    const dict = {
      plateDesignLabel: {
        uz: "🖼️ Avtoraqam turi",
        ja: "🖼️ ナンバープレートデザイン",
        en: "🖼️ License Plate Design"
      },
      driverBadgeLabel: {
        uz: "🔰 Haydovchi belgisi",
        ja: "🔰 運転者マーク",
        en: "🔰 Driver Badge"
      },
      prefectureLabel: {
        uz: "Prefektura (Hudud)",
        ja: "地名 (陸運局)",
        en: "Prefecture (LTO)"
      },
      classCodeLabel: {
        uz: "Klass kodi",
        ja: "分類番号",
        en: "Class Code"
      },
      hiraLabel: {
        uz: "Hiragana",
        ja: "ひらがな",
        en: "Hiragana"
      },
      numLabel: {
        uz: "Raqam (masalan, 12-34)",
        ja: "一連指定番号 (例 12-34)",
        en: "Number (e.g. 12-34)"
      },
      constructorTitle: {
        uz: "🇯🇵 Yaponiya Standartidagi Avtoraqam (JDM Plate Constructor):",
        ja: "🇯🇵 日本のナンバープレート作成 (JDM Constructor):",
        en: "🇯🇵 Japanese License Plate Constructor (JDM):"
      },
      opt_private: {
        uz: "⬜ Shaxsiy standart (Oq rangli)",
        ja: "⬜ 自家用・普通車 (白色)",
        en: "⬜ Private Standard (White)"
      },
      opt_commercial: {
        uz: "🟩 Tijoriy standart (Yashil rangli)",
        ja: "🟩 事業用・普通車 (緑色)",
        en: "🟩 Commercial Standard (Green)"
      },
      opt_kei_private: {
        uz: "🟨 Kei-car shaxsiy (Sariq rangli)",
        ja: "🟨 自家用・軽自動車 (黄色)",
        en: "🟨 Kei-car Private (Yellow)"
      },
      opt_kei_commercial: {
        uz: "⬛ Kei-car tijoriy (Qora rangli)",
        ja: "⬛ 事業用・軽自動車 (黒色)",
        en: "⬛ Kei-car Commercial (Black)"
      },
      opt_illustrated_fuji: {
        uz: "🗻 Fuji tog'i tasvirli (Art Plate)",
        ja: "🗻 富士山 図柄入りプレート (Art Plate)",
        en: "🗻 Mount Fuji Art Plate"
      },
      opt_illustrated_expo: {
        uz: "🔴 Osaka Expo 2025 esdalik raqami",
        ja: "🔴 大阪・関西万博 記念プレート (EXPO 2025)",
        en: "🔴 Osaka Expo 2025 Commemorative"
      },
      opt_illustrated_flower: {
        uz: "🌸 Sakura va Nanohana gullari (Milliy)",
        ja: "🌸 全国花柄図柄入りプレート (桜と菜の花)",
        en: "🌸 National Sakura & Canola Flowers"
      },
      opt_illustrated_matsudo: {
        uz: "🏞️ Matsudo mahalliy tasvirli raqami (Sakura, Ajisai & Yagiri boat)",
        ja: "🏞️ 松戸版図柄入りナンバー (桜・あじさい・矢切の渡し)",
        en: "🏞️ Matsudo Local Plate (Sakura, Ajisai & Yagiri)"
      },
      opt_badge_none: {
        uz: "❌ Maxsus belgisiz (Standart)",
        ja: "❌ 特殊マークなし (標準)",
        en: "❌ No Special Badge (Standard)"
      },
      opt_badge_beginner: {
        uz: "🔰 Shoshinsha (Yangi haydovchi)",
        ja: "🔰 初心者マーク (若葉マーク)",
        en: "🔰 Beginner Mark (Wakaba)"
      },
      opt_badge_elderly: {
        uz: "🍀 Koreisha (Yoshi katta)",
        ja: "🍀 高齢運転者マーク (もみじ)",
        en: "🍀 Elderly Driver Mark (Yotsuba)"
      },
      opt_badge_disabled: {
        uz: "♿ Nogironligi bor",
        ja: "♿ 身体障害者マーク (車椅子)",
        en: "♿ Physical Disability Mark"
      },
      opt_badge_hearing: {
        uz: "🦋 Eshitish cheklangan",
        ja: "🦋 聴覚障害者マーク (蝶マーク)",
        en: "🦋 Hearing Impaired Mark"
      },
      myVehicleTitle: {
        uz: "Mening Mashinam",
        ja: "マイカー (登録車両)",
        en: "My Vehicle"
      },
      editVehicle: {
        uz: "Tahrirlash",
        ja: "編集",
        en: "Edit"
      },
      vehicleTypeLabel: {
        uz: "Transport turi",
        ja: "車種・カテゴリー",
        en: "Vehicle Category"
      },
      vehicleModelLabel: {
        uz: "Rusumi / Modeli",
        ja: "メーカー・モデル",
        en: "Make & Model"
      },
      vehicleBodyStyleLabel: {
        uz: "Kuzov shakli",
        ja: "ボディタイプ",
        en: "Body Style"
      },
      vehicleYearLabel: {
        uz: "Yili",
        ja: "年式",
        en: "Year"
      },
      vehicleColorLabel: {
        uz: "Moshina rangi",
        ja: "ボディカラー",
        en: "Vehicle Color"
      },
      vehicleDimensionsLabel: {
        uz: "Avtotransport o'lchamlari (Navigatsiya uchun)",
        ja: "車両寸法 (ナビゲーション用)",
        en: "Vehicle Dimensions (for Navigation)"
      },
      heightLabel: {
        uz: "Balandlik",
        ja: "車高 (高さ)",
        en: "Height"
      },
      widthLabel: {
        uz: "Eni",
        ja: "車幅 (幅)",
        en: "Width"
      },
      lengthLabel: {
        uz: "Uzunlik",
        ja: "全長 (長さ)",
        en: "Length"
      },
      weightLabel: {
        uz: "Vazni",
        ja: "車両重量 (重さ)",
        en: "Weight"
      },
      // Vehicle types
      type_car: {
        uz: "Yengil avto",
        ja: "乗用車 (普通・軽)",
        en: "Passenger Car"
      },
      type_moto: {
        uz: "Motosikl",
        ja: "二輪車 (バイク)",
        en: "Motorcycle"
      },
      type_velo: {
        uz: "Velosiped",
        ja: "自転車",
        en: "Bicycle"
      },
      type_truck_3t: {
        uz: "3t Yuk mashinasi",
        ja: "3t トラック",
        en: "3t Truck"
      },
      type_truck_4t: {
        uz: "4t Yuk mashinasi",
        ja: "4t トラック",
        en: "4t Truck"
      },
      type_trailer: {
        uz: "Trailer (Katta yuk)",
        ja: "大型トレーラー",
        en: "Trailer (Heavy Cargo)"
      },
      type_bus: {
        uz: "Avtobus",
        ja: "バス",
        en: "Bus"
      },
      type_kei_truck: {
        uz: "軽トラ (Kei Truck)",
        ja: "軽トラック",
        en: "Kei Truck"
      },
      type_truck_2t: {
        uz: "2t Yuk mashinasi",
        ja: "2t トラック",
        en: "2t Truck"
      },
      type_truck_10t: {
        uz: "10t Yuk mashinasi",
        ja: "10t トラック (大型)",
        en: "10t Truck"
      },
      type_tanker: {
        uz: "Tanker (Avtosisterna)",
        ja: "タンクローリー",
        en: "Tanker Truck"
      },
      axleLoadLabel: {
        uz: "O'q yuki",
        ja: "軸重",
        en: "Axle Load"
      },
      minTurnRadiusLabel: {
        uz: "Burilish radiusi",
        ja: "最小回転半径",
        en: "Turn Radius"
      },

      // Body styles
      body_sedan: {
        uz: "Sedan",
        ja: "セダン",
        en: "Sedan"
      },
      body_hatchback: {
        uz: "Hatchback",
        ja: "ハッチバック",
        en: "Hatchback"
      },
      body_suv: {
        uz: "SUV (Krossover)",
        ja: "SUV (クロスカントリー)",
        en: "SUV"
      },
      body_minivan: {
        uz: "Minivan / MPV",
        ja: "ミニバン (ワンボックス)",
        en: "Minivan / MPV"
      },
      body_scooter: {
        uz: "Motoroller",
        ja: "スクーター (カブ)",
        en: "Scooter"
      },
      body_sportbike: {
        uz: "Sportbayk",
        ja: "スポーツバイク",
        en: "Sportbike"
      },
      body_flatbed: {
        uz: "Ochiq bortli",
        ja: "平ボディ",
        en: "Flatbed"
      },
      body_box_truck: {
        uz: "Furgon (Yopiq)",
        ja: "バン・箱型",
        en: "Box Truck"
      },
      body_wing_body: {
        uz: "Wing Body",
        ja: "ウィングボディ",
        en: "Wing Body"
      },
      body_dump_truck: {
        uz: "Samosval",
        ja: "ダンプ",
        en: "Dump Truck"
      },
      body_trailer_container: {
        uz: "Tirkamali",
        ja: "コンテナトレーラー",
        en: "Container Trailer"
      },
      body_standard: {
        uz: "Standart",
        ja: "標準仕様",
        en: "Standard"
      }
    };
    if (dict[key]) {
      return dict[key][lang] || dict[key]['uz'];
    }
    return '';
  };

  const renderDriverMarkBadge = (mark) => {
    switch (mark) {
      case 'beginner':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#34c759', fontWeight: 'bold' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ verticalAlign: 'middle' }}>
              <path d="M12,2 L4,8 L4,15 C4,19 8,22 12,23 C16,22 20,19 20,15 L20,8 Z" fill="#ffd60a" />
              <path d="M12,2 L4,8 L4,15 C4,19 8,22 12,23 Z" fill="#30d158" />
            </svg>
            <span>{getProfileLangText('opt_badge_beginner')}</span>
          </div>
        );
      case 'elderly':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 159, 10, 0.1)', border: '1px solid rgba(255, 159, 10, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#ff9f0a', fontWeight: 'bold' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ verticalAlign: 'middle' }}>
              <circle cx="9" cy="9" r="4.5" fill="#FF9F0A" />
              <circle cx="15" cy="9" r="4.5" fill="#FFD60A" />
              <circle cx="15" cy="15" r="4.5" fill="#30D158" />
              <circle cx="9" cy="15" r="4.5" fill="#30B0C7" />
              <path d="M12,7 L12,17 M7,12 L17,12" stroke="#ffffff" strokeWidth="1.2" />
            </svg>
            <span>{getProfileLangText('opt_badge_elderly')}</span>
          </div>
        );
      case 'disabled':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(10, 132, 255, 0.1)', border: '1px solid rgba(10, 132, 255, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#0a84ff', fontWeight: 'bold' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ verticalAlign: 'middle' }}>
              <circle cx="12" cy="12" r="10" fill="#0A84FF" />
              <circle cx="12" cy="8" r="2" fill="#ffffff" />
              <path d="M14,13 H11 V10 H13 M9,16 A3,3 0 1,1 12,13" stroke="#ffffff" strokeWidth="1.5" fill="none" />
            </svg>
            <span>{getProfileLangText('opt_badge_disabled')}</span>
          </div>
        );
      case 'hearing':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(48, 176, 199, 0.1)', border: '1px solid rgba(48, 176, 199, 0.3)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#30b0c7', fontWeight: 'bold' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" style={{ verticalAlign: 'middle' }}>
              <circle cx="12" cy="12" r="10" fill="#ffd60a" />
              <path d="M12,8 C9,5 7,12 12,15 C17,12 15,5 12,8 Z" fill="#30d158" />
              <path d="M12,16 C9,19 7,12 12,9 C17,12 15,19 12,16 Z" fill="#30d158" />
              <circle cx="12" cy="12" r="2" fill="#ffd60a" />
            </svg>
            <span>{getProfileLangText('opt_badge_hearing')}</span>
          </div>
        );
      default:
        return null;
    }
  };

  


const getLicenseLabel = (type) => {
    const labels = {
      'Oogata': 'Large Truck (Oogata)',
      'Chugata': 'Medium Truck (Chugata)',
      'JunChugata': 'Semi-Medium (Jun-Chugata)',
      'Tokushu': 'Special Vehicle (Tokushu)',
      'Futsu': 'Ordinary Vehicle (Futsu)',
    };
    return labels[type] || type;
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'driver': return t('roleDriver');
      case 'company': return t('roleCompanyLabel');
      case 'school': return t('roleSchool');
      default: return t('roleGuest');
    }
  };

  const getAvatarSrc = () => {
    if (profileData.avatar) return profileData.avatar;
    const name = encodeURIComponent(profileData.fullName || 'User');
    const bg = userRole === 'company' ? 'AF52DE' : '0A84FF';
    return `https://ui-avatars.com/api/?name=${name}&background=${bg}&color=fff`;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 600, 0.7);
        onUpdateProfile({ avatar: compressed });
        localStorage.setItem('michi_avatar', compressed);
      } catch (err) {
        console.error("Avatar compression failed:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          onUpdateProfile({ avatar: reader.result });
          localStorage.setItem('michi_avatar', reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const startEditing = () => {
    setEditData({ ...profileData });
    setIsEditing(true);
  };

  const saveEditing = () => {
    const filteredAddress = (editData.addressHistory || []).filter(a => a.address);
    const filteredEdu = (editData.educationHistory || []).filter(e => e.school || e.major);

    const fallbackAddress = filteredAddress.map(a => a.address + (a.isCurrent ? ` (${t('currentAddressLabel', 'Hozirgi')})` : '')).join(', ');
    const fallbackEducation = filteredEdu.map(e => `${e.school}${e.major ? ` (${e.major})` : ''} • ${e.startDate || ''} ~ ${e.isCurrent ? t('currentlyStudyingLabel', 'O\'qiyotgan') : e.endDate || ''}`).join(', ');

    const finalData = {
      ...editData,
      addressHistory: filteredAddress,
      educationHistory: filteredEdu,
      address: fallbackAddress || editData.address,
      education: fallbackEducation || editData.education
    };
    onUpdateProfile(finalData);
    setIsEditing(false);
  };

  const addEditAddressEntry = () => {
    const list = editData.addressHistory || [];
    if (list.length < 3) {
      setEditData({ ...editData, addressHistory: [...list, { address: '', isCurrent: false }] });
    }
  };

  const removeEditAddressEntry = (index) => {
    const list = editData.addressHistory || [];
    setEditData({ ...editData, addressHistory: list.filter((_, i) => i !== index) });
  };

  const updateEditAddressEntry = (index, field, value) => {
    const list = editData.addressHistory || [];
    const updated = list.map((entry, i) => {
      if (i === index) {
        return { ...entry, [field]: value };
      } else {
        if (field === 'isCurrent' && value === true) {
          return { ...entry, isCurrent: false };
        }
        return entry;
      }
    });
    setEditData({ ...editData, addressHistory: updated });
  };

  const addEditEducationEntry = () => {
    const list = editData.educationHistory || [];
    if (list.length < 3) {
      setEditData({ ...editData, educationHistory: [...list, { school: '', major: '', startDate: '', endDate: '', isCurrent: false }] });
    }
  };

  const removeEditEducationEntry = (index) => {
    const list = editData.educationHistory || [];
    setEditData({ ...editData, educationHistory: list.filter((_, i) => i !== index) });
  };

  const updateEditEducationEntry = (index, field, value) => {
    const list = editData.educationHistory || [];
    const updated = list.map((entry, i) => {
      if (i === index) {
        let entryCopy = { ...entry, [field]: value };
        if (field === 'isCurrent' && value === true) {
          entryCopy.endDate = '';
        }
        return entryCopy;
      }
      return entry;
    });
    setEditData({ ...editData, educationHistory: updated });
  };

  // ===== RESUME BUILDER PAGE =====
  if (activePage === 'resume_builder') {
    return (
      <ResumeBuilder 
        profileData={profileData}
        onUpdateProfile={onUpdateProfile}
        isVoiceActive={isVoiceActive}
        setIsVoiceActive={setIsVoiceActive}
        isVoiceStandby={isVoiceStandby}
        setIsVoiceStandby={setIsVoiceStandby}
        onBack={() => {
          if (profileActivePageSource === 'home') {
            if (onNavigate) onNavigate('home');
          } else {
            setActivePage('main');
          }
        }}
      />
    );
  }

  // ===== NOTIFICATIONS PAGE =====
  if (activePage === 'notifications') {
    return (
      <div className="profile-container fade-in">
        <div className="profile-sticky-back">
          <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
        </div>
        <div className="sub-page-header" style={{ paddingTop: '56px' }}>
          <div className="sub-header-row">
            <h2>
              {t('notifications')}
              <span className="section-header-count">({notifications.length})</span>
            </h2>
            {unreadCount > 0 && (
              <button className="mark-all-btn" onClick={onMarkAllRead}>
                {t('markAllRead')}
              </button>
            )}
          </div>
        </div>
        <div className="notif-list">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} color="#8E8E93" />
              <p>{t('noNotifications')}</p>
            </div>
          ) : (
            [...notifications].sort((a, b) => {
              // 1. O'qilmagan bildirishnomalar har doim tepada turadi
              if (!a.read && b.read) return -1;
              if (a.read && !b.read) return 1;
              // 2. Yangi bildirishnomalar (ID bo'yicha eng oxirgilari) tepada turadi, eskilari esa pastga tushadi
              return b.id - a.id;
            }).map(notif => (
              <div 
                key={notif.id} 
                className={`notif-item glass squircle ${!notif.read ? 'unread' : 'read'}`}
                onClick={() => onMarkRead(notif.id)}
              >
                {!notif.read && <div className="notif-indicator"></div>}
                <div className="notif-content">
                  <div className="notif-title-row">
                    <span className={`notif-title ${notif.type === 'shoukai_paid' ? 'shoukai-green' : ''}`}>
                      {notif.type === 'accepted' && t('acceptedNotifTitle')}
                      {notif.type === 'interview' && t('interviewNotifTitle')}
                      {notif.type === 'reviewed' && t('reviewedNotifTitle', 'Ariza ko\'rib chiqildi')}
                      {notif.type === 'rejected' && t('rejectedNotifTitle', 'Ariza rad etildi')}
                      {notif.type === 'shoukai_paid' && t('shoukaiPaidNotif')}
                      {notif.type === 'employee_request' && notif.title}
                    </span>
                    {!notif.read && <span className="notif-new-badge">{t('newNotification')}</span>}
                  </div>
                  <p className="notif-message">
                    {notif.type === 'accepted' && `${t('acceptedNotifMsg')} ${notif.company}`}
                    {notif.type === 'interview' && `${t('interviewNotifMsg')} ${notif.company}`}
                    {notif.type === 'reviewed' && `${t('reviewedNotifMsg', 'Arizangiz ko\'rib chiqildi:')} ${notif.company}`}
                    {notif.type === 'rejected' && `${t('rejectedNotifMsg', 'Arizangiz rad etildi:')} ${notif.company}`}
                    {notif.type === 'shoukai_paid' && `${notif.company} ${t('shoukaiPaidMsg')} ${notif.title}`}
                    {notif.type === 'employee_request' && `${notif.company} ${t('employeeRequestMsg', "kompaniyasi sizni xodimlar ro'yxatiga qo'shmoqchi.")}`}
                  </p>
                  {notif.type === 'employee_request' && !notif.accepted && (
                    <button 
                      className="demo-btn accepted" 
                      style={{ marginTop: '8px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Mark as accepted locally
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, accepted: true, read: true } : n));
                        // Trigger logic
                        if (onAcceptEmployeeRequest) {
                          onAcceptEmployeeRequest(notif.michiId, notif.company);
                        }
                        // Alert user
                        alert(t('employeeConfirmed', 'Xodimlik tasdiqlandi!'));
                      }}
                    >
                      {t('confirmBtn', 'Tasdiqlash (Qabul qilish)')}
                    </button>
                  )}
                  {notif.type === 'employee_request' && notif.accepted && (
                    <span style={{ color: '#34C759', fontSize: '12px', marginTop: '8px', display: 'inline-block' }}>{t('confirmedStatus', 'Tasdiqlangan ✓')}</span>
                  )}
                  <span className="notif-date" style={{ display: 'block', marginTop: '4px' }}>{notif.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ===== SETTINGS PAGE =====
  if (activePage === 'settings') {
    return (
      <div className="profile-container fade-in">
        <div className="profile-sticky-back">
          <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
        </div>
        <div className="sub-page-header" style={{ paddingTop: '56px' }}>
          <h2>{t('settings')}</h2>
        </div>
        <div className="profile-menu" style={{ paddingTop: '16px' }}>
          {/* Language */}
          <div className="menu-group glass squircle">
            <div className="menu-item" onClick={onChangeLanguage}>
              <div className="menu-icon"><Globe size={20} /></div>
              <span>{t('changeLanguage')}</span>
              <ChevronRight size={20} color="#8E8E93" className="chevron" />
            </div>
          </div>

          {/* Dark/Light mode */}
          <div className="menu-group glass squircle">
            <div className="settings-toggle-row">
              <div className="toggle-label">
                {darkMode ? <Moon size={20} color="#AF52DE" /> : <Sun size={20} color="#FF9F0A" />}
                <span>{darkMode ? t('darkMode') : t('lightMode')}</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Preferences Settings Group (Notification Sounds & Count Badges) */}
          <div className="menu-group glass squircle">
            <h4 className="settings-section-title">{t('preferencesTitle', 'Afzalliklar')}</h4>
            
            {/* Notification Sound Toggle */}
            <div className="settings-toggle-row" style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <div className="toggle-label">
                <Volume2 size={20} color="#34C759" />
                <span>{t('notifSoundLabel', 'Bildirishnoma ovozlari')}</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={notificationSound} onChange={(e) => setNotificationSound(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {/* Profile Badges Visibility Toggle */}
            <div className="settings-toggle-row">
              <div className="toggle-label">
                <Bell size={20} color="#0A84FF" />
                <span>{t('showBadgesLabel', "Profil sanoqlari ko'rinishi")}</span>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" checked={showProfileBadges} onChange={(e) => setShowProfileBadges(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="menu-group glass squircle">
            <h4 className="settings-section-title">{t('soundSettings')}</h4>
            <div className="sound-options">
              <button 
                className={`sound-option ${soundSettings.sound && soundSettings.vibration ? 'active' : ''}`}
                onClick={() => setSoundSettings({ sound: true, vibration: true })}
              >
                <Volume2 size={20} />
                <span>{t('soundOn')}</span>
              </button>
              <button 
                className={`sound-option ${!soundSettings.sound && soundSettings.vibration ? 'active' : ''}`}
                onClick={() => setSoundSettings({ sound: false, vibration: true })}
              >
                <Vibrate size={20} />
                <span>{t('vibration')}</span>
              </button>
              <button 
                className={`sound-option ${soundSettings.sound && !soundSettings.vibration ? 'active' : ''}`}
                onClick={() => setSoundSettings({ sound: true, vibration: false })}
              >
                <VolumeX size={20} />
                <span>{t('silent')}</span>
              </button>
              <button 
                className={`sound-option ${!soundSettings.sound && !soundSettings.vibration ? 'active' : ''}`}
                onClick={() => setSoundSettings({ sound: false, vibration: false })}
              >
                <BellOff size={20} />
                <span>{t('allOff')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== ASSIST AI SHOWCASE FULL PAGE =====
  if (activePage === 'assist_showcase') {
    return (
      <AssistHeroShowcase 
        onBack={() => setActivePage('about')} 
        isVoiceActive={isVoiceActive || isVoiceStandby}
        onToggleVoice={(nextState) => {
          if (setIsVoiceActive) setIsVoiceActive(nextState);
          if (setIsVoiceStandby) setIsVoiceStandby(nextState);
        }}
        darkMode={darkMode}
      />
    );
  }

  // ===== ABOUT PAGE =====
  if (activePage === 'about') {
    return (
      <div className="profile-container fade-in">
        <div className="about-glow-container about-page-wrapper" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Clip Orbs container to prevent horizontal scrolling/shaking */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', borderRadius: '24px', pointerEvents: 'none', zIndex: 1 }}>
            <div className="about-glow-orb orb1" />
            <div className="about-glow-orb orb2" />
          </div>

          {/* Floating Back Button: Stays sticky at top-left, scrolls independently */}
          <button 
            className="icon-btn glass" 
            onClick={() => setActivePage('main')} 
            style={{ 
              position: 'sticky', 
              top: '0px', 
              left: '0px', 
              zIndex: 100, 
              alignSelf: 'flex-start',
              margin: 0, 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1.2px solid var(--glass-border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04), inset 0 1px 1.5px rgba(255,255,255,0.4)',
              cursor: 'pointer',
              marginBottom: '-40px' /* Pulls the title up to align horizontally */
            }}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Title Row: Scrolls normally with content */}
          <div className="about-animate-item about-delay-1" style={{ textAlign: 'center', zIndex: 2, position: 'relative', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <h2 style={{ fontSize: '19px', fontWeight: '950', margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {t('aboutAppTitle', 'Michi (道) haqida')}
            </h2>
          </div>

          {/* Single Unified Bento Grid */}
          <div className="about-bento-grid" style={{ position: 'relative', zIndex: 2 }}>
            
            {/* Manifesto Quote Card (Span 2) */}
            <div className="about-manifesto-card about-span-2 about-animate-item about-delay-2">
              <span className="role-tag" style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 8px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'inline-block' }}>
                {t('michiManifesto', 'Michi manifesti')}
              </span>
              <p className="about-manifesto-quote" style={{ fontSize: '13px', lineHeight: '1.45', margin: '0 0 12px 0' }}>
                "{t('aboutVision')}"
              </p>
              <div className="about-manifesto-author" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary) 0%, #AF52DE 100%)', color: 'white', fontSize: '14px', fontWeight: '900' }}>道</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>{t('michiTeam', 'Michi Ekotizimi Jamoasi')}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>International Halal Capital Group</div>
                </div>
              </div>
            </div>

            {/* AI Flagship Sub-Project Bento Card (Compact & Sleek) */}
            <div 
              className="about-glass-card about-span-2 about-animate-item about-delay-3"
              onClick={() => setActivePage('assist_showcase')}
              style={{ 
                padding: '14px 16px', 
                cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(0, 132, 255, 0.12) 0%, rgba(96, 177, 255, 0.04) 100%)',
                border: '1.2px solid rgba(0, 132, 255, 0.28)',
                boxShadow: '0 6px 24px rgba(0, 132, 255, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2, gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1.2px', color: '#0084FF', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                      {t('aboutAiCardTag', '⚡ ASSIST. AI VISION 2026')}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '15px', fontWeight: '900', margin: '0 0 4px 0', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: '1.28', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    {t('aboutAiCardTitle', 'Michi AI Ovozli Yordamchisi')}
                  </h3>

                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '0 0 10px 0', opacity: 0.9, lineHeight: '1.4', wordBreak: 'break-word' }}>
                    {t('aboutAiCardSub', 'Ovozli navigatsiya, yaponcha rezyume va jonli simulyator.')}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(0, 132, 255, 0.1)', border: '1px solid rgba(0, 132, 255, 0.2)', color: '#0084FF', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Mic size={10} color="#0084FF" />
                      <span>{t('aboutAiCardPill1', 'Ovozli muloqot')}</span>
                    </span>
                    <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(0, 132, 255, 0.1)', border: '1px solid rgba(0, 132, 255, 0.2)', color: '#0084FF', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Bot size={10} color="#0084FF" />
                      <span>{t('aboutAiCardPill2', 'AI Simulyator')}</span>
                    </span>
                    <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'rgba(0, 132, 255, 0.1)', border: '1px solid rgba(0, 132, 255, 0.2)', color: '#0084FF', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={10} color="#0084FF" />
                      <span>{t('aboutAiCardPill3', 'Rivojlanish Xaritasi')}</span>
                    </span>
                  </div>
                </div>
                
                <div className="bento-international-card-icon" style={{ background: 'linear-gradient(135deg, #0084FF 0%, #0066CC 100%)', boxShadow: '0 6px 20px rgba(0, 132, 255, 0.35)', width: '38px', height: '38px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={18} color="#FFF" />
                </div>
              </div>
            </div>

            {/* Vision Card (Span 1) */}
            <div className="about-glass-card about-span-1 about-animate-item about-delay-4">
              <div>
                <h4 style={{ color: '#0A84FF', fontSize: '12.5px' }}>
                  <Globe size={16} />
                  Vision
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  {t('aboutSubtitle', 'Yaponiya bo\'yicha yagona raqamli ekotizim.')}
                </p>
              </div>
            </div>

            {/* Active Jobs Card (Span 1) */}
            <div className="about-glass-card card-primary about-span-1 about-animate-item about-delay-5" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={20} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
              <strong className="about-shimmer-text" style={{ display: 'block', fontSize: '18px', fontWeight: '900', marginBottom: '1px' }}>
                <StatCounter target={10} suffix="k+" />
              </strong>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>{t('aboutStatsPositions', 'Ish o\'rinlari')}</span>
            </div>

            {/* Corporate Backup & Guarantees Card (Span 2) */}
            <div className="about-glass-card card-success about-span-2 about-animate-item about-delay-6">
              <div>
                <h4 style={{ color: '#34C759', fontSize: '12.5px' }}>
                  <ShieldCheck size={16} />
                  {t('aboutGuaranteesTitle', 'Kafolat')}
                </h4>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  {t('aboutGuaranteesDesc', 'Loyihamiz barqarorligi International Halal Capital Group aktivlari bilan to\'liq kafolatlangan.')}
                </p>
              </div>
            </div>

            {/* Future Perks / Benefits Card (Span 2) */}
            <div className="about-glass-card card-primary about-span-2 about-animate-item about-delay-7">
              <div>
                <h4 style={{ fontSize: '12.5px' }}>
                  <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                  {t('aboutFuturePerksTitle', 'Imkoniyatlar')}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '8px' }}>
                  {t('aboutFuturePerksDesc', 'Yaqinda haydovchilar uchun chegirmali xizmatlar ishga tushadi:')}
                </p>
                <div className="about-perks-list">
                  <div className="about-perk-row">
                    <ShieldCheck size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '11.5px', color: 'var(--text-main)', fontWeight: '600', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      {t('perkInsuranceTitle', 'Sug\'urta chegirmalari')} 
                      <span style={{ fontSize: '8.5px', background: 'var(--primary-light)', padding: '1px 5px', borderRadius: '4px', color: 'var(--primary)', fontWeight: '700' }}>{t('statusSoon', 'Tez kunda')}</span>
                    </span>
                  </div>
                  <div className="about-perk-row">
                    <Wrench size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '11.5px', color: 'var(--text-main)', fontWeight: '600', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      {t('perkShakaiTitle', 'Chegirmali Shakai')} 
                      <span style={{ fontSize: '8.5px', background: 'var(--primary-light)', padding: '1px 5px', borderRadius: '4px', color: 'var(--primary)', fontWeight: '700' }}>{t('statusPlan', 'Reja')}</span>
                    </span>
                  </div>
                  <div className="about-perk-row">
                    <Briefcase size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '11.5px', color: 'var(--text-main)', fontWeight: '600', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      {t('perkPartsTitle', 'Ehtiyot qismlar')} 
                      <span style={{ fontSize: '8.5px', background: 'var(--primary-light)', padding: '1px 5px', borderRadius: '4px', color: 'var(--primary)', fontWeight: '700' }}>{t('statusPlan', 'Reja')}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Companies Card (Span 1) */}
            <div className="about-glass-card card-primary about-span-1 about-animate-item about-delay-8" style={{ padding: '16px 8px', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
              <strong className="about-shimmer-text" style={{ display: 'block', fontSize: '17px', fontWeight: '900', marginBottom: '1px' }}>
                <StatCounter target={500} suffix="+" />
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>{t('aboutStatsCompanies', 'Kompaniyalar')}</span>
            </div>

            {/* Support Card (Span 1) */}
            <div className="about-glass-card card-primary about-span-1 about-animate-item about-delay-9" style={{ padding: '16px 8px', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={18} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
              <strong className="about-shimmer-text" style={{ display: 'block', fontSize: '17px', fontWeight: '900', marginBottom: '1px' }}>
                <StatCounter target={24} suffix="/7" />
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>{t('aboutStatsSupport', 'Ko\'mak')}</span>
            </div>

            {/* Contacts Section Title (Span 2) */}
            <div style={{ padding: '8px 0 0 0', borderTop: '1px solid var(--glass-border)', marginTop: '4px', width: '100%', display: 'flex', alignItems: 'center', gap: '6px' }} className="about-span-2">
              <Mail size={14} style={{ color: '#0A84FF' }} />
              <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--text-main)' }}>
                {t('aboutContactUsTitle', 'Aloqa Departamenti')}
              </span>
            </div>

            {/* Contact buttons (Four individual span 1 grid items for visual symmetry) */}
            <a href="mailto:support@michi.jp.net" className="about-contact-card-btn about-span-1">
              <span>{t('contactDriverSupport', 'Qo\'llab-quvvatlash')}</span>
              <strong style={{ fontSize: '11px' }}>support@michi.jp.net</strong>
            </a>
            <a href="mailto:info@michi.jp.net" className="about-contact-card-btn about-span-1">
              <span>{t('contactGeneral', 'Umumiy savollar')}</span>
              <strong style={{ fontSize: '11px' }}>info@michi.jp.net</strong>
            </a>
            <a href="mailto:partners@michi.jp.net" className="about-contact-card-btn about-span-1">
              <span>{t('contactPartnership', 'Hamkorlik')}</span>
              <strong style={{ fontSize: '11px' }}>partners@michi.jp.net</strong>
            </a>
            <a href="mailto:invest@michi.jp.net" className="about-contact-card-btn about-span-1">
              <span>{t('contactInvestors', 'Investorlar')}</span>
              <strong style={{ fontSize: '11px' }}>invest@michi.jp.net</strong>
            </a>

            {/* Website link (Span 2) */}
            <a 
              href="https://www.michi.jp.net" 
              target="_blank" 
              rel="noopener noreferrer"
              className="about-contact-card-btn about-span-2" 
              style={{ 
                width: '100%', 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '12px', 
                background: 'linear-gradient(135deg, var(--primary) 0%, #AF52DE 100%)', 
                borderColor: 'transparent',
                boxShadow: '0 6px 20px rgba(90, 85, 234, 0.2)'
              }}
            >
              <Globe size={16} color="#FFF" />
              <strong style={{ color: '#FFF', fontSize: '13px', fontWeight: '800' }}>{t('officialWebsite', 'www.michi.jp.net rasmiy sayti')}</strong>
            </a>
            {/* Copyright (Span 2) */}
            <div style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-secondary)', marginTop: '6px' }} className="about-span-2">
              © 2026 Michi (道). All rights reserved.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== MY POSTED ADS PAGE (COMPANY) =====
  if (activePage === 'my_ads') {
    return (
      <div className="profile-container fade-in">
        {/* Sticky Back Button Container */}
        {!isFormOpen && (
          <div className="profile-sticky-back" style={{ zIndex: 250 }}>
            <button className="icon-btn glass" onClick={() => {
              if (profileActivePageSource === 'home') {
                setActivePage('main');
                if (onNavigate) onNavigate('home');
              } else {
                setActivePage('main');
              }
            }}><ArrowLeft size={20} /></button>
          </div>
        )}

        {/* Scrollable Title */}
        {!isFormOpen && (
          <div className="sub-page-header" style={{ paddingTop: '56px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
              {t('myAdsMenu', 'Mening e\'lonlarim')}
            </h2>
          </div>
        )}

        <CompanyHome 
          onJobClick={onJobClick} 
          onSchoolClick={onSchoolClick} 
          jobs={jobs} 
          setJobs={setJobs} 
          schools={schools} 
          setSchools={setSchools} 
          profileData={profileData} 
          jobToEdit={jobToEdit} 
          setJobToEdit={setJobToEdit} 
          onFormToggle={setIsFormOpen}
          onApply={onApply}
          onApplySchool={onApplySchool}
          onShoukai={onShoukai}
          applications={applications}
          schoolApplications={schoolApplications}
        />
      </div>
    );
  }

  // ===== PERSONAL INFO PAGE =====
  if (activePage === 'personalInfo') {
    return (
      <div className="profile-container fade-in">
        <div className="profile-sticky-back">
          <button className="icon-btn glass" onClick={() => { setActivePage('main'); setIsEditing(false); }}>
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="sub-page-header" style={{ paddingTop: '56px' }}>
          <div className="sub-header-row">
            <h2>{userRole === 'company' ? t('companyInfoTitle', "Kompaniya ma'lumotlari") : t('personalData')}</h2>
            <span style={{ color: '#0A84FF', fontSize: '14px', fontWeight: 'bold', marginLeft: '10px' }}>ID: {profileData.userId}</span>
            {userRole === 'company' ? (
              isEditing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="edit-btn save-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={saveEditing}>
                    <CheckCircle2 size={16} /> {t('saveChanges')}
                  </button>
                  <button className="edit-btn cancel-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30' }} onClick={() => setIsEditing(false)}>
                    <X size={16} /> {t('cancelEdit')}
                  </button>
                </div>
              ) : (
                <button className="edit-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={startEditing}>
                  <Edit3 size={16} /> {t('editInfo')}
                </button>
              )
            ) : (
              <button className="edit-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setActivePage('resume_builder')}>
                <Edit3 size={16} /> {t('editInfo')}
              </button>
            )}
          </div>
        </div>
        <div className="profile-menu" style={{ paddingTop: '16px' }}>
          <div className="menu-group glass squircle" style={{ padding: '20px' }}>
            <div className="resume-body">
              {/* Name */}
              <div className="resume-field">
                <span className="field-label">{t('namePlaceholder').replace(' ✱', '')}</span>
                {isEditing ? (
                  <input className="edit-input" value={editData.fullName || ''} onChange={(e) => setEditData({...editData, fullName: e.target.value})} maxLength={50} />
                ) : (
                  <span className="field-value">{profileData.fullName}</span>
                )}
              </div>
              {/* Email */}
              <div className="resume-field">
                <span className="field-label">Email</span>
                {isEditing ? (
                  <input className="edit-input" value={editData.email || ''} onChange={(e) => setEditData({...editData, email: e.target.value})} maxLength={80} />
                ) : (
                  <span className="field-value">{profileData.email}</span>
                )}
              </div>
              {/* Driver fields */}
              {(userRole === 'driver' || userRole === 'guest') && (
                <>
                  <div className="resume-field">
                    <span className="field-label">{t('birthDateLabel')}</span>
                    {isEditing ? (
                      <input type="date" className="edit-input" value={editData.birthDate || ''} onChange={(e) => setEditData({...editData, birthDate: e.target.value})} />
                    ) : (
                      <span className="field-value">{profileData.birthDate || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('birthPlaceLabel', "Tug'ilgan joyi")}</span>
                    {isEditing ? (
                      <input type="text" className="edit-input" value={editData.birthPlace || ''} onChange={(e) => setEditData({...editData, birthPlace: e.target.value})} />
                    ) : (
                      <span className="field-value">{profileData.birthPlace || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('nationalityLabel', "Millati")}</span>
                    {isEditing ? (
                      <input type="text" className="edit-input" value={editData.nationality || ''} onChange={(e) => setEditData({...editData, nationality: e.target.value})} />
                    ) : (
                      <span className="field-value">{profileData.nationality || t('notProvided')}</span>
                    )}
                  </div>
                  {/* Living Address History */}
                  <div className="resume-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                    <span className="field-label">{t('livingAddressTitle', 'Yashash manzillari')}</span>
                    {isEditing ? (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(editData.addressHistory || []).map((entry, index) => (
                          <div key={index} className="work-entry glass squircle" style={{ padding: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '13px' }}>#{index + 1}</span>
                              <button 
                                type="button" 
                                className="remove-work-btn"
                                style={{ background: 'rgba(255, 59, 48, 0.08)', border: 'none', color: '#FF3B30', cursor: 'pointer', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => removeEditAddressEntry(index)}
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder={t('livingAddressPlaceholder', 'Yashash manzili')}
                                className="edit-input"
                                style={{ width: '100%' }}
                                value={entry.address}
                                onChange={(e) => updateEditAddressEntry(index, 'address', e.target.value)}
                                maxLength={120}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <input 
                                  type="checkbox" 
                                  id={`edit-addr-current-${index}`} 
                                  checked={entry.isCurrent || false}
                                  onChange={(e) => updateEditAddressEntry(index, 'isCurrent', e.target.checked)}
                                  style={{ cursor: 'pointer' }}
                                />
                                <label htmlFor={`edit-addr-current-${index}`} style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>{t('currentAddressLabel', 'Hozirgi yashash joyim')}</label>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(editData.addressHistory || []).length < 3 && (
                          <button type="button" className="add-work-btn" style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'rgba(10, 132, 255, 0.08)', border: '1px dashed rgba(10, 132, 255, 0.3)', color: '#0A84FF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={addEditAddressEntry}>
                            <Plus size={15} /> {t('addAddressBtn', "Yashash manzili qo'shish")}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {profileData.addressHistory && profileData.addressHistory.length > 0 ? (
                          profileData.addressHistory.map((a, i) => (
                            <div key={i} className="glass squircle" style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>{a.address}</span>
                              {a.isCurrent && (
                                <span style={{ fontSize: '11px', background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                  {t('currentAddressLabel', 'Hozirgi yashash joyi')}
                                </span>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="field-value">{profileData.address || t('notProvided')}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Education History */}
                  <div className="resume-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginTop: '12px' }}>
                    <span className="field-label">{t('educationTitle', 'Ta\'lim ma\'lumotlari')}</span>
                    {isEditing ? (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(editData.educationHistory || []).map((entry, index) => (
                          <div key={index} className="work-entry glass squircle" style={{ padding: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '13px' }}>#{index + 1}</span>
                              <button 
                                type="button" 
                                className="remove-work-btn"
                                style={{ background: 'rgba(255, 59, 48, 0.08)', border: 'none', color: '#FF3B30', cursor: 'pointer', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => removeEditEducationEntry(index)}
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <input
                                type="text"
                                placeholder={t('educationSchoolPlaceholder', 'O\'quv muassasasi nomi')}
                                className="edit-input"
                                style={{ width: '100%' }}
                                value={entry.school}
                                onChange={(e) => updateEditEducationEntry(index, 'school', e.target.value)}
                                maxLength={100}
                              />
                              <input
                                type="text"
                                placeholder={t('educationMajorPlaceholder', 'Yo\'nalishi / Mutaxassisligi')}
                                className="edit-input"
                                style={{ width: '100%' }}
                                value={entry.major}
                                onChange={(e) => updateEditEducationEntry(index, 'major', e.target.value)}
                                maxLength={100}
                              />
                              <div className="work-dates-row" style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                                <div style={{ flex: 1 }}>
                                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>{t('startDateLabel', 'Kirgan vaqti')}</label>
                                  <input
                                    type="month"
                                    className="edit-input"
                                    style={{ width: '100%' }}
                                    value={entry.startDate || ''}
                                    onChange={(e) => updateEditEducationEntry(index, 'startDate', e.target.value)}
                                  />
                                </div>
                                <div style={{ flex: 1, opacity: entry.isCurrent ? 0.5 : 1 }}>
                                  <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>{t('endDateLabel', 'Ketgan vaqti')}</label>
                                  <input
                                    type="month"
                                    className="edit-input"
                                    style={{ width: '100%' }}
                                    value={entry.endDate || ''}
                                    onChange={(e) => updateEditEducationEntry(index, 'endDate', e.target.value)}
                                    disabled={entry.isCurrent}
                                  />
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                <input 
                                  type="checkbox" 
                                  id={`edit-edu-current-${index}`} 
                                  checked={entry.isCurrent || false}
                                  onChange={(e) => updateEditEducationEntry(index, 'isCurrent', e.target.checked)}
                                  style={{ cursor: 'pointer' }}
                                />
                                <label htmlFor={`edit-edu-current-${index}`} style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>{t('currentlyStudyingLabel', 'Hozir ham o\'qiyman')}</label>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(editData.educationHistory || []).length < 3 && (
                          <button type="button" className="add-work-btn" style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'rgba(10, 132, 255, 0.08)', border: '1px dashed rgba(10, 132, 255, 0.3)', color: '#0A84FF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={addEditEducationEntry}>
                            <Plus size={15} /> {t('addEducationBtn', "O'qish joyi qo'shish")}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {profileData.educationHistory && profileData.educationHistory.length > 0 ? (
                          profileData.educationHistory.map((edu, i) => (
                            <div key={i} className="glass squircle" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>{edu.school}</strong>
                                {edu.isCurrent && (
                                  <span style={{ fontSize: '11px', background: 'rgba(52, 199, 89, 0.1)', color: '#34C759', padding: '3px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                                    {t('currentlyStudyingLabel', 'O\'qiyotgan')}
                                  </span>
                                )}
                              </div>
                              {edu.major && <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{edu.major}</span>}
                              <span style={{ fontSize: '12px', color: '#8E8E93', marginTop: '2px' }}>
                                📅 {edu.startDate || '?'} ~ {edu.isCurrent ? t('currentlyStudyingLabel', 'Hozirgi vaqtda') : edu.endDate || '?'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="field-value" style={{ whiteSpace: 'pre-wrap' }}>{profileData.education || t('notProvided')}</span>
                        )}
                      </div>
                    )}
                  </div>
                                  <div className="resume-field" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '8px'}}>
                  <span className="field-label" style={{marginBottom: '4px'}}>{t('driverLicensesLabel', 'Haydovchilik guvohnomalari')}</span>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                    {profileData.driverLicenses && profileData.driverLicenses.length > 0 ? 
                      profileData.driverLicenses.map(l => (
                        <span key={l} className="badge-blue" style={{background: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: '20px', fontSize: '13px'}}>{t(`lic_${l}`)}</span>
                      )) : 
                      <span style={{fontSize: '13px', color: '#8E8E93'}}>{t('notProvided', 'Kiritilmagan')}</span>
                    }
                  </div>
                </div>
                <div className="resume-field" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '8px'}}>
                  <span className="field-label" style={{marginBottom: '4px'}}>{t('techCertsLabel', 'Maxsus texnika va malaka sertifikatlari')}</span>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                    {profileData.techCertificates && profileData.techCertificates.length > 0 ? 
                      profileData.techCertificates.map(tc => (
                        <span key={tc} className="badge-blue" style={{background: '#fdf3e3', color: '#d27d19', padding: '4px 10px', borderRadius: '20px', fontSize: '13px'}}>{t(`tech_${tc}`)}</span>
                      )) : 
                      <span style={{fontSize: '13px', color: '#8E8E93'}}>{t('notProvided', 'Kiritilmagan')}</span>
                    }
                  </div>
                </div>
                <div className="resume-field" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '8px'}}>
                  <span className="field-label" style={{marginBottom: '4px'}}>{t('jlptLanguageLabel', 'JLPT Yapon tili darajasi')}</span>
                  <div>
                    {profileData.jlptStatus && profileData.jlptStatus.verified ? (
                      <div className="glass squircle animate-scale-up" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: 'rgba(48, 209, 88, 0.08)', border: '1px solid rgba(48, 209, 88, 0.3)', borderRadius: '12px' }}>
                        <ShieldCheck size={18} color="#30D158" className="animate-pulse" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ fontSize: '13.5px', color: '#30D158' }}>JLPT {profileData.jlptStatus.level} Verified ✓</strong>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Cert No: {profileData.jlptStatus.certNo}</span>
                        </div>
                      </div>
                    ) : (
                      <span style={{fontSize: '13px', color: '#8E8E93'}}>{t('notProvided', 'Tasdiqlanmagan')}</span>
                    )}
                  </div>
                </div>
                  {/* Work History */}
                  {profileData.workHistory && profileData.workHistory.length > 0 && (
                    <div className="resume-field">
                      <span className="field-label">{t('workExperience')}</span>
                      {profileData.workHistory.map((w, i) => (
                        <div key={i} className="work-history-item">
                          <strong>{w.company}</strong>
                          <span>{w.position} • {w.startDate} - {w.isCurrent ? t('currentPosition', 'Hozir') : w.endDate}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {/* Company fields */}
              {userRole === 'company' && (
                <>
                  <div className="resume-field">
                    <span className="field-label">{t('companyTypeLabel', 'Faoliyat turi')}</span>
                    {isEditing ? (
                      <select 
                        className="edit-input" 
                        value={editData.companyType || 'logistics'}
                        onChange={(e) => setEditData({...editData, companyType: e.target.value})}
                      >
                        <option value="logistics">{t('typeLogistics', 'Logistika / Yuk tashish')}</option>
                        <option value="driving_school">{t('typeDrivingSchool', 'Avtomaktab')}</option>
                        <option value="taxi_company">{t('typeTaxiCompany', 'Taksi xizmati / Kompaniyasi')}</option>
                        <option value="bus_company">{t('typeBusCompany', 'Avtobus xizmati / Yo\'nalishlari')}</option>
                        <option value="special_machinery">{t('typeSpecialMachinery', 'Maxsus texnika / Qurilish texnikasi')}</option>
                        <option value="other">{t('typeOther', 'Boshqa')}</option>
                      </select>
                    ) : (
                      <span className="field-value badge-blue">
                        {profileData.companyType === 'logistics' ? t('typeLogistics', 'Logistika') :
                         profileData.companyType === 'driving_school' ? t('typeDrivingSchool', 'Avtomaktab') :
                         profileData.companyType === 'taxi_company' ? t('typeTaxiCompany', 'Taksi') :
                         profileData.companyType === 'bus_company' ? t('typeBusCompany', 'Avtobus') :
                         profileData.companyType === 'special_machinery' ? t('typeSpecialMachinery', 'Maxsus texnika') :
                         profileData.companyType === 'other' ? t('typeOther', 'Boshqa') :
                         (profileData.companyType || t('notProvided'))}
                      </span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('companyAddressPlaceholder', 'Kompaniya manzili')}</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="edit-input" 
                        value={editData.companyAddress || ''} 
                        onChange={(e) => setEditData({...editData, companyAddress: e.target.value})} 
                        maxLength={120} 
                      />
                    ) : (
                      <span className="field-value">{profileData.companyAddress || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('contactPersonPlaceholder', 'Mas\'ul shaxs ismi')}</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="edit-input" 
                        value={editData.contactPerson || ''} 
                        onChange={(e) => setEditData({...editData, contactPerson: e.target.value})} 
                        maxLength={50} 
                      />
                    ) : (
                      <span className="field-value">{profileData.contactPerson || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('companyPhonePlaceholder', 'Telefon raqam')}</span>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        className="edit-input" 
                        value={editData.companyPhone || ''} 
                        onChange={(e) => setEditData({...editData, companyPhone: e.target.value})} 
                        maxLength={20} 
                      />
                    ) : (
                      <span className="field-value">{profileData.companyPhone || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('corporateNumberLabel', 'Yuridik shaxs raqami')}</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="edit-input" 
                        value={editData.corporateNumber || ''} 
                        onChange={(e) => setEditData({...editData, corporateNumber: e.target.value})} 
                        maxLength={13} 
                      />
                    ) : (
                      <span className="field-value">{profileData.corporateNumber || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('websitePlaceholder', 'Kompaniya veb-sayti')}</span>
                    {isEditing ? (
                      <input 
                        type="url" 
                        className="edit-input" 
                        value={editData.website || ''} 
                        onChange={(e) => setEditData({...editData, website: e.target.value})} 
                        maxLength={100} 
                      />
                    ) : (
                      <span className="field-value">
                        {profileData.website ? (
                          <a href={profileData.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0A84FF', textDecoration: 'none' }}>{profileData.website}</a>
                        ) : t('notProvided')}
                      </span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('establishedYearLabel', 'Tashkil etilgan yili')}</span>
                    {isEditing ? (
                      <input 
                        type="number" 
                        className="edit-input" 
                        value={editData.establishedYear || ''} 
                        onChange={(e) => setEditData({...editData, establishedYear: e.target.value})} 
                        maxLength={4} 
                      />
                    ) : (
                      <span className="field-value">{profileData.establishedYear || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('employeeCountPlaceholder', 'Ishchilar soni')}</span>
                    {isEditing ? (
                      <input 
                        type="number" 
                        className="edit-input" 
                        value={editData.employeeCount || ''} 
                        onChange={(e) => setEditData({...editData, employeeCount: e.target.value})} 
                      />
                    ) : (
                      <span className="field-value">{profileData.employeeCount || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <span className="field-label">{t('companyDescPlaceholder', 'Kompaniya haqida qisqacha')}</span>
                    {isEditing ? (
                      <textarea 
                        className="edit-input" 
                        style={{ width: '100%', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                        value={editData.companyDesc || ''} 
                        onChange={(e) => setEditData({...editData, companyDesc: e.target.value})} 
                        maxLength={300} 
                      />
                    ) : (
                      <span className="field-value" style={{ whiteSpace: 'pre-wrap', width: '100%' }}>{profileData.companyDesc || t('notProvided')}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== MY APPLICATIONS / COMPANY INCOMING APPLICATIONS PAGE =====
  if (activePage === 'applications') {
    // Combine job and school applications for driver view
    let combinedApps = [];
    if (userRole === 'company') {
      combinedApps = [...applications];
    } else {
      // Driver or guest only sees their own applications (no simulated friend referrals)
      combinedApps = [...applications].filter(a => !a.isSimulatedReferral);
      (schoolApplications || []).filter(s => !s.isSimulatedReferral).forEach(s => {
        combinedApps.push({
          ...s,
          isSchool: true,
          logo: s.image || 'https://via.placeholder.com/64?text=Maktab',
          company: s.schoolName,
          title: t('drivingSchoolApp', 'Avtomaktabga ariza'),
          status: 'submitted', // Always submitted as there's no complex pipeline for schools yet
        });
      });
      // Sort by date if available
      combinedApps.sort((a, b) => new Date(b.appliedDate || Date.now()) - new Date(a.appliedDate || Date.now()));
    }

    return (
      <div className="profile-container fade-in">
        <div className="profile-sticky-back">
          <button className="icon-btn glass" onClick={() => {
            if (profileActivePageSource === 'home') {
              setActivePage('main');
              if (onNavigate) onNavigate('home');
            } else {
              setActivePage('main');
            }
          }}><ArrowLeft size={20} /></button>
        </div>
        <div className="sub-page-header" style={{ paddingTop: '56px' }}>
          <h2>
            {userRole === 'company' ? t('incomingApps', 'Kelib tushgan arizalar') : t('myApplications', 'Mening arizalarim')}
            <span className="section-header-count">({userRole === 'company' ? applications.length : totalOwnApplications})</span>
          </h2>
        </div>
        <div className="applications-list">
          {combinedApps.length === 0 ? (
            <div className="empty-state glass squircle" style={{ margin: '20px 0', padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(10, 132, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A84FF' }}>
                <Briefcase size={40} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{t('noApplications')}</h3>
                <p style={{ color: '#8E8E93', fontSize: '14px', lineHeight: 1.4, margin: 0 }}>
                  {userRole === 'company' 
                    ? t('noCompanyApps', 'Hozircha kompaniyangizga arizalar kelib tushmadi. E\'lonlaringizni kuzatib boring.') 
                    : t('noDriverApps', 'Siz hali hech qayerga ishga yoki o\'qishga ariza topshirmadingiz. O\'zingizga mos ish toping!')}
                </p>
              </div>
              {userRole !== 'company' && onNavigate && (
                <button 
                  className="apply-btn squircle" 
                  style={{ padding: '12px 24px', fontSize: '15px', marginTop: '10px' }}
                  onClick={() => onNavigate('home')}
                >
                  {t('viewJobs', 'Bo\'sh ish o\'rinlarini ko\'rish')}
                </button>
              )}
            </div>
          ) : (
            combinedApps.map(app => {
              const resumeInfo = app.applicantInfo || profileData;
              return (
                <div key={app.id} className="application-card glass squircle">
                  <div className="app-card-header">
                    <img src={app.logo} alt={app.company} className="app-company-logo" />
                    <div className="app-card-info">
                      <h4>{app.title}</h4>
                      <p>{app.company}</p>
                      <span className="app-date">{t('appliedOn')}: {app.appliedDate}</span>
                    </div>
                  </div>
                  {/* Shoukai Banner for Company */}
                  {userRole === 'company' && app.shoukaiId && (
                    <div style={{ background: '#FFF5E5', border: '1px solid #FF9F0A', padding: '10px', borderRadius: '8px', margin: '12px 0', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D97706', fontWeight: 'bold', marginBottom: '4px' }}>
                        <Share2 size={16} />
                        {t('referredBy', 'Bu xodimni sizga')} {app.shoukaiId} {t('referredById', 'tavsiya qildi')}!
                      </div>
                      {app.shoukaiAmount && (
                        <div style={{ color: '#8E8E93' }}>{t('shoukaiFee', 'Shoukai puli')}: <strong style={{ color: '#34C759' }}>{app.shoukaiAmount}</strong></div>
                      )}
                      {app.status === 'accepted' && (
                        <div style={{ marginTop: '8px' }}>
                          {!app.shoukaiPaid ? (
                            <>
                              <button 
                                className="demo-btn accepted" 
                                style={{ width: '100%', marginBottom: '4px' }}
                                onClick={() => onShoukaiPaid && onShoukaiPaid(app.id)}
                              >
                                {t('payShoukai', 'Shoukai pulini to\'lash')}
                              </button>
                              <p style={{ fontSize: '11px', color: '#8E8E93', margin: 0, lineHeight: 1.2 }}>
                                {t('shoukaiPayNote', "To'lov tizimi ilova ichida mavjud emas. To'lovni tashqaridan amalga oshirgach, bu tugmani bosing.")}
                              </p>
                            </>
                          ) : (
                            <div className="shoukai-paid-badge" style={{ display: 'inline-flex' }}>
                              <CheckCircle2 size={16} /> {t('shoukaiPaidLabel', 'Shoukai to\'langan')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Status Pipeline or Sleek Notification-like Badge for Driver */}
                  {userRole !== 'company' ? (
                    <div className="driver-app-status-box glass squircle" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '12px 16px', 
                      marginTop: '12px', 
                      borderLeft: `4px solid ${STATUS_COLORS[app.status] || '#0A84FF'}`,
                      background: 'rgba(255, 255, 255, 0.02)',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)'
                    }}>
                      <div className="status-indicator-dot" style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        background: STATUS_COLORS[app.status] || '#0A84FF',
                        boxShadow: `0 0 10px ${STATUS_COLORS[app.status] || '#0A84FF'}`
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '12px', color: '#8E8E93', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                          {t('applicationStatus', 'Ariza holati')}
                        </span>
                        <strong style={{ fontSize: '15px', color: STATUS_COLORS[app.status] || '#0A84FF', fontWeight: '600' }}>
                          {t(`status${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`)}
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <div className="status-pipeline">
                      {STATUS_PIPELINE.map(status => (
                        <div 
                          key={status} 
                          className={`pipeline-step ${app.status === status ? 'active' : ''}`}
                          style={{ 
                            color: app.status === status ? STATUS_COLORS[status] : '#C7C7CC',
                            borderColor: app.status === status ? STATUS_COLORS[status] : 'transparent',
                          }}
                        >
                          <div 
                            className="pipeline-dot" 
                            style={{ background: app.status === status ? STATUS_COLORS[status] : '#C7C7CC' }}
                          ></div>
                          <span>{t(`status${status.charAt(0).toUpperCase() + status.slice(1)}`)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Collapsible Candidate Resume for Company */}
                  {userRole === 'company' && (
                    <div style={{ width: '100%', marginBottom: '12px' }}>
                      <button 
                        className="demo-btn reviewed" 
                        style={{ background: 'rgba(10, 132, 255, 0.08)', color: '#0A84FF', border: '1px dashed rgba(10, 132, 255, 0.3)', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                      >
                        <FileText size={15} />
                        {expandedAppId === app.id ? t('hideResumeBtn', 'Resumeni yopish') : t('viewResumeBtn', 'Nomzod resumesini ko\'rish')}
                      </button>
                      
                      {expandedAppId === app.id && (
                        <div className="applicant-resume-collapsible slide-down glass" style={{ padding: '16px', borderRadius: '12px', marginTop: '10px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.02)' }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--primary)', fontWeight: 'bold' }}>📄 {t('myResume', 'Rezume (履歴書)')}</h4>
                          
                          <div className="resume-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                              <span style={{ color: '#8E8E93' }}>{t('namePlaceholder', 'Nomzod ismi').replace(' ✱', '')}:</span>
                              <strong style={{ color: 'var(--text-main)' }}>{resumeInfo.fullName}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                              <span style={{ color: '#8E8E93' }}>Email:</span>
                              <strong style={{ color: 'var(--text-main)' }}>{resumeInfo.email}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                               <span style={{ color: '#8E8E93' }}>{t('birthDateLabel', 'Tug\'ilgan sana')}:</span>
                               <strong style={{ color: 'var(--text-main)' }}>{resumeInfo.birthDate || t('notProvided')}</strong>
                             </div>
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                               <span style={{ color: '#8E8E93' }}>{t('birthPlaceLabel', 'Tug\'ilgan joyi')}:</span>
                               <strong style={{ color: 'var(--text-main)' }}>{resumeInfo.birthPlace || t('notProvided')}</strong>
                             </div>
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                               <span style={{ color: '#8E8E93' }}>{t('nationalityLabel', 'Millati')}:</span>
                               <strong style={{ color: 'var(--text-main)' }}>{resumeInfo.nationality || t('notProvided')}</strong>
                             </div>
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', gap: '4px' }}>
                              <span style={{ color: '#8E8E93' }}>{t('livingAddressTitle', 'Yashash manzillari')}:</span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', marginTop: '2px' }}>
                                {resumeInfo.addressHistory && resumeInfo.addressHistory.length > 0 ? (
                                  resumeInfo.addressHistory.map((a, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)', width: '100%' }}>
                                      <span style={{ color: 'var(--text-main)' }}>{a.address}</span>
                                      {a.isCurrent && <span style={{ fontSize: '9px', background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>{t('currentAddressLabel', 'Hozirgi')}</span>}
                                    </div>
                                  ))
                                ) : (
                                  <strong style={{ color: 'var(--text-main)' }}>{resumeInfo.address || t('notProvided')}</strong>
                                )}
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', gap: '4px' }}>
                              <span style={{ color: '#8E8E93' }}>{t('educationTitle', 'Ta\'lim ma\'lumotlari')}:</span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginTop: '2px' }}>
                                {resumeInfo.educationHistory && resumeInfo.educationHistory.length > 0 ? (
                                  resumeInfo.educationHistory.map((edu, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(255,255,255,0.01)', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)', width: '100%' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <strong style={{ color: 'var(--text-main)' }}>{edu.school}</strong>
                                        {edu.isCurrent && <span style={{ fontSize: '9px', background: 'rgba(52, 199, 89, 0.1)', color: '#34C759', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>{t('currentlyStudyingLabel', 'O\'qiyotgan')}</span>}
                                      </div>
                                      {edu.major && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{edu.major}</span>}
                                      <span style={{ fontSize: '10px', color: '#8E8E93' }}>📅 {edu.startDate || '?'} ~ {edu.isCurrent ? t('currentlyStudyingLabel', 'Hozirgi vaqtda') : edu.endDate || '?'}</span>
                                    </div>
                                  ))
                                ) : (
                                  <strong style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{resumeInfo.education || t('notProvided')}</strong>
                                )}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', gap: '6px' }}>
                              <span style={{ color: '#8E8E93' }}>{t('driverLicensesLabel', 'Haydovchilik guvohnomalari')}:</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                                {resumeInfo.driverLicenses && resumeInfo.driverLicenses.length > 0 ? (
                                  resumeInfo.driverLicenses.map(l => (
                                    <span key={l} className="badge-blue" style={{ background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF', padding: '3px 8px', borderRadius: '10px', fontSize: '11px' }}>{t(`lic_${l}`)}</span>
                                  ))
                                ) : (
                                  <span style={{ fontSize: '11px', color: '#8E8E93' }}>{t('notProvided')}</span>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', gap: '6px' }}>
                              <span style={{ color: '#8E8E93' }}>{t('techCertsLabel', 'Maxsus texnika va malaka sertifikatlari')}:</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                                {resumeInfo.techCertificates && resumeInfo.techCertificates.length > 0 ? (
                                  resumeInfo.techCertificates.map(tc => (
                                    <span key={tc} className="badge-blue" style={{ background: 'rgba(210, 125, 25, 0.1)', color: '#d27d19', padding: '3px 8px', borderRadius: '10px', fontSize: '11px' }}>{t(`tech_${tc}`)}</span>
                                  ))
                                ) : (
                                  <span style={{ fontSize: '11px', color: '#8E8E93' }}>{t('notProvided')}</span>
                                )}
                              </div>
                            </div>

                            {resumeInfo.jlptStatus && resumeInfo.jlptStatus.verified && (
                              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', gap: '4px' }}>
                                <span style={{ color: '#8E8E93' }}>JLPT Yapon tili darajasi:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', background: 'rgba(48, 209, 88, 0.08)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(48, 209, 88, 0.2)' }}>
                                  <ShieldCheck size={14} color="#30D158" />
                                  <strong style={{ color: '#30D158', fontSize: '12px' }}>JLPT {resumeInfo.jlptStatus.level} Verified ✓</strong>
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>({resumeInfo.jlptStatus.certNo})</span>
                                </div>
                              </div>
                            )}

                            {resumeInfo.workHistory && resumeInfo.workHistory.length > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', gap: '6px' }}>
                                <span style={{ color: '#8E8E93' }}>{t('workExperience', 'Ish tajribasi')}:</span>
                                {resumeInfo.workHistory.map((w, i) => (
                                  <div key={i} style={{ fontSize: '12px', background: 'rgba(255,255,255,0.01)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
                                    <strong style={{ color: 'var(--text-main)' }}>{w.company}</strong>
                                    <span style={{ display: 'block', color: '#8E8E93', fontSize: '11px', marginTop: '2px' }}>{w.position} • {w.startDate} - {w.isCurrent ? t('currentPosition', 'Hozir') : w.endDate}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Company / Demo Action Buttons */}
                  {userRole === 'company' && (
                    <div className="demo-status-btns" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                      <button 
                        className={`demo-btn reviewed ${app.status === 'reviewed' ? 'active' : ''}`} 
                        style={{ 
                          flex: '1 1 calc(50% - 4px)', 
                          background: app.status === 'reviewed' ? '#0A84FF' : 'rgba(10, 132, 255, 0.08)', 
                          color: app.status === 'reviewed' ? '#fff' : '#0A84FF',
                          border: '1px solid rgba(10, 132, 255, 0.2)'
                        }} 
                        onClick={() => onChangeAppStatus(app.id, 'reviewed')}
                      >
                        ✓ {t('simulateReviewed')}
                      </button>
                      
                      <button 
                        className={`demo-btn interview ${app.status === 'interview' ? 'active' : ''}`} 
                        style={{ 
                          flex: '1 1 calc(50% - 4px)', 
                          background: app.status === 'interview' ? '#AF52DE' : 'rgba(175, 82, 222, 0.08)', 
                          color: app.status === 'interview' ? '#fff' : '#AF52DE',
                          border: '1px solid rgba(175, 82, 222, 0.2)'
                        }} 
                        onClick={() => onChangeAppStatus(app.id, 'interview')}
                      >
                        📅 {t('simulateInterview')}
                      </button>

                      <button 
                        className={`demo-btn accepted ${app.status === 'accepted' ? 'active' : ''}`} 
                        style={{ 
                          flex: '1 1 calc(50% - 4px)', 
                          background: app.status === 'accepted' ? '#34C759' : 'rgba(52, 199, 89, 0.08)', 
                          color: app.status === 'accepted' ? '#fff' : '#34C759',
                          border: '1px solid rgba(52, 199, 89, 0.2)'
                        }} 
                        onClick={() => onChangeAppStatus(app.id, 'accepted')}
                      >
                        🎉 {t('simulateAccept')}
                      </button>

                      <button 
                        className={`demo-btn rejected ${app.status === 'rejected' ? 'active' : ''}`} 
                        style={{ 
                          flex: '1 1 calc(50% - 4px)', 
                          background: app.status === 'rejected' ? '#FF3B30' : 'rgba(255, 59, 48, 0.08)', 
                          color: app.status === 'rejected' ? '#fff' : '#FF3B30',
                          border: '1px solid rgba(255, 59, 48, 0.2)'
                        }} 
                        onClick={() => onChangeAppStatus(app.id, 'rejected')}
                      >
                        ✗ {t('simulateReject')}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ===== SAVED ITEMS PAGE (SAQLANGAN E'LONLAR SAHIFASI) =====
  // Ushbu bo'lim foydalanuvchi tomonidan saqlangan ish e'lonlari va avtomaktablarni ko'rsatadi.
  // Barcha brauzerlarda to'liq moslik va kamchiliklarsiz ishlashini ta'minlash uchun:
  // 1. Faol bo'lmagan (o'chirilgan yoki muddati tugagan) e'lonlar avtomatik filtrlanadi.
  // 2. Klik qilinganda App.jsx orqali to'g'ridan-to'g'ri batafsil sahifalar (overlay/tab) ochiladi.
  if (activePage === 'saved_items') {
    // Faol ish e'lonlarini tekshirish va filtrlash (faqat MOCK_JOBS ichida bor va faol bo'lganlarini qoldiradi)
    const savedJobs = (profileData?.savedItems?.jobs || []).filter(job => 
      MOCK_JOBS.some(mj => mj.id === job.id && mj.isActive !== false)
    );
    // Faol avtomaktablarni tekshirish va filtrlash (faqat MOCK_SCHOOLS ichida bor va faol bo'lganlarini qoldiradi)
    const savedSchools = (profileData?.savedItems?.schools || []).filter(school => 
      MOCK_SCHOOLS.some(ms => ms.id === school.id && ms.isActive !== false)
    );

    return (
      <div className="profile-container fade-in">
        <div className="profile-sticky-back">
          {/* Ortga qaytish: Profil bosh sahifasiga ('main') qaytaradi */}
          <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
        </div>
        <div className="sub-page-header" style={{ paddingTop: '56px' }}>
          <h2>
            {t('savedItemsTitle', 'Saqlanganlar')}
            <span className="section-header-count">({savedJobs.length + savedSchools.length})</span>
          </h2>
        </div>
        <div className="applications-list" style={{ padding: '16px' }}>
          {savedJobs.length === 0 && savedSchools.length === 0 ? (
            <div className="empty-state">
              <Bookmark size={40} color="#c7c7cc" />
              <p>{t('noSavedItems', 'Hozircha hech narsa saqlanmagan')}</p>
            </div>
          ) : (
            <>
              {/* --- ISH E'LONLARI BO'LIMI --- */}
              {savedJobs.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>{t('jobAds', 'Ish e\'lonlari')}</h3>
                  {savedJobs.map(job => {
                    const fullJob = MOCK_JOBS.find(mj => mj.id === job.id) || job;
                    return (
                    <div 
                      key={fullJob.id || job.id} 
                      className="app-card glass squircle" 
                      onClick={() => {
                        if (fullJob && onJobClick) {
                          onJobClick(fullJob);
                        }
                      }}
                      style={{ padding: '12px', marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <img src={fullJob.logo || fullJob.image} alt={fullJob.company} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', lineHeight: '1.2' }}>{fullJob.title}</div>
                        <div style={{ fontSize: '13px', color: '#8E8E93', marginTop: '4px' }}>{fullJob.company}</div>
                        {fullJob.salary && <div style={{ fontSize: '13px', color: '#34C759', fontWeight: 'bold', marginTop: '4px' }}>{fullJob.salary}</div>}
                        {fullJob.location && <div style={{ fontSize: '12px', color: '#8E8E93', marginTop: '2px' }}>📍 {fullJob.location}</div>}
                      </div>
                    </div>
                  )})}
                </div>
              )}

              {/* --- AVTOMAKTABLAR BO'LIMI --- */}
              {savedSchools.length > 0 && (
                <div>
                  <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>{t('drivingSchools', 'Avtomaktablar')}</h3>
                  {savedSchools.map(school => {
                    const fullSchool = MOCK_SCHOOLS.find(ms => ms.id === school.id) || school;
                    return (
                    <div 
                      key={fullSchool.id || school.id} 
                      className="app-card glass squircle" 
                      onClick={() => {
                        if (fullSchool && onSchoolClick) {
                          onSchoolClick(fullSchool);
                        }
                      }}
                      style={{ padding: '12px', marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <img src={fullSchool.image} alt={fullSchool.name} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', lineHeight: '1.2' }}>{fullSchool.name}</div>
                        {fullSchool.location && <div style={{ fontSize: '13px', color: '#8E8E93', marginTop: '4px' }}>📍 {fullSchool.location}</div>}
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // ===== MY SHOUKAI PAGE =====
  if (activePage === 'my_shoukai') {
    if (userRole === 'company') {
      const shoukaiApps = applications.filter(a => a.company === profileData.fullName && a.shoukaiId);
      return (
        <div className="profile-container fade-in">
          <div className="profile-sticky-back">
            <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
          </div>
          <div className="sub-page-header" style={{ paddingTop: '56px' }}>
            <h2>
              {t('shoukaiViaApps', 'Shoukai orqali kelganlar')}
              <span className="section-header-count">({shoukaiApps.length})</span>
            </h2>
          </div>
          <div className="applications-list" style={{ padding: '16px' }}>
            {shoukaiApps.length === 0 ? (
              <p style={{ color: '#8E8E93', textAlign: 'center', marginTop: '20px' }}>{t('noShoukaiApps', 'Hozircha shoukai orqali arizalar tushmadi')}</p>
            ) : (
              shoukaiApps.map(app => (
                <div key={app.id} className="glass squircle" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{app.title}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#8E8E93' }}>{t('referredById', 'Tavsiya qilgan ID:')} <span style={{color: '#0A84FF'}}>{app.shoukaiId}</span></p>
                    </div>
                    <span className="shoukai-fee" style={{ fontWeight: 'bold', color: '#34C759' }}>{app.shoukaiAmount}</span>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#0A84FF' }}>{t('application', 'Ariza')}: {t(`status${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`)}</span>
                    {!app.shoukaiPaid ? (
                      <button 
                        className="btn-primary squircle" 
                        style={{ padding: '6px 12px', fontSize: '12px', background: '#34C759' }}
                        onClick={() => onShoukaiPaid && onShoukaiPaid(app.id)}
                      >
                        {t('makePayment', 'To\'lov qilish')}
                      </button>
                    ) : (
                      <span className="shoukai-paid-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34C759', fontWeight: 'bold', fontSize: '13px', background: 'rgba(52, 199, 89, 0.1)', padding: '4px 8px', borderRadius: '12px' }}>
                        <CheckCircle2 size={16} /> {t('paidStatus', 'To\'landi')}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    const myJobRefs = applications.filter(a => a.shoukaiId === profileData.userId);
    const mySchoolRefs = schoolApplications.filter(a => a.shoukaiId === profileData.userId);
    const totalRefs = myJobRefs.length + mySchoolRefs.length;

    return (
      <div className="profile-container fade-in">
        <div className="profile-sticky-back">
          <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
        </div>
        <div className="sub-page-header" style={{ paddingTop: '56px' }}>
          <h2>
            {t('myShoukai', 'Mening Shoukai\'larim')}
            <span className="section-header-count">({totalRefs})</span>
          </h2>
        </div>
        <div className="applications-list" style={{ padding: '16px' }}>
          <div className="glass squircle" style={{ padding: '16px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>{t('shoukaiStats', 'Shoukai Statistikasi')}</h3>
            <p style={{ margin: '4px 0', color: '#8E8E93', fontSize: '14px' }}>{t('totalReferred', 'Jami taklif qilinganlar:')} <strong>{totalRefs}</strong></p>
            <p style={{ margin: '4px 0', color: '#8E8E93', fontSize: '12px' }}>* {t('shoukaiNote', "Shoukai to'lovlari tashkilotlar tomonidan tasdiqlangach sizga beriladi. Ilovada faqat ularning holatini kuzatib borasiz.")}</p>
          </div>

          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>{t('referralList', 'Takliflar ro\'yxati')}</h3>
          {totalRefs === 0 ? (
            <p style={{ color: '#8E8E93', textAlign: 'center', marginTop: '20px' }}>{t('noReferralsYet', 'Hali hech kimni taklif qilmadingiz')}</p>
          ) : (
            <>
              {myJobRefs.map(app => (
                <div key={app.id} className="glass squircle" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{app.title} ({t('job', 'Ish')})</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#8E8E93' }}>{t('company', 'Kompaniya')}: {app.company}</p>
                    </div>
                    <span className="shoukai-fee" style={{ fontWeight: 'bold', color: '#FF9F0A', fontSize: '13px' }}>🎉 {t('shoukaiAvailableLabel', 'Puli Bor')}</span>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#0A84FF' }}>{t('appStatus', 'Ariza holati')}: {t(`status${app.status.charAt(0).toUpperCase() + app.status.slice(1)}`)}</span>
                    {app.shoukaiPaid ? (
                      <span className="shoukai-paid-badge"><CheckCircle2 size={16} /> {t('paidStatus', 'To\'landi')}</span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#FF9F0A' }}>⏳ {t('paymentPending', 'To\'lov kutilmoqda')}</span>
                    )}
                  </div>
                </div>
              ))}
              {mySchoolRefs.map(app => (
                <div key={app.id} className="glass squircle" style={{ padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{app.schoolName} ({t('school', 'Maktab')})</h4>
                    </div>
                    <span className="shoukai-fee" style={{ fontWeight: 'bold', color: '#FF9F0A', fontSize: '13px' }}>🎉 {t('shoukaiAvailableLabel', 'Puli Bor')}</span>
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#0A84FF' }}>{t('appStatus', 'Ariza holati')}: {t('statusSubmitted', 'Yuborildi')}</span>
                    {app.paid ? (
                      <span className="shoukai-paid-badge"><CheckCircle2 size={16} /> {t('paidStatus', 'To\'landi')}</span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#FF9F0A' }}>⏳ {t('paymentPending', 'To\'lov kutilmoqda')}</span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  }

  // ===== COMPANY HR (EMPLOYEES) PAGE =====
  if (activePage === 'employees') {
    return (
      <div className="profile-container fade-in">
        <div className="profile-sticky-back">
          <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
        </div>
        <div className="sub-page-header" style={{ paddingTop: '56px' }}>
          <h2>
            {t('employeesHR', 'Xodimlar (HR)')}
            <span className="section-header-count">({companyEmployees.length})</span>
          </h2>
        </div>
        <div className="applications-list" style={{ padding: '16px' }}>
          
          <div className="glass squircle" style={{ padding: '16px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>{t('addNewEmployee', 'Yangi xodim qo\'shish')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                className="edit-input" 
                placeholder={t('michiIdPlaceholder', 'Michi ID (Ixtiyoriy, masalan: #Michi-A1B2)')} 
                value={empInputId} 
                onChange={e => setEmpInputId(e.target.value)} 
                maxLength={12}
              />
              {!empInputId && (
                <>
                  <input 
                    className="edit-input" 
                    placeholder={t('empNamePlaceholder', 'Xodim ismi')} 
                    value={empInputName} 
                    onChange={e => setEmpInputName(e.target.value)} 
                    maxLength={50}
                  />
                  <input 
                    className="edit-input" 
                    placeholder={t('phone', 'Telefon raqam')} 
                    value={empInputPhone} 
                    onChange={e => setEmpInputPhone(e.target.value)} 
                    maxLength={20}
                  />
                </>
              )}
              <button 
                className="demo-btn accepted" 
                style={{ alignSelf: 'flex-start', padding: '10px 20px' }}
                onClick={() => {
                  if (empInputId) {
                    // Send notification to user to accept
                    setNotifications(prev => [{
                      id: Date.now(),
                      type: 'employee_request',
                      company: profileData.companyName || 'Sizning Kompaniyangiz',
                      title: t('empRequestTitle', 'Sizni xodim sifatida qo\'shmoqchi'),
                      date: new Date().toLocaleString(),
                      read: false,
                      michiId: empInputId
                    }, ...prev]);
                    onAddEmployee({ name: t('pending', 'Kutilmoqda...'), phone: '', role: t('roleDriver', 'Haydovchi'), verified: false, michiId: empInputId });
                    alert(t('requestSent', "Xodimga so'rov yuborildi!"));
                  } else if (empInputName) {
                    onAddEmployee({ name: empInputName, phone: empInputPhone, role: t('roleDriver', 'Haydovchi'), verified: false, michiId: null });
                  }
                  setEmpInputId('');
                  setEmpInputName('');
                  setEmpInputPhone('');
                }}
              >
                {t('addBtn', 'Qo\'shish')}
              </button>
            </div>
          </div>

          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>{t('allEmployees', 'Barcha xodimlar')}</h3>
          {companyEmployees.length === 0 ? (
            <p style={{ color: '#8E8E93', textAlign: 'center', marginTop: '20px' }}>{t('noEmployeesYet', 'Hali xodimlar qo\'shilmagan')}</p>
          ) : (
            companyEmployees.map(emp => (
              <div key={emp.id} className="glass squircle" style={{ padding: '16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {emp.name}
                    {emp.verified ? (
                      <CheckCircle2 size={16} color="#34C759" />
                    ) : (
                      <span title={t('unverifiedTooltip', "Xodim ilovani yuklab olib, tasdiqlashi kerak")} style={{ display: 'flex', alignItems: 'center', color: '#FF9F0A' }}>
                        ⚠️
                      </span>
                    )}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#8E8E93' }}>{emp.role} • {emp.phone}</p>
                  {emp.michiId && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#0A84FF' }}>ID: {emp.michiId}</p>}
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    );
  }

  // ===== MAIN PROFILE PAGE =====
  return (
    <div className="profile-container fade-in">
      <div className="profile-header">
        <div className="profile-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
          <img src={getAvatarSrc()} alt="User" className="profile-avatar" />
          <div className="avatar-change-overlay">
            <Camera size={20} color="white" />
          </div>
        </div>
        <input 
          ref={fileInputRef} type="file" accept="image/*" 
          onChange={handleAvatarChange} style={{ display: 'none' }} 
        />
        <h2>{profileData.fullName}</h2>
        <p>{profileData.email}</p>
        <span className="role-tag glass">{getRoleLabel()}</span>
        {profileData.jlptStatus && profileData.jlptStatus.verified && (
          <span className="role-tag glass animate-scale-up" style={{ border: '1px solid rgba(48, 209, 88, 0.4)', background: 'rgba(48, 209, 88, 0.08)', color: '#30D158', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '6px', fontWeight: 'bold' }}>
            <ShieldCheck size={12} color="#30D158" />
            <span>JLPT {profileData.jlptStatus.level} Verified</span>
          </span>
        )}
      </div>

      <div className="profile-menu">
        {/* Guest Register Banner */}
        {userRole === 'guest' && (
          <div className="guest-register-banner glass squircle" style={{
            padding: '20px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(90, 85, 234, 0.15))',
            border: '1px solid rgba(10, 132, 255, 0.3)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {t('guestRegisterBannerTitle', "Barcha imkoniyatlardan foydalanish uchun ro'yxatdan o'ting")}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {t('guestRegisterBannerDesc', "Ro'yxatdan o'tib, rezyume yaratishingiz va ish e'lonlariga ariza topshirishingiz mumkin.")}
            </p>
            <button 
              className="btn-primary squircle guest-register-trigger-btn"
              style={{
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 'bold',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(90, 85, 234, 0.3)',
                width: 'auto',
                minWidth: '160px'
              }}
              onClick={onTriggerRegister}
            >
              {t('registerTitle', "Ro'yxatdan o'tish")}
            </button>
          </div>
        )}

        {/* Resume Card */}
        {(userRole === 'driver' || userRole === 'guest') && (
          <div className="menu-group glass squircle resume-card">
            <div className="resume-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <FileText size={20} color="#0A84FF" />
                <h3>{t('myResume')}</h3>
              </div>
              <button 
                className="resume-edit-btn"
                onClick={() => setActivePage('resume_builder')}
              >
                📝 {t('createResume', 'Tahrirlash / Yuklash')}
              </button>
            </div>
            <div className="resume-body">
              <div className="resume-field">
                <span className="field-label">{t('birthDateLabel')}</span>
                <span className="field-value">{profileData.birthDate || t('notProvided')}</span>
              </div>
              <div className="resume-field">
                <span className="field-label">{t('birthPlaceLabel', "Tug'ilgan joyi")}</span>
                <span className="field-value">{profileData.birthPlace || t('notProvided')}</span>
              </div>
              <div className="resume-field">
                <span className="field-label">{t('nationalityLabel', "Millati")}</span>
                <span className="field-value">{profileData.nationality || t('notProvided')}</span>
              </div>

              {/* Living Address History */}
              <div className="resume-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <span className="resume-section-title">{t('livingAddressTitle', 'Yashash manzillari')}</span>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {profileData.addressHistory && profileData.addressHistory.length > 0 ? (
                    profileData.addressHistory.map((a, i) => (
                      <div key={i} className="resume-address-card squircle">
                        <span className="address-text">{a.address}</span>
                        {a.isCurrent && (
                          <span className="resume-current-tag living">
                            {t('currentAddressLabel', 'Hozirgi')}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="resume-empty-state">{profileData.address || t('notProvided')}</span>
                  )}
                </div>
              </div>

              {/* Education History */}
              <div className="resume-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <span className="resume-section-title">{t('educationTitle', 'Ta\'lim ma\'lumotlari')}</span>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {profileData.educationHistory && profileData.educationHistory.length > 0 ? (
                    profileData.educationHistory.map((edu, i) => (
                      <div key={i} className="resume-edu-card">
                        <div className="edu-top">
                          <span className="edu-school">{edu.school}</span>
                          {edu.isCurrent && (
                            <span className="resume-current-tag studying">
                              {t('currentlyStudyingLabel', 'O\'qiyotgan')}
                            </span>
                          )}
                        </div>
                        {edu.major && <span className="edu-major">{edu.major}</span>}
                        <span className="edu-dates">
                          📅 {edu.startDate || '?'} ~ {edu.isCurrent ? t('currentlyStudyingLabel', 'Hozirgi vaqtda') : edu.endDate || '?'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="resume-empty-state" style={{ whiteSpace: 'pre-wrap' }}>{profileData.education || t('notProvided')}</span>
                  )}
                </div>
              </div>

              {/* Driver Licenses */}
              <div className="resume-field" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '8px'}}>
                <span className="resume-section-title">{t('driverLicensesLabel', 'Haydovchilik guvohnomalari')}</span>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                  {profileData.driverLicenses && profileData.driverLicenses.length > 0 ? 
                    profileData.driverLicenses.map(l => (
                      <span key={l} className="resume-badge-chip license">{t(`lic_${l}`)}</span>
                    )) : 
                    <span className="resume-empty-state">{t('notProvided', 'Kiritilmagan')}</span>
                  }
                </div>
              </div>

              {/* Tech Certificates */}
              <div className="resume-field" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '8px'}}>
                <span className="resume-section-title">{t('techCertsLabel', 'Maxsus texnika va malaka sertifikatlari')}</span>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                  {profileData.techCertificates && profileData.techCertificates.length > 0 ? 
                    profileData.techCertificates.map(tc => (
                      <span key={tc} className="resume-badge-chip cert">{t(`tech_${tc}`)}</span>
                    )) : 
                    <span className="resume-empty-state">{t('notProvided', 'Kiritilmagan')}</span>
                  }
                </div>
              </div>

              {/* Work Experience */}
              {profileData.workHistory && profileData.workHistory.length > 0 && (
                <div className="resume-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <span className="resume-section-title">{t('workExperience')}</span>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {profileData.workHistory.map((w, i) => (
                      <div key={i} className="resume-timeline-item">
                        <span className="work-company">{w.company}</span>
                        {w.position && <span className="work-position">{w.position}</span>}
                        <span className="work-dates">
                          📅 {w.startDate || '?'} ~ {w.isCurrent ? t('currentPosition', 'Hozir') : w.endDate || '?'}
                        </span>
                        {w.isCurrent && (
                          <span className="work-current-badge">{t('currentPosition', 'Hozir ishlayapman')}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Mening Mashinam (My Vehicle) Card */}
        {(userRole === 'driver' || userRole === 'guest') && (
          <div className="menu-group glass squircle resume-card" style={{ marginTop: '16px' }}>
            <div className="resume-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <Wrench size={20} color="#30D158" />
                <h3 style={{ margin: 0 }}>{getProfileLangText('myVehicleTitle')}</h3>
              </div>
              {!isEditingVehicle && (
                <button 
                  className="resume-edit-btn"
                  onClick={() => {
                    setEditVehicleData({ ...myVehicle });
                    setIsEditingVehicle(true);
                  }}
                >
                  📝 {getProfileLangText('editVehicle')}
                </button>
              )}
            </div>

            <div className="resume-body">
              {!isEditingVehicle ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                  {/* Visual Layout: 3D Vehicle Render Left, Japanese License Plate Right */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 0.8fr',
                    gap: '12px',
                    width: '100%',
                    alignItems: 'center'
                  }}>
                    {/* Vehicle Graphic Display */}
                    <div className="vehicle-display-box squircle" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--card-bg, rgba(255, 255, 255, 0.03))',
                      border: '1px solid var(--glass-border)',
                      padding: '12px',
                      height: '110px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%)',
                        pointerEvents: 'none'
                      }}></div>
                      <div style={{ width: '130px', height: '65px', transform: 'scale(1.2)' }}>
                        {renderVehicleSVG(myVehicle.type, myVehicle.bodyStyle, myVehicle.color)}
                      </div>
                    </div>

                    {/* JDM License Plate Display */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      {renderJDMPlateBox(myVehicle, false)}
                      {myVehicle.driverMark && myVehicle.driverMark !== 'none' && (
                        <div style={{ marginTop: '14px' }}>
                          {renderDriverMarkBadge(myVehicle.driverMark)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div className="resume-field">
                      <span className="field-label">{getProfileLangText('vehicleTypeLabel')}</span>
                      <span className="field-value" style={{ textTransform: 'capitalize' }}>
                        {myVehicle.type === 'car' ? getProfileLangText('type_car') :
                         myVehicle.type === 'moto' ? getProfileLangText('type_moto') :
                         myVehicle.type === 'velo' ? getProfileLangText('type_velo') :
                         myVehicle.type === 'kei_truck' ? getProfileLangText('type_kei_truck') :
                         myVehicle.type === 'truck_2t' ? getProfileLangText('type_truck_2t') :
                         myVehicle.type === 'truck_3t' ? getProfileLangText('type_truck_3t') :
                         myVehicle.type === 'truck_4t' ? getProfileLangText('type_truck_4t') :
                         myVehicle.type === 'truck_10t' ? getProfileLangText('type_truck_10t') :
                         myVehicle.type === 'trailer' ? getProfileLangText('type_trailer') :
                         myVehicle.type === 'tanker' ? getProfileLangText('type_tanker') :
                         myVehicle.type === 'bus' ? getProfileLangText('type_bus') : myVehicle.type}
                      </span>
                    </div>

                    <div className="resume-field">
                      <span className="field-label">{getProfileLangText('vehicleModelLabel')}</span>
                      <span className="field-value" style={{ fontWeight: 'bold' }}>
                        {myVehicle.make} {myVehicle.model} {myVehicle.trim && `(${myVehicle.trim})`}
                      </span>
                    </div>

                    <div className="resume-field">
                      <span className="field-label">{getProfileLangText('vehicleBodyStyleLabel')}</span>
                      <span className="field-value" style={{ textTransform: 'capitalize' }}>
                        {myVehicle.bodyStyle === 'sedan' ? getProfileLangText('body_sedan') :
                         myVehicle.bodyStyle === 'hatchback' ? getProfileLangText('body_hatchback') :
                         myVehicle.bodyStyle === 'suv' ? getProfileLangText('body_suv') :
                         myVehicle.bodyStyle === 'minivan' ? getProfileLangText('body_minivan') :
                         myVehicle.bodyStyle === 'scooter' ? getProfileLangText('body_scooter') :
                         myVehicle.bodyStyle === 'sportbike' ? getProfileLangText('body_sportbike') :
                         myVehicle.bodyStyle === 'flatbed' ? getProfileLangText('body_flatbed') :
                         myVehicle.bodyStyle === 'box_truck' ? getProfileLangText('body_box_truck') :
                         myVehicle.bodyStyle === 'wing_body' ? getProfileLangText('body_wing_body') :
                         myVehicle.bodyStyle === 'dump_truck' ? getProfileLangText('body_dump_truck') :
                         myVehicle.bodyStyle === 'trailer_container' ? getProfileLangText('body_trailer_container') :
                         myVehicle.bodyStyle || getProfileLangText('body_standard')}
                      </span>
                    </div>

                    <div className="resume-field">
                      <span className="field-label">{getProfileLangText('vehicleYearLabel')}</span>
                      <span className="field-value">{myVehicle.year || '-'}</span>
                    </div>

                    <div className="resume-field" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--glass-border)', paddingTop: '8px', marginTop: '4px' }}>
                      <span className="field-label" style={{ marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📐 <span>{getProfileLangText('vehicleDimensionsLabel')}</span>
                        <span style={{ fontSize: '9px', background: '#34C759', color: 'white', padding: '1px 5px', borderRadius: '3px', fontWeight: 'normal', marginLeft: 'auto' }}>
                          {i18n.language === 'ja' ? '自動設定済み' : i18n.language === 'en' ? 'CONFIGURED' : 'SOZLANGAN'}
                        </span>
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px 8px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('heightLabel')}</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{myVehicle.height} m</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('widthLabel')}</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{myVehicle.width} m</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('lengthLabel')}</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{myVehicle.length} m</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('weightLabel')}</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{myVehicle.weight} t</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('axleLoadLabel')}</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{myVehicle.axleLoad || '-'} t</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('minTurnRadiusLabel')}</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{myVehicle.minTurnRadius || '-'} m</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* List of all vehicles */}
                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        {i18n.language === 'ja' ? '登録車両リスト' : i18n.language === 'en' ? 'My Fleet / Vehicles List' : 'Mening transportlarim roʻyxati'}
                      </span>
                      <button 
                        onClick={handleAddNewVehicle}
                        style={{
                          background: 'var(--primary)',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={12} /> {i18n.language === 'ja' ? '新規追加' : i18n.language === 'en' ? 'Add New' : 'Qoʻshish'}
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {myVehicles.map(veh => {
                        const isActive = myVehicle.id === veh.id;
                        return (
                          <div 
                            key={veh.id}
                            onClick={() => handleSelectActiveVehicle(veh)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: isActive ? 'rgba(48, 209, 88, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                              border: isActive ? '1px solid #30D158' : '1px solid var(--glass-border)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '40px', height: '22px' }}>
                                {renderVehicleSVG(veh.type, veh.bodyStyle, veh.color)}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                  {veh.make} {veh.model}
                                </span>
                                <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                                  {veh.type === 'car' ? getProfileLangText('type_car') :
                                   veh.type === 'kei_truck' ? getProfileLangText('type_kei_truck') :
                                   veh.type === 'truck_2t' ? getProfileLangText('type_truck_2t') :
                                   veh.type === 'truck_3t' ? getProfileLangText('type_truck_3t') :
                                   veh.type === 'truck_4t' ? getProfileLangText('type_truck_4t') :
                                   veh.type === 'truck_10t' ? getProfileLangText('type_truck_10t') :
                                   veh.type === 'trailer' ? getProfileLangText('type_trailer') :
                                   veh.type === 'tanker' ? getProfileLangText('type_tanker') :
                                   veh.type === 'bus' ? getProfileLangText('type_bus') : veh.type} 
                                  {' • '} H: {veh.height}m W: {veh.width}m Wt: {veh.weight}t
                                </span>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {isActive ? (
                                <span style={{ fontSize: '9px', background: '#30D158', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  {i18n.language === 'ja' ? '選択中' : i18n.language === 'en' ? 'ACTIVE' : 'FAOL'}
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => handleDeleteVehicle(veh.id, e)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#FF453A',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '4px'
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                  {/* Realtime Live Preview with dynamic paint color and JDM Plate Preview */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 0.8fr',
                    gap: '12px',
                    width: '100%',
                    alignItems: 'center'
                  }}>
                    {/* Live SVG Preview */}
                    <div className="vehicle-display-box squircle" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--card-bg, rgba(255, 255, 255, 0.03))',
                      border: '1px dashed var(--primary)',
                      padding: '12px',
                      height: '100px',
                      position: 'relative'
                    }}>
                      <div style={{ width: '120px', height: '60px', transform: 'scale(1.2)' }}>
                        {renderVehicleSVG(editVehicleData.type, editVehicleData.bodyStyle, editVehicleData.color)}
                      </div>
                      <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '6px',
                        fontSize: '7px',
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '1px 4px',
                        borderRadius: '3px',
                        fontWeight: 'bold'
                      }}>PREVIEW</span>
                    </div>

                    {/* Live Plate Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      {renderJDMPlateBox(editVehicleData, true)}
                      {editVehicleData.driverMark && editVehicleData.driverMark !== 'none' && (
                        <div style={{ transform: 'scale(0.9)', marginTop: '4px' }}>
                          {renderDriverMarkBadge(editVehicleData.driverMark)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Form inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{getProfileLangText('vehicleTypeLabel')}</label>
                      <select 
                        value={editVehicleData.type}
                        onChange={e => {
                          const val = e.target.value;
                          let defaultStyle = 'sedan';
                          let mk = 'Toyota';
                          let md = 'Harrier';
                          
                          if (val === 'moto') { defaultStyle = 'scooter'; mk = 'Honda'; md = 'Super Cub'; }
                          else if (val === 'velo') { defaultStyle = 'standard'; mk = 'Bridgestone'; md = 'City Cycle'; }
                          else if (val === 'kei_truck') { defaultStyle = 'flatbed'; mk = 'Suzuki'; md = 'Carry'; }
                          else if (val === 'truck_2t') { defaultStyle = 'box_truck'; mk = 'Isuzu'; md = 'Elf'; }
                          else if (val === 'truck_3t') { defaultStyle = 'box_truck'; mk = 'Isuzu'; md = 'Elf'; }
                          else if (val === 'truck_4t') { defaultStyle = 'wing_body'; mk = 'Hino'; md = 'Ranger'; }
                          else if (val === 'truck_10t') { defaultStyle = 'wing_body'; mk = 'Isuzu'; md = 'Giga'; }
                          else if (val === 'trailer') { defaultStyle = 'trailer_container'; mk = 'Mitsubishi Fuso'; md = 'Super Great'; }
                          else if (val === 'tanker') { defaultStyle = 'box_truck'; mk = 'UD Quon'; md = 'Chemical Tanker'; }
                          else if (val === 'bus') { defaultStyle = 'standard'; mk = 'Isuzu'; md = 'Gala'; }
                          
                          const dims = getVehiclePresetDimensions(val, defaultStyle);
                          
                          setEditVehicleData(prev => ({ 
                             ...prev, 
                             type: val,
                             make: mk,
                             model: md,
                             bodyStyle: defaultStyle,
                             ...dims
                          }));
                        }}
                        style={{
                          background: 'var(--card-bg, #2c2c2e)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '7px',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      >
                        <option value="car">{getProfileLangText('type_car')}</option>
                        <option value="kei_truck">{getProfileLangText('type_kei_truck')}</option>
                        <option value="truck_2t">{getProfileLangText('type_truck_2t')}</option>
                        <option value="truck_3t">{getProfileLangText('type_truck_3t')}</option>
                        <option value="truck_4t">{getProfileLangText('type_truck_4t')}</option>
                        <option value="truck_10t">{getProfileLangText('type_truck_10t')}</option>
                        <option value="trailer">{getProfileLangText('type_trailer')}</option>
                        <option value="tanker">{getProfileLangText('type_tanker')}</option>
                        <option value="moto">{getProfileLangText('type_moto')}</option>
                        <option value="velo">{getProfileLangText('type_velo')}</option>
                        <option value="bus">{getProfileLangText('type_bus')}</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{getProfileLangText('vehicleBodyStyleLabel')}</label>
                      <select
                        value={editVehicleData.bodyStyle}
                        onChange={e => {
                          const val = e.target.value;
                          const dims = getVehiclePresetDimensions(editVehicleData.type, val);
                          setEditVehicleData(prev => ({ 
                            ...prev, 
                            bodyStyle: val,
                            ...dims
                          }));
                        }}
                        style={{
                          background: 'var(--card-bg, #2c2c2e)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '7px',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      >
                        {editVehicleData.type === 'car' && (
                          <>
                            <option value="sedan">{getProfileLangText('body_sedan')}</option>
                            <option value="hatchback">{getProfileLangText('body_hatchback')}</option>
                            <option value="suv">{getProfileLangText('body_suv')}</option>
                            <option value="minivan">{getProfileLangText('body_minivan')}</option>
                          </>
                        )}
                        {editVehicleData.type === 'moto' && (
                          <>
                            <option value="scooter">{getProfileLangText('body_scooter')}</option>
                            <option value="sportbike">{getProfileLangText('body_sportbike')}</option>
                          </>
                        )}
                        {editVehicleData.type === 'velo' && <option value="standard">{getProfileLangText('body_standard')}</option>}
                        {editVehicleData.type === 'truck_3t' && (
                          <>
                            <option value="flatbed">{getProfileLangText('body_flatbed')}</option>
                            <option value="box_truck">{getProfileLangText('body_box_truck')}</option>
                          </>
                        )}
                        {editVehicleData.type === 'truck_4t' && (
                          <>
                            <option value="flatbed">{getProfileLangText('body_flatbed')}</option>
                            <option value="box_truck">{getProfileLangText('body_box_truck')}</option>
                            <option value="wing_body">{getProfileLangText('body_wing_body')}</option>
                            <option value="dump_truck">{getProfileLangText('body_dump_truck')}</option>
                          </>
                        )}
                        {editVehicleData.type === 'trailer' && <option value="trailer_container">{getProfileLangText('body_trailer_container')}</option>}
                        {editVehicleData.type === 'bus' && <option value="standard">{getProfileLangText('body_standard')}</option>}
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehicleMake', 'Ishlab chiqaruvchi (Brand)')}</label>
                      <select 
                        value={editVehicleData.make}
                        onChange={e => {
                          const val = e.target.value;
                          let defaultModel = 'Other';
                          let defaultBody = 'sedan';
                          
                          if (editVehicleData.type === 'car') {
                            if (val === 'Toyota') { defaultModel = 'Harrier'; defaultBody = 'suv'; }
                            else if (val === 'Honda') { defaultModel = 'Freed'; defaultBody = 'minivan'; }
                            else if (val === 'Nissan') { defaultModel = 'Serena'; defaultBody = 'minivan'; }
                          } else if (editVehicleData.type === 'moto') {
                            if (val === 'Honda') { defaultModel = 'Super Cub'; defaultBody = 'scooter'; }
                          } else if (editVehicleData.type === 'kei_truck') {
                            if (val === 'Suzuki') { defaultModel = 'Carry'; defaultBody = 'flatbed'; }
                          } else if (editVehicleData.type === 'truck_2t' || editVehicleData.type === 'truck_3t') {
                            if (val === 'Isuzu') { defaultModel = 'Elf'; defaultBody = 'box_truck'; }
                            else if (val === 'Mitsubishi Fuso') { defaultModel = 'Canter'; defaultBody = 'box_truck'; }
                          } else if (editVehicleData.type === 'truck_4t') {
                            if (val === 'Hino') { defaultModel = 'Ranger'; defaultBody = 'wing_body'; }
                            else if (val === 'Isuzu') { defaultModel = 'Forward'; defaultBody = 'wing_body'; }
                            else if (val === 'Mitsubishi Fuso') { defaultModel = 'Fighter'; defaultBody = 'wing_body'; }
                          } else if (editVehicleData.type === 'truck_10t') {
                            if (val === 'Isuzu') { defaultModel = 'Giga'; defaultBody = 'wing_body'; }
                            else if (val === 'Hino') { defaultModel = 'Profia'; defaultBody = 'wing_body'; }
                            else if (val === 'Mitsubishi Fuso') { defaultModel = 'Super Great'; defaultBody = 'wing_body'; }
                            else if (val === 'UD Trucks') { defaultModel = 'Quon'; defaultBody = 'wing_body'; }
                          } else if (editVehicleData.type === 'trailer') {
                            if (val === 'Hino') { defaultModel = 'Profia'; defaultBody = 'trailer_container'; }
                            else if (val === 'Isuzu') { defaultModel = 'Giga'; defaultBody = 'trailer_container'; }
                            else if (val === 'Mitsubishi Fuso') { defaultModel = 'Super Great'; defaultBody = 'trailer_container'; }
                            else if (val === 'UD Trucks') { defaultModel = 'Quon'; defaultBody = 'trailer_container'; }
                          } else if (editVehicleData.type === 'tanker') {
                            if (val === 'UD Trucks') { defaultModel = 'Quon'; defaultBody = 'box_truck'; }
                            else if (val === 'Isuzu') { defaultModel = 'Giga'; defaultBody = 'box_truck'; }
                          } else if (editVehicleData.type === 'bus') {
                            defaultModel = 'Gala';
                            defaultBody = 'standard';
                          } else if (editVehicleData.type === 'velo') {
                            defaultModel = 'City Cycle';
                            defaultBody = 'standard';
                          }

                          const dims = getVehiclePresetDimensions(editVehicleData.type, defaultBody);
                          
                          setEditVehicleData(prev => ({ 
                            ...prev, 
                            make: val, 
                            model: defaultModel,
                            bodyStyle: defaultBody,
                            ...dims
                          }));
                        }}
                        style={{
                          background: 'var(--card-bg, #2c2c2e)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '7px',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      >
                        <option value="Toyota">Toyota</option>
                        <option value="Honda">Honda</option>
                        <option value="Nissan">Nissan</option>
                        <option value="Suzuki">Suzuki</option>
                        <option value="Hino">Hino</option>
                        <option value="Isuzu">Isuzu</option>
                        <option value="Mitsubishi Fuso">Mitsubishi Fuso</option>
                        <option value="UD Trucks">UD Trucks</option>
                        <option value="Boshqa">Boshqa (Other)</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehicleModel', 'Modeli')}</label>
                      {editVehicleData.make !== 'Boshqa' ? (
                        <select 
                          value={editVehicleData.model}
                          onChange={e => {
                            const val = e.target.value;
                            // Update bodyStyle if matched in preset models
                            let matchedBody = editVehicleData.bodyStyle;
                            if (val === 'Harrier') matchedBody = 'suv';
                            else if (val === 'Prius') matchedBody = 'sedan';
                            else if (val === 'Alphard' || val === 'Freed' || val === 'Stepwgn' || val === 'Serena') matchedBody = 'minivan';
                            else if (val === 'Yaris' || val === 'Fit' || val === 'Note') matchedBody = 'hatchback';
                            else if (val === 'Super Cub') matchedBody = 'scooter';
                            else if (val === 'Elf' || val === 'Canter') matchedBody = 'box_truck';
                            else if (val === 'Ranger' || val === 'Forward' || val === 'Fighter') matchedBody = 'wing_body';
                            else if (val === 'Profia' || val === 'Giga' || val === 'Super Great') matchedBody = 'trailer_container';
                            else if (val === 'Gala') matchedBody = 'standard';
                            else if (val === 'City Cycle') matchedBody = 'standard';
                            
                            const dims = getVehiclePresetDimensions(editVehicleData.type, matchedBody);
                            
                            setEditVehicleData(prev => ({ 
                              ...prev, 
                              model: val, 
                              bodyStyle: matchedBody,
                              ...dims
                            }));
                          }}
                          style={{
                            background: 'var(--card-bg, #2c2c2e)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            padding: '7px',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                        >
                          {editVehicleData.make === 'Toyota' && (
                            <>
                              <option value="Harrier">Harrier</option>
                              <option value="Prius">Prius</option>
                              <option value="Alphard">Alphard</option>
                              <option value="Yaris">Yaris</option>
                            </>
                          )}
                          {editVehicleData.make === 'Honda' && (
                            <>
                              <option value="Freed">Freed</option>
                              <option value="Stepwgn">Stepwgn</option>
                              <option value="Fit">Fit</option>
                              <option value="Super Cub">Super Cub</option>
                            </>
                          )}
                          {editVehicleData.make === 'Nissan' && (
                            <>
                              <option value="Serena">Serena Van</option>
                              <option value="Note">Note Hatchback</option>
                            </>
                          )}
                          {editVehicleData.make === 'Suzuki' && (
                            <>
                              <option value="Carry">Carry</option>
                              <option value="Every">Every</option>
                            </>
                          )}
                          {editVehicleData.make === 'Hino' && (
                            <>
                              <option value="Ranger">Ranger 4t</option>
                              <option value="Profia">Profia 10t</option>
                            </>
                          )}
                          {editVehicleData.make === 'Isuzu' && (
                            <>
                              <option value="Elf">Elf 2t/3t</option>
                              <option value="Forward">Forward 4t</option>
                              <option value="Giga">Giga 10t</option>
                            </>
                          )}
                          {editVehicleData.make === 'Mitsubishi Fuso' && (
                            <>
                              <option value="Canter">Canter 3t</option>
                              <option value="Fighter">Fighter 4t</option>
                              <option value="Super Great">Super Great 10t</option>
                            </>
                          )}
                          {editVehicleData.make === 'UD Trucks' && (
                            <>
                              <option value="Quon">Quon</option>
                              <option value="Condor">Condor</option>
                            </>
                          )}
                        </select>
                      ) : (
                        <input 
                          type="text"
                          placeholder="Harrier, Freed..."
                          value={editVehicleData.model}
                          onChange={e => setEditVehicleData(prev => ({ ...prev, model: e.target.value }))}
                          style={{
                            background: 'var(--card-bg, #2c2c2e)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            padding: '7px',
                            fontSize: '13px',
                            outline: 'none'
                          }}
                          required
                        />
                      )}
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        {getProfileLangText('constructorTitle')}
                      </span>
                      
                      {/* Datalist containing ALL 100+ Japanese Plate Offices */}
                      <datalist id="jdm-prefectures">
                        {/* Hokkaido */}
                        <option value="札幌" /><option value="函館" /><option value="旭川" /><option value="室蘭" /><option value="釧路" /><option value="帯広" /><option value="北見" /><option value="小樽" /><option value="苫小牧" /><option value="知床" />
                        {/* Tohoku */}
                        <option value="青森" /><option value="八户" /><option value="盛岡" /><option value="岩手" /><option value="平泉" /><option value="仙台" /><option value="宮城" /><option value="秋田" /><option value="山形" /><option value="庄内" /><option value="福島" /><option value="会津" /><option value="郡山" /><option value="いわき" />
                        {/* Kanto */}
                        <option value="水戸" /><option value="土浦" /><option value="つくば" /><option value="宇tsunomiya" /><option value="とちぎ" /><option value="那須" /><option value="前橋" /><option value="高崎" /><option value="群馬" /><option value="大宮" /><option value="熊谷" /><option value="川口" /><option value="所沢" /><option value="川越" /><option value="春日部" /><option value="越谷" /><option value="千葉" /><option value="成田" /><option value="習志野" /><option value="袖ヶ浦" /><option value="野田" /><option value="柏" /><option value="松戸" /><option value="市川" /><option value="船橋" /><option value="市原" /><option value="品川" /><option value="世田谷" /><option value="練馬" /><option value="杉並" /><option value="板橋" /><option value="足立" /><option value="江東" /><option value="葛飾" /><option value="八王子" /><option value="多摩" /><option value="横浜" /><option value="川崎" /><option value="相模" /><option value="湘南" /><option value="小田原" />
                        {/* Chubu */}
                        <option value="新潟" /><option value="長岡" /><option value="上越" /><option value="富山" /><option value="金沢" /><option value="石川" /><option value="福井" /><option value="山梨" /><option value="富士山" /><option value="長野" /><option value="松本" /><option value="諏訪" /><option value="岐阜" /><option value="飛騨" /><option value="静岡" /><option value="沼津" /><option value="浜松" /><option value="伊豆" /><option value="豊橋" /><option value="岡崎" /><option value="豊田" /><option value="名古屋" /><option value="尾張小牧" /><option value="一宮" /><option value="春日井" /><option value="三河" /><option value="津" /><option value="鈴鹿" /><option value="四日市" /><option value="伊勢志摩" />
                        {/* Kinki */}
                        <option value="滋賀" /><option value="京都" /><option value="大阪" /><option value="なにわ" /><option value="和泉" /><option value="堺" /><option value="飛鳥" /><option value="奈良" /><option value="橿原" /><option value="神戸" /><option value="姫路" /><option value="尼崎" /><option value="和歌山" />
                        {/* Chugoku & Shikoku */}
                        <option value="鳥取" /><option value="島根" /><option value="出雲" /><option value="岡山" /><option value="倉敷" /><option value="広島" /><option value="福山" /><option value="下関" /><option value="山口" /><option value="徳島" /><option value="香川" /><option value="高松" /><option value="愛媛" /><option value="高知" />
                        {/* Kyushu & Okinawa */}
                        <option value="福岡" /><option value="久留米" /><option value="北九州" /><option value="筑豊" /><option value="佐賀" /><option value="長崎" /><option value="佐世保" /><option value="熊本" /><option value="大分" /><option value="宮崎" /><option value="鹿児島" /><option value="奄美" /><option value="沖縄" /><option value="宮古" /><option value="八重山" />
                      </datalist>

                      {/* 2-Column Grid for JDM Plate Constructor Input Fields */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        {/* Prefecture Text Input (Auto-complete linked to datalist) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('prefectureLabel')}</label>
                          <input 
                            type="text"
                            list="jdm-prefectures"
                            placeholder="練馬, 松戸, 品川..."
                            maxLength="4"
                            value={editVehicleData.platePrefecture || ''}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, platePrefecture: e.target.value.trim().slice(0, 4) }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px',
                              padding: '8px',
                              fontSize: '13px',
                              outline: 'none',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        {/* Class Code */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('classCodeLabel')}</label>
                          <input 
                            type="text" 
                            maxLength="3"
                            placeholder="300"
                            value={editVehicleData.plateClass || ''}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, plateClass: e.target.value.replace(/\D/g, '') }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px',
                              padding: '8px',
                              fontSize: '13px',
                              outline: 'none',
                              textAlign: 'center',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        {/* Hiragana Select */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('hiraLabel')}</label>
                          <select 
                            value={editVehicleData.plateHira || 'あ'}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, plateHira: e.target.value }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px',
                              padding: '8px',
                              fontSize: '13px',
                              outline: 'none',
                              width: '100%',
                              boxSizing: 'border-box',
                              height: '37px'
                            }}
                          >
                            {JDM_HIRAGANA.map(hira => <option key={hira} value={hira}>{hira}</option>)}
                          </select>
                        </div>

                        {/* 4 Digit Main Number */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('numLabel')}</label>
                          <input 
                            type="text" 
                            placeholder="12-34"
                            value={editVehicleData.plateNumber || ''}
                            onChange={e => {
                              let val = e.target.value.replace(/[^\d-]/g, '');
                              if (val.length === 4 && !val.includes('-')) {
                                val = val.slice(0, 2) + '-' + val.slice(2);
                              }
                              setEditVehicleData(prev => ({ ...prev, plateNumber: val }));
                            }}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px',
                              padding: '8px',
                              fontSize: '13px',
                              outline: 'none',
                              textAlign: 'center',
                              letterSpacing: '1px',
                              fontWeight: 'bold',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      {/* JDM Plate design selection */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{getProfileLangText('plateDesignLabel')}</label>
                        <select
                          value={editVehicleData.plateType || 'private'}
                          onChange={e => {
                            const val = e.target.value;
                            setEditVehicleData(prev => ({ 
                              ...prev, 
                              plateType: val,
                              isCommercial: val === 'commercial' || val === 'kei_commercial'
                            }));
                          }}
                          style={{
                            background: 'var(--card-bg, #2c2c2e)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            padding: '8px',
                            fontSize: '13px',
                            outline: 'none',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="private">{getProfileLangText('opt_private')}</option>
                          <option value="commercial">{getProfileLangText('opt_commercial')}</option>
                          <option value="kei_private">{getProfileLangText('opt_kei_private')}</option>
                          <option value="kei_commercial">{getProfileLangText('opt_kei_commercial')}</option>
                          <option value="illustrated_fuji">{getProfileLangText('opt_illustrated_fuji')}</option>
                          <option value="illustrated_expo">{getProfileLangText('opt_illustrated_expo')}</option>
                          <option value="illustrated_flower">{getProfileLangText('opt_illustrated_flower')}</option>
                          <option value="illustrated_matsudo">{getProfileLangText('opt_illustrated_matsudo')}</option>
                        </select>
                      </div>

                      {/* Driver Mark badge selection */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{getProfileLangText('driverBadgeLabel')}</label>
                        <select
                          value={editVehicleData.driverMark || 'none'}
                          onChange={e => setEditVehicleData(prev => ({ ...prev, driverMark: e.target.value }))}
                          style={{
                            background: 'var(--card-bg, #2c2c2e)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            padding: '8px',
                            fontSize: '13px',
                            outline: 'none',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="none">{getProfileLangText('opt_badge_none')}</option>
                          <option value="beginner">{getProfileLangText('opt_badge_beginner')}</option>
                          <option value="elderly">{getProfileLangText('opt_badge_elderly')}</option>
                          <option value="disabled">{getProfileLangText('opt_badge_disabled')}</option>
                          <option value="hearing">{getProfileLangText('opt_badge_hearing')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Color picker */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehicleColor', 'Moshina rangi')}</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="color" 
                          value={editVehicleData.color} 
                          onChange={e => setEditVehicleData(prev => ({ ...prev, color: e.target.value }))}
                          style={{
                            border: 'none',
                            outline: 'none',
                            background: 'none',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer'
                          }}
                        />
                        {/* Preset color chips */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {[
                            { hex: '#5E5CE6', name: 'Indigo' },
                            { hex: '#F2F2F7', name: 'Pearl White' },
                            { hex: '#1C1C1E', name: 'Obsidian' },
                            { hex: '#FF3B30', name: 'Red' },
                            { hex: '#FF9F0A', name: 'Orange' },
                            { hex: '#34C759', name: 'Green' },
                            { hex: '#8E8E93', name: 'Silver' },
                            { hex: '#0A84FF', name: 'Blue' }
                          ].map(chip => (
                            <button
                              key={chip.hex}
                              type="button"
                              onClick={() => setEditVehicleData(prev => ({ ...prev, color: chip.hex }))}
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: chip.hex,
                                border: editVehicleData.color === chip.hex ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.1s ease',
                                boxShadow: editVehicleData.color === chip.hex ? '0 0 6px var(--primary)' : 'none'
                              }}
                              title={chip.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Editable Vehicle Dimensions Grid */}
                    <div style={{
                      gridColumn: 'span 2',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      borderTop: '1px solid var(--glass-border)',
                      paddingTop: '12px',
                      marginTop: '8px'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        📐 {getProfileLangText('vehicleDimensionsLabel')}
                      </span>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '10px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('heightLabel')} (m)</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={editVehicleData.height || ''}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, height: e.target.value }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '8px',
                              padding: '7px',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            required
                          />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('widthLabel')} (m)</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={editVehicleData.width || ''}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, width: e.target.value }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '8px',
                              padding: '7px',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('lengthLabel')} (m)</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={editVehicleData.length || ''}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, length: e.target.value }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '8px',
                              padding: '7px',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('weightLabel')} (t)</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={editVehicleData.weight || ''}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, weight: e.target.value }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '8px',
                              padding: '7px',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('axleLoadLabel')} (t)</label>
                          <input 
                            type="number"
                            step="0.01"
                            value={editVehicleData.axleLoad || ''}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, axleLoad: e.target.value }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '8px',
                              padding: '7px',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            required
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{getProfileLangText('minTurnRadiusLabel')} (m)</label>
                          <input 
                            type="number"
                            step="0.1"
                            value={editVehicleData.minTurnRadius || ''}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, minTurnRadius: e.target.value }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '8px',
                              padding: '7px',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row at the bottom of the form (Prevents Header Horizontal Clutter) */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '16px', width: '100%', gridColumn: 'span 2', boxSizing: 'border-box' }}>
                      <button 
                        type="button"
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.15), rgba(255, 45, 85, 0.15))',
                          border: '1px solid rgba(255, 59, 48, 0.3)',
                          color: '#FF453A',
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        onClick={() => setIsEditingVehicle(false)}
                      >
                        ❌ {t('cancel', 'Bekor qilish')}
                      </button>
                      <button 
                        type="button"
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #0A84FF, #007AFF)',
                          border: 'none',
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(10, 132, 255, 0.3)'
                        }}
                        onClick={handleSaveVehicle}
                      >
                        💾 {t('save', 'Saqlash')}
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Profile Card */}

        {/* Company Profile Card */}
        {userRole === 'company' && (
          <div className="menu-group glass squircle resume-card">
            <div className="resume-header">
              <Building2 size={20} color="#AF52DE" />
              <h3>{t('companyInfo')}</h3>
            </div>
            <div className="resume-body">
              <div className="resume-field">
                <span className="field-label">{t('companyTypeLabel')}</span>
                <span className="field-value badge-blue">
                  {profileData.companyType === 'logistics' ? t('typeLogistics', 'Logistika') :
                   profileData.companyType === 'driving_school' ? t('typeDrivingSchool', 'Avtomaktab') :
                   profileData.companyType === 'taxi_company' ? t('typeTaxiCompany', 'Taksi') :
                   profileData.companyType === 'bus_company' ? t('typeBusCompany', 'Avtobus') :
                   profileData.companyType === 'special_machinery' ? t('typeSpecialMachinery', 'Maxsus texnika') :
                   profileData.companyType === 'other' ? t('typeOther', 'Boshqa') :
                   (profileData.companyType || t('notProvided'))}
                </span>
              </div>
              {profileData.companyAddress && (
                <div className="resume-field icon-row">
                  <MapPin size={14} color="#8E8E93" />
                  <span className="field-value">{profileData.companyAddress}</span>
                </div>
              )}
              {profileData.contactPerson && (
                <div className="resume-field icon-row">
                  <User size={14} color="#8E8E93" />
                  <span className="field-value">{profileData.contactPerson}</span>
                </div>
              )}
              {profileData.companyPhone && (
                <div className="resume-field icon-row">
                  <Phone size={14} color="#8E8E93" />
                  <span className="field-value">{profileData.companyPhone}</span>
                </div>
              )}
              {profileData.corporateNumber && (
                <div className="resume-field icon-row">
                  <span style={{ fontSize: '14px', marginRight: '4px' }}>🔢</span>
                  <span className="field-value">{t('corporateNumberLabel', 'Yuridik raqam')}: {profileData.corporateNumber}</span>
                </div>
              )}
              {profileData.website && (
                <div className="resume-field icon-row">
                  <span style={{ fontSize: '14px', marginRight: '4px' }}>🌐</span>
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="field-value" style={{ color: '#0A84FF', textDecoration: 'none' }}>{profileData.website}</a>
                </div>
              )}
              {profileData.establishedYear && (
                <div className="resume-field icon-row">
                  <span style={{ fontSize: '14px', marginRight: '4px' }}>📅</span>
                  <span className="field-value">{t('establishedYearLabel', 'Tashkil topgan yil')}: {profileData.establishedYear}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contract */}
        {userRole === 'company' && (
          <div className="menu-group glass squircle partner-card">
            <div className="partner-header">
              <h3>{t('partnerContract', 'Michi Hamkorlik Shartnomasi')}</h3>
              <p className="partner-desc">
                {t('contractMainDesc', "Michi ilovasi bilan hamkorlik qilish orqali...")} <VerifiedBadge size={16} />
              </p>
            </div>
            <div className="contract-status-row">
              <span>{t('contractStatus', 'Shartnoma holati')}</span>
              <span className={`status-badge ${contractStatus === 'active' ? 'active' : contractStatus === 'pending' ? 'pending' : 'inactive'}`} style={{ color: contractStatus === 'pending' ? '#FF9500' : '' }}>
                {contractStatus === 'active' ? (
                  <><CheckCircle2 size={14} /> {t('contractSigned', 'Tasdiqlangan')}</>
                ) : contractStatus === 'pending' ? (
                  <>⏳ {t('contractPending', 'Imzolangan (Kutilmoqda)')}</>
                ) : (
                  t('contractInactive', 'Imzolanmagan')
                )}
              </span>
            </div>
            {contractStatus === 'none' && (
              <button 
                className="contract-btn squircle"
                onClick={() => setContractStatus('pending')}
              >
                {t('signContract', 'Imzolash')}
              </button>
            )}
            {contractStatus === 'pending' && (
              <button 
                className="contract-btn squircle"
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(255, 149, 0, 0.2)', color: '#FF9500', border: '1px solid rgba(255, 149, 0, 0.4)' }}
              >
                {t('contractAwaitingApproval', 'Tasdiqlanish kutilmoqda')}
              </button>
            )}
          </div>
        )}

        {/* Menu Items */}
        <div className="menu-group glass squircle">
          <div className="menu-item" onClick={() => setActivePage('personalInfo')}>
            <div className="menu-icon"><User size={20} /></div>
            <span>{userRole === 'company' ? t('companyInfoTitle', "Kompaniya ma'lumotlari") : t('personalData')}</span>
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
          <div className="menu-divider"></div>
          <div className="menu-item" onClick={() => {
            if (setProfileActivePageSource) setProfileActivePageSource('profile');
            setActivePage('applications');
          }}>
            <div className="menu-icon"><Briefcase size={20} /></div>
            <span>{userRole === 'company' ? t('incomingApps', 'Kelib tushgan arizalar') : t('myApplications')}</span>
            {showProfileBadges && totalOwnApplications > 0 && (
              <span className="menu-badge">
                {totalOwnApplications}
              </span>
            )}
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
          {(userRole === 'driver' || userRole === 'guest') && (
            <>
              <div className="menu-divider"></div>
              <div className="menu-item" onClick={() => setActivePage('saved_items')}>
                <div className="menu-icon"><Bookmark size={20} /></div>
                <span>{t('savedItemsTitle', 'Saqlanganlar')}</span>
                {showProfileBadges && totalSavedCount > 0 && (
                  <span className="menu-badge">
                    {totalSavedCount}
                  </span>
                )}
                <ChevronRight size={20} color="#8E8E93" className="chevron" />
              </div>
              <div className="menu-divider"></div>
              <div className="menu-item" onClick={() => setActivePage('resume_builder')}>
                <div className="menu-icon"><FileText size={20} color="#30D158" /></div>
                <span>{t('createResume', 'Yapon Rezyumesi (履歴書)')}</span>
                <ChevronRight size={20} color="#8E8E93" className="chevron" />
              </div>
            </>
          )}
          <div className="menu-divider"></div>
          <div className="menu-item" onClick={() => setActivePage('my_shoukai')}>
            <div className="menu-icon"><Share2 size={20} /></div>
            <span>{userRole === 'company' ? t('shoukaiViaApps', 'Shoukai orqali kelganlar') : t('myShoukai', "Mening Shoukai'larim")}</span>
            {showProfileBadges && referralsCount > 0 && (
              <span className="menu-badge">
                {referralsCount}
              </span>
            )}
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
          {userRole === 'company' && (
            <>
              <div className="menu-divider"></div>
              <div className="menu-item" onClick={() => {
                if (setProfileActivePageSource) setProfileActivePageSource('profile');
                setActivePage('my_ads');
              }}>
                <div className="menu-icon"><Megaphone size={20} /></div>
                <span>{t('myAdsMenu', 'Mening e\'lonlarim')}</span>
                <ChevronRight size={20} color="#8E8E93" className="chevron" />
              </div>
              <div className="menu-divider"></div>
              <div className="menu-item" onClick={() => setActivePage('employees')}>
                <div className="menu-icon"><Users size={20} /></div>
                <span>{t('employeesHR', 'Xodimlar (HR)')}</span>
                {showProfileBadges && employeesCount > 0 && (
                  <span className="menu-badge">
                    {employeesCount}
                  </span>
                )}
                <ChevronRight size={20} color="#8E8E93" className="chevron" />
              </div>
            </>
          )}
        </div>

        <div className="menu-group glass squircle">
          <div className="menu-item" onClick={() => setActivePage('notifications')}>
            <div className="menu-icon"><Bell size={20} /></div>
            <span>{t('notifications')}</span>
            {showProfileBadges && unreadCount > 0 && (
              <span className="menu-badge notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
          <div className="menu-divider"></div>
          <div className="menu-item" onClick={() => setActivePage('settings')}>
            <div className="menu-icon"><Settings size={20} /></div>
            <span>{t('settings')}</span>
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
          <div className="menu-divider"></div>
          <div className="menu-item" onClick={() => setActivePage('about')}>
            <div className="menu-icon"><Info size={20} /></div>
            <span>{t('aboutApp', 'Platforma haqida')}</span>
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
        </div>

        <button className="logout-btn glass squircle" onClick={onLogout}>
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
}
