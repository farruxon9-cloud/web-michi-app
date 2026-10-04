// v1.1 Faza E: Profile.jsx dagi `activePage === 'saved_items'` sahifasi o'zgarishsiz ko'chirildi.
// Holat va funksiyalar Profile'dan `ctx` orqali keladi (klasslar, stil va DOM bir xil).
import { Bookmark, ArrowLeft } from 'lucide-react';

export default function SavedItemsPage(ctx) {
  const { handleBackToMain, jobs, onJobClick, onSchoolClick, profileData, schools, t } = ctx;
  // Faol ish e'lonlarini tekshirish va filtrlash
  const savedJobs = (profileData?.savedItems?.jobs || []).filter(job => job && job.isActive !== false);
  // Faol avtomaktablarni tekshirish va filtrlash
  const savedSchools = (profileData?.savedItems?.schools || []).filter(school => school && school.isActive !== false);

  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="profile-sticky-back">
        {/* Ortga qaytish: Profil bosh sahifasiga ('main') qaytaradi */}
        <button className="icon-btn glass" onClick={handleBackToMain}><ArrowLeft size={20} /></button>
      </div>
      <div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '5px' }}>
        <h2>
          {t('savedItemsTitle')}
          <span className="section-header-count">({savedJobs.length + savedSchools.length})</span>
        </h2>
      </div>
      <div className="applications-list" style={{ padding: '16px' }}>
        {savedJobs.length === 0 && savedSchools.length === 0 ? (
          <div className="empty-state">
            <Bookmark size={40} color="#c7c7cc" />
            <p>{t('noSavedItems')}</p>
          </div>
        ) : (
          <>
            {/* --- ISH E'LONLARI BO'LIMI --- */}
            {savedJobs.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>{t('jobAds')}</h3>
                {savedJobs.map(job => {
                  const fullJob = (jobs && jobs.length > 0 ? jobs.find(j => String(j.id) === String(job.id)) : null) || job;
                  return (
                  <div 
                    key={fullJob.id || job.id} 
                    className="app-card glass squircle" 
                    onClick={() => {
                      if (fullJob && onJobClick) {
                        onJobClick(fullJob);
                      }
                    }}
                    style={{ padding: '12px', marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <img src={fullJob.logo || fullJob.image} alt={fullJob.company} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', lineHeight: '1.2' }}>{fullJob.title}</div>
                      <div style={{ fontSize: '13px', color: '#8E8E93', marginTop: '4px' }}>{fullJob.company}</div>
                      {fullJob.salary && <div style={{ fontSize: '13px', color: '#34C759', fontWeight: 'bold', marginTop: '4px' }}>{fullJob.salary}</div>}
                      {fullJob.location && <div style={{ fontSize: '12px', color: '#8E8E93', marginTop: '2px' }}>📍 {fullJob.location}</div>}
                    </div>
                  </div>
                )})}
              </div>
            )}

            {/* --- AVTOMAKTABLAR BO'LIMI --- */}
            {savedSchools.length > 0 && (
              <div>
                <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>{t('drivingSchools')}</h3>
                {savedSchools.map(school => {
                  const fullSchool = (schools && schools.length > 0 ? schools.find(s => String(s.id) === String(school.id)) : null) || school;
                  return (
                  <div 
                    key={fullSchool.id || school.id} 
                    className="app-card glass squircle" 
                    onClick={() => {
                      if (fullSchool && onSchoolClick) {
                        onSchoolClick(fullSchool);
                      }
                    }}
                    style={{ padding: '12px', marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <img src={fullSchool.image} alt={fullSchool.name} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', lineHeight: '1.2' }}>{fullSchool.name}</div>
                      {fullSchool.location && <div style={{ fontSize: '13px', color: '#8E8E93', marginTop: '4px' }}>📍 {fullSchool.location}</div>}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </>
        )}
      </div>
      {/* 12px clearance spacer for Profile sub-page */}
      <div style={{ height: '12px', minHeight: '12px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
