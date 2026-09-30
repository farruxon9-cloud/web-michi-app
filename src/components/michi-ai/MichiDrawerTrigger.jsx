import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MichiDrawerTrigger({ isOpen, onToggle, chatCount = 0, speechLang = 'ja' }) {
  const { i18n, t } = useTranslation();
  const currentLang = (speechLang || i18n?.language || 'ja').substring(0, 2).toLowerCase();

  // Y-pozitsiyasi holati (localStorage xavfsiz o'qish bilan)
  const [yPos, setYPos] = useState(() => {
    try {
      const saved = localStorage.getItem('michi_trigger_y_pos');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 110) {
          return parsed;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const initialYPosRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const buttonRef = useRef(null);

  // Dinamik chegaralar (Top: 110px — header ostida xavfsiz masofa, Bottom: window.innerHeight - 130px)
  const getMinMaxY = useCallback(() => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const minY = 110;
    const maxY = Math.max(minY, vh - 130);
    return { minY, maxY };
  }, []);

  // Boshlang'ich pozitsiyani va chegaralarni belgilash
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const vh = window.innerHeight;
      const { minY, maxY } = getMinMaxY();
      setYPos((prevY) => {
        if (prevY === null || prevY < minY || prevY > maxY) {
          const defaultY = Math.round(vh * 0.42);
          return Math.max(minY, Math.min(maxY, defaultY));
        }
        return prevY;
      });
    }
  }, [getMinMaxY]);

  // Ekran o'lchami o'zgarganda pozitsiyani qayta moslash
  useEffect(() => {
    const handleResize = () => {
      setYPos((prevY) => {
        if (prevY === null) return null;
        const { minY, maxY } = getMinMaxY();
        return Math.max(minY, Math.min(maxY, prevY));
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getMinMaxY]);

  // Pozitsiyani keshga yozish yordamchi funksiyasi
  const saveYPos = (newY) => {
    try {
      localStorage.setItem('michi_trigger_y_pos', newY.toString());
    } catch (e) {
      // localStorage cheklovlari bo'lsa e'tiborsiz qoldiriladi
    }
  };

  // --- Mobil Sensorli Boshqaruv (Touch Events) ---
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startYRef.current = e.touches[0].clientY;
    initialYPosRef.current = yPos !== null ? yPos : Math.round(window.innerHeight * 0.42);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;

    if (Math.abs(deltaY) > 4) {
      hasDraggedRef.current = true;
    }

    if (hasDraggedRef.current) {
      const { minY, maxY } = getMinMaxY();
      let newY = initialYPosRef.current + deltaY;
      newY = Math.max(minY, Math.min(maxY, newY));
      setYPos(newY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (hasDraggedRef.current && yPos !== null) {
      saveYPos(yPos);
    }
  };

  // --- Desktop Sichqoncha Boshqaruvi (Mouse Events) ---
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Faqat chap tugma uchun
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startYRef.current = e.clientY;
    initialYPosRef.current = yPos !== null ? yPos : Math.round(window.innerHeight * 0.42);

    const handleMouseMove = (moveEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = moveEvent.clientY - startYRef.current;
      if (Math.abs(deltaY) > 4) {
        hasDraggedRef.current = true;
      }
      if (hasDraggedRef.current) {
        const { minY, maxY } = getMinMaxY();
        let newY = initialYPosRef.current + deltaY;
        newY = Math.max(minY, Math.min(maxY, newY));
        setYPos(newY);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (hasDraggedRef.current && yPos !== null) {
        saveYPos(yPos);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Klaviatura strelka tugmalari orqali pozitsiyani surish
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = e.shiftKey ? 30 : 10;
      const { minY, maxY } = getMinMaxY();
      setYPos((prevY) => {
        const current = prevY !== null ? prevY : Math.round(window.innerHeight * 0.42);
        const nextY = e.key === 'ArrowUp' ? current - step : current + step;
        const clamped = Math.max(minY, Math.min(maxY, nextY));
        saveYPos(clamped);
        return clamped;
      });
    }
  };

  // Drayverni ochish hodisasi (agar surib surilmagan bo'lsa)
  const handleClick = (e) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onToggle) onToggle();
  };

  if (isOpen) return null;

  const currentTop = yPos !== null ? `${yPos}px` : '42%';

  const tooltips = {
    ja: "Michi AI Hub (ドラッグまたは矢印キーで移動可能)",
    uz: "Michi AI Hub (Surib yoki strelkalar bilan joylashtirish mumkin)",
    en: "Michi AI Hub (Drag or use arrow keys to reposition)",
    ru: "Michi AI Hub (Перетащите или используйте стрелки)",
    zh: "Michi AI Hub (拖动或使用方向键移动)"
  };

  const titleText = t('michiTriggerTitle', tooltips[currentLang] || tooltips.ja);

  return (
    <button 
      ref={buttonRef}
      type="button"
      className="voice-side-drawer-trigger"
      style={{ top: currentTop, transform: 'none', touchAction: 'none', userSelect: 'none' }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      title={titleText}
      aria-label={titleText}
    >
      <div className="drawer-trigger-pulse" aria-hidden="true"></div>
      <Sparkles size={16} color="#FFF" />
      <span className="drawer-trigger-badge">
        {chatCount > 0 ? chatCount : 'AI'}
      </span>
    </button>
  );
}
