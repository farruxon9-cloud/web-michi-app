import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, GraduationCap, Wrench, ChevronRight, User, ArrowRight, Gift, CalendarClock, Rocket, MapPin, Bell, Play, Pause, SkipForward, SkipBack, Music, Volume2, VolumeX, Sparkles, X, Megaphone, FileCheck, Globe, Compass, Navigation, Truck, ShieldCheck, Monitor, Maximize2, Minus } from 'lucide-react';
import { playHapticClick } from '../../../utils/haptics';
import { MACOS_CONFIG } from '../macosBridge';
import './HomeMacOS.css';
import { pickText } from '../../../utils/localize';

const formatTime = (secs) => {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function HomeMacOS({ setActiveTab, profileData, musicPlayer, isVoiceStandby, isVoiceActive, onVoiceActivate, onVoiceToggle, setProfileActivePage, setProfileActivePageSource, userRole, onNavigateToInternational, onNavigateToJDM, onOpenAssistShowcase }) {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const triggerSound = () => {
    try {
      const saved = localStorage.getItem('michi_sound');
      const soundSettings = saved ? JSON.parse(saved) : { sound: true, vibration: true };
      playHapticClick(soundSettings);
    } catch (e) {}
  };

  const SLIDES = [
    {
      id: 'referral',
      badge: t('heroSlide1Badge', '🔥 Bonus'),
      title: t('heroSlide1Title', 'Shoukai Pulini Oling'),
      desc: t('heroSlide1Desc', 'Tanishlaringizni ishga taklif qiling, maxsus shoukai pul mukofotini oling!'),
      icon: <Gift size={56} strokeWidth={1.5} color="var(--text-main)" opacity={0.8} />,
      tab: 'profile'
    },
    {
      id: 'service',
      badge: t('heroSlide2Badge', '⏳ Tez kunda'),
      title: t('heroSlide2Title', 'Navbatlarsiz Servis'),
      desc: t('heroSlide2Desc', "Avtoservislarga oldindan navbat oling va to'lov qiling. Vaqtingizni tejang!"),
      icon: <CalendarClock size={56} strokeWidth={1.5} color="var(--text-main)" opacity={0.8} />,
      tab: 'service'
    },
    {
      id: 'jobs',
      badge: t('heroSlide3Badge', '💼 Vakansiyalar'),
      title: t('heroSlide3Title', 'Orzuingizdagi Ish'),
      desc: t('heroSlide3Desc', "Eng so'nggi va yuqori maoshli vakansiyalarni birinchilardan bo'lib toping."),
      icon: <Rocket size={56} strokeWidth={1.5} color="var(--text-main)" opacity={0.8} />,
      tab: 'jobs'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, SLIDES.length]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCurrentSlide(prev => (prev + 1) % SLIDES.length);
      else setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
    }
  };

  const currentLang = i18n.language || 'uz';
  const displayRole = userRole || profileData?.role || 'driver';
  const roleNameDisplay = displayRole === 'company' 
    ? pickText(currentLang, { ja: '企業・求人者', uz: 'Ish Beruvchi (B2B)', en: 'Employer (B2B)', ru: 'Работодатель (B2B)', zh: '企业・招聘方 (B2B)', vi: 'Nhà tuyển dụng (B2B)', ne: 'रोजगारदाता (B2B)' })
    : pickText(currentLang, { ja: 'ドライバー', uz: 'Haydovchi', en: 'Driver', ru: 'Водитель', zh: '司机', vi: 'Tài xế', ne: 'चालक' });

  return (
    <div className="macos-home-container fade-in hide-scrollbar">
      
      {/* 🍎 macOS Native Seamless Titlebar Header */}
      <div className="macos-titlebar-header">
        <div className="macos-traffic-lights">
          <span className="macos-traffic-dot macos-close" title="Close (Cmd+W)" />
          <span className="macos-traffic-dot macos-minimize" title="Minimize (Cmd+M)" />
          <span className="macos-traffic-dot macos-maximize" title="Maximize (Cmd+Ctrl+F)" />
        </div>
        <div className="macos-titlebar-title">
          <AppleLogoIcon /> Michi App — Desktop (macOS)
        </div>
        <div className="macos-platform-badge">
          <span> macOS Native</span>
        </div>
      </div>

      {/* Header Bar */}
      <div className="dashboard-header">
        <div className="dash-brand">
          <div className="dash-logo-icon">道</div>
          <span className="dash-brand-name">MICHI</span>
        </div>
        
        <div className="dash-header-actions">
          <div className="dash-time-badge">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          
          <button 
            className="dash-profile-btn"
            onClick={() => {
              triggerSound();
              if (setProfileActivePageSource) setProfileActivePageSource('dashboard_header');
              setActiveTab('profile');
            }}
            title={profileData?.fullName || roleNameDisplay}
          >
            <User size={18} />
          </button>
        </div>
      </div>

      {/* Hero Carousel */}
      <div 
        className="hero-carousel-container"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="hero-slide-wrapper" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {SLIDES.map((slide) => (
            <div key={slide.id} className={`hero-card-slide slide-${slide.id}`}>
              <div className="slide-content">
                <span className="slide-badge">{slide.badge}</span>
                <h2 className="slide-title">{slide.title}</h2>
                <p className="slide-desc">{slide.desc}</p>
                
                <button 
                  className="slide-cta-btn"
                  onClick={() => {
                    triggerSound();
                    if (slide.tab === 'profile' && setProfileActivePage) {
                      setProfileActivePageSource('dashboard_hero');
                      setProfileActivePage('my_shoukai');
                    }
                    setActiveTab(slide.tab);
                  }}
                >
                  <span>{t('viewDetailsBtn', 'Batafsil Ko\'rish')}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className="slide-icon-art">
                {slide.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="carousel-dots">
          {SLIDES.map((_, idx) => (
            <span 
              key={idx} 
              className={`dot ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => { triggerSound(); setCurrentSlide(idx); }}
            />
          ))}
        </div>
      </div>

      {/* Main Feature Cards Grid */}
      <div className="dashboard-grid">
        <div 
          className="bento-card card-jobs"
          onClick={() => { triggerSound(); setActiveTab('jobs'); }}
        >
          <div className="bento-icon-bg">
            <Briefcase size={28} />
          </div>
          <div className="bento-info">
            <span className="bento-subtitle">{t('jobsSubtitle', 'Yaponiyadagi Vakansiyalar')}</span>
            <h3 className="bento-title">{t('jobsTitle', 'Vakansiyalar Ro\'yxati')}</h3>
            <p className="bento-desc">{t('jobsDesc', 'Yuk va yengil avtomobil haydovchilari uchun mos ishlar')}</p>
          </div>
          <div className="bento-arrow">
            <ArrowRight size={20} />
          </div>
        </div>

        <div 
          className="bento-card card-academy"
          onClick={() => { triggerSound(); setActiveTab('service'); }}
        >
          <div className="bento-icon-bg">
            <GraduationCap size={28} />
          </div>
          <div className="bento-info">
            <span className="bento-subtitle">{t('academySubtitle', 'Haydovchilik Maktablari')}</span>
            <h3 className="bento-title">{t('academyTitle', 'Avtomaktab va Prava')}</h3>
            <p className="bento-desc">{t('academyDesc', 'Yaponiyada prava olish va almashtirish maktablari')}</p>
          </div>
          <div className="bento-arrow">
            <ArrowRight size={20} />
          </div>
        </div>

        <div 
          className="bento-card card-services"
          onClick={() => { triggerSound(); setActiveTab('service'); }}
        >
          <div className="bento-icon-bg">
            <Wrench size={28} />
          </div>
          <div className="bento-info">
            <span className="bento-subtitle">{t('servicesSubtitle', 'Avtoservis va Texko\'rik')}</span>
            <h3 className="bento-title">{t('servicesTitle', 'Shaken va Ta\'mirlash')}</h3>
            <p className="bento-desc">{t('servicesDesc', 'Shaken (Shaken) va ta\'mirlash servislariga bron qilish')}</p>
          </div>
          <div className="bento-arrow">
            <ArrowRight size={20} />
          </div>
        </div>
      </div>

      {/* JDM GPS Navigation Banner */}
      <div 
        className="jdm-nav-banner-card"
        onClick={() => {
          triggerSound();
          if (onNavigateToJDM) onNavigateToJDM();
          else setActiveTab('nav');
        }}
      >
        <div className="jdm-nav-banner-icon">
          <Navigation size={32} />
        </div>
        <div className="jdm-nav-banner-info">
          <div className="jdm-nav-badge">
            <Compass size={13} />
            <span>JDM TRUCK GPS</span>
          </div>
          <h3 className="jdm-nav-title">{t('jdmNavTitle', 'Yuk Mashinalari uchun Navigator')}</h3>
          <p className="jdm-nav-desc">{t('jdmNavDesc', 'Balandlik, vazn va gabarit cheklovlarini hisobga oluvchi maxsus navigatsiya')}</p>
        </div>
        <div className="jdm-nav-arrow">
          <ChevronRight size={22} />
        </div>
      </div>

      {/* Assist AI Feature Banner */}
      {onOpenAssistShowcase && (
        <div 
          className="assist-banner-card"
          onClick={() => {
            triggerSound();
            onOpenAssistShowcase();
          }}
        >
          <div className="assist-banner-icon">
            <Sparkles size={28} />
          </div>
          <div className="assist-banner-info">
            <div className="assist-badge">
              <span>MICHI AI ASSISTANT</span>
            </div>
            <h3 className="assist-title">{t('assistTitle', 'Ovozli AI Yordamchi')}</h3>
            <p className="assist-desc">{t('assistDesc', 'Ovozingiz bilan vakansiyalarni izlang va Yaponiyada yordam oling')}</p>
          </div>
          <div className="assist-arrow">
            <ChevronRight size={20} />
          </div>
        </div>
      )}

      {/* Audio Player Widget (If active) */}
      {musicPlayer && musicPlayer.currentTrack && (
        <div className="dashboard-audio-player">
          <div className="audio-info">
            <Music size={20} className="music-icon-pulse" />
            <div className="audio-text">
              <span className="audio-title">{musicPlayer.currentTrack.title}</span>
              <span className="audio-artist">{musicPlayer.currentTrack.artist}</span>
            </div>
          </div>
          <div className="audio-controls">
            <button onClick={musicPlayer.togglePlay}>
              {musicPlayer.isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* Trailing Clearance Spacer */}
      <div style={{ height: '40px', width: '100%', flexShrink: 0 }} />
    </div>
  );
}

function AppleLogoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 170 170" fill="currentColor" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.84.13-9.64-1.9-14.42-6.09-3.48-3.03-7.46-7.89-11.96-14.59-7.96-11.83-14.07-25.79-18.33-41.87-4.26-16.08-6.39-31.11-6.39-45.09 0-16.71 3.97-30.82 11.91-42.33 7.94-11.51 18.06-17.38 30.36-17.62 4.48 0 9.77 1.18 15.87 3.54 6.1 2.36 10.45 3.54 13.06 3.54 2.18 0 6.64-1.24 13.38-3.72 6.74-2.48 11.97-3.66 15.69-3.54 13.38.6 23.77 5.75 31.17 15.45-11.83 7.14-17.62 17.03-17.38 29.68.24 10.03 4.17 18.42 11.78 25.17 7.61 6.75 16.55 10.66 26.82 11.73-2.58 8.01-6.04 16.27-10.38 24.78zM119.22 31.02c0-7.38 2.65-14.42 7.96-21.13 5.31-6.71 12.06-10.82 20.25-12.33.24.97.36 1.94.36 2.9 0 7.38-2.69 14.47-8.07 21.27-5.38 6.8-12.09 10.97-20.13 12.51-.12-1.09-.37-2.16-.37-3.22z"/>
    </svg>
  );
}
