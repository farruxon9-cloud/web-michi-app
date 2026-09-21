/**
 * ReferralModal.jsx
 * 
 * Maqsad: App.jsx dagi prompt() ni almashtirish.
 * prompt() mobil ilovada (Capacitor/iOS/Android) ishlamaydi — bu modal uning o'rnini bosadi.
 * 
 * Props:
 *   isOpen     — modalni ko'rsatish/yashirish (boolean)
 *   onConfirm  — foydalanuvchi ID kiritib tasdiqlasa (fn(refId))
 *   onCancel   — foydalanuvchi bekor qilsa (fn())
 *   jobTitle   — qaysi ish/maktab e'loni uchun ekanligi (string)
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Users, ArrowRight } from 'lucide-react';

export default function ReferralModal({ isOpen, onConfirm, onCancel, jobTitle }) {
  const { t } = useTranslation();
  
  // Foydalanuvchi kiritgan havola ID si
  const [refId, setRefId] = useState('');
  
  // Input maydoniga fokus berish uchun ref
  const inputRef = useRef(null);

  // Modal ochilganda input'ga fokus ber va maydonni tozala
  useEffect(() => {
    if (isOpen) {
      setRefId(''); // Oldingi qiymatni tozala
      // Kichik kechikish — animatsiya tugashini kutish
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Modal yopiq bo'lsa — hech nima render qilma (samaradorlik uchun)
  if (!isOpen) return null;

  // Tasdiqlash: ID bilan yoki idsiz (ikkalasi ham qabul qilinadi)
  const handleConfirm = () => {
    // refId bo'sh bo'lsa null uzat, bo'lsa qiymatni uzat
    onConfirm(refId.trim() || null);
    setRefId('');
  };

  // Enter tugmasi bosilganda tasdiqlash
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onCancel();
  };

  return (
    /* Fon — qorong'i shaffof qatlam */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        // Fonga bosish — modalni yopadi
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      {/* Modal oynasi */}
      <div
        className="glass squircle"
        style={{
          maxWidth: '360px',
          width: '100%',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.12)'
        }}
      >
        {/* Sarlavha qatori */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(10,132,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0A84FF'
            }}>
              <Users size={18} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-main)' }}>
              {t('referralModalTitle', 'Shoukai (紹介)')}
            </span>
          </div>
          {/* Yopish tugmasi */}
          <button
            onClick={onCancel}
            aria-label={t('cancel', 'Bekor')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Izoh matni */}
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {t('referralModalDesc',
            'Agar kimdir sizi bu e\'lon orqali yuborgan bo\'lsa, ularning Michi ID raqamini kiriting.'
          )}
        </p>

        {/* Qaysi e'lon uchun ekanligi */}
        {jobTitle && (
          <div style={{
            background: 'rgba(10,132,255,0.08)',
            borderRadius: 10, padding: '8px 12px',
            fontSize: 12, color: '#0A84FF', fontWeight: 600
          }}>
            📋 {jobTitle}
          </div>
        )}

        {/* ID kiritish maydoni */}
        <input
          ref={inputRef}
          type="text"
          value={refId}
          onChange={(e) => setRefId(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('referralPlaceholder', 'Masalan: #Michi-A1B2 (ixtiyoriy)')}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 12,
            border: '1.5px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.05)',
            color: 'var(--text-main)',
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit'
          }}
        />

        {/* Tugmalar */}
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Bekor qilish */}
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px',
              borderRadius: 12,
              border: '1px solid var(--glass-border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}
          >
            {t('cancel', 'Bekor')}
          </button>

          {/* Tasdiqlash */}
          <button
            onClick={handleConfirm}
            style={{
              flex: 2, padding: '11px',
              borderRadius: 12, border: 'none',
              background: 'var(--primary, #0A84FF)',
              color: 'white',
              fontSize: 14, fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6
            }}
          >
            {t('applyBtn', 'Ariza yuborish')}
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Eslatma */}
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center' }}>
          {t('referralOptional', '* ID kiritmasangiz ham ariza yuborishingiz mumkin')}
        </p>
      </div>
    </div>
  );
}
