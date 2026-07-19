import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Settings, FileText, Bell, LogOut, ChevronRight, CheckCircle2, ShieldCheck, 
  Briefcase, Globe, Building2, MapPin, Phone, Users, Camera, Sun, Moon, 
  Volume2, Vibrate, VolumeX, BellOff, Edit3, Save, X, Share2, Bookmark, ArrowLeft, Megaphone, Plus, Info, Sparkles, Mail, Wrench } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { MOCK_JOBS } from './DriverFeed';
import { MOCK_SCHOOLS } from './DrivingAcademy';
import VerifiedBadge from './VerifiedBadge';
import CompanyHome from './CompanyHome';
import ResumeBuilder from './ResumeBuilder';
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
  const { t } = useTranslation();

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

  const [myVehicle, setMyVehicle] = useState(() => {
    try {
      const saved = localStorage.getItem('michi_user_vehicle');
      return saved ? JSON.parse(saved) : {
        type: 'car',
        make: 'Toyota',
        model: 'Harrier',
        trim: 'Z',
        year: '2024',
        color: '#5E5CE6',
        plateNumber: '練馬 300 あ 12-34',
        height: '1.69',
        width: '1.85',
        length: '4.74',
        weight: '1.62'
      };
    } catch (e) {
      return {
        type: 'car',
        make: 'Toyota',
        model: 'Harrier',
        trim: 'Z',
        year: '2024',
        color: '#5E5CE6',
        plateNumber: '練馬 300 あ 12-34',
        height: '1.69',
        width: '1.85',
        length: '4.74',
        weight: '1.62'
      };
    }
  });

  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [editVehicleData, setEditVehicleData] = useState({ ...myVehicle });

  const handleSaveVehicle = (e) => {
    e.preventDefault();
    setMyVehicle(editVehicleData);
    localStorage.setItem('michi_user_vehicle', JSON.stringify(editVehicleData));
    setIsEditingVehicle(false);
    window.dispatchEvent(new CustomEvent('michi-vehicle-updated', { detail: editVehicleData }));
  };

  const renderVehicleSVG = (type, color) => {
    const paintColor = color || '#5E5CE6';
    switch (type) {
      case 'car':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <ellipse cx="50" cy="43" rx="40" ry="4" fill="rgba(0,0,0,0.15)" />
            <path fill={paintColor} d="M15,35 L12,32 C12,32 15,26 22,25 C29,24 38,15 48,15 C58,15 78,17 84,26 C90,32 88,37 84,39 L15,39 Z" />
            <path fill="var(--card-bg, #1c1c1e)" opacity="0.85" d="M35,24 L45,17 L58,17 L68,24 Z" />
            <path fill="#ffffff" opacity="0.3" d="M38,23 L46,18 L50,18 Z" />
            <path fill="#FFD60A" d="M85,30 Q88,30 87,33 L83,34 Z" />
            <path fill="#FF453A" d="M12,32 L15,32 L15,35 L12,35 Z" />
            <circle cx="28" cy="38" r="8" fill="#1c1c1e" stroke="#8e8e93" strokeWidth="1.5" />
            <circle cx="28" cy="38" r="4" fill="#8e8e93" />
            <circle cx="72" cy="38" r="8" fill="#1c1c1e" stroke="#8e8e93" strokeWidth="1.5" />
            <circle cx="72" cy="38" r="4" fill="#8e8e93" />
          </svg>
        );
      case 'moto':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <ellipse cx="50" cy="43" rx="35" ry="3.5" fill="rgba(0,0,0,0.15)" />
            <path d="M25,38 L45,25 L65,25 L75,38" stroke="#8e8e93" strokeWidth="3" fill="none" />
            <path d="M45,25 L50,15 L70,38" stroke="#1c1c1e" strokeWidth="2.5" fill="none" />
            <path fill={paintColor} d="M35,28 C32,25 35,22 45,21 C55,20 62,24 62,28 Z" />
            <circle cx="22" cy="38" r="10" fill="#1c1c1e" stroke="#8e8e93" strokeWidth="2" />
            <circle cx="22" cy="38" r="5" fill="#8e8e93" />
            <circle cx="78" cy="38" r="10" fill="#1c1c1e" stroke="#8e8e93" strokeWidth="2" />
            <circle cx="78" cy="38" r="5" fill="#8e8e93" />
          </svg>
        );
      case 'velo':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <ellipse cx="50" cy="43" rx="32" ry="3" fill="rgba(0,0,0,0.1)" />
            <path d="M22,38 L45,38 L60,25 L35,25 Z" stroke={paintColor} strokeWidth="2.5" fill="none" />
            <path d="M22,38 L35,25 M45,38 L52,18" stroke={paintColor} strokeWidth="2.5" fill="none" />
            <path d="M28,21 L36,21" stroke="#1c1c1e" strokeWidth="2" fill="none" />
            <path d="M50,16 L56,16" stroke="#1c1c1e" strokeWidth="2" fill="none" />
            <circle cx="22" cy="38" r="10" stroke="#8e8e93" strokeWidth="1" fill="none" />
            <circle cx="22" cy="38" r="1.5" fill="#1c1c1e" />
            <circle cx="78" cy="38" r="10" stroke="#8e8e93" strokeWidth="1" fill="none" />
            <circle cx="78" cy="38" r="1.5" fill="#1c1c1e" />
          </svg>
        );
      case 'truck_3t':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <ellipse cx="50" cy="43" rx="42" ry="4" fill="rgba(0,0,0,0.18)" />
            <rect x="12" y="36" width="76" height="4" fill="#3a3a3c" />
            <path fill={paintColor} d="M64,36 L64,18 L76,18 Q84,18 84,26 L84,36 Z" />
            <path fill="var(--card-bg, #1c1c1e)" d="M68,21 L76,21 L79,27 L68,27 Z" />
            <rect x="15" y="14" width="48" height="22" fill="#e5e5ea" stroke="#d1d1d6" strokeWidth="1" />
            <line x1="39" y1="14" x2="39" y2="36" stroke="#d1d1d6" strokeWidth="1" />
            <rect x="80" y="32" width="5" height="2" fill="#FFD60A" />
            <rect x="78" y="35" width="8" height="3" fill="#8e8e93" />
            <circle cx="26" cy="39" r="7" fill="#1c1c1e" stroke="#8e8e93" strokeWidth="1.5" />
            <circle cx="26" cy="39" r="3" fill="#8e8e93" />
            <circle cx="48" cy="39" r="7" fill="#1c1c1e" stroke="#8e8e93" strokeWidth="1.5" />
            <circle cx="48" cy="39" r="3" fill="#8e8e93" />
            <circle cx="74" cy="39" r="7" fill="#1c1c1e" stroke="#8e8e93" strokeWidth="1.5" />
            <circle cx="74" cy="39" r="3" fill="#8e8e93" />
          </svg>
        );
      case 'truck_4t':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <ellipse cx="50" cy="43" rx="44" ry="4.5" fill="rgba(0,0,0,0.2)" />
            <rect x="10" y="36" width="80" height="5" fill="#1c1c1e" />
            <path fill={paintColor} d="M64,36 L64,15 L78,15 Q86,15 86,24 L86,36 Z" />
            <rect x="81" y="28" width="5" height="8" fill="#e5e5ea" />
            <rect x="83" y="30" width="3" height="4" fill="#3a3a3c" />
            <path fill="var(--card-bg, #1c1c1e)" d="M68,18 L76,18 L81,25 L68,25 Z" />
            <rect x="12" y="11" width="51" height="25" fill="#f2f2f7" stroke="#aeaeaf" strokeWidth="1.2" />
            <line x1="29" y1="11" x2="29" y2="36" stroke="#aeaeaf" strokeWidth="1.2" />
            <line x1="46" y1="11" x2="46" y2="36" stroke="#aeaeaf" strokeWidth="1.2" />
            <circle cx="22" cy="39" r="8" fill="#1c1c1e" stroke="#aeaeaf" strokeWidth="2" />
            <circle cx="22" cy="39" r="3" fill="#aeaeaf" />
            <circle cx="38" cy="39" r="8" fill="#1c1c1e" stroke="#aeaeaf" strokeWidth="2" />
            <circle cx="38" cy="39" r="3" fill="#aeaeaf" />
            <circle cx="74" cy="39" r="8" fill="#1c1c1e" stroke="#aeaeaf" strokeWidth="2" />
            <circle cx="74" cy="39" r="3" fill="#aeaeaf" />
          </svg>
        );
      case 'trailer':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <ellipse cx="50" cy="43" rx="46" ry="4.8" fill="rgba(0,0,0,0.22)" />
            <rect x="6" y="36" width="88" height="5" fill="#1c1c1e" />
            <path fill={paintColor} d="M68,36 L68,14 L82,14 Q88,14 88,22 L88,36 Z" />
            <path fill="var(--card-bg, #1c1c1e)" d="M72,17 L80,17 L84,24 L72,24 Z" />
            <path fill={paintColor} opacity="0.8" d="M68,14 L80,11 L82,14 Z" />
            <rect x="8" y="13" width="56" height="23" fill="#ffffff" stroke="#aeaeaf" strokeWidth="1.5" />
            <line x1="22" y1="13" x2="22" y2="36" stroke="#aeaeaf" strokeWidth="1.2" />
            <line x1="36" y1="13" x2="36" y2="36" stroke="#aeaeaf" strokeWidth="1.2" />
            <line x1="50" y1="13" x2="50" y2="36" stroke="#aeaeaf" strokeWidth="1.2" />
            <rect x="84" y="33" width="5" height="3" fill="#FFD60A" />
            <circle cx="16" cy="39" r="8" fill="#1c1c1e" stroke="#aeaeaf" strokeWidth="2" />
            <circle cx="16" cy="39" r="3" fill="#aeaeaf" />
            <circle cx="32" cy="39" r="8" fill="#1c1c1e" stroke="#aeaeaf" strokeWidth="2" />
            <circle cx="32" cy="39" r="3" fill="#aeaeaf" />
            <circle cx="48" cy="39" r="8" fill="#1c1c1e" stroke="#aeaeaf" strokeWidth="2" />
            <circle cx="48" cy="39" r="3" fill="#aeaeaf" />
            <circle cx="73" cy="39" r="8" fill="#1c1c1e" stroke="#aeaeaf" strokeWidth="2" />
            <circle cx="73" cy="39" r="3" fill="#aeaeaf" />
            <circle cx="83" cy="39" r="8" fill="#1c1c1e" stroke="#aeaeaf" strokeWidth="2" />
            <circle cx="83" cy="39" r="3" fill="#aeaeaf" />
          </svg>
        );
      case 'bus':
        return (
          <svg viewBox="0 0 100 50" width="100%" height="100%">
            <ellipse cx="50" cy="43" rx="42" ry="4" fill="rgba(0,0,0,0.18)" />
            <path fill={paintColor} d="M12,36 L12,16 Q12,14 15,14 L82,14 Q88,14 88,18 L88,36 Z" />
            <rect x="18" y="18" width="10" height="7" fill="var(--card-bg, #1c1c1e)" />
            <rect x="31" y="18" width="10" height="7" fill="var(--card-bg, #1c1c1e)" />
            <rect x="44" y="18" width="10" height="7" fill="var(--card-bg, #1c1c1e)" />
            <rect x="57" y="18" width="10" height="7" fill="var(--card-bg, #1c1c1e)" />
            <rect x="70" y="18" width="12" height="7" fill="var(--card-bg, #1c1c1e)" />
            <rect x="84" y="32" width="4" height="2" fill="#FFD60A" />
            <rect x="12" y="30" width="2" height="4" fill="#FF3B30" />
            <circle cx="28" cy="38" r="8" fill="#1c1c1e" stroke="#8e8e93" strokeWidth="1.5" />
            <circle cx="28" cy="38" r="3" fill="#8e8e93" />
            <circle cx="72" cy="38" r="8" fill="#1c1c1e" stroke="#8e8e93" strokeWidth="1.5" />
            <circle cx="72" cy="38" r="3" fill="#8e8e93" />
          </svg>
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

            {/* Vision Card (Span 1) */}
            <div className="about-glass-card about-span-1 about-animate-item about-delay-3">
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
            <div className="about-glass-card card-primary about-span-1 about-animate-item about-delay-4" style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={20} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
              <strong className="about-shimmer-text" style={{ display: 'block', fontSize: '18px', fontWeight: '900', marginBottom: '1px' }}>
                <StatCounter target={10} suffix="k+" />
              </strong>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>{t('aboutStatsPositions', 'Ish o\'rinlari')}</span>
            </div>

            {/* Corporate Backup & Guarantees Card (Span 2) */}
            <div className="about-glass-card card-success about-span-2 about-animate-item about-delay-5">
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
            <div className="about-glass-card card-primary about-span-2 about-animate-item about-delay-6">
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
            <div className="about-glass-card card-primary about-span-1 about-animate-item about-delay-7" style={{ padding: '16px 8px', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} style={{ color: 'var(--primary)', marginBottom: '4px' }} />
              <strong className="about-shimmer-text" style={{ display: 'block', fontSize: '17px', fontWeight: '900', marginBottom: '1px' }}>
                <StatCounter target={500} suffix="+" />
              </strong>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>{t('aboutStatsCompanies', 'Kompaniyalar')}</span>
            </div>

            {/* Support Card (Span 1) */}
            <div className="about-glass-card card-primary about-span-1 about-animate-item about-delay-8" style={{ padding: '16px 8px', textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
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
                <h3 style={{ margin: 0 }}>{t('myVehicleTitle', 'Mening Mashinam')}</h3>
              </div>
              {!isEditingVehicle ? (
                <button 
                  className="resume-edit-btn"
                  onClick={() => {
                    setEditVehicleData({ ...myVehicle });
                    setIsEditingVehicle(true);
                  }}
                >
                  📝 {t('editVehicle', 'Tahrirlash')}
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    type="button"
                    className="resume-edit-btn"
                    style={{ background: 'linear-gradient(135deg, #FF3B30, #FF2D55)', boxShadow: '0 4px 10px rgba(255, 59, 48, 0.2)' }}
                    onClick={() => setIsEditingVehicle(false)}
                  >
                    ❌ {t('cancel', 'Bekor qilish')}
                  </button>
                  <button 
                    type="button"
                    className="resume-edit-btn"
                    style={{ background: 'linear-gradient(135deg, #0A84FF, #007AFF)', boxShadow: '0 4px 10px rgba(10, 132, 255, 0.2)' }}
                    onClick={handleSaveVehicle}
                  >
                    💾 {t('save', 'Saqlash')}
                  </button>
                </div>
              )}
            </div>

            <div className="resume-body">
              {!isEditingVehicle ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                  {/* Vehicle graphic display with 3D shadow and dynamic color */}
                  <div className="vehicle-display-box squircle" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--card-bg, rgba(255, 255, 255, 0.03))',
                    border: '1px solid var(--glass-border)',
                    padding: '16px',
                    minHeight: '120px',
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
                    
                    <div style={{ width: '160px', height: '80px', transform: 'scale(1.2)' }}>
                      {renderVehicleSVG(myVehicle.type, myVehicle.color)}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div className="resume-field">
                      <span className="field-label">{t('vehicleType', 'Transport turi')}</span>
                      <span className="field-value" style={{ textTransform: 'capitalize' }}>
                        {myVehicle.type === 'car' ? t('vehicleCar', 'Yengil avto') :
                         myVehicle.type === 'moto' ? t('vehicleMoto', 'Motosikl') :
                         myVehicle.type === 'velo' ? t('vehicleVelo', 'Velosiped') :
                         myVehicle.type === 'truck_3t' ? t('vehicleTruck3t', '3t Yuk mashinasi') :
                         myVehicle.type === 'truck_4t' ? t('vehicleTruck4t', '4t Yuk mashinasi') :
                         myVehicle.type === 'trailer' ? t('vehicleTrailer', 'Trailer (Katta yuk)') :
                         myVehicle.type === 'bus' ? t('vehicleBus', 'Avtobus') : myVehicle.type}
                      </span>
                    </div>

                    <div className="resume-field">
                      <span className="field-label">{t('vehicleModel', 'Rusumi / Modeli')}</span>
                      <span className="field-value" style={{ fontWeight: 'bold' }}>
                        {myVehicle.make} {myVehicle.model} {myVehicle.trim && `(${myVehicle.trim})`}
                      </span>
                    </div>

                    <div className="resume-field">
                      <span className="field-label">{t('vehicleYear', 'Yili')}</span>
                      <span className="field-value">{myVehicle.year || '-'}</span>
                    </div>

                    <div className="resume-field">
                      <span className="field-label">{t('vehiclePlate', 'Davlat raqami')}</span>
                      <span className="field-value" style={{ fontStyle: 'italic', letterSpacing: '1px' }}>{myVehicle.plateNumber || '-'}</span>
                    </div>

                    <div className="resume-field" style={{ gridColumn: 'span 2', borderTop: '1px solid var(--glass-border)', paddingTop: '8px', marginTop: '4px' }}>
                      <span className="field-label" style={{ marginBottom: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📐 <span>{t('vehicleDimensions', 'Avtotransport o\'lchamlari (Navigatsiya uchun)')}</span>
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', width: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('height', 'Balandlik')}</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{myVehicle.height} m</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('width', 'Eni')}</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{myVehicle.width} m</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('length', 'Uzunlik')}</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{myVehicle.length} m</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('weight', 'Vazni')}</span>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{myVehicle.weight} t</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                  {/* Realtime Live Preview with dynamic paint color */}
                  <div className="vehicle-display-box squircle" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--card-bg, rgba(255, 255, 255, 0.03))',
                    border: '1px dashed var(--primary)',
                    padding: '16px',
                    minHeight: '110px',
                    position: 'relative'
                  }}>
                    <div style={{ width: '150px', height: '75px', transform: 'scale(1.2)' }}>
                      {renderVehicleSVG(editVehicleData.type, editVehicleData.color)}
                    </div>
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      right: '10px',
                      fontSize: '9px',
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>LIVE PREVIEW</span>
                  </div>

                  {/* Form inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehicleType', 'Transport turi')}</label>
                      <select 
                        value={editVehicleData.type}
                        onChange={e => {
                          const val = e.target.value;
                          let h = '1.69', w = '1.85', l = '4.74', wt = '1.62'; // Car presets
                          let mk = editVehicleData.make;
                          let md = editVehicleData.model;
                          if (val === 'moto') { h = '1.1'; w = '0.8'; l = '2.1'; wt = '0.2'; mk = 'Honda'; md = 'Super Cub'; }
                          else if (val === 'velo') { h = '1.0'; w = '0.6'; l = '1.7'; wt = '0.015'; mk = 'Bridgestone'; md = 'Road Bike'; }
                          else if (val === 'truck_3t') { h = '2.8'; w = '2.1'; l = '6.2'; wt = '4.5'; mk = 'Isuzu'; md = 'Elf'; }
                          else if (val === 'truck_4t') { h = '3.4'; w = '2.3'; l = '8.5'; wt = '8.0'; mk = 'Hino'; md = 'Ranger'; }
                          else if (val === 'trailer') { h = '3.8'; w = '2.5'; l = '16.5'; wt = '25.0'; mk = 'Fuso'; md = 'Super Great'; }
                          else if (val === 'bus') { h = '3.2'; w = '2.5'; l = '11.5'; wt = '12.0'; mk = 'Isuzu'; md = 'Gala'; }
                          else { mk = 'Toyota'; md = 'Harrier'; }
                          
                          setEditVehicleData(prev => ({ 
                            ...prev, 
                            type: val,
                            make: mk,
                            model: md,
                            height: h,
                            width: w,
                            length: l,
                            weight: wt
                          }));
                        }}
                        style={{
                          background: 'var(--card-bg, #2c2c2e)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      >
                        <option value="car">{t('vehicleCar', 'Yengil avto')}</option>
                        <option value="moto">{t('vehicleMoto', 'Motosikl')}</option>
                        <option value="velo">{t('vehicleVelo', 'Velosiped')}</option>
                        <option value="truck_3t">{t('vehicleTruck3t', '3t Yuk mashinasi')}</option>
                        <option value="truck_4t">{t('vehicleTruck4t', '4t Yuk mashinasi')}</option>
                        <option value="trailer">{t('vehicleTrailer', 'Trailer (Katta yuk)')}</option>
                        <option value="bus">{t('vehicleBus', 'Avtobus')}</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehicleMake', 'Ishlab chiqaruvchi (Rusumi)')}</label>
                      <input 
                        type="text"
                        placeholder="Toyota, Hino, Isuzu..."
                        value={editVehicleData.make}
                        onChange={e => setEditVehicleData(prev => ({ ...prev, make: e.target.value }))}
                        style={{
                          background: 'var(--card-bg, #2c2c2e)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehicleModel', 'Modeli')}</label>
                      <input 
                        type="text"
                        placeholder="Prius, Ranger, Elf..."
                        value={editVehicleData.model}
                        onChange={e => setEditVehicleData(prev => ({ ...prev, model: e.target.value }))}
                        style={{
                          background: 'var(--card-bg, #2c2c2e)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehicleTrim', 'Komplektatsiya (Trim)')}</label>
                      <input 
                        type="text"
                        placeholder="Z, G, S, Pro..."
                        value={editVehicleData.trim}
                        onChange={e => setEditVehicleData(prev => ({ ...prev, trim: e.target.value }))}
                        style={{
                          background: 'var(--card-bg, #2c2c2e)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehicleYear', 'Yili')}</label>
                      <input 
                        type="text"
                        placeholder="2024"
                        value={editVehicleData.year}
                        onChange={e => setEditVehicleData(prev => ({ ...prev, year: e.target.value }))}
                        style={{
                          background: 'var(--card-bg, #2c2c2e)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehiclePlate', 'Davlat raqami')}</label>
                      <input 
                        type="text"
                        placeholder="練馬 300 あ 12-34 / 01 A 777 AA"
                        value={editVehicleData.plateNumber}
                        onChange={e => setEditVehicleData(prev => ({ ...prev, plateNumber: e.target.value }))}
                        style={{
                          background: 'var(--card-bg, #2c2c2e)',
                          color: 'var(--text-main)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Color picker */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: 'span 2' }}>
                      <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{t('vehicleColor', 'Moshina rangi')}</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="color" 
                          value={editVehicleData.color} 
                          onChange={e => setEditVehicleData(prev => ({ ...prev, color: e.target.value }))}
                          style={{
                            border: 'none',
                            outline: 'none',
                            background: 'none',
                            width: '36px',
                            height: '36px',
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
                                width: '22px',
                                height: '22px',
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

                    {/* Dimensions editors */}
                    <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                        📐 O'lchamlar va Og'irlik (Navigatsiya xaritasida ko'prik va yo'l taqiqlarini chetlab o'tish uchun):
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('height', 'Balandlik (m)')}</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={editVehicleData.height}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, height: e.target.value }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px',
                              padding: '6px',
                              fontSize: '12px',
                              outline: 'none',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('width', 'Eni (m)')}</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={editVehicleData.width}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, width: e.target.value }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px',
                              padding: '6px',
                              fontSize: '12px',
                              outline: 'none',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('length', 'Uzunlik (m)')}</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={editVehicleData.length}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, length: e.target.value }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px',
                              padding: '6px',
                              fontSize: '12px',
                              outline: 'none',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{t('weight', 'Og\'irlik (t)')}</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={editVehicleData.weight}
                            onChange={e => setEditVehicleData(prev => ({ ...prev, weight: e.target.value }))}
                            style={{
                              background: 'var(--card-bg, #2c2c2e)',
                              color: 'var(--text-main)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '6px',
                              padding: '6px',
                              fontSize: '12px',
                              outline: 'none',
                              textAlign: 'center'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
              <span className="menu-badge notif-badge">{unreadCount}</span>
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
