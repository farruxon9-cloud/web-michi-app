import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Building2, Briefcase, GraduationCap, SlidersHorizontal } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';

export default function CompanyHeader({
  profileData,
  activeTab,
  setActiveTab,
  onOpenAdTypeModal,
  jobsCount = 0,
  schoolsCount = 0
}) {
  const { t } = useTranslation();

  return (
    <div className="feed-header glass" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Company Info & Add Posting Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(10, 132, 255, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(10, 132, 255, 0.2)'
          }}>
            {profileData?.logo ? (
              <img src={profileData.logo} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover' }} />
            ) : (
              <Building2 size={22} color="#0A84FF" />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                {profileData?.fullName || t('companyEmployer', 'Kompaniya Profili')}
              </h2>
              <VerifiedBadge size={16} />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', marginTop: '2px' }}>
              {t('employerDashboard', 'Ish beruvchi kabineti')}
            </span>
          </div>
        </div>

        {/* Add Posting Button */}
        <button
          type="button"
          onClick={onOpenAdTypeModal}
          style={{
            padding: '10px 16px', borderRadius: '20px', border: 'none',
            background: 'linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)',
            color: '#FFFFFF', fontWeight: '800', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(10, 132, 255, 0.35)'
          }}
        >
          <Plus size={16} color="#FFF" />
          <span>{t('addPosting', 'E\'lon joylash')}</span>
        </button>
      </div>

      {/* Posting Type Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          style={{
            flex: 1, padding: '10px', borderRadius: '14px', border: 'none',
            background: activeTab === 'jobs' ? 'var(--primary)' : 'var(--card-bg)',
            color: activeTab === 'jobs' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: activeTab === 'jobs' ? '800' : '600', fontSize: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Briefcase size={15} />
          <span>Vakansiyalarim ({jobsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schools')}
          style={{
            flex: 1, padding: '10px', borderRadius: '14px', border: 'none',
            background: activeTab === 'schools' ? 'var(--primary)' : 'var(--card-bg)',
            color: activeTab === 'schools' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: activeTab === 'schools' ? '800' : '600', fontSize: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            cursor: 'pointer'
          }}
        >
          <GraduationCap size={15} />
          <span>Avtomaktablarim ({schoolsCount})</span>
        </button>
      </div>
    </div>
  );
}
