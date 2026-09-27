import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

export default function JobFilterFloatingCTA({ filteredJobsCount, onClose }) {
  const { t } = useTranslation();

  return (
    <>
      {/* 78px filter clearance spacer */}
      <div style={{ height: '78px', minHeight: '78px', width: '100%', flexShrink: 0, clear: 'both' }} />

      {/* Floating Search CTA Dock */}
      <div 
        className="floating-search-cta-dock" 
        style={{ 
          position: 'fixed', 
          bottom: '96px', 
          left: 0, 
          right: 0, 
          display: 'flex', 
          justifyContent: 'center', 
          pointerEvents: 'none', 
          zIndex: 250 
        }}
      >
        <button 
          type="button"
          className="townwork-btn-search-cta"
          onClick={onClose}
          style={{ 
            pointerEvents: 'auto', 
            width: 'calc(100% - 28px)', 
            maxWidth: '792px', 
            padding: '14px 20px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)', 
            color: '#FFF', 
            fontWeight: '900', 
            fontSize: '15px', 
            border: 'none', 
            cursor: 'pointer', 
            boxShadow: '0 4px 16px rgba(10, 132, 255, 0.3)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px' 
          }}
        >
          <Search size={18} color="#FFF" />
          <span>{t('applyFiltersCTA', 'この条件で検索する ({{count}}件)', { count: filteredJobsCount })}</span>
        </button>
      </div>
    </>
  );
}
