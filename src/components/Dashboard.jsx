import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, GraduationCap, Wrench, ChevronRight, User, ArrowRight } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ setActiveTab, profileData }) {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDaysArray = () => {
    const days = [];
    for (let i = -2; i <= 2; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getDayName = (date) => {
    let locale = 'uz-UZ';
    if (i18n.language === 'en') locale = 'en-US';
    if (i18n.language === 'ja') locale = 'ja-JP';
    return date.toLocaleDateString(locale, { weekday: 'short' }).toUpperCase();
  };

  const daysArray = getDaysArray();

  return (
    <div className="dashboard-container hide-scrollbar">
      
      {/* Top Banner Area (Like BON) */}
      <div className="dash-hero-area" onClick={() => setActiveTab('jobs')}>
        <div className="dash-hero-content">
          <span className="dash-badge">{t("navJobs", "Ish e'lonlari")}</span>
          <h1 className="dash-hero-title">
            Michi<br/>
            {t("dashJobsDesc", "Yangi vakansiyalar").split(" ")[0]}
          </h1>
          <p className="dash-hero-sub">{t("dashJobsDesc", "Eng so'nggi vakansiyalarni ko'rib chiqing")}</p>
        </div>
        <div className="dash-hero-footer">
          <div className="dash-hero-dots">
            <span className="dot active"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>
      </div>

      {/* Calendar Row Widget */}
      <div className="calendar-row">
        {daysArray.map((d, index) => {
          const isToday = index === 2;
          return (
            <div key={index} className={`calendar-day ${isToday ? 'active' : ''}`}>
              <span className="day-name">{getDayName(d)}</span>
              <span className="day-num">{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      <div className="dash-section-title">
        <h2>{t('greeting', 'Xush kelibsiz')}</h2>
        <span className="time-sub">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* Bento Icons Row (Like BON App Store / Google Play / Inst) */}
      <div className="bento-icons-row">
        
        <div className="bento-icon-card dark-card" onClick={() => setActiveTab('jobs')}>
          <div className="icon-wrapper">
            <Briefcase size={28} />
          </div>
          <div className="bento-text-wrap">
            <h4>{t('navJobs', 'Ishlar')}</h4>
            <p>Ko'rish</p>
          </div>
        </div>

        <div className="bento-icon-card dark-card" onClick={() => setActiveTab('academy')}>
          <div className="icon-wrapper">
            <GraduationCap size={28} />
          </div>
          <div className="bento-text-wrap">
            <h4>{t('navAcademy', 'Maktablar')}</h4>
            <p>O'qish</p>
          </div>
        </div>

        <div className="bento-icon-card light-card" onClick={() => setActiveTab('service')}>
          <div className="icon-wrapper">
            <Wrench size={26} />
          </div>
          <div className="bento-text-wrap">
            <h4>{t('navService', 'Servis')}</h4>
            <p>Xizmatlar</p>
          </div>
        </div>

      </div>

      {/* Action Card Bottom */}
      <div className="bento-action-card" onClick={() => setActiveTab('profile')}>
        <div className="action-card-left">
          <div className="action-icon circle-bg">
            <User size={24} color="#0A84FF" />
          </div>
          <div className="action-info">
            <h3>{profileData?.fullName || t('guestName', 'Mehmon')}</h3>
            <p>{t('dashProfileTitle', 'Shaxsiy profil')}</p>
          </div>
        </div>
        <div className="action-card-right">
          <span className="arrow-text">{t("viewProfileBtn", "Ko'rish")} <ArrowRight size={16} /></span>
        </div>
      </div>

    </div>
  );
}
