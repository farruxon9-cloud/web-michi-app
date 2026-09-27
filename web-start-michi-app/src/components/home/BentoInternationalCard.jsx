import React from 'react';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react';

export default function BentoInternationalCard({ onNavigateToInternational }) {
  const { t } = useTranslation();

  return (
    <div 
      className="bento-action-card bento-international-card squircle" 
      onClick={onNavigateToInternational}
      style={{ padding: '20px 24px', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2 }}>
        <div style={{ flex: 1, paddingRight: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="premium-live-dot"></span>
            <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              🇯🇵 JAPAN RECRUITING
            </span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }}></span>
            <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1px', color: '#AF52DE', textTransform: 'uppercase' }}>
              SSW Visa
            </span>
          </div>
          
          <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 6px 0', color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: '1.2' }}>
            {t('bentoInternationalTitle', 'Xalqaro Ishlar')}
          </h3>
          
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 12px 0', opacity: 0.85, lineHeight: '1.4' }}>
            {t('bentoInternationalSub', 'Tokutei Ginou viza beruvchi e\'lonlar')}
          </p>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: '700' }}>
              特定技能 (SSW)
            </span>
            <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: '700' }}>
              {t('bentoHousingAvailable', '🏠 Uy-joy bor')}
            </span>
            <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: '700' }}>
              {t('bentoMinN4', 'Minimal N4')}
            </span>
          </div>
        </div>
        
        <div className="bento-international-card-icon">
          <Compass size={24} />
        </div>
      </div>
    </div>
  );
}
