/**
 * Vehicle Database Integrity Validator
 * ====================================
 * Bu skript japaneseVehiclesMaster.js ma'lumotlar bazasini
 * qat'iy mezonlar bo'yicha tekshiradi.
 * 
 * Ishga tushirish: node scripts/validate_vehicle_db.mjs
 * 
 * Agent har bir commit dan OLDIN shu skriptni ishga tushirishi SHART.
 * Agar ❌ xatolik chiqsa — commit qilish TAQIQLANADI.
 */

import { MASTER_VEHICLE_DATABASE, JAPANESE_AUTOMAKERS_MASTER } from '../src/data/japaneseVehiclesMaster.js';

// ═══════════════════════════════════════════════
// KONFIGURATSIYA — maqsadli mezonlar
// ═══════════════════════════════════════════════
const MIN_TOTAL_MODELS = 50;        // Minimal jami modellar soni
const MIN_MODELS_PER_BRAND = 1;     // Har bir brend uchun minimal modellar
const VALID_ERAS = ['classic', 'jdm_golden', 'modern'];
const REQUIRED_FIELDS = ['id', 'make', 'makeJa', 'model', 'modelJa', 'era', 'year', 'type', 'bodyStyle'];

// Brend nomlari ro'yxati (JAPANESE_AUTOMAKERS_MASTER dan 'all' ni chiqarib)
const REQUIRED_BRANDS = JAPANESE_AUTOMAKERS_MASTER
  .filter(b => b.id !== 'all')
  .map(b => b.name);

let errors = 0;
let warnings = 0;

function logPass(msg) { console.log(`✅ ${msg}`); }
function logFail(msg) { console.error(`❌ ${msg}`); errors++; }
function logWarn(msg) { console.warn(`⚠️  ${msg}`); warnings++; }

console.log('');
console.log('══════════════════════════════════════════════════');
console.log('  🔍 Vehicle Database Integrity Validator');
console.log('══════════════════════════════════════════════════');
console.log('');

// ═══════════════════════════════════════════════
// TEST 1: Jami modellar soni
// ═══════════════════════════════════════════════
if (MASTER_VEHICLE_DATABASE.length >= MIN_TOTAL_MODELS) {
  logPass(`Jami modellar: ${MASTER_VEHICLE_DATABASE.length} (minimum ${MIN_TOTAL_MODELS})`);
} else {
  logFail(`Jami modellar: ${MASTER_VEHICLE_DATABASE.length} — minimum ${MIN_TOTAL_MODELS} kerak!`);
}

// ═══════════════════════════════════════════════
// TEST 2: Har bir brend kamida N ta modelga ega
// ═══════════════════════════════════════════════
const brandCounts = {};
MASTER_VEHICLE_DATABASE.forEach(v => {
  brandCounts[v.make] = (brandCounts[v.make] || 0) + 1;
});

let allBrandsOk = true;
for (const brand of REQUIRED_BRANDS) {
  const count = brandCounts[brand] || 0;
  if (count < MIN_MODELS_PER_BRAND) {
    logFail(`${brand}: ${count} model — minimum ${MIN_MODELS_PER_BRAND} kerak!`);
    allBrandsOk = false;
  }
}
if (allBrandsOk) {
  logPass(`Barcha ${REQUIRED_BRANDS.length} brend kamida ${MIN_MODELS_PER_BRAND} ta modelga ega`);
}

// ═══════════════════════════════════════════════
// TEST 3: Dublikat ID tekshiruvi
// ═══════════════════════════════════════════════
const idSet = new Set();
let duplicateIds = [];
MASTER_VEHICLE_DATABASE.forEach(v => {
  if (idSet.has(v.id)) {
    duplicateIds.push(v.id);
  }
  idSet.add(v.id);
});

if (duplicateIds.length === 0) {
  logPass('Dublikat ID topilmadi');
} else {
  logFail(`Dublikat ID lar topildi: ${duplicateIds.join(', ')}`);
}

// ═══════════════════════════════════════════════
// TEST 4: Majburiy maydonlar tekshiruvi
// ═══════════════════════════════════════════════
let missingFields = [];
MASTER_VEHICLE_DATABASE.forEach((v, i) => {
  for (const field of REQUIRED_FIELDS) {
    if (!v[field] && v[field] !== 0) {
      missingFields.push(`[${i}] ${v.id || 'NO_ID'}: "${field}" maydoni yo'q`);
    }
  }
});

if (missingFields.length === 0) {
  logPass('Barcha majburiy maydonlar mavjud');
} else {
  logFail(`${missingFields.length} ta yetishmayotgan maydon:`);
  missingFields.slice(0, 10).forEach(m => console.error(`   → ${m}`));
  if (missingFields.length > 10) console.error(`   ... va yana ${missingFields.length - 10} ta`);
}

