const fs = require('fs');
let i18nJs = fs.readFileSync('src/i18n.js', 'utf8');

const additions = {
  uz: {
    greeting: "Xush kelibsiz",
    navJobs: "Ish e'lonlari",
    dashJobsDesc: "Eng so'nggi vakansiyalarni ko'rib chiqing",
    dashProfileTitle: "Shaxsiy profil",
    dashProfileDesc: "Ma'lumotlarni yangilash va sozlamalar",
    viewProfileBtn: "Ko'rish",
    guestName: "Mehmon"
  },
  ja: {
    greeting: "ようこそ",
    navJobs: "求人情報",
    dashJobsDesc: "最新の求人を閲覧する",
    dashProfileTitle: "個人プロフィール",
    dashProfileDesc: "詳細と設定を更新する",
    viewProfileBtn: "見る",
    guestName: "ゲスト"
  },
  en: {
    greeting: "Welcome",
    navJobs: "Jobs",
    dashJobsDesc: "Browse the latest vacancies",
    dashProfileTitle: "Personal Profile",
    dashProfileDesc: "Update details and settings",
    viewProfileBtn: "View",
    guestName: "Guest"
  }
};

for (const lang of ['uz', 'ja', 'en']) {
  const marker = `${lang}: {\\n    translation: {`;
  if (i18nJs.includes(marker)) {
    let newEntries = "";
    for (const [key, val] of Object.entries(additions[lang])) {
      if (!i18nJs.includes(`"${key}":`)) {
        newEntries += `      "${key}": "${val}",\n`;
      }
    }
    i18nJs = i18nJs.replace(marker, marker + '\n' + newEntries);
  }
}

fs.writeFileSync('src/i18n.js', i18nJs);
console.log('i18n.js updated with new keys');
