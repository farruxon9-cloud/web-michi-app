import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Bus, GraduationCap, ShieldCheck, CreditCard, Clock, Users, Gift, ChevronDown } from 'lucide-react';

export default function AcademyFilterFeaturesSection({
  isFeatureSectionOpen,
  setIsFeatureSectionOpen,
  selectedFeatures,
  setSelectedFeatures,
  toggleMultiSelect
}) {
  const { t } = useTranslation();

  const featureOptions = [
    { id: 'shuttle', icon: <Bus size={15} />, name: t('feat_shuttle', '無料送迎バスあり') },
    { id: 'dormitory', icon: <GraduationCap size={15} />, name: t('feat_dormitory', '宿舎・食事付き') },
    { id: 'subsidy', icon: <ShieldCheck size={15} />, name: t('feat_subsidy', '教育訓練給付金対象') },
    { id: 'installment', icon: <CreditCard size={15} />, name: t('feat_installment', 'ローン・分割払いOK') },
    { id: 'nightClass', icon: <Clock size={15} />, name: t('feat_nightclass', 'ナイター教習対応') },
    { id: 'femaleInstructor', icon: <Users size={15} />, name: t('feat_female', '女性指導員在籍') },
    { id: 'kidsRoom', icon: <Users size={15} />, name: t('feat_kidsroom', '託児所・キッズルーム') },
    { id: 'shoukai', icon: <Gift size={15} />, name: t('feat_shoukai', '紹介手当・キャッシュバック') }
  ];

  return (
    <div className="job-category-section" style={{
      background: 'var(--card-bg)', borderRadius: '18px', padding: '14px 16px',
      border: '1px solid var(--glass-border)', boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <button
        type="button"
        onClick={() => setIsFeatureSectionOpen(!isFeatureSectionOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', background: '#FF2D5515',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={18} color="#FF2D55" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>
              {t('featuresHeader', 'こだわり条件・特典')}
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {selectedFeatures.length === 0 ? t('allFeatures', 'すべてのこだわり条件') : `${selectedFeatures.length} ${t('selected', '件選択中')}`}
            </p>
          </div>
        </div>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', background: 'var(--glass-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: isFeatureSectionOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease'
        }}>
          <ChevronDown size={16} color="var(--text-secondary)" />
        </div>
      </button>

      {isFeatureSectionOpen && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px dashed var(--glass-border)', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {featureOptions.map(f => {
            const isSelected = selectedFeatures.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggleMultiSelect(setSelectedFeatures, selectedFeatures, f.id)}
                style={{
                  padding: '8px 12px', borderRadius: '12px', border: isSelected ? '1px solid #FF2D55' : '1px solid var(--glass-border)',
                  background: isSelected ? 'rgba(255, 45, 85, 0.12)' : 'var(--glass-bg)',
                  color: isSelected ? '#FF2D55' : 'var(--text-main)',
                  fontWeight: isSelected ? '800' : '600', fontSize: '13px',
                  display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.15s ease'
                }}
              >
                {f.icon}
                <span>{f.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
