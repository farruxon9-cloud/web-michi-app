import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { compressImage } from '../utils/imageCompressor';
// MyAdsPage → CompanyHome: CSS yuklanish tartibi avvalgidek (CompanyHome shu joyda import qilinardi)
import MyAdsPage from './profile/MyAdsPage';
import ResumeBuilder from './ResumeBuilder';
import AssistHeroShowcase from './AssistHeroShowcase';
import { getModelsForMake, getHDVehiclePhoto } from '../services/vehicleApiService';
import { getLocalVehicleImage } from '../services/vehicleImageService';
import { VEHICLES_KEY, ACTIVE_VEHICLE_KEY, safeSetJSON, sanitizeVehicles, validateVehicle, upsertVehicle, removeVehicle } from '../utils/vehicleUtils';
import { MASTER_VEHICLE_DATABASE } from '../data/japaneseVehiclesMaster';
import ConfirmSheet from './ConfirmSheet';
import { UndoToast, SelectionBar } from './UndoToast';
import useHiddenItems from '../hooks/useHiddenItems';
import { filterHiddenApps } from '../utils/applicationItems';
import EmployeesPage from './profile/EmployeesPage';
import ShoukaiPage from './profile/ShoukaiPage';
import SavedItemsPage from './profile/SavedItemsPage';
import ApplicationsPage from './profile/ApplicationsPage';
import PersonalInfoPage from './profile/PersonalInfoPage';
import AboutPage from './profile/AboutPage';
import SettingsPage from './profile/SettingsPage';
import NotificationsPage from './profile/NotificationsPage';
import { createProfileRenderers } from './profile/profileRenderers';
import ProfileMainView from './profile/ProfileMainView';
import { useProfileScroll } from '../hooks/useProfileScroll';
// Profile.css har doim oxirida: kaskad tartibi o'zgarmasin
import './Profile.css';


