import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Edit3, X, Image as ImageIcon, Camera, ArrowLeft, Upload, Clock, Banknote, Share2 } from 'lucide-react';
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

export default function CompanyHome({ onJobClick, onSchoolClick, jobs, setJobs, schools, setSchools, profileData, jobToEdit, setJobToEdit }) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [jobImage, setJobImage] = useState(null);
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    if (jobToEdit) {
      setNewJob(jobToEdit);
      setJobImage(jobToEdit.image || null);
      setShowAddForm(true);
      if (setJobToEdit) setJobToEdit(null);
    }
  }, [jobToEdit, setJobToEdit]);
  
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
    courses: ['Oogata', 'Chugata', 'Futsu'], // Default driving school courses
    license: [] // Array for regular job licenses if needed
  });
  const [errors, setErrors] = useState({});

  const WORK_HOURS_OPTIONS = ['08:00 - 17:00 (Kunduzgi)', '20:00 - 05:00 (Tungi)', 'Smenali ish (Jadval)', 'Erkin grafik', 'Boshqa'];
  const DAY_OFF_OPTIONS = ['Shanba va Yakshanba', 'Haftada 2 kun (Smenali)', 'Haftada 1 kun', 'Boshqa'];
  const INSURANCE_OPTIONS = ['To\'liq ijtimoiy sug\'urta', 'Koyo Hoken (Bandlik)', 'Yo\'q'];
  const FOREIGNERS_OPTIONS = ['Viza yordami bor (Sponsorship)', 'Faqat PR / Teijusha', 'Barcha chet elliklar qabul', 'Yapon tilini bilish N3+'];
  const HOUSING_OPTIONS = ['Yotoqxona mavjud', 'Ijara yordami bor (Yachin hojo)', 'Ko\'chib kelish to\'lanadi', 'Yo\'q'];
  const LICENSE_OPTIONS = ['Futsu (Oddiy)', 'Chugata (O\'rta yuk)', 'Oogata (Katta yuk)', 'Tokushu (Maxsus)', 'Forklift', 'Talab qilinmaydi'];


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
    // 1. Mandatory Fields Validation with inline errors
    const newErrors = {};
    if (!newJob.title) newErrors.title = t('reqTitle', 'Sarlavha kiritilishi shart');
    if (!newJob.salary) newErrors.salary = t('reqSalary', 'Narx/Maosh kiritilishi shart');
    if (!newJob.location) newErrors.location = t('reqLocation', 'Qisqa manzil kiritilishi shart');
    if (!newJob.fullAddress) newErrors.fullAddress = t('reqFullAddress', 'To\'liq manzil kiritilishi shart');
    if (!newJob.phone) newErrors.phone = t('reqPhone', 'Telefon raqam kiritilishi shart');
    if (!newJob.email) newErrors.email = t('reqEmail', 'Email kiritilishi shart');
    if (!newJob.description) newErrors.description = t('reqDesc', 'Batafsil ma\'lumot kiritilishi shart');
    if (newJob.hasShoukai === '') newErrors.hasShoukai = t('reqShoukai', 'Shoukai holatini belgilash shart');
    if (newJob.hasShoukai === 'yes' && !newJob.shoukaiFee) newErrors.shoukaiFee = t('reqShoukaiSum', 'Shoukai summasini kiritish shart');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setErrors({});

    if (isDrivingSchool) {
      const school = {
        id: newJob.id || Date.now(),
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

      if (newJob.id) {
        setSchools(schools.map(s => s.id === newJob.id ? school : s));
      } else {
        setSchools([school, ...schools]);
      }
    } else {
      const job = {
        id: newJob.id || Date.now(),
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

      if (newJob.id) {
        setJobs(jobs.map(j => j.id === newJob.id ? job : j));
      } else {
        setJobs([job, ...jobs]);
      }
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

  // ===== ADD NEW JOB FORM (Full Page Premium) =====
  if (showAddForm) {
    const renderChips = (options, fieldName, isMulti = false) => {
      const selectedValue = newJob[fieldName];
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {options.map(opt => {
            const isSelected = isMulti ? (selectedValue && selectedValue.includes(opt)) : selectedValue === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  if (isMulti) {
                    const current = selectedValue || [];
                    if (isSelected) {
                      setNewJob({ ...newJob, [fieldName]: current.filter(v => v !== opt) });
                    } else {
                      setNewJob({ ...newJob, [fieldName]: [...current, opt] });
                    }
                  } else {
                    setNewJob({ ...newJob, [fieldName]: isSelected ? '' : opt });
                  }
                  if (errors[fieldName]) {
                    setErrors(prev => ({ ...prev, [fieldName]: null }));
                  }
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  border: isSelected ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                  background: isSelected ? 'rgba(90, 85, 234, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: isSelected ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      );
    };

    return (
      <div className="feed-container fade-in" style={{ paddingTop: '10px', paddingBottom: '100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px 20px 16px' }}>
          <button className="icon-btn glass" onClick={() => { setShowAddForm(false); setJobImage(null); setErrors({}); }}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
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
              marginBottom: '24px',
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
                  borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Camera size={14} /> {t('changePhoto', "Rasmni o'zgartirish")}
                </div>
              </>
            ) : (
              <>
                <Upload size={32} color="var(--primary)" />
                <span style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>
                  {t('uploadAdImage', "E'lon rasmini yuklang")}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.8, marginTop: '4px' }}>
                  {t('optionalField', '(Ixtiyoriy ammo tavsiya etiladi)')}
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

          {/* BLOCK 1: Asosiy Ma'lumotlar */}
          <div className="glass squircle" style={{ padding: '24px 20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
              <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                {t('jobBasicInfo', "Asosiy ma'lumotlar")}
              </h4>
            </div>
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {isDrivingSchool ? t('schoolTypeLabel', 'Toifalar / Kategoriya') : t('jobTitleLabel', 'Sarlavha (Vakansiya)')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.title} 
                onChange={e => { setNewJob({...newJob, title: e.target.value}); setErrors(prev => ({...prev, title: null})); }} 
                placeholder={isDrivingSchool ? t('schoolTypePlaceholder', "Masalan: Katta yuk va maxsus, Barcha toifalar") : t('jobTitlePlaceholder', "Masalan: Mahalliy yetkazib beruvchi (4t)")} 
                className="auth-input"
                style={{ borderColor: errors.title ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={50}
              />
              {errors.title && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.title}</span>}
            </div>
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {isDrivingSchool ? t('schoolPriceLabel', 'Boshlang\'ich o\'qish narxi') : t('salaryLabel', 'Oylik maosh (O\'rtacha)')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.salary} 
                onChange={e => { setNewJob({...newJob, salary: e.target.value}); setErrors(prev => ({...prev, salary: null})); }} 
                placeholder={isDrivingSchool ? t('schoolPricePlaceholder', "Masalan: ¥280,000~") : t('salaryPlaceholder', "Masalan: ¥300,000 / oyiga")} 
                className="auth-input"
                style={{ borderColor: errors.salary ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={30}
              />
              {errors.salary && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.salary}</span>}
            </div>

            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {isDrivingSchool ? t('schoolDiscountLabel', 'A\'zolar uchun chegirma (Ixtiyoriy)') : t('bonusLabel', 'Bonus puli bormi? (Ixtiyoriy)')}
              </label>
              <input 
                type="text" 
                value={newJob.bonus} 
                onChange={e => setNewJob({...newJob, bonus: e.target.value})} 
                placeholder={isDrivingSchool ? t('schoolDiscountPlaceholder', "Masalan: ¥20,000 chegirma") : t('bonusPlaceholder', "Masalan: Yiliga 2 marta (Yoz va Qish)")} 
                className="auth-input"
                maxLength={50}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('locationLabel', 'Qisqa joylashuv (Shahar, prefektura)')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.location} 
                onChange={e => { setNewJob({...newJob, location: e.target.value}); setErrors(prev => ({...prev, location: null})); }} 
                placeholder={t('locationPlaceholder', "Saitama, Omiya")} 
                className="auth-input"
                style={{ borderColor: errors.location ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={80}
              />
              {errors.location && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.location}</span>}
            </div>

            <div className="input-group">
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('fullAddressLabel', 'Batafsil pochta manzili')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.fullAddress} 
                onChange={e => { setNewJob({...newJob, fullAddress: e.target.value}); setErrors(prev => ({...prev, fullAddress: null})); }} 
                placeholder={t('fullAddressPlaceholder', "〒330-0854 Saitama, Omiya-ku, Sakuragicho 2-1")} 
                className="auth-input"
                style={{ borderColor: errors.fullAddress ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={120}
              />
              {errors.fullAddress && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.fullAddress}</span>}
            </div>
          </div>

          {/* BLOCK 2: Ish Sharoitlari (Chips) */}
          {!isDrivingSchool && (
            <div className="glass squircle" style={{ padding: '24px 20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                  {t('jobConditionsTitle', 'Ish sharoitlari va Imtiyozlar')}
                </h4>
              </div>
              
              <div className="input-group" style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('workHoursLabel', 'Ish vaqti (Ixtiyoriy)')}
                </label>
                {renderChips(WORK_HOURS_OPTIONS, 'hours')}
              </div>
              
              <div className="input-group" style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('dayOffLabel', 'Dam olish kunlari (Ixtiyoriy)')}
                </label>
                {renderChips(DAY_OFF_OPTIONS, 'dayOff')}
              </div>
              
              <div className="input-group" style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('insuranceLabel', "Sug'urta to'lovlari (Ixtiyoriy)")}
                </label>
                {renderChips(INSURANCE_OPTIONS, 'insurance')}
              </div>

              <div className="input-group" style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('foreignersLabel', "Chet elliklar va Viza (Ixtiyoriy)")}
                </label>
                {renderChips(FOREIGNERS_OPTIONS, 'foreigners')}
              </div>
              
              <div className="input-group" style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('housingLabel', "Uy-joy / Ijara (Ixtiyoriy)")}
                </label>
                {renderChips(HOUSING_OPTIONS, 'housing')}
              </div>

              <div className="input-group" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('licenseLabel', "Talab qilinadigan guvohnoma (Ixtiyoriy)")}
                </label>
                {renderChips(LICENSE_OPTIONS, 'license', true)}
              </div>
            </div>
          )}

          {/* Conditional Sections For Driving School */}
          {isDrivingSchool && (
            <div className="glass squircle" style={{ padding: '24px 20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                  {t('schoolCoursesLanguages', "Kurslar va Dars tillari")}
                </h4>
              </div>

              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('availableCoursesLabel', 'Mavjud toifalar')}
                </label>
                {renderChips(['Oogata', 'Chugata', 'Futsu', 'Tokushu', 'Nirin', 'Forklift'], 'courses', true)}
              </div>

              <div className="input-group">
                <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', display: 'block', color: 'var(--text-main)' }}>
                  {t('availableLangsLabel', 'Dars beriladigan tillar')}
                </label>
                {renderChips(['UZ', 'JP', 'EN', 'RU', 'VI', 'ZH'], 'langs', true)}
              </div>
            </div>
          )}

          {/* BLOCK 3: Contact & Description */}
          <div className="glass squircle" style={{ padding: '24px 20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {isDrivingSchool ? '3' : '3'}
              </div>
              <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)', fontWeight: '700' }}>
                {t('contactInfoAndDesc', "Vakansiya bo'yicha to'liq tavsif (Aloqa)")}
              </h4>
            </div>
            
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('phoneLabel', 'Aloqa telefon raqami')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="text" 
                value={newJob.phone} 
                onChange={e => { setNewJob({...newJob, phone: e.target.value}); setErrors(prev => ({...prev, phone: null})); }} 
                placeholder={t('phonePlaceholder', "+81 48-555-1234")} 
                className="auth-input"
                style={{ borderColor: errors.phone ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={25}
              />
              {errors.phone && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
            </div>

            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {t('emailLabel', 'Aloqa emaili')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <input 
                type="email" 
                value={newJob.email} 
                onChange={e => { setNewJob({...newJob, email: e.target.value}); setErrors(prev => ({...prev, email: null})); }} 
                placeholder={t('emailContactPlaceholder', "info@saitama-auto.jp")} 
                className="auth-input"
                style={{ borderColor: errors.email ? '#FF3B30' : 'var(--glass-border)' }}
                maxLength={50}
              />
              {errors.email && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
            </div>

            <div className="input-group">
              <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                {isDrivingSchool ? t('schoolDescLabel', 'Maktab haqida batafsil ma\'lumot') : t('jobDescLabel', 'Batafsil tavsif')} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <textarea 
                value={newJob.description} 
                onChange={e => { setNewJob({...newJob, description: e.target.value}); setErrors(prev => ({...prev, description: null})); }} 
                placeholder={isDrivingSchool ? t('schoolDescPlaceholder', "さいたま市中心部に広大な教習コースを持つ自動車学校...") : t('jobDescPlaceholder', "Ish haqida qiziqarli ma'lumotlarni yozing...")}
                className="auth-input"
                style={{ 
                  minHeight: '120px', 
                  resize: 'vertical', 
                  borderColor: errors.description ? '#FF3B30' : 'var(--glass-border)',
                  lineHeight: '1.5'
                }}
                maxLength={500}
              ></textarea>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                {errors.description ? <span style={{ color: '#FF3B30', fontSize: '12px' }}>{errors.description}</span> : <span></span>}
                <span style={{ fontSize: '12px', color: newJob.description?.length >= 500 ? '#FF3B30' : '#8E8E93', fontWeight: '600' }}>
                  {newJob.description?.length || 0}/500
                </span>
              </div>
            </div>
          </div>

          {/* BLOCK 4: Shoukai (Referral) */}
          <div className="glass squircle" style={{ padding: '24px 20px', marginBottom: '32px', border: errors.hasShoukai ? '2px solid #FF3B30' : '2px solid rgba(255, 159, 10, 0.3)', background: 'linear-gradient(145deg, rgba(255, 159, 10, 0.05) 0%, rgba(255, 159, 10, 0.01) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#FF9F0A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {isDrivingSchool ? '4' : '4'}
              </div>
              <h4 style={{ margin: 0, fontSize: '18px', color: '#FF9F0A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={20} />
                {t('shoukaiSettings', "Shoukai (Tavsiya) Sozlamalari")}
              </h4>
            </div>

            {/* Shoukai Choice Selection (Mandatory) */}
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14.5px', fontWeight: '600', marginBottom: '12px', display: 'block', color: 'var(--text-main)' }}>
                {t('hasShoukaiPrompt', "Ushbu e'londa do'stlarni taklif qilganlik uchun shoukai mukofot puli beriladimi?")} <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => { setNewJob({...newJob, hasShoukai: 'yes'}); setErrors(prev => ({...prev, hasShoukai: null})); }}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    border: newJob.hasShoukai === 'yes' ? '2px solid #FF9F0A' : '1px solid var(--glass-border)',
                    background: newJob.hasShoukai === 'yes' ? 'rgba(255, 159, 10, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: newJob.hasShoukai === 'yes' ? '#FF9F0A' : 'var(--text-main)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: newJob.hasShoukai === 'yes' ? '0 4px 12px rgba(255, 159, 10, 0.2)' : 'none'
                  }}
                >
                  🎉 {t('yesOption', 'Ha, mukofot bor')}
                </button>
                <button
                  type="button"
                  onClick={() => { setNewJob({...newJob, hasShoukai: 'no', shoukaiFee: '', shoukaiConditions: ''}); setErrors(prev => ({...prev, hasShoukai: null, shoukaiFee: null})); }}
                  style={{
                    padding: '14px',
                    borderRadius: '16px',
                    border: newJob.hasShoukai === 'no' ? '2px solid var(--text-secondary)' : '1px solid var(--glass-border)',
                    background: newJob.hasShoukai === 'no' ? 'rgba(142, 142, 147, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: newJob.hasShoukai === 'no' ? 'var(--text-secondary)' : 'var(--text-main)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  ❌ {t('noOption', 'Yo\'q, pul berilmaydi')}
                </button>
              </div>
              {errors.hasShoukai && <span style={{ color: '#FF3B30', fontSize: '13px', marginTop: '8px', display: 'block', fontWeight: 'bold' }}>{errors.hasShoukai}</span>}
            </div>

            {/* If Shoukai is Active, reveal secret fee & conditions fields */}
            {newJob.hasShoukai === 'yes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div className="input-group">
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                    {t('shoukaiSumLabel', 'Showkai puli summasi (Faqat kompaniya o\'zi eslab qolishi uchun)')} <span style={{ color: '#FF3B30' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-main)', fontWeight: 'bold' }}>¥</span>
                    <input 
                      type="number" 
                      value={newJob.shoukaiFee} 
                      onChange={e => { setNewJob({...newJob, shoukaiFee: e.target.value}); setErrors(prev => ({...prev, shoukaiFee: null})); }} 
                      placeholder={t('shoukaiFeePlaceholder', "5000")} 
                      className="auth-input"
                      style={{ paddingLeft: '34px', width: '100%', borderColor: errors.shoukaiFee ? '#FF3B30' : 'var(--glass-border)' }}
                    />
                  </div>
                  {errors.shoukaiFee && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.shoukaiFee}</span>}
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px', opacity: 0.8, lineHeight: '1.4' }}>
                    🔒 {t('shoukaiSecretNote', 'Ushbu summani hech kim ko\'rmaydi, do\'stini taklif qiluvchilar faqat "Puli bor" belgisi hamda quyidagi shartlarni ko\'radi xolos.')}
                  </span>
                </div>

                <div className="input-group">
                  <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
                    {t('shoukaiConditionsInputLabel', 'Showkai berilish shartlari va izohlari (Batafsil)')}
                  </label>
                  <textarea 
                    value={newJob.shoukaiConditions} 
                    onChange={e => setNewJob({...newJob, shoukaiConditions: e.target.value})} 
                    placeholder={t('shoukaiConditionsPlaceholder', 'Masalan: Agar tavsiya qilingan odam kamida 3 oy ishlasa, shoukai puli keyin to\'lab beriladi.')}
                    className="auth-input"
                    style={{ minHeight: '90px', resize: 'vertical', fontSize: '13px', lineHeight: '1.4' }}
                    maxLength={250}
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            className="btn-primary squircle" 
            style={{ 
              width: '100%', 
              padding: '16px', 
              fontSize: '17px', 
              fontWeight: '700', 
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(90, 85, 234, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }} 
            onClick={handleAddJob}
          >
            <Plus size={20} />
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
