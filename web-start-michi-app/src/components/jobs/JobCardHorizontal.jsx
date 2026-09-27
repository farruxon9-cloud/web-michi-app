import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Banknote, Star } from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';

export default function JobCardHorizontal({ 
  job, 
  onJobClick, 
  isVerified, 
  onBookmark, 
  isBookmarked 
}) {
  const { t } = useTranslation();

  const getSalaryDisplay = () => {
    if (!job.salary) return '';
    return t(`job_${job.id}_salary`, job.salary);
  };

  const getTitleDisplay = () => {
    return t(`job_${job.id}_title`, job.title);
  };

  const getLocationDisplay = () => {
    return t(`job_${job.id}_location`, job.location);
  };

  return (
    <div 
      className={`job-card-hz glass ${job.isInternational ? 'job-card-international' : ''}`} 
      onClick={() => onJobClick && onJobClick({ ...job, verified: isVerified })}
    >
      <div className="job-card-main-layout">
        {/* Chap qism: E'lon rasmi */}
        <div className="job-card-img">
          <img 
            src={job.image} 
            alt={getTitleDisplay()} 
            onError={(e) => { 
              e.target.src = "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800"; 
            }}
          />
          {job.isInternational && (
            <span className="international-badge-tag">
              🇯🇵 {t('tokuteiGinouBadge', '特定技能 (SSW)')}
            </span>
          )}
        </div>

        {/* O'ng qism: Sarlavha, maosh va ma'lumotlar */}
        <div className="job-card-body">
          <div className="job-card-header-row">
            <span className="job-card-company">
              {job.company}
              {isVerified && <VerifiedBadge size={14} />}
            </span>
            {onBookmark && (
              <button 
                type="button" 
                className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(job);
                }}
                aria-label="Bookmark Job"
              >
                <Star size={16} fill={isBookmarked ? '#FFCC00' : 'none'} color={isBookmarked ? '#FFCC00' : 'var(--text-secondary)'} />
              </button>
            )}
          </div>

          <h3 className="job-card-title">{getTitleDisplay()}</h3>

          <div className="job-card-meta-list">
            <div className="meta-item location">
              <MapPin size={13} />
              <span>{getLocationDisplay()}</span>
            </div>
            <div className="meta-item salary">
              <Banknote size={13} />
              <span className="salary-highlight">{getSalaryDisplay()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pastki qism: Teglar / Chiplar */}
      <div className="job-card-chips">
        {job.license && (
          <span className="job-chip license-chip">
            {t(`license_${job.license}`, job.license)}
          </span>
        )}
        {job.foreigners === 'foreigners_ok' && (
          <span className="job-chip tag-chip">
            {t('foreignersOkTag', '外国人人材歓迎')}
          </span>
        )}
        {job.housing && job.housing !== 'housing_none' && (
          <span className="job-chip tag-chip">
            🏠 {t('housingAvailable', '寮・社宅あり')}
          </span>
        )}
        {job.hasShoukai && (
          <span className="job-chip bonus-chip">
            🔥 {t('shoukaiBonusTag', '紹介手当あり')}
          </span>
        )}
      </div>
    </div>
  );
}
