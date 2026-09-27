import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPinOff, Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '32px 20px',
      textAlign: 'center',
      gap: '16px'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'rgba(255, 59, 48, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FF3B30'
      }}>
        <MapPinOff size={40} aria-hidden="true" />
      </div>
      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
        404 - {t('pageNotFoundTitle', 'Sahifa topilmadi')}
      </h1>
      <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: 1.5 }}>
        {t('pageNotFoundDesc', 'Siz qidirayotgan sahifa mavjud emas yoki ko\'chirilgan bo\'lishi mumkin.')}
      </p>
      <button
        onClick={() => navigate('/')}
        className="btn-primary squircle"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          marginTop: '8px',
          fontWeight: '700',
          fontSize: '14px',
          cursor: 'pointer',
          border: 'none',
          background: 'var(--primary)',
          color: 'white',
          borderRadius: '16px'
        }}
      >
        <Home size={18} aria-hidden="true" />
        {t('backToHome', 'Bosh sahifaga qaytish')}
      </button>
    </div>
  );
}
