import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Splash from './components/Splash';
import LanguageSelect from './components/LanguageSelect';
import RoleSelect from './components/RoleSelect';
import BottomNav from './components/BottomNav';
import './App.css';
import Dashboard from './components/Dashboard';
import DriverFeed, { MOCK_JOBS } from './components/DriverFeed';
import JobDetail from './components/JobDetail';
import DrivingAcademy, { MOCK_SCHOOLS } from './components/DrivingAcademy';
import ServiceComingSoon from './components/ServiceComingSoon';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import VoiceAssistant from './components/VoiceAssistant';
import RobotAvatar from './components/RobotAvatar';
import JDMNavigation from './components/JDMNavigation';
import AssistHeroShowcase from './components/AssistHeroShowcase';
import ErrorBoundary from './components/ErrorBoundary';
import ReferralModal from './components/ReferralModal';
import { getPermanentUserId } from './utils/userIdManager';
import { AppProvider } from './context/AppContext';

const TRACKS = [
  { id: 1, title: 'Tokyo Rain (東京の雨)', url: 'https://raw.githubusercontent.com/jigardave8/pro_contentfiles/main/chill-lofi-background-music-331434.mp3' },
  { id: 2, title: 'Kyoto Sunset (京都の夕日)', url: 'https://raw.githubusercontent.com/jigardave8/pro_contentfiles/main/lofi-chill-background-music-313055.mp3' },
  { id: 3, title: 'Shibuya Midnight (渋谷の夜中)', url: 'https://raw.githubusercontent.com/jigardave8/pro_contentfiles/main/piano-and-beat-120539.mp3' },
  { id: 4, title: 'Osaka Neon (大阪のネオン)', url: 'https://raw.githubusercontent.com/jigardave8/pro_contentfiles/main/bell-fi-broadcasts-181511.mp3' }
];

