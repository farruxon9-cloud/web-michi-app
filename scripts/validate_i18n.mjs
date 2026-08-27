#!/usr/bin/env node
/**
 * MichiApp i18n Multi-Language Validator Script
 * 
 * 5 ta til (ja, en, uz, ru, zh) lug'atlarini avtomatik tekshiradi:
 * 1. Barcha tillar bo'yicha kalitlar to'liqligi va tengligi (Dictionary Parity).
 * 2. JSX fayllardagi t('key') va t('key', 'fallback') chaqiruvlarining mavjudligi.
 * 3. Yetishmayotgan kalitlar va tarjimalar bo'yicha aniq hisobot.
 * 
 * Ishlatish: node scripts/validate_i18n.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";

const LOCALES_DIR = 'src/locales';
const LANGUAGES = ['ja', 'en', 'uz', 'ru', 'zh'];

async function run() {
  console.log(`${BOLD}${CYAN}`);
  console.log("══════════════════════════════════════════════");
  console.log("  🌐 i18n Ko'p Tilli Lug'at Validatori");
  console.log("══════════════════════════════════════════════");
  console.log(RESET);

  let errorsCount = 0;
  let warningsCount = 0;

  // 1. LUG'ATLARNI YUKLASH
  const dictionaries = {};

  for (const lang of LANGUAGES) {
    const filePath = resolve(join(LOCALES_DIR, `${lang}.js`));
    try {
      const fileUrl = pathToFileURL(filePath).href;
      const mod = await import(fileUrl);
      const dict = mod.default?.translation || mod.default || {};
      dictionaries[lang] = Object.keys(dict);
    } catch (e) {
      console.log(`${RED}❌ ${lang}.js o'qishda xatolik: ${e.message}${RESET}`);
      errorsCount++;
      dictionaries[lang] = [];
    }
  }

  // 2. PARITY TEKSHIRUVI (Har bir til boshqasi bilan bir xil kalitlarga egami?)
  console.log(`${CYAN}${BOLD}== 1. 5 Ta Til Lug'at Kalitlari Simmetriyasi ==${RESET}`);

  const masterKeysSet = new Set();
  LANGUAGES.forEach(lang => {
    (dictionaries[lang] || []).forEach(k => masterKeysSet.add(k));
  });

  const masterKeys = Array.from(masterKeysSet);
  console.log(`📊 Jami noyob i18n kalitlar soni: ${BOLD}${masterKeys.length}${RESET}`);

  const missingByLang = {};
  LANGUAGES.forEach(lang => {
    const currentSet = new Set(dictionaries[lang] || []);
    const missing = masterKeys.filter(k => !currentSet.has(k));
    missingByLang[lang] = missing;
    if (missing.length === 0) {
      console.log(`${GREEN}✅ ${lang.toUpperCase()}: 100% kalitlar to'liq (${currentSet.size}/${masterKeys.length})${RESET}`);
    } else {
      console.log(`${YELLOW}⚠️  ${lang.toUpperCase()}: ${missing.length} ta kalit yetishmayapti (${currentSet.size}/${masterKeys.length})${RESET}`);
      warningsCount++;
    }
  });

  // 3. JSX KODLARNI SKANIRLASH (`t('key')` kalitlarining mavjudligi)
  console.log(`\n${CYAN}${BOLD}== 2. JSX Fayllarda t('key') Kalitlar Validatsiyasi ==${RESET}`);

  function scanJsxFiles(dir) {
    const jsxFiles = [];
    const items = readdirSync(dir);
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        jsxFiles.push(...scanJsxFiles(fullPath));
      } else if (item.endsWith('.jsx')) {
        jsxFiles.push(fullPath);
      }
    }
    return jsxFiles;
  }

  const allJsxFiles = scanJsxFiles('src');
  const usedKeysInJsx = new Set();

  const tRegex = /\bt\(\s*['"]([^'"]+)['"]/g;

  allJsxFiles.forEach(file => {
    const content = readFileSync(file, 'utf-8');
    let match;
    while ((match = tRegex.exec(content)) !== null) {
      // Dynamic variables like `school_${id}_name` or `lic_${course}` are handled dynamically
      if (!match[1].includes('${')) {
        usedKeysInJsx.add(match[1]);
      }
    }
  });

  console.log(`🔍 JSX fayllarda topilgan statik t('key') kalitlar soni: ${BOLD}${usedKeysInJsx.size}${RESET}`);

  const missingInDicts = [];
  usedKeysInJsx.forEach(key => {
    if (!masterKeysSet.has(key)) {
      missingInDicts.push(key);
    }
  });

  if (missingInDicts.length === 0) {
    console.log(`${GREEN}✅ JSX fayllardagi barcha t('key') kalitlari lug'atda mavjud!${RESET}`);
  } else {
    console.log(`${YELLOW}⚠️  JSX fayllarda ishlatilgan, lekin lug'atlarga kiritilmagan kalitlar (${missingInDicts.length} ta):${RESET}`);
    missingInDicts.slice(0, 10).forEach(k => console.log(`   ${YELLOW}• ${k}${RESET}`));
    if (missingInDicts.length > 10) {
      console.log(`   ... va yana ${missingInDicts.length - 10} ta kalit.`);
    }
    warningsCount++;
  }

  // 4. YAKUNIY NATIJA
  console.log(`\n${BOLD}${CYAN}`);
  console.log("══════════════════════════════════════════════");
  console.log("  YAKUNIY NATIJA");
  console.log("══════════════════════════════════════════════");
  console.log(RESET);

  if (errorsCount === 0 && warningsCount === 0) {
    console.log(`${GREEN}${BOLD}🎉 🎉 BARCHA TILLAR 100% MUKAMMAL VA TENG! CHIQISHGA RUXSAT ETILADI!${RESET}\n`);
    process.exit(0);
  } else if (errorsCount === 0) {
    console.log(`${YELLOW}${BOLD}⚠️  OGOHLANTIRISH: ${warningsCount} ta kichik ogohlantirish bor, lekin xatolik yo'q.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}🚨 XATOLIKLAR ANIQLANDI — i18n lug'atlarini to'ldiring!${RESET}\n`);
    process.exit(1);
  }
}

run();
