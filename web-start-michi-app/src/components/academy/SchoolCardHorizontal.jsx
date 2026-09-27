import React from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, MapPin, Share2, Edit3, Phone, CheckCircle2 } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';

export default function SchoolCardHorizontal({
  school,
  isContractActive,
  onSelectSchool,
  userRole,
  profileData,
  onEditJob,
  schoolApplications = [],
  onApplySchool,
  onShoukai
}) {
  const { t } = useTranslation();
  const showVerified = school.verified || isContractActive;
  const alreadyApplied = (schoolApplications || []).some(a => a.schoolId === school.id && !a.isSimulatedReferral);

  return (
    <div className="job-card-hz glass" onClick={() => onSelectSchool(school)}>
      <div className="job-card-main-layout">
        {/* ---- Chap qism: Maktab rasmi ---- */}
        <div className="job-card-img">
          <img 
            src={school.image} 
            alt={t(`school_${school.id}_name`, school.name)} 
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800"; }}
          />
          <div className="job-type-badge type-fulltime">
            {school.langs ? school.langs.join(', ') : 'UZ, JP'}
          </div>
        </div>

        {/* ---- O'ng qism: Batafsil ma'lumotlar ---- */}
        <div className="job-card-body">
          <div className="job-card-company">
            <span>{t(`school_${school.id}_name`, school.name)}</span>
            {showVerified && <VerifiedBadge size={14} />}
          </div>

          <h3 className="job-card-title">{t(`school_${school.id}_type`, school.type)}</h3>

          <div className="job-card-salary">
            <Banknote size={15} color="#30D158" />
            <span>{school.price || 'Maxsus narx'}</span>
            {school.discount && (
              <span className="discount-tag" style={{ marginLeft: '4px', fontSize: '9px', padding: '1.5px 4px' }}>
                -{school.discount}
              </span>
            )}
          </div>

          <div className="job-card-chips">
            <span className="job-chip">
              <MapPin size={10} />
              {t(`school_${school.id}_location`, school.location)}
            </span>
            {school.shoukaiFee > 0 && (
              <span className="job-chip chip-highlight">
                <Share2 size={10} />
                {t('shoukaiAvailable', 'Shoukai puli bor')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Amal tugmalari */}
      <div className="job-card-actions">
        {userRole === 'company' ? (
          profileData?.fullName === school.name ? (
            <button 
              type="button"
              className="job-card-btn btn-apply"
              onClick={(e) => {
                e.stopPropagation();
                onEditJob && onEditJob(school);
              }}
              style={{ flex: 1, background: '#1c1c1e', color: '#fff' }}
            >
              <Edit3 size={12} />
              {t('editJob', 'Tahrirlash')}
            </button>
          ) : (
            <button 
              type="button"
              className="job-card-btn btn-call"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${school.phone || '080-1234-5678'}`;
              }}
            >
              <Phone size={12} />
              {t('callBtn', 'Qo\'ng\'iroq qilish')}
            </button>
          )
        ) : (
          alreadyApplied ? (
            <button 
              type="button"
              className="job-card-btn btn-apply applied" 
              disabled
              onClick={(e) => e.stopPropagation()}
              style={{ flex: 1, cursor: 'default' }}
            >
              <CheckCircle2 size={13} />
              {t('appliedToSchool', 'Topshirilgan')}
            </button>
          ) : (
            <button 
              type="button"
              className="job-card-btn btn-apply"
              onClick={(e) => {
                e.stopPropagation();
                onApplySchool && onApplySchool(school, '');
              }}
            >
              {t('applyToSchool', 'Topshirish')}
            </button>
          )
        )}
        <button 
          type="button"
          className="job-card-btn btn-shoukai"
          onClick={(e) => {
            e.stopPropagation();
            onShoukai && onShoukai(school);
          }}
        >
          <Share2 size={12} />
          {t('shoukai', 'Shoukai')}
        </button>
      </div>
    </div>
  );
}
