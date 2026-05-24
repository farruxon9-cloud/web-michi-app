import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bookmark, Map as MapIcon, Calendar, Clock, Banknote, Share2 } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import './JobDetail.css';

export default function JobDetail({ job, onBack, onApply, onShoukai, applications = [], onToggleSave, profileData, userRole }) {
  const { t } = useTranslation();
  const alreadyApplied = applications.some(a => a.jobId === job.id);
  const isSaved = profileData?.savedItems?.jobs?.some(j => j.id === job.id);

  return (
    <div className="job-detail-container slide-up">
      <div className="header-actions">
        <button className="icon-btn glass" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <button className="icon-btn glass" onClick={() => onToggleSave(job, 'jobs')}>
          <Bookmark size={20} fill={isSaved ? "var(--primary)" : "none"} color={isSaved ? "var(--primary)" : "currentColor"} />
        </button>
      </div>

      <div className="detail-header-image">
        <img src={job.image} alt={job.title} className="bg-img" />
      </div>

      <div className="detail-content">
        <div className="company-header">
          <div className="company-title-wrap">
            <img src={job.logo} alt={job.company} className="detail-logo squircle" />
            <div>
              <h2 className="detail-title">{job.title}</h2>
              <div className="company-name-row">
                <span>{job.company}</span>
                {job.verified && (
                  <span className="verified-tag">
                    <VerifiedBadge size={14} /> {t('trustedPartner')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item glass squircle">
            <Banknote size={20} color="#34C759" />
            <div className="info-text">
              <p>{t('salary')}</p>
              <strong>{job.salary}</strong>
            </div>
          </div>
          <div className="info-item glass squircle">
            <Clock size={20} color="#0A84FF" />
            <div className="info-text">
              <p>{t('workHours')}</p>
              <strong>08:00 - 17:00</strong>
            </div>
          </div>
          <div className="info-item glass squircle">
            <Calendar size={20} color="#AF52DE" />
            <div className="info-text">
              <p>{t('dayOff')}</p>
              <strong>{t('dayOffValue')}</strong>
            </div>
          </div>
        </div>

        <div className="description-block">
          <h3>{t('jobConditions')}</h3>
          <p>{t('jobDesc')}</p>
        </div>

        <div className="map-block">
          <h3>{t('address')}</h3>
          <div className="map-placeholder squircle glass">
            <MapIcon size={32} color="#8E8E93" />
            <span style={{textAlign: 'center'}}>{t('viewOnMap')} <br/><small>{job.fullAddress || job.location}</small></span>
          </div>
        </div>

        
        {/* 
          ASOSIY QISM (MAIN BO'LIMI) O'ZGARISHI:
          Agar korxona tomonidan shoukai summasi kiritilgan bo'lsa va u "0" bo'lmasa,
          e'lonning eng pastki qismida har bir e'lon uchun o'ziga xos tarzda 
          shoukai mukofoti haqida ma'lumot ko'rsatiladi.
          Bu orqali foydalanuvchilar qancha mukofot olishini aniq ko'rishadi.
        */}
        {job.shoukaiAmount && job.shoukaiAmount !== "0" && (
          <div className="detail-section shoukai-section glass squircle" style={{ marginTop: '24px', padding: '16px' }}>
            <div className="shoukai-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Share2 size={18} color="#FF9F0A" />
              <h4 style={{ margin: 0, fontSize: '18px' }}>Ulashish / Shoukai</h4>
            </div>
            <p className="shoukai-desc" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Do'stingizni taklif qiling va mukofot oling
            </p>
            <div className="shoukai-amount" style={{ fontSize: '16px', fontWeight: 'bold' }}>
              Shoukai mukofoti: <span style={{ color: '#FF9F0A' }}>{job.shoukaiAmount}</span>
            </div>
          </div>
        )}
        
      </div>

      <div className="sticky-action glass" style={{ display: 'flex', flexDirection: 'row', gap: '10px', padding: '16px 20px' }}>
        <button 
          className={`apply-btn squircle ${alreadyApplied ? 'applied' : ''}`}
          style={{ flex: 1, padding: '14px 10px', fontSize: '15px', whiteSpace: 'nowrap' }}
          onClick={() => !alreadyApplied && onApply(job)}
        >
          {alreadyApplied ? t('applied') : t('applyJob')}
        </button>
          <button 
            className="apply-btn squircle" 
            style={{ flex: 1, background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '14px 10px', fontSize: '14px', whiteSpace: 'nowrap' }}
            onClick={() => onShoukai(job)}
          >
            <Share2 size={16} /> {job.shoukaiAmount ? `Shoukai (${job.shoukaiAmount})` : 'Shoukai'}
          </button>
      </div>
    </div>
  );
}
