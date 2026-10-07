// v1.1 Faza E: Profile.jsx dagi `activePage === 'personalInfo'` sahifasi o'zgarishsiz ko'chirildi.
// Holat va funksiyalar Profile'dan `ctx` orqali keladi (klasslar, stil va DOM bir xil).
import {
  User, CheckCircle2, Briefcase, Building2, MapPin, Edit3, X, ArrowLeft, Plus, Sparkles, FileCheck, Award, GraduationCap
} from 'lucide-react';

export default function PersonalInfoPage(ctx) {
  const { addEditAddressEntry, addEditEducationEntry, editData, handleBackToMain, handleOpenSubPage, isEditing, profileData, removeEditAddressEntry, removeEditEducationEntry, saveEditing, setEditData, setIsEditing, startEditing, t, updateEditAddressEntry, updateEditEducationEntry, userRole } = ctx;
  return (
    <div className="profile-container sub-page-view fade-in">
      <div className="profile-sticky-back">
        <button className="icon-btn glass" onClick={handleBackToMain}>
          <ArrowLeft size={20} />
        </button>
      </div>
      <div className="sub-page-header" style={{ paddingTop: '61px', paddingBottom: '5px' }}>
        <div className="sub-header-row">
          <h2>{userRole === 'company' ? t('companyInfoTitle') : t('personalData')}</h2>
          <span style={{ color: '#0A84FF', fontSize: '14px', fontWeight: 'bold', marginLeft: '10px' }}>ID: {profileData.userId}</span>
          {userRole === 'company' ? (
            isEditing ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="edit-btn save-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={saveEditing}>
                  <CheckCircle2 size={16} /> {t('saveChanges')}
                </button>
                <button className="edit-btn cancel-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30' }} onClick={() => setIsEditing(false)}>
                  <X size={16} /> {t('cancelEdit')}
                </button>
              </div>
            ) : (
              <button className="edit-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={startEditing}>
                <Edit3 size={16} /> {t('editInfo')}
              </button>
            )
          ) : (
            <button className="edit-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => handleOpenSubPage('resume_builder')}>
              <Edit3 size={16} /> {t('editInfo')}
            </button>
          )}
        </div>
      </div>
      <div className="profile-menu" style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* CARD 1: Basic Information */}
        <div className="profile-subcard glass squircle">
          <div className="profile-subcard-header">
            <div className="profile-subcard-icon-wrap">
              <User size={18} />
            </div>
            <span className="profile-subcard-title">{t('basicInfoTitle', '基本情報')}</span>
          </div>
          <div className="resume-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Name */}
            <div className="resume-field">
              <span className="field-label">{t('namePlaceholder').replace(' ✱', '')}</span>
              {isEditing ? (
                <input className="edit-input" value={editData.fullName || ''} onChange={(e) => setEditData({...editData, fullName: e.target.value})} maxLength={50} />
              ) : (
                <span className="field-value" style={{ fontWeight: '600', color: 'var(--text-main)' }}>{profileData.fullName}</span>
              )}
            </div>
            {/* Email */}
            <div className="resume-field">
              <span className="field-label">Email</span>
              {isEditing ? (
                <input className="edit-input" value={editData.email || ''} onChange={(e) => setEditData({...editData, email: e.target.value})} maxLength={80} />
              ) : (
                <span className="field-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {profileData.email}
                  {(profileData.isEmailVerified || profileData.email) && (
                    <span style={{ fontSize: '11px', color: '#30D158', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} color="#30D158" />
                      <span>Tasdiqlangan</span>
                    </span>
                  )}
                </span>
              )}
            </div>
            {/* Company basic fields */}
            {userRole === 'company' && (
              <>
                <div className="resume-field">
                  <span className="field-label">{t('companyTypeLabel', '事業種別')}</span>
                  {isEditing ? (
                    <select 
                      className="edit-input" 
                      value={editData.companyType || 'logistics'}
                      onChange={(e) => setEditData({...editData, companyType: e.target.value})}
                    >
                      <option value="logistics">{t('typeLogistics')}</option>
                      <option value="driving_school">{t('typeDrivingSchool')}</option>
                      <option value="taxi_company">{t('typeTaxiCompany')}</option>
                      <option value="bus_company">{t('typeBusCompany')}</option>
                      <option value="special_machinery">{t('typeSpecialMachinery')}</option>
                      <option value="other">{t('typeOther')}</option>
                    </select>
                  ) : (
                    <span className="field-value badge-blue">
                      {profileData.companyType === 'logistics' ? t('typeLogistics') :
                       profileData.companyType === 'driving_school' ? t('typeDrivingSchool') :
                       profileData.companyType === 'taxi_company' ? t('typeTaxiCompany') :
                       profileData.companyType === 'bus_company' ? t('typeBusCompany') :
                       profileData.companyType === 'special_machinery' ? t('typeSpecialMachinery') :
                       profileData.companyType === 'other' ? t('typeOther') :
                       (profileData.companyType || t('notProvided'))}
                    </span>
                  )}
                </div>
                <div className="resume-field">
                  <span className="field-label">{t('contactPersonPlaceholder', '担当者名')}</span>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="edit-input" 
                      value={editData.contactPerson || ''} 
                      onChange={(e) => setEditData({...editData, contactPerson: e.target.value})} 
                      maxLength={50} 
                    />
                  ) : (
                    <span className="field-value">{profileData.contactPerson || t('notProvided')}</span>
                  )}
                </div>
                <div className="resume-field">
                  <span className="field-label">{t('companyPhonePlaceholder', '電話番号')}</span>
                  {isEditing ? (
                    <input 
                      type="tel" 
                      className="edit-input" 
                      value={editData.companyPhone || ''} 
                      onChange={(e) => setEditData({...editData, companyPhone: e.target.value})} 
                      maxLength={20} 
                    />
                  ) : (
                    <span className="field-value">{profileData.companyPhone || t('notProvided')}</span>
                  )}
                </div>
              </>
            )}
            {/* Driver fields */}
            {(userRole === 'driver' || userRole === 'guest') && (
              <>
                <div className="resume-field">
                  <span className="field-label">{t('birthDateLabel')}</span>
                  {isEditing ? (
                    <input type="date" className="edit-input" value={editData.birthDate || ''} onChange={(e) => setEditData({...editData, birthDate: e.target.value})} />
                  ) : (
                    <span className="field-value">{profileData.birthDate || t('notProvided')}</span>
                  )}
                </div>
                <div className="resume-field">
                  <span className="field-label">{t('birthPlaceLabel')}</span>
                  {isEditing ? (
                    <input type="text" className="edit-input" value={editData.birthPlace || ''} onChange={(e) => setEditData({...editData, birthPlace: e.target.value})} />
                  ) : (
                    <span className="field-value">{profileData.birthPlace || t('notProvided')}</span>
                  )}
                </div>
                <div className="resume-field">
                  <span className="field-label">{t('nationalityLabel')}</span>
                  {isEditing ? (
                    <input type="text" className="edit-input" value={editData.nationality || ''} onChange={(e) => setEditData({...editData, nationality: e.target.value})} />
                  ) : (
                    <span className="field-value">{profileData.nationality || t('notProvided')}</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {(userRole === 'driver' || userRole === 'guest') && (
          <>
            {/* CARD 2: Living Address History */}
            <div className="profile-subcard glass squircle">
              <div className="profile-subcard-header">
                <div className="profile-subcard-icon-wrap" style={{ background: 'rgba(255, 149, 0, 0.12)', color: '#FF9500' }}>
                  <MapPin size={18} />
                </div>
                <span className="profile-subcard-title">{t('livingAddressTitle')}</span>
              </div>
              <div className="resume-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                {isEditing ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(editData.addressHistory || []).map((entry, index) => (
                      <div key={index} className="work-entry glass squircle" style={{ padding: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '13px' }}>#{index + 1}</span>
                          <button 
                            type="button" 
                            className="remove-work-btn"
                            style={{ background: 'rgba(255, 59, 48, 0.08)', border: 'none', color: '#FF3B30', cursor: 'pointer', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => removeEditAddressEntry(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder={t('livingAddressPlaceholder')}
                            className="edit-input"
                            style={{ width: '100%' }}
                            value={entry.address}
                            onChange={(e) => updateEditAddressEntry(index, 'address', e.target.value)}
                            maxLength={120}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <input 
                              type="checkbox" 
                              id={`edit-addr-current-${index}`} 
                              checked={entry.isCurrent || false}
                              onChange={(e) => updateEditAddressEntry(index, 'isCurrent', e.target.checked)}
                              style={{ cursor: 'pointer' }}
                            />
                            <label htmlFor={`edit-addr-current-${index}`} style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>{t('currentAddressLabel')}</label>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(editData.addressHistory || []).length < 3 && (
                      <button type="button" className="add-work-btn" style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'rgba(10, 132, 255, 0.08)', border: '1px dashed rgba(10, 132, 255, 0.3)', color: '#0A84FF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={addEditAddressEntry}>
                        <Plus size={15} /> {t('addAddressBtn')}
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                      <span className="field-value">{profileData.address || t('notProvided')}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CARD 3: Education History */}
            <div className="profile-subcard glass squircle">
              <div className="profile-subcard-header">
                <div className="profile-subcard-icon-wrap" style={{ background: 'rgba(175, 82, 222, 0.12)', color: '#AF52DE' }}>
                  <GraduationCap size={18} />
                </div>
                <span className="profile-subcard-title">{t('educationTitle')}</span>
              </div>
              <div className="resume-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
                {isEditing ? (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(editData.educationHistory || []).map((entry, index) => (
                      <div key={index} className="work-entry glass squircle" style={{ padding: '12px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '13px' }}>#{index + 1}</span>
                          <button 
                            type="button" 
                            className="remove-work-btn"
                            style={{ background: 'rgba(255, 59, 48, 0.08)', border: 'none', color: '#FF3B30', cursor: 'pointer', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => removeEditEducationEntry(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder={t('educationSchoolPlaceholder')}
                            className="edit-input"
                            style={{ width: '100%' }}
                            value={entry.school}
                            onChange={(e) => updateEditEducationEntry(index, 'school', e.target.value)}
                            maxLength={100}
                          />
                          <input
                            type="text"
                            placeholder={t('educationMajorPlaceholder')}
                            className="edit-input"
                            style={{ width: '100%' }}
                            value={entry.major}
                            onChange={(e) => updateEditEducationEntry(index, 'major', e.target.value)}
                            maxLength={100}
                          />
                          <div className="work-dates-row" style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>{t('startDateLabel')}</label>
                              <input
                                type="month"
                                className="edit-input"
                                style={{ width: '100%' }}
                                value={entry.startDate || ''}
                                onChange={(e) => updateEditEducationEntry(index, 'startDate', e.target.value)}
                              />
                            </div>
                            <div style={{ flex: 1, opacity: entry.isCurrent ? 0.5 : 1 }}>
                              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>{t('endDateLabel')}</label>
                              <input
                                type="month"
                                className="edit-input"
                                style={{ width: '100%' }}
                                value={entry.endDate || ''}
                                onChange={(e) => updateEditEducationEntry(index, 'endDate', e.target.value)}
                                disabled={entry.isCurrent}
                              />
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <input 
                              type="checkbox" 
                              id={`edit-edu-current-${index}`} 
                              checked={entry.isCurrent || false}
                              onChange={(e) => updateEditEducationEntry(index, 'isCurrent', e.target.checked)}
                              style={{ cursor: 'pointer' }}
                            />
                            <label htmlFor={`edit-edu-current-${index}`} style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>{t('currentlyStudyingLabel')}</label>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(editData.educationHistory || []).length < 3 && (
                      <button type="button" className="add-work-btn" style={{ width: '100%', padding: '10px', borderRadius: '12px', background: 'rgba(10, 132, 255, 0.08)', border: '1px dashed rgba(10, 132, 255, 0.3)', color: '#0A84FF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={addEditEducationEntry}>
                        <Plus size={15} /> {t('addEducationBtn')}
                      </button>
                    )}
                  </div>
                ) : (
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
                      <span className="field-value" style={{ whiteSpace: 'pre-wrap' }}>{profileData.education || t('notProvided')}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CARD 4: Driver's Licenses */}
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

            {/* CARD 5: Special Qualifications & Languages */}
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

            {/* CARD 6: Work Experience (if available) */}
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
          </>
        )}
            {/* CARD 2: Company Details & Registration */}
            {userRole === 'company' && (
              <div className="profile-subcard glass squircle">
                <div className="profile-subcard-header">
                  <div className="profile-subcard-icon-wrap" style={{ background: 'rgba(10, 132, 255, 0.12)', color: '#0A84FF' }}>
                    <Building2 size={18} />
                  </div>
                  <span className="profile-subcard-title">{t('companyDetailsTitle', '企業詳細・登録情報')}</span>
                </div>
                <div className="resume-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="resume-field">
                    <span className="field-label">{t('companyAddressPlaceholder', '住所（都道府県、市区町村）')}</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="edit-input" 
                        value={editData.companyAddress || ''} 
                        onChange={(e) => setEditData({...editData, companyAddress: e.target.value})} 
                        maxLength={120} 
                      />
                    ) : (
                      <span className="field-value">{profileData.companyAddress || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('corporateNumberLabel', '法人番号')}</span>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="edit-input" 
                        value={editData.corporateNumber || ''} 
                        onChange={(e) => setEditData({...editData, corporateNumber: e.target.value})} 
                        maxLength={13} 
                      />
                    ) : (
                      <span className="field-value">{profileData.corporateNumber || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('websitePlaceholder', '企業のウェブサイト')}</span>
                    {isEditing ? (
                      <input 
                        type="url" 
                        className="edit-input" 
                        value={editData.website || ''} 
                        onChange={(e) => setEditData({...editData, website: e.target.value})} 
                        maxLength={100} 
                      />
                    ) : (
                      <span className="field-value">
                        {profileData.website ? (
                          <a href={profileData.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0A84FF', textDecoration: 'none' }}>{profileData.website}</a>
                        ) : t('notProvided')}
                      </span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('establishedYearLabel', '設立年')}</span>
                    {isEditing ? (
                      <input 
                        type="number" 
                        className="edit-input" 
                        value={editData.establishedYear || ''} 
                        onChange={(e) => setEditData({...editData, establishedYear: e.target.value})} 
                        maxLength={4} 
                      />
                    ) : (
                      <span className="field-value">{profileData.establishedYear || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field">
                    <span className="field-label">{t('employeeCountPlaceholder', '従業員数')}</span>
                    {isEditing ? (
                      <input 
                        type="number" 
                        className="edit-input" 
                        value={editData.employeeCount || ''} 
                        onChange={(e) => setEditData({...editData, employeeCount: e.target.value})} 
                      />
                    ) : (
                      <span className="field-value">{profileData.employeeCount || t('notProvided')}</span>
                    )}
                  </div>
                  <div className="resume-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <span className="field-label">{t('companyDescPlaceholder', '会社概要')}</span>
                    {isEditing ? (
                      <textarea 
                        className="edit-input" 
                        style={{ width: '100%', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                        value={editData.companyDesc || ''} 
                        onChange={(e) => setEditData({...editData, companyDesc: e.target.value})} 
                        maxLength={300} 
                      />
                    ) : (
                      <span className="field-value" style={{ whiteSpace: 'pre-wrap', width: '100%' }}>{profileData.companyDesc || t('notProvided')}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
      </div>
      {/* 82px clearance spacer for Company Info page */}
      <div style={{ height: '82px', minHeight: '82px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
