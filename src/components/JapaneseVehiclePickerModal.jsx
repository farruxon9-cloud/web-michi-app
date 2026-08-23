import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Check, Globe, Loader2, Sparkles } from 'lucide-react';
import { POPULAR_GLOBAL_BRANDS, getModelsForMake } from '../services/vehicleApiService';
import { MASTER_VEHICLE_DATABASE, JAPANESE_HISTORICAL_ERAS } from '../data/japaneseVehiclesMaster';
import LazyVehicleImage from './LazyVehicleImage';

export default function JapaneseVehiclePickerModal({ isOpen, onClose, onSelectVehicle, selectedVehicleId }) {
  const [selectedMake, setSelectedMake] = useState('Toyota');
  const [selectedEra, setSelectedEra] = useState('all');
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
    // Era filter
    if (selectedEra !== 'all' && m.era !== selectedEra) return false;
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchModel = m.model.toLowerCase().includes(q) || (m.modelJa && m.modelJa.toLowerCase().includes(q));
      const matchMake = m.make.toLowerCase().includes(q);
      if (!matchModel && !matchMake) return false;
    }
    return true;
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1c1c1e 0%, #121214 100%)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '430px',
        maxHeight: '84vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 132, 255, 0.15)'
      }}>
        {/* Pro Header with Live Status Badge */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(255,149,0,0.08) 0%, rgba(0,132,255,0.08) 100%)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #0084FF 0%, #30D158 100%)',
                padding: '4px',
                borderRadius: '8px',
                display: 'inline-flex'
              }}>
                <Globe size={14} color="#fff" />
              </span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#fff', letterSpacing: '-0.2px' }}>
                Avtomobil Katalogi
              </h3>
              <span style={{
                fontSize: '9px',
                fontWeight: 'bold',
                background: 'rgba(48, 209, 88, 0.2)',
                color: '#30D158',
                border: '1px solid rgba(48, 209, 88, 0.4)',
                padding: '1px 6px',
                borderRadius: '10px'
              }}>
                PRO FLEET
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.65)' }}>
              12,340+ Global Brendlar & Real HD Foto Integratsiya
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Search Bar & Era / Brand Pills */}
        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0, 0, 0, 0.25)' }}>
          {/* Pro Search Field */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '8px 12px',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}>
            <Search size={14} color="#0084FF" />
            <input 
              type="text"
              placeholder={`${selectedMake} modellari boʻyicha qidiruv (Corolla, Supra, X5)...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '11.5px',
                fontWeight: '500',
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

          {/* Era Filter Pills */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
            {JAPANESE_HISTORICAL_ERAS.map(era => (
              <button
                key={era.id}
                onClick={() => setSelectedEra(era.id)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '7px',
                  border: selectedEra === era.id ? '1px solid #FF9500' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: selectedEra === era.id ? 'rgba(255, 149, 0, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  color: selectedEra === era.id ? '#FF9500' : 'rgba(255, 255, 255, 0.7)',
                  fontSize: '9.5px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <span>{era.icon}</span>
                <span>{era.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Automakers Cascading Brand Pills */}
          <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '2px' }}>
            {POPULAR_GLOBAL_BRANDS.map(brand => {
              const isActive = selectedMake.toLowerCase() === brand.name.toLowerCase();
              return (
                <button
                  key={brand.id}
                  onClick={() => setSelectedMake(brand.name)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '9px',
                    border: isActive 
                      ? '1.2px solid #0084FF' 
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(0, 132, 255, 0.28) 0%, rgba(48, 209, 88, 0.2) 100%)' 
                      : 'rgba(255, 255, 255, 0.03)',
                    color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.75)',
                    fontSize: '10.5px',
                    fontWeight: isActive ? '800' : '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: isActive ? '0 0 10px rgba(0, 132, 255, 0.35)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '11px' }}>{brand.icon}</span>
                  <span>{brand.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vehicles Pro Grid Catalog */}
        <div style={{
          padding: '10px 14px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '9px',
          flex: 1
        }}>
          {loading ? (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '35px', color: '#8e8e93', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 size={20} className="animate-spin" color="#0084FF" />
              <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#fff' }}>{selectedMake} floti yuklanmoqda...</span>
            </div>
          ) : filteredModels.length > 0 ? (
            filteredModels.map(veh => {
              const isSelected = selectedVehicleId === veh.id;

              return (
                <div
                  key={veh.id}
                  onClick={() => {
                    onSelectVehicle({
                      ...veh,
                      photoUrl: veh.photoUrl || veh._resolvedPhoto || null
                    });
                    onClose();
                  }}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(48, 209, 88, 0.18) 0%, rgba(0, 132, 255, 0.12) 100%)' 
                      : 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    border: isSelected 
                      ? '1.5px solid #30D158' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '14px',
                    padding: '7px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    position: 'relative',
                    boxShadow: isSelected 
                      ? '0 0 12px rgba(48, 209, 88, 0.3)' 
                      : '0 4px 10px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Lazy Vehicle Image */}
                  <LazyVehicleImage
                    make={veh.make}
                    model={veh.model}
                    photoUrl={veh.photoUrl}
                    bodyStyle={veh.bodyStyle || 'sedan'}
                    type={veh.type || 'car'}
                    height={75}
                    onPhotoLoaded={(url) => {
                      veh._resolvedPhoto = url;
                    }}
                  />

                  {/* Model Labels */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '125px' }}>
                        {veh.make} {veh.model}
                      </span>
                      {isSelected && (
                        <span style={{ background: '#30D158', borderRadius: '50%', padding: '2px', display: 'inline-flex' }}>
                          <Check size={10} color="#000" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '30px', color: '#8e8e93', fontSize: '11.5px' }}>
              Ushbu filtr boʻyicha avtomobil topilmadi.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#30D158', display: 'inline-block' }}></span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
              <b>{selectedMake}</b>: {filteredModels.length} model yuklandi
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
              border: '1px solid rgba(255,255,255,0.15)',
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
