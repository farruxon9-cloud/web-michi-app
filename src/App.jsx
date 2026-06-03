import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Splash from './components/Splash';
import LanguageSelect from './components/LanguageSelect';
import RoleSelect from './components/RoleSelect';
import BottomNav from './components/BottomNav';
import './App.css';
import { MOCK_JOBS } from './components/DriverFeed';
import { MOCK_SCHOOLS } from './components/DrivingAcademy';

// Lazy loading heavy components for faster initial load
const Dashboard = lazy(() => import('./components/Dashboard'));
const DriverFeed = lazy(() => import('./components/DriverFeed'));
const JobDetail = lazy(() => import('./components/JobDetail'));
const DrivingAcademy = lazy(() => import('./components/DrivingAcademy'));
const ServiceComingSoon = lazy(() => import('./components/ServiceComingSoon'));
const Profile = lazy(() => import('./components/Profile'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const CompanyHome = lazy(() => import('./components/CompanyHome'));


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

  // backTab: Profilning saqlanganlaridan e'longa kirilganda, ortga qaytish manzilini eslab qoluvchi o'zgaruvchi.
  const [backTab, setBackTab] = useState(null);

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
    };
  });

  // Disabled auto-save logic for role and profile
  useEffect(() => {
    // We intentionally don't save to localStorage anymore
    // so the user can test the registration flow on every reload.
  }, [userRole, profileData]);

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
      shoukaiPaid: false
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
      
    alert(alertMsg);

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
          isSimulatedReferral: true // Do'st arizasini foydalanuvchining shaxsiy arizasidan farqlash uchun
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
          isSimulatedReferral: true // Do'st arizasini foydalanuvchining shaxsiy arizasidan farqlash uchun
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
    if (profileData.gender === 'female') return 'https://api.dicebear.com/7.x/notionists/svg?seed=Jocelyn&backgroundColor=e2e8f0&hair=long1,long2,bob,curly&hairColor=8E8E93&skinColor=8E8E93';
    if (profileData.gender === 'male') return 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0&hair=short1,short2&hairColor=8E8E93&skinColor=8E8E93';
    
    const name = profileData.fullName || 'User';
    const bg = userRole === 'company' ? 'AF52DE' : userRole === 'school' ? '34C759' : userRole === 'driver' ? '0A84FF' : '8E8E93';
    return `https://ui-avatars.com/api/?name=${name}&background=${bg}&color=fff`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        if (userRole === 'company') {
          return <CompanyHome onJobClick={setSelectedJob} onSchoolClick={handleSchoolClick} jobs={jobs} setJobs={setJobs} schools={schools} setSchools={setSchools} profileData={profileData} jobToEdit={jobToEdit} setJobToEdit={setJobToEdit} />;
        }
        return <Dashboard setActiveTab={setActiveTab} profileData={profileData} />;
      case 'jobs':
        return <DriverFeed onJobClick={setSelectedJob} jobs={jobs} isContractActive={contractStatus === 'active'} verifiedCompanies={verifiedCompanies} onShoukai={handleShoukai} />;
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
            onJobClick={setSelectedJob}
            onSchoolClick={handleSchoolClick}
            showProfileBadges={showProfileBadges}
            setShowProfileBadges={setShowProfileBadges}
            notificationSound={notificationSound}
            setNotificationSound={setNotificationSound}
            jobs={jobs}
            schools={schools}
          />
        );
      default:
        return <DriverFeed onJobClick={setSelectedJob} jobs={jobs} isContractActive={contractStatus === 'active'} onShoukai={handleShoukai} />;
    }
  };

  return (
    <div className="app-layout">
      <div className="glass-blob blob-1"></div>
      <div className="glass-blob blob-2"></div>
      <div className="glass-blob blob-3"></div>

      <header className="global-header" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
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
              setActiveTab('home');
            }}
          />
        </Suspense></ChunkErrorBoundary>
      )}

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
      />
    </div>
  );
}

export default App;
