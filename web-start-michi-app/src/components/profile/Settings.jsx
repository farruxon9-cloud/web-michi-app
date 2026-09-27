import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Moon, Sun, Bell, Globe, Mic, ShieldCheck, Info } from 'lucide-react';

export default function Settings({
  onBack,
  darkMode,
  setDarkMode,
  notificationSound,
  setNotificationSound,
  isVoiceStandby,
  setIsVoiceStandby,
  onChangeLanguage
}) {
  const { t, i18n } = useTranslation();

  return (
    <div className="profile-container sub-page-view fade-in">
      {/* Header */}
      <div className="sub-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button type="button" className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{t('settings', 'Sozlamalar')}</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Settings Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Dark Mode Toggle */}
        <div style={{
          padding: '14px 16px', borderRadius: '18px', background: 'var(--card-bg)',
          border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(10, 132, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {darkMode ? <Moon size={18} color="#0A84FF" /> : <Sun size={18} color="#FF9500" />}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
              {t('darkMode', 'Tungi rejim')}
            </span>
          </div>
          <input
            type="checkbox"
            checked={!!darkMode}
            onChange={(e) => setDarkMode && setDarkMode(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        {/* Notification Sound */}
        <div style={{
          padding: '14px 16px', borderRadius: '18px', background: 'var(--card-bg)',
          border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(48, 209, 88, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} color="#30D158" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
              {t('notificationSound', 'Bildirishnoma ovozi')}
            </span>
          </div>
          <input
            type="checkbox"
            checked={!!notificationSound}
            onChange={(e) => setNotificationSound && setNotificationSound(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        {/* AI Voice Assistant Standby */}
        <div style={{
          padding: '14px 16px', borderRadius: '18px', background: 'var(--card-bg)',
          border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(175, 82, 222, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mic size={18} color="#AF52DE" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
              {t('voiceStandby', 'Ovozli yordamchi kutish rejimi')}
            </span>
          </div>
          <input
            type="checkbox"
            checked={!!isVoiceStandby}
            onChange={(e) => setIsVoiceStandby && setIsVoiceStandby(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        {/* Language Picker */}
        <div style={{
          padding: '14px 16px', borderRadius: '18px', background: 'var(--card-bg)',
          border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 149, 0, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={18} color="#FF9500" />
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>
              {t('appLanguage', 'Ilova tili')}
            </span>
          </div>
          <select
            value={i18n.language}
            onChange={(e) => onChangeLanguage && onChangeLanguage(e.target.value)}
            style={{
              padding: '6px 10px', borderRadius: '10px', border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)', color: 'var(--text-main)', fontWeight: '700', fontSize: '13px'
            }}
          >
            <option value="uz">O'zbekcha (UZ)</option>
            <option value="jp">日本語 (JP)</option>
            <option value="en">English (EN)</option>
            <option value="ru">Русский (RU)</option>
            <option value="vi">Tiếng Việt (VI)</option>
            <option value="zh">中文 (ZH)</option>
            <option value="ne">नेपाली (NE)</option>
          </select>
        </div>
      </div>

      {/* 92px clearance spacer */}
      <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
