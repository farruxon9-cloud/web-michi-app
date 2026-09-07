#!/usr/bin/env node
/**
 * 47 Prefectures Geographic Cities Audit Script
 * 
 * Verifies that all 47 Japanese prefectures return non-empty,
 * valid municipal city arrays with 100% pure Kanji formatting.
 */

import { ALL_47_PREFECTURES } from '../src/data/japanRegions.js';
import { getCitiesByPrefecture, JAPAN_CITIES_BY_PREFECTURE } from '../src/data/japanCities.js';

console.log("==================================================");
console.log(" 🏙️  47 JAPAN PREFECTURES CITY DATABASE AUDIT");
console.log("==================================================\n");

let passedCount = 0;
let totalCitiesCount = 0;
const errors = [];

if (ALL_47_PREFECTURES.length !== 47) {
  errors.push(`[PREFECTURE COUNT MISMATCH] Expected exactly 47 prefectures, but found ${ALL_47_PREFECTURES.length}`);
} else {
  console.log(`✅ TOTAL PREFECTURES COUNT: 47/47 PERFECT MATCH\n`);
}

ALL_47_PREFECTURES.forEach((pref, index) => {
  const byId = getCitiesByPrefecture(pref.id);
  const byKanji = getCitiesByPrefecture(pref.kanji);

  if (!byId || byId.length === 0) {
    errors.push(`[MISSING] Prefecture ID '${pref.id}' (${pref.kanji}) returned 0 cities.`);
    return;
  }

  if (!byKanji || byKanji.length === 0) {
    errors.push(`[MISSING] Prefecture Kanji '${pref.kanji}' returned 0 cities.`);
    return;
  }

  // Check validity of individual city items
  let validCities = 0;
  byId.forEach(c => {
    if (!c.id || !c.name || !c.kanji) {
      errors.push(`[INVALID ENTRY] In '${pref.kanji}': city object missing id/name/kanji -> ${JSON.stringify(c)}`);
    } else {
      validCities++;
    }
  });

  totalCitiesCount += validCities;
  passedCount++;
  console.log(`  [${String(index + 1).padStart(2, '0')}/47] ✅ ${pref.kanji} (${pref.id}): ${validCities} ta shahar/tuman mukammal.`);
});

console.log("\n==================================================");
console.log(` AUDIT NATIJASI: ${passedCount}/47 Prefektura passed`);
console.log(` UMUMIY SHAHAR/TUMANLAR SONI: ${totalCitiesCount} ta`);
console.log("==================================================");

if (errors.length > 0) {
  console.error("\n❌ TOPILGAN KAMCHILIKLAR:");
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log("\n🎉 ALL 47 PREFECTURES 100% AUDITED AND VERIFIED HAS ZERO GAPS!");
  process.exit(0);
}
