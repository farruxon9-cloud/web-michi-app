import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bookmark, Map as MapIcon, Calendar, Clock, Banknote, Share2, 
  Shield, Home, Globe, Award, Car, Users, Heart, Building2, CheckCircle2 } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import './JobDetail.css';

// ============================================================
// JobDetail — Ish e'lonining to'liq batafsil sahifasi
// Yapon ish qidiruvchilari uchun barcha zarur ma'lumotlar:
// Maosh, ish vaqti, dam olish, bonus, sug'urta, uy-joy, chet elliklar, litsenziya
// Har bir ma'lumot minimalistik ikonka bilan vizual tarzda ko'rsatiladi
// ============================================================
export default function JobDetail({ job, onBack, onApply, onShoukai, applications = [], onToggleSave, profileData, userRole }) {
  const { t } = useTranslation();
  const alreadyApplied = applications.some(a => a.jobId === job.id && !a.isSimulatedReferral);
  const isSaved = profileData?.savedItems?.jobs?.some(j => j.id === job.id);

  // Ma'lumot elementlari ro'yxati — har biri ikonka, kalit va qiymat bilan
  // Bu tizim kompaniya e'lon yaratganda avtomatik to'ldiriladi
  const infoItems = [
    { icon: <Banknote size={18} color="#30D158" />, label: t('salary', 'Maosh'), value: job.salary ? job.salary.replace('/ oyiga', `/ ${t('perMonth', 'oyiga')}`) : '', show: !!job.salary },
    { icon: <Clock size={18} color="#0A84FF" />, label: t('workHours', 'Ish vaqti'), value: job.hours === 'shift' ? t('shiftWork', 'Smenali ish') : job.hours, show: !!job.hours },
    { icon: <Calendar size={18} color="#AF52DE" />, label: t('dayOff', 'Dam olish'), value: t(job.dayOff, job.dayOff), show: !!job.dayOff },
    { icon: <Award size={18} color="#FF9F0A" />, label: t('bonusLabel', 'Bonus'), value: t(job.bonus, job.bonus), show: !!job.bonus && job.bonus !== 'bonus_none' },
    { icon: <Shield size={18} color="#5E5CE6" />, label: t('insuranceLabel', "Sug'urta"), value: t(job.insurance, job.insurance), show: !!job.insurance },
    { icon: <Globe size={18} color="#0A84FF" />, label: t('foreignersLabel', 'Chet elliklar'), value: t(job.foreigners, job.foreigners), show: !!job.foreigners && job.foreigners !== 'foreigners_none' },
    { icon: <Home size={18} color="#34C759" />, label: t('housingLabel', 'Uy-joy'), value: t(job.housing, job.housing), show: !!job.housing && job.housing !== 'housing_none' },
    { icon: <Car size={18} color="#E63946" />, label: t('licenseRequired', 'Litsenziya'), value: t(job.license, job.license), show: !!job.license },
  ].filter(item => item.show);

  return (
    <div className="job-detail-container slide-up">
      {/* ====== SARLAVHA TUGMALARI ====== */}
      <div className="header-actions">
        <button className="icon-btn glass" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <button className="icon-btn glass" onClick={() => onToggleSave(job, 'jobs')}>
          <Bookmark size={20} fill={isSaved ? "var(--primary)" : "none"} color={isSaved ? "var(--primary)" : "currentColor"} />
        </button>
      </div>

      {/* ====== KATTA RASM ====== */}
      <div className="detail-header-image">
        <img 
          src={job.image} 
          alt={job.title} 
          className="bg-img" 
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800"; }}
        />
        {/* Ish turi belgisi */}
        <span className={`detail-type-badge type-${job.type || 'fulltime'}`}>
          {t(`jobType_${job.type || 'fulltime'}`, job.type === 'fulltime' ? '正社員' : job.type === 'parttime' ? 'アルバイト' : '契約')}
        </span>
      </div>

      {/* ====== ASOSIY KONTENT ====== */}
      <div className="detail-content">
        {/* Kompaniya + Sarlavha */}
        <div className="company-header">
          <div className="company-title-wrap">
            <img src={job.logo} alt={job.company} className="detail-logo squircle" />
            <div>
              <h2 className="detail-title">{t(`job_${job.id}_title`, job.title)}</h2>
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

        {/* ====== PREMIUM DASHBOARD GRUPPALARI ====== */}
        <div className="job-dashboard-layout">
          
          {/* 1. MOLIYAVIY SHAROIT (SALARY FEATURE CARD) */}
          {job.salary && (
            <div className="db-salary-card glass squircle fade-in">
              <div className="db-salary-icon">
                <Banknote size={24} color="#30D158" />
              </div>
              <div className="db-salary-text">
                <span className="db-label">{t('salary', 'Maosh')}</span>
                <h3 className="db-salary-value">
                  {job.salary.replace('/ oyiga', `/ ${t('perMonth', 'oyiga')}`)}
                </h3>
              </div>
              {job.bonus && job.bonus !== 'bonus_none' && (
                <div className="db-bonus-badge">
                  <Award size={14} color="#FF9F0A" />
                  <span>{t(job.bonus, job.bonus)}</span>
                </div>
              )}
            </div>
          )}

          {/* 2. ISH GRAFIKI (SCHEDULE CARD GROUP) */}
          {(job.hours || job.dayOff) && (
            <div className="db-group-card glass squircle">
              <div className="db-group-title">
                <Clock size={16} color="#0A84FF" />
                <span>{t('workHours', 'Ish tartibi')}</span>
              </div>
              <div className="db-schedule-grid">
                {job.hours && (
                  <div className="db-sub-cell">
                    <span className="db-sub-label">{t('workHours', 'Ish vaqti')}</span>
                    <strong className="db-sub-value">
                      {job.hours === 'shift' ? t('shiftWork', 'Smenali') : job.hours}
                    </strong>
                  </div>
                )}
                {job.dayOff && (
                  <div className="db-sub-cell">
                    <span className="db-sub-label">{t('dayOff', 'Dam olish')}</span>
                    <strong className="db-sub-value">
                      {t(job.dayOff, job.dayOff)}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. IJTIMOIY YORDAM & IMTIYOZLAR (BENEFITS & REQUIREMENTS LIST) */}
          <div className="db-group-card glass squircle">
            <div className="db-group-title">
              <Shield size={16} color="#5E5CE6" />
              <span>{t('jobConditions', 'Imtiyozlar va Talablar')}</span>
            </div>
            
            <div className="db-list-rows">
              {/* Sug'urta Row */}
              {job.insurance && (
                <div className="db-list-row">
                  <div className="db-row-left">
                    <div className="db-row-icon icon-insurance">
                      <Shield size={16} color="#5E5CE6" />
                    </div>
                    <span className="db-row-label">{t('insuranceLabel', "Sug'urta")}</span>
                  </div>
                  <strong className="db-row-value">{t(job.insurance, job.insurance)}</strong>
                </div>
              )}

              {/* Chet elliklar Row */}
              {job.foreigners && job.foreigners !== 'foreigners_none' && (
                <div className="db-list-row">
                  <div className="db-row-left">
                    <div className="db-row-icon icon-globe">
                      <Globe size={16} color="#0A84FF" />
                    </div>
                    <span className="db-row-label">{t('foreignersLabel', 'Chet elliklar')}</span>
                  </div>
                  <strong className="db-row-value">{t(job.foreigners, job.foreigners)}</strong>
                </div>
              )}

              {/* Uy-joy Row */}
              {job.housing && job.housing !== 'housing_none' && (
                <div className="db-list-row">
                  <div className="db-row-left">
                    <div className="db-row-icon icon-home">
                      <Home size={16} color="#34C759" />
                    </div>
                    <span className="db-row-label">{t('housingLabel', 'Uy-joy')}</span>
                  </div>
                  <strong className="db-row-value">{t(job.housing, job.housing)}</strong>
                </div>
              )}

              {/* Litsenziya Row */}
              {job.license && (
                <div className="db-list-row">
                  <div className="db-row-left">
                    <div className="db-row-icon icon-license">
                      <Car size={16} color="#E63946" />
                    </div>
                    <span className="db-row-label">{t('licenseRequired', 'Litsenziya')}</span>
                  </div>
                  <strong className="db-row-value">{t(job.license, job.license)}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ====== TAVSIF ====== */}
        <div className="description-block">
          <h3>{t('jobConditions', 'Ish sharoitlari')}</h3>
          <p>{t(`job_${job.id}_description`, job.description || t('jobDesc'))}</p>
        </div>

        {/* ====== MANZIL ====== */}
        <div className="map-block">
          <h3>{t('address', 'Manzil')}</h3>
          <div className="map-placeholder squircle glass">
            <MapIcon size={32} color="#8E8E93" />
            <span style={{textAlign: 'center'}}>{t('viewOnMap', "Xaritada ko'rish")} <br/><small>{job.fullAddress || t(`job_${job.id}_location`, job.location)}</small></span>
          </div>
        </div>

        {/* ====== SHOUKAI MUKOFOTI ====== */}
        {((job.shoukaiAmount && job.shoukaiAmount !== "0") || job.hasShoukai) && (
          <div className="shoukai-detail-block glass squircle">
            <div className="shoukai-detail-header">
              <Share2 size={18} color="#FF9F0A" />
              <h4>{t('shoukaiShare', 'Ulashish / Shoukai')}</h4>
            </div>
            <p className="shoukai-detail-desc">
              {t('shoukaiDesc', "Do'stingizni taklif qiling va mukofot oling")}
            </p>
            <div className="shoukai-detail-amount" style={{ color: '#FF9F0A', fontWeight: 'bold' }}>
              🎉 {t('shoukaiAvailable', 'Shoukai puli bor')}
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.15)', padding: '10px 14px', borderRadius: '12px', lineHeight: '1.4' }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>{t('shoukaiConditionsTitle', 'Shoukai shartlari va izohlari')}:</strong>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                {job.shoukaiConditions || t('defaultJobShoukaiConditions', 'Tavsiya qilingan nomzod ishga qabul qilinib, kamida 3 oy ishlasa shoukai puli to\'lab beriladi.')}
              </div>
            </div>
          </div>
        )}
        
      </div>

      {/* ====== PASTKI TUGMALAR (STICKY) ====== */}
      <div className="sticky-action glass">
        <button 
          className={`apply-btn ${alreadyApplied ? 'applied' : ''}`}
          onClick={() => !alreadyApplied && onApply(job)}
        >
          {alreadyApplied ? t('applied') : t('applyJob')}
        </button>
        <button 
          className="apply-btn shoukai-btn" 
          onClick={() => onShoukai(job)}
        >
          <Share2 size={16} />
          {((job.shoukaiAmount && job.shoukaiAmount !== "0") || job.hasShoukai) ? `${t('shoukai', 'Shoukai')} (${t('shoukaiAvailableLabel', 'Puli Bor')})` : t('shoukai', 'Shoukai')}
        </button>
      </div>
    </div>
  );
}
