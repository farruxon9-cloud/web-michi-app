import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Edit3, X, Image as ImageIcon, Camera, ArrowLeft, Upload } from 'lucide-react';
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

export default function CompanyHome({ onJobClick }) {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState(INITIAL_COMPANY_JOBS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [jobImage, setJobImage] = useState(null);
  const fileInputRef = useRef(null);
  const [newJob, setNewJob] = useState({
    title: '', salary: '', location: '', hours: '', bonus: '', insurance: '', foreigners: '', housing: '', description: '', dayOff: ''
  });

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

  const handleAddJob = () => {
    if(!newJob.title || !newJob.salary) {
      alert(t('fillRequired', "Iltimos barcha kerakli joylarni to'ldiring"));
      return;
    }
    const job = {
      id: Date.now(),
      company: "Sagawa Express",
      title: newJob.title,
      salary: newJob.salary,
      location: newJob.location || t('notProvided', 'Kiritilmagan'),
      hours: newJob.hours,
      bonus: newJob.bonus,
      insurance: newJob.insurance,
      foreigners: newJob.foreigners,
      housing: newJob.housing,
      description: newJob.description,
      dayOff: newJob.dayOff,
      image: jobImage || "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800",
      verified: true,
      logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100"
    };
    setJobs([job, ...jobs]);
    setShowAddForm(false);
    setJobImage(null);
    setNewJob({title:'', salary:'', location:'', hours:'', bonus:'', insurance:'', foreigners:'', housing:'', description:'', dayOff:''});
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
          <h2 style={{ margin: 0, fontSize: '20px' }}>{t('addNewJob', "Yangi e'lon qo'shish")}</h2>
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
                  {t('uploadJobImage', "E'lon rasmini yuklang")}
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
                {t('jobTitleLabel', 'Sarlavha (Vakansiya)')} *
              </label>
              <input 
                type="text" 
                value={newJob.title} 
                onChange={e => setNewJob({...newJob, title: e.target.value})} 
                placeholder={t('jobTitlePlaceholder', "Masalan: Mahalliy yetkazib beruvchi")} 
                className="auth-input"
                maxLength={50}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {t('salaryLabel', 'Oylik maosh')} *
              </label>
              <input 
                type="text" 
                value={newJob.salary} 
                onChange={e => setNewJob({...newJob, salary: e.target.value})} 
                placeholder={t('salaryPlaceholder', "¥300,000 / oyiga")} 
                className="auth-input"
                maxLength={30}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {t('locationLabel', 'Manzil')} ({t('optionalField', 'Ixtiyoriy')})
              </label>
              <input 
                type="text" 
                value={newJob.location} 
                onChange={e => setNewJob({...newJob, location: e.target.value})} 
                placeholder="Tokyo, Koto-ku" 
                className="auth-input"
                maxLength={80}
              />
            </div>
          </div>

          <div className="glass squircle" style={{ padding: '20px', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--primary)' }}>
              {t('jobConditionsTitle', 'Ish sharoitlari')}
            </h4>
            
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {t('workHoursLabel', 'Ish vaqti')} ({t('optionalField', 'Ixtiyoriy')})
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
                {t('dayOffLabel', 'Dam olish kunlari')} ({t('optionalField', 'Ixtiyoriy')})
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
                {t('bonusLabel', "Bonus puli bormi?")} ({t('optionalField', 'Ixtiyoriy')})
              </label>
              <input 
                type="text" 
                value={newJob.bonus} 
                onChange={e => setNewJob({...newJob, bonus: e.target.value})} 
                placeholder={t('bonusPlaceholder', "Yiliga 2 marta")} 
                className="auth-input"
                maxLength={50}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {t('insuranceLabel', "Sug'urta to'lovlari bormi?")} ({t('optionalField', 'Ixtiyoriy')})
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
          </div>

          <div className="glass squircle" style={{ padding: '20px', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '16px', color: 'var(--primary)' }}>
              {t('additionalInfo', "Qo'shimcha ma'lumotlar")}
            </h4>
            
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {t('foreignersLabel', "Chet elliklarni qabul qilish va Viza yordami")} ({t('optionalField', 'Ixtiyoriy')})
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
            
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {t('housingLabel', "Uy ijarasi uchun qo'shimcha to'lov")} ({t('optionalField', 'Ixtiyoriy')})
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
            
            <div className="input-group" style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block', color: 'var(--text-main)' }}>
                {t('jobDescLabel', 'Batafsil tavsif')} ({t('optionalField', 'Ixtiyoriy')})
              </label>
              <textarea 
                value={newJob.description} 
                onChange={e => setNewJob({...newJob, description: e.target.value})} 
                placeholder={t('jobDescPlaceholder', "Ish haqida ma'lumot...")}
                className="auth-input"
                style={{ minHeight: '100px', resize: 'vertical' }}
                maxLength={300}
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            className="btn-primary squircle" 
            style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }} 
            onClick={handleAddJob}
          >
            {t('publishJob', "E'lonni joylash")}
          </button>
        </div>
      </div>
    );
  }

  // ===== MAIN JOB LIST =====
  return (
    <div className="feed-container fade-in" style={{ paddingTop: '20px' }}>
      
      {/* ADD JOB BUTTON CARD */}
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
            {t('addNewJob', "Yangi e'lon qo'shish")}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {t('addNewJobDesc', "Haydovchilar yoki xodimlar qidirish uchun yangi vakansiya yarating.")}
          </p>
        </div>
      </div>

      {/* EXISTING JOBS LIST */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>
          {t('yourJobs', "Sizning e'lonlaringiz")}
        </h2>
      </div>

      <div className="jobs-list hide-scrollbar">
        {jobs.map(job => (
          <div key={job.id} className="job-card" onClick={() => onJobClick({...job})}>
            <div className="job-image-container">
              <img 
                src={job.image} 
                alt={job.title} 
                className="job-image" 
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800"; }}
              />
              <div className="company-logo-wrapper glass">
                <img src={job.logo} alt={job.company} className="company-logo" />
              </div>
              <div className="price-tag glass">
                {job.salary ? job.salary.replace('/ oyiga', `/ ${t('perMonth', 'oyiga')}`) : ''}
              </div>
            </div>
            
            <div className="job-info">
              <p style={{ fontSize: '12px', color: '#8E8E93', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {job.company} {job.verified && <VerifiedBadge size={14} />}
              </p>
              <h3 className="job-title" style={{ margin: '0 0 4px 0' }}>{job.title}</h3>
              <p className="job-location" style={{ margin: '0 0 4px 0' }}>
                <MapPin size={14} /> {job.location}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button style={{ flex:1, padding:'8px 12px', background:'#2C2C2E', color:'white', border:'none', borderRadius:'12px', fontSize:'13px', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
                  <Edit3 size={14} /> {t('editJob', 'Tahrirlash')}
                </button>
              </div>
            </div>
          </div>
        ))}
        <div style={{ height: '10px' }}></div>
      </div>
      
    </div>
  );
}
