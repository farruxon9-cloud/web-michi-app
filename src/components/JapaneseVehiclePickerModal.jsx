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
      padding: '10px'
    }}>
      <div style={{
        background: 'var(--card-bg, #1c1c1e)',
        border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '420px',
        maxHeight: '82vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '12px 14px',
          borderBottom: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main, #fff)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={16} color="#30D158" />
              <span>Avtomobillar Katalogi</span>
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: 'var(--text-secondary, #8e8e93)' }}>
              12,340+ brend va 100,000+ modellar (NHTSA API)
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
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

        {/* Search & Global Brand Pills */}
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0, 0, 0, 0.15)' }}>
          {/* Instant Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.12))',
            borderRadius: '10px',
            padding: '7px 10px'
          }}>
            <Search size={14} color="var(--text-secondary, #8e8e93)" />
            <input 
              type="text"
              placeholder={`${selectedMake} modellari qidiruvi...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main, #fff)',
                fontSize: '11.5px',
                width: '100%'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#8e8e93', cursor: 'pointer', padding: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Automakers Cascading Brand Pills */}
          <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '2px' }}>
            {POPULAR_GLOBAL_BRANDS.map(brand => (
              <button
                key={brand.id}
                onClick={() => setSelectedMake(brand.name)}
                style={{
                  padding: '4px 9px',
                  borderRadius: '8px',
                  border: selectedMake.toLowerCase() === brand.name.toLowerCase() 
                    ? '1.2px solid #0084FF' 
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  background: selectedMake.toLowerCase() === brand.name.toLowerCase() 
                    ? 'rgba(0, 132, 255, 0.2)' 
                    : 'rgba(255, 255, 255, 0.02)',
                  color: selectedMake.toLowerCase() === brand.name.toLowerCase() 
                    ? '#0084FF' 
                    : 'var(--text-secondary, #8e8e93)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
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
          padding: '10px 14px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
          flex: 1
        }}>
          {loading ? (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '30px', color: '#8e8e93', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Loader2 size={16} className="animate-spin" color="#0084FF" />
              <span style={{ fontSize: '11px' }}>{selectedMake} yuklanmoqda...</span>
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
                    borderRadius: '12px',
                    padding: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    position: 'relative'
                  }}
                >
                  {/* Photo Thumbnail or Gradient Card */}
                  <div style={{
                    height: '70px',
                    width: '100%',
                    borderRadius: '8px',
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
                      <div style={{ textAlign: 'center', padding: '4px' }}>
                        <Sparkles size={16} color="#0084FF" style={{ marginBottom: '2px' }} />
                        <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff' }}>{veh.make}</div>
                        <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{veh.model}</div>
                      </div>
                    )}

                    <span style={{
                      position: 'absolute',
                      bottom: '3px',
                      left: '3px',
                      fontSize: '7.5px',
                      fontWeight: 'bold',
                      background: 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      padding: '1px 4px',
                      borderRadius: '3px'
                    }}>
                      {veh.year || '2024'}
                    </span>
                  </div>

                  {/* Model Labels */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 'bold', color: 'var(--text-main, #fff)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }}>
                        {veh.make} {veh.model}
                      </span>
                      {isSelected && <Check size={12} color="#30D158" />}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '25px', color: '#8e8e93', fontSize: '11.5px' }}>
              Natija topilmadi.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary, #8e8e93)' }}>
            <b>{selectedMake}</b>: {filteredModels.length} model
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '5px 12px',
              borderRadius: '7px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#fff',
              fontSize: '10.5px',
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