const mockIncomingApplications = [
  {
    id: 101,
    jobId: 1,
    company: 'Sagawa Express',
    title: 'ルート配送ドライバー (地場デリバリー)',
    logo: 'https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100',
    status: 'submitted',
    appliedDate: '2026-06-10',
    shoukaiId: '#Michi-REF1',
    shoukaiAmount: '¥10,000',
    shoukaiPaid: false,
    applicantInfo: {
      fullName: "Anonim Do'st",
      email: 'demo@michi-app.com',
      birthDate: '1995-01-01',
      birthPlace: 'Yaponiya',
      nationality: 'Xorijiy',
      gender: 'male',
      phone: '+81 00-0000-0000',
      postalCode: '000-0000',
      address: 'Tokyo, Shinjuku-ku',
      addressHistory: [
        { address: 'Tokyo, Shinjuku-ku, Shinjuku 3-1-1', isCurrent: true },
        { address: 'Chiba, Matsudo 2-12', isCurrent: false }
      ],
      educationHistory: [
        { school: 'Toshkent Axborot Texnologiyalari Universiteti', major: 'Kompyuter muhandisligi', startDate: '2014-09', endDate: '2018-06', isCurrent: false }
      ],
      driverLicenses: ['oogata', 'kenin', 'futsu'],
      techCertificates: ['forklift'],
      workHistory: [
        { company: 'Yamato Transport Tokyo', position: 'Driver', startDate: '2022-10', endDate: '2025-12', isCurrent: false },
        { company: 'Toshkent Express', position: 'Kuryer', startDate: '2018-07', endDate: '2022-09', isCurrent: false }
      ]
    }
  }
];

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
  const [languageSelected, setLanguageSelected] = useState(false);
  const [userRole, setUserRole] = useState(null);
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

  // 🎵 Radio Player Integratsiyasi
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef(null);
  const mainContentRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(TRACKS[currentTrackIndex].url);
      audioRef.current.volume = volume;
      audioRef.current.onended = () => {
        setCurrentTrackIndex(prev => (prev + 1) % TRACKS.length);
      };
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = TRACKS[currentTrackIndex].url;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const musicPlayer = useMemo(() => ({
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    next: () => setCurrentTrackIndex(prev => (prev + 1) % TRACKS.length),
    previous: () => setCurrentTrackIndex(prev => (prev - 1 + TRACKS.length) % TRACKS.length),
    setVolume: (v) => {
      setVolume(v);
      if (audioRef.current) audioRef.current.volume = v;
    },
    isPlaying,
    currentTrack: TRACKS[currentTrackIndex]
  }), [isPlaying, currentTrackIndex]);

  // Tab almashganda tepaga skroll
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
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

  const [profileData, setProfileData] = useState({
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

  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [schools, setSchools] = useState(MOCK_SCHOOLS);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const isProfileComplete = useCallback(() => {
    if (profileData?.email === 'admin@driver.jp' || profileData?.email === 'admin@sagawa.jp') {
      return true;
    }
    const hasFullName = Boolean(profileData.fullName && profileData.fullName.trim() !== '' && profileData.fullName !== 'Mehmon');
    const hasBirthDate = Boolean(profileData.birthDate);
    const hasPhone = Boolean(profileData.phone && profileData.phone.trim() !== '');
    const hasAddress = Boolean(profileData.address?.trim() || profileData.addressHistory?.length > 0);
    const hasEducation = Boolean(profileData.education?.trim() || profileData.educationHistory?.length > 0);
    
    return Boolean(hasFullName && hasBirthDate && hasPhone && hasAddress && hasEducation);
  }, [profileData]);

  const handleApplyJob = useCallback(async (job) => {
    if (userRole === 'guest') {
      setPendingApply({ type: 'job', item: job });
      setAuthInitialStep('register');
      setUserRole(null);
      return;
    }
    
    if (!isProfileComplete()) {
      setShowCompleteProfileModal(true);
      return;
    }

    const exists = applications.find(a => a.jobId === job.id && !a.isSimulatedReferral);
    if (exists) return;

    const refId = await openReferralModal(job, 'job');

    const newApp = {
      id: Date.now(),
      jobId: job.id,
      company: job.company,
      title: job.title,
      logo: job.logo,
      status: 'submitted',
      appliedDate: new Date().toLocaleDateString(),
      shoukaiId: refId || null,
      shoukaiAmount: job.shoukaiAmount || null,
      shoukaiPaid: false,
      applicantInfo: { ...profileData }
    };
    setApplications(prev => [...prev, newApp]);
  }, [userRole, applications, profileData, isProfileComplete, openReferralModal]);

  const handleChangeAppStatus = (appId, newStatus) => {
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp || targetApp.status === newStatus) return;

    setApplications(prev => prev.map(a => 
      a.id === appId ? { ...a, status: newStatus } : a
    ));

    if (['accepted', 'interview', 'reviewed', 'rejected'].includes(newStatus)) {
      const notif = {
        id: Date.now(),
        type: newStatus,
        company: targetApp.company,
        title: targetApp.title,
        date: new Date().toLocaleString(),
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const [schoolApplications, setSchoolApplications] = useState([]);

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

    const exists = schoolApplications.find(a => a.schoolId === school.id && !a.isSimulatedReferral);
    if (exists) return;

    const refId = await openReferralModal(school, 'school');

    const newApp = {
      id: Date.now(),
      schoolId: school.id,
      schoolName: school.name,
      shoukaiId: refId || null,
      shoukaiAmount: school.shoukaiAmount || null,
      paid: false,
      appliedDate: new Date().toLocaleDateString(),
      applicantInfo: { ...profileData }
    };
    setSchoolApplications(prev => [...prev, newApp]);
  }, [userRole, schoolApplications, profileData, isProfileComplete, openReferralModal]);

  const handleRoleSelection = (role, data) => {
    setUserRole(role);
    if (role === 'company') {
      setApplications(mockIncomingApplications);
    }
    if (data) {
      setProfileData(prev => ({
        ...prev,
        ...data,
        fullName: data.fullName || t('roleGuest', 'Mehmon'),
        email: data.email || 'michi@example.com'
      }));
    }
  };

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

  if (showSplash) return <Splash onFinish={() => setShowSplash(false)} />;
  if (!languageSelected) return <LanguageSelect onFinish={() => setLanguageSelected(true)} />;
  if (!userRole) return <RoleSelect onSelectRole={handleRoleSelection} onGuest={() => handleRoleSelection('guest')} initialStep={authInitialStep} />;
  if (userRole === 'admin') return <AdminDashboard verifiedCompanies={verifiedCompanies} onToggleVerify={handleToggleVerify} onLogout={() => setUserRole(null)} contractStatus={contractStatus} setContractStatus={setContractStatus} profileData={profileData} />;

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
          />
        );
      case 'jobs':
        return (
          <DriverFeed 
            onJobClick={setSelectedJob} 
            jobs={jobs} 
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
            onLogout={() => setUserRole(null)} 
            contractStatus={contractStatus} 
            setContractStatus={setContractStatus} 
            profileData={profileData}
            userRole={userRole}
            isVoiceActive={isVoiceActive}
            setIsVoiceActive={setIsVoiceActive}
            isVoiceStandby={isVoiceStandby}
            setIsVoiceStandby={setIsVoiceStandby}
            onChangeLanguage={() => setLanguageSelected(false)}
            onUpdateProfile={(newData) => setProfileData(prev => ({ ...prev, ...newData }))}
            onApply={handleApplyJob}
            onApplySchool={handleApplySchool}
            onShoukai={handleShoukai}
            applications={applications}
            schoolApplications={schoolApplications}
            onChangeAppStatus={handleChangeAppStatus}
            notifications={notifications}
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
            jobs={jobs}
            schools={schools}
          />
        );
      default:
        return <DriverFeed onJobClick={setSelectedJob} jobs={jobs} verifiedCompanies={verifiedCompanies} isContractActive={contractStatus === 'active'} onShoukai={handleShoukai} userRole={userRole} onApply={handleApplyJob} applications={applications} />;
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
                <JDMNavigation 
                  onBack={() => setShowJDMNavigation(false)} 
                  showJDMNavigation={showJDMNavigation} 
                  darkMode={darkMode} 
                />
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
            jobs={jobs} 
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
