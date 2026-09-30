import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, Settings, FileText, Bell, LogOut, ChevronRight, 
  Briefcase, Bookmark, Gift 
} from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';

const DICT = {
  guestUser: { ja: 'ゲストユーザー', uz: 'Mehmon', en: 'Guest User', ru: 'Гость', zh: '访客用户' },
  personalInfo: { ja: '個人情報', uz: 'Shaxsiy ma\'lumotlar', en: 'Personal Info', ru: 'Личные данные', zh: '个人信息' },
  resumeBuilder: { ja: '履歴書作成', uz: 'Rezyume yaratish', en: 'Resume Builder', ru: 'Конструктор резюме', zh: '履历书制作' },
  myApplications: { ja: '応募履歴', uz: 'Arizalarim', en: 'My Applications', ru: 'Мои заявки', zh: '我的申请' },
  savedItems: { ja: '保存した求人', uz: 'Saqlanganlar', en: 'Saved Items', ru: 'Сохраненные', zh: '已保存' },
  myShoukai: { ja: 'マイ紹介報酬', uz: 'Mening Shoukai-larim', en: 'My Shoukai Rewards', ru: 'Мои бонусы Shoukai', zh: '我的推荐奖励' },
  notifications: { ja: '通知', uz: 'Bildirishnomalar', en: 'Notifications', ru: 'Уведомления', zh: '通知中心' },
  settings: { ja: '設定', uz: 'Sozlamalar', en: 'Settings', ru: 'Настройки', zh: '设置' },
  logout: { ja: 'ログアウト', uz: 'Chiqish', en: 'Log Out', ru: 'Выйти', zh: '退出登录' }
};

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
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language || 'uz').substring(0, 2).toLowerCase();

  const getStr = (key) => {
    const item = DICT[key] || {};
    return item[currentLang] || item.uz || item.ja || item.en;
  };

  return (
    <div className="profile-main-view fade-in">
      {/* Profile Header Card */}
      <div className="profile-header-card squircle-card">
        <div className="avatar-section">
          <div className="avatar-circle">
            {profileData?.avatar ? (
              <img src={profileData.avatar} alt="Avatar" className="avatar-img" />
            ) : (
              <User size={36} className="avatar-placeholder-icon" aria-hidden="true" />
            )}
          </div>
          <div className="user-info">
            <div className="name-row">
              <h2 className="user-name">{profileData?.fullName || getStr('guestUser')}</h2>
              {userRole === 'driver' && <VerifiedBadge isVerified={true} />}
            </div>
            <p className="user-id">{profileData?.userId || '#Michi-0000'}</p>
          </div>
        </div>
      </div>

      {/* Profile Menu Items List */}
      <div className="profile-menu-list">
        <button 
          type="button"
          className="profile-menu-item" 
          onClick={() => onNavigate?.('personalInfo')}
          aria-label={getStr('personalInfo')}
        >
          <div className="menu-icon-wrap" aria-hidden="true"><User size={18} /></div>
          <span className="menu-label">{getStr('personalInfo')}</span>
          <ChevronRight size={16} className="chevron-icon" aria-hidden="true" />
        </button>

        <button 
          type="button"
          className="profile-menu-item" 
          onClick={() => onNavigate?.('resume_builder')}
          aria-label={getStr('resumeBuilder')}
        >
          <div className="menu-icon-wrap" aria-hidden="true"><FileText size={18} /></div>
          <span className="menu-label">{getStr('resumeBuilder')}</span>
          <ChevronRight size={16} className="chevron-icon" aria-hidden="true" />
        </button>

        <button 
          type="button"
          className="profile-menu-item" 
          onClick={() => onNavigate?.('applications')}
          aria-label={getStr('myApplications')}
        >
          <div className="menu-icon-wrap" aria-hidden="true"><Briefcase size={18} /></div>
          <span className="menu-label">{getStr('myApplications')}</span>
          {applicationsCount > 0 && <span className="menu-badge">{applicationsCount}</span>}
          <ChevronRight size={16} className="chevron-icon" aria-hidden="true" />
        </button>

        <button 
          type="button"
          className="profile-menu-item" 
          onClick={() => onNavigate?.('saved_items')}
          aria-label={getStr('savedItems')}
        >
          <div className="menu-icon-wrap" aria-hidden="true"><Bookmark size={18} /></div>
          <span className="menu-label">{getStr('savedItems')}</span>
          {savedCount > 0 && <span className="menu-badge">{savedCount}</span>}
          <ChevronRight size={16} className="chevron-icon" aria-hidden="true" />
        </button>

        <button 
          type="button"
          className="profile-menu-item" 
          onClick={() => onNavigate?.('my_shoukai')}
          aria-label={getStr('myShoukai')}
        >
          <div className="menu-icon-wrap" aria-hidden="true"><Gift size={18} /></div>
          <span className="menu-label">{getStr('myShoukai')}</span>
          {shoukaiCount > 0 && <span className="menu-badge">{shoukaiCount}</span>}
          <ChevronRight size={16} className="chevron-icon" aria-hidden="true" />
        </button>

        <button 
          type="button"
          className="profile-menu-item" 
          onClick={() => onNavigate?.('notifications')}
          aria-label={getStr('notifications')}
        >
          <div className="menu-icon-wrap" aria-hidden="true"><Bell size={18} /></div>
          <span className="menu-label">{getStr('notifications')}</span>
          {notificationsCount > 0 && <span className="menu-badge badge-unread">{notificationsCount}</span>}
          <ChevronRight size={16} className="chevron-icon" aria-hidden="true" />
        </button>

        <button 
          type="button"
          className="profile-menu-item" 
          onClick={() => onNavigate?.('settings')}
          aria-label={getStr('settings')}
        >
          <div className="menu-icon-wrap" aria-hidden="true"><Settings size={18} /></div>
          <span className="menu-label">{getStr('settings')}</span>
          <ChevronRight size={16} className="chevron-icon" aria-hidden="true" />
        </button>
      </div>

      {onLogout && (
        <button 
          type="button"
          className="logout-btn" 
          onClick={() => onLogout?.()}
          aria-label={getStr('logout')}
        >
          <LogOut size={18} aria-hidden="true" />
          <span>{getStr('logout')}</span>
        </button>
      )}

      <div style={{ height: '100px', minHeight: '100px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}

