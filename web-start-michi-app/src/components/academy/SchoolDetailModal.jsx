import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Bookmark, MapPin, Phone, Mail, Share2, CheckCircle2, Edit3 
} from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';

export default function SchoolDetailModal({
  selectedSchool,
  setSelectedSchool,
  onBackPress,
  showShoukaiInput,
  setShowShoukaiInput,
  referrerName,
  setReferrerName,
  isContractActive,
  onApplySchool,
  schoolApplications = [],
  onShoukaiPaid,
  profileData,
  onShoukai,
  onToggleSave,
  userRole,
  onEditJob
}) {
  const { t } = useTranslation();
  if (!selectedSchool) return null;

  const school = selectedSchool;

  const getMaskedAddress = (fullAddress) => {
    if (!fullAddress) return '';
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

  const existingApp = schoolApplications.find(a => a.schoolId === school.id && !a.isSimulatedReferral);
  const hasApplied = !!existingApp;
  const isSaved = profileData?.savedItems?.schools?.some(s => s.id === school.id);

  return (
    <div className="academy-container detail-view fade-in">
      <div className="school-detail-scroll hide-scrollbar">
        {/* Sticky Header Buttons */}
        <div className="academy-header-actions">
          <button className="icon-btn glass" onClick={() => { 
            if (onBackPress) {
              onBackPress();
            } else {
              setSelectedSchool(null);
            }
            setShowShoukaiInput(false);
          }}>
            <ArrowLeft size={20} />
          </button>
          
          <button className="icon-btn glass" onClick={() => onToggleSave && onToggleSave(school, 'schools')}>
            <Bookmark size={20} fill={isSaved ? "var(--primary)" : "none"} color={isSaved ? "var(--primary)" : "currentColor"} />
          </button>
        </div>

        {/* Cover Image */}
        <div className="school-image-container">
          <img 
            src={school.image} 
            alt={school.name} 
            className="school-image" 
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800"; }}
          />
          <div className="langs-badge glass">{school.langs ? school.langs.join(', ') : 'UZ, JP'}</div>
        </div>

        {/* Detail Body Overlap */}
        <div className="school-detail-body">
          <div className="school-header-row" style={{ marginBottom: '4px' }}>
            <h2 className="school-name" style={{ fontSize: '22px' }}>{t(`school_${school.id}_name`, school.name)}</h2>
            {(school.verified || isContractActive) && <VerifiedBadge size={20} />}
          </div>
          
          <p className="school-location" style={{ marginBottom: '20px' }}>
            <MapPin size={14} /> {t(`school_${school.id}_location`, school.location)}
          </p>

          {/* 2-Column Desktop Layout Wrapper */}
          <div className="school-detail-main-layout">
            {/* Left Column: Details */}
            <div className="school-detail-left-col">
              {/* Courses */}
              <div className="detail-section">
                <h4>{t('courseOffered')}</h4>
                <div className="categories-row">
                  {(school.courses || [school.type]).map(course => {
                    const translationKey = course === school.type ? `school_${school.id}_type` : `lic_${course.toLowerCase()}`;
                    return <span key={course} className="category-tag">{t(translationKey, course)}</span>;
                  })}
                </div>
              </div>

              {/* Course Pricing Table */}
              <div className="detail-section course-pricing-section">
                <h4>{t('coursePricingHeader', 'Kurslar va Narxlar (教習コース・料金)')}</h4>
                
                {/* Desktop Full Table View */}
                <div className="course-pricing-table-desktop">
                  <table className="academy-pricing-table">
                    <thead>
                      <tr>
                        <th>{t('courseName', 'Kurs nomi')}</th>
                        <th>{t('courseDuration', 'Muddati')}</th>
                        <th>{t('courseLangs', 'Dars tillari')}</th>
                        <th>{t('memberDiscount', 'Chegirma')}</th>
                        <th style={{ textAlign: 'right' }}>{t('coursePrice', 'Narxi')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(school.courses || ['Futsu']).map((course, idx) => {
                        const courseName = t(`lic_${course.toLowerCase()}`, course);
                        const isFutsu = course === 'Futsu';
                        return (
                          <tr key={course}>
                            <td>
                              <strong>{courseName}</strong>
                            </td>
                            <td>{isFutsu ? t('durationStandard', '2-3 hafta') : t('durationShort', '1-2 hafta')}</td>
                            <td>
                              <span className="lang-mini-badge">{school.langs ? school.langs.join(', ') : 'UZ, JP'}</span>
                            </td>
                            <td>
                              {school.discount ? <span className="discount-tag">-{school.discount}</span> : '-'}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '800', color: '#30D158' }}>
                              {idx === 0 ? school.price : `¥${((school.priceValue || 250000) + idx * 30000).toLocaleString()}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="course-price-cards-mobile">
                  {(school.courses || ['Futsu']).map((course, idx) => {
                    const courseName = t(`lic_${course.toLowerCase()}`, course);
                    const isFutsu = course === 'Futsu';
                    return (
                      <div key={course} className="mobile-course-price-card glass squircle">
                        <div className="m-course-header">
                          <span className="m-course-title">{courseName}</span>
                          <span className="m-course-price">{idx === 0 ? school.price : `¥${((school.priceValue || 250000) + idx * 30000).toLocaleString()}`}</span>
                        </div>
                        <div className="m-course-meta">
                          <span>⏱ {isFutsu ? t('durationStandard', '2-3 hafta') : t('durationShort', '1-2 hafta')}</span>
                          <span>🌐 {school.langs ? school.langs.join(', ') : 'UZ, JP'}</span>
                          {school.discount && <span className="discount-tag">-{school.discount}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="detail-section">
                <h4>{t('schoolDesc')}</h4>
                <p className="school-description">{t(`school_${school.id}_description`, school.description)}</p>
              </div>

              {/* Contact Information */}
              <div className="detail-section contact-section glass squircle">
                <div className="contact-row">
                  <Phone size={16} color="#34C759" />
                  <span>{t('schoolPhone')}: {school.phone || '+81 90-1234-5678'}</span>
                </div>
                <div className="contact-row">
                  <Mail size={16} color="#0A84FF" />
                  <span>{t('emailLabel')}: {school.email || 'info@academy.jp'}</span>
                </div>
                <div className="contact-row">
                  <MapPin size={16} color="#AF52DE" />
                  <span>{t('fullAddress')}: {getMaskedAddress(school.fullAddress)}</span>
                </div>
              </div>

              {/* Shoukai Section */}
              {school.shoukaiFee > 0 && (
                <div className="detail-section shoukai-section glass squircle">
                  <div className="shoukai-header">
                    <Share2 size={18} color="#FF9F0A" />
                    <h4>{t('shoukaiShare', 'Ulashish / Shoukai')}</h4>
                  </div>
                  <p className="shoukai-desc">{t('shoukaiDesc', "Do'stingizni taklif qiling va mukofot oling")}</p>
                  
                  <div className="shoukai-amount" style={{ fontSize: '16px', fontWeight: 'bold', color: '#FF9F0A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎉 {t('shoukaiAvailable', 'Shoukai puli bor')}</span>
                  </div>
                  
                  <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', background: 'rgba(255,159,10,0.06)', border: '1px solid rgba(255,159,10,0.15)', padding: '12px', borderRadius: '12px', lineHeight: '1.4' }}>
                    <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>{t('shoukaiConditionsTitle', 'Shoukai shartlari va izohlari')}:</strong>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {school.shoukaiConditions || t('defaultSchoolShoukaiConditions', 'Sinov/O\'qish boshlash muddatidan so\'ng tavsiya qiluvchiga mukofot to\'lanadi.')}
                    </div>
                  </div>

                  {showShoukaiInput && !hasApplied && (
                    <div className="shoukai-input-wrap">
                      <input 
                        type="text"
                        className="auth-input"
                        placeholder={t('shoukaiBy')}
                        value={referrerName}
                        onChange={(e) => setReferrerName(e.target.value)}
                      />
                      <button 
                        className="shoukai-apply-btn squircle"
                        onClick={() => {
                          onApplySchool && onApplySchool(school, referrerName);
                          setShowShoukaiInput(false);
                        }}
                      >
                        {userRole === 'company' ? t('recommendEmployee', 'Xodimni tavsiya etish') : `${t('applyToSchool')} + ${t('shoukaiShare')}`}
                      </button>
                    </div>
                  )}

                  {existingApp && existingApp.referrerName && (
                    <div className={`shoukai-track ${existingApp.paid ? 'paid' : 'unpaid'}`}>
                      <div className="shoukai-track-info">
                        <span className="shoukai-referrer">{t('shoukaiBy')}: {existingApp.referrerName}</span>
                        <span className="shoukai-fee">{t('shoukaiAvailable', 'Shoukai puli bor')}</span>
                      </div>
                      {!existingApp.paid ? (
                        <button 
                          className="shoukai-pay-btn squircle"
                          onClick={() => onShoukaiPaid && onShoukaiPaid(existingApp.id)}
                        >
                          {t('shoukaiPaid')}
                        </button>
                      ) : (
                        <div className="shoukai-paid-badge">
                          <CheckCircle2 size={16} /> {t('shoukaiPaid')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Desktop Sidebar Action Panel */}
            <div className="school-detail-right-col">
              <div className="school-sticky-actions glass">
                {userRole === 'company' ? (
                  profileData?.fullName === school.name ? (
                    <button 
                      className="academy-apply-btn"
                      style={{ width: '100%', background: '#1c1c1e', color: '#fff', fontSize: '15px', fontWeight: 'bold', border: 'none', borderRadius: '20px', height: '38px', cursor: 'pointer' }}
                      onClick={() => onEditJob && onEditJob(school)}
                    >
                      <Edit3 size={15} style={{ marginRight: '6px' }} />
                      {t('editJob', 'Tahrirlash')}
                    </button>
                  ) : (
                    <>
                      <a 
                        href={`tel:${school.phone || '+819012345678'}`} 
                        className="academy-apply-btn"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', fontWeight: '700' }}
                      >
                        <Phone size={15} /> {t('callSchool', "Qo'ng'iroq")}
                      </a>
                      <button 
                        className="academy-shoukai-btn"
                        onClick={() => onShoukai && onShoukai(school)}
                      >
                        <Share2 size={14} /> {t('shoukai', 'Shoukai')}
                      </button>
                    </>
                  )
                ) : (
                  <>
                    {!hasApplied ? (
                      <button 
                        className="academy-apply-btn"
                        onClick={() => onApplySchool && onApplySchool(school, '')}
                      >
                        {t('applyToSchool', 'Topshirish')}
                      </button>
                    ) : (
                      <button className="academy-apply-btn applied" disabled>
                        <CheckCircle2 size={14} /> {t('appliedToSchool', 'Topshirilgan')}
                      </button>
                    )}
                    <button 
                      className="academy-shoukai-btn"
                      onClick={() => onShoukai && onShoukai(school)}
                    >
                      <Share2 size={14} /> {t('shoukai', 'Shoukai')}
                    </button>
                    <a 
                      href={`tel:${school.phone || '+819012345678'}`} 
                      className="academy-call-btn"
                    >
                      <Phone size={15} /> {t('callSchool', "Qo'ng'iroq")}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
