import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Briefcase, GraduationCap, Wrench, User, Shield, Sun, Moon, Globe } from 'lucide-react';
import RobotAvatar from './RobotAvatar';
import { playHapticClick } from '../utils/haptics';
import './SideNav.css';

const SideNav = React.memo(function SideNav({
  activeTab,
  setActiveTab,
  unreadCount = 0,
  userRole,
  profileData,
  darkMode,
  setDarkMode,
  isVoiceActive,
  isVoiceStandby,
  voiceStatus,
  handleVoiceToggle
}) {
  const { t, i18n } = useTranslation();

  const navItems = [
    { id: 'home', icon: Home, label: t('navHome', 'Asosiy') },
    { id: 'jobs', icon: Briefcase, label: t('navJobs', 'Ishlar') },
    { id: 'service', icon: Wrench, label: t('navService', 'Servis') },
    { id: 'academy', icon: GraduationCap, label: t('navAcademy', 'Maktablar') },
    { id: 'profile', icon: User, label: t('navProfile', 'Profil') },
  ];

  if (userRole === 'admin') {
    navItems.push({ id: 'admin', icon: Shield, label: t('navAdmin', 'Admin') });
  }

  const handleTabClick = (tabId) => {
    try {
      const saved = localStorage.getItem('michi_sound');
      const soundSettings = saved ? JSON.parse(saved) : { sound: true, vibration: true };
      playHapticClick(soundSettings);
    } catch (e) {
      console.warn(e);
    }
    setActiveTab(tabId, { fromSideNav: true });
  };

  return (
    <aside className="sidenav-container">
      {/* Top Header: Michi Brand Logo */}
      <div className="sidenav-header">
        <div 
          className="sidenav-logo-brand" 
          onClick={() => handleTabClick('home')}
          title="Michi App — Drive Your Career"
        >
          <div className="sidenav-logo-kanji">道</div>
          <div className="sidenav-brand-text">
            <span className="sidenav-title">MICHI</span>
            <span className="sidenav-subtitle">Web Platform</span>
          </div>
        </div>
      </div>

      {/* Navigation Links List */}
      <nav className="sidenav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const showBadge = item.id === 'profile' && unreadCount > 0;

          return (
            <button
              key={item.id}
              className={`sidenav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
              title={item.label}
            >
              <div className="sidenav-icon-wrap">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
                {showBadge && (
                  <span className="sidenav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Section: Language Selector, Theme Toggle, Robot Avatar, User Profile */}
      <div className="sidenav-footer">
        {/* SideNav Language Selector Dropdown */}
        <div className="sidenav-lang-container" title={t('changeLanguage', 'Tilni o\'zgartirish')}>
          <Globe size={16} className="sidenav-lang-icon" aria-hidden="true" />
          <select
            className="sidenav-lang-select"
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="uz">🇺🇿 O'zbek</option>
            <option value="ja">🇯🇵 日本語</option>
            <option value="en">🇺🇸 English</option>
            <option value="ru">🇷🇺 Русский</option>
            <option value="vi">🇻🇳 Tiếng Việt</option>
            <option value="ne">🇳🇵 नेपाली</option>
            <option value="zh">🇨🇳 中文</option>
          </select>
        </div>

        <div className="sidenav-action-row">
          {/* Theme Toggle Button */}
          <button
            className="theme-toggle-btn"
            onClick={() => setDarkMode(prev => !prev)}
            aria-label="Toggle theme"
            title={darkMode ? 'Kunduzgi rejim' : 'Tungi rejim'}
          >
            <div className={`theme-toggle-track ${darkMode ? 'dark' : 'light'}`}>
              <div className="theme-toggle-thumb">
                {darkMode ? <Moon size={11} strokeWidth={2.5} aria-hidden="true" /> : <Sun size={11} strokeWidth={2.5} aria-hidden="true" />}
              </div>
            </div>
          </button>

          {/* AI Robot Avatar Widget */}
          <RobotAvatar
            isVoiceActive={isVoiceActive || isVoiceStandby}
            voiceStatus={isVoiceActive ? voiceStatus : 'idle'}
            onClick={handleVoiceToggle}
          />
        </div>

        {/* User Profile Quick Card */}
        <div 
          className="sidenav-user-card" 
          onClick={() => handleTabClick('profile')}
          title="Profilga o'tish"
        >
          <img
            src={profileData?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.fullName || 'User')}&background=0A84FF&color=fff`}
            alt="User Avatar"
            className="sidenav-user-avatar"
          />
          <div className="sidenav-user-info">
            <span className="sidenav-user-name">{profileData?.fullName || 'Mehmon'}</span>
            <span className="sidenav-user-role">
              {userRole === 'company' ? 'Kompaniya' : userRole === 'school' ? 'Avtomaktab' : userRole === 'admin' ? 'Administrator' : 'Haydovchi'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
});

export default SideNav;
