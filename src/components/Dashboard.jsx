import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, GraduationCap, Wrench, ChevronRight, User, ArrowRight, Gift, CalendarClock, Rocket, MapPin, Bell, Play, Pause, SkipForward, SkipBack, Music, Volume2, VolumeX, Sparkles, X, Megaphone } from 'lucide-react';
import './Dashboard.css';

const formatTime = (secs) => {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function Dashboard({ setActiveTab, profileData, musicPlayer, isVoiceStandby, onVoiceActivate, onVoiceToggle, setProfileActivePage, userRole }) {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);

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
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(slideTimer);
  }, [SLIDES.length]);

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
            <span className="ai-card-badge">🗣️ Michi Voice AI (テスト中)</span>
            <h3 className="ai-card-title">{t('voiceAssistantTitle', 'Ovozli yordamchi')}</h3>
            <p className="ai-card-sub">{t('voiceAssistantDesc', 'Ilovani yapon tilida masofaviy ovozda boshqaring')}</p>
          </div>
        </div>
        <div className="ai-card-right">
          {/* Subtle wave visualizer inside card */}
          <div className="ai-card-visualizer">
            {[1, 2, 3, 4].map((bar) => (
              <div key={bar} className={`ai-bar ai-bar-${bar} ${isVoiceStandby ? 'active' : ''}`}></div>
            ))}
          </div>
          <span 
            className="ai-action-btn"
            onClick={(e) => {
              e.stopPropagation(); // Avoid triggering onVoiceActivate (starting speech recognition)
              onVoiceToggle();
            }}
          >
            {isVoiceStandby ? t('turnOffBtn', "O'chirish") : t('turnOnBtn', 'Yoqish')} 
            {isVoiceStandby ? <X size={14} style={{ marginLeft: '4px' }} /> : <ArrowRight size={14} />}
          </span>
        </div>
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

      {/* Premium Minimalist Music Player / Company My Ads Shortcut Cards */}
      {userRole === 'company' ? (
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
                    <SkipBack size={12} fill="currentColor" />
                  </button>
                  <button 
                    onClick={musicPlayer.togglePlay}
                    className="player-control-btn btn-play-pause"
                    aria-label="Play or Pause"
                  >
                    {musicPlayer.isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" style={{ marginLeft: '1px' }} />}
                  </button>
                  <button 
                    onClick={musicPlayer.nextTrack}
                    className="player-control-btn btn-skip"
                    aria-label="Next track"
                  >
                    <SkipForward size={12} fill="currentColor" />
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
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Soundwave Hanging on the Right Wall */}
            <div className={`compact-side-visualizer ${musicPlayer.isPlaying ? 'animating' : ''}`}>
              <div className="vis-line line-1"></div>
              <div className="vis-line line-2"></div>
              <div className="vis-line line-3"></div>
              <div className="vis-line line-4"></div>
              <div className="vis-line line-5"></div>
              <div className="vis-line line-6"></div>
              <div className="vis-line line-7"></div>
              <div className="vis-line line-8"></div>
              <div className="vis-line line-9"></div>
              <div className="vis-line line-10"></div>
              <div className="vis-line line-11"></div>
              <div className="vis-line line-12"></div>
              <div className="vis-line line-13"></div>
              <div className="vis-line line-14"></div>
              <div className="vis-line line-15"></div>
              <div className="vis-line line-16"></div>
              <div className="vis-line line-17"></div>
              <div className="vis-line line-18"></div>
            </div>
          </div>

          {/* Mening e'lonlarim Card */}
          <div 
            className="bento-my-ads-card glass squircle" 
            onClick={() => {
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
            </div>
          </div>
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
                />
              </div>
            </div>
          </div>

          <div className="music-player-bottom">
            {/* Waveform Visualizer */}
            <div className="mini-visualizer">
              {[1, 2, 3, 4, 5].map((bar) => (
                <div 
                  key={bar} 
                  className={`vis-bar bar-${bar} ${musicPlayer.isPlaying ? 'playing' : ''}`}
                ></div>
              ))}
            </div>

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
