import { describe, it, expect, beforeEach } from 'vitest';
import {
  safeSetJSON, sanitizeVehicles, validateVehicle, upsertVehicle,
  photoForIdentityChange, applyCatalogSelection, removeVehicle,
} from './vehicleUtils';
import { getLocalVehicleImage, getModelPresetImage, isUserUploadedPhoto } from '../services/vehicleImageService';

const base = {
  id: 'v_1', make: 'Toyota', model: 'Harrier', type: 'car', bodyStyle: 'suv',
  platePrefecture: '練馬', plateClass: '300', plateHira: 'あ', plateNumber: '12-34',
  height: '1.69', width: '1.85', length: '4.74', weight: '1.70', axleLoad: '0.85', minTurnRadius: '5.3',
  color: '#5E5CE6',
};

describe('vehicleImageService (local only)', () => {
  it('returns bundled preset only when the MODEL matches', () => {
    expect(getModelPresetImage('Giga')).toBe('/images/presets/isuzu_giga.jpg');
    expect(getLocalVehicleImage({ make: 'Hino', model: 'Profia', type: 'truck_10t' })).toBe('/images/presets/hino_profia.jpg');
  });
  it('never returns another model\'s photo or an API URL', () => {
    expect(getLocalVehicleImage({ make: 'Toyota', model: 'Corolla', type: 'car', bodyStyle: 'sedan' })).toBeNull();
    expect(getLocalVehicleImage({ make: 'Hino', model: 'Ranger', type: 'truck_4t' })).toBeNull();
    expect(getLocalVehicleImage(null)).toBeNull();
  });
  it('detects user uploads', () => {
    expect(isUserUploadedPhoto('data:image/jpeg;base64,AAA')).toBe(true);
    expect(isUserUploadedPhoto('/images/presets/isuzu_giga.jpg')).toBe(false);
    expect(isUserUploadedPhoto(null)).toBe(false);
  });
});

describe('safeSetJSON', () => {
  beforeEach(() => localStorage.clear());
  it('writes JSON and returns true', () => {
    expect(safeSetJSON('k', { a: 1 })).toBe(true);
    expect(JSON.parse(localStorage.getItem('k'))).toEqual({ a: 1 });
  });
  it('returns false instead of throwing when storage is full', () => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError'); };
    try {
      expect(safeSetJSON('k', { a: 1 })).toBe(false);
    } finally {
      Storage.prototype.setItem = orig;
    }
  });
});

