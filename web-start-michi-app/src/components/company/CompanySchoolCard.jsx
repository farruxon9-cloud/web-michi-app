import React from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, MapPin, Share2, Edit3, Trash2, Users } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';

export default function CompanySchoolCard({
  school,
  onSelectSchool,
  onEditSchool,
  onDeleteSchool,
  applicantCount = 0
}) {
  const { t } = useTranslation();

  return (
    <div className="job-card-hz glass" onClick={() => onSelectSchool(school)}>
      <div className="job-card-main-layout">
        {/* ---- Image ---- */}
        <div className="job-card-img">
          <img 
            src={school.image || "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800"} 
            alt={school.name} 
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800"; }}
          />
          <div className="job-type-badge type-fulltime">
            {school.langs ? school.langs.join(', ') : 'UZ, JP'}
          </div>
        </div>

        {/* ---- Body ---- */}
        <div className="job-card-body">
          <div className="job-card-company">
            <span>{school.name}</span>
            {school.verified && <VerifiedBadge size={14} />}
          </div>

          <h3 className="job-card-title">{school.type}</h3>

          <div className="job-card-salary">
            <Banknote size={15} color="#30D158" />
            <span>{school.price || 'Maxsus narx'}</span>
          </div>

          <div className="job-card-chips">
            <span className="job-chip">
              <MapPin size={10} />
              {school.location}
            </span>
            {school.shoukaiFee > 0 && (
              <span className="job-chip chip-highlight">
                <Share2 size={10} />
                Shoukai: ¥{school.shoukaiFee.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ---- Actions ---- */}
      <div className="job-card-actions">
        <button 
          type="button"
          className="job-card-btn btn-apply"
          onClick={(e) => {
            e.stopPropagation();
            onEditSchool && onEditSchool(school);
          }}
          style={{ flex: 1, background: '#1c1c1e', color: '#fff' }}
        >
          <Edit3 size={12} />
          <span>{t('editSchool', 'Tahrirlash')}</span>
        </button>

        {applicantCount > 0 && (
          <div style={{
            padding: '0 12px', height: '38px', borderRadius: '20px', background: 'rgba(48, 209, 88, 0.12)',
            color: '#30D158', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <Users size={14} />
            <span>{applicantCount} arizachilar</span>
          </div>
        )}

        <button
          type="button"
          className="job-card-btn btn-shoukai"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSchool && onDeleteSchool(school.id);
          }}
          style={{ background: 'rgba(255, 59, 48, 0.12)', color: '#FF3B30' }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
