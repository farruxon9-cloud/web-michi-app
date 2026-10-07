// v1.1 Faza E: Profile.jsx dagi `activePage === 'my_ads'` sahifasi o'zgarishsiz ko'chirildi.
// Holat va funksiyalar Profile'dan `ctx` orqali keladi (klasslar, stil va DOM bir xil).
import { ArrowLeft } from 'lucide-react';
import CompanyHome from '../CompanyHome';

export default function MyAdsPage(ctx) {
  const { applications, isFormOpen, jobToEdit, jobs, onApply, onApplySchool, onJobClick, onJobCreated, onNavigate, onSchoolClick, onShoukai, profileActivePageSource, profileData, schoolApplications, schools, setActivePage, setIsFormOpen, setJobToEdit, setJobs, setSchools, t, userRole } = ctx;
  return (
    <div className="profile-container sub-page-view fade-in">
      {/* Sticky Back Button Container */}
      {!isFormOpen && (
        <div className="profile-sticky-back" style={{ zIndex: 250 }}>
          <button className="icon-btn glass" onClick={() => {
            if (profileActivePageSource === 'home') {
              setActivePage('main');
              if (onNavigate) onNavigate('home');
            } else {
              setActivePage('main');
            }
          }}><ArrowLeft size={20} /></button>
        </div>
      )}

      {/* Scrollable Title */}
      {!isFormOpen && (
        <div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '5px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>
            {t('myAdsMenu')}
          </h2>
        </div>
      )}

      <CompanyHome 
        onJobClick={onJobClick} 
        onSchoolClick={onSchoolClick} 
        jobs={jobs} 
        setJobs={setJobs} 
        onJobCreated={onJobCreated}
        schools={schools} 
        setSchools={setSchools} 
        profileData={profileData} 
        jobToEdit={jobToEdit} 
        setJobToEdit={setJobToEdit} 
        onFormToggle={setIsFormOpen}
        onApply={onApply}
        onApplySchool={onApplySchool}
        onShoukai={onShoukai}
        applications={applications}
        schoolApplications={schoolApplications}
        userRole={userRole}
      />
      {/* 12px clearance spacer for myAds view to prevent duplicate spacer stack */}
      <div style={{ height: '12px', minHeight: '12px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
