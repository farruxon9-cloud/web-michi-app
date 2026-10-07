import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { pickText } from '../utils/localize';

const SEARCH_PH = { ja: '🔍 検索...', uz: '🔍 Qidirish...', en: '🔍 Search...', ru: '🔍 Поиск...', zh: '🔍 搜索...', vi: '🔍 Tìm kiếm...', ne: '🔍 खोज्नुहोस्...' };
const SELECT_PH = { ja: '-- 選択してください --', uz: '-- Tanlang --', en: '-- Select --', ru: '-- Выберите --', zh: '-- 请选择 --', vi: '-- Chọn --', ne: '-- छान्नुहोस् --' };
const CUSTOM_PH = { ja: 'その他...', uz: 'Boshqa variant...', en: 'Other...', ru: 'Другое...', zh: '其他...', vi: 'Khác...', ne: 'अन्य...' };

/**
 * CustomInlineDropdown — Mobile-bounded inline custom select component.
 * 
 * Specs (Rule 35):
 * - Width matches the exact width of the input field container (100%).
 * - Max-height constrained to 4-5 items (~210px max height).
 * - Vertical scrolling (overflowY: auto) to scroll through all options.
 * - Solid opaque background to prevent text bleed-through.
 * - Auto-flips (dropUp) if space below container is constrained (< 230px).
 * - Outer container uses overflow: hidden & borderRadius: 16px to ensure 100% curved corners at the bottom.
 */
