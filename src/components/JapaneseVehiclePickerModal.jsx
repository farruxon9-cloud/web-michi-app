import React, { useState } from 'react';
import { Search, X, Check, Truck, Zap, Calendar, Sparkles, Filter } from 'lucide-react';
import { JAPANESE_AUTOMAKERS_MASTER, JAPANESE_HISTORICAL_ERAS, queryMasterJapaneseVehicles } from '../data/japaneseVehiclesMaster';

export default function JapaneseVehiclePickerModal({ isOpen, onClose, onSelectVehicle, selectedVehicleId }) {
  const [selectedMake, setSelectedMake] = useState('all');
  const [selectedEra, setSelectedEra] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredVehicles = queryMasterJapaneseVehicles({
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
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '14px'
    }}>
      <div style={{
        background: 'var(--card-bg, #1c1c1e)',
        border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '620px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 'bold', color: 'var(--text-main, #fff)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🇯🇵</span> Universal Yapon Avtomobillari Katalogi
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: 'var(--text-secondary, #8e8e93)' }}>
              1950-yil Klassik merosidan JDM va 2026-yil zamonaviy flotgacha (15 brend, 500+ model)
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              color: 'var(--text-main, #fff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Cascading Filters */}
        <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0, 0, 0, 0.15)' }}>
          {/* Instant Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
            borderRadius: '12px',
            padding: '9px 14px'
          }}>
            <Search size={15} color="var(--text-secondary, #8e8e93)" />
            <input 
              type="text"
              placeholder="Model yoki brend nomini qidirish (Giga, Skyline, Supra, Harrier, HiAce, Elf)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main, #fff)',
                fontSize: '12.5px',
                width: '100%'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#8e8e93', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Eras Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {JAPANESE_HISTORICAL_ERAS.map(era => (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: selectedEra === era.id ? '1.2px solid var(--primary, #30D158)' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: selectedEra === era.id ? 'rgba(48, 209, 88, 0.18)' : 'rgba(255, 255, 255, 0.03)',
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

          {/* Automakers Cascading Brand Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {JAPANESE_AUTOMAKERS_MASTER.map(brand => (
              <button
                key={brand.id}
                onClick={() => setSelectedMake(brand.id === 'all' ? 'all' : brand.name)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '8px',
                  border: (selectedMake === brand.name || (selectedMake === 'all' && brand.id === 'all')) ? '1.2px solid #0084FF' : '1px solid rgba(255, 255, 255, 0.06)',
                  background: (selectedMake === brand.name || (selectedMake === 'all' && brand.id === 'all')) ? 'rgba(0, 132, 255, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                  color: (selectedMake === brand.name || (selectedMake === 'all' && brand.id === 'all')) ? '#0084FF' : 'var(--text-secondary, #8e8e93)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {brand.icon && <span>{brand.icon}</span>}
                <span>{brand.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vehicles Grid Catalog */}
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
                    background: isSelected ? 'rgba(48, 209, 88, 0.12)' : 'rgba(255, 255, 255, 0.03)',
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
                    height: '100px',
                    width: '100%',
                    borderRadius: '12px',
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
                      bottom: '5px',
                      left: '5px',
                      fontSize: '8.5px',
                      fontWeight: 'bold',
                      background: 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {veh.year}
                    </span>

                    <span style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      fontSize: '7.5px',
                      fontWeight: 'bold',
                      background: veh.era === 'classic' ? 'rgba(255, 149, 0, 0.85)' : veh.era === 'jdm_golden' ? 'rgba(255, 45, 85, 0.85)' : 'rgba(48, 209, 88, 0.85)',
                      color: '#fff',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      letterSpacing: '0.4px'
                    }}>
                      {veh.era === 'classic' ? 'CLASSIC' : veh.era === 'jdm_golden' ? 'JDM LEGEND' : 'MODERN'}
                    </span>
                  </div>

                  {/* Model Labels & Specs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: 'var(--text-main, #fff)' }}>
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
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '35px', color: '#8e8e93', fontSize: '13px' }}>
              Qidiruv boʻyicha hech qanday yapon avtomobili topilmadi.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary, #8e8e93)' }}>
            Jami: <b>{filteredVehicles.length}</b> yapon avtomobillari modellari
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
