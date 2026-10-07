import { describe, it, expect } from 'vitest';
import { pickField, pickText, normalizeLang } from './localize';

describe('localize', () => {
  const item = { name: '長期', nameUz: 'Uzoq', nameEn: 'Long', nameRu: 'Долгий' };

  it('normalizes language codes', () => {
    expect(normalizeLang('ja-JP')).toBe('ja');
    expect(normalizeLang('xx')).toBe('ja');
    expect(normalizeLang(undefined)).toBe('ja');
  });

  it('pickField returns the selected language', () => {
    expect(pickField(item, 'name', 'ja')).toBe('長期');
    expect(pickField(item, 'name', 'uz')).toBe('Uzoq');
    expect(pickField(item, 'name', 'ru')).toBe('Долгий');
  });

  it('pickField falls back to English, then base', () => {
    expect(pickField(item, 'name', 'zh')).toBe('Long');
    expect(pickField({ name: '長期' }, 'name', 'vi')).toBe('長期');
  });

  it('pickText picks lang → en → ja', () => {
    const t = { ja: '選択', en: 'Select', uz: 'Tanlash' };
    expect(pickText('uz', t)).toBe('Tanlash');
    expect(pickText('ne', t)).toBe('Select');
    expect(pickText('ja', { ja: '選択' })).toBe('選択');
  });
});
