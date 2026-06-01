import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Edit3, X, Image as ImageIcon, Camera, ArrowLeft, Upload, Clock, Banknote } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
import { compressImage } from '../utils/imageCompressor';
import './DriverFeed.css';

const INITIAL_COMPANY_JOBS = [
  {
    id: 1, company: "Sagawa Express", title: "Mahalliy yetkazib berish (Local Delivery)", salary: "¥300,000 / oyiga",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800", verified: true,
    location: "Tokyo, Koto-ku", logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100"
  },
  {
    id: 2, company: "Sagawa Express", title: "Xalqaro yuk tashish (Trailer)", salary: "¥500,000 / oyiga",
    image: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800", verified: true,
    location: "Kanagawa, Yokohama", logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100"
  },
  {
    id: 3, company: "Sagawa Express", title: "Tungi reys haydovchisi (10t)", salary: "¥450,000 / oyiga",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800", verified: true,
    location: "Saitama, Omiya", logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100"
  },
  {
    id: 4, company: "Sagawa Express", title: "Ekskavator va Maxsus texnika haydovchisi", salary: "¥380,000 / oyiga",
    image: "https://images.unsplash.com/photo-1541888062837-7b247f082e05?auto=format&fit=crop&q=80&w=800", verified: true,
    location: "Chiba, Matsudo", logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100"
  },
  {
    id: 5, company: "Sagawa Express", title: "Omborxona Forklift operatori", salary: "¥250,000 / oyiga",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c28ea?auto=format&fit=crop&q=80&w=800", verified: true,
    location: "Aichi, Nagoya", logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100"
  }
];

