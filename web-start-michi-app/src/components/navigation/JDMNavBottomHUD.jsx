import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation, Play, Pause, RotateCcw, ShieldAlert, CornerUpRight, CornerUpLeft, ArrowUp, Clock, Banknote, ShieldCheck } from 'lucide-react';
import LaneIndicator from '../LaneIndicator';

export default function JDMNavBottomHUD({
  bottomPanelRef,
  isNavigating,
  route,
  navSteps = [],
  currentStepIndex = 0,
  isAutoPlaying,
  onToggleAutoPlay,
  onNextStep,
  onPrevStep,
  onStartNavigation,
  onStopNavigation,
  onRecalculateRoute,
  tollEstimate = { cash: 0, etc: 0 },
  etaText = '--:--',
  selectedVehicle
}) {
  const { t } = useTranslation();
  const currentStep = navSteps[currentStepIndex] || null;

  const renderStepIcon = (maneuverType) => {
    switch (maneuverType) {
      case 'turn-left':
      case 'sharp left':
      case 'slight left':
        return <CornerUpLeft size={28} color="#0A84FF" />;
      case 'turn-right':
      case 'sharp right':
      case 'slight right':
        return <CornerUpRight size={28} color="#0A84FF" />;
      default:
        return <ArrowUp size={28} color="#30D158" />;
    }
  };

  if (!isNavigating && (!route || !route.coordinates || route.coordinates.length === 0)) {
    return null;
  }

  return (
    <div
      ref={bottomPanelRef}
      className="jdm-bottom-hud-dock"
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 350,
        padding: '14px 16px', background: 'var(--card-bg)', backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
        borderTop: '1px solid var(--glass-border)', boxShadow: '0 -8px 32px rgba(0,0,0,0.14)',
        display: 'flex', flexDirection: 'column', gap: '12px'
      }}
    >
      {/* Active Maneuver Instruction Banner (Turn Step & LaneIndicator) */}
      {isNavigating && currentStep && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px',
          background: 'rgba(10, 132, 255, 0.08)', borderRadius: '18px', border: '1px solid rgba(10, 132, 255, 0.2)'
        }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '14px', background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', flexShrink: 0
          }}>
            {renderStepIcon(currentStep.maneuverType)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.2px' }}>
              {currentStep.instruction || currentStep.maneuver || 'Yo\'lda davom eting'}
            </span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {currentStep.distanceText || `${currentStep.distance || 0}m`}
            </span>
          </div>
          {currentStep.laneConfig && (
            <LaneIndicator laneConfig={currentStep.laneConfig} />
          )}
        </div>
      )}

      {/* Metrics Row: ETA, Distance, Time, Toll Fees */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t('arrivalLabel', 'Yetib borish')}
            </span>
            <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.4px' }}>
              {etaText}
            </span>
          </div>

          <div style={{ width: '1px', height: '28px', background: 'var(--glass-border)' }} />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t('distance', 'Masofa')}
            </span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
              {route.distance ? `${route.distance} km` : '0 km'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {t('time', 'Vaqt')}
            </span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#0A84FF' }}>
              {route.time ? `${route.time} min` : '0 min'}
            </span>
          </div>
        </div>

        {/* ETC Toll Badge */}
        {tollEstimate.etc > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px',
            borderRadius: '12px', background: 'rgba(48, 209, 88, 0.12)', border: '1px solid rgba(48, 209, 88, 0.3)'
          }}>
            <Banknote size={14} color="#30D158" />
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#30D158' }}>
              ETC ¥{tollEstimate.etc.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {!isNavigating ? (
          <button
            type="button"
            onClick={onStartNavigation}
            style={{
              flex: 1, height: '48px', borderRadius: '24px', border: 'none',
              background: 'linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)',
              color: '#FFFFFF', fontWeight: '900', fontSize: '15.5px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 6px 20px rgba(10, 132, 255, 0.35)', cursor: 'pointer'
            }}
          >
            <Navigation size={18} color="#FFF" />
            <span>{t('startNavigation', 'Navigatsiyani Boshlash')}</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggleAutoPlay}
              style={{
                flex: 1, height: '46px', borderRadius: '23px', border: 'none',
                background: isAutoPlaying ? 'rgba(255, 149, 0, 0.15)' : 'rgba(10, 132, 255, 0.15)',
                color: isAutoPlaying ? '#FF9500' : '#0A84FF',
                fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                cursor: 'pointer'
              }}
            >
              {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{isAutoPlaying ? 'Pauza' : 'Simulyatsiya'}</span>
            </button>

            <button
              type="button"
              onClick={onStopNavigation}
              style={{
                height: '46px', padding: '0 20px', borderRadius: '23px', border: 'none',
                background: 'rgba(255, 59, 48, 0.15)', color: '#FF3B30',
                fontWeight: '800', fontSize: '14px', cursor: 'pointer'
              }}
            >
              {t('endRoute', 'Tugatish')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
