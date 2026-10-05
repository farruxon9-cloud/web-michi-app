import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Splash from './components/Splash';
import LanguageSelect from './components/LanguageSelect';
import RoleSelect from './components/RoleSelect';
import BottomNav from './components/BottomNav';
import './App.css';
import Dashboard from './components/Dashboard';
import DriverFeed from './components/DriverFeed';
import JobDetail from './components/JobDetail';
import DrivingAcademy from './components/DrivingAcademy';
import ServiceComingSoon from './components/ServiceComingSoon';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import VoiceAssistant from './components/VoiceAssistant';
import RobotAvatar from './components/RobotAvatar';
// Real map page (stage 1). Lazy so maplibre (~800KB) loads only when the map is opened.
const MichiMap = React.lazy(() => import('./components/map/MichiMap'));
import AssistHeroShowcase from './components/AssistHeroShowcase';
import ErrorBoundary from './components/ErrorBoundary';
import ReferralModal from './components/ReferralModal';
import { getPermanentUserId } from './utils/userIdManager';
import { loadUserDraft, saveUserDraft, removeUserDraft, pickProfileDraft } from './utils/localDraftStore';
import { buildProfilePatch, profileFingerprint } from './utils/profileSync';
import { sanitizeStoredApplications, slimApplicationsForStorage } from './utils/applicationItems';
import { AppProvider } from './context/AppContext';
import { submitApplicationToBackend, fetchApplications, updateApplicationStatus, notifyCompanyNewApplication, notifyApplicantStatusChange } from './services/applicationService';
import { splitApplications, findStatusChanges, hasActiveApplication } from './utils/applicationMapper';
import { useAuth } from './context/AuthContext';
import { fetchSchools } from './services/michiSchoolsApiService';
import { normalizeSchoolPosting } from './utils/jobPostingNormalizer';
import { isProfileCompleteData } from './utils/profileCompleteness';
import { useJobFeed } from './hooks/useJobFeed';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import { MUSIC_TRACKS } from './data/musicTracks';




const mockIncomingApplications = [];

