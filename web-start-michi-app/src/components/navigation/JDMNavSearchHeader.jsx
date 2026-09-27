import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search, MapPin, Truck, SlidersHorizontal, Plus, Trash2, Bookmark, Compass } from 'lucide-react';

export default function JDMNavSearchHeader({
  onBack,
  startQuery,
  setStartQuery,
  startSuggestions = [],
  searchAddress,
  setStartCoord,
  destQuery,
  setDestQuery,
  destSuggestions = [],
  setDestCoord,
  selectedVehicle,
  VEHICLE_PRESETS,
  setShowNavVehicleMenu,
  avoidTolls,
  setAvoidTolls,
  avoidHighways,
  setAvoidHighways,
  stops = [],
  handleAddStop,
  handleRemoveStop,
  handleStopQueryChange,
  showBookmarksPanel,
  setShowBookmarksPanel,
  showPOIPanel,
  setShowPOIPanel
}) {
  const { t } = useTranslation();
  const activePreset = VEHICLE_PRESETS[selectedVehicle] || VEHICLE_PRESETS.light;

  return (
    <div className="jdm-search-header-container" style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 300,
      padding: '12px 14px', pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '8px'
    }}>
      {/* Top Bar: Back Button, Search Inputs, Vehicle Pill, Bookmarks */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--glass-border)',
            background: 'var(--card-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.1)', flexShrink: 0
          }}
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Start / Destination Input Stack */}
        <div style={{
          flex: 1, background: 'var(--card-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '18px', border: '1px solid var(--glass-border)', padding: '6px 12px',
          display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          {/* Start Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#30D158', flexShrink: 0 }} />
            <input
              type="text"
              placeholder={t('startPlaceholder', 'Boshlang\'ich manzil (GPS/Matsudo)...')}
              value={startQuery}
              onChange={(e) => {
                setStartQuery(e.target.value);
                searchAddress(e.target.value, 'start');
              }}
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-main)', fontSize: '13px', fontWeight: '600', padding: '4px 0'
              }}
            />
          </div>

          <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0 4px' }} />

          {/* Destination Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF3B30', flexShrink: 0 }} />
            <input
              type="text"
              placeholder={t('destPlaceholder', 'Boradigan manzilni kiriting...')}
              value={destQuery}
              onChange={(e) => {
                setDestQuery(e.target.value);
                searchAddress(e.target.value, 'dest');
              }}
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-main)', fontSize: '13px', fontWeight: '700', padding: '4px 0'
              }}
            />
          </div>
        </div>

        {/* Vehicle Spec Pill Trigger */}
        <button
          type="button"
          onClick={() => setShowNavVehicleMenu(true)}
          style={{
            height: '40px', padding: '0 12px', borderRadius: '20px', border: '1px solid rgba(10, 132, 255, 0.3)',
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.12), rgba(94, 92, 230, 0.12))',
            color: '#0A84FF', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center',
            gap: '6px', cursor: 'pointer', boxShadow: '0 2px 10px rgba(10, 132, 255, 0.15)', flexShrink: 0
          }}
        >
          <Truck size={15} />
          <span>{activePreset.short || activePreset.jaShort || 'Vehicle'}</span>
        </button>
      </div>

      {/* Route Preference Quick Chips (Avoid Tolls / Avoid Highways / Add Stop) */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', pointerEvents: 'auto' }} className="hide-scrollbar">
        <button
          type="button"
          onClick={() => setAvoidTolls(!avoidTolls)}
          style={{
            padding: '6px 12px', borderRadius: '14px', border: avoidTolls ? '1.5px solid #FF9500' : '1px solid var(--glass-border)',
            background: avoidTolls ? 'rgba(255, 149, 0, 0.15)' : 'var(--card-bg)',
            color: avoidTolls ? '#FF9500' : 'var(--text-secondary)',
            fontWeight: avoidTolls ? '800' : '600', fontSize: '11.5px', cursor: 'pointer', flexShrink: 0
          }}
        >
          {t('avoidTolls', '料金所を避ける')}
        </button>

        <button
          type="button"
          onClick={() => setAvoidHighways(!avoidHighways)}
          style={{
            padding: '6px 12px', borderRadius: '14px', border: avoidHighways ? '1.5px solid #FF9500' : '1px solid var(--glass-border)',
            background: avoidHighways ? 'rgba(255, 149, 0, 0.15)' : 'var(--card-bg)',
            color: avoidHighways ? '#FF9500' : 'var(--text-secondary)',
            fontWeight: avoidHighways ? '800' : '600', fontSize: '11.5px', cursor: 'pointer', flexShrink: 0
          }}
        >
          {t('avoidHighways', '高速道路を避ける')}
        </button>

        <button
          type="button"
          onClick={handleAddStop}
          style={{
            padding: '6px 12px', borderRadius: '14px', border: '1px solid var(--glass-border)',
            background: 'var(--card-bg)', color: 'var(--primary)',
            fontWeight: '700', fontSize: '11.5px', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          <Plus size={13} />
          <span>{t('addStop', '経由地を追加')}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowPOIPanel(!showPOIPanel)}
          style={{
            padding: '6px 12px', borderRadius: '14px', border: '1px solid var(--glass-border)',
            background: showPOIPanel ? 'rgba(10, 132, 255, 0.15)' : 'var(--card-bg)',
            color: showPOIPanel ? '#0A84FF' : 'var(--text-main)',
            fontWeight: '700', fontSize: '11.5px', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '4px'
          }}
        >
          <Compass size={13} />
          <span>Atrof (POI)</span>
        </button>
      </div>

      {/* Start Suggestions Dropdown */}
      {startSuggestions.length > 0 && (
        <div style={{
          background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)',
          padding: '6px', pointerEvents: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}>
          {startSuggestions.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                setStartCoord(item);
                setStartQuery(item.name || item.jaName);
                searchAddress('', 'start');
              }}
              style={{
                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600', color: 'var(--text-main)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <MapPin size={14} color="#30D158" />
              <span>{item.name || item.jaName}</span>
            </div>
          ))}
        </div>
      )}

      {/* Destination Suggestions Dropdown */}
      {destSuggestions.length > 0 && (
        <div style={{
          background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)',
          padding: '6px', pointerEvents: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}>
          {destSuggestions.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                setDestCoord(item);
                setDestQuery(item.name || item.jaName);
                searchAddress('', 'dest');
              }}
              style={{
                padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                fontSize: '13px', fontWeight: '700', color: 'var(--text-main)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              <MapPin size={14} color="#FF3B30" />
              <span>{item.name || item.jaName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
