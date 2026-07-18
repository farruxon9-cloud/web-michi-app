import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Briefcase, GraduationCap, Wrench, User, Sparkles } from 'lucide-react';
import { playHapticClick } from '../utils/haptics';
import './BottomNav.css';

export default function BottomNav({ activeTab, setActiveTab, unreadCount = 0, userRole, isVoiceStandby, isVoiceActive, voiceStatus }) {
  const { t } = useTranslation();
  
  const navItems = [
    { id: 'home', icon: Home, label: t('navHome', 'Asosiy') },
    { id: 'jobs', icon: Briefcase, label: t('navJobs', 'Ishlar') },
    { id: 'academy', icon: GraduationCap, label: t('navAcademy', 'Maktablar') },
    { id: 'service', icon: Wrench, label: t('navService', 'Servis') },
    { id: 'profile', icon: User, label: t('navProfile', 'Profil') },
  ];

  const handleTabClick = (tabId) => {
    try {
      const saved = localStorage.getItem('michi_sound');
      const soundSettings = saved ? JSON.parse(saved) : { sound: true, vibration: true };
      playHapticClick(soundSettings);
    } catch (e) {
      console.warn(e);
    }
    setActiveTab(tabId);
  };

  const activeIndex = navItems.findIndex((item) => item.id === activeTab);

  const trackRef = React.useRef(null);
  const indicatorRef = React.useRef(null);
  const isDragging = React.useRef(false);
  const startX = React.useRef(0);
  const startOffset = React.useRef(0);

  const handlePointerDown = (e) => {
    isDragging.current = true;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    
    if (trackRef.current && indicatorRef.current) {
      const trackWidth = trackRef.current.getBoundingClientRect().width;
      const tabWidth = trackWidth / 5;
      startOffset.current = activeIndex * tabWidth;
      
      indicatorRef.current.style.transition = 'none';
      
      if (e.type.startsWith('touch')) {
        document.addEventListener('touchmove', handlePointerMove, { passive: false });
        document.addEventListener('touchend', handlePointerUp);
      } else {
        document.addEventListener('mousemove', handlePointerMove);
        document.addEventListener('mouseup', handlePointerUp);
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current) return;
    
    // Prevent screen scroll on mobile during drag
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX.current;
    
    if (trackRef.current && indicatorRef.current) {
      const trackWidth = trackRef.current.getBoundingClientRect().width;
      const tabWidth = trackWidth / 5;
      
      let newOffset = startOffset.current + deltaX;
      
      const minOffset = 0;
      const maxOffset = trackWidth - tabWidth;
      if (newOffset < minOffset) newOffset = minOffset;
      if (newOffset > maxOffset) newOffset = maxOffset;
      
      indicatorRef.current.style.transform = `translateX(${newOffset}px)`;
      
      const approxIndex = newOffset / tabWidth;
      indicatorRef.current.style.setProperty('--active-index', approxIndex);
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    document.removeEventListener('mousemove', handlePointerMove);
    document.removeEventListener('mouseup', handlePointerUp);
    document.removeEventListener('touchmove', handlePointerMove);
    document.removeEventListener('touchend', handlePointerUp);
    
    if (trackRef.current && indicatorRef.current) {
      const trackWidth = trackRef.current.getBoundingClientRect().width;
      const tabWidth = trackWidth / 5;
      
      indicatorRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.4, 1)';
      
      const matrix = new DOMMatrix(window.getComputedStyle(indicatorRef.current).transform);
      const currentTranslateX = matrix.m41;
      
      const closestIndex = Math.max(0, Math.min(4, Math.round(currentTranslateX / tabWidth)));
      
      handleTabClick(navItems[closestIndex].id);
    }
  };

  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handlePointerMove);
      document.removeEventListener('mouseup', handlePointerUp);
      document.removeEventListener('touchmove', handlePointerMove);
      document.removeEventListener('touchend', handlePointerUp);
    };
  }, []);

  return (
    <div className="bottom-nav">
      {/* Sliding Active Indicator Pill */}
      <div className="bottom-nav-indicator-track" ref={trackRef}>
        <div 
          ref={indicatorRef}
          className="bottom-nav-indicator" 
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          style={{ 
            transform: `translateX(${activeIndex * 100}%)`,
            '--active-index': activeIndex
          }}
        />
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const showBadge = item.id === 'profile' && unreadCount > 0;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleTabClick(item.id)}
            style={{ zIndex: 2 }}
          >
            <div className="nav-icon-wrap">
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {showBadge && (
                <span className="nav-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
