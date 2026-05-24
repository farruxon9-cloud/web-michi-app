import React from 'react';

export default function MichiLogo({ size = 34, fontSize = 20, borderRadius = 10, className = '' }) {
  return (
    <div 
      className={`michi-logo ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: borderRadius,
        background: 'linear-gradient(135deg, #6366F1, #4338CA)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: fontSize,
        fontWeight: '600',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      道
    </div>
  );
}
