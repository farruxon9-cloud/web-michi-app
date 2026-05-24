import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Edit3, X, Image as ImageIcon } from 'lucide-react';
import VerifiedBadge from './VerifiedBadge';
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '', salary: '', location: '', hours: '', bonus: '', insurance: '', foreigners: '', housing: '', description: ''
  });

  const handleAddJob = () => {
    if(!newJob.title || !newJob.salary) {
      alert("Iltimos barcha kerakli joylarni to'ldiring");
      return;
    }
    const job = {
      id: Date.now(),
      company: "Sagawa Express", // Mock company name
      title: newJob.title,
      salary: newJob.salary,
      location: newJob.location || 'Kiritilmagan',
      hours: newJob.hours,
      bonus: newJob.bonus,
      insurance: newJob.insurance,
      foreigners: newJob.foreigners,
      housing: newJob.housing,
      description: newJob.description,
      image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=800", // random default
      verified: true,
      logo: "https://ui-avatars.com/api/?name=Sagawa+Express&background=0D8ABC&color=fff&size=100"
    };
    setJobs([job, ...jobs]);
    setShowAddModal(false);
    setNewJob({title:'', salary:'', location:'', hours:'', bonus:'', insurance:'', foreigners:'', housing:'', description:''});
  };

  return (
    <div className="feed-container fade-in" style={{ paddingTop: '20px' }}>
      
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass squircle" style={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Yangi e'lon qo'shish</h3>
              <button className="icon-btn glass" onClick={() => setShowAddModal(false)}><X size={20}/></button>
            </div>
            
            <div className="input-group">
              <label>Sarlavha (Vakansiya) *</label>
              <input type="text" value={newJob.title} onChange={e=>setNewJob({...newJob, title: e.target.value})} placeholder="Masalan: Mahalliy yetkazib beruvchi" />
            </div>
            <div className="input-group">
              <label>Oylik maosh *</label>
              <input type="text" value={newJob.salary} onChange={e=>setNewJob({...newJob, salary: e.target.value})} placeholder="¥300,000 / oyiga" />
            </div>
            <div className="input-group">
              <label>Manzil (Ixtiyoriy)</label>
              <input type="text" value={newJob.location} onChange={e=>setNewJob({...newJob, location: e.target.value})} placeholder="Tokyo, Koto-ku" />
            </div>
            <div className="input-group">
              <label>Batafsil tavsif (Ixtiyoriy)</label>
              <textarea value={newJob.description} onChange={e=>setNewJob({...newJob, description: e.target.value})} placeholder="Ish haqida ma'lumot..."></textarea>
            </div>
            <div className="input-group">
              <label>Ish vaqti (Ixtiyoriy)</label>
              <input type="text" value={newJob.hours} onChange={e=>setNewJob({...newJob, hours: e.target.value})} placeholder="08:00 - 17:00" />
            </div>
            <div className="input-group">
              <label>Bonus puli bormi? Yilda nechi marta? (Ixtiyoriy)</label>
              <input type="text" value={newJob.bonus} onChange={e=>setNewJob({...newJob, bonus: e.target.value})} placeholder="Yiliga 2 marta" />
            </div>
            <div className="input-group">
              <label>Sug'urta to'lovlari bormi? (Ixtiyoriy)</label>
              <input type="text" value={newJob.insurance} onChange={e=>setNewJob({...newJob, insurance: e.target.value})} placeholder="To'liq ijtimoiy sug'urta" />
            </div>
            <div className="input-group">
              <label>Chet elliklarni qabul qilish va Viza yordami (Ixtiyoriy)</label>
              <input type="text" value={newJob.foreigners} onChange={e=>setNewJob({...newJob, foreigners: e.target.value})} placeholder="Viza qo'llab-quvvatlovi bor" />
            </div>
            <div className="input-group">
              <label>Uy ijarasi uchun qo'shimcha to'lov (Ixtiyoriy)</label>
              <input type="text" value={newJob.housing} onChange={e=>setNewJob({...newJob, housing: e.target.value})} placeholder="Uy ijarasining 50% to'lanadi" />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="primary-btn squircle" style={{ flex: 1 }} onClick={handleAddJob}>Saqlash</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD JOB BUTTON CARD */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div 
          onClick={() => setShowAddModal(true)}
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
              <img src={job.image} alt={job.title} className="job-image" />
              <div className="company-logo-wrapper glass">
                <img src={job.logo} alt={job.company} className="company-logo" />
              </div>
              <div className="price-tag glass">
                {job.salary}
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
        <div style={{ height: '100px' }}></div>
      </div>
      
    </div>
  );
}
