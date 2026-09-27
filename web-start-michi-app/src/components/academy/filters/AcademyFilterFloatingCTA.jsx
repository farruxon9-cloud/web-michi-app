import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

export default function AcademyFilterFloatingCTA({ filteredSchoolsCount, onClose }) {
  const { t } = useTranslation();

  return (
    <>
      {/* 160px filter clearance spacer so filter content scrolls past floating CTA button */}
      <div style={{ height: '160px', minHeight: '160px', width: '100%', flexShrink: 0, clear: 'both' }} />

      {/* Pinned Search CTA Button Dock — floating 12px above BottomNav */}
      <div style={{
        position: 'fixed',
        bottom: '96px',
        left: 'var(--screen-margin-x, 14px)',
        width: 'var(--card-width-full, calc(100% - 28px))',
        zIndex: 250,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button 
          type="button" 
          className="townwork-btn-search-cta" 
          onClick={onClose}
          style={{
            pointerEvents: 'auto',
            width: '100%', height: '52px', fontSize: '16px', fontWeight: '800',
            borderRadius: '26px', background: 'linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%)',
            color: '#FFFFFF', boxShadow: '0 10px 28px rgba(10, 132, 255, 0.45)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0
          }}
        >
          <Search size={19} color="#FFF" />
          <span>{t('searchSchoolCountBtn', '{{count}}件の教習所を検索', { count: filteredSchoolsCount })}</span>
        </button>
      </div>
    </>
  );
}
