import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Briefcase, GraduationCap, Wrench, User } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav({ activeTab, setActiveTab, unreadCount = 0, userRole, isVoiceStandby, isVoiceActive }) {
  const { t } = useTranslation();
  
  const navItems = [
    { id: 'home', icon: Home, label: t('navHome', 'Asosiy') },
    { id: 'jobs', icon: Briefcase, label: t('navJobs', 'Ishlar') },
    { id: 'academy', icon: GraduationCap, label: t('navAcademy', 'Maktablar') },
    { id: 'service', icon: Wrench, label: t('navService', 'Servis') },
    { id: 'profile', icon: User, label: t('navProfile', 'Profil') },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const showBadge = item.id === 'profile' && unreadCount > 0;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <div className="nav-icon-wrap">
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {showBadge && (
                <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
              {item.id === 'academy' && isVoiceStandby && (
                <div className="voice-standby-orb-nav-overlay animate-fade-in">
                  <div className="voice-standby-orb-glow"></div>
                  <div className="voice-standby-orb-sphere"></div>
                </div>
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
