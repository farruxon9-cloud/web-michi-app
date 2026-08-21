import React, { useState } from 'react';
import { Search, X, Check, Truck, Zap, Calendar, Award } from 'lucide-react';
import { JAPANESE_AUTOMAKERS, HISTORICAL_ERAS, queryJapaneseVehicles } from '../data/japaneseVehiclesDb';

export default function JapaneseVehiclePickerModal({ isOpen, onClose, onSelectVehicle, selectedVehicleId }) {
  const [selectedMake, setSelectedMake] = useState('all');
  const [selectedEra, setSelectedEra] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredVehicles = queryJapaneseVehicles({
    make: selectedMake,
    era: selectedEra,
    search: searchQuery
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--card-bg, #1c1c1e)',
        border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main, #fff)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🇯🇵</span> Yapon Avtomobillari Katalogi
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary, #8e8e93)' }}>
              1950-yil Klassik davrdan zamonaviy flotgacha barcha moshinalar
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--text-main, #fff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Filters */}
        <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0, 0, 0, 0.1)' }}>
          {/* Instant Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.1))',
            borderRadius: '12px',
            padding: '8px 12px'
          }}>
            <Search size={14} color="var(--text-secondary, #8e8e93)" />
            <input 
              type="text"
              placeholder="Model yoki brend nomini qidirish (Giga, Skyline, Supra)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main, #fff)',
                fontSize: '12px',
                width: '100%'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#8e8e93', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Eras Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {HISTORICAL_ERAS.map(era => (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '10px',
                  border: selectedEra === era.id ? '1px solid var(--primary, #30D158)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: selectedEra === era.id ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedEra === era.id ? 'var(--primary, #30D158)' : 'var(--text-secondary, #8e8e93)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{era.icon}</span>
                <span>{era.label}</span>
              </button>
            ))}
          </div>

          {/* Automakers Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {JAPANESE_AUTOMAKERS.map(brand => (
              <button
                key={brand.id}
                onClick={() => setSelectedMake(brand.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: selectedMake === brand.id ? '1px solid #0084FF' : '1px solid rgba(255, 255, 255, 0.06)',
                  background: selectedMake === brand.id ? 'rgba(0, 132, 255, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                  color: selectedMake === brand.id ? '#0084FF' : 'var(--text-secondary, #8e8e93)',
                  fontSize: '10.5px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicles Grid */}
        <div style={{
          padding: '16px 20px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          flex: 1
        }}>
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map(veh => {
              const isSelected = selectedVehicleId === veh.id;
              return (
                <div
                  key={veh.id}
                  onClick={() => {
                    onSelectVehicle(veh);
                    onClose();
                  }}
                  style={{
                    background: isSelected ? 'rgba(48, 209, 88, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: isSelected ? '1.5px solid #30D158' : '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
                    borderRadius: '16px',
                    padding: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    position: 'relative',
                    transition: 'transform 0.15s ease, border-color 0.15s ease'
                  }}
                >
                  {/* Photo Thumbnail */}
                  <div style={{
                    height: '95px',
                    width: '100%',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: 'rgba(0,0,0,0.3)',
                    position: 'relative'
                  }}>
                    <img 
                      src={veh.photoUrl} 
                      alt={veh.model} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '4px',
                      fontSize: '8.5px',
                      fontWeight: 'bold',
                      background: 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {veh.year}
                    </span>
                  </div>

                  {/* Info Labels */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main, #fff)' }}>
                        {veh.make} {veh.model}
                      </span>
                      {isSelected && <Check size={14} color="#30D158" />}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary, #8e8e93)' }}>
                      {veh.modelJa}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '30px', color: '#8e8e93', fontSize: '13px' }}>
              Qidiruv boʻyicha hech qanday yapon avtomobili topilmadi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
