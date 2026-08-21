/**
 * Universal Japanese Automotive Database Index
 * Covers Commercial Trucks, Vans, Classic Heritage, JDM Golden Era, and Modern Vehicles.
 * Lightweight structured data (<30KB) with zero bundle performance impact.
 */

export const JAPANESE_AUTOMAKERS = [
  { id: 'all', name: 'Barcha Brendlar', nameJa: '全メーカー' },
  { id: 'isuzu', name: 'Isuzu', nameJa: 'いすゞ自動車', category: 'commercial' },
  { id: 'hino', name: 'Hino', nameJa: '日野自動車', category: 'commercial' },
  { id: 'fuso', name: 'Mitsubishi Fuso', nameJa: '三菱ふそう', category: 'commercial' },
  { id: 'ud', name: 'UD Trucks', nameJa: 'UDトラックス', category: 'commercial' },
  { id: 'toyota', name: 'Toyota', nameJa: 'トヨタ自動車', category: 'passenger' },
  { id: 'nissan', name: 'Nissan', nameJa: '日産自動車', category: 'passenger' },
  { id: 'honda', name: 'Honda', nameJa: '本田技研工業', category: 'passenger' },
  { id: 'mazda', name: 'Mazda', nameJa: 'マツダ', category: 'passenger' },
  { id: 'lexus', name: 'Lexus', nameJa: 'レクサス', category: 'passenger' },
  { id: 'subaru', name: 'Subaru', nameJa: 'SUBARU', category: 'passenger' },
  { id: 'mitsubishi', name: 'Mitsubishi', nameJa: '三菱自動車', category: 'passenger' },
  { id: 'suzuki', name: 'Suzuki', nameJa: 'スズキ', category: 'passenger' }
];

export const HISTORICAL_ERAS = [
  { id: 'all', label: 'Barcha Davrlar', labelJa: '全世代', icon: '🌐' },
  { id: 'classic', label: 'Klassik Meros (1950-1979)', labelJa: 'クラシック (1950-1979)', icon: '🏛️' },
  { id: 'jdm_golden', label: 'Oltin JDM Davri (1980-1999)', labelJa: '黄金JDM時代 (1980-1999)', icon: '🏎️' },
  { id: 'modern', label: 'Zamonaviy Flot (2000-2026)', labelJa: '現代モデル (2000-2026)', icon: '⚡' }
];

