import React from 'react';
import { useTranslation } from 'react-i18next';
import { Wrench } from 'lucide-react';
import './ServiceComingSoon.css';

export default function ServiceComingSoon() {
  const { t } = useTranslation();

  return (
    <div className="coming-soon-container fade-in">
      <div className="coming-soon-content">
        <div className="icon-wrapper">
          <Wrench size={48} color="#AF52DE" aria-hidden="true" />
        </div>
        <h2>{t('comingSoon', 'Tez kunda')}</h2>
        <p>{t('comingSoonDesc', 'Tez orada ushbu bo\'limda yangi xizmatlar paydo bo\'ladi.')}</p>
      </div>
    </div>
  );
}
