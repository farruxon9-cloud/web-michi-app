import React from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, GraduationCap, X } from 'lucide-react';

export default function CompanyAdTypeModal({
  isOpen,
  onClose,
  onSelectAdType
}) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', background: 'var(--card-bg)', borderRadius: '24px',
        border: '1px solid var(--glass-border)', padding: '20px',
        boxShadow: '0 16px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '16px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: 'var(--text-main)' }}>
            E'lon Turini Tanlang
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'var(--glass-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} color="var(--text-secondary)" />
          </button>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={() => { onSelectAdType('job'); onClose(); }}
            style={{
              padding: '14px 16px', borderRadius: '18px', border: '1px solid rgba(10, 132, 255, 0.3)',
              background: 'rgba(10, 132, 255, 0.08)', color: 'var(--text-main)',
              display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(10, 132, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={20} color="#0A84FF" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#0A84FF' }}>Vakansiya E'loni</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Ish o'rni yoki topshiriq e'loni berish</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { onSelectAdType('school'); onClose(); }}
            style={{
              padding: '14px 16px', borderRadius: '18px', border: '1px solid rgba(48, 209, 88, 0.3)',
              background: 'rgba(48, 209, 88, 0.08)', color: 'var(--text-main)',
              display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(48, 209, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="#30D158" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#30D158' }}>Avtomaktab E'loni</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Haydovchilik kurslari e'loni berish</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
