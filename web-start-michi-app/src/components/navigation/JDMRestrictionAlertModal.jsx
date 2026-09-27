import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

export default function JDMRestrictionAlertModal({
  isOpen,
  onClose,
  warnings = [],
  overpassRestrictions = []
}) {
  const { t } = useTranslation();
  if (!isOpen || (warnings.length === 0 && overpassRestrictions.length === 0)) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        width: '100%', maxWidth: '440px', background: 'var(--card-bg)', borderRadius: '24px',
        border: '1px solid rgba(255, 59, 48, 0.4)', padding: '20px',
        boxShadow: '0 16px 40px rgba(255, 59, 48, 0.25)', display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 59, 48, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldAlert size={22} color="#FF3B30" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-main)' }}>
                MLIT Yo'l Cheklovi Ogohlantirishlari
              </h3>
              <span style={{ fontSize: '12px', color: '#FF3B30', fontWeight: '700' }}>
                Transport o'lchamlari mos kelmadi
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'var(--glass-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Warnings List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
          {warnings.map((warn, i) => (
            <div key={i} style={{
              padding: '12px', borderRadius: '14px', background: 'rgba(255, 149, 0, 0.1)',
              border: '1px solid rgba(255, 149, 0, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '10px'
            }}>
              <AlertTriangle size={18} color="#FF9500" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {typeof warn === 'string' ? warn : (warn.message || warn.desc || 'Transport cheklovi')}
              </span>
            </div>
          ))}

          {overpassRestrictions.map((item, i) => (
            <div key={`overpass_${i}`} style={{
              padding: '12px', borderRadius: '14px', background: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid rgba(255, 59, 48, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '10px'
            }}>
              <ShieldAlert size={18} color="#FF3B30" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {item.type || 'Balandlik/Vazn taqiqi'}: {item.message || item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Understand Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%', height: '44px', borderRadius: '22px', border: 'none',
            background: 'linear-gradient(135deg, #FF3B30 0%, #FF9500 100%)',
            color: '#FFFFFF', fontWeight: '800', fontSize: '14.5px', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 59, 48, 0.3)'
          }}
        >
          Tushundim (Aylanib o'tish marshrutini tanlash)
        </button>
      </div>
    </div>
  );
}
