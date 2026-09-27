import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, Settings, FileText, Bell, LogOut, ChevronRight, Briefcase, 
  Bookmark, Gift, Camera, Building2, Users
} from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';

export default function ProfileMain({
  profileData,
  userRole,
  onLogout,
  onNavigate,
  applicationsCount = 0,
  savedCount = 0,
  notificationsCount = 0,
  shoukaiCount = 0,
  employeesCount = 0,
  fileInputRef,
  onAvatarUpload
}) {
  const { t } = useTranslation();

  return (
    <div className="profile-main-view fade-in">
      {/* Profile Header Card */}
      <div className="profile-header-card squircle-card">
        <div className="avatar-section">
          <div className="avatar-circle" onClick={() => fileInputRef?.current?.click()} style={{ cursor: 'pointer', position: 'relative' }}>
            {profileData?.avatar ? (
              <img src={profileData.avatar} alt="Avatar" className="avatar-img" loading="lazy" />
            ) : (
              <User size={36} className="avatar-placeholder-icon" />
            )}
            <div style={{
              position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px',
              borderRadius: '50%', background: 'var(--primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', border: '2px solid #FFF'
            }}>
              <Camera size={12} color="#FFF" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={onAvatarUpload} 
            />
          </div>

          <div className="user-info">
            <div className="name-row">
              <h2 className="user-name">{profileData?.fullName || t('guestUser', 'Mehmon')}</h2>
              {userRole === 'driver' && <VerifiedBadge isVerified={true} />}
            </div>
            <p className="user-id">{profileData?.userId || '#Michi-0000'}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--glass-border)', marginTop: '14px', paddingTop: '12px', justifyContent: 'space-around' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('applications')}>
            <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>{applicationsCount}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{t('applications', 'Arizalar')}</span>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)', height: '24px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('saved_items')}>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#FF9500' }}>{savedCount}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{t('savedItems', 'Saqlangan')}</span>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)', height: '24px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => onNavigate && onNavigate('my_shoukai')}>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#30D158' }}>{shoukaiCount}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>{t('shoukai', 'Shoukai')}</span>
          </div>
        </div>
      </div>

      {/* Menu Options List */}
      <div className="profile-menu-list">
        <button type="button" className="profile-menu-item" onClick={() => onNavigate && onNavigate('personalInfo')}>
          <div className="menu-icon-wrap"><User size={18} /></div>
          <span className="menu-label">{t('personalInfo', 'Shaxsiy ma\'lumotlar')}</span>
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        <button type="button" className="profile-menu-item" onClick={() => onNavigate && onNavigate('resume_builder')}>
          <div className="menu-icon-wrap"><FileText size={18} /></div>
          <span className="menu-label">{t('resumeBuilder', 'Rezyume yaratish')}</span>
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        <button type="button" className="profile-menu-item" onClick={() => onNavigate && onNavigate('applications')}>
          <div className="menu-icon-wrap"><Briefcase size={18} /></div>
          <span className="menu-label">{t('myApplications', 'Arizalarim')}</span>
          {applicationsCount > 0 && <span className="menu-badge">{applicationsCount}</span>}
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        <button type="button" className="profile-menu-item" onClick={() => onNavigate && onNavigate('saved_items')}>
          <div className="menu-icon-wrap"><Bookmark size={18} /></div>
          <span className="menu-label">{t('savedItems', 'Saqlanganlar')}</span>
          {savedCount > 0 && <span className="menu-badge">{savedCount}</span>}
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        <button type="button" className="profile-menu-item" onClick={() => onNavigate && onNavigate('my_shoukai')}>
          <div className="menu-icon-wrap"><Gift size={18} /></div>
          <span className="menu-label">{t('myShoukai', 'Mening Shoukai-larim')}</span>
          {shoukaiCount > 0 && <span className="menu-badge">{shoukaiCount}</span>}
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        {userRole === 'company' && (
          <button type="button" className="profile-menu-item" onClick={() => onNavigate && onNavigate('employees')}>
            <div className="menu-icon-wrap"><Users size={18} /></div>
            <span className="menu-label">{t('employees', 'Xodimlar boshqaruvi')}</span>
            {employeesCount > 0 && <span className="menu-badge">{employeesCount}</span>}
            <ChevronRight size={16} className="chevron-icon" />
          </button>
        )}

        <button type="button" className="profile-menu-item" onClick={() => onNavigate && onNavigate('notifications')}>
          <div className="menu-icon-wrap"><Bell size={18} /></div>
          <span className="menu-label">{t('notifications', 'Bildirishnomalar')}</span>
          {notificationsCount > 0 && <span className="menu-badge badge-unread">{notificationsCount}</span>}
          <ChevronRight size={16} className="chevron-icon" />
        </button>

        <button type="button" className="profile-menu-item" onClick={() => onNavigate && onNavigate('settings')}>
          <div className="menu-icon-wrap"><Settings size={18} /></div>
          <span className="menu-label">{t('settings', 'Sozlamalar')}</span>
          <ChevronRight size={16} className="chevron-icon" />
        </button>
      </div>

      {onLogout && (
        <button type="button" className="logout-btn" onClick={onLogout}>
          <LogOut size={18} />
          <span>{t('logout', 'Chiqish')}</span>
        </button>
      )}

      {/* 92px clearance spacer */}
      <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