class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ChunkErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary, #8E8E93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#FF3B30', background: 'rgba(255,59,48,0.1)', padding: '12px 16px', borderRadius: '12px', maxWidth: '90%', wordBreak: 'break-word' }}>
            {this.state.error?.toString() || "Render Error"}
          </div>
          <button 
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })} 
            style={{ padding: '10px 20px', borderRadius: '12px', background: '#0084FF', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '12px' }}
          >
            Qayta Urinib Ko'rish
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { t, i18n } = useTranslation();
  const [showSplash, setShowSplash] = useState(true);
  const [languageSelected, setLanguageSelected] = useState(() => {
    try {
      return Boolean(localStorage.getItem('michi_lang'));
    } catch {
      return false;
    }
  });
  const { user, userRole, setUserRole, logout, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showJDMNavigation, setShowJDMNavigation] = useState(false);
  const [showAssistHeroShowcase, setShowAssistHeroShowcase] = useState(false);
  const [hasOpenedJDM, setHasOpenedJDM] = useState(false);

  // Ovozli yordamchi holati
  const [isVoiceStandby, setIsVoiceStandby] = useState(() => {
    try {
      const saved = localStorage.getItem('michi_voice_standby');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('idle');

  useEffect(() => {
    try {
      localStorage.setItem('michi_voice_standby', String(isVoiceStandby));
    } catch {}
  }, [isVoiceStandby]);

  useEffect(() => {
    if (showJDMNavigation) setHasOpenedJDM(true);
  }, [showJDMNavigation]);

  // Map overlay ↔ browser history: hardware/browser Back closes the map instead of leaving the app
  useEffect(() => {
    if (!showJDMNavigation) return undefined;
    window.history.pushState({ michiMap: true }, '');
    const onPop = () => setShowJDMNavigation(false);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // Closed from inside the app (tab switch etc.) → drop our history entry
      if (window.history.state?.michiMap) window.history.back();
    };
  }, [showJDMNavigation]);

  // true while profile edits are not yet saved on the server (persisted so a reload keeps them)
  const [initialProfilePending] = useState(() => Boolean(loadUserDraft('profile_sync_pending', getPermanentUserId(), false)));
  const profileDirtyRef = useRef(initialProfilePending);

  // Sync profileData when user object from AuthContext updates.
  // accountId = server user id (jobs.authorId); never sent with applications.
  // While local edits are not yet saved on the server, keep them (don't overwrite with the
  // older server snapshot) — see the profile sync effect below.
  useEffect(() => {
    if (user) {
      setProfileData(prev => (profileDirtyRef.current
        ? { ...prev, accountId: user.id || prev.accountId || null }
        : {
          ...prev,
          ...(user.profileData || {}),
          fullName: user.fullName || user.profileData?.fullName || prev.fullName,
          email: user.email || user.profileData?.email || prev.email,
          phone: user.phone || user.profileData?.phone || prev.phone,
          accountId: user.id || prev.accountId || null
        }));
    }
  }, [user]);

  // 5-BOSQICH: URL'dagi referral parametrini ushlab qolish (?ref=...)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
          sessionStorage.setItem('michi_referrer_id', refCode);
        }
      }
    } catch (e) {}
  }, []);


  // Mikrofon resurslarini xavfsiz boshqarish
  const stopMicrophoneStream = useCallback(() => {
    if (window.michiActiveMicStream) {
      try {
        window.michiActiveMicStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      window.michiActiveMicStream = null;
    }
  }, []);

  const handleVoiceActivate = useCallback(async () => {
    setIsVoiceActive(true);
    setIsVoiceStandby(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        stopMicrophoneStream();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        window.michiActiveMicStream = stream;
      } catch (err) {
        console.warn("[VoiceAI] Mikrofon ruxsati berilmadi:", err);
      }
    }
  }, [stopMicrophoneStream]);

  const handleVoiceToggle = useCallback(async () => {
    if (isVoiceStandby || isVoiceActive) {
      setIsVoiceActive(false);
      setIsVoiceStandby(false);
      stopMicrophoneStream();
    } else {
      await handleVoiceActivate();
    }
  }, [isVoiceStandby, isVoiceActive, handleVoiceActivate, stopMicrophoneStream]);

  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [profileActivePage, setProfileActivePage] = useState('main');
  const [profileActivePageSource, setProfileActivePageSource] = useState('profile');
  const [backTab, setBackTab] = useState(null);

  const [pendingApply, setPendingApply] = useState(null);
  const [authInitialStep, setAuthInitialStep] = useState('role');
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

  const [referralModal, setReferralModal] = useState({
    isOpen: false,
    item: null,
    type: null,
    resolve: null
  });

  const openReferralModal = useCallback((item, type) => {
    return new Promise((resolve) => {
      setReferralModal({ isOpen: true, item, type, resolve });
    });
  }, []);

  // 🎵 Background music (one player for home card, voice commands and macOS home)
  const musicPlayer = useMusicPlayer(MUSIC_TRACKS);
  const mainContentRef = useRef(null);

  // Tab almashganda tepaga skroll va dinamik SEO Title o'rnatish
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
    const TAB_TITLES = {
      home: 'Michi App — 日本のトラックドライバー・自動車教習所求人プラットフォーム',
      jobs: '求人一覧 (Driver Jobs) — Michi App',
      service: '自動車整備・サービス (Services) — Michi App',
      academy: '自動車教習所 (Driving Academies) — Michi App',
      profile: 'マイページ (My Profile) — Michi App',
      company: '企業ダッシュボード (Company Panel) — Michi App'
    };
    if (TAB_TITLES[activeTab]) {
      document.title = TAB_TITLES[activeTab];
    }
  }, [activeTab]);

  // Modal ochilganda Body Scroll Lock
  useEffect(() => {
    const isModalOpen = showJDMNavigation || showAssistHeroShowcase || selectedJob;
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showJDMNavigation, showAssistHeroShowcase, selectedJob]);

  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobActiveSegment, setJobActiveSegment] = useState('all');
  const [academySearchQuery, setAcademySearchQuery] = useState('');

  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [minSalary, setMinSalary] = useState(0);
  const [selectedPrefecture, setSelectedPrefecture] = useState('all');

  const [contractStatus, setContractStatus] = useState('none');
  const [verifiedCompanies, setVerifiedCompanies] = useState(['Sagawa Express', 'Yamato Transport']);

  const handleToggleVerify = (companyId) => {
    setVerifiedCompanies(prev => 
      prev.includes(companyId) ? prev.filter(id => id !== companyId) : [...prev, companyId]
    );
  };

  const handleSchoolClick = (school) => {
    setBackTab('profile');
    setActiveTab('academy');
    setSelectedSchool(school);
  };

  const handleSchoolBack = () => {
    setSelectedSchool(null);
    if (backTab) {
      setActiveTab(backTab);
      setBackTab(null);
    }
  };

  const handleNavigateToInternationalJobs = () => {
    setSelectedBenefits(['international']);
    setSelectedLicenses([]);
    setJobSearchQuery('');
    setJobActiveSegment('all');
    setMinSalary(0);
    setSelectedPrefecture('all');
    setActiveTab('jobs');
  };

  // Dark Mode boshqaruvi
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('michi_darkmode');
      return saved ? saved === 'true' : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
    document.documentElement.classList.toggle('light-mode', !darkMode);
    try {
      localStorage.setItem('michi_darkmode', String(darkMode));
    } catch {}
  }, [darkMode]);

  const [soundSettings, setSoundSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('michi_sound_settings');
      return saved ? JSON.parse(saved) : { sound: true, vibration: true };
    } catch {
      return { sound: true, vibration: true };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('michi_sound_settings', JSON.stringify(soundSettings));
    } catch {}
  }, [soundSettings]);

  const [notificationSound, setNotificationSound] = useState(() => {
    try {
      const saved = localStorage.getItem('michi_notif_sound');
      return saved !== null ? saved === 'true' : true;
    } catch { return true; }
  });

  const [showProfileBadges, setShowProfileBadges] = useState(() => {
    try {
      const saved = localStorage.getItem('michi_show_badges');
      return saved !== null ? saved === 'true' : true;
    } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem('michi_notif_sound', String(notificationSound)); } catch {}
  }, [notificationSound]);

  useEffect(() => {
    try { localStorage.setItem('michi_show_badges', String(showProfileBadges)); } catch {}
  }, [showProfileBadges]);

  const createBaseProfile = () => ({
    userId: getPermanentUserId(),
    fullName: 'Mehmon',
    birthDate: '',
    licenseType: 'Oogata',
    experience: '',
    email: 'michi@example.com',
    avatar: null,
    workHistory: [],
    addressHistory: [],
    educationHistory: [],
    gender: 'male',
    personalRequests: '貴社規定に従います。'
  });

  const [profileData, setProfileData] = useState(() => {
    const base = createBaseProfile();
    let initial = base;
    try {
      const cached = localStorage.getItem('michi_user_session') || localStorage.getItem('michi_auth_user');
      if (cached) {
        const user = JSON.parse(cached);
        const profile = user.profileData || user;
        initial = {
          ...base,
          ...profile,
          fullName: user.fullName || profile.fullName || base.fullName,
          email: user.email || profile.email || base.email,
          accountId: user.id || null
        };
      }
    } catch {}
    // Restore locally saved resume edits (kept per user, cleared on logout)
    const draft = loadUserDraft('profile', initial.userId);
    return draft ? { ...initial, ...draft } : initial;
  });

  // On logout (role goes from set → null) wipe the in-memory profile, so the next
  // account on this device never inherits the previous person's resume data.
  const prevRoleRef = useRef(userRole);
  const skipNextDraftSaveRef = useRef(false);
  useEffect(() => {
    if (prevRoleRef.current && !userRole) {
      skipNextDraftSaveRef.current = true;
      profileDirtyRef.current = false;
      setProfileData(createBaseProfile());
    }
    prevRoleRef.current = userRole;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  // Persist resume/profile edits so they survive a reload (debounced, failure-safe)
  useEffect(() => {
    if (skipNextDraftSaveRef.current) {
      skipNextDraftSaveRef.current = false;
      return undefined;
    }
    const timer = setTimeout(() => {
      saveUserDraft('profile', profileData.userId, pickProfileDraft(profileData));
    }, 500);
    return () => clearTimeout(timer);
  }, [profileData]);

  // ---- Server profile sync (PATCH /api/auth/me) ----
  // Edits go through handleUpdateProfile → marked unsynced → saved ~1.5s after the last change.
  // Transient failures (offline/5xx/429) retry on reconnect / when the tab becomes visible;
  // invalid input (400/413) shows one alert and waits for the next edit.
  const [profileSyncTick, setProfileSyncTick] = useState(0);
  const profileDataRef = useRef(profileData);
  useEffect(() => { profileDataRef.current = profileData; }, [profileData]);
  const markProfileDirty = useCallback(() => {
    profileDirtyRef.current = true;
    saveUserDraft('profile_sync_pending', getPermanentUserId(), true);
  }, []);
  const handleUpdateProfile = useCallback((newData) => {
    setProfileData(prev => ({ ...prev, ...newData }));
    markProfileDirty();
  }, [markProfileDirty, setProfileData]);

  useEffect(() => {
    if (!profileDirtyRef.current || !user || (userRole !== 'driver' && userRole !== 'company')) return undefined;
    const timer = setTimeout(async () => {
      const sent = profileDataRef.current;
      const fp = profileFingerprint(sent);
      try {
        await updateProfile(buildProfilePatch(sent));
        if (profileFingerprint(profileDataRef.current) === fp) {
          profileDirtyRef.current = false;
          removeUserDraft('profile_sync_pending', getPermanentUserId());
        } else {
          setProfileSyncTick(n => n + 1); // edited while saving → save again
        }
      } catch (err) {
        console.warn('[App] profile save failed:', err.message);
        if (err.status === 400 || err.status === 413) {
          profileDirtyRef.current = false;
          removeUserDraft('profile_sync_pending', getPermanentUserId());
          alert(t('profileSaveError', 'プロフィールをサーバーに保存できませんでした。'));
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [profileData, profileSyncTick, user, userRole, updateProfile, t]);

  useEffect(() => {
    const retry = () => { if (profileDirtyRef.current && document.visibilityState !== 'hidden') setProfileSyncTick(n => n + 1); };
    window.addEventListener('online', retry);
    document.addEventListener('visibilitychange', retry);
    return () => {
      window.removeEventListener('online', retry);
      document.removeEventListener('visibilitychange', retry);
    };
  }, []);

  const feed = useJobFeed();
  const [companyJobs, setCompanyJobs] = useState([]);
  const [schools, setSchools] = useState([]);
  // Driver: own applications (server is the source of truth; a slim local copy is kept for
  // offline start-up). Company: applications to its own listings, loaded from the server.
  const [applications, setApplications] = useState(() =>
    sanitizeStoredApplications(loadUserDraft('applications', profileData.userId, []))
  );
  const [notifications, setNotifications] = useState([]);

  const handleMarkNotifRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const handleMarkAllNotifsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => (n.read ? n : { ...n, read: true })));
  }, []);
  const handleDeleteNotif = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  const handleClearAllNotifs = useCallback(() => setNotifications([]), []);
  const handleShoukaiPaid = useCallback((appId) => {
    setApplications(prev => prev.map(a => (a.id === appId ? { ...a, shoukaiPaid: true } : a)));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const isProfileComplete = useCallback(() => {
    // Same 5 fields + admin bypass as before — see utils/profileCompleteness.js
    return isProfileCompleteData(profileData);
  }, [profileData]);

  const handleApplyJob = useCallback(async (job, opts = {}) => {
    const branchId = opts && opts.branchId != null ? String(opts.branchId) : null;
    const branchName = (opts && opts.branchName) || null;
    if (userRole === 'guest') {
      setPendingApply({ type: 'job', item: job, opts: { branchId, branchName } });
      setAuthInitialStep('register');
      setUserRole(null);
      return;
    }
    
    if (!isProfileComplete()) {
      setShowCompleteProfileModal(true);
      return;
    }

    const exists = hasActiveApplication(applications, { jobId: job.id });
    if (exists) return;

    const refId = await openReferralModal(job, 'job');

    const tempId = `local_${Date.now()}`;
    const newApp = {
      id: tempId,
      jobId: job.id,
      company: job.company,
      title: job.title,
      logo: job.logo,
      status: 'submitted',
      appliedDate: new Date().toLocaleDateString(),
      appliedAt: new Date().toISOString(),
      shoukaiId: refId || null,
      shoukaiAmount: job.shoukaiAmount || null,
      shoukaiPaid: false,
      branchId,
      branchName,
      applicantInfo: { ...profileData }
    };
    setApplications(prev => [...prev, newApp]);

    // Send application to central backend server (https://api.michi.jp.net/api/applications)
    try {
      const result = await submitApplicationToBackend(job.id, profileData, branchId, { branchName, referrerId: refId || null });
      // Swap the optimistic entry for the server record (real id → status updates work)
      const saved = result && result.mapped;
      setApplications(prev => prev.map(a => (a.id === tempId
        ? { ...newApp, ...(saved || {}), title: (saved && saved.title) || newApp.title, company: (saved && saved.company) || newApp.company, logo: (saved && saved.logo) || newApp.logo, shoukaiAmount: (saved && saved.shoukaiAmount) || newApp.shoukaiAmount }
        : a)));
    } catch (err) {
      console.error('Application submit to backend error:', err);
      // Roll back the optimistic entry so the user can retry
      setApplications(prev => prev.filter(a => a.id !== tempId));
      alert(t('applySubmitError', '応募の送信に失敗しました。通信環境を確認して再度お試しください。'));
      return;
    }

    // Notify company via email webhook proxy (best effort)
    try {
      const targetCompanyEmail = job.email || job.companyEmail || job.contactEmail;
      if (targetCompanyEmail) {
        await notifyCompanyNewApplication({
          companyEmail: targetCompanyEmail,
          applicantName: profileData.fullName || profileData.name || 'Haydovchi',
          jobTitle: branchName ? `${job.title}（${branchName}）` : job.title,
          type: 'new_application'
        });
      }
    } catch (err) {
      console.warn('Company notify error:', err);
    }
  }, [userRole, applications, profileData, isProfileComplete, openReferralModal, t]);

  /** Company moves an application (PATCH /api/applications/:id); optimistic with rollback. */
  const handleChangeAppStatus = useCallback(async (appId, newStatus) => {
    const inJobs = applications.find(a => a.id === appId);
    const targetApp = inJobs || schoolApplicationsRef.current.find(a => a.id === appId);
    if (!targetApp || targetApp.status === newStatus) return;
    const setList = inJobs ? setApplications : setSchoolApplications;
    const prevStatus = targetApp.status;

    setList(prev => prev.map(a => (a.id === appId ? { ...a, status: newStatus } : a)));
    try {
      const saved = await updateApplicationStatus(targetApp.serverId || appId, newStatus);
      if (saved) setList(prev => prev.map(a => (a.id === appId ? { ...a, status: saved.status, updatedAt: saved.updatedAt } : a)));
    } catch (err) {
      console.error('Application status update error:', err);
      setList(prev => prev.map(a => (a.id === appId ? { ...a, status: prevStatus } : a)));
      alert(t('appStatusUpdateError', 'ステータスを更新できませんでした。通信環境を確認して再度お試しください。'));
      return;
    }

    if (['accepted', 'interview', 'reviewed', 'rejected'].includes(newStatus)) {
      // Notify candidate via email webhook proxy (best effort)
      const candidateEmail = targetApp.applicantInfo?.email || targetApp.email;
      if (candidateEmail) {
        notifyApplicantStatusChange({
          applicantEmail: candidateEmail,
          applicantName: targetApp.applicantInfo?.fullName || targetApp.applicantInfo?.name || 'Haydovchi',
          companyName: targetApp.company,
          jobTitle: targetApp.title || targetApp.schoolName,
          newStatus
        }).catch(err => console.warn('[App] Applicant email notification warning:', err.message));
      }
    }
  }, [applications, t]);

  /** Driver withdraws own application (job or school). Returns true on success. */
  const handleWithdrawApplication = useCallback(async (app) => {
    if (!app) return false;
    const setList = app.isSchool ? setSchoolApplications : setApplications;
    const prevStatus = app.status;
    setList(prev => prev.map(a => (a.id === app.id ? { ...a, status: 'withdrawn' } : a)));
    try {
      await updateApplicationStatus(app.serverId || app.id, 'withdrawn');
      return true;
    } catch (err) {
      console.error('Application withdraw error:', err);
      setList(prev => prev.map(a => (a.id === app.id ? { ...a, status: prevStatus } : a)));
      alert(t('withdrawError', '応募を取り下げられませんでした。通信環境を確認して再度お試しください。'));
      return false;
    }
  }, [t]);

  const [schoolApplications, setSchoolApplications] = useState(() =>
    sanitizeStoredApplications(loadUserDraft('school_applications', profileData.userId, []))
  );
  const schoolApplicationsRef = useRef(schoolApplications);
  useEffect(() => { schoolApplicationsRef.current = schoolApplications; }, [schoolApplications]);

  // Persist the driver's own application lists (slim copy, no embedded profile snapshot)
  useEffect(() => {
    if (userRole !== 'driver') return undefined;
    const timer = setTimeout(() => {
      saveUserDraft('applications', profileData.userId, slimApplicationsForStorage(applications));
      saveUserDraft('school_applications', profileData.userId, slimApplicationsForStorage(schoolApplications));
    }, 400);
    return () => clearTimeout(timer);
  }, [userRole, profileData.userId, applications, schoolApplications]);

  // On logout clear in-memory lists so the next account never sees them
  const prevRoleForAppsRef = useRef(userRole);
  useEffect(() => {
    if (prevRoleForAppsRef.current && !userRole) {
      setApplications([]);
      setSchoolApplications([]);
      setNotifications([]);
    }
    prevRoleForAppsRef.current = userRole;
  }, [userRole]);

  const handleApplySchool = useCallback(async (school) => {
    if (userRole === 'guest') {
      setPendingApply({ type: 'school', item: school });
      setAuthInitialStep('register');
      setUserRole(null);
      return;
    }

    if (!isProfileComplete()) {
      setShowCompleteProfileModal(true);
      return;
    }

    const exists = hasActiveApplication(schoolApplications, { schoolId: school.id });
    if (exists) return;

    const refId = await openReferralModal(school, 'school');

    const tempId = `local_${Date.now()}`;
    const newApp = {
      id: tempId,
      isSchool: true,
      schoolId: school.id,
      schoolName: school.name,
      status: 'submitted',
      shoukaiId: refId || null,
      shoukaiAmount: school.shoukaiAmount || null,
      paid: false,
      appliedDate: new Date().toLocaleDateString(),
      appliedAt: new Date().toISOString(),
      applicantInfo: { ...profileData }
    };
    setSchoolApplications(prev => [...prev, newApp]);

    try {
      const result = await submitApplicationToBackend(school.id, profileData, null, { type: 'school', referrerId: refId || null });
      const saved = result && result.mapped;
      setSchoolApplications(prev => prev.map(a => (a.id === tempId
        ? { ...newApp, ...(saved || {}), schoolName: (saved && saved.schoolName) || newApp.schoolName, company: (saved && saved.company) || newApp.schoolName }
        : a)));
    } catch (err) {
      console.error('School application submit error:', err);
      setSchoolApplications(prev => prev.filter(a => a.id !== tempId));
      alert(t('applySubmitError', '応募の送信に失敗しました。通信環境を確認して再度お試しください。'));
    }
  }, [userRole, schoolApplications, profileData, isProfileComplete, openReferralModal, t]);

  // Load applications from the server (driver: own; company: to its listings).
  const applicationsRef = useRef(applications);
  useEffect(() => { applicationsRef.current = applications; }, [applications]);
  const refreshApplications = useCallback(async () => {
    if (userRole !== 'driver' && userRole !== 'company') return;
    try {
      const mapped = await fetchApplications();
      const { jobs, schools: schoolApps } = splitApplications(mapped);
      if (userRole === 'driver') {
        // Raise in-app notifications for status changes made by companies since last load
        const changed = findStatusChanges([...applicationsRef.current, ...schoolApplicationsRef.current], mapped);
        if (changed.length) {
          setNotifications(prev => [
            ...changed.map((a, i) => ({
              id: `${a.serverId}:${a.status}:${Date.now() + i}`,
              type: a.status,
              company: a.company,
              title: a.title || a.schoolName,
              date: new Date(a.updatedAt || Date.now()).toLocaleString(),
              read: false,
            })),
            ...prev,
          ]);
        }
      }
      // Keep optimistic entries that are still being submitted (temp ids, not on the server yet)
      const keepPending = (serverList, key) => (prev) => [
        ...serverList,
        ...prev.filter(a => String(a.id).startsWith('local_') && !serverList.some(s => String(s[key]) === String(a[key]))),
      ];
      setApplications(keepPending(jobs, 'jobId'));
      setSchoolApplications(keepPending(schoolApps, 'schoolId'));
    } catch (err) {
      // Keep what we have (offline / server busy); company starts empty rather than stale
      console.warn('[App] fetchApplications warning:', err.message);
      if (userRole === 'company' && err.status === 401) { setApplications([]); setSchoolApplications([]); }
    }
  }, [userRole, setApplications, setSchoolApplications, setNotifications]);

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);

  // Re-sync when the profile tab is opened and when the app comes back to the foreground
  useEffect(() => {
    if (activeTab === 'profile') refreshApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') refreshApplications(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshApplications]);

  useEffect(() => {
    let isMounted = true;
    fetchSchools()
      .then(rawSchools => {
        if (isMounted && Array.isArray(rawSchools) && rawSchools.length > 0) {
          const normSchools = rawSchools.map(normalizeSchoolPosting).filter(Boolean);
          if (normSchools.length > 0) setSchools(normSchools);
        }
      })
      .catch(err => console.warn('[App] Initial fetchSchools warning:', err.message));

    return () => { isMounted = false; };
  }, []);

  const handleRoleSelection = async (role, data) => {
    setUserRole(role);
    // Applications for the new role are loaded by refreshApplications (runs on role change)
    if (data) {
      setProfileData(prev => ({
        ...prev,
        ...data,
        fullName: data.fullName || t('roleGuest', 'Mehmon'),
        email: data.email || 'michi@example.com'
      }));
    }

    if (pendingApply) {
      const { type, item, opts } = pendingApply;
      setPendingApply(null);
      if (type === 'job') {
        await handleApplyJob(item, opts);
      } else if (type === 'school') {
        await handleApplySchool(item);
      }
    }
  };

  useEffect(() => {
    if (userRole && userRole !== 'guest' && pendingApply) {
      const target = pendingApply;
      setPendingApply(null);
      if (target.type === 'job') {
        handleApplyJob(target.item, target.opts);
      } else if (target.type === 'school') {
        handleApplySchool(target.item);
      }
    }
  }, [userRole, pendingApply, handleApplyJob, handleApplySchool]);

  const handleShoukai = (item) => {
    const isActuallyJob = Boolean(item.title);
    const amount = isActuallyJob ? (item.shoukaiAmount || item.shoukai || '¥50,000') : (item.shoukai || '¥10,000');
    const link = `michi-app.com/${isActuallyJob ? 'job' : 'school'}/${item.id}?ref=${profileData.userId}`;
    
    const alertMsg = i18n.language === 'ja'
      ? `紹介リンクをコピーしました！\n\n${link}`
      : `Shoukai havolasi nusxalandi:\n\n${link}`;
      
    setTimeout(() => alert(alertMsg), 150);
  };

  const handleToggleSave = (item, type) => {
    if (userRole !== 'driver') return;
    setProfileData(prev => {
      const savedItems = prev.savedItems || { jobs: [], schools: [] };
      const currentList = savedItems[type] || [];
      const isSaved = currentList.some(i => i.id === item.id);
      
      return {
        ...prev,
        savedItems: {
          ...savedItems,
          [type]: isSaved ? currentList.filter(i => i.id !== item.id) : [...currentList, item]
        }
      };
    });
  };

  if (showSplash) return <ErrorBoundary><Splash onFinish={() => setShowSplash(false)} /></ErrorBoundary>;
  if (!languageSelected) return <ErrorBoundary><LanguageSelect onFinish={() => setLanguageSelected(true)} /></ErrorBoundary>;
  if (!userRole) return <ErrorBoundary><RoleSelect onSelectRole={handleRoleSelection} onGuest={() => handleRoleSelection('guest')} initialStep={authInitialStep} /></ErrorBoundary>;
  if (userRole === 'admin') return <ErrorBoundary><AdminDashboard verifiedCompanies={verifiedCompanies} onToggleVerify={handleToggleVerify} onLogout={() => logout()} contractStatus={contractStatus} setContractStatus={setContractStatus} profileData={profileData} /></ErrorBoundary>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            profileData={profileData} 
            isVoiceStandby={isVoiceStandby}
            isVoiceActive={isVoiceActive}
            onVoiceActivate={handleVoiceActivate}
            onVoiceToggle={handleVoiceToggle}
            setProfileActivePage={setProfileActivePage}
            setProfileActivePageSource={setProfileActivePageSource}
            userRole={userRole}
            onNavigateToInternational={handleNavigateToInternationalJobs}
            onNavigateToJDM={() => setShowJDMNavigation(true)}
            onOpenAssistShowcase={() => setShowAssistHeroShowcase(true)}
            musicPlayer={musicPlayer}
          />
        );
      case 'jobs':
        return (
          <DriverFeed 
            onJobClick={setSelectedJob} 
            jobs={feed.jobs} 
            feed={feed}
            isContractActive={contractStatus === 'active'} 
            verifiedCompanies={verifiedCompanies} 
            onShoukai={handleShoukai} 
            onApply={handleApplyJob}
            applications={applications}
            userRole={userRole} 
            profileData={profileData}
            searchQuery={jobSearchQuery}
            setSearchQuery={setJobSearchQuery}
            activeSegment={jobActiveSegment}
            setActiveSegment={setJobActiveSegment}
          />
        );
      case 'academy':
        return (
          <DrivingAcademy 
            isContractActive={contractStatus === 'active'} 
            onApplySchool={handleApplySchool}
            schoolApplications={schoolApplications}
            profileData={profileData}
            onShoukai={handleShoukai}
            verifiedCompanies={verifiedCompanies}
            onToggleSave={handleToggleSave}
            userRole={userRole}
            selectedSchool={selectedSchool}
            setSelectedSchool={setSelectedSchool}
            onBackPress={handleSchoolBack}
            schools={schools}
            setSchools={setSchools}
            searchQuery={academySearchQuery}
            setSearchQuery={setAcademySearchQuery}
          />
        );
      case 'service':
        return <ServiceComingSoon onOpenAssistShowcase={() => { setProfileActivePage('assist_showcase'); setActiveTab('profile'); }} onNavigate={setActiveTab} />;
      case 'profile':
        return (
          <Profile 
            onLogout={() => logout()} 
            contractStatus={contractStatus} 
            setContractStatus={setContractStatus} 
            profileData={profileData}
            userRole={userRole}
            isVoiceActive={isVoiceActive}
            setIsVoiceActive={setIsVoiceActive}
            isVoiceStandby={isVoiceStandby}
            setIsVoiceStandby={setIsVoiceStandby}
            onChangeLanguage={() => setLanguageSelected(false)}
            onUpdateProfile={handleUpdateProfile}
            onApply={handleApplyJob}
            onApplySchool={handleApplySchool}
            onShoukai={handleShoukai}
            applications={applications}
            schoolApplications={schoolApplications}
            onChangeAppStatus={handleChangeAppStatus}
            onWithdrawApplication={handleWithdrawApplication}
            notifications={notifications}
            setNotifications={setNotifications}
            onMarkRead={handleMarkNotifRead}
            onMarkAllRead={handleMarkAllNotifsRead}
            onDeleteNotif={handleDeleteNotif}
            onClearAllNotifs={handleClearAllNotifs}
            onShoukaiPaid={handleShoukaiPaid}
            unreadCount={unreadCount}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            soundSettings={soundSettings}
            setSoundSettings={setSoundSettings}
            notificationSound={notificationSound}
            setNotificationSound={setNotificationSound}
            showProfileBadges={showProfileBadges}
            setShowProfileBadges={setShowProfileBadges}
            onNavigate={setActiveTab}
            activePage={profileActivePage}
            setActivePage={setProfileActivePage}
            jobs={companyJobs}
            setJobs={setCompanyJobs}
            onJobCreated={feed.refresh}
            schools={schools}
          />
        );
      default:
        return <DriverFeed onJobClick={setSelectedJob} jobs={feed.jobs} feed={feed} verifiedCompanies={verifiedCompanies} isContractActive={contractStatus === 'active'} onShoukai={handleShoukai} userRole={userRole} onApply={handleApplyJob} applications={applications} />;
    }
  };

  return (
    <ErrorBoundary>
      <AppProvider value={{ userRole, setUserRole, profileData, darkMode, setDarkMode, activeTab, setActiveTab }}>
        <div className="app-layout">
          <div className="glass-blob blob-1"></div>
          <div className="glass-blob blob-2"></div>
          <div className="glass-blob blob-3"></div>
          <header className="global-header">
            <div 
              role="button" 
              tabIndex={0} 
              className="header-logo-left" 
              onClick={() => setActiveTab('home')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTab('home');
                }
              }}
              aria-label="Michi Bosh Sahifa"
            >
              <div className="logo-kanji">道</div>
              <span className="logo-text">MICHI</span>
            </div>

            <div className="header-theme-toggle-centered">
              <button 
                type="button" 
                className="theme-toggle-btn" 
                onClick={() => setDarkMode(prev => !prev)} 
                aria-label="Toggle theme"
              >
                <div className={`theme-toggle-track ${darkMode ? 'dark' : 'light'}`}>
                  <div className="theme-toggle-thumb">
                    {darkMode ? <Moon size={11} /> : <Sun size={11} />}
                  </div>
                </div>
              </button>
            </div>

            <div className="header-robot-right">
              <RobotAvatar 
                isVoiceActive={isVoiceActive || isVoiceStandby} 
                voiceStatus={isVoiceActive ? voiceStatus : 'idle'} 
                onClick={handleVoiceToggle} 
              />
            </div>
          </header>

          <main className="main-content" ref={mainContentRef} style={{ zIndex: 10 }}>
            <ChunkErrorBoundary>
              {renderTabContent()}
            </ChunkErrorBoundary>
          </main>

          {/* Vakansiya tafsilotlari modali */}
          {selectedJob && (
            <ChunkErrorBoundary>
              <JobDetail 
                job={selectedJob} 
                onBack={() => setSelectedJob(null)} 
                onApply={handleApplyJob} 
                applications={applications} 
                onShoukai={handleShoukai} 
                onToggleSave={handleToggleSave} 
                profileData={profileData} 
                userRole={userRole} 
              />
            </ChunkErrorBoundary>
          )}

          {/* JDM Yuk Mashinasi Navigatsiyasi */}
          {hasOpenedJDM && (
            <div 
              className="jdm-nav-overlay-container" 
              style={{ 
                display: showJDMNavigation ? 'block' : 'none', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                zIndex: 1000, 
                height: '100%', 
                width: '100%', 
                overflow: 'hidden' 
              }}
            >
              <ChunkErrorBoundary>
                <React.Suspense fallback={null}>
                  <MichiMap
                    onBack={() => setShowJDMNavigation(false)}
                    isOpen={showJDMNavigation}
                    darkMode={darkMode}
                  />
                </React.Suspense>
              </ChunkErrorBoundary>
            </div>
          )}

          {/* AI Vitrina Taqdimoti */}
          {showAssistHeroShowcase && (
            <div 
              className="assist-showcase-overlay-container" 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                zIndex: 9000, 
                height: '100%', 
                width: '100%', 
                overflowY: 'auto', 
                borderRadius: '44px', 
                background: darkMode ? '#07090E' : '#FAFBFD' 
              }}
            >
              <ChunkErrorBoundary>
                <AssistHeroShowcase 
                  onBack={() => setShowAssistHeroShowcase(false)} 
                  onActivateVoice={() => { 
                    setShowAssistHeroShowcase(false); 
                    handleVoiceActivate(); 
                  }} 
                  darkMode={darkMode} 
                />
              </ChunkErrorBoundary>
            </div>
          )}

          {/* Pastki navigatsiya paneli */}
          <BottomNav 
            activeTab={activeTab} 
            setActiveTab={(tab) => { 
              setShowJDMNavigation(false); 
              setSelectedJob(null); 
              setSelectedSchool(null); 
              setActiveTab(tab); 
            }} 
            unreadCount={unreadCount} 
            userRole={userRole} 
            isVoiceStandby={isVoiceStandby} 
            isVoiceActive={isVoiceActive} 
            voiceStatus={voiceStatus} 
          />

          {/* Markaziy Ovozli Yordamchi Orchestrator */}
          <VoiceAssistant 
            isActive={isVoiceActive} 
            onClose={() => {
              setIsVoiceActive(false);
              stopMicrophoneStream();
            }} 
            onStartVoice={() => handleVoiceActivate()} 
            isVoiceStandby={isVoiceStandby} 
            setIsVoiceStandby={setIsVoiceStandby} 
            setActiveTab={setActiveTab} 
            onStatusChange={setVoiceStatus} 
            activeTab={activeTab} 
            jobs={feed.jobs} 
            schools={schools} 
            profileData={profileData} 
            applications={applications} 
            musicPlayer={musicPlayer}
            toggleDarkMode={() => setDarkMode(prev => !prev)}
            selectedJob={selectedJob}
            selectedSchool={selectedSchool}
            setSelectedJob={setSelectedJob}
            setSelectedSchool={setSelectedSchool}
            profileActivePage={profileActivePage}
            setProfileActivePage={setProfileActivePage}
            setJobSearchQuery={setJobSearchQuery}
            setJobActiveSegment={setJobActiveSegment}
            setAcademySearchQuery={setAcademySearchQuery}
            handleApplyJob={handleApplyJob}
            handleApplySchool={handleApplySchool}
            handleShoukai={handleShoukai}
            userRole={userRole}
            selectedLicenses={selectedLicenses}
            setSelectedLicenses={setSelectedLicenses}
            minSalary={minSalary}
            setMinSalary={setMinSalary}
            selectedPrefecture={selectedPrefecture}
            setSelectedPrefecture={setSelectedPrefecture}
            setApplications={setApplications}
          />

          {/* Shoukai Taklif Kodi Modali */}
          <ReferralModal 
            isOpen={referralModal.isOpen} 
            jobTitle={referralModal.item?.title || referralModal.item?.name} 
            onConfirm={(refId) => { 
              referralModal.resolve?.(refId); 
              setReferralModal({ isOpen: false, item: null, type: null, resolve: null }); 
            }} 
            onCancel={() => { 
              referralModal.resolve?.(null); 
              setReferralModal({ isOpen: false, item: null, type: null, resolve: null }); 
            }} 
          />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
