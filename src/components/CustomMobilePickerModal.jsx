import React, { useState, useEffect } from 'react';
import { Search, X, Check, Sparkles } from 'lucide-react';

/**
 * CustomMobilePickerModal — Mobile-first glassmorphism modal picker.
 * Replaces native browser <select> popups to prevent OS popup overflow outside mobile viewport.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {function} props.onClose - Close callback
 * @param {string} props.title - Modal title (e.g. "Brendni Tanlang")
 * @param {Array<string|Object>} props.items - List of options to choose from
 * @param {string} props.selectedValue - Currently selected item value
 * @param {function} props.onSelect - Selection callback (val: string) => void
 * @param {boolean} [props.allowCustom=true] - Whether to allow typing custom value
 */
export default function CustomMobilePickerModal({
  isOpen,
  onClose,
  title = 'Tanlang',
  items = [],
  selectedValue = '',
  onSelect,
  allowCustom = true
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customValue, setCustomValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setCustomValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format items array into normalized objects
  const normalizedItems = items.map(item => {
    if (typeof item === 'string') {
      return { id: item, name: item };
    }
    return { id: item.id || item.name, name: item.name, icon: item.icon, country: item.country };
  });

  // Filter items based on search query
  const filteredItems = normalizedItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          maxHeight: '80vh',
          background: 'rgba(24, 24, 28, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#fff'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#0084FF" />
            <span style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '-0.3px' }}>
              {title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div style={{ padding: '12px 16px 8px 16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '8px 12px'
          }}>
            <Search size={16} color="rgba(255, 255, 255, 0.5)" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: '13px',
                width: '100%'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Items List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 16px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {filteredItems.length > 0 ? (
            filteredItems.map(item => {
              const isSelected = selectedValue.toLowerCase() === item.name.toLowerCase();
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.name);
                    onClose();
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid #30D158' : '1px solid rgba(255, 255, 255, 0.05)',
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(48, 209, 88, 0.2) 0%, rgba(0, 132, 255, 0.15) 100%)' 
                      : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#30D158' : '#fff',
                    fontSize: '13px',
                    fontWeight: isSelected ? '700' : '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.name}</span>
                    {item.country && (
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginLeft: '4px' }}>
                        {item.country}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={16} color="#30D158" />}
                </button>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
              Ro'yxatda topilmadi.
            </div>
          )}

          {/* Custom Input Option if allowCustom */}
          {allowCustom && (
            <div style={{
              marginTop: '8px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 'bold' }}>
                Boshqa (Custom nom yozish):
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Kiritishingiz mumkin..."
                  value={customValue}
                  onChange={e => setCustomValue(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    padding: '7px 10px',
                    color: '#fff',
                    fontSize: '12px',
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
                    padding: '7px 14px',
                    borderRadius: '8px',
                    background: '#0084FF',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Tanlash
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
