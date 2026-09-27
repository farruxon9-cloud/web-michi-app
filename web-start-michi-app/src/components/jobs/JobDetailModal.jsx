import React from 'react';
import JobDetail from '../JobDetail';

export default function JobDetailModal({ 
  job, 
  onClose, 
  onApply, 
  onShoukai, 
  applications = [], 
  onToggleSave, 
  profileData, 
  userRole, 
  onEditJob 
}) {
  if (!job) return null;

  return (
    <div className="job-detail-modal-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', overflowY: 'auto' }}>
      <JobDetail 
        job={job}
        onBack={onClose}
        onApply={onApply}
        onShoukai={onShoukai}
        applications={applications}
        onToggleSave={onToggleSave}
        profileData={profileData}
        userRole={userRole}
        onEditJob={onEditJob}
      />
    </div>
  );
}
