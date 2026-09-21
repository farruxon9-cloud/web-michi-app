import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Sun, Moon, FileText, Bell } from 'lucide-react';
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
import CompanyHome from './components/CompanyHome';
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
      fullName: t('simulatedFriend', 'Anonim Do\'st'),
      email: 'demo@michi-app.com',
      birthDate: '1995-01-01',
      birthPlace: t('japan', 'Yaponiya'),
      nationality: t('mixed', 'Xorijiy'),
      gender: 'male',
      phone: '+81 00-0000-0000',
      postalCode: '000-0000',
      address: t('demoAddress', 'Tokyo, Shinjuku-ku'),
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
  },
  {
    id: 102,
    jobId: 2,
    company: 'Sagawa Express',
    title: 'Xalqaro yuk tashish (Trailer)',
    logo: 'https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100',
    status: 'reviewed',
    appliedDate: '2026-06-11',
    shoukaiId: null,
    shoukaiAmount: null,
    shoukaiPaid: false,
    applicantInfo: {
      fullName: 'Jaloliddin Tursunov',
      email: 'jaloliddin.t@gmail.com',
      birthDate: '1993-04-15',
      birthPlace: 'Samarqand',
      nationality: 'O\'zbekiston',
      gender: 'male',
      phone: '+81 80-1111-2222',
      postalCode: '220-0012',
      address: 'Kanagawa, Yokohama, Nishi-ku, Minatomirai 2-1',
      addressHistory: [
        { address: 'Kanagawa, Yokohama, Nishi-ku, Minatomirai 2-1', isCurrent: true }
      ],
      educationHistory: [
        { school: 'Samarqand Davlat Universiteti', major: 'Iqtisodiyot', startDate: '2011-09', endDate: '2015-06', isCurrent: false }
      ],
      driverLicenses: ['oogata', 'kenin'],
      techCertificates: ['forklift', 'tamakake'],
      workHistory: [
        { company: 'Yokohama Marine Logistics', position: 'Trailer Driver', startDate: '2020-05', endDate: '2026-03', isCurrent: false }
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
            onClick={() => {
              this.setState({ hasError: false, error: null });
            }} 
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
  const [userRole, setUserRole] = useState(null); // Temporarily disable auto-login
  const [activeTab, setActiveTab] = useState('home');
  const [showJDMNavigation, setShowJDMNavigation] = useState(false);
  const [showAssistHeroShowcase, setShowAssistHeroShowcase] = useState(false);
  const [hasOpenedJDM, setHasOpenedJDM] = useState(false);

  /**
   * Ovoz holatlari:
   * 
   * isVoiceStandby — Ovoz assistenti "kutish" rejimida.
   *   true  → Mikrofon ikonkasi faol (highlight), bosishga tayyor
   *   false → Ovoz assistenti o'chirilgan
   * 
   * isVoiceActive — Ovoz assistenti hozir ochiq va ishlayapti.
   *   true  → VoiceAssistant overlay ko'rinmoqda
   *   false → Overlay yashirilgan
   * 
   * Farq: Standby = tayyor tur, Active = hozir ishlayapti
   */

  // Standby: localStorage'dan o'qiladi (ixtiyoriy funksiya)
  const [isVoiceStandby, setIsVoiceStandby] = useState(() => {
    const saved = localStorage.getItem('michi_voice_standby');
    return saved === 'true'; // Foydalanuvchi yoqib ketganmi?
  });

  // Active: har doim false boshlanadi (overlay yopiq bo'ladi)
  // ← Bu erda localStorage ishlatilmaydi!
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('idle');

  // Standby o'zgarganda localStorage'ga yozamiz
  useEffect(() => {
    localStorage.setItem('michi_voice_standby', isVoiceStandby);
  }, [isVoiceStandby]);

  useEffect(() => {
    if (showJDMNavigation) {
      setHasOpenedJDM(true);
    }
  }, [showJDMNavigation]);

  // Ovozni yoqish — overlay ochiladi + standby faollashadi
  const handleVoiceActivate = () => {
    setIsVoiceStandby(true);  // Standby rejimga qo'yamiz
    setIsVoiceActive(true);   // Overlay ochiladi
  };

  // Ovozni o'chirish/yoqish toggle
  const handleVoiceToggle = () => {
    if (isVoiceActive) {
      // Hozir ochiq → yopamiz
      setIsVoiceActive(false);
    } else if (isVoiceStandby) {
      // Standby'da → ochiladi
      setIsVoiceActive(true);
    } else {
      // Ikkalasi ham o'chiq → standby + active qilamiz
      setIsVoiceStandby(true);
      setIsVoiceActive(true);
    }
  };
  // ==========================================
  // NAVIGATSIYA VA HOLATLARNI BOSHQARISH (LIFTED STATES & UX ENHANCEMENTS)
  // Barcha brauzerlarda va mobil qurilmalarda bir xil, silliq va xatosiz ishlashini ta'minlash maqsadida
  // holatlar (state) ilovaning eng yuqori qismiga ko'tarildi.
  // ==========================================

  // selectedJob: Foydalanuvchi hozir ko'rayotgan ish e'lonining obyekti.
  // Tanlanganida, ilova ustidan JobDetail to'liq ekranli overlay (z-index: 200) bo'lib ochiladi.
  const [selectedJob, setSelectedJob] = useState(null);

  // selectedSchool: Foydalanuvchi tanlagan avtomaktab obyekti.
  // DrivingAcademy komponentiga uzatilib, maktab tafsilotlarini ochish uchun qo'llaniladi.
  const [selectedSchool, setSelectedSchool] = useState(null);

  // profileActivePage: Profil bo'limidagi faol sub-sahifa (masalan: 'main', 'saved_items', 'settings').
  // Brauzerda tablar almashganda (masalan home tabiga o'tib qaytganda) profil reset bo'lmasligi uchun bu holat App.jsx darajasida saqlanadi.
  const [profileActivePage, setProfileActivePage] = useState('main');
  const [profileActivePageSource, setProfileActivePageSource] = useState('profile');
  const [profileScrollToTopTrigger, setProfileScrollToTopTrigger] = useState(0);

  // backTab: Profilning saqlanganlaridan e'longa kirilganda, ortga qaytish manzilini eslab qoluvchi o'zgaruvchi.
  const [backTab, setBackTab] = useState(null);

  // Guest redirection states
  const [pendingApply, setPendingApply] = useState(null);
  const [authInitialStep, setAuthInitialStep] = useState('role');
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

  // Referral Modal State
  const [referralModal, setReferralModal] = useState({
    isOpen: false,
    item: null,
    type: null,
    resolve: null
  });

  const openReferralModal = (item, type) => {
    return new Promise((resolve) => {
      setReferralModal({ isOpen: true, item, type, resolve });
    });
  };

  // Music Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef(null);

  // Status Bar Clock State
  const [clockTime, setClockTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lifted Search and Filter States (For AI voice query control)
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobActiveSegment, setJobActiveSegment] = useState('all');
  const [academySearchQuery, setAcademySearchQuery] = useState('');

  // Advanced Filter States (For premium filter drawer and AI control)
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [selectedLangLevel, setSelectedLangLevel] = useState('all');
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [minSalary, setMinSalary] = useState(0);
  const [selectedPrefecture, setSelectedPrefecture] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [stationQuery, setStationQuery] = useState('');
  const [onlyNearStation, setOnlyNearStation] = useState(false);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const nextTrack = () => {
    setCurrentTrackIndex(prev => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex(prev => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const [contractStatus, setContractStatus] = useState('none');
  const [verifiedCompanies, setVerifiedCompanies] = useState(['Sagawa Express', 'Yamato Transport']);

  const handleToggleVerify = (companyId) => {
    setVerifiedCompanies(prev => 
      prev.includes(companyId) ? prev.filter(id => id !== companyId) : [...prev, companyId]
    );
  };

  // handleSchoolClick: Saqlangan avtomaktab bosilganda ishlaydi.
  // Foydalanuvchini Avtomaktab tabiga o'tkazadi va maktab batafsil sahifasini ochadi.
  const handleSchoolClick = (school) => {
    setBackTab('profile'); // Kelgan manzilini 'profile' deb belgilaymiz
    setActiveTab('academy'); // Tabni avtomaktabga o'zgartiramiz
    setSelectedSchool(school); // Maktabni tanlangan qilamiz
  };

  // handleSchoolBack: Avtomaktab tafsilotlaridan chiqqanda ishlaydi.
  // Maktab tanlovini bekor qiladi va agar backTab o'rnatilgan bo'lsa, foydalanuvchini o'sha tabga qaytaradi.
  const handleSchoolBack = () => {
    setSelectedSchool(null);
    if (backTab) {
      setActiveTab(backTab);
      setBackTab(null);
    }
  };

  // handleNavigateToInternationalJobs: Dashboarddagi Xalqaro bento card bosilganda ishlaydi.
  const handleNavigateToInternationalJobs = () => {
    setSelectedBenefits(['international']);
    setSelectedLicenses([]);
    setSelectedLangLevel('all');
    setJobSearchQuery('');
    setJobActiveSegment('all');
    setMinSalary(0);
    setSelectedPrefecture('all');
    setActiveTab('jobs');
  };

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('michi_darkmode');
    return saved ? saved === 'true' : false;
  });

  // Sound settings
  const [soundSettings, setSoundSettings] = useState(() => {
    const saved = localStorage.getItem('michi_sound');
    return saved ? JSON.parse(saved) : { sound: true, vibration: true };
  });

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark-mode', darkMode);
    document.documentElement.classList.toggle('light-mode', !darkMode);
    localStorage.setItem('michi_darkmode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('michi_sound', JSON.stringify(soundSettings));
  }, [soundSettings]);

  // Show profile badges preference
  const [showProfileBadges, setShowProfileBadges] = useState(() => {
    const saved = localStorage.getItem('michi_show_badges');
    return saved ? saved === 'true' : true;
  });

  // Notification sound preference
  const [notificationSound, setNotificationSound] = useState(() => {
    const saved = localStorage.getItem('michi_notif_sound');
    return saved ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('michi_show_badges', showProfileBadges);
  }, [showProfileBadges]);

  useEffect(() => {
    localStorage.setItem('michi_notif_sound', notificationSound);
  }, [notificationSound]);

  // Profile Data
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
    address: '',
    education: '',
    companyType: '',
    companyAddress: '',
    employeeCount: '',
    contactPerson: '',
    companyPhone: '',
    companyDesc: '',
    furigana: '',
    phone: '',
    postalCode: '',
    gender: 'male',
    motivation: '',
    selfPR: '',
    hobbies: '',
    personalRequests: '貴社規定に従います。',
    jlptStatus: null
  });

  // Disabled auto-save logic for role and profile
  useEffect(() => {
    // We intentionally don't save to localStorage anymore
    // so the user can test the registration flow on every reload.
  }, [userRole, profileData]);



  // Control audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log("Audio play blocked by browser autoplay policy:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Global Jobs & Driving Schools State
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [schools, setSchools] = useState(MOCK_SCHOOLS);

  // Applications state
  const [applications, setApplications] = useState([]);

  // Company Employees state (for HR)
  const [companyEmployees, setCompanyEmployees] = useState([]);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  
  // Edit mode state
  const [jobToEdit, setJobToEdit] = useState(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const isProfileComplete = useCallback(() => {
    // If it's the admin test profile, it's always complete (bypass check)
    if (profileData && (profileData.email === 'admin@driver.jp' || profileData.email === 'admin@sagawa.jp')) {
      return true;
    }
    
    // Required fields: fullName, birthDate, phone, address (or addressHistory), education (or educationHistory)
    const hasFullName = !!(profileData.fullName && profileData.fullName.trim() !== '' && profileData.fullName !== 'Mehmon');
    const hasBirthDate = !!profileData.birthDate;
    const hasPhone = !!(profileData.phone && profileData.phone.trim() !== '');
    const hasAddress = !!((profileData.address && profileData.address.trim() !== '') || (profileData.addressHistory && profileData.addressHistory.length > 0));
    const hasEducation = !!((profileData.education && profileData.education.trim() !== '') || (profileData.educationHistory && profileData.educationHistory.length > 0));
    
    return !!(hasFullName && hasBirthDate && hasPhone && hasAddress && hasEducation);
  }, [profileData]);

  // Apply for a job
  const handleApplyJob = useCallback(async (job) => {
    if (userRole === 'guest') {
      setPendingApply({ type: 'job', item: job });
      setAuthInitialStep('register');
      setUserRole(null);
      return;
    }
    
    // Check if resume is complete
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
      status: 'submitted', // initial state is now submitted
      appliedDate: new Date().toLocaleDateString(),
      shoukaiId: refId || null,
      shoukaiAmount: job.shoukaiAmount || null,
      shoukaiPaid: false,
      applicantInfo: { ...profileData }
    };
    setApplications(prev => [...prev, newApp]);
  }, [userRole, applications, profileData, isProfileComplete]);

  // Simulate status change (for demo - single-click idempotent)
  const handleChangeAppStatus = (appId, newStatus) => {
    const targetApp = applications.find(a => a.id === appId);
    if (!targetApp || targetApp.status === newStatus) {
      return; // Already in this status! Prevent duplicate notification bell increment.
    }

    setApplications(prev => prev.map(a => 
      a.id === appId ? { ...a, status: newStatus } : a
    ));

    if (newStatus === 'accepted' || newStatus === 'interview' || newStatus === 'reviewed' || newStatus === 'rejected') {
      const notif = {
        id: Date.now(),
        type: newStatus,
        company: targetApp.company,
        title: targetApp.title,
        date: new Date().toLocaleString(),
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);

      if (newStatus === 'accepted') {
        // Add to user work history if not already present
        setProfileData(prev => {
          const updatedHistory = [...(prev.workHistory || [])];
          if (updatedHistory.some(w => w.company === targetApp.company && w.position === targetApp.title)) {
            return prev;
          }
          if (updatedHistory.length >= 3) {
            updatedHistory.shift();
          }
          updatedHistory.push({ company: targetApp.company, position: targetApp.title, years: 'Hozirgi vaqtda' });
          return { ...prev, workHistory: updatedHistory };
        });

        // Auto-add to company HR employees if not already present
        setCompanyEmployees(prev => {
          const empName = targetApp.applicantInfo?.fullName || profileData.fullName;
          const empPhone = targetApp.applicantInfo?.phone || profileData.phone || '+81 90-8888-9999';
          const empRole = targetApp.title.includes('Mahalliy') ? 'ルート配送ドライバー (地場デリバリー)' : targetApp.title;
          const empId = targetApp.shoukaiId || `EMP-${targetApp.id}`;
          if (prev.some(emp => emp.name === empName && emp.role === empRole)) {
            return prev;
          }
          return [
            ...prev, 
            { id: Date.now(), name: empName, phone: empPhone, role: empRole, verified: true, michiId: empId }
          ];
        });
      }
    }
  };

  // Add employee manually via HR
  const handleAddEmployee = (empData) => {
    setCompanyEmployees(prev => [...prev, { id: Date.now(), ...empData }]);
  };

  const handleAcceptEmployeeRequest = (michiId, company) => {
    // 1. Verify in company employees list
    setCompanyEmployees(prev => prev.map(emp => 
      emp.michiId === michiId ? { ...emp, verified: true, name: profileData.fullName, phone: profileData.phone || '+81 000-0000' } : emp
    ));
    // 2. Add to user's work history
    setProfileData(prev => {
      const newWork = { company: company, position: 'Xodim', years: 'Hozirgi vaqtda' };
      const updatedHistory = [...(prev.workHistory || [])];
      if (updatedHistory.length >= 3) {
        updatedHistory.shift();
      }
      updatedHistory.push(newWork);
      return { ...prev, workHistory: updatedHistory };
    });
  };

  // Mark notifications as read
  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    ));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Academy applications
  const [schoolApplications, setSchoolApplications] = useState([]);

  const handleApplySchool = useCallback(async (school) => {
    if (userRole === 'guest') {
      setPendingApply({ type: 'school', item: school });
      setAuthInitialStep('register');
      setUserRole(null);
      return;
    }

    // Check if resume is complete
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
  }, [userRole, schoolApplications, profileData, isProfileComplete]);

  // Re-apply if a guest registers/logs in
  useEffect(() => {
    if (userRole === 'driver' && pendingApply) {
      if (pendingApply.type === 'job') {
        handleApplyJob(pendingApply.item);
      } else if (pendingApply.type === 'school') {
        handleApplySchool(pendingApply.item);
      }
      setPendingApply(null);
      setAuthInitialStep('role');
    }
  }, [userRole, pendingApply, handleApplyJob, handleApplySchool]);

  const handleShoukaiPaid = (appId) => {
    let isJob = applications.some(a => a.id === appId);
    
    if (isJob) {
      setApplications(prev => prev.map(a => 
        a.id === appId ? { ...a, shoukaiPaid: true } : a
      ));
      const app = applications.find(a => a.id === appId);
      if (app && app.shoukaiId) {
        const notif = {
          id: Date.now(),
          type: 'shoukai_paid',
          company: app.company,
          title: app.shoukaiAmount || '¥10,000',
          date: new Date().toLocaleString(),
          read: false,
        };
        setNotifications(prev => [notif, ...prev]);
      }
    } else {
      setSchoolApplications(prev => prev.map(a => 
        a.id === appId ? { ...a, paid: true } : a
      ));
      const app = schoolApplications.find(a => a.id === appId);
      if (app && app.shoukaiId) {
        const notif = {
          id: Date.now(),
          type: 'shoukai_paid',
          company: app.schoolName,
          title: app.shoukaiAmount || '¥10,000',
          date: new Date().toLocaleString(),
          read: false,
        };
        setNotifications(prev => [notif, ...prev]);
      }
    }
  };

  const handleRoleSelection = (role, data) => {
    setUserRole(role);
    if (role === 'company') {
      setApplications(mockIncomingApplications);
    }
    if (data) {
      setProfileData(prev => ({
        ...prev,
        ...data,
        fullName: data.fullName || t('roleGuest'),
        email: data.email || 'michi@example.com'
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        fullName: role === 'company' ? 'Sagawa Express' : t('roleGuest'),
        email: 'michi@example.com'
      }));
    }
  };

  const handleChangeLanguage = () => {
    setLanguageSelected(false);
  };

  const handleUpdateProfile = (newData) => {
    setProfileData(prev => ({ ...prev, ...newData }));
  };

  const handleTriggerRegister = () => {
    setUserRole(null);
    setAuthInitialStep('register');
  };



  // ==========================================
  // VIRAL SHOUKAI REFERRAL ALGORITHM & GROW LOOP
  // ==========================================
  // [UZ] Ushbu algoritm foydalanuvchilar o'rtasida e'lonlar va ilovani virusli tarqatishni simulyatsiya qiladi.
  // Har safar foydalanuvchi "Shoukai" tugmasini bosganida, shaxsiy havola nusxalanadi va tizimda do'stlarining
  // ilovani yuklab olib, ushbu e'longa ariza yuborgani (Friend Simulation) zudlik bilan simulyatsiya qilinadi.
  // Bu foydalanuvchining shaxsiy arizasini yoki faolligini cheklamaydi va "Mening Shoukai'larim" sahifasida aks etadi.
  //
  // [JA] 紹介（Shoukai）ウイルス性拡散アルゴリズム：
  // ユーザーが「紹介」ボタンを押すと、パーソナライズされた紹介リンクがコピーされ、
  // 友人がアプリをダウンロードして該当の求人または自動車学校に応募したシミュレーション（Friend Simulation）が即座に実行されます。
  // これにより、紹介報酬の追跡と、友人紹介によるアプリ認知拡大・就職支援のビジネスロジックが美しく表現されます。
  //
  // [EN] Viral Shoukai Referral Algorithm & Growth Engine:
  // When a user shares via Shoukai, it copies a unique link and immediately triggers a simulated referral application
  // representing a friend downloading the app and applying. This handles the social network effect, satisfies job seekers'
  // demand for work, and visualizes pending/paid referral rewards under "My Shoukai" in the profile.
  const handleShoukai = (item) => {
    // 1. Havolani nusxalash simulyatsiyasi
    const isJob = !!((item.shoukaiAmount || item.shoukai) && (item.title || item.name));
    const isActuallyJob = !!item.title;
    
    const amount = isActuallyJob ? (item.shoukaiAmount || item.shoukai || '¥50,000') : (item.shoukai || '¥10,000');
    const title = isActuallyJob ? item.title : item.name;

    const link = `michi-app.com/${isActuallyJob ? 'job' : 'school'}/${item.id}?ref=${profileData.userId}`;
    
    // Multi-language Alert messages based on active locale
    const alertMsg = i18n.language === 'ja'
      ? `紹介リンクをコピーしました！\n\n${link}\n\n友達にシェアして紹介報酬を獲得しましょう！`
      : i18n.language === 'en'
      ? `Referral link copied successfully:\n\n${link}\n\nShare with friends to earn Shoukai rewards!`
      : `Shoukai havolasi nusxalandi:\n\n${link}\n\nDo'stlaringiz bilan ulashing va mukofot oling!`;
      
    setTimeout(() => {
      alert(alertMsg);
    }, 150);

    // 2. Mantiqiy algoritm: Do'stingiz ushbu havola orqali yuklab ariza yuborganligini simulyatsiya qilish.
    if (isActuallyJob) {
      // Dublikat bo'lmasligi uchun tekshiramiz
      const exists = applications.some(a => a.jobId === item.id && a.shoukaiId === profileData.userId && a.isSimulatedReferral);
      if (!exists) {
        const newApp = {
          id: Date.now(),
          jobId: item.id,
          company: item.company,
          title: item.title,
          logo: item.logo,
          status: 'submitted',
          appliedDate: new Date().toLocaleDateString(),
          shoukaiId: profileData.userId, // Referrer ID bu hozirgi foydalanuvchining ID raqami
          shoukaiAmount: amount,
          shoukaiPaid: false,
          friendName: 'Do\'stingiz (Simulyatsiya)',
          isSimulatedReferral: true, // Do'st arizasini foydalanuvchining shaxsiy arizasidan farqlash uchun
          applicantInfo: {
            fullName: t('simulatedFriend', 'Anonim Do\'st'),
            email: 'demo@michi-app.com',
            birthDate: '1995-01-01',
            birthPlace: t('japan', 'Yaponiya'),
            nationality: t('mixed', 'Xorijiy'),
            gender: 'male',
            phone: '+81 00-0000-0000',
            postalCode: '000-0000',
            address: t('demoAddress', 'Tokyo, Shinjuku-ku'),
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
        };
        setApplications(prev => [...prev, newApp]);
      }
    } else {
      // Avtomaktablar uchun shoukai simulyatsiyasi
      const exists = schoolApplications.some(a => a.schoolId === item.id && a.shoukaiId === profileData.userId && a.isSimulatedReferral);
      if (!exists) {
        const newApp = {
          id: Date.now(),
          schoolId: item.id,
          schoolName: item.name,
          image: item.image,
          appliedDate: new Date().toLocaleDateString(),
          shoukaiId: profileData.userId, // Referrer ID bu hozirgi foydalanuvchining ID raqami
          shoukaiAmount: item.shoukai || '¥10,000',
          paid: false,
          friendName: 'Do\'stingiz (Simulyatsiya)',
          isSimulatedReferral: true, // Do'st arizasini foydalanuvchining shaxsiy arizasidan farqlash uchun
          applicantInfo: {
            fullName: t('simulatedFriend', 'Anonim Do\'st'),
            email: 'demo@michi-app.com',
            birthDate: '1995-01-01',
            birthPlace: t('japan', 'Yaponiya'),
            nationality: t('mixed', 'Xorijiy'),
            gender: 'male',
            phone: '+81 00-0000-0000',
            postalCode: '000-0000',
            address: t('demoAddress', 'Tokyo, Shinjuku-ku'),
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
        };
        setSchoolApplications(prev => [...prev, newApp]);
      }
    }
  };

  const handleToggleSave = (item, type) => {
    if (userRole === 'company' || userRole === 'school' || userRole === 'admin') {
      alert("Faqat haydovchilar e'lonlarni saqlashi mumkin.");
      return;
    }
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

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  if (!languageSelected) {
    return <LanguageSelect onFinish={() => setLanguageSelected(true)} />;
  }

  if (!userRole) {
    return (
      <RoleSelect 
        onSelectRole={handleRoleSelection}
        onGuest={() => handleRoleSelection('guest')}
        initialStep={authInitialStep}
      />
    );
  }

  if (userRole === 'admin') {
    return <AdminDashboard verifiedCompanies={verifiedCompanies} onToggleVerify={handleToggleVerify} onLogout={() => setUserRole(null)} contractStatus={contractStatus} setContractStatus={setContractStatus} profileData={profileData} />;
  }

  const getUserNameWithHonorific = () => {
    return profileData.fullName;
  };

  const getAvatarSrc = () => {
    if (profileData.avatar) return profileData.avatar;
    const name = encodeURIComponent(profileData.fullName || 'User');
    const bg = userRole === 'company' ? 'AF52DE' : userRole === 'school' ? '34C759' : userRole === 'driver' ? '0A84FF' : '8E8E93';
    return `https://ui-avatars.com/api/?name=${name}&background=${bg}&color=fff`;
  };

  const musicPlayer = {
    isPlaying,
    currentTrack: TRACKS[currentTrackIndex],
    togglePlay,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    nextTrack,
    prevTrack,
    currentTime,
    duration,
    volume,
    setVolume,
    seek: (time) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            profileData={profileData} 
            musicPlayer={musicPlayer}
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
            onEditJob={(job) => {
              setSelectedJob(null);
              setJobToEdit(job);
              setProfileActivePage('my_ads');
              setActiveTab('profile');
            }}
            searchQuery={jobSearchQuery}
            setSearchQuery={setJobSearchQuery}
            activeSegment={jobActiveSegment}
            setActiveSegment={setJobActiveSegment}
            selectedLicenses={selectedLicenses}
            setSelectedLicenses={setSelectedLicenses}
            selectedLangLevel={selectedLangLevel}
            setSelectedLangLevel={setSelectedLangLevel}
            selectedBenefits={selectedBenefits}
            setSelectedBenefits={setSelectedBenefits}
            minSalary={minSalary}
            setMinSalary={setMinSalary}
            selectedPrefecture={selectedPrefecture}
            setSelectedPrefecture={setSelectedPrefecture}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            stationQuery={stationQuery}
            setStationQuery={setStationQuery}
            onlyNearStation={onlyNearStation}
            setOnlyNearStation={setOnlyNearStation}
          />
        );
      case 'academy':
        return (
          <DrivingAcademy 
            isContractActive={contractStatus === 'active'} 
            onApplySchool={handleApplySchool}
            schoolApplications={schoolApplications}
            onShoukaiPaid={handleShoukaiPaid}
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
            onEditJob={(school) => {
              setSelectedSchool(null);
              setJobToEdit(school);
              setProfileActivePage('my_ads');
              setActiveTab('profile');
            }}
            searchQuery={academySearchQuery}
            setSearchQuery={setAcademySearchQuery}
          />
        );
      case 'service':
        return (
          <ServiceComingSoon 
            onOpenAssistShowcase={() => {
              setProfileActivePage('assist_showcase');
              setActiveTab('profile');
            }}
            onNavigate={setActiveTab}
          />
        );
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
            onChangeLanguage={handleChangeLanguage}
            onUpdateProfile={handleUpdateProfile}
            onApply={handleApplyJob}
            onApplySchool={handleApplySchool}
            onShoukai={handleShoukai}
            applications={applications}
            schoolApplications={schoolApplications}
            onChangeAppStatus={handleChangeAppStatus}
            onShoukaiPaid={handleShoukaiPaid}
            notifications={notifications}
            onMarkRead={markNotificationRead}
            onMarkAllRead={markAllNotificationsRead}
            onDeleteNotif={deleteNotification}
            onClearAllNotifs={clearAllNotifications}
            unreadCount={unreadCount}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            soundSettings={soundSettings}
            setSoundSettings={setSoundSettings}
            companyEmployees={companyEmployees}
            onAddEmployee={handleAddEmployee}
            onAcceptEmployeeRequest={handleAcceptEmployeeRequest}
            setNotifications={setNotifications}
            onNavigate={setActiveTab}
            activePage={profileActivePage}
            setActivePage={setProfileActivePage}
            profileActivePageSource={profileActivePageSource}
            setProfileActivePageSource={setProfileActivePageSource}
            scrollToTopTrigger={profileScrollToTopTrigger}
            onJobClick={setSelectedJob}
            onSchoolClick={handleSchoolClick}
            showProfileBadges={showProfileBadges}
            setShowProfileBadges={setShowProfileBadges}
            notificationSound={notificationSound}
            setNotificationSound={setNotificationSound}
            jobs={jobs}
            schools={schools}
            setJobs={setJobs}
            setSchools={setSchools}
            jobToEdit={jobToEdit}
            setJobToEdit={setJobToEdit}
            onTriggerRegister={handleTriggerRegister}
          />
        );
      default:
        return <DriverFeed onJobClick={setSelectedJob} jobs={jobs} verifiedCompanies={verifiedCompanies} isContractActive={contractStatus === 'active'} onShoukai={handleShoukai} userRole={userRole} onApply={handleApplyJob} applications={applications} />;
    }
  };

  return (
    <ErrorBoundary>
      <AppProvider value={{
        // Foydalanuvchi
        userRole, setUserRole,
        profileData, handleUpdateProfile,
        
        // Ilova holati
        darkMode, setDarkMode,
        activeTab, setActiveTab,
        
        // Bildirishnomalar
        notifications, unreadCount,
        markNotificationRead, markAllNotificationsRead,
        
        // Ma'lumotlar
        jobs, setJobs,
        schools, setSchools,
        applications, setApplications,
        
        // Funksiyalar
        handleApplyJob, handleApplySchool,
        handleShoukai, handleToggleSave,
      }}>
        <div className="app-layout">
      <div className="glass-blob blob-1"></div>
      <div className="glass-blob blob-2"></div>
      <div className="glass-blob blob-3"></div>

      {/* Native Mobile iOS Status Bar */}
      <div className="mobile-status-bar">
        <span className="status-time">{clockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        <div className="status-notch">
          <div className="notch-camera"></div>
        </div>
        <div className="status-icons">
          <span className="status-signal">5G</span>
          <span className="status-battery">
            <span className="battery-level"></span>
          </span>
        </div>
      </div>

      <header className="global-header">
        {/* Left Side: Clickable MICHI Logo (redirects to Home) */}
        <div 
          className="header-logo-left"
          onClick={() => setActiveTab('home')}
          title={i18n.language === 'ja' ? 'ホーム' : i18n.language === 'en' ? 'Home' : 'Bosh sahifa'}
        >
          <div className="logo-kanji">道</div>
          <span className="logo-text">MICHI</span>
        </div>

        {/* Center: Mathematically Centered Theme Toggle Switch (sliding track) */}
        <div className="header-theme-toggle-centered">
          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode(prev => !prev)}
            aria-label="Toggle theme"
            title={darkMode ? (i18n.language === 'ja' ? 'ライトモード' : i18n.language === 'en' ? 'Light Mode' : 'Kunduzgi rejim') : (i18n.language === 'ja' ? 'ダークモード' : i18n.language === 'en' ? 'Dark Mode' : 'Tungi rejim')}
          >
            <div className={`theme-toggle-track ${darkMode ? 'dark' : 'light'}`}>
              <div className="theme-toggle-thumb">
                {darkMode ? <Moon size={11} strokeWidth={2.5} /> : <Sun size={11} strokeWidth={2.5} />}
              </div>
            </div>
          </button>
        </div>

        {/* Right Side: Standalone Robot Avatar (Separated AI widget) */}
        <div className="header-robot-right">
          <RobotAvatar 
            isVoiceActive={isVoiceActive} 
            voiceStatus={voiceStatus} 
            onClick={handleVoiceToggle} 
          />
        </div>
      </header>

      <main className="main-content" style={{ zIndex: 10 }}>
        <ChunkErrorBoundary>
          {renderTabContent()}
        </ChunkErrorBoundary>
      </main>

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
            onEditJob={(job) => {
              setSelectedJob(null);
              setJobToEdit(job);
              setProfileActivePage('my_ads');
              setActiveTab('profile');
            }}
          />
        </ChunkErrorBoundary>
      )}

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


      {!(activeTab === 'profile' && profileActivePage === 'resume_builder') && (
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={(tab, options = {}) => {
            // Close JDM Navigation when switching tabs
            setShowJDMNavigation(false);
            
            // Agar foydalanuvchi profile tabini BEVOSITA BottomNav pastki menyusidan bossa, profilning asosiy oynasiga qaytaradi va eng yuqoridan scroll qiladi
            if (tab === 'profile' && options.fromBottomNav) {
              setProfileActivePage('main');
              setProfileScrollToTopTrigger(prev => prev + 1);
            }
            
            setSelectedJob(null);
            setSelectedSchool(null);
            setBackTab(null);
            if (tab === 'jobs') {
              setSelectedBenefits([]);
              setSelectedLicenses([]);
              setSelectedLangLevel('all');
              setJobSearchQuery('');
              setJobActiveSegment('all');
              setMinSalary(0);
              setSelectedPrefecture('all');
            }
            setActiveTab(tab);
          }}
          unreadCount={showProfileBadges ? unreadCount : 0}
          userRole={userRole}
          isVoiceStandby={isVoiceStandby}
          isVoiceActive={isVoiceActive}
          voiceStatus={voiceStatus}
        />
      )}

      <VoiceAssistant 
        isActive={isVoiceActive} 
        onClose={() => setIsVoiceActive(false)} 
        onStartVoice={() => setIsVoiceActive(true)}
        isVoiceStandby={isVoiceStandby}
        setIsVoiceStandby={setIsVoiceStandby}
        setActiveTab={setActiveTab} 
        musicPlayer={musicPlayer} 
        onStatusChange={setVoiceStatus}
        activeTab={activeTab}
        jobs={jobs}
        schools={schools}
        profileData={profileData}
        applications={applications}
        selectedJob={selectedJob}
        selectedSchool={selectedSchool}
        setSelectedJob={setSelectedJob}
        setSelectedSchool={setSelectedSchool}
        setJobSearchQuery={setJobSearchQuery}
        setJobActiveSegment={setJobActiveSegment}
        setAcademySearchQuery={setAcademySearchQuery}
        handleApplyJob={handleApplyJob}
        handleApplySchool={handleApplySchool}
        handleShoukai={handleShoukai}
        userRole={userRole}
        selectedLicenses={selectedLicenses}
        setSelectedLicenses={setSelectedLicenses}
        selectedLangLevel={selectedLangLevel}
        setSelectedLangLevel={setSelectedLangLevel}
        selectedBenefits={selectedBenefits}
        setSelectedBenefits={setSelectedBenefits}
        minSalary={minSalary}
        setMinSalary={setMinSalary}
        selectedPrefecture={selectedPrefecture}
        setSelectedPrefecture={setSelectedPrefecture}
        profileActivePage={profileActivePage}
        setProfileActivePage={setProfileActivePage}
        setApplications={setApplications}
        toggleDarkMode={() => setDarkMode(prev => !prev)}
      />

      <audio 
        ref={audioRef}
        src={TRACKS[currentTrackIndex].url}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={nextTrack}
      />

      {showCompleteProfileModal && (
        <div className="complete-profile-modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div className="glass squircle slide-up" style={{
            maxWidth: '350px',
            width: '100%',
            padding: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(10, 132, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A84FF'
            }}>
              <FileText size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-main)' }}>
                {t('completeResumeModalTitle', 'Rezyumeni to\'ldiring')}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {t('completeResumeModalDesc', 'Ushbu vakansiyaga ariza topshirish uchun oldindan rezyume ma\'lumotlaringizni to\'liq to\'ldirishingiz lozim.')}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px', marginTop: '8px' }}>
              <button 
                className="btn-primary squircle"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'white'
                }}
                onClick={() => {
                  setShowCompleteProfileModal(false);
                  setProfileActivePage('resume_builder');
                  setProfileActivePageSource('profile');
                  setActiveTab('profile');
                }}
              >
                {t('completeResumeBtn', 'Rezyume to\'ldirish')}
              </button>
              <button 
                className="btn-secondary squircle"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-main)',
                  borderRadius: '12px'
                }}
                onClick={() => setShowCompleteProfileModal(false)}
              >
                {t('cancelEdit', 'Bekor qilish')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Referral Modal */}
      <ReferralModal
        isOpen={referralModal.isOpen}
        jobTitle={referralModal.item?.title || referralModal.item?.name || referralModal.item?.schoolName}
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
