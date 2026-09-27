import React from 'react';
import { useTranslation } from 'react-i18next';
import { Compass, MapPin, Navigation, X } from 'lucide-react';

export default function JDMPOIModal({
  isOpen,
  onClose,
  selectedPOIType,
  setSelectedPOIType,
  poiResults = [],
  onSelectPOI
}) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const categories = [
    { id: 'fuel', icon: '⛽', label: 'Yoqilg\'i (Gas)' },
    { id: 'convenience', icon: '🏪', label: 'Do\'kon (Konbini)' },
    { id: 'rest_area', icon: '🅿️', label: 'SA/PA Dam olish' },
    { id: 'parking', icon: '🅿️', label: 'Parkovka' },
    { id: 'restaurant', icon: '🍜', label: 'Ovqatlanish' }
  ];

  return (
    <div style={{
      position: 'absolute', bottom: '90px', left: '14px', right: '14px', zIndex: 450,
      background: 'var(--card-bg)', backdropFilter: 'blur(25px)', WebkitBackdropFilter: 'blur(25px)',
      border: '1px solid var(--glass-border)', borderRadius: '22px', padding: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', gap: '12px',
      maxHeight: '340px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="#0A84FF" />
          <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
            Atrofdagi Ob'ektlar (POI)
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', background: 'var(--glass-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={14} color="var(--text-secondary)" />
        </button>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }} className="hide-scrollbar">
        {categories.map(cat => {
          const isSelected = selectedPOIType === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedPOIType(cat.id)}
              style={{
                padding: '6px 12px', borderRadius: '14px', border: isSelected ? '1px solid #0A84FF' : '1px solid var(--glass-border)',
                background: isSelected ? 'rgba(10, 132, 255, 0.15)' : 'var(--glass-bg)',
                color: isSelected ? '#0A84FF' : 'var(--text-secondary)',
                fontWeight: isSelected ? '800' : '600', fontSize: '12px', cursor: 'pointer', flexShrink: 0
              }}
            >
              <span>{cat.icon} {cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* POI List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
        {poiResults.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            Atrofda obyektlar qidirilmoqda...
          </div>
        ) : (
          poiResults.map(poi => (
            <div
              key={poi.id}
              onClick={() => onSelectPOI(poi)}
              style={{
                padding: '10px 12px', borderRadius: '12px', background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>
                  {poi.name || poi.jaName}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {poi.hours || '24/7'} • {poi.distance ? `${Math.round(poi.distance * 1000)}m` : 'Yaqin'}
                </span>
              </div>
              <Navigation size={14} color="#0A84FF" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
