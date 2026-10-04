import React, { useState } from 'react';
import { Building2, Plus, Trash2, Phone, Train, Users, Pencil, Info } from 'lucide-react';
import { lookupJapaneseZipcode } from '../utils/japaneseZipcodeLookup';
import { ALL_47_PREFECTURES } from '../data/japanRegions';
import { normalizeBranch } from '../utils/jobPostingNormalizer';
import { validateBranch, formatBranchAddress, newBranchId, HIDDEN_PHONE_TEXT } from '../utils/branchUtils';
import AppSheet from './AppSheet';

/**
 * 支店・営業所エディタ（企業向け・日本語UI）
 * 1つの求人で複数の勤務地を募集する場合に、勤務地ごとに住所・電話番号などを登録します。
 */
const EMPTY_BRANCH = {
  id: '',
  name: '',
  postalCode: '',
  prefecture: 'Tokyo',
  city: '',
  town: '',
  building: '',
  phone: '',
  phonePublic: true,
  nearestStation: '',
  walkMinutes: '',
  headcount: ''
};

const toFormValue = (v) => (v === null || v === undefined ? '' : String(v));

export default function BranchListEditor({ branches = [], onChange = () => {}, error = '' }) {
  const [open, setOpen] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [isFetchingZip, setIsFetchingZip] = useState(false);
  const [form, setForm] = useState(EMPTY_BRANCH);
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleZipLookup = async (rawZip) => {
    const digits = String(rawZip || '').replace(/\D/g, '');
    if (digits.length !== 7) return;
    setIsFetchingZip(true);
    try {
      const res = await lookupJapaneseZipcode(digits);
      if (res && res.success) {
        const prefMatch = ALL_47_PREFECTURES.find((p) => p.kanji === res.prefJa || p.id === res.prefectureKey);
        setForm((prev) => ({
          ...prev,
          postalCode: `${digits.slice(0, 3)}-${digits.slice(3)}`,
          prefecture: prefMatch ? prefMatch.id : prev.prefecture,
          city: res.cityJa || res.detailAddress || prev.city,
          town: prev.town || res.townJa || res.townAddress || ''
        }));
        setErrors((prev) => ({ ...prev, postalCode: undefined, prefecture: undefined, city: undefined }));
      }
    } catch {
      /* 郵便番号検索の失敗は手入力で補えるため無視 */
    } finally {
      setIsFetchingZip(false);
    }
  };

  const openNew = () => {
    setForm(EMPTY_BRANCH);
    setErrors({});
    setEditingIdx(null);
    setOpen(true);
  };

  const openEdit = (idx) => {
    const b = branches[idx] || {};
    setForm({
      ...EMPTY_BRANCH,
      ...b,
      walkMinutes: toFormValue(b.walkMinutes),
      headcount: toFormValue(b.headcount),
      phonePublic: b.phonePublic !== false
    });
    setErrors({});
    setEditingIdx(idx);
    setOpen(true);
  };

  const close = () => setOpen(false);

  const handleSave = () => {
    const errs = validateBranch(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const id = form.id || newBranchId();
    const norm = normalizeBranch({ ...form, id }, editingIdx ?? branches.length, { keepPrivatePhone: true });
    const next = editingIdx !== null
      ? branches.map((b, i) => (i === editingIdx ? norm : b))
      : [...branches, norm];
    onChange(next);
    setOpen(false);
    setEditingIdx(null);
  };

  const handleRemove = (idx) => {
    if (window.confirm('この支店・営業所を削除しますか？')) {
      onChange(branches.filter((_, i) => i !== idx));
    }
  };

  const field = (key, label, { required, placeholder, inputMode, type = 'text', hint } = {}) => (
    <div>
      <label className="app-field-label" htmlFor={`branch-${key}`}>
        {label} {required && <span style={{ color: '#FF3B30' }}>*</span>}
      </label>
      <input
        id={`branch-${key}`}
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => {
          set(key, e.target.value);
          if (key === 'postalCode') handleZipLookup(e.target.value);
        }}
        className={`app-field-input${errors[key] ? ' has-error' : ''}`}
        aria-invalid={!!errors[key]}
      />
      {hint && !errors[key] && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 3 }}>{hint}</div>}
      {errors[key] && <div className="app-field-error">{errors[key]}</div>}
    </div>
  );

  return (
    <div style={{ marginTop: '12px', marginBottom: '16px' }} id="branch-list-editor">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={18} color="#007AFF" />
          <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)' }}>
            募集する支店・営業所（{branches.length}件）
          </h4>
        </div>
        <button
          type="button"
          id="branch-add-btn"
          className="form-chip selected"
          onClick={openNew}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '6px 12px' }}
        >
          <Plus size={14} />
          <span>支店を追加</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
        <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          この求人で複数の支店・営業所で人材を募集する場合は、勤務地ごとに追加してください。求職者は応募時に希望の勤務地を選べます。
        </span>
      </div>

      {branches.length === 0 ? (
        <button
          type="button"
          onClick={openNew}
          style={{ width: '100%', padding: '16px', borderRadius: '12px', border: `1px dashed ${error ? '#FF3B30' : 'var(--glass-border)'}`, background: 'transparent', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer' }}
        >
          ＋ 最初の支店・営業所を追加してください
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {branches.map((b, idx) => (
            <div
              key={b.id || idx}
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, padding: '12px 14px', borderRadius: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{b.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 3, wordBreak: 'break-all' }}>
                  📍 {formatBranchAddress(b)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: 4 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Phone size={11} /> {b.phone || '-'}{b.phonePublic === false ? `（非公開：「${HIDDEN_PHONE_TEXT}」と表示）` : ''}
                  </span>
                  {b.nearestStation && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Train size={11} /> {b.nearestStation}{b.walkMinutes ? ` 徒歩${b.walkMinutes}分` : ''}
                    </span>
                  )}
                  {b.headcount ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Users size={11} /> 募集{b.headcount}名
                    </span>
                  ) : null}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button type="button" aria-label="編集" onClick={() => openEdit(idx)} style={{ background: 'none', border: 'none', color: '#007AFF', cursor: 'pointer', padding: 6 }}>
                  <Pencil size={15} />
                </button>
                <button type="button" aria-label="削除" onClick={() => handleRemove(idx)} style={{ background: 'none', border: 'none', color: '#FF3B30', cursor: 'pointer', padding: 6 }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div className="app-field-error" style={{ marginTop: 6 }}>{error}</div>}

      <AppSheet
        open={open}
        onClose={close}
        id="branch-form-sheet"
        title={editingIdx !== null ? '支店・営業所を編集' : '支店・営業所を追加'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {field('name', '支店・営業所名', { required: true, placeholder: '例：横浜営業所' })}

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              {field('postalCode', '郵便番号', {
                required: true,
                placeholder: '例：231-0001',
                inputMode: 'numeric',
                hint: isFetchingZip ? '住所を検索中…' : '7桁を入力すると住所が自動入力されます'
              })}
            </div>
            <div style={{ flex: 1 }}>
              <label className="app-field-label" htmlFor="branch-prefecture">
                都道府県 <span style={{ color: '#FF3B30' }}>*</span>
              </label>
              <select
                id="branch-prefecture"
                value={form.prefecture}
                onChange={(e) => set('prefecture', e.target.value)}
                className={`app-field-input${errors.prefecture ? ' has-error' : ''}`}
              >
                {ALL_47_PREFECTURES.map((p) => (
                  <option key={p.id} value={p.id}>{p.kanji}</option>
                ))}
              </select>
              {errors.prefecture && <div className="app-field-error">{errors.prefecture}</div>}
            </div>
          </div>

          {field('city', '市区町村', { required: true, placeholder: '例：横浜市中区' })}
          {field('town', '町名・番地', { required: true, placeholder: '例：新港1-2-3' })}
          {field('building', '建物名・階数（任意）', { placeholder: '例：みちビル3階' })}

          {field('phone', '支店の電話番号', { required: true, placeholder: '例：045-123-4567', inputMode: 'tel', type: 'tel' })}

          <label htmlFor="branch-phonePublic" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>
            <input
              id="branch-phonePublic"
              type="checkbox"
              checked={form.phonePublic}
              onChange={(e) => set('phonePublic', e.target.checked)}
              style={{ marginTop: 3, width: 18, height: 18 }}
            />
            <span style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.5 }}>
              求職者に電話番号を公開する
              <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                オフにすると、求職者には「{HIDDEN_PHONE_TEXT}」と表示されます。
              </span>
            </span>
          </label>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 2 }}>{field('nearestStation', '最寄り駅（任意）', { placeholder: '例：関内駅' })}</div>
            <div style={{ flex: 1 }}>{field('walkMinutes', '駅から徒歩（分）', { placeholder: '例：5', inputMode: 'numeric' })}</div>
          </div>

          {field('headcount', 'この勤務地の募集人数（任意）', { placeholder: '例：3', inputMode: 'numeric' })}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={close}
            style={{ flex: 1, padding: '13px', borderRadius: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: 700, cursor: 'pointer' }}
          >
            キャンセル
          </button>
          <button
            type="button"
            id="branch-save-btn"
            onClick={handleSave}
            style={{ flex: 1, padding: '13px', borderRadius: '12px', background: '#007AFF', border: 'none', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}
          >
            {editingIdx !== null ? '変更を保存' : 'この支店を追加'}
          </button>
        </div>
      </AppSheet>
    </div>
  );
}
