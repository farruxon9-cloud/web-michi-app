import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import Splash from './components/Splash';
import LanguageSelect from './components/LanguageSelect';
import RoleSelect from './components/RoleSelect';
import BottomNav from './components/BottomNav';
import './App.css';

// Lazy loading heavy components for faster initial load
const DriverFeed = lazy(() => import('./components/DriverFeed'));
const JobDetail = lazy(() => import('./components/JobDetail'));
const DrivingAcademy = lazy(() => import('./components/DrivingAcademy'));
const ServiceComingSoon = lazy(() => import('./components/ServiceComingSoon'));
const Profile = lazy(() => import('./components/Profile'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const CompanyHome = lazy(() => import('./components/CompanyHome'));

function App() {
  const { t } = useTranslation();
  const [showSplash, setShowSplash] = useState(true);
  const [languageSelected, setLanguageSelected] = useState(false);
  const [userRole, setUserRole] = useState(null); // Temporarily disable auto-login
  const [activeTab, setActiveTab] = useState('home');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [profileActivePage, setProfileActivePage] = useState('main');
  const [backTab, setBackTab] = useState(null);
  const [isContractActive, setIsContractActive] = useState(false);
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

  // Applications state
  const [applications, setApplications] = useState([]);

  // Company Employees state (for HR)
  const [companyEmployees, setCompanyEmployees] = useState([]);

  // Notifications state
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Apply for a job
  const handleApplyJob = (job) => {
    const exists = applications.find(a => a.jobId === job.id);
    if (exists) return;

    const refId = prompt("Havola orqali kirdingizmi? Unday bo'lsa tavsiya qilgan odamning ID raqamini kiriting (Simulyatsiya uchun):\nMasalan: #Michi-A1B2");

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
    if (app && (newStatus === 'accepted' || newStatus === 'interview')) {
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
    const exists = schoolApplications.find(a => a.schoolId === school.id);
    if (exists) return;

    const refId = prompt("Havola orqali kirdingizmi? Unday bo'lsa tavsiya qilgan odamning ID raqamini kiriting (Simulyatsiya uchun):\nMasalan: #Michi-A1B2");

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
          title: `${app.shoukaiAmount} shoukai to'landi`,
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
          title: `${app.shoukaiAmount} shoukai to'landi`,
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

  const handleShoukai = (item) => {
    const link = `michi-app.com/${item.shoukaiAmount && item.title ? 'job' : 'school'}/${item.id}?ref=${profileData.userId}`;
    alert(`Shoukai havolasi nusxalandi:\n\n${link}\n\nDo'stlaringiz bilan ulashing!`);
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
    return (
      <AdminDashboard 
        verifiedCompanies={verifiedCompanies}
        onToggleVerify={handleToggleVerify}
        onLogout={() => setUserRole(null)}
      />
    );
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
          return <CompanyHome onJobClick={setSelectedJob} />;
        }
        return <DriverFeed onJobClick={setSelectedJob} isContractActive={isContractActive} verifiedCompanies={verifiedCompanies} />;
      case 'academy':
        return (
          <DrivingAcademy 
            isContractActive={isContractActive} 
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
          />
        );
      case 'service':
        return <ServiceComingSoon />;
      case 'profile':
        return (
          <Profile 
            onLogout={() => setUserRole(null)} 
            isContractActive={isContractActive} 
            setIsContractActive={setIsContractActive} 
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
          />
        );
      default:
        return <DriverFeed onJobClick={setSelectedJob} isContractActive={isContractActive} />;
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
        <div className="logo">
          <div className="logo-kanji">道</div>
          MICHI
        </div>
      </header>

      <main className="main-content" style={{ zIndex: 10 }}>
        <Suspense fallback={<div style={{display:'flex', justifyContent:'center', padding:40, color:'#8E8E93'}}>{t('loading', 'Yuklanmoqda...')}</div>}>
          {renderTabContent()}
        </Suspense>
      </main>

      {selectedJob && (
        <Suspense fallback={<div style={{display:'flex', justifyContent:'center', padding:40, color:'#8E8E93'}}>{t('loading', 'Yuklanmoqda...')}</div>}>
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
        </Suspense>
      )}

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setSelectedJob(null);
          setSelectedSchool(null);
          setBackTab(null);
          setActiveTab(tab);
        }}
        unreadCount={unreadCount}
      />
    </div>
  );
}

export default App;
