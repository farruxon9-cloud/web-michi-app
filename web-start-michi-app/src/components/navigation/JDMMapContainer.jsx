import React from 'react';
import { Locate, Layers, Sun, Moon } from 'lucide-react';

export default function JDMMapContainer({
  mapContainerRef,
  isMapLoaded,
  mapErrorMsg,
  mapStyleMode,
  setMapStyleMode,
  is3D,
  setIs3D,
  mapBearing,
  mapOrientation,
  setMapOrientation,
  showTrafficLayer,
  setShowTrafficLayer,
  showLayerMenu,
  setShowLayerMenu,
  onLocateUser,
  gpsBottomOffset = 100,
  isNavigating,
  darkMode
}) {
  return (
    <div className="jdm-map-wrapper" style={{ position: 'relative', width: '100%', height: '100%', flex: 1, minHeight: 0 }}>
      {/* MapLibre DOM Container */}
      <div 
        ref={mapContainerRef} 
        className="jdm-map-container"
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
      />

      {/* Map Error Notice Overlay */}
      {mapErrorMsg && (
        <div style={{
          position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 400,
          background: 'rgba(255, 59, 48, 0.9)', color: '#FFFFFF', padding: '12px 16px',
          borderRadius: '14px', fontSize: '13px', fontWeight: '700', backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(255, 59, 48, 0.3)'
        }}>
          ⚠️ {mapErrorMsg}
        </div>
      )}

      {/* Map Controls Floating Right Stack */}
      <div 
        className="jdm-map-controls-stack"
        style={{
          position: 'absolute',
          right: '16px',
          bottom: `${gpsBottomOffset}px`,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 350,
          transition: 'bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Layer / Style Toggle */}
        <button
          type="button"
          className="map-control-btn glass"
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
            color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
          }}
          title="Xarita qatlamlari"
        >
          <Layers size={20} />
        </button>

        {/* Compass / Orientation Toggle */}
        <button
          type="button"
          className="map-control-btn glass"
          onClick={() => setMapOrientation(mapOrientation === 'heading' ? 'north' : 'heading')}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'var(--card-bg)', border: '1px solid var(--glass-border)',
            color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            transform: mapOrientation === 'heading' ? `rotate(${-mapBearing}deg)` : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
          title={mapOrientation === 'heading' ? 'Heading-Up' : 'North-Up'}
        >
          <span style={{ fontSize: '12px', fontWeight: '900', color: mapOrientation === 'heading' ? '#0A84FF' : 'var(--text-secondary)' }}>
            {mapOrientation === 'heading' ? '▲' : 'N'}
          </span>
        </button>

        {/* Locate User Button */}
        <button
          type="button"
          className="map-control-btn glass"
          onClick={onLocateUser}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'var(--primary)', border: 'none',
            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 16px rgba(10, 132, 255, 0.4)'
          }}
          title="Hozirgi joylashuv"
        >
          <Locate size={20} color="#FFFFFF" />
        </button>
      </div>

      {/* Layer Select Menu Dropdown */}
      {showLayerMenu && (
        <div style={{
          position: 'absolute', right: '16px', bottom: `${gpsBottomOffset + 140}px`, zIndex: 400,
          background: 'var(--card-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)', borderRadius: '18px', padding: '12px',
          display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.16)'
        }}>
          <button
            type="button"
            onClick={() => { setMapStyleMode(mapStyleMode === 'vector' ? 'satellite' : 'vector'); setShowLayerMenu(false); }}
            style={{
              padding: '8px 12px', borderRadius: '12px', border: 'none',
              background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF',
              fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', textAlign: 'left'
            }}
          >
            🗺️ {mapStyleMode === 'vector' ? 'Sun\'niy yo\'ldosh (Satellite)' : 'Vektor xaritasi'}
          </button>
          <button
            type="button"
            onClick={() => { setIs3D(!is3D); setShowLayerMenu(false); }}
            style={{
              padding: '8px 12px', borderRadius: '12px', border: 'none',
              background: is3D ? 'rgba(48, 209, 88, 0.15)' : 'var(--glass-bg)',
              color: is3D ? '#30D158' : 'var(--text-main)',
              fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', textAlign: 'left'
            }}
          >
            🏢 3D Binolar {is3D ? '(Yoqilgan)' : '(O\'chirilgan)'}
          </button>
        </div>
      )}
    </div>
  );
}
