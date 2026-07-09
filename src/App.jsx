import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Sun, Moon, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Splash from './components/Splash';
import LanguageSelect from './components/LanguageSelect';
import RoleSelect from './components/RoleSelect';
import BottomNav from './components/BottomNav';
import './App.css';
import { MOCK_JOBS } from './components/DriverFeed';
import { MOCK_SCHOOLS } from './components/DrivingAcademy';
import VoiceAssistant from './components/VoiceAssistant';

// Lazy loading heavy components for faster initial load
const Dashboard = lazy(() => import('./components/Dashboard'));
const DriverFeed = lazy(() => import('./components/DriverFeed'));
const JobDetail = lazy(() => import('./components/JobDetail'));
const DrivingAcademy = lazy(() => import('./components/DrivingAcademy'));
const ServiceComingSoon = lazy(() => import('./components/ServiceComingSoon'));
const Profile = lazy(() => import('./components/Profile'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const CompanyHome = lazy(() => import('./components/CompanyHome'));

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
    title: 'Mahalliy yetkazib berish (Local Delivery)',
    logo: 'https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100',
    status: 'submitted',
    appliedDate: '2026-06-10',
    shoukaiId: '#Michi-REF1',
    shoukaiAmount: '¥10,000',
    shoukaiPaid: false,
    applicantInfo: {
      fullName: 'Farrux Alimov',
      email: 'farrux.alimov@gmail.com',
      birthDate: '1996-08-24',
      birthPlace: 'Toshkent',
      nationality: 'O\'zbekiston',
      gender: 'male',
      phone: '+81 90-8888-9999',
      postalCode: '160-0022',
      address: 'Tokyo, Shinjuku-ku, Shinjuku 3-1-1',
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
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ChunkErrorBoundary caught an error:", error, errorInfo);
    // If it's a chunk load error or dynamic import failure, reload the page
    if (error.name === 'ChunkLoadError' || error.message.includes('Failed to fetch dynamically imported module') || error.message.includes('dynamically imported module') || error.message.includes('fetch')) {
      if (!sessionStorage.getItem('michi_chunk_reloaded')) {
        sessionStorage.setItem('michi_chunk_reloaded', 'true');
        window.location.reload(true);
      }
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93' }}>
          Yangi versiya mavjud. Iltimos sahifani yangilang (Ctrl+F5 yoki tepadan pastga torting).
          <br/><br/>
          <button onClick={() => window.location.reload(true)} style={{ padding: '10px 20px', borderRadius: '20px', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
            Sahifani Yangilash
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
  const [isVoiceStandby, setIsVoiceStandby] = useState(() => {
    const saved = localStorage.getItem('michi_voice_standby');
    return saved === 'true';
  });
  const [isVoiceActive, setIsVoiceActive] = useState(() => {
    const saved = localStorage.getItem('michi_voice_standby');
    return saved === 'true';
  });
  const [voiceStatus, setVoiceStatus] = useState('idle');

  useEffect(() => {
    localStorage.setItem('michi_voice_standby', isVoiceStandby);
  }, [isVoiceStandby]);

  const handleVoiceActivate = () => {
    setIsVoiceActive(true);
    if (!isVoiceStandby) {
      setIsVoiceStandby(true);
    }
  };

  const handleVoiceToggle = () => {
    if (isVoiceStandby) {
      setIsVoiceStandby(false);
      setIsVoiceActive(false);
    } else {
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

  // backTab: Profilning saqlanganlaridan e'longa kirilganda, ortga qaytish manzilini eslab qoluvchi o'zgaruvchi.
  const [backTab, setBackTab] = useState(null);

  // Guest redirection states
  const [pendingApply, setPendingApply] = useState(null);
  const [authInitialStep, setAuthInitialStep] = useState('role');
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);

  // Music Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef(null);

  // Lifted Search and Filter States (For AI voice query control)
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobActiveSegment, setJobActiveSegment] = useState('all');
  const [academySearchQuery, setAcademySearchQuery] = useState('');

  // Advanced Filter States (For premium filter drawer and AI control)
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [selectedLangLevel, setSelectedLangLevel] = useState('all');
  const [selectedBenefits, setSelectedBenefits] = useState([]);
  const [minSalary, setMinSalary] = useState(0);

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
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('michi_profile_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure necessary default fields exist
        return {
          userId: '#Michi-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
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
          ...parsed
        };
      } catch (e) {
        console.error("Failed to parse saved profile data:", e);
      }
    }
    return {
      userId: '#Michi-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
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
      // Japanese Resume (Rirekisho) specific fields
      furigana: '',
      phone: '',
      postalCode: '',
      gender: 'male',
      motivation: '',
      selfPR: '',
      hobbies: '',
      personalRequests: '貴社規定に従います。'
    };
  });

  // Disabled auto-save logic for role and profile
  useEffect(() => {
    // We intentionally don't save to localStorage anymore
    // so the user can test the registration flow on every reload.
  }, [userRole, profileData]);

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
  }, [userRole, pendingApply]);

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

  // Apply for a job
  const handleApplyJob = (job) => {
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

    const refId = prompt(t('referralPrompt', "Havola orqali kirdingizmi? Unday bo'lsa tavsiya qilgan odamning ID raqamini kiriting (Simulyatsiya uchun):\nMasalan: #Michi-A1B2"));

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
  };

  // Simulate status change (for demo)
  const handleChangeAppStatus = (appId, newStatus) => {
    setApplications(prev => prev.map(a => 
      a.id === appId ? { ...a, status: newStatus } : a
    ));

    const app = applications.find(a => a.id === appId);
    if (app && (newStatus === 'accepted' || newStatus === 'interview' || newStatus === 'reviewed' || newStatus === 'rejected')) {
      const notif = {
        id: Date.now(),
        type: newStatus,
        company: app.company,
        title: app.title,
        date: new Date().toLocaleString(),
        read: false,
      };
      setNotifications(prev => [notif, ...prev]);

      if (newStatus === 'accepted') {
        // Add to user work history
        setProfileData(prev => {
          const newWork = { company: app.company, position: app.title, years: 'Hozirgi vaqtda' };
          const updatedHistory = [...(prev.workHistory || [])];
          if (updatedHistory.length >= 3) {
            updatedHistory.shift(); // Remove oldest
          }
          updatedHistory.push(newWork);
          return { ...prev, workHistory: updatedHistory };
        });

        // Auto-add to company HR employees as verified
        setCompanyEmployees(prev => [
          ...prev, 
          { id: Date.now(), name: profileData.fullName, phone: profileData.phone || '+81 000-0000', role: app.title, verified: true, michiId: profileData.userId }
        ]);
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

  // Academy applications
  const [schoolApplications, setSchoolApplications] = useState([]);

  const handleApplySchool = (school) => {
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

    const refId = prompt(t('referralPrompt', "Havola orqali kirdingizmi? Unday bo'lsa tavsiya qilgan odamning ID raqamini kiriting (Simulyatsiya uchun):\nMasalan: #Michi-A1B2"));

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
  };

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
    setProfileData(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('michi_profile_data', JSON.stringify(updated));
      return updated;
    });
  };

  const handleTriggerRegister = () => {
    setUserRole(null);
    setAuthInitialStep('register');
  };

  const isProfileComplete = () => {
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
            fullName: 'Farrux Alimov',
            email: 'farrux.alimov@gmail.com',
            birthDate: '1996-08-24',
            birthPlace: 'Toshkent',
            nationality: 'O\'zbekiston',
            gender: 'male',
            phone: '+81 90-8888-9999',
            postalCode: '160-0022',
            address: 'Tokyo, Shinjuku-ku, Shinjuku 3-1-1',
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
            fullName: 'Farrux Alimov',
            email: 'farrux.alimov@gmail.com',
            birthDate: '1996-08-24',
            birthPlace: 'Toshkent',
            nationality: 'O\'zbekiston',
            gender: 'male',
            phone: '+81 90-8888-9999',
            postalCode: '160-0022',
            address: 'Tokyo, Shinjuku-ku, Shinjuku 3-1-1',
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
        return <ServiceComingSoon />;
      case 'profile':
        return (
          <Profile 
            onLogout={() => setUserRole(null)} 
            contractStatus={contractStatus} 
            setContractStatus={setContractStatus} 
            profileData={profileData}
            userRole={userRole}
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
        return <DriverFeed onJobClick={setSelectedJob} jobs={jobs} isContractActive={contractStatus === 'active'} onShoukai={handleShoukai} userRole={userRole} onApply={handleApplyJob} applications={applications} />;
    }
  };

  return (
    <div className="app-layout">
      <div className="glass-blob blob-1"></div>
      <div className="glass-blob blob-2"></div>
      <div className="glass-blob blob-3"></div>

      <header className="global-header">
        <div className="user-profile-corner">
          <img src={getAvatarSrc()} alt="User" className="header-avatar" style={{ border: '2px solid var(--primary)', padding: '2px', borderRadius: '50%', background: '#fff' }} />
          <span className="header-username">{getUserNameWithHonorific()}</span>
        </div>

        <button
          className="theme-toggle-btn"
          onClick={() => setDarkMode(prev => !prev)}
          aria-label="Toggle theme"
        >
          <div className={`theme-toggle-track ${darkMode ? 'dark' : 'light'}`}>
            <div className="theme-toggle-thumb">
              {darkMode ? <Moon size={14} strokeWidth={2.5} /> : <Sun size={14} strokeWidth={2.5} />}
            </div>
          </div>
        </button>

        <div className="logo">
          <div className="logo-kanji">道</div>
          MICHI
        </div>
      </header>

      <main className="main-content" style={{ zIndex: 10 }}>
        <ChunkErrorBoundary><Suspense fallback={<div style={{display:'flex', justifyContent:'center', padding:40, color:'#8E8E93'}}>{t('loading', 'Yuklanmoqda...')}</div>}>
          {renderTabContent()}
        </Suspense></ChunkErrorBoundary>
      </main>

      {selectedJob && (
        <ChunkErrorBoundary><Suspense fallback={<div style={{display:'flex', justifyContent:'center', padding:40, color:'#8E8E93'}}>{t('loading', 'Yuklanmoqda...')}</div>}>
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
        </Suspense></ChunkErrorBoundary>
      )}

      {!(activeTab === 'profile' && profileActivePage === 'resume_builder') && (
        <BottomNav 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setSelectedJob(null);
            setSelectedSchool(null);
            setBackTab(null);
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
    </div>
  );
}

export default App;
