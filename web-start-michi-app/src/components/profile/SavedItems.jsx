import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bookmark, MapPin, Banknote, Briefcase, GraduationCap } from 'lucide-react';

export default function SavedItems({ savedJobs = [], savedSchools = [], onBack, onJobClick, onSchoolClick }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'schools'

  return (
    <div className="profile-container sub-page-view fade-in">
      {/* Header */}
      <div className="sub-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button type="button" className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{t('savedItems', 'Saqlanganlar')}</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          style={{
            flex: 1, padding: '10px 8px', borderRadius: '14px', border: 'none',
            background: activeTab === 'jobs' ? 'var(--primary)' : 'var(--card-bg)',
            color: activeTab === 'jobs' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: activeTab === 'jobs' ? '800' : '600', fontSize: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Briefcase size={15} />
          <span>Vakansiyalar ({savedJobs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schools')}
          style={{
            flex: 1, padding: '10px 8px', borderRadius: '14px', border: 'none',
            background: activeTab === 'schools' ? 'var(--primary)' : 'var(--card-bg)',
            color: activeTab === 'schools' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: activeTab === 'schools' ? '800' : '600', fontSize: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            cursor: 'pointer'
          }}
        >
          <GraduationCap size={15} />
          <span>Avtomaktablar ({savedSchools.length})</span>
        </button>
      </div>

      {/* Saved List */}
      {activeTab === 'jobs' ? (
        savedJobs.length === 0 ? (
          <div className="empty-state squircle-card" style={{ padding: '32px 16px', textAlign: 'center' }}>
            <Bookmark size={40} className="empty-icon" color="var(--text-secondary)" />
            <p style={{ margin: '12px 0 0 0', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {t('noSavedJobs', 'Saqlangan vakansiyalar yo\'q')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {savedJobs.map(job => (
              <div
                key={job.id}
                className="saved-item-card squircle-card"
                onClick={() => onJobClick && onJobClick(job)}
                style={{
                  padding: '14px 16px', borderRadius: '18px', background: 'var(--card-bg)',
                  border: '1px solid var(--glass-border)', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '4px'
                }}
              >
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: 'var(--text-main)' }}>
                  {job.title}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {job.company} • {job.location}
                </p>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#FF9500', marginTop: '2px' }}>
                  {job.salary}
                </span>
              </div>
            ))}
          </div>
        )
      ) : (
        savedSchools.length === 0 ? (
          <div className="empty-state squircle-card" style={{ padding: '32px 16px', textAlign: 'center' }}>
            <Bookmark size={40} className="empty-icon" color="var(--text-secondary)" />
            <p style={{ margin: '12px 0 0 0', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {t('noSavedSchools', 'Saqlangan avtomaktablar yo\'q')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {savedSchools.map(school => (
              <div
                key={school.id}
                className="saved-item-card squircle-card"
                onClick={() => onSchoolClick && onSchoolClick(school)}
                style={{
                  padding: '14px 16px', borderRadius: '18px', background: 'var(--card-bg)',
                  border: '1px solid var(--glass-border)', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: '4px'
                }}
              >
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: 'var(--text-main)' }}>
                  {school.name}
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {school.type} • {school.location}
                </p>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#30D158', marginTop: '2px' }}>
                  {school.price}
                </span>
              </div>
            ))}
          </div>
        )
      )}

      {/* 92px clearance spacer */}
      <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
