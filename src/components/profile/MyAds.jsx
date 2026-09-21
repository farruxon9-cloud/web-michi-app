import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Megaphone, Plus } from 'lucide-react';
import CompanyHome from '../CompanyHome';

export default function MyAds({ onBack, userRole, verifiedCompanies = [] }) {
  const { t } = useTranslation();

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>{t('myPostedAds', 'Mening e\'lonlarim')}</h2>
        <div style={{ width: 40 }} />
      </div>

      <div className="my-ads-content">
        <CompanyHome verifiedCompanies={verifiedCompanies} />
      </div>

      <div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}
