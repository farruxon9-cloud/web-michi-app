const fs = require('fs');
const path = './src/i18n.js';
let content = fs.readFileSync(path, 'utf8');

const newTranslations = {
  uz: {
    navHome: "Asosiy",
    navJobs: "Ishlar",
    navAcademy: "Maktablar",
    navService: "Servis",
    navProfile: "Profil"
  },
  ja: {
    navHome: "ホーム",
    navJobs: "求人",
    navAcademy: "教習所",
    navService: "サービス",
    navProfile: "プロフィール"
  },
  en: {
    navHome: "Home",
    navJobs: "Jobs",
    navAcademy: "Academies",
    navService: "Service",
    navProfile: "Profile"
  },
  vi: {
    navHome: "Trang chủ",
    navJobs: "Việc làm",
    navAcademy: "Trường học",
    navService: "Dịch vụ",
    navProfile: "Hồ sơ"
  },
  zh: {
    navHome: "首页",
    navJobs: "工作",
    navAcademy: "驾校",
    navService: "服务",
    navProfile: "个人资料"
  },
  ne: {
    navHome: "गृह",
    navJobs: "काम",
    navAcademy: "विद्यालय",
    navService: "सेवा",
    navProfile: "प्रोफाइल"
  }
};

for (const [lang, keys] of Object.entries(newTranslations)) {
  const regex = new RegExp(`(${lang}:\\s*\\{\\s*translation:\\s*\\{)`);
  if (regex.test(content)) {
    const keysString = Object.entries(keys).map(([k, v]) => `\n      ${k}: "${v}",`).join('');
    content = content.replace(regex, `$1${keysString}`);
  } else {
    console.warn(`Language ${lang} not found in i18n.js`);
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated i18n.js');
