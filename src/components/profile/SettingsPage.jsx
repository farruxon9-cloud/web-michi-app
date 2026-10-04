// v1.1 Faza E: Profile.jsx dagi `activePage === 'settings'` sahifasi o'zgarishsiz ko'chirildi.
// Holat va funksiyalar Profile'dan `ctx` orqali keladi (klasslar, stil va DOM bir xil).
import {
  Bell, ChevronRight, Globe, Sun, Moon, Volume2, Vibrate, VolumeX, BellOff, ArrowLeft
} from 'lucide-react';

export default function SettingsPage(ctx) {
  const { darkMode, handleBackToMain, handleToggleNotifSound, handleToggleShowBadges, notificationSound, onChangeLanguage, setDarkMode, setSoundSettings, showProfileBadges, soundSettings, t } = ctx;
  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="profile-sticky-back">
        <button className="icon-btn glass" onClick={handleBackToMain}><ArrowLeft size={20} /></button>
      </div>
      <div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '5px' }}>
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
          <h4 className="settings-section-title">{t('preferencesTitle')}</h4>
          
          {/* Notification Sound Toggle */}
          <div className="settings-toggle-row" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <div className="toggle-label">
              <Volume2 size={20} color="#34C759" />
              <span>{t('notifSoundLabel')}</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={Boolean(notificationSound)} onChange={(e) => handleToggleNotifSound(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Profile Badges Visibility Toggle */}
          <div className="settings-toggle-row">
            <div className="toggle-label">
              <Bell size={20} color="#0A84FF" />
              <span>{t('showBadgesLabel')}</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={Boolean(showProfileBadges)} onChange={(e) => handleToggleShowBadges(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Sound Settings */}
        {(() => {
          const safeSound = soundSettings || { sound: true, vibration: true };
          const isSoundOn = Boolean(safeSound.sound);
          const isVibOn = Boolean(safeSound.vibration);
          return (
            <div className="menu-group glass squircle">
              <h4 className="settings-section-title">{t('soundSettings')}</h4>
              <div className="sound-options">
                <button 
                  className={`sound-option profile-btn-interactive ${isSoundOn && isVibOn ? 'active' : ''}`}
                  onClick={() => setSoundSettings?.({ sound: true, vibration: true })}
                >
                  <Volume2 size={20} />
                  <span>{t('soundOn')}</span>
                </button>
                <button 
                  className={`sound-option profile-btn-interactive ${!isSoundOn && isVibOn ? 'active' : ''}`}
                  onClick={() => setSoundSettings?.({ sound: false, vibration: true })}
                >
                  <Vibrate size={20} />
                  <span>{t('vibration')}</span>
                </button>
                <button 
                  className={`sound-option profile-btn-interactive ${isSoundOn && !isVibOn ? 'active' : ''}`}
                  onClick={() => setSoundSettings?.({ sound: true, vibration: false })}
                >
                  <VolumeX size={20} />
                  <span>{t('silent')}</span>
                </button>
                <button 
                  className={`sound-option profile-btn-interactive ${!isSoundOn && !isVibOn ? 'active' : ''}`}
                  onClick={() => setSoundSettings?.({ sound: false, vibration: false })}
                >
                  <BellOff size={20} />
                  <span>{t('allOff')}</span>
                </button>
              </div>
            </div>
          );
        })()}
      </div>
      {/* 86px clearance spacer yielding exact 12px gap between last settings card and floating BottomNav */}
      <div style={{ height: '86px', minHeight: '86px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
