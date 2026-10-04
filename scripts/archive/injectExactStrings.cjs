const fs = require('fs');
let content = fs.readFileSync('src/i18n.js', 'utf8');

const missingJA = {
  '08:00 - 17:00 (Kunduzgi)': '08:00 - 17:00 (昼間)',
  '20:00 - 05:00 (Tungi)': '20:00 - 05:00 (夜間)',
  'Smenali ish (Jadval)': 'シフト制',
  'Erkin grafik': 'フレックスタイム制',
  'Boshqa': 'その他',
  'Shanba va Yakshanba': '土日休み',
  'Haftada 2 kun (Smenali)': '週休2日（シフト制）',
  'Haftada 1 kun': '週休1日',
  'To\\'liq ijtimoiy sug\\'urta': '社会保険完備',
  'Koyo Hoken (Bandlik)': '雇用保険のみ',
  'Yo\\'q': 'なし',
  'Viza yordami bor (Sponsorship)': 'ビザサポートあり',
  'Faqat PR / Teijusha': '永住者・定住者のみ',
  'Barcha chet elliklar qabul': '外国籍歓迎',
  'Yapon tilini bilish N3+': '日本語N3以上',
  'Yotoqxona mavjud': '寮あり',
  'Ijara yordami bor (Yachin hojo)': '家賃補助あり',
  'Ko\\'chib kelish to\\'lanadi': '引越し費用補助',
  'Futsu (Oddiy)': '普通自動車',
  'Chugata (O\\'rta yuk)': '中型自動車',
  'Oogata (Katta yuk)': '大型自動車',
  'Tokushu (Maxsus)': '特殊車両',
  'Forklift': 'フォークリフト',
  'Talab qilinmaydi': '不問',
  'Oogata': '大型自動車',
  'Chugata': '中型自動車',
  'Futsu': '普通自動車',
  'Tokushu': '特殊車両',
  'Nirin': '二輪自動車',
  'UZ': 'ウズベク語',
  'JP': '日本語',
  'EN': '英語'
};

const insertIndex = content.indexOf('ja: {');
const targetIndex = content.indexOf('translation: {', insertIndex) + 'translation: {'.length;

let newEntries = '\n';
for (const [k, v] of Object.entries(missingJA)) {
  const safeK = k.replace(/'/g, "\\'");
  newEntries += `      '${safeK}': '${v}',\n`;
}

content = content.substring(0, targetIndex) + newEntries + content.substring(targetIndex);

fs.writeFileSync('src/i18n.js', content, 'utf8');
console.log('Successfully injected exact string translations safely.');
