import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import LanguageSelect from '../LanguageSelect';

const DICT = {
  title: { ja: '設定', uz: 'Sozlamalar', en: 'Settings', ru: 'Настройки', zh: '设置' },
  languageSettings: { ja: '言語設定', uz: 'Til sozlamalari', en: 'Language Settings', ru: 'Языковые настройки', zh: '语言设置' },
  appearanceSettings: { ja: '外観設定', uz: 'Tashqi ko\'rinish', en: 'Appearance Settings', ru: 'Внешний вид', zh: '外观设置' },
  darkMode: { ja: 'ダークモード', uz: 'Tungi rejim', en: 'Dark Mode', ru: 'Тёмная тема', zh: '深色模式' },
  backLabel: { ja: '戻る', uz: 'Orqaga', en: 'Back', ru: 'Назад', zh: '返回' }
};

export default function Settings({ onBack, darkMode, setDarkMode, soundSettings, setSoundSettings }) {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language || 'uz').substring(0, 2).toLowerCase();

  const getStr = (key) => {
    const item = DICT[key] || {};
    return item[currentLang] || item.uz || item.ja || item.en;
  };

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button 
          type="button"
          className="back-btn" 
          onClick={() => onBack?.()} 
          aria-label={getStr('backLabel')}
          title={getStr('backLabel')}
        >
          <ArrowLeft size={20} />
        </button>
        <h2>{getStr('title')}</h2>
        <div style={{ width: 40 }} aria-hidden="true" />
      </div>

      <div className="settings-section squircle-card">
        <h3>{getStr('languageSettings')}</h3>
        <LanguageSelect />
      </div>

      <div className="settings-section squircle-card">
        <h3>{getStr('appearanceSettings')}</h3>
        <div className="setting-row">
          <div className="setting-info">
            {darkMode ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
            <span>{getStr('darkMode')}</span>
          </div>
          <button 
            type="button"
            className={`toggle-switch ${darkMode ? 'active' : ''}`}
            onClick={() => setDarkMode?.(!darkMode)}
            aria-pressed={Boolean(darkMode)}
            aria-label={getStr('darkMode')}
          >
            <div className="toggle-thumb" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}

