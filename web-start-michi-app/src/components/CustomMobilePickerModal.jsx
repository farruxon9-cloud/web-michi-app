import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Check, Sparkles } from 'lucide-react';

/**
 * CustomMobilePickerModal — Mobile-first glassmorphism modal picker.
 * Replaces native browser <select> popups to prevent OS popup overflow outside mobile viewport.
 */
export default function CustomMobilePickerModal({
  isOpen,
  onClose,
  title,
  items = [],
  options = [],
  selectedValue = '',
  onSelect,
  allowCustom = false
}) {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setCustomValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format items array into normalized objects (supports both `items` and `options` formats)
  const rawList = (items && items.length > 0) ? items : options;
  const normalizedItems = rawList.map(item => {
    if (typeof item === 'string') {
      return { id: item, name: item };
    }
    return { 
      id: item.value || item.id || item.name || item.label, 
      name: item.label || item.name || item.value || item.id, 
      icon: item.icon, 
      country: item.country 
    };
  });

  // Filter items based on search query
  const filteredItems = normalizedItems.filter(item =>
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
    (item.id || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '0',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          background: 'var(--card-bg, #FFFFFF)',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          border: '1px solid var(--glass-border, rgba(0, 0, 0, 0.08))',
          borderBottom: 'none',
          boxShadow: '0 -12px 36px rgba(0, 0, 0, 0.16)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: 'var(--text-main, #1C1C1E)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Handle bar for bottom sheet */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px 0' }}>
          <div style={{ width: '36px', height: '5px', borderRadius: '3px', background: 'rgba(118, 118, 128, 0.28)' }} />
        </div>

        {/* Header */}
        <div style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--glass-border, rgba(0, 0, 0, 0.06))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary, #0A84FF)" />
            <span style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-main, #1C1C1E)' }}>
              {title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(118, 118, 128, 0.12)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main, #1C1C1E)',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div style={{ padding: '14px 20px 10px 20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(118, 118, 128, 0.08)',
            border: '1px solid rgba(118, 118, 128, 0.15)',
            borderRadius: '16px',
            padding: '11px 16px'
          }}>
            <Search size={17} color="var(--text-secondary, #8E8E93)" />
            <input
              type="text"
              placeholder={t('searchPlaceholder', i18n.language === 'ja' ? '市区町村名や都道府県で探す...' : i18n.language === 'en' ? 'Search location...' : 'Qidirish...')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main, #1C1C1E)',
                fontSize: '14.5px',
                fontWeight: '600',
                width: '100%'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary, #8E8E93)', cursor: 'pointer', padding: 0 }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Items List (Smooth Scrollable Container with dock bar padding) */}
        <div 
          className="hide-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '8px 20px 100px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const isSelected = 
                (selectedValue || '').toLowerCase() === (item.id || '').toLowerCase() ||
                (selectedValue || '').toLowerCase() === (item.name || '').toLowerCase();
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.id || item.name);
                    onClose();
                  }}
                  style={{
                    padding: '13px 18px',
                    borderRadius: '14px',
                    border: isSelected ? '1.8px solid var(--primary, #0A84FF)' : '1px solid var(--glass-border, rgba(0, 0, 0, 0.06))',
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(10, 132, 255, 0.12), rgba(94, 92, 230, 0.12))' 
                      : 'rgba(118, 118, 128, 0.04)',
                    color: isSelected ? 'var(--primary, #0A84FF)' : 'var(--text-main, #1C1C1E)',
                    fontSize: '14.5px',
                    fontWeight: isSelected ? '800' : '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.icon && <span style={{ fontSize: '16px' }}>{item.icon}</span>}
                    <span style={{ fontSize: '14.5px', lineHeight: '1.4' }}>{item.name}</span>
                    {item.country && (
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary, #8E8E93)', marginLeft: '4px' }}>
                        {item.country}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={18} color="var(--primary, #0A84FF)" />}
                </button>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary, #8E8E93)', fontSize: '14px', fontWeight: '600' }}>
              {t('noResultsFound', i18n.language === 'ja' ? '該当する項目が見つかりません' : i18n.language === 'en' ? 'No items found' : "Ro'yxatda topilmadi.")}
            </div>
          )}

          {/* Custom Input Option if allowCustom */}
          {allowCustom && (
            <div style={{
              marginTop: '10px',
              paddingTop: '14px',
              paddingBottom: '20px',
              borderTop: '1px solid var(--glass-border, rgba(0, 0, 0, 0.08))',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary, #8E8E93)', fontWeight: '700' }}>
                {t('otherCustomInput', i18n.language === 'ja' ? 'その他 (直接入力):' : i18n.language === 'en' ? 'Other (Custom input):' : 'Boshqa (Custom nom yozish):')}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder={t('customInputPlaceholder', i18n.language === 'ja' ? '入力してください...' : i18n.language === 'en' ? 'Enter value...' : 'Kiritishingiz mumkin...')}
                  value={customValue}
                  onChange={e => setCustomValue(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(118, 118, 128, 0.08)',
                    border: '1px solid rgba(118, 118, 128, 0.18)',
                    borderRadius: '10px',
                    padding: '9px 12px',
                    color: 'var(--text-main, #1C1C1E)',
                    fontSize: '13px',
                    fontWeight: '600',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customValue.trim()) {
                      onSelect(customValue.trim());
                      onClose();
                    }
                  }}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    background: 'var(--primary, #0A84FF)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  {t('selectBtn', i18n.language === 'ja' ? '選択' : i18n.language === 'en' ? 'Select' : 'Tanlash')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
