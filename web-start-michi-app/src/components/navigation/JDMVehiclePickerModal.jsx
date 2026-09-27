import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Car, Bike, Check, X } from 'lucide-react';

export default function JDMVehiclePickerModal({
  isOpen,
  onClose,
  selectedVehicle,
  onSelectVehicle,
  VEHICLE_PRESETS,
  height, setHeight,
  width, setWidth,
  weight, setWeight,
  length, setLength,
  axleLoad, setAxleLoad,
  minTurnRadius, setMinTurnRadius
}) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        width: '100%', maxWidth: '480px', background: 'var(--card-bg)', borderRadius: '24px',
        border: '1px solid var(--glass-border)', padding: '20px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(10, 132, 255, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Truck size={22} color="#0A84FF" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: '900', color: 'var(--text-main)' }}>
                Transport Turi va Parametrlari
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Yaponiyaning MLIT yo'l cheklovlari standarti
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

        {/* Preset Cards Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {Object.entries(VEHICLE_PRESETS).map(([key, v]) => {
            const isSelected = selectedVehicle === key;
            return (
              <div
                key={key}
                onClick={() => onSelectVehicle(key)}
                style={{
                  padding: '12px 14px', borderRadius: '16px', cursor: 'pointer',
                  border: isSelected ? '1.5px solid #0A84FF' : '1px solid var(--glass-border)',
                  background: isSelected ? 'rgba(10, 132, 255, 0.12)' : 'var(--glass-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: isSelected ? '#0A84FF' : 'var(--text-main)' }}>
                    {v.uzName || v.jaName || v.name}
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {v.height}m (Baland) × {v.width}m (Eni) • {v.weight}t (Vazn) • {v.license}
                  </span>
                </div>
                {isSelected && (
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0A84FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="#FFF" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Confirm CTA */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%', height: '46px', borderRadius: '23px', border: 'none',
            background: 'linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)',
            color: '#FFFFFF', fontWeight: '900', fontSize: '15px', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(10, 132, 255, 0.35)'
          }}
        >
          Tasdiqlash
        </button>
      </div>
    </div>
  );
}
