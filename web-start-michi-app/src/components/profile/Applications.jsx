import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Briefcase, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function Applications({ applications = [], schoolApplications = [], onBack, onAppClick }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'submitted' | 'reviewing' | 'interview' | 'accepted' | 'rejected'

  const allApps = [...applications, ...schoolApplications];
  const filteredApps = allApps.filter(app => {
    if (activeTab === 'all') return true;
    return (app.status || 'submitted').toLowerCase() === activeTab.toLowerCase();
  });

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'accepted': return '#30D158';
      case 'rejected': return '#FF3B30';
      case 'interview': return '#AF52DE';
      case 'reviewing': return '#FF9500';
      default: return '#0A84FF';
    }
  };

  return (
    <div className="profile-container sub-page-view fade-in">
      {/* Header */}
      <div className="sub-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button type="button" className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{t('myApplications', 'Arizalarim')}</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Filter Pipeline Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '14px' }} className="hide-scrollbar">
        {[
          { id: 'all', label: t('all', 'Barchasi') },
          { id: 'submitted', label: t('statusSubmitted', 'Topshirildi') },
          { id: 'reviewing', label: t('statusReviewing', 'Ko\'rib chiqilmoqda') },
          { id: 'interview', label: t('statusInterview', 'Suhbat') },
          { id: 'accepted', label: t('statusAccepted', 'Qabul qilindi') },
          { id: 'rejected', label: t('statusRejected', 'Rad etildi') }
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px', borderRadius: '14px', border: isSelected ? '1px solid #0A84FF' : '1px solid var(--glass-border)',
                background: isSelected ? 'rgba(10, 132, 255, 0.15)' : 'var(--card-bg)',
                color: isSelected ? '#0A84FF' : 'var(--text-secondary)',
                fontWeight: isSelected ? '800' : '600', fontSize: '12.5px', cursor: 'pointer', flexShrink: 0
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="empty-state squircle-card" style={{ padding: '32px 16px', textAlign: 'center' }}>
          <Briefcase size={40} className="empty-icon" color="var(--text-secondary)" />
          <p style={{ margin: '12px 0 0 0', color: 'var(--text-secondary)', fontWeight: '600' }}>
            {t('noApplications', 'Topshirilgan arizalar yo\'q')}
          </p>
        </div>
      ) : (
        <div className="applications-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredApps.map(app => (
            <div 
              key={app.id} 
              className="application-card squircle-card"
              onClick={() => onAppClick && onAppClick(app)}
              style={{
                padding: '14px 16px', borderRadius: '18px', background: 'var(--card-bg)',
                border: '1px solid var(--glass-border)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}
            >
              <div className="app-main-info" style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: 'var(--text-main)' }}>
                  {app.title || app.schoolName || app.company}
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {app.company || app.schoolName} • {app.appliedDate || 'Yaqinda'}
                </p>
              </div>

              <div style={{
                padding: '4px 10px', borderRadius: '10px',
                background: `${getStatusColor(app.status)}15`,
                border: `1px solid ${getStatusColor(app.status)}30`,
                color: getStatusColor(app.status),
                fontSize: '11.5px', fontWeight: '800'
              }}>
                {app.status || 'Topshirildi'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 92px clearance spacer */}
      <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
