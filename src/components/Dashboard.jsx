import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, GraduationCap, Wrench, ChevronRight } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ setActiveTab, profileData }) {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date based on language
  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    let locale = 'uz-UZ';
    if (i18n.language === 'en') locale = 'en-US';
    if (i18n.language === 'ja') locale = 'ja-JP';
    return date.toLocaleDateString(locale, options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const userName = profileData?.fullName || t('guestName', 'Mehmon');

  return (
    <div className="dashboard-container slide-up hide-scrollbar">
      {/* Header Widget */}
      <div className="dashboard-header glass squircle">
        <div className="dashboard-header-text">
          <p className="greeting-text">{t('greeting', 'Xush kelibsiz')},</p>
          <h2 className="user-name">{userName}</h2>
        </div>
        <div className="time-widget">
          <div className="time-display">{formatTime(currentTime)}</div>
          <div className="date-display">{formatDate(currentTime)}</div>
        </div>
      </div>

      <div className="bento-grid">
        {/* Main Job Card */}
        <div 
          className="bento-card hero-card glass squircle" 
          onClick={() => setActiveTab('jobs')}
        >
          <div className="hero-bg-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80")' }}></div>
          <div className="hero-overlay"></div>
          <div className="card-content">
            <div className="card-icon-wrap blue-bg">
              <Briefcase size={28} color="#0A84FF" />
            </div>
            <div className="card-text-content">
              <h3>{t("navJobs", "Ish e'lonlari")}</h3>
              <p>{t("dashJobsDesc", "Eng so'nggi vakansiyalarni ko'rib chiqing")}</p>
            </div>
            <div className="card-arrow"><ChevronRight size={20} /></div>
          </div>
        </div>

        {/* Secondary Cards Row */}
        <div className="bento-row">
          <div 
            className="bento-card secondary-card glass squircle"
            onClick={() => setActiveTab('academy')}
          >
            <div className="hero-bg-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=80")' }}></div>
            <div className="hero-overlay light-overlay"></div>
            <div className="card-content vertical-content">
              <div className="card-icon-wrap purple-bg">
                <GraduationCap size={24} color="#AF52DE" />
              </div>
              <h3>{t('navAcademy', 'Avtomaktab')}</h3>
            </div>
          </div>

          <div 
            className="bento-card secondary-card glass squircle"
            onClick={() => setActiveTab('service')}
          >
            <div className="hero-bg-image" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80")' }}></div>
            <div className="hero-overlay light-overlay"></div>
            <div className="card-content vertical-content">
              <div className="card-icon-wrap orange-bg">
                <Wrench size={24} color="#FF9500" />
              </div>
              <h3>{t('navService', 'Servis')}</h3>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div 
          className="bento-card action-card glass squircle"
          onClick={() => setActiveTab('profile')}
        >
          <div className="card-content">
            <div className="action-text">
              <h3>{t('dashProfileTitle', 'Shaxsiy profil')}</h3>
              <p>{t("dashProfileDesc", "Ma'lumotlarni yangilash va sozlamalar")}</p>
            </div>
            <div className="action-btn-wrap">
              <button className="btn-primary squircle outline-btn">{t("viewProfileBtn", "Ko'rish")}</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
