import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bookmark, Map as MapIcon, Calendar, Clock, Banknote, Share2, 
  Shield, Home, Globe, Award, Car, Users, Heart, Building2, CheckCircle2, Phone, Sparkles, Train, MapPin } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import AppSheet from './AppSheet';
import { formatBranchAddress, branchMapsUrl, publicBranchPhone, HIDDEN_PHONE_TEXT } from '../utils/branchUtils';
import { hasActiveApplication } from '../utils/applicationMapper';
import { jobValueLabel, isOwnJob } from '../utils/jobPostingNormalizer';
import './JobDetail.css';

// ============================================================
// JobDetail — Ish e'lonining to'liq batafsil sahifasi
// Yapon ish qidiruvchilari uchun barcha zarur ma'lumotlar:
// Maosh, ish vaqti, dam olish, bonus, sug'urta, uy-joy, chet elliklar, litsenziya
// Har bir ma'lumot minimalistik ikonka bilan vizual tarzda ko'rsatiladi
// ============================================================
export default function JobDetail({ job, onBack, onApply, onShoukai, applications = [], onToggleSave, profileData, userRole, onEditJob }) {
  const { t } = useTranslation();

  const getMaskedAddress = (fullAddress, location) => {
    if (!fullAddress) return location || '';
    const parts = fullAddress.split(',');
    if (parts.length > 1) {
      return parts[0] + (parts[1] ? ', ' + parts[1] : '') + ` (${t('addressMaskedNotice')})`;
    }
    const words = fullAddress.trim().split(/\s+/);
    if (words.length > 2) {
      return words.slice(0, 3).join(' ') + ` (${t('addressMaskedNotice')})`;
    }
    return fullAddress + ` (${t('addressMaskedNotice')})`;
  };

  // Withdrawn applications do not block applying again.
  const alreadyApplied = hasActiveApplication(applications, { jobId: job.id });
  const isSaved = profileData?.savedItems?.jobs?.some(j => j.id === job.id);

  const ownApps = (applications || []).filter(a => String(a.jobId) === String(job.id) && !a.isSimulatedReferral);
  const myApplication = ownApps.find(a => a.status !== 'withdrawn') || ownApps[0];
  const appStatus = myApplication ? myApplication.status : null;
  const isInterviewReady = appStatus === 'interview' || appStatus === 'accepted';
  // Never fall back to a fake number: without a phone there is nothing to call.
  const canCall = Boolean(job.phone) && ((job.phoneMode === 'public' || !job.phoneMode) || isInterviewReady);

  // 支店・営業所: one application = one selected branch
  const branches = Array.isArray(job.branches) ? job.branches.filter(Boolean) : [];
  const needsBranchPick = job.hiringScope === 'branch' && branches.length > 0;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedBranchId, setPickedBranchId] = useState(null);
  const appliedBranchName = myApplication?.branchName
    || (myApplication?.branchId ? branches.find(b => String(b.id) === String(myApplication.branchId))?.name : '');

  const handleApplyClick = () => {
    if (alreadyApplied) return;
    if (!needsBranchPick) { onApply(job); return; }
    if (branches.length === 1) {
      onApply(job, { branchId: branches[0].id, branchName: branches[0].name });
      return;
    }
    setPickedBranchId(null);
    setPickerOpen(true);
  };

  const confirmBranch = () => {
    const b = branches.find(x => String(x.id) === String(pickedBranchId));
    if (!b) return;
    setPickerOpen(false);
    onApply(job, { branchId: b.id, branchName: b.name });
  };

  // Ma'lumot elementlari ro'yxati — har biri ikonka, kalit va qiymat bilan
  // Bu tizim kompaniya e'lon yaratganda avtomatik to'ldiriladi
  const infoItems = [
    { icon: <Banknote size={18} color="#30D158" />, label: t('salary', 'Maosh'), value: job.salary ? job.salary.replace('/ oyiga', `/ ${t('perMonth', 'oyiga')}`) : '', show: !!job.salary },
    { icon: <Clock size={18} color="#0A84FF" />, label: t('workHours', 'Ish vaqti'), value: job.hours === 'shift' ? t('shiftWork', 'Smenali ish') : (job.hours ? t(job.hours, job.hours) : ''), show: !!job.hours },
    { icon: <Calendar size={18} color="#AF52DE" />, label: t('dayOff', 'Dam olish'), value: t(job.dayOff, job.dayOff), show: !!job.dayOff },
    { icon: <Award size={18} color="#FF9F0A" />, label: t('bonusDetail', 'Bonus'), value: t(job.bonus, job.bonus), show: !!job.bonus && job.bonus !== 'bonus_none' },
    { icon: <Shield size={18} color="#5E5CE6" />, label: t('insurance', "Sug'urta"), value: t(job.insurance, job.insurance), show: !!job.insurance },
    { icon: <Globe size={18} color="#FF2D55" />, label: t('foreignersLabel', "Chet elliklar"), value: job.foreigners ? t(job.foreigners, job.foreigners) : '', show: !!job.foreigners && job.foreigners !== 'foreigners_none' },
    { icon: <Home size={18} color="#34C759" />, label: t('housingLabel', "Yashash joyi"), value: job.housing ? t(job.housing, job.housing) : '', show: !!job.housing && job.housing !== 'housing_none' },
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
              {job.isInternational ? (
                <div className="international-card-tag" style={{ marginBottom: '8px' }}>
                  <Globe size={10} style={{ marginRight: '2px' }} />
                  <span>{t('foreigners_visa', 'Tokutei Ginou • Xalqaro Ish')}</span>
                </div>
              ) : job.foreigners === 'foreigners_visa_renew' ? (
                <div className="local-visa-renew-tag" style={{ marginBottom: '8px' }}>
                  <span className="briefcase-icon">💼</span>
                  <span>{t('foreigners_visa_renew', 'Vizani Uzaytirish Ko\'magi')}</span>
                </div>
              ) : job.foreigners === 'foreigners_ok' ? (
                <div className="local-foreigner-ok-tag" style={{ marginBottom: '8px' }}>
                  <span className="users-icon">👥</span>
                  <span>{t('foreigners_ok', 'Chet elliklar ochiq (Vizasiz)')}</span>
                </div>
              ) : null}
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
          
          {/* 1. MOLIYAVIY SHAROIT (SALARY FEATURE CARD) — always shown; empty → 未入力 */}
          {(
            <div className="db-salary-card glass squircle fade-in">
              <div className="db-salary-icon">
                <Banknote size={24} color="#30D158" />
              </div>
              <div style={{ display: 'flex', flex: 1, gap: '20px', flexWrap: 'wrap' }}>
                <div className="db-salary-text">
                  <span className="db-label">{t('salary', 'Maosh')}</span>
                  <h3 className="db-salary-value">
                    {job.salary ? job.salary.replace('/ oyiga', `/ ${t('perMonth', 'oyiga')}`) : t('notProvided', '未入力')}
                  </h3>
                </div>
                {job.bonus !== 'bonus_none' && (
                  <div className="db-salary-text">
                    <span className="db-label">{t('bonusDetail', 'Bonus')}</span>
                    <h3 className="db-salary-value" style={{ color: job.bonus ? '#FF9F0A' : undefined }}>
                      {jobValueLabel(t, job.bonus)}
                    </h3>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. ISH GRAFIKI (SCHEDULE CARD GROUP) */}
          {(
            <div className="db-group-card glass squircle">
              <div className="db-group-title">
                <Clock size={16} color="#0A84FF" />
                <span>{t('workHours', 'Ish tartibi')}</span>
              </div>
              <div className="db-schedule-grid">
                <div className="db-sub-cell">
                  <span className="db-sub-label">{t('workHours', 'Ish vaqti')}</span>
                  <strong className="db-sub-value">{jobValueLabel(t, job.hours)}</strong>
                </div>
                <div className="db-sub-cell">
                  <span className="db-sub-label">{t('dayOff', 'Dam olish')}</span>
                  <strong className="db-sub-value">{jobValueLabel(t, job.dayOff)}</strong>
                </div>
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
              <div className="db-list-row">
                <div className="db-row-left">
                  <div className="db-row-icon icon-insurance">
                    <Shield size={16} color="#5E5CE6" />
                  </div>
                  <span className="db-row-label">{t('insurance', "Sug'urta")}</span>
                </div>
                <strong className="db-row-value">{jobValueLabel(t, job.insurance)}</strong>
              </div>

              {/* Chet elliklar Row */}
              {job.foreigners !== 'foreigners_none' && (
                <div className="db-list-row">
                  <div className="db-row-left">
                    <div className="db-row-icon icon-globe">
                      <Globe size={16} color="#0A84FF" />
                    </div>
                    <span className="db-row-label">{t('foreignersLabel', 'Chet elliklar')}</span>
                  </div>
                  <strong className="db-row-value">{jobValueLabel(t, job.foreigners)}</strong>
                </div>
              )}

              {/* Uy-joy Row */}
              <div className="db-list-row">
                <div className="db-row-left">
                  <div className="db-row-icon icon-home">
                    <Home size={16} color="#34C759" />
                  </div>
                  <span className="db-row-label">{t('housingLabel', 'Uy-joy')}</span>
                </div>
                <strong className="db-row-value">{jobValueLabel(t, job.housing)}</strong>
              </div>

              {/* Metro/Bekat Row */}
              <div className="db-list-row">
                <div className="db-row-left">
                  <div className="db-row-icon icon-subway">
                    <Train size={16} color="#AF52DE" />
                  </div>
                  <span className="db-row-label">{t('nearestStationLabel', 'Metro / Bekat')}</span>
                </div>
                <strong className="db-row-value">
                  {job.nearestStation || t('notProvided', '未入力')}
                  {job.nearestStation && job.walkTime ? ` (🚶‍♂️ ${job.walkTime} ${t('minutesUnit', 'daqiqa')})` : ''}
                </strong>
              </div>

              {/* Litsenziya Row */}
              <div className="db-list-row">
                <div className="db-row-left">
                  <div className="db-row-icon icon-license">
                    <Car size={16} color="#E63946" />
                  </div>
                  <span className="db-row-label">{t('licenseRequired', 'Litsenziya')}</span>
                </div>
                <strong className="db-row-value">{jobValueLabel(t, job.license)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ====== TOKUTEI GINOU (SSW) VISA REQUIREMENTS ====== */}
        {job.isInternational && (
          <div className="ssw-requirements-block glass squircle fade-in">
            <div className="ssw-req-header">
              <Sparkles size={18} color="#AF52DE" />
              <h3>{t('sswRequirementsTitle', 'Tokutei Ginou (SSW) Imtihon va Viza Talablari')}</h3>
            </div>
            <div className="ssw-req-list">
              <div className="ssw-req-item">
                <span className="ssw-req-bullet"></span>
                <p>{t('sswLanguageReq', '🇯🇵 Yapon Tili: JLPT N4 yoki JFT-Basic hujjati bo\'lishi majburiy.')}</p>
              </div>
              <div className="ssw-req-item">
                <span className="ssw-req-bullet"></span>
                <p>{t('sswSkillsReq', '🚛 Logistika Imtihoni: Haydovchilik / Logistika SSW kasbiy imtihon hujjati shart.')}</p>
              </div>
              <div className="ssw-req-item">
                <span className="ssw-req-bullet"></span>
                <p>{t('sswSupportOrgReq', '🏢 Qo\'llab-quvvatlash: 1-sonli ro\'yxatdan o\'tgan tashkilot (RSO) ko\'magi kafolatlanadi.')}</p>
              </div>
            </div>
          </div>
        )}

        {/* ====== FILIALLAR RO'YXATI (支店・営業所) ====== */}
        {branches.length > 0 && (
          <div className="branches-detail-block glass squircle" id="job-branches" style={{ padding: '16px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={17} color="#007AFF" />
              <span>{t('branchesSectionTitle', '募集勤務地（支店・営業所）')} ({branches.length})</span>
            </h3>
            {appliedBranchName && (
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#30D158', marginBottom: 10 }}>
                ✓ {t('branchAppliedTo', '応募先')}：{appliedBranchName}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {branches.map((b, idx) => <BranchCard key={b.id || idx} b={b} t={t} />)}
            </div>
          </div>
        )}

        {/* ====== TAVSIF ====== */}
        <div className="description-block">
          <h3>{t('jobConditions', 'Ish sharoitlari')}</h3>
          <p>{t(`job_${job.id}_description`, job.description || t('notProvided'))}</p>
        </div>

        {/* ====== MANZIL ====== */}
        <div className="map-block">
          <h3>{t('address', 'Manzil')}</h3>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getMaskedAddress(job.fullAddress, job.location))}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div className="map-placeholder squircle glass" style={{ cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
              <MapIcon size={32} color="#0A84FF" />
              <span style={{textAlign: 'center', color: 'var(--text-main)', marginTop: '12px', fontWeight: '500'}}>
                {t('viewOnMap', "Xaritada ko'rish")} <br/>
                <small style={{ color: 'var(--text-secondary)', display: 'inline-block', marginTop: '12px' }}>{getMaskedAddress(job.fullAddress, job.location)}</small>
              </span>
            </div>
          </a>
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
              🎉 {t('shoukaiAvailable', 'Shoukai puli bor')}{job.shoukaiFee > 0 ? ` ¥${Number(job.shoukaiFee).toLocaleString()}` : (job.shoukaiAmount && job.shoukaiAmount !== '0' ? ` ${job.shoukaiAmount}` : '')}
            </div>
            
            <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.15)', padding: '12px', borderRadius: '12px', lineHeight: '1.4' }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>{t('shoukaiConditionsTitle', 'Shoukai shartlari va izohlari')}:</strong>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                {job.shoukaiConditions || t('notProvided')}
              </div>
            </div>
          </div>
        )}
        
        {/* ====== PASTKI TUGMALAR (STICKY) ====== */}
        <div className="sticky-action glass">
          {userRole === 'company' ? (
            isOwnJob(job, profileData) ? (
              <button 
                className="apply-btn"
                style={{ width: '100%', background: '#1c1c1e', color: '#fff', fontSize: '16px', fontWeight: 'bold' }}
                onClick={() => onEditJob && onEditJob(job)}
              >
                {t('editJob', 'Tahrirlash')}
              </button>
            ) : (
              <>
                {canCall ? (
                  <a 
                    href={`tel:${job.phone}`} 
                    className="apply-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', fontWeight: '700' }}
                  >
                    <Phone size={16} />
                    {t('callBtn', 'Qo\'ng\'iroq qilish')}
                  </a>
                ) : (
                  <button 
                    type="button"
                    className="apply-btn"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.6, cursor: 'not-allowed', background: 'rgba(118, 118, 128, 0.12)', color: 'var(--text-secondary)' }}
                    onClick={() => alert(t('phoneHiddenNotice'))}
                  >
                    <Phone size={16} />
                    {t('callBtn', 'Qo\'ng\'iroq qilish')} 🔒
                  </button>
                )}
                <button 
                  className="apply-btn shoukai-btn" 
                  onClick={() => onShoukai(job)}
                >
                  <Share2 size={16} />
                  {((job.shoukaiAmount && job.shoukaiAmount !== "0") || job.hasShoukai) ? `${t('shoukai', 'Shoukai')} (${t('shoukaiAvailableLabel', 'Puli Bor')})` : t('shoukai', 'Shoukai')}
                </button>
              </>
            )
          ) : (
            <>
              <button 
                className={`apply-btn ${alreadyApplied ? 'applied' : ''}`}
                onClick={handleApplyClick}
                id="job-apply-btn"
                style={{ flex: '1.2' }}
              >
                {alreadyApplied ? t('applied') : t('applyJob')}
              </button>
              <button 
                className="apply-btn shoukai-btn" 
                onClick={() => onShoukai(job)}
                style={{ flex: '1.1' }}
              >
                <Share2 size={15} />
                {((job.shoukaiAmount && job.shoukaiAmount !== "0") || job.hasShoukai) ? `${t('shoukai', 'Shoukai')} (${t('shoukaiAvailableLabel', 'Puli Bor')})` : t('shoukai', 'Shoukai')}
              </button>
              {canCall ? (
                <a 
                  href={`tel:${job.phone}`} 
                  className="apply-btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', background: 'var(--success)', color: '#fff', fontWeight: 'bold', flex: '1' }}
                >
                  <Phone size={14} />
                  {t('callBtn', 'Qo\'ng\'iroq')}
                </a>
              ) : (
                <button 
                  type="button"
                  className="apply-btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: 0.65, background: 'rgba(118, 118, 128, 0.12)', color: 'var(--text-secondary)', cursor: 'not-allowed', flex: '1' }}
                  onClick={() => alert(t('phoneHiddenNotice'))}
                >
                  <Phone size={14} />
                  {t('callBtn', 'Qo\'ng\'iroq')} 🔒
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ====== 勤務地選択（1応募 = 1勤務地） ====== */}
      <AppSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        id="branch-picker-sheet"
        title={t('branchPickerTitle', '希望する勤務地を選択してください')}
      >
        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {t('branchPickerSub', 'この求人は複数の勤務地で募集しています。応募する勤務地を1つ選んでください。')}
        </p>
        <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {branches.map((b, idx) => {
            const selected = String(pickedBranchId) === String(b.id);
            return (
              <button
                key={b.id || idx}
                type="button"
                role="radio"
                aria-checked={selected}
                id={`branch-pick-${b.id || idx}`}
                onClick={() => setPickedBranchId(b.id)}
                style={{ textAlign: 'left', padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 12, outline: selected ? '2px solid #007AFF' : 'none', outlineOffset: 0 }}
              >
                <BranchCard b={b} t={t} compact selected={selected} />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          id="branch-pick-confirm"
          className="apply-btn"
          disabled={!pickedBranchId}
          onClick={confirmBranch}
          style={{ width: '100%', marginTop: 16, opacity: pickedBranchId ? 1 : 0.5, cursor: pickedBranchId ? 'pointer' : 'not-allowed' }}
        >
          {t('branchPickerConfirm', 'この勤務地で応募する')}
        </button>
      </AppSheet>
    </div>
  );
}

/** 支店カード: 名称・住所・最寄り駅・募集人数・電話（非公開なら「面接時にお知らせします」）・地図 */
function BranchCard({ b, t, compact = false, selected = false }) {
  const phone = publicBranchPhone(b);
  const mapUrl = branchMapsUrl(b);
  const rowStyle = { display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 4, color: 'var(--text-secondary)' };
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: '12px',
        background: selected ? 'rgba(0,122,255,0.08)' : 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        fontSize: '13px',
        color: 'var(--text-main)'
      }}
    >
      <div style={{ fontWeight: 800, fontSize: '14px' }}>{b.name}</div>
      <div style={rowStyle}>
        <MapPin size={13} style={{ flexShrink: 0, marginTop: 2 }} />
        <span style={{ wordBreak: 'break-all' }}>{formatBranchAddress(b)}</span>
      </div>
      {b.nearestStation && (
        <div style={rowStyle}>
          <Train size={13} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{b.nearestStation}{b.walkMinutes ? ` ${t('branchWalk', '徒歩{{min}}分', { min: b.walkMinutes })}` : ''}</span>
        </div>
      )}
      {b.headcount ? (
        <div style={rowStyle}>
          <Users size={13} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>{t('branchHeadcount', '募集{{count}}名', { count: b.headcount })}</span>
        </div>
      ) : null}
      <div style={rowStyle}>
        <Phone size={13} style={{ flexShrink: 0, marginTop: 2 }} />
        {phone ? (
          compact ? (
            <span>{phone}</span>
          ) : (
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} style={{ color: '#007AFF', fontWeight: 700, textDecoration: 'none' }}>
              {phone}
            </a>
          )
        ) : (
          <span data-testid="branch-phone-hidden">{HIDDEN_PHONE_TEXT}</span>
        )}
      </div>
      {!compact && mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: '12.5px', fontWeight: 700, color: '#007AFF', textDecoration: 'none' }}
        >
          <MapIcon size={13} /> {t('branchOpenMap', '地図で見る')}
        </a>
      )}
    </div>
  );
}
