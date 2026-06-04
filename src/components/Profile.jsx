import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Settings, FileText, Bell, LogOut, ChevronRight, CheckCircle2, ShieldCheck, 
  Briefcase, Globe, Building2, MapPin, Phone, Users, Camera, Sun, Moon, 
  Volume2, Vibrate, VolumeX, BellOff, Edit3, Save, X, Share2, Bookmark, ArrowLeft, Megaphone } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { MOCK_JOBS } from './DriverFeed';
import { MOCK_SCHOOLS } from './DrivingAcademy';
import VerifiedBadge from './VerifiedBadge';
import CompanyHome from './CompanyHome';
import ResumeBuilder from './ResumeBuilder';
import './Profile.css';

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
  setJobToEdit
}) {
  const { t } = useTranslation();

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
  const fileInputRef = useRef(null);

  


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
    const name = profileData.fullName;
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
        <div className="sub-page-header">
          <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
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
        <div className="sub-page-header">
          <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
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

  // ===== MY POSTED ADS PAGE (COMPANY) =====
  if (activePage === 'my_ads') {
    return (
      <div className="profile-container fade-in" style={{ paddingBottom: '100px' }}>
        {/* Sticky Back Button Container */}
        {!isFormOpen && (
          <div style={{
            position: 'sticky',
            top: 0,
            background: 'var(--bg-color)',
            zIndex: 10,
            padding: '16px 20px 8px 20px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.02)'
          }}>
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
          <div style={{ padding: '0 20px 16px 20px', marginTop: '8px' }}>
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
        />
      </div>
    );
  }

  // ===== PERSONAL INFO PAGE =====
  if (activePage === 'personalInfo') {
    return (
      <div className="profile-container fade-in">
        <div className="sub-page-header">
          <button className="icon-btn glass" onClick={() => { setActivePage('main'); setIsEditing(false); }}><ArrowLeft size={20} /></button>
          <div className="sub-header-row">
            <h2>{userRole === 'company' ? t('companyInfoTitle', "Kompaniya ma'lumotlari") : t('personalData')}</h2>
            <span style={{ color: '#0A84FF', fontSize: '14px', fontWeight: 'bold', marginLeft: '10px' }}>ID: {profileData.userId}</span>
            {!isEditing ? (
              <button className="edit-btn" onClick={startEditing}>
                <Edit3 size={16} /> {t('editInfo')}
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={saveEditing}>
                  <Save size={16} /> {t('saveChanges')}
                </button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                  <X size={16} />
                </button>
              </div>
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
              {userRole === 'driver' && (
                <>
                  <div className="resume-field">
                    <span className="field-label">{t('birthDateLabel')}</span>
                    {isEditing ? (
                      <input type="date" className="edit-input" value={editData.birthDate || ''} onChange={(e) => setEditData({...editData, birthDate: e.target.value})} />
                    ) : (
                      <span className="field-value">{profileData.birthDate || t('notProvided')}</span>
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
        <div className="sub-page-header">
          <button className="icon-btn glass" onClick={() => {
            if (profileActivePageSource === 'home') {
              setActivePage('main');
              if (onNavigate) onNavigate('home');
            } else {
              setActivePage('main');
            }
          }}><ArrowLeft size={20} /></button>
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
            combinedApps.map(app => (
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
                            <strong style={{ color: 'var(--text-main)' }}>{profileData.fullName}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                            <span style={{ color: '#8E8E93' }}>Email:</span>
                            <strong style={{ color: 'var(--text-main)' }}>{profileData.email}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                            <span style={{ color: '#8E8E93' }}>{t('birthDateLabel', 'Tug\'ilgan sana')}:</span>
                            <strong style={{ color: 'var(--text-main)' }}>{profileData.birthDate || t('notProvided')}</strong>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', gap: '4px' }}>
                            <span style={{ color: '#8E8E93' }}>{t('livingAddressTitle', 'Yashash manzillari')}:</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', marginTop: '2px' }}>
                              {profileData.addressHistory && profileData.addressHistory.length > 0 ? (
                                profileData.addressHistory.map((a, i) => (
                                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)', width: '100%' }}>
                                    <span style={{ color: 'var(--text-main)' }}>{a.address}</span>
                                    {a.isCurrent && <span style={{ fontSize: '9px', background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF', padding: '1px 4px', borderRadius: '4px', fontWeight: 'bold' }}>{t('currentAddressLabel', 'Hozirgi')}</span>}
                                  </div>
                                ))
                              ) : (
                                <strong style={{ color: 'var(--text-main)' }}>{profileData.address || t('notProvided')}</strong>
                              )}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', gap: '4px' }}>
                            <span style={{ color: '#8E8E93' }}>{t('educationTitle', 'Ta\'lim ma\'lumotlari')}:</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginTop: '2px' }}>
                              {profileData.educationHistory && profileData.educationHistory.length > 0 ? (
                                profileData.educationHistory.map((edu, i) => (
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
                                <strong style={{ color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>{profileData.education || t('notProvided')}</strong>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px', gap: '6px' }}>
                            <span style={{ color: '#8E8E93' }}>{t('driverLicensesLabel', 'Haydovchilik guvohnomalari')}:</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                              {profileData.driverLicenses && profileData.driverLicenses.length > 0 ? (
                                profileData.driverLicenses.map(l => (
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
                              {profileData.techCertificates && profileData.techCertificates.length > 0 ? (
                                profileData.techCertificates.map(tc => (
                                  <span key={tc} className="badge-blue" style={{ background: 'rgba(210, 125, 25, 0.1)', color: '#d27d19', padding: '3px 8px', borderRadius: '10px', fontSize: '11px' }}>{t(`tech_${tc}`)}</span>
                                ))
                              ) : (
                                <span style={{ fontSize: '11px', color: '#8E8E93' }}>{t('notProvided')}</span>
                              )}
                            </div>
                          </div>

                          {profileData.workHistory && profileData.workHistory.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px', gap: '6px' }}>
                              <span style={{ color: '#8E8E93' }}>{t('workExperience', 'Ish tajribasi')}:</span>
                              {profileData.workHistory.map((w, i) => (
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
                  <div className="demo-status-btns">
                    {app.status === 'submitted' && (
                      <button className="demo-btn reviewed" style={{ background: '#0A84FF', color: '#fff' }} onClick={() => onChangeAppStatus(app.id, 'reviewed')}>
                        ✓ {t('simulateReviewed')}
                      </button>
                    )}
                    {app.status === 'reviewed' && (
                      <>
                        <button className="demo-btn interview" style={{ background: '#AF52DE', color: '#fff' }} onClick={() => onChangeAppStatus(app.id, 'interview')}>
                          📅 {t('simulateInterview')}
                        </button>
                        <button className="demo-btn rejected" onClick={() => onChangeAppStatus(app.id, 'rejected')}>
                          ✗ {t('simulateReject')}
                        </button>
                      </>
                    )}
                    {app.status === 'interview' && acceptingAppId !== app.id && (
                      <button className="demo-btn accepted" onClick={() => setAcceptingAppId(app.id)}>
                        🎉 {t('simulateAccept')}
                      </button>
                    )}
                    {acceptingAppId === app.id && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', width: '100%' }}>
                        <input 
                          type="date" 
                          value={acceptDate} 
                          onChange={e => setAcceptDate(e.target.value)} 
                          className="edit-input" 
                          style={{ padding: '8px', flex: 1 }}
                        />
                        <button className="demo-btn accepted" onClick={() => {
                          onChangeAppStatus(app.id, 'accepted');
                          setAcceptingAppId(null);
                        }}>{t('save', 'Saqlash')}</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
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
        <div className="sub-page-header">
          {/* Ortga qaytish: Profil bosh sahifasiga ('main') qaytaradi */}
          <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
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
          <div className="sub-page-header">
            <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
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
        <div className="sub-page-header">
          <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
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
        <div className="sub-page-header">
          <button className="icon-btn glass" onClick={() => setActivePage('main')}><ArrowLeft size={20} /></button>
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
        {/* Resume Card */}
        {userRole === 'driver' && (
          <div className="menu-group glass squircle resume-card">
            <div className="resume-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#0A84FF" />
                <h3>{t('myResume')}</h3>
              </div>
              <button 
                onClick={() => setActivePage('resume_builder')}
                style={{
                  background: 'linear-gradient(135deg, #30D158, #28C754)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(48, 209, 88, 0.2)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
              >
                📝 {t('createResume', 'Tahrirlash / Yuklash')}
              </button>
            </div>
            <div className="resume-body">
              <div className="resume-field">
                <span className="field-label">{t('birthDateLabel')}</span>
                <span className="field-value">{profileData.birthDate || t('notProvided')}</span>
              </div>
              {/* Living Address History */}
              <div className="resume-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <span className="field-label">{t('livingAddressTitle', 'Yashash manzillari')}</span>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {profileData.addressHistory && profileData.addressHistory.length > 0 ? (
                    profileData.addressHistory.map((a, i) => (
                      <div key={i} className="glass squircle" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{a.address}</span>
                        {a.isCurrent && (
                          <span style={{ fontSize: '10px', background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF', padding: '2px 6px', borderRadius: '8px', fontWeight: 'bold' }}>
                            {t('currentAddressLabel', 'Hozirgi')}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="field-value">{profileData.address || t('notProvided')}</span>
                  )}
                </div>
              </div>

              {/* Education History */}
              <div className="resume-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <span className="field-label">{t('educationTitle', 'Ta\'lim ma\'lumotlari')}</span>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {profileData.educationHistory && profileData.educationHistory.length > 0 ? (
                    profileData.educationHistory.map((edu, i) => (
                      <div key={i} className="glass squircle" style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', width: '100%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{edu.school}</strong>
                          {edu.isCurrent && (
                            <span style={{ fontSize: '10px', background: 'rgba(52, 199, 89, 0.1)', color: '#34C759', padding: '2px 6px', borderRadius: '8px', fontWeight: 'bold' }}>
                              {t('currentlyStudyingLabel', 'O\'qiyotgan')}
                            </span>
                          )}
                        </div>
                        {edu.major && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{edu.major}</span>}
                        <span style={{ fontSize: '11px', color: '#8E8E93' }}>
                          📅 {edu.startDate || '?'} ~ {edu.isCurrent ? t('currentlyStudyingLabel', 'Hozirgi vaqtda') : edu.endDate || '?'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="field-value" style={{ whiteSpace: 'pre-wrap' }}>{profileData.education || t('notProvided')}</span>
                  )}
                </div>
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
          {userRole === 'driver' && (
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
        </div>

        <button className="logout-btn glass squircle" onClick={onLogout}>
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
}