describe('sanitizeVehicles', () => {
  it('drops junk, de-duplicates ids and repairs legacy data', () => {
    const out = sanitizeVehicles([
      null, 'x',
      { id: 'a', make: 'A', model: 'B' },
      { id: 'a', make: 'C', model: 'D' },
      { make: 'NoId', model: 'X' },
      { id: 'v_2', type: 'truck_2t', make: 'Isuzu', model: 'Giga 10t', photoUrl: '/images/presets/isuzu_giga.jpg', plateHira: 'ni' },
    ]);
    expect(out).toHaveLength(4);
    const ids = out.map(v => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    const v2 = out.find(v => v.id === 'v_2');
    expect(v2.model).toBe('Elf');
    expect(v2.photoUrl).toBeNull();
    expect(v2.plateHira).toBe('に');
  });
  it('keeps a user-uploaded photo when repairing v_2', () => {
    const [v2] = sanitizeVehicles([{ id: 'v_2', type: 'truck_2t', make: 'Isuzu', model: 'Giga 10t', photoUrl: 'data:image/jpeg;base64,AA' }]);
    expect(v2.photoUrl).toBe('data:image/jpeg;base64,AA');
  });
  it('returns [] for non-arrays', () => {
    expect(sanitizeVehicles(null)).toEqual([]);
    expect(sanitizeVehicles({})).toEqual([]);
  });
});

describe('validateVehicle', () => {
  it('accepts a valid vehicle', () => {
    expect(validateVehicle(base, [base])).toBeNull();
  });
  it('requires make and model (and not the "Other" placeholder)', () => {
    expect(validateVehicle({ ...base, make: ' ' }, [])).toBe('vehicleErrMakeModel');
    expect(validateVehicle({ ...base, model: '' }, [])).toBe('vehicleErrMakeModel');
    expect(validateVehicle({ ...base, model: 'Other' }, [])).toBe('vehicleErrMakeModel');
  });
  it('rejects non-positive or non-numeric dimensions, allows empty', () => {
    expect(validateVehicle({ ...base, height: '0' }, [])).toBe('vehicleErrDimensions');
    expect(validateVehicle({ ...base, weight: 'abc' }, [])).toBe('vehicleErrDimensions');
    expect(validateVehicle({ ...base, length: '-1' }, [])).toBe('vehicleErrDimensions');
    expect(validateVehicle({ ...base, axleLoad: '' }, [])).toBeNull();
    expect(validateVehicle({ ...base, width: '1,85' }, [])).toBeNull();
  });
  it('rejects the same license plate on a different vehicle', () => {
    const other = { ...base, id: 'v_9' };
    expect(validateVehicle(base, [other])).toBe('vehicleErrDuplicatePlate');
    expect(validateVehicle(base, [{ ...other, plateNumber: '56-78' }])).toBeNull();
  });
});

describe('upsertVehicle / removeVehicle', () => {
  it('updates by id or appends', () => {
    const list = [base];
    expect(upsertVehicle(list, { ...base, model: 'RAV4' })).toEqual([{ ...base, model: 'RAV4' }]);
    expect(upsertVehicle(list, { ...base, id: 'v_2' })).toHaveLength(2);
  });
  it('promotes the next vehicle when the active one is removed', () => {
    const b = { ...base, id: 'v_2' };
    const r = removeVehicle([base, b], base, 'v_1');
    expect(r.list).toEqual([b]);
    expect(r.active).toBe(b);
    expect(r.activeChanged).toBe(true);
    const r2 = removeVehicle([b], b, 'v_2');
    expect(r2.active).toBeNull();
    const r3 = removeVehicle([base, b], base, 'v_2');
    expect(r3.activeChanged).toBe(false);
    expect(r3.active).toBe(base);
  });
});

describe('photoForIdentityChange', () => {
  it('clears the old model photo when the model changes', () => {
    const prev = { ...base, model: 'Corolla', photoUrl: 'https://upload.wikimedia.org/corolla.jpg' };
    expect(photoForIdentityChange(prev, { ...prev, model: 'Prius' })).toBeNull();
  });
  it('uses the bundled preset for known models', () => {
    const prev = { ...base, model: 'Corolla', photoUrl: 'https://x/corolla.jpg' };
    expect(photoForIdentityChange(prev, { ...prev, model: 'Harrier' })).toBe('/images/presets/toyota_harrier.jpg');
  });
  it('keeps a user-uploaded photo', () => {
    const prev = { ...base, photoUrl: 'data:image/jpeg;base64,AA' };
    expect(photoForIdentityChange(prev, { ...prev, model: 'Prius' })).toBe('data:image/jpeg;base64,AA');
  });
  it('keeps the photo when identity is unchanged', () => {
    const prev = { ...base, photoUrl: 'https://x/h.jpg' };
    expect(photoForIdentityChange(prev, { ...prev })).toBe('https://x/h.jpg');
  });
});

describe('applyCatalogSelection', () => {
  const catalog = { id: 'toyota-supra', make: 'Toyota', model: 'Supra', type: 'car', bodyStyle: 'coupe', year: '2020', photoUrl: 'https://x/supra.jpg', specs: { height: '1.29', id: 'evil' } };

  it('keeps the user vehicle id, plate and color; stores catalogId separately', () => {
    const next = applyCatalogSelection(base, catalog);
    expect(next.id).toBe('v_1');
    expect(next.catalogId).toBe('toyota-supra');
    expect(next.plateNumber).toBe('12-34');
    expect(next.color).toBe('#5E5CE6');
    expect(next.make).toBe('Toyota');
    expect(next.model).toBe('Supra');
    expect(next.height).toBe('1.29');
    expect(next.photoUrl).toBe('https://x/supra.jpg');
  });
  it('does not keep the previous model photo when the catalog has none', () => {
    const prev = { ...base, photoUrl: 'https://x/harrier-wiki.jpg' };
    const next = applyCatalogSelection(prev, { ...catalog, photoUrl: null, specs: {} });
    expect(next.photoUrl).toBeNull();
  });
  it('generates an id for a brand-new vehicle', () => {
    const next = applyCatalogSelection({}, catalog);
    expect(next.id).toMatch(/^v_\d+$/);
  });
});
