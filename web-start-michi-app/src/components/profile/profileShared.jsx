// v1.1 Faza E: Profile.jsx dan o'zgarishsiz ko'chirilgan umumiy konstantalar va kichik komponentlar.
import React from 'react';

// All global brands for inline dropdown selector
export const ALL_GLOBAL_BRANDS = [
  'Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Lexus',
  'Isuzu', 'Hino', 'Mitsubishi Fuso', 'UD Trucks', 'Daihatsu', 'Infiniti', 'Acura',
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche', 'Ferrari', 'Lamborghini',
  'Hyundai', 'Kia', 'Chevrolet', 'Ford', 'Tesla', 'Dodge', 'Jeep', 'Volvo', 'Peugeot', 'Renault', 'Boshqa'
];


export const StatCounter = ({ target, suffix = '', duration = 1200 }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // cubicOut easing
      setCount(Math.floor(easeProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Inline DOM Custom Select with 100% solid white background (zero transparency) trapped inside phone shell
export const InlineCustomSelect = ({ label, value, options, onChange, placeholder = 'Tanlang...' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
      {label && (
        <label style={{ fontSize: '11px', color: 'var(--text-secondary, #8e8e93)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          background: '#ffffff', // 100% Solid white background!
          color: '#000000', // Crisp black text!
          border: '1px solid #d1d1d6',
          borderRadius: '10px',
          padding: '9px 12px',
          fontSize: '13px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          textAlign: 'left',
          boxShadow: '0 2px 5px rgba(0,0,0,0.06)'
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value || placeholder}
        </span>
        <span style={{ fontSize: '10px', color: '#8e8e93', marginLeft: '6px' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 99999,
          maxHeight: '280px', // Taller/longer list as requested!
          overflowY: 'auto',
          background: '#ffffff', // 100% SOLID PURE WHITE — ZERO TRANSPARENCY!
          color: '#000000', // Crisp black text!
          border: '1px solid #c7c7cc',
          borderRadius: '14px',
          boxShadow: '0 15px 45px rgba(0, 0, 0, 0.35)',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}>
          {options.map((opt, idx) => {
            const isSelected = value === opt;
            return (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  background: isSelected 
                    ? '#007AFF' 
                    : 'transparent',
                  color: isSelected 
                    ? '#ffffff' 
                    : '#000000',
                  fontWeight: isSelected ? 'bold' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: idx < options.length - 1 && !isSelected ? '1px solid #f2f2f7' : 'none',
                  transition: 'background 0.12s ease'
                }}
              >
                <span>{opt}</span>
                {isSelected && <span style={{ fontSize: '13px', fontWeight: 'bold' }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const STATUS_PIPELINE = ['submitted', 'reviewing', 'reviewed', 'interview', 'rejected', 'accepted'];

export const STATUS_COLORS = {
  submitted: '#0A84FF', // Changed from grey to blue so it looks active
  reviewing: '#FF9F0A',
  reviewed: '#0A84FF',
  rejected: '#FF3B30',
  accepted: '#34C759',
  interview: '#AF52DE',
  withdrawn: '#8E8E93', // reserved for PATCH /api/applications/:id/cancel (backend pending)
};

// Small shared styles for the hide / select controls (use existing palette only)
export const HIDE_LINK_BTN = { border: 'none', background: 'transparent', color: '#0A84FF', fontSize: '12.5px', fontWeight: 700, padding: '4px 0', cursor: 'pointer' };
export const HIDE_PILL_BTN = { border: '1px solid var(--glass-border)', background: 'var(--glass-bg, transparent)', color: 'var(--text-main)', fontSize: '12.5px', fontWeight: 700, padding: '5px 12px', borderRadius: '999px', cursor: 'pointer' };
export const HIDE_SMALL_BTN = { display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-secondary, #8E8E93)', fontSize: '11.5px', fontWeight: 700, padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' };
export const safeDomId = (key) => String(key).replace(/[^a-zA-Z0-9_-]/g, '-');