function ProfileSkeleton() {
  return (
    <div className="profile-container sub-page-view fade-in">
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
      {/* 12px clearance spacer for Profile sub-page */}
      <div style={{ height: '12px', minHeight: '12px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}

// Wrapper keeps hook order stable: the skeleton is rendered before any hooks run.
export default function Profile(props) {
  if (!props.profileData) return <ProfileSkeleton />;
  return <ProfileContent {...props} />;
}

function ProfileContent({ 
  onLogout = () => {}, contractStatus, setContractStatus = () => {}, profileData, userRole, 
  onChangeLanguage = () => {}, onUpdateProfile = () => {}, applications = [], onChangeAppStatus = () => {}, onWithdrawApplication = async () => false,
  notifications = [], onMarkRead = () => {}, onMarkAllRead = () => {}, onDeleteNotif = () => {}, onClearAllNotifs = () => {}, unreadCount = 0,
  darkMode = false, setDarkMode = () => {}, soundSettings = { sound: true, vibration: true }, setSoundSettings = () => {},
  companyEmployees = [], onAddEmployee = () => {}, onAcceptEmployeeRequest = () => {}, setNotifications = () => {},
  schoolApplications = [], onShoukaiPaid = () => {}, onNavigate = () => {},
  activePage = 'main',
  setActivePage = () => {},
  profileActivePageSource,
  setProfileActivePageSource = () => {},
  scrollToTopTrigger = 0,
  onJobClick = () => {},
  onSchoolClick = () => {},
  showProfileBadges: propShowProfileBadges,
  setShowProfileBadges: propSetShowProfileBadges,
  notificationSound: propNotificationSound,
  setNotificationSound: propSetNotificationSound,
  jobs = [],
  schools = [],
  setJobs = () => {},
  setSchools = () => {},
  onJobCreated = () => {},
  jobToEdit = null,
  setJobToEdit = () => {},
  onApply = () => {},
  onApplySchool = () => {},
  onShoukai = () => {},
  onTriggerRegister = () => {},
  isVoiceActive = false,
  setIsVoiceActive = () => {},
  isVoiceStandby = false,
  setIsVoiceStandby = () => {}
}) {
  const { t, i18n } = useTranslation();

  // Dedicated React ref for main profile scroll container
  const mainContainerRef = React.useRef(null);

  // Saved main Profile scroll position when navigating to sub-pages (v1.1 F: useProfileScroll)
  const { rememberMainScroll, resetToTop, forgetMainScroll } = useProfileScroll({ activePage, containerRef: mainContainerRef });
  const [shoukaiTab, setShoukaiTab] = useState('pending'); // 'pending' | 'paid' | 'all'
  const [selectedShoukaiApp, setSelectedShoukaiApp] = useState(null);
  const [appPipelineTab, setAppPipelineTab] = useState('submitted'); // 'submitted' | 'processing' | 'accepted' | 'rejected' | 'all'
  const [notifTab, setNotifTab] = useState('all'); // 'all' | 'unread' | 'interview' | 'shoukai' | 'all'
  const [showClearNotifsConfirm, setShowClearNotifsConfirm] = useState(false);

  // ----- Hide (非表示) / multi-select for the driver's applications & shoukai lists -----
  // Local view preference only: nothing is deleted on the server. Real withdrawal will use
  // PATCH /api/applications/:id/cancel once the backend ships it.
  const hiddenApps = useHiddenItems('apps', profileData?.userId);
  const hiddenShoukai = useHiddenItems('shoukai', profileData?.userId);
  const [hideConfirm, setHideConfirm] = useState(null); // { scope: 'apps'|'shoukai', keys: string[] }
  const [undoInfo, setUndoInfo] = useState(null); // { scope, keys, id }
  const [appSelectMode, setAppSelectMode] = useState(false);
  const [selectedAppKeys, setSelectedAppKeys] = useState(() => new Set());
  const [hideUiPage, setHideUiPage] = useState(activePage);
  if (hideUiPage !== activePage) {
    // Leaving / entering a page resets transient selection UI
    setHideUiPage(activePage);
    setAppSelectMode(false);
    setSelectedAppKeys(new Set());
    setUndoInfo(null);
    setHideConfirm(null);
  }
  const hiddenStoreFor = (scope) => (scope === 'shoukai' ? hiddenShoukai : hiddenApps);
  const requestHide = (scope, keys) => {
    const list = (keys || []).filter(Boolean);
    if (list.length > 0) setHideConfirm({ scope, keys: list });
  };
  const exitAppSelectMode = () => {
    setAppSelectMode(false);
    setSelectedAppKeys(new Set());
  };
  const confirmHide = () => {
    if (!hideConfirm) return;
    const { scope, keys } = hideConfirm;
    hiddenStoreFor(scope).hide(keys);
    setHideConfirm(null);
    setUndoInfo({ scope, keys, id: Date.now() });
    if (scope === 'apps') exitAppSelectMode();
  };
  const undoHide = () => {
    if (!undoInfo) return;
    hiddenStoreFor(undoInfo.scope).unhide(undoInfo.keys);
    setUndoInfo(null);
  };
  const toggleSelectApp = (key) => {
    setSelectedAppKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const renderHideOverlays = () => (
    <>
      <ConfirmSheet
        open={Boolean(hideConfirm)}
        id="hide-confirm-sheet"
        title={hideConfirm && hideConfirm.keys.length > 1
          ? `${t('hideSelectedTitle', '選択した項目を非表示にしますか？')} (${hideConfirm.keys.length})`
          : t('hideConfirmTitle', 'この項目を非表示にしますか？')}
        message={t('hideConfirmMsg', '一覧から非表示になります。応募そのものは取り消されません。')}
        confirmLabel={t('hideAction', '非表示')}
        cancelLabel={t('cancel', 'キャンセル')}
        onConfirm={confirmHide}
        onCancel={() => setHideConfirm(null)}
      />
      <UndoToast
        open={Boolean(undoInfo)}
        toastKey={undoInfo?.id}
        message={t('hiddenToast', '非表示にしました')}
        actionLabel={t('undoAction', '元に戻す')}
        onAction={undoHide}
        onClose={() => setUndoInfo(null)}
      />
      <SelectionBar
        open={appSelectMode && !hideConfirm}
        count={selectedAppKeys.size}
        actionLabel={t('hideAction', '非表示')}
        cancelLabel={t('cancel', 'キャンセル')}
        onAction={() => requestHide('apps', Array.from(selectedAppKeys))}
        onCancel={exitAppSelectMode}
      />
    </>
  );

  const [internalNotifSound, setInternalNotifSound] = useState(() => {
    try {
      const saved = localStorage.getItem('michi_notif_sound');
      return saved !== null ? saved === 'true' : true;
    } catch { return true; }
  });

  const [internalShowBadges, setInternalShowBadges] = useState(() => {
    try {
      const saved = localStorage.getItem('michi_show_badges');
      return saved !== null ? saved === 'true' : true;
    } catch { return true; }
  });

  const notificationSound = propNotificationSound !== undefined ? propNotificationSound : internalNotifSound;
  const showProfileBadges = propShowProfileBadges !== undefined ? propShowProfileBadges : internalShowBadges;

  const handleToggleNotifSound = (val) => {
    setInternalNotifSound(val);
    try { localStorage.setItem('michi_notif_sound', String(val)); } catch {}
    if (typeof propSetNotificationSound === 'function') {
      propSetNotificationSound(val);
    }
  };

  const handleToggleShowBadges = (val) => {
    setInternalShowBadges(val);
    try { localStorage.setItem('michi_show_badges', String(val)); } catch {}
    if (typeof propSetShowProfileBadges === 'function') {
      propSetShowProfileBadges(val);
    }
  };

  const handleOpenSubPage = (page) => {
    // Remember where the main page was; the hook scrolls the sub-page to top before paint
    rememberMainScroll();
    setActivePage(page);
  };

  const handleBackToMain = () => {
    if (typeof setIsEditing === 'function') setIsEditing(false);
    if (typeof setIsEditingVehicle === 'function') setIsEditingVehicle(false);
    setActivePage('main');
  };

  // Track scroll-to-top triggers to differentiate explicit BottomNav reset from sub-page scroll restoration
  const prevScrollToTopRef = React.useRef(scrollToTopTrigger);

  // Sub-sahifadan qaytilganda asosiy profil skrollini aynan bosilgan joyga qaytarish, sub-sahifa ochilganda esa topga reset qilish
  // — endi useProfileScroll ichida (useLayoutEffect + ResizeObserver, foydalanuvchi skroll qilsa to'xtaydi).

  // BottomNav'da My Page tabini takroran (2-marta) yoki sub-sahifada turib bosganda profil asosiy sahifasini eng yuqoridan scroll qilib ochish
  React.useEffect(() => {
    // ONLY execute scroll reset if scrollToTopTrigger actually INCREMENTED (user clicked BottomNav profile tab)
    if (scrollToTopTrigger > 0 && scrollToTopTrigger !== prevScrollToTopRef.current) {
      prevScrollToTopRef.current = scrollToTopTrigger;
      forgetMainScroll();

      // Force reset to main active page if on sub-page
      if (setActivePage) {
        setActivePage('main');
      }

      // Reset any active editing forms, modals, or expanded sub-cards
      if (typeof setIsEditing === 'function') setIsEditing(false);
      if (typeof setIsEditingVehicle === 'function') setIsEditingVehicle(false);
      if (typeof setIsVehiclePickerOpen === 'function') setIsVehiclePickerOpen(false);
      if (typeof setIsFormOpen === 'function') setIsFormOpen(false);
      if (typeof setAcceptingAppId === 'function') setAcceptingAppId(null);
      if (typeof setExpandedAppId === 'function') setExpandedAppId(null);
      
      // Hozirgidek: tepaga silliq skroll (sub-sahifadan kelinsa, hook main'ni tiklamaydi — saqlangan joy 0)
      resetToTop(true);
      return undefined;
    } else {
      prevScrollToTopRef.current = scrollToTopTrigger;
    }
  }, [scrollToTopTrigger]);

  // --- STATISTIKA VA SANARLARNI HISOBLASH (DYNAMIC MENUS & USER BADGES) ---
  // Hamma bo'limlar uchun bosilgan o'zgarishlar sanoqlari (badges) dynamic ravishda hisoblanadi.

  // 1. Foydalanuvchining shaxsiy arizalari soni (referral qilingan do'stlar arizalari hisobga olinmaydi)
  // Haydovchi uchun yashirilgan (非表示) arizalar sanoqqa kirmaydi.
  const driverHiddenAppsSet = userRole !== 'company' ? hiddenApps.hiddenSet : null;
  const ownApplicationsCount = filterHiddenApps(applications.filter(a => !a.isSimulatedReferral), driverHiddenAppsSet).length;
  const ownSchoolApplicationsCount = filterHiddenApps((schoolApplications || []).filter(a => !a.isSimulatedReferral), driverHiddenAppsSet).length;
  const totalOwnApplications = ownApplicationsCount + (userRole !== 'company' ? ownSchoolApplicationsCount : 0);

  // 2. Faol bo'lgan saqlangan e'lonlar soni
  const savedJobs = (profileData?.savedItems?.jobs || []).filter(job => job && job.isActive !== false);
  const savedSchools = (profileData?.savedItems?.schools || []).filter(school => school && school.isActive !== false);
  const totalSavedCount = savedJobs.length + (userRole === 'driver' ? savedSchools.length : 0);

  // 3. Foydalanuvchining Shoukai takliflari soni (simulyatsiya qilingan do'stlar referral arizalari yoki haqiqiy takliflar)
  const referralsCount = userRole === 'company' 
    ? applications.filter(a => a.company === profileData.fullName && a.shoukaiId).length
    : (filterHiddenApps(applications.filter(a => a.shoukaiId === profileData.userId), hiddenShoukai.hiddenSet).length
      + filterHiddenApps((schoolApplications || []).filter(a => a.shoukaiId === profileData.userId), hiddenShoukai.hiddenSet).length);

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
  const [empAddMode, setEmpAddMode] = useState('id'); // 'id' | 'manual'
  const [empFilter, setEmpFilter] = useState('all'); // 'all' | 'verified' | 'pending'
  const [expandedAppId, setExpandedAppId] = useState(null);
  const [aboutTab, setAboutTab] = useState('platform');
  const [isVehiclePickerOpen, setIsVehiclePickerOpen] = useState(false);
  // In-app sheets (window.confirm/alert o'rniga)
  const [vehicleDeleteTarget, setVehicleDeleteTarget] = useState(null);
  const [vehicleClearConfirm, setVehicleClearConfirm] = useState(false);
  const [vehicleNotice, setVehicleNotice] = useState(null); // i18n kaliti


  const fileInputRef = useRef(null);
  const vehicleFileInputRef = useRef(null);

  // Rasm ≤800px JPEG'ga siqiladi (~80–150KB): 5MB base64 localStorage'ni to'ldirardi
  const handleVehiclePhotoUpload = async (e) => {
    const input = e.target;
    const file = input?.files?.[0];
    if (input) input.value = ''; // o'sha faylni qayta tanlash mumkin bo'lsin
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setVehicleNotice('vehiclePhotoTooLarge');
      return;
    }
    try {
      const dataUrl = await compressImage(file, 800, 800, 0.82);
      setEditVehicleData(prev => ({ ...prev, photoUrl: dataUrl }));
    } catch {
      setVehicleNotice('vehiclePhotoErr');
    }
  };

  const DEFAULT_VEHICLES = [
    {
      id: 'v_1',
      type: 'car',
      make: 'Toyota',
      model: 'HiAce',
      photoUrl: '/images/presets/toyota_hiace.jpg',
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
      bodyStyle: 'flatbed',
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
      const savedList = localStorage.getItem(VEHICLES_KEY);
      if (savedList) {
        const repaired = sanitizeVehicles(JSON.parse(savedList));
        safeSetJSON(VEHICLES_KEY, repaired);
        return repaired;
      }
    } catch {
      return DEFAULT_VEHICLES;
    }
    safeSetJSON(VEHICLES_KEY, DEFAULT_VEHICLES);
    return DEFAULT_VEHICLES;
  });

  const [myVehicle, setMyVehicle] = useState(() => {
    try {
      const savedActive = localStorage.getItem(ACTIVE_VEHICLE_KEY);
      if (savedActive) {
        const parsed = JSON.parse(savedActive);
        // Ro'yxatdagi nusxa ustun (eski v_2 tuzatishi ham shu orqali keladi)
        const fromList = parsed && myVehicles.find(v => String(v.id) === String(parsed.id));
        return fromList || sanitizeVehicles([parsed])[0] || null;
      }
    } catch { /* buzilgan JSON — ro'yxatdagi birinchisiga qaytamiz */ }
    
    // Fallback to first vehicle in vehicles list
    const initial = myVehicles && myVehicles.length > 0 ? myVehicles[0] : null;
    if (initial) safeSetJSON(ACTIVE_VEHICLE_KEY, initial);
    return initial;
  });

  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [editVehicleData, setEditVehicleData] = useState({ ...(myVehicle || {}) });
  const [dynamicModels, setDynamicModels] = useState([]);

  // Smooth gesture, swipe, and transition states
  const fleetTabsRef = useRef(null);
  const [swipeStartX, setSwipeStartX] = useState(null);
  const [isCardFading, setIsCardFading] = useState(false);

  // Silky smooth vehicle selection handler with 220ms graceful blur-fade out and 550ms cinematic float in
  const handleSelectActiveVehicleSmooth = (veh) => {
    if (!veh) return;
    if (myVehicle && String(myVehicle.id) === String(veh.id)) return;
    
    // Immediately scroll target tab horizontally into view on click/selection (container-relative)
    if (fleetTabsRef.current) {
      const container = fleetTabsRef.current;
      const targetEl = container.querySelector(`[data-veh-id="${String(veh.id)}"]`);
      if (targetEl) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const relativeLeft = targetRect.left - containerRect.left;
        const targetOffset = container.scrollLeft + relativeLeft - (container.clientWidth / 2) + (targetEl.clientWidth / 2);
        container.scrollTo({ left: Math.max(0, targetOffset), behavior: 'smooth' });
      }
    }

    setIsCardFading(true);
    setTimeout(() => {
      handleSelectActiveVehicle(veh);
      setTimeout(() => {
        setIsCardFading(false);
      }, 40);
    }, 220);
  };

  // Touch & Mouse Swipe Handlers for Main Vehicle Display Card
  const handleCardTouchStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setSwipeStartX(clientX);
  };

  const handleCardTouchEnd = (e) => {
    if (swipeStartX === null || !myVehicles || myVehicles.length <= 1) return;
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diffX = swipeStartX - clientX;

    if (Math.abs(diffX) > 35) { // 35px threshold
      const currentIdx = myVehicles.findIndex(v => String(v.id) === String(myVehicle?.id));
      if (currentIdx !== -1) {
        if (diffX > 0) {
          // Swiped Left -> Next Vehicle
          const nextIdx = (currentIdx + 1) % myVehicles.length;
          handleSelectActiveVehicleSmooth(myVehicles[nextIdx]);
        } else {
          // Swiped Right -> Previous Vehicle
          const prevIdx = (currentIdx - 1 + myVehicles.length) % myVehicles.length;
          handleSelectActiveVehicleSmooth(myVehicles[prevIdx]);
        }
      }
    }
    setSwipeStartX(null);
  };

  // Auto-scroll ONLY the inner tab container horizontally (never scroll the outer page!)
  React.useEffect(() => {
    // Ensure window/page horizontal scroll stays locked at 0
    if (typeof window !== 'undefined') {
      if (window.scrollX !== 0) window.scrollTo(0, window.scrollY);
      if (document.documentElement.scrollLeft !== 0) document.documentElement.scrollLeft = 0;
    }

    if (!myVehicle || !fleetTabsRef.current) return;
    const container = fleetTabsRef.current;
    const activeId = String(myVehicle.id);
    const targetEl = container.querySelector(`[data-veh-id="${activeId}"]`);
    if (targetEl) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const relativeLeft = targetRect.left - containerRect.left;
      const targetOffset = container.scrollLeft + relativeLeft - (container.clientWidth / 2) + (targetEl.clientWidth / 2);
      
      container.scrollTo({
        left: Math.max(0, targetOffset),
        behavior: 'smooth'
      });
    }
  }, [myVehicle?.id]);

  // Automatically load available models dynamically when make changes
  React.useEffect(() => {
    if (!editVehicleData.make) return;
    let isMounted = true;
    async function loadModelsForMake() {
      const currentMake = editVehicleData.make;
      const localModels = MASTER_VEHICLE_DATABASE.filter(
        v => v.make.toLowerCase() === currentMake.toLowerCase()
      ).map(v => v.model);

      try {
        const apiModels = await getModelsForMake(currentMake);
        const apiNames = apiModels.map(m => m.model);
        const merged = Array.from(new Set([...localModels, ...apiNames]));
        if (isMounted) {
          setDynamicModels(merged.length > 0 ? merged : localModels);
        }
      } catch {
        if (isMounted) setDynamicModels(localModels);
      }
    }
    loadModelsForMake();
    return () => { isMounted = false; };
  }, [editVehicleData.make]);

  // Faol mashinada rasm UMUMAN bo'lmasa, HD rasm qidiriladi.
  // v1.1: lokal preset (/images/presets/) va foydalanuvchi rasmi endi hech qachon almashtirilmaydi —
  // avval Wikipedia'dagi noto'g'ri rasm tanlangan rasm ustidan yozilardi.
  React.useEffect(() => {
    if (!myVehicle || !myVehicle.make || !myVehicle.model || myVehicle.photoUrl || getLocalVehicleImage(myVehicle)) return;
    let isMounted = true;
    const { id, make, model } = myVehicle;
    const patch = (v, hdUrl) =>
      (v && String(v.id) === String(id) && !v.photoUrl && v.make === make && v.model === model)
        ? { ...v, photoUrl: hdUrl }
        : v;

    getHDVehiclePhoto(make, model).then((hdUrl) => {
      if (!hdUrl || !isMounted) return;
      setMyVehicle(prev => {
        const updated = patch(prev, hdUrl);
        if (updated !== prev) safeSetJSON(ACTIVE_VEHICLE_KEY, updated);
        return updated;
      });
      setMyVehicles(prevList => {
        const updatedList = (prevList || []).map(v => patch(v, hdUrl));
        safeSetJSON(VEHICLES_KEY, updatedList);
        return updatedList;
      });
    }).catch(() => { /* tarmoq xatosi — gradient karta qoladi */ });

    return () => { isMounted = false; };
  }, [myVehicle?.make, myVehicle?.model, myVehicle?.id, myVehicle?.photoUrl]);

  // Ro'yxatdagi rasmsiz mashinalar uchun rasm qidirish (funksional yangilash: oraliqdagi tahrirlar yo'qolmaydi)
  React.useEffect(() => {
    const pending = (myVehicles || []).filter(v => v && !v.photoUrl && v.make && v.model && !getLocalVehicleImage(v));
    if (pending.length === 0) return;
    let isMounted = true;

    Promise.all(pending.map(async (v) => ({
      id: String(v.id), make: v.make, model: v.model,
      url: await getHDVehiclePhoto(v.make, v.model).catch(() => null),
    }))).then((results) => {
      const found = results.filter(r => r.url);
      if (!isMounted || found.length === 0) return;
      setMyVehicles(prevList => {
        const updatedList = (prevList || []).map(v => {
          const hit = found.find(r => r.id === String(v.id) && r.make === v.make && r.model === v.model);
          return hit && !v.photoUrl ? { ...v, photoUrl: hit.url } : v;
        });
        safeSetJSON(VEHICLES_KEY, updatedList);
        return updatedList;
      });
    });

    return () => { isMounted = false; };
  }, [myVehicles?.length]);

  // Konstruktor: marka/model o'zgarganda (rasm bo'lmasa) HD rasm — 600ms debounce, eski so'rov natijasi qo'llanmaydi
  React.useEffect(() => {
    if (!isEditingVehicle || !editVehicleData?.make || !editVehicleData?.model || editVehicleData.photoUrl) return;
    let isMounted = true;
    const { make, model } = editVehicleData;

    const timer = setTimeout(async () => {
      try {
        const hdUrl = await getHDVehiclePhoto(make, model);
        if (hdUrl && isMounted) {
          setEditVehicleData(prev =>
            (prev && !prev.photoUrl && prev.make === make && prev.model === model) ? { ...prev, photoUrl: hdUrl } : prev
          );
        }
      } catch { /* tarmoq xatosi — gradient karta qoladi */ }
    }, 600);

    return () => { isMounted = false; clearTimeout(timer); };
  }, [isEditingVehicle, editVehicleData?.make, editVehicleData?.model, editVehicleData?.photoUrl]);



  // JDM Prefectures & Hiragana Lists
  const JDM_PREFECTURES = [
    '練馬', '品川', '足立', '多摩', '世田谷', '杉並', '横浜', '川崎', '湘南', '相模', 
    '大宮', '川口', '所沢', '千葉', '成田', 'なにわ', '大阪', '和泉', '京都', '神戸', 
    '姫路', '名古屋', '三河', '福岡', '北九州', '札幌', '旭川', '仙台', '広島'
  ];
  
  const JDM_HIRAGANA = [
    'あ', 'い', 'う', 'え', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'ほ',
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
    e?.preventDefault?.();
    // Validatsiya: marka/model majburiy, o'lchamlar musbat, bir xil davlat raqami takrorlanmaydi
    const errKey = validateVehicle(editVehicleData, myVehicles);
    if (errKey) {
      setVehicleNotice(errKey);
      return;
    }
    const toSave = {
      ...editVehicleData,
      make: String(editVehicleData.make).trim(),
      model: String(editVehicleData.model).trim(),
    };
    const updatedList = upsertVehicle(myVehicles, toSave);
    // Avval xotiraga yozamiz: joy tugasa holat o'zgarmaydi va tushunarli xabar chiqadi
    if (!safeSetJSON(VEHICLES_KEY, updatedList) || !safeSetJSON(ACTIVE_VEHICLE_KEY, toSave)) {
      setVehicleNotice('vehicleErrStorage');
      return;
    }
    setMyVehicles(updatedList);
    setMyVehicle(toSave);
    setIsEditingVehicle(false);
    window.dispatchEvent(new CustomEvent('michi-vehicle-updated', { detail: toSave }));
  };

  const handleSelectActiveVehicle = (vehicle) => {
    setMyVehicle(vehicle);
    safeSetJSON(ACTIVE_VEHICLE_KEY, vehicle);
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

  // O'chirish: avval ilova ichidagi tasdiq oynasi (window.confirm emas)
  const handleDeleteVehicle = (id, event) => {
    if (event) event.stopPropagation();
    const targetVeh = (myVehicles || []).find(v => String(v.id) === String(id));
    setVehicleDeleteTarget(targetVeh || { id });
  };

  const confirmDeleteVehicle = () => {
    const target = vehicleDeleteTarget;
    setVehicleDeleteTarget(null);
    if (!target) return;
    const { list: updated, active: nextActive, activeChanged } = removeVehicle(myVehicles, myVehicle, target.id);
    setMyVehicles(updated);
    safeSetJSON(VEHICLES_KEY, updated);
    if (activeChanged) {
      setMyVehicle(nextActive);
      if (nextActive) {
        safeSetJSON(ACTIVE_VEHICLE_KEY, nextActive);
      } else {
        try { localStorage.removeItem(ACTIVE_VEHICLE_KEY); } catch { /* storage yo'q */ }
      }
      window.dispatchEvent(new CustomEvent('michi-vehicle-updated', { detail: nextActive }));
    }
  };

  const handleClearAllVehicles = () => {
    setMyVehicles([]);
    setMyVehicle(null);
    setIsEditingVehicle(false);
    safeSetJSON(VEHICLES_KEY, []);
    try { localStorage.removeItem(ACTIVE_VEHICLE_KEY); } catch { /* storage yo'q */ }
    window.dispatchEvent(new CustomEvent('michi-vehicle-updated', { detail: null }));
  };

  const { renderVehicleSVG, renderJDMPlateBox, getProfileLangText, renderDriverMarkBadge, getLicenseLabel } = createProfileRenderers({ i18n });

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

    const fallbackAddress = filteredAddress.map(a => a.address + (a.isCurrent ? ` (${t('currentAddressLabel')})` : '')).join(', ');
    const fallbackEducation = filteredEdu.map(e => `${e.school}${e.major ? ` (${e.major})` : ''} • ${e.startDate || ''} ~ ${e.isCurrent ? t('currentlyStudyingLabel') : e.endDate || ''}`).join(', ');

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

  // v1.1 Faza E: ajratilgan sahifa komponentlariga uzatiladigan holat va funksiyalar.
  // PAGE_CTX_START
  const pageCtx = {
    JDM_HIRAGANA, addEditAddressEntry, addEditEducationEntry, appPipelineTab, appSelectMode, applications,
    companyEmployees, confirmDeleteVehicle, contractStatus, darkMode, dynamicModels, editData,
    editVehicleData, empAddMode, empFilter, empInputId, empInputName, empInputPhone,
    employeesCount, exitAppSelectMode, expandedAppId, fileInputRef, fleetTabsRef, getAvatarSrc,
    getProfileLangText, getRoleLabel, getVehiclePresetDimensions, handleAddNewVehicle, handleAvatarChange, handleBackToMain,
    handleCardTouchEnd, handleCardTouchStart, handleClearAllVehicles, handleDeleteVehicle, handleOpenSubPage, handleSaveVehicle,
    handleSelectActiveVehicleSmooth, handleToggleNotifSound, handleToggleShowBadges, handleVehiclePhotoUpload, hiddenApps, hiddenShoukai,
    i18n, isCardFading, isEditing, isEditingVehicle, isFormOpen, isVehiclePickerOpen,
    jobToEdit, jobs, mainContainerRef, myVehicle, myVehicles, notifTab,
    notificationSound, notifications, onAcceptEmployeeRequest, onAddEmployee, onApply, onApplySchool,
    onChangeAppStatus, onWithdrawApplication, onChangeLanguage, onClearAllNotifs, onDeleteNotif, onJobClick, onJobCreated,
    onLogout, onMarkAllRead, onMarkRead, onNavigate, onSchoolClick, onShoukai,
    onShoukaiPaid, onTriggerRegister, profileActivePageSource, profileData, referralsCount, removeEditAddressEntry,
    removeEditEducationEntry, renderDriverMarkBadge, renderHideOverlays, renderJDMPlateBox, requestHide, saveEditing,
    schoolApplications, schools, selectedAppKeys, selectedShoukaiApp, setActivePage, setAppPipelineTab,
    setAppSelectMode, setContractStatus, setDarkMode, setEditData, setEditVehicleData, setEmpAddMode,
    setEmpFilter, setEmpInputId, setEmpInputName, setEmpInputPhone, setExpandedAppId, setIsEditing,
    setIsEditingVehicle, setIsFormOpen, setIsVehiclePickerOpen, setJobToEdit, setJobs, setNotifTab,
    setNotifications, setProfileActivePageSource, setSchools, setSelectedShoukaiApp, setShoukaiTab, setShowClearNotifsConfirm,
    setSoundSettings, setVehicleClearConfirm, setVehicleDeleteTarget, setVehicleNotice, shoukaiTab, showClearNotifsConfirm,
    showProfileBadges, soundSettings, startEditing, t, toggleSelectApp, totalOwnApplications,
    totalSavedCount, unreadCount, updateEditAddressEntry, updateEditEducationEntry, userRole, vehicleClearConfirm,
    vehicleDeleteTarget, vehicleFileInputRef, vehicleNotice,
  };
  // PAGE_CTX_END

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
    return <NotificationsPage {...pageCtx} />;
  }

  // ===== SETTINGS PAGE =====
  if (activePage === 'settings') {
    return <SettingsPage {...pageCtx} />;
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
    return <AboutPage {...pageCtx} />;
  }

  // ===== MY POSTED ADS PAGE (COMPANY) =====
  if (activePage === 'my_ads') {
    return <MyAdsPage {...pageCtx} />;
  }

  // ===== PERSONAL INFO PAGE =====
  if (activePage === 'personalInfo') {
    return <PersonalInfoPage {...pageCtx} />;
  }

  // ===== MY APPLICATIONS / COMPANY INCOMING APPLICATIONS PAGE =====
  if (activePage === 'applications') {
    return <ApplicationsPage {...pageCtx} />;
  }

  // ===== SAVED ITEMS PAGE (SAQLANGAN E'LONLAR SAHIFASI) =====
  // Ushbu bo'lim foydalanuvchi tomonidan saqlangan ish e'lonlari va avtomaktablarni ko'rsatadi.
  // Barcha brauzerlarda to'liq moslik va kamchiliklarsiz ishlashini ta'minlash uchun:
  // 1. Faol bo'lmagan (o'chirilgan yoki muddati tugagan) e'lonlar avtomatik filtrlanadi.
  // 2. Klik qilinganda App.jsx orqali to'g'ridan-to'g'ri batafsil sahifalar (overlay/tab) ochiladi.
  if (activePage === 'saved_items') {
    return <SavedItemsPage {...pageCtx} />;
  }

  // ===== MY SHOUKAI PAGE =====
  if (activePage === 'my_shoukai') {
    return <ShoukaiPage {...pageCtx} />;
  }

  // ===== COMPANY HR (EMPLOYEES) PAGE =====
  if (activePage === 'employees') {
    return <EmployeesPage {...pageCtx} />;
  }

  // ===== MAIN PROFILE PAGE =====
  return <ProfileMainView {...pageCtx} />;
}


