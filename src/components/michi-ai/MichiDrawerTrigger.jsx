import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { pickText } from '../../utils/localize';

export default function MichiDrawerTrigger({ isOpen, onToggle, chatCount, speechLang }) {
  // Y-position state (in pixels from top). Default ~42% of window height.
  const [yPos, setYPos] = useState(null);

  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const initialYPosRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const buttonRef = useRef(null);

  const getMinMaxY = () => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const minY = 70;
    const maxY = Math.max(minY, vh - 120);
    return { minY, maxY };
  };

  // --- Touch Event Handlers (Mobile) ---
  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startYRef.current = e.touches[0].clientY;
    initialYPosRef.current = yPos !== null && !isNaN(yPos) ? yPos : Math.round(window.innerHeight * 0.42);
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
  };

  // --- Mouse Event Handlers (Desktop) ---
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startYRef.current = e.clientY;
    initialYPosRef.current = yPos !== null && !isNaN(yPos) ? yPos : Math.round(window.innerHeight * 0.42);

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
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onToggle) onToggle();
  };

  if (isOpen) return null;

  const currentTop = yPos !== null && !isNaN(yPos) ? `${yPos}px` : '42%';

  return (
    <button 
      ref={buttonRef}
      className="voice-side-drawer-trigger"
      style={{ top: currentTop, transform: 'none' }}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      title={pickText(speechLang, {
        ja: 'Michi AI Hub (ドラッグして移動可能)',
        en: 'Michi AI Hub (drag to move)',
        uz: 'Michi AI Hub (Surib joylashtirish mumkin)',
        ru: 'Michi AI Hub (можно перетащить)',
        zh: 'Michi AI Hub（可拖动移位）',
        vi: 'Michi AI Hub (kéo để di chuyển)',
        ne: 'Michi AI Hub (तानेर सार्न सकिन्छ)',
      })}
      aria-label="Toggle Michi AI Side Drawer"
    >
      <div className="drawer-trigger-pulse"></div>
      <Sparkles size={16} color="#FFF" aria-hidden="true" />
      <span className="drawer-trigger-badge">
        {chatCount > 0 ? chatCount : 'AI'}
      </span>
    </button>
  );
}