export default function CustomInlineDropdown({
  label,
  required = false,
  value,
  options = [],
  placeholder: placeholderProp,
  onChange,
  error = null,
  allowCustom = false,
  customPlaceholder: customPlaceholderProp
}) {
  const { i18n } = useTranslation();
  const lang = i18n?.language;
  const placeholder = placeholderProp ?? pickText(lang, SELECT_PH);
  const customPlaceholder = customPlaceholderProp ?? pickText(lang, CUSTOM_PH);
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState('');
  const [dropUp, setDropUp] = useState(false);
  const [portalStyle, setPortalStyle] = useState({});
  const containerRef = useRef(null);

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldDropUp = spaceBelow < 250 && rect.top > 250;
      setDropUp(shouldDropUp);
      setPortalStyle({
        position: 'fixed',
        top: shouldDropUp ? 'auto' : `${rect.bottom + 4}px`,
        bottom: shouldDropUp ? `${window.innerHeight - rect.top + 4}px` : 'auto',
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 999999
      });
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isInsideTrigger = containerRef.current && containerRef.current.contains(e.target);
      const isInsideMenu = menuRef.current && menuRef.current.contains(e.target);
      if (!isInsideTrigger && !isInsideMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const [filterQuery, setFilterQuery] = useState('');

  const formattedOptions = [
    ...(options[0]?.id === '' ? [] : [{ id: '', name: placeholder }]),
    ...options
  ];

  const filteredFormattedOptions = formattedOptions.filter(opt => {
    if (!filterQuery.trim()) return true;
    if (opt.id === '') return true;
    const q = filterQuery.trim().toLowerCase();
    return (
      String(opt.name || '').toLowerCase().includes(q) ||
      String(opt.kanji || '').toLowerCase().includes(q) ||
      String(opt.id || '').toLowerCase().includes(q)
    );
  });

  const selectedOption = formattedOptions.find(opt => {
    if (!value) return false;
    const vStr = String(value).trim();
    const vClean = vStr.replace(/[都道府県]/g, '').toLowerCase();
    const idClean = String(opt.id || '').toLowerCase();
    const nameClean = String(opt.name || '').replace(/[都道府県]/g, '').toLowerCase();
    const kanjiClean = String(opt.kanji || '').replace(/[都道府県]/g, '').toLowerCase();

    return (
      opt.id === vStr ||
      opt.value === vStr ||
      opt.name === vStr ||
      opt.kanji === vStr ||
      idClean === vClean ||
      nameClean === vClean ||
      kanjiClean === vClean
    );
  });
  const displayLabel = selectedOption ? selectedOption.name : (value || placeholder);

  return (
    <div className="input-group" style={{ marginBottom: '16px', position: 'relative', zIndex: isOpen ? 99999 : 1 }} ref={containerRef}>
      {label && (
        <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'block', color: 'var(--text-main)' }}>
          {label} {required && <span style={{ color: '#FF3B30' }}>*</span>}
        </label>
      )}

      {/* Trigger Box */}
      <div
        className="auth-input"
        onClick={() => {
          setIsOpen(!isOpen);
          setFilterQuery('');
        }}
        style={{
          background: 'var(--card-bg)',
          color: 'var(--text-main)',
          padding: '12px 14px',
          borderColor: error ? '#FF3B30' : isOpen ? 'var(--primary)' : 'var(--glass-border)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '12px',
          userSelect: 'none'
        }}
      >
        <span style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {displayLabel}
        </span>
        <ChevronDown 
          size={16} 
          color="var(--primary)" 
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'none', 
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            marginLeft: '8px'
          }} 
        />
      </div>

      {error && <span style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}

      {/* Portal Dropdown Menu — rendered at document.body level for absolute 100% overlay superiority (Rule 36) */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          className="custom-inline-dropdown-menu"
          style={{
            ...portalStyle,
            background: 'var(--modal-bg, var(--card-bg, #ffffff))',
            backgroundColor: 'var(--dropdown-solid-bg, #ffffff)',
            border: '1px solid var(--glass-border, rgba(0, 0, 0, 0.15))',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          {options.length > 5 && (
            <div style={{ padding: '6px 6px 4px 6px', borderBottom: '1px solid var(--glass-border, rgba(0, 0, 0, 0.08))' }}>
              <input
                type="text"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder={pickText(lang, SEARCH_PH)}
                className="auth-input"
                style={{
                  fontSize: '12.5px',
                  padding: '6px 10px',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '10px'
                }}
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
          <div
            className="hide-scrollbar"
            style={{
              maxHeight: '210px',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '6px',
              borderRadius: '15px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {filteredFormattedOptions.map(opt => {
              const rawVal = opt.id !== undefined ? opt.id : opt.value !== undefined ? opt.value : opt.name;
              const isPlaceholder = rawVal === '' || rawVal === null || rawVal === undefined;
              const isSelected = !isPlaceholder && Boolean(value) && (
                String(value).trim() === String(rawVal).trim() ||
                String(value).trim() === String(opt.name).trim()
              );
              return (
                <div
                  key={String(rawVal) || 'placeholder_empty'}
                  onClick={() => {
                    onChange(isPlaceholder ? '' : rawVal);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '11px 14px',
                    borderRadius: '12px',
                    background: isSelected 
                      ? 'rgba(48, 209, 88, 0.15)' 
                      : isPlaceholder
                      ? 'transparent'
                      : 'var(--item-bg, rgba(120, 120, 128, 0.06))',
                    border: isSelected ? '1px solid rgba(48, 209, 88, 0.4)' : '1px solid transparent',
                    color: isSelected ? '#28a745' : isPlaceholder ? 'var(--text-secondary, #8e8e93)' : 'var(--text-main, #1c1c1e)',
                    fontWeight: isSelected ? '700' : '500',
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s'
                  }}
                >
                  <span>{opt.name}</span>
                  {isSelected && <Check size={16} color="#28a745" />}
                </div>
              );
            })}

            {allowCustom && (
              <div
                style={{
                  padding: '8px',
                  borderTop: '1px solid var(--glass-border, rgba(0, 0, 0, 0.1))',
                  marginTop: '4px',
                  display: 'flex',
                  gap: '6px'
                }}
                onClick={e => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                  placeholder={customPlaceholder}
                  className="auth-input"
                  style={{
                    fontSize: '12.5px',
                    padding: '8px 10px',
                    flex: 1
                  }}
                />
                <button
                  type="button"
                  className="action-btn primary-btn"
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    borderRadius: '10px'
                  }}
                  onClick={() => {
                    if (customText.trim()) {
                      onChange(customText.trim());
                      setCustomText('');
                      setIsOpen(false);
                    }
                  }}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
