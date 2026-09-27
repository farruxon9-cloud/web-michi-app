import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Gift, CalendarClock, Rocket } from 'lucide-react';
import { playHapticClick } from '../../utils/haptics';

export default function HeroCarousel({ setActiveTab }) {
  const { t } = useTranslation();
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

  return (
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
  );
}
