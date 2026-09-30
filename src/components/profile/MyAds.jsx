import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import CompanyHome from '../CompanyHome';

const DICT = {
  myPostedAds: { ja: '求人・掲載管理', uz: 'Mening e\'lonlarim', en: 'My Posted Ads', ru: 'Мои объявления', zh: '我的职位发布' },
  backLabel: { ja: '戻る', uz: 'Orqaga', en: 'Back', ru: 'Назад', zh: '返回' }
};

export default function MyAds({ onBack, userRole, verifiedCompanies = [] }) {
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
        <h2>{getStr('myPostedAds')}</h2>
        <div style={{ width: 40 }} aria-hidden="true" />
      </div>

      <div className="my-ads-content">
        <CompanyHome verifiedCompanies={verifiedCompanies} />
      </div>

      <div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}

