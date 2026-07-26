import React from 'react';
import { getLaneArrowPath } from '../utils/laneGuidance';

/**
 * LaneIndicator Component
 * 
 * Renders high-fidelity lane guidance arrows for navigation HUD.
 * 
 * @param {Object} props
 * @param {Array} props.lanes - Array of lane objects: [{ directions: string[], valid: boolean }]
 * @param {string} props.theme - Theme preset (dark/light)
 */
export default function LaneIndicator({ lanes, theme = 'dark' }) {
  if (!lanes || lanes.length === 0) return null;

  return (
    <div 
      className="lane-guidance-container" 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '6px 10px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        alignSelf: 'center',
        marginTop: '4px'
      }}
    >
      {lanes.map((lane, index) => (
        <div 
          key={index} 
          className={`lane-item ${lane.valid ? 'active' : 'inactive'}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: lane.valid 
              ? 'rgba(10, 132, 255, 0.12)' 
              : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${lane.valid 
              ? 'rgba(10, 132, 255, 0.3)' 
              : 'rgba(255, 255, 255, 0.05)'}`,
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Active indicator dot */}
          {lane.valid && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: '#0A84FF',
              boxShadow: '0 0 4px #0A84FF'
            }} />
          )}

          {/* SVG Arrow container */}
          <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 50 50">
              {lane.directions.map((dir, dIdx) => (
                <path
                  key={dIdx}
                  d={getLaneArrowPath(dir)}
                  stroke={lane.valid ? '#FFFFFF' : '#8E8E93'}
                  strokeWidth="5"
                  strokeOpacity={lane.valid ? '1.0' : '0.35'}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: 'stroke 0.3s ease' }}
                />
              ))}
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
