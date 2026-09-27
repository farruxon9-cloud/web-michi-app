import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, User, MapPin, Phone, Mail, Award, Truck } from 'lucide-react';

export default function ProfileEdit({
  profileData,
  onBack,
  onUpdateProfile,
  setIsVehiclePickerOpen
}) {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(profileData?.fullName || '');
  const [phone, setPhone] = useState(profileData?.phone || '');
  const [address, setAddress] = useState(profileData?.address || '');
  const [jlpt, setJlpt] = useState(profileData?.jlpt || 'N3');
  const [licenseType, setLicenseType] = useState(profileData?.licenseType || 'Futsuu');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateProfile && onUpdateProfile({
      ...profileData,
      fullName,
      phone,
      address,
      jlpt,
      licenseType
    });
    onBack();
  };

  return (
    <div className="profile-container sub-page-view fade-in">
      {/* Header */}
      <div className="sub-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <button type="button" className="back-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{t('editProfile', 'Shaxsiy ma\'lumotlar')}</h2>
        <div style={{ width: 40 }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Full Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            {t('fullName', 'Ism va familiya')}
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{
              padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)',
              background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '14px', fontWeight: '700'
            }}
          />
        </div>

        {/* Phone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            {t('phone', 'Telefon raqam')}
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)',
              background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '14px', fontWeight: '700'
            }}
          />
        </div>

        {/* Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            {t('address', 'Manzil')}
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{
              padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)',
              background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '14px', fontWeight: '700'
            }}
          />
        </div>

        {/* JLPT Level */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            JLPT (Yapon tili darajasi)
          </label>
          <select
            value={jlpt}
            onChange={(e) => setJlpt(e.target.value)}
            style={{
              padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)',
              background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '14px', fontWeight: '700'
            }}
          >
            <option value="N1">N1 (Mukammal)</option>
            <option value="N2">N2 (Biznes daraja)</option>
            <option value="N3">N3 (Muloqot darajasi)</option>
            <option value="N4">N4 (Boshlang'ich II)</option>
            <option value="N5">N5 (Boshlang'ich I)</option>
            <option value="None">Natija yo'q</option>
          </select>
        </div>

        {/* Driving License Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
            Haydovchilik guvohnomasi toifasi
          </label>
          <select
            value={licenseType}
            onChange={(e) => setLicenseType(e.target.value)}
            style={{
              padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)',
              background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: '14px', fontWeight: '700'
            }}
          >
            <option value="Futsuu">普通自動車 (Futsuu)</option>
            <option value="JunChugata">準中型 (Jun-Chugata)</option>
            <option value="Chugata">中型自動車 (Chugata)</option>
            <option value="Oogata">大型自動車 (Oogata)</option>
            <option value="Nishu">二種 (Nishu - Taksi/Avtobus)</option>
          </select>
        </div>

        {/* Japanese Vehicle Specs Modal Trigger */}
        {setIsVehiclePickerOpen && (
          <button
            type="button"
            onClick={() => setIsVehiclePickerOpen(true)}
            style={{
              padding: '14px', borderRadius: '16px', border: '1px solid rgba(10, 132, 255, 0.3)',
              background: 'rgba(10, 132, 255, 0.1)', color: '#0A84FF',
              fontWeight: '800', fontSize: '13.5px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '8px'
            }}
          >
            <Truck size={18} />
            <span>Kompaniya / Shaxsiy Yuk Mashinasi Spetsifikatsiyalari</span>
          </button>
        )}

        {/* Save Button */}
        <button
          type="submit"
          style={{
            height: '48px', borderRadius: '24px', border: 'none',
            background: 'linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)',
            color: '#FFFFFF', fontWeight: '900', fontSize: '15.5px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            cursor: 'pointer', boxShadow: '0 6px 20px rgba(10, 132, 255, 0.35)', marginTop: '12px'
          }}
        >
          <Save size={18} />
          <span>Saqlash</span>
        </button>
      </form>

      {/* 92px clearance spacer */}
      <div style={{ height: '92px', minHeight: '92px', width: '100%', flexShrink: 0, clear: 'both' }} />
    </div>
  );
}
