import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Settings, FileText, Bell, LogOut, ChevronRight, CheckCircle2, ShieldCheck, 
  Briefcase, MapPin, Phone, Users, Bookmark, Gift, Clock, Award } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';

export default function ProfileMain({
  profileData,
  userRole,
  onLogout,
  onNavigate,
  applicationsCount = 0,
  savedCount = 0,
  notificationsCount = 0,
  shoukaiCount = 0
}) {
  const { t } = useTranslation();

  return (
    <div className="profile-main-view fade-in">
      <div className="profile-header-card squircle-card">
        <div className="avatar-section">
          <div className="avatar-circle">
            {profileData?.avatar ? (
              <img src={profileData.avatar} alt="Avatar" className="avatar-img" />
            ) : (
              <User size={36} className="avatar-placeholder-icon" />
            )}
          </div>
          <div className="user-info">
            <div className="name-row">
              <h2 className="user-name">{profileData?.fullName || t('guestUser', 'Mehmon')}</h2>
              {userRole === 'driver' && <VerifiedBadge isVerified={true} />}
            </div>
            <p className="user-id">{profileData?.userId || '#Michi-0000'}</p>
          </div>
        </div>
      </div>

      <div className="profile-menu-list">
        <button className="profile-menu-item" onClick={() => onNavigate && onNavigate('personalInfo')}>
          <div className="menu-icon-wrap"><User size={18} /></div>
          <span className="menu-label">{t('personalInfo', 'Shaxsiy ma\'lumotlar')}</span>
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        <button className="profile-menu-item" onClick={() => onNavigate && onNavigate('resume_builder')}>
          <div className="menu-icon-wrap"><FileText size={18} /></div>
          <span className="menu-label">{t('resumeBuilder', 'Rezyume yaratish')}</span>
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        <button className="profile-menu-item" onClick={() => onNavigate && onNavigate('applications')}>
          <div className="menu-icon-wrap"><Briefcase size={18} /></div>
          <span className="menu-label">{t('myApplications', 'Arizalarim')}</span>
          {applicationsCount > 0 && <span className="menu-badge">{applicationsCount}</span>}
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        <button className="profile-menu-item" onClick={() => onNavigate && onNavigate('saved_items')}>
          <div className="menu-icon-wrap"><Bookmark size={18} /></div>
          <span className="menu-label">{t('savedItems', 'Saqlanganlar')}</span>
          {savedCount > 0 && <span className="menu-badge">{savedCount}</span>}
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        <button className="profile-menu-item" onClick={() => onNavigate && onNavigate('my_shoukai')}>
          <div className="menu-icon-wrap"><Gift size={18} /></div>
          <span className="menu-label">{t('myShoukai', 'Mening Shoukai-larim')}</span>
          {shoukaiCount > 0 && <span className="menu-badge">{shoukaiCount}</span>}
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        <button className="profile-menu-item" onClick={() => onNavigate && onNavigate('notifications')}>
          <div className="menu-icon-wrap"><Bell size={18} /></div>
          <span className="menu-label">{t('notifications', 'Bildirishnomalar')}</span>
          {notificationsCount > 0 && <span className="menu-badge badge-unread">{notificationsCount}</span>}
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        <button className="profile-menu-item" onClick={() => onNavigate && onNavigate('settings')}>
          <div className="menu-icon-wrap"><Settings size={18} /></div>
          <span className="menu-label">{t('settings', 'Sozlamalar')}</span>
          <ChevronRight size={16} className="chevron-icon" />
        </button>
      </div>

      {onLogout && (
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>{t('logout', 'Chiqish')}</span>
        </button>
      )}

      <div style={{ height: '100px', minHeight: '100px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
