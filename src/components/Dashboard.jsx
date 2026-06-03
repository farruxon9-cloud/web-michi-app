import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, GraduationCap, Wrench, ChevronRight, User, ArrowRight, Gift, CalendarClock, Rocket } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ setActiveTab, profileData }) {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);

  const SLIDES = [
    {
      id: 'referral',
      badge: t('heroSlide1Badge', '🔥 Bonus'),
      title: t('heroSlide1Title', 'Shoukai Pulini Oling'),
      desc: t('heroSlide1Desc', 'Tanishlaringizni ishga taklif qiling, maxsus shoukai pul mukofotini oling!'),
      icon: <Gift size={84} strokeWidth={1.5} color="var(--text-main)" opacity={0.8} />,
      tab: 'profile'
    },
    {
      id: 'service',
      badge: t('heroSlide2Badge', '⏳ Tez kunda'),
      title: t('heroSlide2Title', 'Navbatlarsiz Servis'),
      desc: t('heroSlide2Desc', "Avtoservislarga oldindan navbat oling va to'lov qiling. Vaqtingizni tejang!"),
      icon: <CalendarClock size={84} strokeWidth={1.5} color="var(--text-main)" opacity={0.8} />,
      tab: 'service'
    },
    {
      id: 'jobs',
      badge: t('heroSlide3Badge', '💼 Vakansiyalar'),
      title: t('heroSlide3Title', 'Orzuingizdagi Ish'),
      desc: t('heroSlide3Desc', "Eng so'nggi va yuqori maoshli vakansiyalarni birinchilardan bo'lib toping."),
      icon: <Rocket size={84} strokeWidth={1.5} color="var(--text-main)" opacity={0.8} />,
      tab: 'jobs'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(slideTimer);
  }, [SLIDES.length]);

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
      
      {/* Top Banner Area (Premium Sliding Cards) */}
      <div className="dash-hero-carousel-container">
        <div 
          className="dash-hero-slider" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((slide) => (
            <div key={slide.id} className="dash-hero-slide-wrapper">
              <div 
                className="dash-hero-card" 
                onClick={() => setActiveTab(slide.tab)}
              >
                <div className="dash-hero-content">
                  <span className="dash-badge">{slide.badge}</span>
                  <h1 className="dash-hero-title">{slide.title}</h1>
                  <p className="dash-hero-sub">{slide.desc}</p>
                </div>
                <div className="dash-hero-icon-3d">{slide.icon}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="dash-hero-footer">
          <div className="dash-hero-dots">
            {SLIDES.map((_, index) => (
              <span 
                key={index}
                className={`dot ${currentSlide === index ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(index);
                }}
              ></span>
            ))}
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
          <div className="bento-icon-wrap">
            <Briefcase size={28} />
          </div>
          <div className="bento-text-wrap">
            <h4>{t("navJobs", "Ishlar")}</h4>
            <p>{t('bentoView', "Ko'rish")}</p>
          </div>
        </div>

        <div className="bento-icon-card dark-card" onClick={() => setActiveTab('academy')}>
          <div className="bento-icon-wrap">
            <GraduationCap size={28} />
          </div>
          <div className="bento-text-wrap">
            <h4>{t('navAcademy', 'Maktablar')}</h4>
            <p>{t('bentoStudy', "O'qish")}</p>
          </div>
        </div>

        <div className="bento-icon-card light-card" onClick={() => setActiveTab('service')}>
          <div className="bento-icon-wrap">
            <Wrench size={26} />
          </div>
          <div className="bento-text-wrap">
            <h4>{t('navService', 'Servis')}</h4>
            <p>{t('bentoServices', 'Xizmatlar')}</p>
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
