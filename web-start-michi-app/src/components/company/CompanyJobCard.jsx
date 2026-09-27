import React from 'react';
import { useTranslation } from 'react-i18next';
import { Banknote, MapPin, Share2, Edit3, Trash2, Users } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';

export default function CompanyJobCard({
  job,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  applicantCount = 0
}) {
  const { t } = useTranslation();

  return (
    <div className="job-card-hz glass" onClick={() => onSelectJob(job)}>
      <div className="job-card-main-layout">
        {/* ---- Image ---- */}
        <div className="job-card-img">
          <img 
            src={job.image || "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800"} 
            alt={job.title} 
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800"; }}
          />
          <div className="job-type-badge type-fulltime">
            {job.type === 'fulltime' ? '正社員' : (job.type === 'parttime' ? 'アルバイト' : '契約社員')}
          </div>
        </div>

        {/* ---- Body ---- */}
        <div className="job-card-body">
          <div className="job-card-company">
            <span>{job.company}</span>
            {job.verified && <VerifiedBadge size={14} />}
          </div>

          <h3 className="job-card-title">{job.title}</h3>

          <div className="job-card-salary">
            <Banknote size={15} color="#FF9500" />
            <span>{job.salary}</span>
          </div>

          <div className="job-card-chips">
            <span className="job-chip">
              <MapPin size={10} />
              {job.location}
            </span>
            {job.shoukaiAmount && job.shoukaiAmount !== '0' && (
              <span className="job-chip chip-highlight">
                <Share2 size={10} />
                {t('shoukai', 'Shoukai')}: {job.shoukaiAmount}
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
            onEditJob && onEditJob(job);
          }}
          style={{ flex: 1, background: '#1c1c1e', color: '#fff' }}
        >
          <Edit3 size={12} />
          <span>{t('editJob', 'Tahrirlash')}</span>
        </button>

        {applicantCount > 0 && (
          <div style={{
            padding: '0 12px', height: '38px', borderRadius: '20px', background: 'rgba(10, 132, 255, 0.12)',
            color: '#0A84FF', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'
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
            onDeleteJob && onDeleteJob(job.id);
          }}
          style={{ background: 'rgba(255, 59, 48, 0.12)', color: '#FF3B30' }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
