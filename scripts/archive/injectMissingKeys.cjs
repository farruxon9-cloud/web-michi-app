const fs = require('fs');
let content = fs.readFileSync('src/i18n.js', 'utf8');

const missingJA = {
  wh_day: "08:00 - 17:00 (昼間)",
  wh_night: "20:00 - 05:00 (夜間)",
  wh_shift: "シフト制",
  wh_flex: "フレックスタイム制",
  wh_other: "その他",
  do_weekend: "土日休み",
  do_2days: "週休2日（シフト制）",
  do_1day: "週休1日",
  do_other: "その他",
  ins_full: "社会保険完備",
  ins_koyo: "雇用保険のみ",
  ins_none: "なし",
  for_visa: "ビザサポートあり",
  for_pr: "永住者・定住者のみ",
  for_all: "外国籍歓迎",
  for_n3: "日本語N3以上",
  hou_dorm: "寮あり",
  hou_rent: "家賃補助あり",
  hou_move: "引越し費用補助",
  hou_none: "なし",
  lic_futsu_opt: "普通自動車",
  lic_chugata_opt: "中型自動車",
  lic_oogata_opt: "大型自動車",
  lic_tokushu_opt: "特殊車両",
  lic_forklift_opt: "フォークリフト",
  lic_none_opt: "不問"
};

const insertIndex = content.indexOf('ja: {');
const targetIndex = content.indexOf('translation: {', insertIndex) + 'translation: {'.length;

let newEntries = '\n';
for (const [k, v] of Object.entries(missingJA)) {
  newEntries += `      '${k}': "${v}",\n`;
}

content = content.substring(0, targetIndex) + newEntries + content.substring(targetIndex);

fs.writeFileSync('src/i18n.js', content, 'utf8');
console.log('Successfully injected missing key translations safely.');
