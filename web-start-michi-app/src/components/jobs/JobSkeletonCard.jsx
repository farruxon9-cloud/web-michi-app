import React from 'react';

export default function JobSkeletonCard() {
  return (
    <div className="job-card-hz skeleton-card glass" style={{ minHeight: '156px', width: '100%', marginBottom: '12px' }}>
      <div className="job-card-main-layout">
        {/* Chap qism: Rasm o'rniga shimmer */}
        <div className="job-card-img skeleton-shimmer" style={{ height: '100px', borderRadius: '8px' }} />

        {/* O'ng qism: Ma'lumotlar o'rniga shimmer */}
        <div className="job-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 8px' }}>
          <div className="skeleton-shimmer" style={{ width: '40%', height: '12px', borderRadius: '4px' }} />
          <div className="skeleton-shimmer" style={{ width: '80%', height: '18px', borderRadius: '4px', marginTop: '4px' }} />
          <div className="skeleton-shimmer" style={{ width: '50%', height: '14px', borderRadius: '4px' }} />
          
          <div className="job-card-chips" style={{ display: 'flex', gap: '6px', marginTop: '8px', border: 'none', padding: '0' }}>
            <div className="skeleton-shimmer" style={{ width: '60px', height: '22px', borderRadius: '12px' }} />
            <div className="skeleton-shimmer" style={{ width: '70px', height: '22px', borderRadius: '12px' }} />
          </div>
        </div>
      </div>
      
      {/* Pastki qism: Tugmalar */}
      <div className="job-card-actions" style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px', marginTop: '10px' }}>
        <div className="skeleton-shimmer" style={{ flex: 1, height: '32px', borderRadius: '8px' }} />
        <div className="skeleton-shimmer" style={{ flex: 1, height: '32px', borderRadius: '8px' }} />
      </div>
    </div>
  );
}
