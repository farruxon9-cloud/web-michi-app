import React, { useEffect } from 'react';
import MichiLogo from './MichiLogo';
import './Splash.css';

export default function Splash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-screen">
      <div className="splash-content fade-in">
        <MichiLogo size={80} fontSize={48} borderRadius={24} className="splash-logo-component" />
        <div className="loader"></div>
      </div>
    </div>
  );
}
