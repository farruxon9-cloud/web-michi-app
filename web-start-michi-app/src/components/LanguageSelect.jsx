import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import MichiLogo from './MichiLogo';
import './LanguageSelect.css';

const LANGUAGES = [
  { code: 'ja', label: '日本語', native: 'にほんご', emoji: '🗾' },
  { code: 'en', label: 'English', native: 'English', emoji: '🌍' },
  { code: 'ru', label: 'Русский', native: 'Русский', emoji: '🇷🇺' },
  { code: 'vi', label: 'Tiếng Việt', native: 'Việt', emoji: '🌏' },
  { code: 'zh', label: '中文', native: '简体', emoji: '🌏' },
  { code: 'ne', label: 'नेपाली', native: 'Nepali', emoji: '🏔' },
  { code: 'uz', label: "O'zbekcha", native: 'Uzbek', emoji: '🌐' }
];

export default function LanguageSelect({ onFinish }) {
  const { i18n } = useTranslation();
  const [selected, setSelected] = useState(i18n.language || null);

  const handleSelectLanguage = (code) => {
    setSelected(code);
    i18n.changeLanguage(code);
    localStorage.setItem('michi_lang', code);
    // Small delay for visual feedback before proceeding
    setTimeout(() => onFinish(), 350);
  };

  return (
    <div className="language-container slide-up">
      {/* Decorative background blobs */}
      <div className="lang-blob lang-blob-1"></div>
      <div className="lang-blob lang-blob-2"></div>

      <div className="language-content">
        <div className="language-header">
          <MichiLogo size={56} fontSize={32} borderRadius={16} />
          <h1 className="lang-title">MICHI</h1>
          <p className="lang-subtitle">道 — Your Path in Japan</p>
        </div>

        <div className="language-grid">
          {LANGUAGES.map((lang, i) => (
            <button 
              key={lang.code} 
              className={`lang-card glass squircle ${selected === lang.code ? 'selected' : ''}`}
              onClick={() => handleSelectLanguage(lang.code)}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="lang-text-group">
                <span className="lang-native-name">{lang.label}</span>
                <span className="lang-sub">{lang.native}</span>
              </div>
              {selected === lang.code && <Check size={18} color="#0A84FF" className="lang-check" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