// ═══════════════════════════════════════════════
// TEST 5: Era qiymatlari tekshiruvi
// ═══════════════════════════════════════════════
let invalidEras = [];
MASTER_VEHICLE_DATABASE.forEach(v => {
  if (!VALID_ERAS.includes(v.era)) {
    invalidEras.push(`${v.id}: era="${v.era}" — faqat ${VALID_ERAS.join(', ')} ruxsat etiladi`);
  }
});

if (invalidEras.length === 0) {
  logPass('Barcha era qiymatlari to\'g\'ri');
} else {
  logFail(`${invalidEras.length} ta noto'g'ri era qiymati:`);
  invalidEras.forEach(e => console.error(`   → ${e}`));
}

// ═══════════════════════════════════════════════
// TEST 6: Rasm mosligi tekshiruvi (ogohlantirish)
// ═══════════════════════════════════════════════
let imageMismatches = [];
MASTER_VEHICLE_DATABASE.forEach(v => {
  if (!v.photoUrl) return;
  const isTruck = v.type && v.type.includes('truck');
  const isSedanImage = v.photoUrl.includes('skyline');
  if (isTruck && isSedanImage) {
    imageMismatches.push(`${v.make} ${v.model}: yuk mashina uchun sedan rasmi ishlatilmoqda`);
  }
});

if (imageMismatches.length === 0) {
  logPass('Rasm-tur mosligi tekshirildi — muammo yo\'q');
} else {
  logWarn(`${imageMismatches.length} ta model noto'g'ri rasm ishlatmoqda:`);
  imageMismatches.forEach(m => console.warn(`   → ${m}`));
}

// ═══════════════════════════════════════════════
// TEST 7: photoUrl dublikat tekshiruvi (ogohlantirish)
// ═══════════════════════════════════════════════
const photoUrlCounts = {};
MASTER_VEHICLE_DATABASE.forEach(v => {
  if (v.photoUrl) {
    photoUrlCounts[v.photoUrl] = (photoUrlCounts[v.photoUrl] || 0) + 1;
  }
});
const overusedPhotos = Object.entries(photoUrlCounts).filter(([, count]) => count > 5);
if (overusedPhotos.length === 0) {
  logPass('Hech bir rasm 5 dan ortiq modelda ishlatilmagan');
} else {
  logWarn(`${overusedPhotos.length} ta rasm 5+ modelda ishlatilmoqda:`);
  overusedPhotos.forEach(([url, count]) => {
    console.warn(`   → ${url} — ${count} ta modelda`);
  });
}

// ═══════════════════════════════════════════════
// YAKUNIY NATIJA
// ═══════════════════════════════════════════════
console.log('');
console.log('──────────────────────────────────────────────────');

// Brend statistikasi
console.log('📊 Brend statistikasi:');
Object.entries(brandCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([brand, count]) => {
    console.log(`   ${brand}: ${count} model`);
  });

// Yo'q brendlar
const missingBrands = REQUIRED_BRANDS.filter(b => !brandCounts[b]);
if (missingBrands.length > 0) {
  console.log(`   ⚠️  Yo'q brendlar: ${missingBrands.join(', ')}`);
}

// Era statistikasi
const eraCounts = {};
MASTER_VEHICLE_DATABASE.forEach(v => {
  eraCounts[v.era] = (eraCounts[v.era] || 0) + 1;
});
console.log('');
console.log('📊 Davr statistikasi:');
Object.entries(eraCounts).forEach(([era, count]) => {
  console.log(`   ${era}: ${count} model`);
});

console.log('');
console.log('──────────────────────────────────────────────────');

if (errors === 0 && warnings === 0) {
  console.log('');
  console.log('🎉 ✅ BARCHA TEKSHIRUVLAR O\'TDI — commit ruxsat etiladi!');
  console.log('');
  process.exit(0);
} else if (errors === 0) {
  console.log('');
  console.log(`⚠️  ${warnings} ta ogohlantirish bor, lekin xatolik yo'q.`);
  console.log('📝 Ogohlantirishlar tuzatilishi tavsiya qilinadi, lekin commit mumkin.');
  console.log('');
  process.exit(0);
} else {
  console.log('');
  console.log(`🚨 ${errors} ta XATOLIK, ${warnings} ta ogohlantirish topildi.`);
  console.log('❌ Commit TAQIQLANADI. Avval xatoliklarni tuzating.');
  console.log('');
  process.exit(1);
}
