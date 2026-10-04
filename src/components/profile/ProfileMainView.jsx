// v1.1 Faza E: Profile.jsx dagi asosiy (main) ko'rinish o'zgarishsiz ko'chirildi.
// Holat va funksiyalar Profile'dan `ctx` orqali keladi (klasslar, stil va DOM bir xil).
import {
  User, Settings, FileText, Bell, LogOut, ChevronRight, CheckCircle2, BadgeCheck, Briefcase, Building2, MapPin, Phone, Users, Camera, Share2, Bookmark, Megaphone, Info, Sparkles, FileCheck, Award, GraduationCap
} from 'lucide-react';
import VerifiedBadge from '../VerifiedBadge';
import JapaneseVehiclePickerModal from '../JapaneseVehiclePickerModal';
import { applyCatalogSelection } from '../../utils/vehicleUtils';
import ConfirmSheet from '../ConfirmSheet';
import VehicleCard from './VehicleCard';
import { pressable } from '../../utils/a11y';
import { getProfileCompleteness } from '../../utils/profileCompleteness';
import ProfileQuickActions from './ProfileQuickActions';

export default function ProfileMainView(ctx) {
  const { confirmDeleteVehicle, contractStatus, editVehicleData, employeesCount, fileInputRef, getAvatarSrc, getRoleLabel, handleAvatarChange, handleClearAllVehicles, handleOpenSubPage, i18n, isVehiclePickerOpen, mainContainerRef, onLogout, onTriggerRegister, profileData, referralsCount, setContractStatus, setEditVehicleData, setIsVehiclePickerOpen, setProfileActivePageSource, setVehicleClearConfirm, setVehicleDeleteTarget, setVehicleNotice, showProfileBadges, t, totalOwnApplications, totalSavedCount, unreadCount, userRole, vehicleClearConfirm, vehicleDeleteTarget, vehicleNotice } = ctx;
  const displayName = profileData.fullName === 'Mehmon' || userRole === 'guest' || !profileData.fullName ? t('roleGuest', 'Mehmon') : profileData.fullName;
  const completeness = userRole === 'driver' ? getProfileCompleteness(profileData) : null;
  return (
    <div className="profile-container sub-page-view fade-in" ref={mainContainerRef}>
      <div className="profile-header">
        <div
          className="profile-avatar-wrap"
          role="button"
          tabIndex={0}
          aria-label={t('changeAvatarA11y', 'Profil rasmini o\'zgartirish')}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <img src={getAvatarSrc()} alt={displayName} className="profile-avatar" />
          <div className="avatar-change-overlay">
            <Camera size={20} color="white" />
          </div>
        </div>
        <input 
          ref={fileInputRef} type="file" accept="image/*" 
          onChange={handleAvatarChange} style={{ display: 'none' }} 
        />
        <h2>{displayName}</h2>
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span>{profileData.email === 'michi@example.com' || userRole === 'guest' ? t('guestEmail', profileData.email || 'michi@example.com') : profileData.email}</span>
          {(profileData.isEmailVerified || profileData.email) && (
            <span style={{ fontSize: '11px', background: 'rgba(48, 209, 88, 0.12)', color: '#30D158', border: '1px solid rgba(48, 209, 88, 0.3)', padding: '3px 9px 3px 6px', borderRadius: '999px', fontWeight: 700, letterSpacing: '0.1px', display: 'inline-flex', alignItems: 'center', gap: '4px', lineHeight: 1.2 }}>
              <BadgeCheck size={13} strokeWidth={2.4} color="#30D158" aria-hidden="true" />
              <span>{t('emailVerifiedBadge', 'メール認証済み')}</span>
            </span>
          )}
        </p>
        <span className="role-tag glass">{getRoleLabel()}</span>
        {profileData.jlptStatus?.level && (
          <span className="role-tag glass animate-scale-up" style={{ border: '1px solid rgba(10, 132, 255, 0.3)', background: 'rgba(10, 132, 255, 0.06)', color: '#0A84FF', display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '6px', fontWeight: 'bold' }}>
            <Award size={12} color="#0A84FF" />
            <span>JLPT {profileData.jlptStatus.level} · {t('jlptSelfDeclared', '自己申告')}</span>
          </span>
        )}
        {completeness && !completeness.complete && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <button
              type="button"
              id="profile-completeness-pill"
              onClick={() => handleOpenSubPage('personalInfo')}
              aria-label={`${t('profileCompletenessLabel', 'Profil to\'ldirilgan')}: ${completeness.percent}%`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px 5px 6px', borderRadius: '999px', border: '1px solid rgba(10, 132, 255, 0.3)', background: 'rgba(10, 132, 255, 0.06)', color: '#0A84FF', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
                <circle cx="11" cy="11" r="9" fill="none" stroke="rgba(10, 132, 255, 0.18)" strokeWidth="3" />
                <circle cx="11" cy="11" r="9" fill="none" stroke="#0A84FF" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(completeness.percent / 100) * 56.55} 56.55`} transform="rotate(-90 11 11)" />
              </svg>
              <span>{t('profileCompletenessLabel', 'Profil to\'ldirilgan')} {completeness.percent}%</span>
              <ChevronRight size={14} color="#0A84FF" />
            </button>
          </div>
        )}
      </div>

      <div className="profile-menu">
        {/* Guest Register Banner */}
        {userRole === 'guest' && (
          <div className="guest-register-banner glass squircle" style={{
            padding: '20px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(90, 85, 234, 0.15))',
            border: '1px solid rgba(10, 132, 255, 0.3)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>
              {t('guestRegisterBannerTitle')}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {t('guestRegisterBannerDesc')}
            </p>
            <button 
              className="btn-primary squircle guest-register-trigger-btn"
              style={{
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 'bold',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(90, 85, 234, 0.3)',
                width: 'auto',
                minWidth: '160px'
              }}
              onClick={onTriggerRegister}
            >
              {t('registerTitle')}
            </button>
          </div>
        )}

        {/* v1.1 F: tezkor tugmalar (faqat haydovchi) */}
        {userRole === 'driver' && (
          <ProfileQuickActions
            t={t}
            showProfileBadges={showProfileBadges}
            totalOwnApplications={totalOwnApplications}
            totalSavedCount={totalSavedCount}
            referralsCount={referralsCount}
            onOpen={handleOpenSubPage}
            setProfileActivePageSource={setProfileActivePageSource}
          />
        )}

        {/* Resume Card - Glassmorphism Sub-Group Cards */}
        {(userRole === 'driver' || userRole === 'guest') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginBottom: '4px' }}>
            {/* Main Header with Action CTA */}
            <div className="glass squircle" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderRadius: '18px', background: 'var(--card-bg)', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <FileText size={20} color="#0A84FF" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-main)' }}>{t('myResume')}</h3>
              </div>
              <button 
                type="button"
                className="profile-btn-interactive"
                style={{
                  background: 'linear-gradient(135deg, rgba(48, 209, 88, 0.15) 0%, rgba(0, 132, 255, 0.15) 100%)',
                  border: '1px solid rgba(48, 209, 88, 0.35)',
                  color: 'var(--text-main)',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(48, 209, 88, 0.12)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }}
                onClick={() => handleOpenSubPage('resume_builder')}
                title={i18n.language === 'ja' ? '日本標準履歴書PDFを作成・編集' : i18n.language === 'en' ? 'Create / Edit Resume PDF' : 'Yapon Rezyumesi (PDF) Yaratish / Tahrirlash'}
              >
                <FileText size={13} strokeWidth={2.5} color="#30D158" />
                <span style={{ letterSpacing: '-0.2px' }}>{t('createResume')}</span>
              </button>
            </div>

            {/* SUBCARD 1: Basic Info */}
            <div className="profile-subcard glass squircle">
              <div className="profile-subcard-header">
                <div className="profile-subcard-icon-wrap">
                  <User size={18} />
                </div>
                <span className="profile-subcard-title">{t('basicInfoTitle', '基本情報')}</span>
              </div>
              <div className="resume-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="resume-field">
                  <span className="field-label">{t('birthDateLabel')}</span>
                  <span className="field-value">{profileData.birthDate || t('notProvided')}</span>
                </div>
                <div className="resume-field">
                  <span className="field-label">{t('birthPlaceLabel')}</span>
                  <span className="field-value">{profileData.birthPlace || t('notProvided')}</span>
                </div>
                <div className="resume-field">
                  <span className="field-label">{t('nationalityLabel')}</span>
                  <span className="field-value">{profileData.nationality || t('notProvided')}</span>
                </div>
              </div>
            </div>

            {/* SUBCARD 2: Living Address History */}
            <div className="profile-subcard glass squircle">
              <div className="profile-subcard-header">
                <div className="profile-subcard-icon-wrap" style={{ background: 'rgba(255, 149, 0, 0.12)', color: '#FF9500' }}>
                  <MapPin size={18} />
                </div>
                <span className="profile-subcard-title">{t('livingAddressTitle')}</span>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {profileData.addressHistory && profileData.addressHistory.length > 0 ? (
                  profileData.addressHistory.map((a, i) => (
                    <div key={i} className="glass squircle" style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderRadius: '14px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{a.address}</span>
                      {a.isCurrent && (
                        <span style={{ fontSize: '11px', background: 'rgba(10, 132, 255, 0.12)', color: '#0A84FF', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                          {t('currentAddressLabel')}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '13px', color: '#8E8E93' }}>{profileData.address || t('notProvided')}</span>
                )}
              </div>
            </div>

            {/* SUBCARD 3: Education History */}
            <div className="profile-subcard glass squircle">
              <div className="profile-subcard-header">
                <div className="profile-subcard-icon-wrap" style={{ background: 'rgba(175, 82, 222, 0.12)', color: '#AF52DE' }}>
                  <GraduationCap size={18} />
                </div>
                <span className="profile-subcard-title">{t('educationTitle')}</span>
              </div>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {profileData.educationHistory && profileData.educationHistory.length > 0 ? (
                  profileData.educationHistory.map((edu, i) => (
                    <div key={i} className="glass squircle" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', borderRadius: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>{edu.school}</strong>
                        {edu.isCurrent && (
                          <span style={{ fontSize: '11px', background: 'rgba(52, 199, 89, 0.12)', color: '#34C759', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                            {t('currentlyStudyingLabel')}
                          </span>
                        )}
                      </div>
                      {edu.major && <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{edu.major}</span>}
                      <span style={{ fontSize: '12px', color: '#8E8E93', marginTop: '2px' }}>
                        📅 {edu.startDate || '?'} ~ {edu.isCurrent ? t('currentlyStudyingLabel') : edu.endDate || '?'}
                      </span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontSize: '13px', color: '#8E8E93', whiteSpace: 'pre-wrap' }}>{profileData.education || t('notProvided')}</span>
                )}
              </div>
            </div>

            {/* SUBCARD 4: Driver's Licenses */}
            <div className="profile-subcard glass squircle">
              <div className="profile-subcard-header">
                <div className="profile-subcard-icon-wrap" style={{ background: 'rgba(52, 199, 89, 0.12)', color: '#34C759' }}>
                  <Award size={18} />
                </div>
                <span className="profile-subcard-title">{t('driverLicensesLabel')}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profileData.driverLicenses && profileData.driverLicenses.length > 0 ? 
                  profileData.driverLicenses.map(l => (
                    <span key={l} style={{ background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF', border: '1px solid rgba(10, 132, 255, 0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={13} color="#0A84FF" /> {t(`lic_${l}`)}
                    </span>
                  )) : 
                  <span style={{ fontSize: '13px', color: '#8E8E93' }}>{t('notProvided')}</span>
                }
              </div>
            </div>

            {/* SUBCARD 5: Special Qualifications & Certificates */}
            <div className="profile-subcard glass squircle">
              <div className="profile-subcard-header">
                <div className="profile-subcard-icon-wrap" style={{ background: 'rgba(255, 45, 85, 0.12)', color: '#FF2D55' }}>
                  <FileCheck size={18} />
                </div>
                <span className="profile-subcard-title">{t('techCertsLabel')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profileData.techCertificates && profileData.techCertificates.length > 0 ? 
                    profileData.techCertificates.map(tc => (
                      <span key={tc} style={{ background: 'rgba(255, 149, 0, 0.1)', color: '#FF9500', border: '1px solid rgba(255, 149, 0, 0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <Sparkles size={13} color="#FF9500" /> {t(`tech_${tc}`)}
                      </span>
                    )) : 
                    <span style={{ fontSize: '13px', color: '#8E8E93' }}>{t('notProvided')}</span>
                  }
                </div>

                {/* JLPT level — self-declared by the driver (自己申告), not verified by the platform */}
                {profileData.jlptStatus?.level && (
                  <div className="glass squircle animate-scale-up" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(10, 132, 255, 0.06)', border: '1px solid rgba(10, 132, 255, 0.25)', borderRadius: '14px', marginTop: '4px' }}>
                    <Award size={20} color="#0A84FF" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>JLPT {profileData.jlptStatus.level} · {t('jlptSelfDeclared', '自己申告')}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('jlptSelfDeclaredNote', '証明書は面接時に確認されます')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SUBCARD 6: Work Experience */}
            {profileData.workHistory && profileData.workHistory.length > 0 && (
              <div className="profile-subcard glass squircle">
                <div className="profile-subcard-header">
                  <div className="profile-subcard-icon-wrap" style={{ background: 'rgba(10, 132, 255, 0.12)', color: '#0A84FF' }}>
                    <Briefcase size={18} />
                  </div>
                  <span className="profile-subcard-title">{t('workExperience')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {profileData.workHistory.map((w, i) => (
                    <div key={i} className="glass squircle" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', width: '100%', display: 'flex', flexDirection: 'column', gap: '3px', borderRadius: '14px' }}>
                      <strong style={{ fontSize: '14.5px', color: 'var(--text-main)' }}>{w.company}</strong>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{w.position}</span>
                      <span style={{ fontSize: '11.5px', color: '#8E8E93' }}>{w.startDate} - {w.isCurrent ? t('currentPosition') : w.endDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mening Mashinam (My Vehicle) Card */}
        {(userRole === 'driver' || userRole === 'guest') && (
          <VehicleCard {...ctx} />
        )}

        {/* Company Profile Card */}

        {/* Company Profile Card */}
        {userRole === 'company' && (
          <div className="menu-group glass squircle resume-card">
            <div className="resume-header">
              <Building2 size={20} color="#AF52DE" />
              <h3>{t('companyInfo')}</h3>
            </div>
            <div className="resume-body">
              <div className="resume-field">
                <span className="field-label">{t('companyTypeLabel')}</span>
                <span className="field-value badge-blue">
                  {profileData.companyType === 'logistics' ? t('typeLogistics') :
                   profileData.companyType === 'driving_school' ? t('typeDrivingSchool') :
                   profileData.companyType === 'taxi_company' ? t('typeTaxiCompany') :
                   profileData.companyType === 'bus_company' ? t('typeBusCompany') :
                   profileData.companyType === 'special_machinery' ? t('typeSpecialMachinery') :
                   profileData.companyType === 'other' ? t('typeOther') :
                   (profileData.companyType || t('notProvided'))}
                </span>
              </div>
              {profileData.companyAddress && (
                <div className="resume-field icon-row">
                  <MapPin size={14} color="#8E8E93" />
                  <span className="field-value">{profileData.companyAddress}</span>
                </div>
              )}
              {profileData.contactPerson && (
                <div className="resume-field icon-row">
                  <User size={14} color="#8E8E93" />
                  <span className="field-value">{profileData.contactPerson}</span>
                </div>
              )}
              {profileData.companyPhone && (
                <div className="resume-field icon-row">
                  <Phone size={14} color="#8E8E93" />
                  <span className="field-value">{profileData.companyPhone}</span>
                </div>
              )}
              {profileData.corporateNumber && (
                <div className="resume-field icon-row">
                  <span style={{ fontSize: '14px', marginRight: '4px' }}>🔢</span>
                  <span className="field-value">{t('corporateNumberLabel')}: {profileData.corporateNumber}</span>
                </div>
              )}
              {profileData.website && (
                <div className="resume-field icon-row">
                  <span style={{ fontSize: '14px', marginRight: '4px' }}>🌐</span>
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="field-value" style={{ color: '#0A84FF', textDecoration: 'none' }}>{profileData.website}</a>
                </div>
              )}
              {profileData.establishedYear && (
                <div className="resume-field icon-row">
                  <span style={{ fontSize: '14px', marginRight: '4px' }}>📅</span>
                  <span className="field-value">{t('establishedYearLabel')}: {profileData.establishedYear}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contract */}
        {userRole === 'company' && (
          <div className="menu-group glass squircle partner-card">
            <div className="partner-header">
              <h3>{t('partnerContract')}</h3>
              <p className="partner-desc">
                {t('contractMainDesc')} <VerifiedBadge size={16} />
              </p>
            </div>
            <div className="contract-status-row">
              <span>{t('contractStatus')}</span>
              <span className={`status-badge ${contractStatus === 'active' ? 'active' : contractStatus === 'pending' ? 'pending' : 'inactive'}`} style={{ color: contractStatus === 'pending' ? '#FF9500' : '' }}>
                {contractStatus === 'active' ? (
                  <><CheckCircle2 size={14} /> {t('contractSigned')}</>
                ) : contractStatus === 'pending' ? (
                  <>⏳ {t('contractPending')}</>
                ) : (
                  t('contractInactive')
                )}
              </span>
            </div>
            {contractStatus === 'none' && (
              <button 
                className="contract-btn squircle"
                onClick={() => setContractStatus('pending')}
              >
                {t('signContract')}
              </button>
            )}
            {contractStatus === 'pending' && (
              <button 
                className="contract-btn squircle"
                disabled
                style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(255, 149, 0, 0.2)', color: '#FF9500', border: '1px solid rgba(255, 149, 0, 0.4)' }}
              >
                {t('contractAwaitingApproval')}
              </button>
            )}
          </div>
        )}

        {/* Menu Items */}
        <div className="menu-group glass squircle">
          <div className="menu-item" {...pressable(() => handleOpenSubPage('personalInfo'))}>
            <div className="menu-icon"><User size={20} /></div>
            <span>{userRole === 'company' ? t('companyInfoTitle') : t('personalData')}</span>
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
          <div className="menu-divider"></div>
          <div className="menu-item" {...pressable(() => {
            if (setProfileActivePageSource) setProfileActivePageSource('profile');
            handleOpenSubPage('applications');
          })}>
            <div className="menu-icon"><Briefcase size={20} /></div>
            <span>{userRole === 'company' ? t('incomingApps') : t('myApplications')}</span>
            {showProfileBadges && totalOwnApplications > 0 && (
              <span className="menu-badge">
                {totalOwnApplications}
              </span>
            )}
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
          {(userRole === 'driver' || userRole === 'guest') && (
            <>
              <div className="menu-divider"></div>
              <div className="menu-item" {...pressable(() => handleOpenSubPage('saved_items'))}>
                <div className="menu-icon"><Bookmark size={20} /></div>
                <span>{t('savedItemsTitle')}</span>
                {showProfileBadges && totalSavedCount > 0 && (
                  <span className="menu-badge">
                    {totalSavedCount}
                  </span>
                )}
                <ChevronRight size={20} color="#8E8E93" className="chevron" />
              </div>
              <div className="menu-divider"></div>
              <div className="menu-item" {...pressable(() => handleOpenSubPage('resume_builder'))}>
                <div className="menu-icon"><FileText size={20} color="#30D158" /></div>
                <span>{t('createResume')}</span>
                <ChevronRight size={20} color="#8E8E93" className="chevron" />
              </div>
            </>
          )}
          <div className="menu-divider"></div>
          <div className="menu-item" {...pressable(() => handleOpenSubPage('my_shoukai'))}>
            <div className="menu-icon"><Share2 size={20} /></div>
            <span>{userRole === 'company' ? t('shoukaiViaApps') : t('myShoukai')}</span>
            {showProfileBadges && referralsCount > 0 && (
              <span className="menu-badge">
                {referralsCount}
              </span>
            )}
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
          {userRole === 'company' && (
            <>
              <div className="menu-divider"></div>
              <div className="menu-item" {...pressable(() => {
                if (setProfileActivePageSource) setProfileActivePageSource('profile');
                handleOpenSubPage('my_ads');
              })}>
                <div className="menu-icon"><Megaphone size={20} /></div>
                <span>{t('myAdsMenu')}</span>
                <ChevronRight size={20} color="#8E8E93" className="chevron" />
              </div>
              <div className="menu-divider"></div>
              <div className="menu-item" {...pressable(() => handleOpenSubPage('employees'))}>
                <div className="menu-icon"><Users size={20} /></div>
                <span>{t('employeesHR')}</span>
                {showProfileBadges && employeesCount > 0 && (
                  <span className="menu-badge">
                    {employeesCount}
                  </span>
                )}
                <ChevronRight size={20} color="#8E8E93" className="chevron" />
              </div>
            </>
          )}
        </div>

        <div className="menu-group glass squircle">
          <div className="menu-item" {...pressable(() => handleOpenSubPage('notifications'))}>
            <div className="menu-icon"><Bell size={20} /></div>
            <span>{t('notifications')}</span>
            {showProfileBadges && unreadCount > 0 && (
              <span className="menu-badge notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
          <div className="menu-divider"></div>
          <div className="menu-item" {...pressable(() => handleOpenSubPage('settings'))}>
            <div className="menu-icon"><Settings size={20} /></div>
            <span>{t('settings')}</span>
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
          <div className="menu-divider"></div>
          <div className="menu-item" {...pressable(() => handleOpenSubPage('about'))}>
            <div className="menu-icon"><Info size={20} /></div>
            <span>{t('aboutApp')}</span>
            <ChevronRight size={20} color="#8E8E93" className="chevron" />
          </div>
        </div>

        <button className="logout-btn glass" onClick={onLogout} style={{ marginTop: '12px' }}>
          <LogOut size={20} />
          <span>{t('logout')}</span>
        </button>
      </div>

      {/* 86px clearance spacer yielding custom clearance for Profile tab */}
      <div style={{ height: '86px', minHeight: '86px', width: '100%', flexShrink: 0, clear: 'both' }} />

      {/* Universal Japanese Vehicle Fleet Picker Modal */}
      <JapaneseVehiclePickerModal
        isOpen={isVehiclePickerOpen}
        onClose={() => setIsVehiclePickerOpen(false)}
        selectedVehicleId={editVehicleData?.catalogId}
        onSelectVehicle={(veh) => {
          // v1.1: faqat tahrirlash formasini to'ldiradi. Avval katalog ID'si foydalanuvchi mashinasi
          // ID'si o'rniga yozilib, darhol saqlanardi: dublikat paydo bo'lar, raqam/rang boshqa mashinadan
          // ko'char va 「キャンセル」 hech narsani bekor qilmasdi. Endi saqlash faqat 「保存」 orqali.
          const resolvedPhoto = veh.photoUrl || veh._resolvedPhoto || null;
          setEditVehicleData(prev => applyCatalogSelection(prev, veh, resolvedPhoto));
        }}
      />

      {/* Mashinani o'chirish — ilova ichidagi tasdiq oynasi */}
      <ConfirmSheet
        open={Boolean(vehicleDeleteTarget)}
        id="vehicle-delete-sheet"
        title={t('vehicleDeleteTitle', {
          name: `${vehicleDeleteTarget?.make || ''} ${vehicleDeleteTarget?.model || ''}`.trim(),
          defaultValue: '{{name}}を削除しますか？',
        })}
        message={t('deleteAdIrreversible', 'この操作は取り消せません。')}
        confirmLabel={t('delete', '削除')}
        cancelLabel={t('cancel', 'キャンセル')}
        onConfirm={confirmDeleteVehicle}
        onCancel={() => setVehicleDeleteTarget(null)}
      />

      {/* Barcha mashinalarni o'chirish */}
      <ConfirmSheet
        open={vehicleClearConfirm}
        id="vehicle-clear-sheet"
        title={t('vehicleClearAllTitle', '自家用車をすべて削除しますか？')}
        message={t('vehicleClearAllMsg', '自家用車情報をすべて削除し、「自家用車なし」に設定します。')}
        confirmLabel={t('delete', '削除')}
        cancelLabel={t('cancel', 'キャンセル')}
        onConfirm={() => { setVehicleClearConfirm(false); handleClearAllVehicles(); }}
        onCancel={() => setVehicleClearConfirm(false)}
      />

      {/* Xabar (alert() o'rniga): validatsiya, rasm, xotira xatolari */}
      <ConfirmSheet
        open={Boolean(vehicleNotice)}
        id="vehicle-notice-sheet"
        title={vehicleNotice ? t(vehicleNotice) : ''}
        confirmLabel={t('closeBtn', '閉じる')}
        danger={false}
        hideCancel
        onConfirm={() => setVehicleNotice(null)}
        onCancel={() => setVehicleNotice(null)}
      />
    </div>
  );
}
