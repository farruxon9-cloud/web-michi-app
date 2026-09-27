import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Navigation, Truck, ShieldCheck } from 'lucide-react';
import { playHapticClick } from '../../utils/haptics';

export default function BentoJdmNavigationCard({ onNavigateToJDM }) {
  const { t } = useTranslation();

  const triggerSound = () => {
    try {
      const saved = localStorage.getItem('michi_sound');
      const soundSettings = saved ? JSON.parse(saved) : { sound: true, vibration: true };
      playHapticClick(soundSettings);
    } catch (e) {}
  };

  return (
    <div 
      className="bento-action-card bento-jdm-card squircle" 
      onClick={() => { triggerSound(); onNavigateToJDM(); }}
      style={{ 
        padding: '10px 12px', 
        cursor: 'pointer', 
        marginTop: '10px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.02) 100%)',
        border: '1.2px solid rgba(16, 185, 129, 0.22)',
        borderRadius: '16px',
        boxShadow: '0 3px 14px rgba(16, 185, 129, 0.06)'
      }}
    >
      {/* Floating "Tez orada / 近日公開" Tag */}
      <div style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 5,
        background: 'linear-gradient(135deg, #FF9500 0%, #FF2D55 100%)',
        color: '#FFFFFF',
        fontSize: '9px',
        fontWeight: '900',
        letterSpacing: '0.4px',
        padding: '2px 7px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(255, 149, 0, 0.35)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap'
      }}>
        <Sparkles size={10} color="#FFF" />
        <span>{t('comingSoonTag', 'Tez orada')}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2, gap: '10px' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <span style={{ fontSize: '8.5px', fontWeight: '800', letterSpacing: '0.6px', color: '#10b981', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {t('bentoJDMBadge1', 'Yaponiya Xaritasi')}
            </span>
            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.5)' }}></span>
            <span style={{ fontSize: '8.5px', fontWeight: '800', letterSpacing: '0.6px', color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              {t('bentoJDMBadge2', 'Aqlli Navigatsiya')}
            </span>
          </div>
          
          <h3 style={{ fontSize: '13px', fontWeight: '850', margin: '0 0 2px 0', color: 'var(--text-main)', letterSpacing: '-0.2px', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t('bentoJDMTitle', 'Aqlli Yuk Mashinalari Navigatsiyasi')}
          </h3>
          
          <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '0 0 6px 0', opacity: 0.85, lineHeight: '1.25', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t('bentoJDMSub', 'Yaponiyadagi transport o\'lchamlari va ko\'prik cheklovlari xaritasi')}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: '8.5px', padding: '2px 5px', borderRadius: '5px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.22)', color: '#10b981', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <Truck size={9} color="#10b981" />
              <span>{t('bentoJDMSubtag1', 'Mashina sozlamalari')}</span>
            </span>
            <span style={{ fontSize: '8.5px', padding: '2px 5px', borderRadius: '5px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.22)', color: '#10b981', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <ShieldCheck size={9} color="#10b981" />
              <span>{t('bentoJDMSubtag2', 'Balandlik taqiqi')}</span>
            </span>
            <span style={{ fontSize: '8.5px', padding: '2px 5px', borderRadius: '5px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.22)', color: '#10b981', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
              <Navigation size={9} color="#10b981" />
              <span>{t('bentoJDMSubtag3', 'Vazn cheklovi')}</span>
            </span>
          </div>
        </div>
        
        <div className="bento-international-card-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 3px 10px rgba(16, 185, 129, 0.3)', width: '30px', height: '30px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 'auto' }}>
          <Navigation size={14} color="#FFF" />
        </div>
      </div>
    </div>
  );
}
