import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export default function MichiDrawerTrigger({ isOpen, onToggle, chatCount, speechLang }) {
  // Y-position state (in pixels from top). Default ~42% of window height.
  const [yPos, setYPos] = useState(() => {
    const saved = localStorage.getItem('michi_trigger_y_pos');
    return saved ? parseFloat(saved) : null;
  });

  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const initialYPosRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const buttonRef = useRef(null);

  // Dynamic boundaries:
  // Top boundary: 70px (near the top header / AI robot area)
  // Bottom boundary: window.innerHeight - 120px (above the bottom navigation bar)
  const getMinMaxY = () => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const minY = 70;
    const maxY = Math.max(minY, vh - 120);
    return { minY, maxY };
  };

  // Initialize Y position on mount if not loaded from localStorage
  useEffect(() => {
    if (yPos === null && typeof window !== 'undefined') {
      const vh = window.innerHeight;
      const defaultY = Math.round(vh * 0.42);
      setYPos(defaultY);
    }
  }, [yPos]);

  // Recalculate and constrain position on window resize
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
  }, []);

  // --- Touch Event Handlers (Mobile) ---
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
      localStorage.setItem('michi_trigger_y_pos', yPos.toString());
    }
  };

  // --- Mouse Event Handlers (Desktop) ---
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only primary left mouse click
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
        localStorage.setItem('michi_trigger_y_pos', yPos.toString());
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Handle click: toggle drawer only if not dragging
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
      title={speechLang === 'ja' ? 'Michi AI Hub (ドラッグして移動可能)' : 'Michi AI Hub (Surib joylashtirish mumkin)'}
      aria-label="Toggle Michi AI Side Drawer"
    >
      <div className="drawer-trigger-pulse"></div>
      <Sparkles size={16} color="#FFF" />
      <span className="drawer-trigger-badge">
        {chatCount > 0 ? chatCount : 'AI'}
      </span>
    </button>
  );
}
