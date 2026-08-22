import React, { useState, useEffect } from 'react';
import { Search, X, Check, Globe, Loader2, Sparkles } from 'lucide-react';
import { POPULAR_GLOBAL_BRANDS, getModelsForMake } from '../services/vehicleApiService';
import { MASTER_VEHICLE_DATABASE } from '../data/japaneseVehiclesMaster';

export default function JapaneseVehiclePickerModal({ isOpen, onClose, onSelectVehicle, selectedVehicleId }) {
  const [selectedMake, setSelectedMake] = useState('Toyota');
  const [searchQuery, setSearchQuery] = useState('');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadModels() {
      setLoading(true);
      try {
        // Fetch from NHTSA API (cached automatically)
        const apiModels = await getModelsForMake(selectedMake);
        
        // Also query local preset items for this make if any
        const localItems = MASTER_VEHICLE_DATABASE.filter(
          v => v.make.toLowerCase() === selectedMake.toLowerCase()
        );

        // Merge API & local items safely
        const combined = [...localItems];
        apiModels.forEach(apiM => {
          const exists = combined.some(c => c.model.toLowerCase() === apiM.model.toLowerCase());
          if (!exists) {
            combined.push({
              id: apiM.id,
              make: apiM.make,
              makeJa: apiM.make,
              model: apiM.model,
              modelJa: apiM.model,
              era: 'modern',
              year: '2024',
              type: apiM.model.toLowerCase().includes('truck') ? 'truck_4t' : 'car',
              bodyStyle: apiM.model.toLowerCase().includes('suv') ? 'suv' : 'sedan',
              photoUrl: null
            });
          }
        });

        if (isMounted) {
          setModels(combined);
        }
      } catch (err) {
        console.warn('Failed to load vehicle models:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadModels();
    return () => { isMounted = false; };
  }, [isOpen, selectedMake]);

  if (!isOpen) return null;

  const filteredModels = models.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.model.toLowerCase().includes(q) ||
      (m.modelJa && m.modelJa.toLowerCase().includes(q)) ||
      m.make.toLowerCase().includes(q)
    );
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
              <Globe size={18} color="#30D158" />
              <span>Universal Avtomobillar Katalogi</span>
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: 'var(--text-secondary, #8e8e93)' }}>
              Butun dunyo boʻyicha 12,340+ brend va 100,000+ modellar (NHTSA API Instant Fetch)
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

        {/* Search & Global Brand Pills */}
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
              placeholder={`${selectedMake} modellari boʻyicha qidirish (Corolla, Supra, X5, Civic)...`}
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

          {/* Automakers Cascading Brand Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {POPULAR_GLOBAL_BRANDS.map(brand => (
              <button
                key={brand.id}
                onClick={() => setSelectedMake(brand.name)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: selectedMake.toLowerCase() === brand.name.toLowerCase() 
                    ? '1.2px solid #0084FF' 
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  background: selectedMake.toLowerCase() === brand.name.toLowerCase() 
                    ? 'rgba(0, 132, 255, 0.2)' 
                    : 'rgba(255, 255, 255, 0.02)',
                  color: selectedMake.toLowerCase() === brand.name.toLowerCase() 
                    ? '#0084FF' 
                    : 'var(--text-secondary, #8e8e93)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{brand.icon}</span>
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
          {loading ? (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: '#8e8e93', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 size={18} className="animate-spin" color="#0084FF" />
              <span style={{ fontSize: '12px' }}>{selectedMake} modellari yuklanmoqda...</span>
            </div>
          ) : filteredModels.length > 0 ? (
            filteredModels.map(veh => {
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
                    position: 'relative'
                  }}
                >
                  {/* Photo Thumbnail or Gradient Card */}
                  <div style={{
                    height: '95px',
                    width: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: veh.photoUrl 
                      ? 'rgba(0,0,0,0.3)' 
                      : 'linear-gradient(135deg, rgba(0,132,255,0.2) 0%, rgba(48,209,88,0.2) 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {veh.photoUrl ? (
                      <img 
                        src={veh.photoUrl} 
                        alt={veh.model} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '8px' }}>
                        <Sparkles size={20} color="#0084FF" style={{ marginBottom: '4px' }} />
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{veh.make}</div>
                        <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.7)' }}>{veh.model}</div>
                      </div>
                    )}

                    <span style={{
                      position: 'absolute',
                      bottom: '5px',
                      left: '5px',
                      fontSize: '8.5px',
                      fontWeight: 'bold',
                      background: 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {veh.year || '2024'}
                    </span>
                  </div>

                  {/* Model Labels */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main, #fff)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {veh.make} {veh.model}
                      </span>
                      {isSelected && <Check size={14} color="#30D158" />}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '35px', color: '#8e8e93', fontSize: '13px' }}>
              Natija topilmadi. Qidiruv soʻzini tekshiring.
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
            <b>{selectedMake}</b>: {filteredModels.length} ta model topildi
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