export default function CompanyHome({ onJobClick, onSchoolClick, jobs, setJobs, schools, setSchools, profileData }) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [jobImage, setJobImage] = useState(null);
  const fileInputRef = useRef(null);
  
  const isDrivingSchool = profileData?.companyType === 'driving_school';
  
  const [newJob, setNewJob] = useState({
    title: '', 
    salary: '', 
    location: '', 
    fullAddress: '', 
    phone: '', 
    email: '', 
    hours: '', 
    bonus: '', 
    insurance: '', 
    foreigners: '', 
    housing: '', 
    description: '', 
    dayOff: '',
    hasShoukai: '', // Empty initially to force a selection
    shoukaiFee: '', 
    shoukaiConditions: '',
    langs: ['UZ', 'JP'], // Default driving school languages
    courses: ['Oogata', 'Chugata', 'Futsu'] // Default driving school courses
  });

  const companyJobs = (jobs || []).filter(j => j.company === (profileData?.fullName || "Sagawa Express"));
  const companySchools = (schools || []).filter(s => s.name === (profileData?.fullName || "Koyama Driving School"));

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 600, 600, 0.7);
        setJobImage(compressed);
      } catch (err) {
        console.error("Job image compression failed:", err);
        const reader = new FileReader();
        reader.onloadend = () => setJobImage(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  // Toggle selection in array
  const handleToggleCourse = (course) => {
    setNewJob(prev => {
      const exists = prev.courses.includes(course);
      return {
        ...prev,
        courses: exists ? prev.courses.filter(c => c !== course) : [...prev.courses, course]
      };
    });
  };

  const handleToggleLang = (lang) => {
    setNewJob(prev => {
      const exists = prev.langs.includes(lang);
      return {
        ...prev,
        langs: exists ? prev.langs.filter(l => l !== lang) : [...prev.langs, lang]
      };
    });
  };

  const handleAddJob = () => {
    // 1. Mandatory Fields Validation
    if (!newJob.title || !newJob.salary || !newJob.location || !newJob.fullAddress || !newJob.phone || !newJob.email || !newJob.description) {
      alert(t('fillRequired', "Iltimos barcha kerakli (*) joylarni to'ldiring"));
      return;
    }

    // 2. Mandatory Shoukai Option Selection
    if (newJob.hasShoukai === '') {
      alert(t('shoukaiSelectionRequired', "Showkai puli borligi yoki yo'qligini tanlash shart!"));
      return;
    }

    // 3. Shoukai Fee Validation
    if (newJob.hasShoukai === 'yes' && !newJob.shoukaiFee) {
      alert(t('shoukaiAmountRequired', "Iltimos shoukai puli summasini kiriting"));
      return;
    }

    if (isDrivingSchool) {
      const school = {
        id: Date.now(),
        name: profileData?.fullName || "Koyama Driving School",
        type: newJob.title,
        price: newJob.salary,
        discount: newJob.bonus || "¥10,000",
        image: jobImage || "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800",
        verified: true,
        location: newJob.location,
        fullAddress: newJob.fullAddress,
        description: newJob.description,
        courses: newJob.courses,
        phone: newJob.phone,
        email: newJob.email,
        langs: newJob.langs,
        shoukaiFee: newJob.hasShoukai === 'yes' ? Number(newJob.shoukaiFee) : 0,
        shoukaiConditions: newJob.shoukaiConditions || t('defaultSchoolShoukaiConditions', 'O\'qishni boshlagandan so\'ng mukofot to\'lanadi.'),
        shoukai: newJob.hasShoukai === 'yes' ? `¥${Number(newJob.shoukaiFee).toLocaleString()}` : '0'
      };

      setSchools([school, ...schools]);
    } else {
      const job = {
        id: Date.now(),
        company: profileData?.fullName || "Sagawa Express",
        title: newJob.title,
        salary: newJob.salary,
        location: newJob.location,
        fullAddress: newJob.fullAddress,
        phone: newJob.phone,
        email: newJob.email,
        hours: newJob.hours,
        bonus: newJob.bonus,
        insurance: newJob.insurance,
        foreigners: newJob.foreigners,
        housing: newJob.housing,
        description: newJob.description,
        dayOff: newJob.dayOff,
        image: jobImage || "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
        verified: true,
        logo: profileData?.avatar || "https://ui-avatars.com/api/?name=Company&background=0D8ABC&color=fff&size=100",
        hasShoukai: newJob.hasShoukai === 'yes',
        shoukaiFee: newJob.hasShoukai === 'yes' ? Number(newJob.shoukaiFee) : 0,
        shoukaiAmount: newJob.hasShoukai === 'yes' ? `¥${Number(newJob.shoukaiFee).toLocaleString()}` : "0",
        shoukai: newJob.hasShoukai === 'yes' ? `¥${Number(newJob.shoukaiFee).toLocaleString()}` : "0",
        shoukaiConditions: newJob.shoukaiConditions || t('defaultJobShoukaiConditions', 'Tavsiya qilingan nomzod ishga qabul qilinib, kamida 3 oy ishlasa shoukai puli to\'lab beriladi.')
      };

      setJobs([job, ...jobs]);
    }

    setShowAddForm(false);
    setJobImage(null);
    setNewJob({
      title: '', 
      salary: '', 
      location: '', 
      fullAddress: '', 
      phone: '', 
      email: '', 
      hours: '', 
      bonus: '', 
      insurance: '', 
      foreigners: '', 
      housing: '', 
      description: '', 
      dayOff: '',
      hasShoukai: '',
      shoukaiFee: '', 
      shoukaiConditions: '',
      langs: ['UZ', 'JP'],
      courses: ['Oogata', 'Chugata', 'Futsu']
    });
  };

  // ===== ADD NEW JOB FORM (Full Page) =====
  if (showAddForm) {
    return (
      <div className="feed-container fade-in" style={{ paddingTop: '10px', paddingBottom: '100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px 20px 16px' }}>
          <button className="icon-btn glass" onClick={() => { setShowAddForm(false); setJobImage(null); }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ margin: 0, fontSize: '20px' }}>
            {isDrivingSchool ? t('addNewSchoolAd', "Yangi avtomaktab e'loni") : t('addNewJob', "Yangi ish e'loni qo'shish")}
          </h2>
        </div>

        <div style={{ padding: '0 16px' }}>
          {/* Image Upload Section */}
          <div 
            className="glass squircle"
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              height: '180px', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              marginBottom: '20px',
              overflow: 'hidden',
              position: 'relative',
              border: '2px dashed var(--primary)'
            }}
          >
            {jobImage ? (
              <>
                <img src={jobImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '26px' }} />
                <div style={{ 
                  position: 'absolute', bottom: '10px', right: '10px', 
                  background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '6px 12px', 
                  borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  <Camera size={14} /> {t('changePhoto', "Rasmni o'zgartirish")}
                </div>
              </>
            ) : (
              <>
                <Upload size={32} color="var(--primary)" />
                <span style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {t('uploadAdImage', "E'lon rasmini yuklang")}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.7, marginTop: '4px' }}>
                  {t('optionalField', '(Ixtiyoriy)')}
                </span>
              </>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImageChange}
          />

          {/* Form Fields */}
          <div className="glass squircle" style={{ padding: '20px', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--primary)' }}>
              {t('jobBasicInfo', "Asosiy ma'lumotlar")}
            </h4>
            
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {isDrivingSchool ? t('schoolTypeLabel', 'Toifalar / Kategoriya *') : t('jobTitleLabel', 'Sarlavha (Vakansiya) *')}
              </label>
              <input 
                type="text" 
                value={newJob.title} 
                onChange={e => setNewJob({...newJob, title: e.target.value})} 
                placeholder={isDrivingSchool ? t('schoolTypePlaceholder', "Masalan: Katta yuk va maxsus, Barcha toifalar") : t('jobTitlePlaceholder', "Masalan: Mahalliy yetkazib beruvchi")} 
                className="auth-input"
                maxLength={50}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {isDrivingSchool ? t('schoolPriceLabel', 'Boshlang\'ich o\'qish narxi *') : t('salaryLabel', 'Oylik maosh *')}
              </label>
              <input 
                type="text" 
                value={newJob.salary} 
                onChange={e => setNewJob({...newJob, salary: e.target.value})} 
                placeholder={isDrivingSchool ? t('schoolPricePlaceholder', "¥280,000~") : t('salaryPlaceholder', "¥300,000 / oyiga")} 
                className="auth-input"
                maxLength={30}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {isDrivingSchool ? t('schoolDiscountLabel', 'A\'zolar uchun chegirma (Ixtiyoriy)') : t('bonusLabel', 'Bonus puli bormi? (Ixtiyoriy)')}
              </label>
              <input 
                type="text" 
                value={newJob.bonus} 
                onChange={e => setNewJob({...newJob, bonus: e.target.value})} 
                placeholder={isDrivingSchool ? "¥20,000" : t('bonusPlaceholder', "Yiliga 2 marta")} 
                className="auth-input"
                maxLength={50}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {t('locationLabel', 'Qisqa joylashuv (Shahar, tuman) *')}
              </label>
              <input 
                type="text" 
                value={newJob.location} 
                onChange={e => setNewJob({...newJob, location: e.target.value})} 
                placeholder="Saitama, Omiya" 
                className="auth-input"
                maxLength={80}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {t('fullAddressLabel', 'Batafsil pochta manzili *')}
              </label>
              <input 
                type="text" 
                value={newJob.fullAddress} 
                onChange={e => setNewJob({...newJob, fullAddress: e.target.value})} 
                placeholder="〒330-0854 Saitama, Omiya-ku, Sakuragicho 2-1" 
                className="auth-input"
                maxLength={120}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="glass squircle" style={{ padding: '20px', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--primary)' }}>
              {t('contactInfo', "Aloqa ma'lumotlari")}
            </h4>
            
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {t('phoneLabel', 'Aloqa telefon raqami *')}
              </label>
              <input 
                type="text" 
                value={newJob.phone} 
                onChange={e => setNewJob({...newJob, phone: e.target.value})} 
                placeholder="+81 48-555-1234" 
                className="auth-input"
                maxLength={25}
              />
            </div>

            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {t('emailLabel', 'Aloqa emaili *')}
              </label>
              <input 
                type="email" 
                value={newJob.email} 
                onChange={e => setNewJob({...newJob, email: e.target.value})} 
                placeholder="info@saitama-auto.jp" 
                className="auth-input"
                maxLength={50}
              />
            </div>
          </div>

          {/* Conditional Sections */}
          {isDrivingSchool ? (
            /* Driving School Courses & Languages */
            <div className="glass squircle" style={{ padding: '20px', marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--primary)' }}>
                {t('schoolCoursesLanguages', "Kurslar va Dars tillari")}
              </h4>

              {/* License Courses Checkboxes */}
              <div className="input-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                  {t('availableCoursesLabel', 'Mavjud toifalar')}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Oogata', 'Chugata', 'Futsu', 'Tokushu', 'Nirin', 'Forklift'].map(course => {
                    const isSelected = newJob.courses.includes(course);
                    return (
                      <button
                        key={course}
                        type="button"
                        onClick={() => handleToggleCourse(course)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                          background: isSelected ? 'rgba(90, 85, 234, 0.15)' : 'rgba(255,255,255,0.05)',
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {course}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Languages Checkboxes */}
              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                  {t('availableLangsLabel', 'Dars beriladigan tillar')}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['UZ', 'JP', 'EN', 'RU', 'VI', 'ZH'].map(lang => {
                    const isSelected = newJob.langs.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleToggleLang(lang)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                          background: isSelected ? 'rgba(90, 85, 234, 0.15)' : 'rgba(255,255,255,0.05)',
                          color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Regular Job Conditions */
            <div className="glass squircle" style={{ padding: '20px', marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--primary)' }}>
                {t('jobConditionsTitle', 'Ish sharoitlari')}
              </h4>
              
              <div className="input-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                  {t('workHoursLabel', 'Ish vaqti (Ixtiyoriy)')}
                </label>
                <input 
                  type="text" 
                  value={newJob.hours} 
                  onChange={e => setNewJob({...newJob, hours: e.target.value})} 
                  placeholder="08:00 - 17:00" 
                  className="auth-input"
                  maxLength={40}
                />
              </div>
              
              <div className="input-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                  {t('dayOffLabel', 'Dam olish kunlari (Ixtiyoriy)')}
                </label>
                <input 
                  type="text" 
                  value={newJob.dayOff} 
                  onChange={e => setNewJob({...newJob, dayOff: e.target.value})} 
                  placeholder={t('dayOffPlaceholder', "Shanba, Yakshanba")} 
                  className="auth-input"
                  maxLength={40}
                />
              </div>
              
              <div className="input-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                  {t('insuranceLabel', "Sug'urta to'lovlari bormi? (Ixtiyoriy)")}
                </label>
                <input 
                  type="text" 
                  value={newJob.insurance} 
                  onChange={e => setNewJob({...newJob, insurance: e.target.value})} 
                  placeholder={t('insurancePlaceholder', "To'liq ijtimoiy sug'urta")} 
                  className="auth-input"
                  maxLength={50}
                />
              </div>

              <div className="input-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                  {t('foreignersLabel', "Chet elliklarni qabul qilish va Viza yordami (Ixtiyoriy)")}
                </label>
                <input 
                  type="text" 
                  value={newJob.foreigners} 
                  onChange={e => setNewJob({...newJob, foreigners: e.target.value})} 
                  placeholder={t('foreignersPlaceholder', "Viza qo'llab-quvvatlovi bor")} 
                  className="auth-input"
                  maxLength={80}
                />
              </div>
              
              <div className="input-group">
                <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                  {t('housingLabel', "Uy ijarasi uchun qo'shimcha to'lov (Ixtiyoriy)")}
                </label>
                <input 
                  type="text" 
                  value={newJob.housing} 
                  onChange={e => setNewJob({...newJob, housing: e.target.value})} 
                  placeholder={t('housingPlaceholder', "Uy ijarasining 50% to'lanadi")} 
                  className="auth-input"
                  maxLength={80}
                />
              </div>
            </div>
          )}

          {/* Description & Details Block */}
          <div className="glass squircle" style={{ padding: '20px', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--primary)' }}>
              {t('additionalInfo', "Batafsil tavsif")}
            </h4>
            
            <div className="input-group">
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {isDrivingSchool ? t('schoolDescLabel', 'Maktab haqida batafsil ma\'lumot *') : t('jobDescLabel', 'Batafsil tavsif *')}
              </label>
              <textarea 
                value={newJob.description} 
                onChange={e => setNewJob({...newJob, description: e.target.value})} 
                placeholder={isDrivingSchool ? "さいたま市中心部に広大な教習コースを持つ自動車学校。宿泊施設（合宿用）も完備。" : t('jobDescPlaceholder', "Ish haqida ma'lumot...")}
                className="auth-input"
                style={{ minHeight: '100px', resize: 'vertical' }}
                maxLength={300}
              ></textarea>
            </div>
          </div>

          {/* ==========================================
              UNIFIED SHOUKAI (REFERRAL) POSTING SECTION
              ========================================== */}
          <div className="glass squircle" style={{ padding: '20px', marginBottom: '20px', border: '1px solid rgba(255, 159, 10, 0.2)' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', color: '#FF9F0A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Share2 size={18} />
              {t('shoukaiSettings', "Shoukai (Tavsiya) Sozlamalari")}
            </h4>

            {/* Shoukai Choice Selection (Mandatory) */}
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('hasShoukaiPrompt', "Ushbu e'londa do'stlarni taklif qilganlik uchun shoukai mukofot puli beriladimi? *")}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setNewJob({...newJob, hasShoukai: 'yes'})}
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    border: newJob.hasShoukai === 'yes' ? '2px solid #FF9F0A' : '1px solid rgba(255,255,255,0.1)',
                    background: newJob.hasShoukai === 'yes' ? 'rgba(255, 159, 10, 0.15)' : 'rgba(255,255,255,0.03)',
                    color: newJob.hasShoukai === 'yes' ? '#FF9F0A' : 'var(--text-main)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  🎉 {t('yesOption', 'Ha, shoukai puli bor')}
                </button>
                <button
                  type="button"
                  onClick={() => setNewJob({...newJob, hasShoukai: 'no', shoukaiFee: '', shoukaiConditions: ''})}
                  style={{
                    padding: '12px',
                    borderRadius: '14px',
                    border: newJob.hasShoukai === 'no' ? '2px solid var(--text-secondary)' : '1px solid rgba(255,255,255,0.1)',
                    background: newJob.hasShoukai === 'no' ? 'rgba(142, 142, 147, 0.15)' : 'rgba(255,255,255,0.03)',
                    color: newJob.hasShoukai === 'no' ? 'var(--text-secondary)' : 'var(--text-main)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  ❌ {t('noOption', 'Yo\'q, pul berilmaydi')}
                </button>
              </div>
            </div>

            {/* If Shoukai is Active, reveal secret fee & conditions fields */}
            {newJob.hasShoukai === 'yes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="input-group" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                    {t('shoukaiSumLabel', 'Showkai puli summasi (Faqat kompaniya o\'zi eslab qolishi uchun) *')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}>¥</span>
                    <input 
                      type="number" 
                      value={newJob.shoukaiFee} 
                      onChange={e => setNewJob({...newJob, shoukaiFee: e.target.value})} 
                      placeholder="5000" 
                      className="auth-input"
                      style={{ paddingLeft: '30px', width: '100%' }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', opacity: 0.8, lineHeight: '1.3' }}>
                    🔒 {t('shoukaiSecretNote', 'Ushbu summani hech kim ko\'rmaydi, do\'stini taklif qiluvchilar faqat "Puli bor" belgisi hamda quyidagi shartlarni ko\'radi xolos.')}
                  </span>
                </div>

                <div className="input-group" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                    {t('shoukaiConditionsInputLabel', 'Showkai berilish shartlari va izohlari (Batafsil)')}
                  </label>
                  <textarea 
                    value={newJob.shoukaiConditions} 
                    onChange={e => setNewJob({...newJob, shoukaiConditions: e.target.value})} 
                    placeholder={t('shoukaiConditionsPlaceholder', 'Masalan: Agar tavsiya qilingan odam kamida 3 oy ishlasa, shoukai puli keyin to\'lab beriladi.')}
                    className="auth-input"
                    style={{ minHeight: '80px', resize: 'vertical', fontSize: '13px' }}
                    maxLength={250}
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            className="btn-primary squircle" 
            style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }} 
            onClick={handleAddJob}
          >
            {isDrivingSchool ? t('publishSchoolAd', "Avtomaktab e'lonini joylash") : t('publishJob', "Ish e'lonini joylash")}
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN JOB LIST =====
  return (
    <div className="feed-container fade-in" style={{ paddingTop: '20px' }}>
      
      {/* ADD ANNOUNCEMENT BUTTON CARD */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div 
          onClick={() => setShowAddForm(true)}
          style={{ 
            border: '2px dashed var(--primary)', 
            background: 'var(--glass-bg)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', 
            background: 'var(--primary)', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px', boxShadow: '0 4px 12px rgba(90, 85, 234, 0.4)'
          }}>
            <Plus size={32} />
          </div>
          <h3 style={{ fontSize: '18px', color: 'var(--primary)', marginBottom: '8px' }}>
            {isDrivingSchool ? t('addNewSchoolAd', "Yangi avtomaktab e'loni") : t('addNewJob', "Yangi ish e'loni qo'shish")}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isDrivingSchool 
              ? t('addNewSchoolAdDesc', "Haydovchilarni o'qitish va yangi o'quvchilar jalb etish uchun e'lon joylang.") 
              : t('addNewJobDesc', "Haydovchilar yoki xodimlar qidirish uchun yangi vakansiya yarating.")
            }
          </p>
        </div>
      </div>

      {/* EXISTING ANNOUNCEMENTS LIST */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>
          {isDrivingSchool ? t('yourSchools', "Sizning avtomaktablaringiz") : t('yourJobs', "Sizning e'lonlaringiz")}
        </h2>
      </div>

      <div className="jobs-list hide-scrollbar">
        {isDrivingSchool ? (
          companySchools.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              {t('noSchoolsYet', "Hozircha avtomaktab e'lonlari joylanmagan.")}
            </p>
          ) : (
            companySchools.map(school => (
              <div key={school.id} className="job-card-hz glass squircle" onClick={() => onSchoolClick ? onSchoolClick(school) : onJobClick(school)}>
                {/* Chap qism: Rasm */}
                <div className="job-card-img">
                  <img 
                    src={school.image} 
                    alt={school.name} 
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800"; }}
                  />
                  <div className="job-type-badge type-fulltime">
                    {school.langs ? school.langs.join(', ') : 'UZ, JP'}
                  </div>
                </div>

                {/* O'ng qism: Ma'lumotlar */}
                <div className="job-card-body">
                  <div className="job-card-company">
                    <span>{school.name}</span>
                    <VerifiedBadge size={14} />
                  </div>

                  <h3 className="job-card-title">{school.type}</h3>

                  <div className="job-card-salary">
                    <Banknote size={15} color="#30D158" />
                    <span>{school.price}</span>
                    {school.discount && (
                      <span className="discount-tag" style={{ marginLeft: '4px', fontSize: '9px', padding: '1.5px 4px' }}>
                        -{school.discount}
                      </span>
                    )}
                  </div>

                  <div className="job-card-chips">
                    <span className="job-chip">
                      <MapPin size={10} />
                      {school.location}
                    </span>
                    {school.shoukaiFee > 0 && (
                      <span className="job-chip chip-highlight">
                        <Share2 size={10} />
                        {t('shoukaiAvailable', 'Shoukai puli bor')}
                        {/* Private exact sum view for company record keeping */}
                        <span style={{ opacity: 0.8, marginLeft: '4px', fontWeight: 'bold' }}>
                          (¥{school.shoukaiFee.toLocaleString()})
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="job-card-actions">
                    <button 
                      className="job-card-btn btn-apply"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%' }}
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <Edit3 size={13} />
                      {t('editJob', 'Tahrirlash')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          companyJobs.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              {t('noJobsYet', "Hozircha ish e'lonlari joylanmagan.")}
            </p>
          ) : (
            companyJobs.map(job => (
              <div key={job.id} className="job-card-hz glass squircle" onClick={() => onJobClick({...job})}>
                {/* Chap qism: Rasm */}
                <div className="job-card-img">
                  <img 
                    src={job.image} 
                    alt={job.title} 
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800"; }}
                  />
                  <span className={`job-type-badge type-${job.type || 'fulltime'}`}>
                    {t(`jobType_${job.type || 'fulltime'}`, (job.type || 'fulltime') === 'fulltime' ? '正社員' : (job.type || 'fulltime') === 'parttime' ? 'アルバイト' : '契約')}
                  </span>
                </div>

                {/* O'ng qism: Ma'lumotlar */}
                <div className="job-card-body">
                  <div className="job-card-company">
                    <img src={job.logo} alt={job.company} className="job-card-company-logo" />
                    <span>{job.company}</span>
                    {job.verified && <VerifiedBadge size={14} />}
                  </div>

                  <h3 className="job-card-title">{job.title}</h3>

                  <div className="job-card-salary">
                    <Banknote size={15} />
                    <span>{job.salary ? job.salary.replace('/ oyiga', `/ ${t('perMonth', 'oyiga')}`) : ''}</span>
                  </div>

                  <div className="job-card-chips">
                    <span className="job-chip">
                      <MapPin size={12} />
                      {job.location}
                    </span>
                    {job.hours && (
                      <span className="job-chip">
                        <Clock size={12} />
                        {job.hours === 'shift' ? t('shiftWork', 'Smenali') : job.hours}
                      </span>
                    )}
                    {job.shoukaiFee > 0 && (
                      <span className="job-chip chip-highlight">
                        <Share2 size={10} />
                        {t('shoukaiAvailable', 'Shoukai puli bor')}
                        {/* Private exact sum view for company record keeping */}
                        <span style={{ opacity: 0.8, marginLeft: '4px', fontWeight: 'bold' }}>
                          (¥{job.shoukaiFee.toLocaleString()})
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="job-card-actions">
                    <button 
                      className="job-card-btn btn-apply"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%' }}
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <Edit3 size={13} />
                      {t('editJob', 'Tahrirlash')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        )}
        <div style={{ height: '10px' }}></div>
      </div>
      
    </div>
  );
}
