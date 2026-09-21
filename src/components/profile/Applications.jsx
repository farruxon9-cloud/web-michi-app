import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Briefcase, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function Applications({ applications = [], schoolApplications = [], onBack, onAppClick }) {
  const { t } = useTranslation();

  const allApps = [...applications, ...schoolApplications];

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="sub-page-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2>{t('myApplications', 'Arizalarim')}</h2>
        <div style={{ width: 40 }} />
      </div>

      {allApps.length === 0 ? (
        <div className="empty-state squircle-card">
          <Briefcase size={40} className="empty-icon" />
          <p>{t('noApplications', 'Topshirilgan arizalar yo\'q')}</p>
        </div>
      ) : (
        <div className="applications-list">
          {allApps.map(app => (
            <div 
              key={app.id} 
              className="application-card squircle-card"
              onClick={() => onAppClick && onAppClick(app)}
            >
              <div className="app-main-info">
                <h4>{app.title || app.schoolName || app.company}</h4>
                <p>{app.company || app.schoolName}</p>
                <span className="app-date">{app.appliedDate}</span>
              </div>
              <div className={`status-pill ${app.status || 'submitted'}`}>
                <span>{app.status || 'Topshirildi'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ height: '72px', minHeight: '72px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}
