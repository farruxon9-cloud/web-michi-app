import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Moon, Sun, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import LanguageSelect from '../LanguageSelect';

export default function Settings({ onBack, darkMode, setDarkMode, soundSettings, setSoundSettings }) {
  const { t } = useTranslation();

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>{t('settings', 'Sozlamalar')}</h2>
        <div style={{ width: 40 }} />
      </div>

      <div className="settings-section squircle-card">
        <h3>{t('languageSettings', 'Til sozlamalari')}</h3>
        <LanguageSelect />
      </div>

      <div className="settings-section squircle-card">
        <h3>{t('appearanceSettings', 'Tashqi ko\'rinish')}</h3>
        <div className="setting-row">
          <div className="setting-info">
            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
            <span>{t('darkMode', 'Tungi rejim')}</span>
          </div>
          <button 
            className={`toggle-switch ${darkMode ? 'active' : ''}`}
            onClick={() => setDarkMode && setDarkMode(!darkMode)}
          >
            <div className="toggle-thumb" />
          </button>
        </div>
      </div>

      <div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}
