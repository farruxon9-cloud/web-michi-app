import React from 'react';

/**
 * PageSkeleton — Glassmorphic shimmer skeleton loader for lazy-loaded routes and components.
 */
export default function PageSkeleton() {
  return (
    <div className="page-skeleton-container" style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Header Skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div className="skeleton-shimmer" style={{ width: '180px', height: '32px', borderRadius: '12px' }} />
        <div className="skeleton-shimmer" style={{ width: '100px', height: '32px', borderRadius: '12px' }} />
      </div>

      {/* Banner / Hero Skeleton */}
      <div className="skeleton-shimmer" style={{
        width: '100%',
        height: '180px',
        borderRadius: '24px'
      }} />

      {/* Content Grid Skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        width: '100%'
      }}>
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} className="glass-card" style={{
            padding: '20px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: 'var(--card-bg, rgba(255, 255, 255, 0.45))',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.2))'
          }}>
            <div className="skeleton-shimmer" style={{ width: '100%', height: '120px', borderRadius: '12px' }} />
            <div className="skeleton-shimmer" style={{ width: '70%', height: '18px', borderRadius: '6px' }} />
            <div className="skeleton-shimmer" style={{ width: '40%', height: '14px', borderRadius: '4px' }} />
            <div className="skeleton-shimmer" style={{ width: '90%', height: '14px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
