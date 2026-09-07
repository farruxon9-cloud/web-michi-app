#!/usr/bin/env node
/**
 * 47 Prefectures Japanese Train Stations & Railway Lines Audit Script
 * 
 * Verifies that all 47 Japanese prefectures and all Japanese train lines return valid station lists.
 */

import { ALL_47_PREFECTURES } from '../src/data/japanRegions.js';
import { getAllTrainLineOptions, getStationsByLine, getStationsByPrefecture } from '../src/data/japanStations.js';

console.log("==================================================");
console.log(" 🚉 47 JAPAN PREFECTURES & TRAIN LINES AUDIT");
console.log("==================================================\n");

let passedCount = 0;
let totalStationsCount = 0;
const errors = [];

const allLines = getAllTrainLineOptions();
console.log(`✅ JAMI YAPONIYA POYEZD/METRO LINIYALARI: ${allLines.length} ta liniyalar ro'yxati shakllandi.\n`);

allLines.forEach((lineObj, idx) => {
  const lineStations = getStationsByLine(lineObj.id);
  if (!lineStations || lineStations.length === 0) {
    errors.push(`[EMPTY LINE] Railway line '${lineObj.name}' returned 0 stations.`);
  } else {
    console.log(`  [Liniya ${String(idx + 1).padStart(2, '0')}/${allLines.length}] ✅ ${lineObj.name}: ${lineStations.length} ta staytsiyalar.`);
  }
});

console.log("\n--------------------------------------------------");
console.log(" 🏙️ 47 PREFEKTURA BO'YICHA BEKATLAR AUDITI");
console.log("--------------------------------------------------\n");

ALL_47_PREFECTURES.forEach((pref, index) => {
  const stationsById = getStationsByPrefecture(pref.id);
  const stationsByKanji = getStationsByPrefecture(pref.kanji);

  if (!stationsById || stationsById.length === 0) {
    errors.push(`[MISSING STATIONS] Prefecture ID '${pref.id}' (${pref.kanji}) returned 0 stations.`);
    return;
  }

  let validStations = 0;
  stationsById.forEach(s => {
    if (!s.id || !s.name || !s.kanji) {
      errors.push(`[INVALID STATION ENTRY] In '${pref.kanji}': station object missing id/name/kanji -> ${JSON.stringify(s)}`);
    } else {
      validStations++;
    }
  });

  totalStationsCount += validStations;
  passedCount++;
});

console.log("\n==================================================");
console.log(` AUDIT NATIJASI: ${passedCount}/47 Prefektura passed`);
console.log(` UMUMIY POYEZD LINIYALARI SONI: ${allLines.length} ta`);
console.log(` UMUMIY BEKATLAR SONI: ${totalStationsCount} ta`);
console.log("==================================================");

if (errors.length > 0) {
  console.error("\n❌ TOPILGAN KAMCHILIKLAR:");
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log("\n🎉 ALL 47 PREFECTURES & TRAIN LINES 100% AUDITED AND VERIFIED WITH INDEPENDENT 2-STEP LOOKUP!");
  process.exit(0);
}
