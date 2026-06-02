import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wrench } from 'lucide-react';
import './ServiceComingSoon.css';

export default function ServiceComingSoon() {
  const { t } = useTranslation();

  return (
    <div className="coming-soon-container fade-in">
      <div className="coming-soon-content">
        <div className="service-icon-wrapper">
          <Wrench size={48} />
        </div>
        <h2>{t('comingSoon')}</h2>
        <p>{t('comingSoonDesc')}</p>
      </div>
    </div>
  );
}
