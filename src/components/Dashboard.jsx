import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, GraduationCap, Wrench, ChevronRight, User, ArrowRight, Gift, CalendarClock, Rocket, MapPin, Bell, Play, Pause, SkipForward, SkipBack, Music, Volume2, VolumeX, Sparkles, X, Megaphone, FileCheck, Globe, Compass } from 'lucide-react';
import { playHapticClick } from '../utils/haptics';
import './Dashboard.css';

const formatTime = (secs) => {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function Dashboard({ setActiveTab, profileData, musicPlayer, isVoiceStandby, isVoiceActive, onVoiceActivate, onVoiceToggle, setProfileActivePage, setProfileActivePageSource, userRole, onNavigateToInternational }) {
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
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(slideTimer);
  }, [isPaused, SLIDES.length]);

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const diffX = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;
    if (diffX > swipeThreshold) {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    } else if (diffX < -swipeThreshold) {
      setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }
  };

  const handleMouseDown = (e) => {
    setIsPaused(true);
    touchStartX.current = e.clientX;
    touchEndX.current = e.clientX;
  };

  const handleMouseMove = (e) => {
    if (isPaused) {
      touchEndX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    if (isPaused) {
      setIsPaused(false);
      const diffX = touchStartX.current - touchEndX.current;
      const swipeThreshold = 50;
      if (diffX > swipeThreshold) {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
      } else if (diffX < -swipeThreshold) {
        setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
      }
    }
  };

  const handleMouseLeave = () => {
    if (isPaused) {
      setIsPaused(false);
    }
  };

  const handleCardClick = (tab) => {
    const diffX = Math.abs(touchStartX.current - touchEndX.current);
    if (diffX < 10) {
      triggerSound();
      setActiveTab(tab);
    }
  };

  const getDaysArray = () => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
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

  const getFormattedDate = () => {
    let locale = 'uz-UZ';
    if (i18n.language === 'en') locale = 'en-US';
    if (i18n.language === 'ja') locale = 'ja-JP';
    if (i18n.language === 'ru') locale = 'ru-RU';
    if (i18n.language === 'vi') locale = 'vi-VN';
    if (i18n.language === 'zh') locale = 'zh-CN';
    return currentTime.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const daysArray = getDaysArray();

  return (
    <div className="dashboard-container hide-scrollbar">
      
      {/* Top Banner Area (Premium Sliding Cards) */}
      <div 
        className="dash-hero-carousel-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isPaused ? 'grabbing' : 'grab' }}
      >
        <div 
          className="dash-hero-slider" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((slide) => (
            <div key={slide.id} className="dash-hero-slide-wrapper">
              <div 
                className="dash-hero-card" 
                onClick={() => handleCardClick(slide.tab)}
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
          const isToday = index === 3;
          return (
            <div key={index} className={`calendar-day ${isToday ? 'active' : ''}`}>
              <span className="day-name">{getDayName(d)}</span>
              <span className="day-num">{d.getDate()}</span>
            </div>
          );
        })}
      </div>

      <div className="dash-greeting-row">
        <h2 className="greeting-title">{t('welcomeTitle', 'Xush kelibsiz')}</h2>
        <div className="greeting-line"></div>
        <span className="greeting-date">{getFormattedDate()}</span>
        <div className="greeting-line"></div>
        <div className="time-pill">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Premium Bento AI Voice Card */}
      <div className={`bento-ai-card glass squircle ${isVoiceStandby ? 'active' : ''}`} onClick={onVoiceActivate}>
        <div className="ai-card-left">
          <div className="ai-gradient-icon">
            <Sparkles size={20} color="#FFF" fill="currentColor" />
          </div>
          <div className="ai-card-info">
            <span className="ai-card-badge">🗣️ <span className="ai-badge-text">Michi Voice AI (テスト中)</span></span>
            <h3 className="ai-card-title">{t('voiceAssistantTitle', 'Ovozli yordamchi')}</h3>
            <p className="ai-card-sub">{t('voiceAssistantDesc', 'Ilovani yapon tilida masofaviy ovozda boshqaring')}</p>
          </div>
        </div>
        <div className="ai-card-right">
          {/* Subtle wave visualizer inside card */}
          <div className="ai-card-visualizer">
            {[1, 2, 3, 4].map((bar) => (
              <div key={bar} className={`ai-bar ai-bar-${bar} ${isVoiceStandby ? 'active' : ''} ${isVoiceActive ? 'animating' : ''}`}></div>
            ))}
          </div>
          <div 
            className={`ios-switch ${isVoiceStandby ? 'checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation(); // Avoid triggering onVoiceActivate (starting speech recognition)
              onVoiceToggle();
            }}
            role="switch"
            aria-checked={isVoiceStandby}
          >
            <span className="ios-switch-thumb"></span>
          </div>
        </div>
      </div>

      {/* Bento Icons Row (Like BON App Store / Google Play / Inst) */}
      <div className="bento-icons-row">
        
        <div className="bento-icon-card dark-card" onClick={() => { triggerSound(); setActiveTab('jobs'); }}>
          <div className="bento-icon-wrap">
            <Briefcase size={28} />
          </div>
          <div className="bento-text-wrap">
            <h4>{t("navJobs", "Ishlar")}</h4>
            <p>{t('bentoView', "Ko'rish")}</p>
          </div>
        </div>

        <div className="bento-icon-card dark-card" onClick={() => { triggerSound(); setActiveTab('academy'); }}>
          <div className="bento-icon-wrap">
            <GraduationCap size={28} />
          </div>
          <div className="bento-text-wrap">
            <h4>{t('navAcademy', 'Maktablar')}</h4>
            <p>{t('bentoStudy', "O'qish")}</p>
          </div>
        </div>

        <div className="bento-icon-card light-card" onClick={() => { triggerSound(); setActiveTab('service'); }}>
          <div className="bento-icon-wrap">
            <Wrench size={26} />
          </div>
          <div className="bento-text-wrap">
            <h4>{t('navService', 'Servis')}</h4>
            <p>{t('bentoServices', 'Xizmatlar')}</p>
          </div>
        </div>

      </div>

      {/* Xalqaro Rekruting & Tokutei Ginou Visa Card */}
      <div 
        className="bento-action-card bento-international-card squircle" 
        onClick={onNavigateToInternational}
        style={{ padding: '20px 24px', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 2 }}>
          <div style={{ flex: 1, paddingRight: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="premium-live-dot"></span>
              <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1.5px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                🇯🇵 JAPAN RECRUITING
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--primary)' }}></span>
              <span style={{ fontSize: '9px', fontWeight: '800', letterSpacing: '1px', color: '#AF52DE', textTransform: 'uppercase' }}>
                SSW Visa
              </span>
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 6px 0', color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: '1.2' }}>
              {t('bentoInternationalTitle', 'Xalqaro Ishlar')}
            </h3>
            
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 12px 0', opacity: 0.85, lineHeight: '1.4' }}>
              {t('bentoInternationalSub', 'Tokutei Ginou viza beruvchi e\'lonlar')}
            </p>
            
            {/* Minimalist details */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: '700' }}>
                特定技能 (SSW)
              </span>
              <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: '700' }}>
                🏠 Uy-joy bor
              </span>
              <span style={{ fontSize: '9.5px', padding: '3px 8px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: '700' }}>
                最小 N4
              </span>
            </div>
          </div>
          
          <div className="bento-international-card-icon">
            <Compass size={24} />
          </div>
        </div>
      </div>

      {/* Premium Minimalist Music Player / Company My Ads / Driver Applications Shortcut Cards */}
      {(userRole === 'company' || userRole === 'driver') ? (
        <div className="bento-double-cards-row">
          {/* Music Player (Compact) */}
          <div className="bento-music-card compact-music-card glass squircle">
            <div className="compact-music-body">
              <div className="music-player-info">
                <div className={`music-gradient-icon ${musicPlayer.isPlaying ? 'playing-pulse' : ''}`}>
                  <Music size={18} color="#FFF" />
                </div>
                
                <div className="music-track-meta">
                  <span className="music-sub-label">
                    {musicPlayer.isPlaying ? t('playingBackgroundMusic', 'Music') : t('musicPaused', 'Music')}
                  </span>
                  <div className="music-track-title-container">
                    <h3 className="music-track-title compact-title">
                      {musicPlayer.currentTrack.title}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="compact-controls-volume">
                <div className="music-player-controls">
                  <button 
                    onClick={musicPlayer.prevTrack}
                    className="player-control-btn btn-skip"
                    aria-label="Previous track"
                  >
                    <SkipBack size={18} fill="currentColor" />
                  </button>
                  <button 
                    onClick={musicPlayer.togglePlay}
                    className="player-control-btn btn-play-pause"
                    aria-label="Play or Pause"
                  >
                    {musicPlayer.isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: '2.5px' }} />}
                  </button>
                  <button 
                    onClick={musicPlayer.nextTrack}
                    className="player-control-btn btn-skip"
                    aria-label="Next track"
                  >
                    <SkipForward size={18} fill="currentColor" />
                  </button>
                </div>

                <div className="compact-volume-control">
                  <button 
                    onClick={() => musicPlayer.setVolume(musicPlayer.volume > 0 ? 0 : 0.7)}
                    className="player-control-btn btn-vol"
                    aria-label="Volume"
                  >
                    {musicPlayer.volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                  <input 
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={musicPlayer.volume}
                    onChange={(e) => musicPlayer.setVolume(parseFloat(e.target.value))}
                    className="volume-slider compact-slider"
                    style={{
                      background: `linear-gradient(to right, var(--primary) ${musicPlayer.volume * 100}%, rgba(120, 120, 128, 0.2) ${musicPlayer.volume * 100}%)`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bento Action Card (Megaphone for Company, FileCheck for Driver) */}
          {userRole === 'company' ? (
            <div 
              className="bento-my-ads-card glass squircle" 
              onClick={() => {
                triggerSound();
                if (setProfileActivePageSource) setProfileActivePageSource('home');
                if (setProfileActivePage) setProfileActivePage('my_ads');
                setActiveTab('profile');
              }}
            >
              <div className="my-ads-icon">
                <Megaphone size={24} color="#FFF" />
              </div>
              <div className="my-ads-text">
                <span className="my-ads-sub">{t('manageAdsSub', 'E\'lonlarni boshqarish')}</span>
                <h3 className="my-ads-title">{t('myAdsMenu', 'Mening e\'lonlarim')}</h3>
                <p className="my-ads-desc">{t('myAdsDesc', 'Yangi vakansiyalar qo\'shing va arizalarni boshqaring.')}</p>
              </div>
            </div>
          ) : (
            <div 
              className="bento-my-ads-card bento-my-apps-card glass squircle" 
              onClick={() => {
                triggerSound();
                if (setProfileActivePageSource) setProfileActivePageSource('home');
                if (setProfileActivePage) setProfileActivePage('applications');
                setActiveTab('profile');
              }}
            >
              <div className="my-apps-icon">
                <FileCheck size={24} color="#FFF" />
              </div>
              <div className="my-ads-text">
                <span className="my-ads-sub">{t('manageAppsSub', 'Arizalar holatini tekshirish')}</span>
                <h3 className="my-ads-title">{t('myApplications', 'Mening arizalarim')}</h3>
                <p className="my-ads-desc">{t('myApplicationsDesc', 'Yuborilgan arizalar va javoblar holatini kuzating.')}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Original Full-Width Music Player Card */
        <div className="bento-music-card glass squircle">
          <div className="music-player-top">
            <div className="music-player-info">
              {/* Elegant visual icon wrapper (glowing pulse when playing) */}
              <div className={`music-gradient-icon ${musicPlayer.isPlaying ? 'playing-pulse' : ''}`}>
                <Music size={18} color="#FFF" />
              </div>
              
              <div className="music-track-meta">
                <span className="music-sub-label">
                  {musicPlayer.isPlaying ? t('playingBackgroundMusic', 'Background Music') : t('musicPaused', 'Background Music')}
                </span>
                <h3 className="music-track-title">
                  {musicPlayer.currentTrack.title}
                </h3>
              </div>
            </div>

            <div className="music-player-controls">
              <button 
                onClick={musicPlayer.prevTrack}
                className="player-control-btn btn-skip"
                aria-label="Previous track"
              >
                <SkipBack size={14} fill="currentColor" />
              </button>
              <button 
                onClick={musicPlayer.togglePlay}
                className="player-control-btn btn-play-pause"
                aria-label="Play or Pause"
              >
                {musicPlayer.isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
              </button>
              <button 
                onClick={musicPlayer.nextTrack}
                className="player-control-btn btn-skip"
                aria-label="Next track"
              >
                <SkipForward size={14} fill="currentColor" />
              </button>
              <div className="volume-control">
                <button 
                  onClick={() => musicPlayer.setVolume(musicPlayer.volume > 0 ? 0 : 0.7)}
                  className="player-control-btn btn-vol"
                  aria-label="Volume"
                >
                  {musicPlayer.volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <input 
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={musicPlayer.volume}
                  onChange={(e) => musicPlayer.setVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                  style={{
                    background: `linear-gradient(to right, var(--primary) ${musicPlayer.volume * 100}%, rgba(120, 120, 128, 0.2) ${musicPlayer.volume * 100}%)`
                  }}
                />
              </div>
            </div>
          </div>
          <div className="music-player-bottom">
            {/* Timeline */}
            <div className="player-timeline-wrapper">
              <span className="player-time-text">
                {formatTime(musicPlayer.currentTime)}
              </span>
              <input 
                type="range"
                min={0}
                max={musicPlayer.duration || 100}
                value={musicPlayer.currentTime}
                onChange={(e) => musicPlayer.seek(parseFloat(e.target.value))}
                className="player-timeline"
              />
              <span className="player-time-text">
                {formatTime(musicPlayer.duration)}
              </span>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}