export const JAPANESE_VEHICLE_DATABASE = [
  // --- ISUZU ---
  {
    id: 'isuzu_giga_10t',
    make: 'Isuzu',
    makeJa: 'いすゞ',
    model: 'Giga',
    modelJa: 'ギガ (10t大型)',
    era: 'modern',
    year: '2024',
    type: 'truck_10t',
    bodyStyle: 'wing_body',
    photoUrl: '/images/presets/isuzu_giga.jpg',
    specs: { height: '3.78', width: '2.49', length: '11.98', weight: '24.95' }
  },
  {
    id: 'isuzu_elf_2t',
    make: 'Isuzu',
    makeJa: 'いすゞ',
    model: 'Elf',
    modelJa: 'エルフ (2t/3t小型)',
    era: 'modern',
    year: '2023',
    type: 'truck_2t',
    bodyStyle: 'box_truck',
    photoUrl: '/images/presets/isuzu_giga.jpg',
    specs: { height: '2.80', width: '1.89', length: '4.69', weight: '4.95' }
  },
  {
    id: 'isuzu_forward_4t',
    make: 'Isuzu',
    makeJa: 'いすゞ',
    model: 'Forward',
    modelJa: 'フォワード (4t中型)',
    era: 'modern',
    year: '2023',
    type: 'truck_4t',
    bodyStyle: 'wing_body',
    photoUrl: '/images/presets/isuzu_giga.jpg',
    specs: { height: '3.45', width: '2.25', length: '8.45', weight: '7.95' }
  },
  {
    id: 'isuzu_tx_classic',
    make: 'Isuzu',
    makeJa: 'いすゞ',
    model: 'TX Truck (1963)',
    modelJa: 'TX型 ボンネットトラック (1963)',
    era: 'classic',
    year: '1963',
    type: 'truck_4t',
    bodyStyle: 'flatbed',
    photoUrl: '/images/presets/isuzu_giga.jpg',
    specs: { height: '2.40', width: '2.10', length: '6.80', weight: '5.50' }
  },

  // --- HINO ---
  {
    id: 'hino_profia_10t',
    make: 'Hino',
    makeJa: '日野',
    model: 'Profia',
    modelJa: 'プロフィア (10t大型)',
    era: 'modern',
    year: '2024',
    type: 'truck_10t',
    bodyStyle: 'wing_body',
    photoUrl: '/images/presets/hino_profia.jpg',
    specs: { height: '3.75', width: '2.49', length: '11.95', weight: '24.80' }
  },
  {
    id: 'hino_ranger_4t',
    make: 'Hino',
    makeJa: '日野',
    model: 'Ranger',
    modelJa: 'レンジャー (4t中型)',
    era: 'modern',
    year: '2022',
    type: 'truck_4t',
    bodyStyle: 'wing_body',
    photoUrl: '/images/presets/hino_profia.jpg',
    specs: { height: '3.40', width: '2.25', length: '8.40', weight: '7.90' }
  },
  {
    id: 'hino_super_dolphin',
    make: 'Hino',
    makeJa: '日野',
    model: 'Super Dolphin (1985)',
    modelJa: 'スーパードルフィン (1985)',
    era: 'jdm_golden',
    year: '1985',
    type: 'truck_10t',
    bodyStyle: 'flatbed',
    photoUrl: '/images/presets/hino_profia.jpg',
    specs: { height: '3.50', width: '2.49', length: '11.50', weight: '22.00' }
  },

  // --- MITSUBISHI FUSO ---
  {
    id: 'fuso_supergreat_10t',
    make: 'Mitsubishi Fuso',
    makeJa: '三菱ふそう',
    model: 'Super Great',
    modelJa: 'スーパーグレート (10t大型)',
    era: 'modern',
    year: '2024',
    type: 'truck_10t',
    bodyStyle: 'wing_body',
    photoUrl: '/images/presets/fuso_supergreat.jpg',
    specs: { height: '3.78', width: '2.49', length: '11.98', weight: '24.90' }
  },
  {
    id: 'fuso_canter_2t',
    make: 'Mitsubishi Fuso',
    makeJa: '三菱ふそう',
    model: 'Canter',
    modelJa: 'キャンター (2t小型)',
    era: 'modern',
    year: '2023',
    type: 'truck_2t',
    bodyStyle: 'box_truck',
    photoUrl: '/images/presets/fuso_supergreat.jpg',
    specs: { height: '2.75', width: '1.89', length: '4.69', weight: '4.85' }
  },
  {
    id: 'fuso_t951_classic',
    make: 'Mitsubishi Fuso',
    makeJa: '三菱ふそう',
    model: 'Fuso T951 (1972)',
    modelJa: 'FUSO T951 大型ダンプ (1972)',
    era: 'classic',
    year: '1972',
    type: 'truck_10t',
    bodyStyle: 'dump_truck',
    photoUrl: '/images/presets/fuso_supergreat.jpg',
    specs: { height: '3.20', width: '2.45', length: '7.80', weight: '16.00' }
  },

  // --- TOYOTA ---
  {
    id: 'toyota_hiace_van',
    make: 'Toyota',
    makeJa: 'トヨタ',
    model: 'HiAce',
    modelJa: 'ハイエース (商用バン)',
    era: 'modern',
    year: '2024',
    type: 'car',
    bodyStyle: 'van',
    photoUrl: '/images/presets/toyota_hiace.jpg',
    specs: { height: '1.98', width: '1.69', length: '4.69', weight: '1.92' }
  },
  {
    id: 'toyota_harrier_suv',
    make: 'Toyota',
    makeJa: 'トヨタ',
    model: 'Harrier',
    modelJa: 'ハリアー (高級SUV)',
    era: 'modern',
    year: '2024',
    type: 'car',
    bodyStyle: 'suv',
    photoUrl: '/images/presets/toyota_harrier.jpg',
    specs: { height: '1.69', width: '1.85', length: '4.74', weight: '1.70' }
  },
  {
    id: 'toyota_ae86_trueno',
    make: 'Toyota',
    makeJa: 'トヨタ',
    model: 'Sprinter Trueno AE86 (1983)',
    modelJa: 'スプリンタートレノ AE86 (1983)',
    era: 'jdm_golden',
    year: '1983',
    type: 'car',
    bodyStyle: 'hatchback',
    photoUrl: '/images/presets/nissan_skyline.jpg',
    specs: { height: '1.33', width: '1.62', length: '4.20', weight: '0.96' }
  },
  {
    id: 'toyota_supra_jza80',
    make: 'Toyota',
    makeJa: 'トヨタ',
    model: 'Supra RZ JZA80 (1993)',
    modelJa: 'スープラ RZ JZA80 (1993)',
    era: 'jdm_golden',
    year: '1993',
    type: 'car',
    bodyStyle: 'hatchback',
    photoUrl: '/images/presets/nissan_skyline.jpg',
    specs: { height: '1.27', width: '1.81', length: '4.52', weight: '1.51' }
  },

  // --- NISSAN ---
  {
    id: 'nissan_skyline_gt',
    make: 'Nissan',
    makeJa: '日産',
    model: 'Skyline Sedan',
    modelJa: 'スカイライン (セダン)',
    era: 'modern',
    year: '2023',
    type: 'car',
    bodyStyle: 'sedan',
    photoUrl: '/images/presets/nissan_skyline.jpg',
    specs: { height: '1.44', width: '1.82', length: '4.81', weight: '1.68' }
  },
  {
    id: 'nissan_gtr_r34',
    make: 'Nissan',
    makeJa: '日産',
    model: 'Skyline GT-R BNR34 (1999)',
    modelJa: 'スカイライン GT-R BNR34 (1999)',
    era: 'jdm_golden',
    year: '1999',
    type: 'car',
    bodyStyle: 'sedan',
    photoUrl: '/images/presets/nissan_skyline.jpg',
    specs: { height: '1.36', width: '1.78', length: '4.60', weight: '1.56' }
  },

  // --- HONDA ---
  {
    id: 'honda_nsx_na1',
    make: 'Honda',
    makeJa: 'ホンダ',
    model: 'NSX NA1 (1990)',
    modelJa: 'NSX NA1 (1990)',
    era: 'jdm_golden',
    year: '1990',
    type: 'car',
    bodyStyle: 'sedan',
    photoUrl: '/images/presets/nissan_skyline.jpg',
    specs: { height: '1.17', width: '1.81', length: '4.43', weight: '1.35' }
  },

  // --- MAZDA ---
  {
    id: 'mazda_rx7_fd3s',
    make: 'Mazda',
    makeJa: 'マツダ',
    model: 'RX-7 FD3S (1992)',
    modelJa: 'RX-7 FD3S ロータリー (1992)',
    era: 'jdm_golden',
    year: '1992',
    type: 'car',
    bodyStyle: 'hatchback',
    photoUrl: '/images/presets/nissan_skyline.jpg',
    specs: { height: '1.23', width: '1.76', length: '4.28', weight: '1.26' }
  },
  {
    id: 'mazda_cosmo_classic',
    make: 'Mazda',
    makeJa: 'マツダ',
    model: 'Cosmo Sport 110S (1967)',
    modelJa: 'コスモスポーツ 110S (1967)',
    era: 'classic',
    year: '1967',
    type: 'car',
    bodyStyle: 'sedan',
    photoUrl: '/images/presets/nissan_skyline.jpg',
    specs: { height: '1.16', width: '1.59', length: '4.14', weight: '0.94' }
  }
];

export function queryJapaneseVehicles({ make = 'all', era = 'all', search = '' } = {}) {
  return JAPANESE_VEHICLE_DATABASE.filter(veh => {
    if (make && make !== 'all' && veh.make.toLowerCase() !== make.toLowerCase()) return false;
    if (era && era !== 'all' && veh.era !== era) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchMake = veh.make.toLowerCase().includes(q) || veh.makeJa.includes(q);
      const matchModel = veh.model.toLowerCase().includes(q) || veh.modelJa.includes(q);
      if (!matchMake && !matchModel) return false;
    }
    return true;
  });
}
