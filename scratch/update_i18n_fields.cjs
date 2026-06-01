const fs = require('fs');

const filePath = 'src/i18n.js';
let content = fs.readFileSync(filePath, 'utf8');

// We will replace each language's referralPrompt to include the new keys
const replacements = [
  {
    search: `referralPrompt: "Havola orqali kirdingizmi? Unday bo'lsa tavsiya qilgan odamning ID raqamini kiriting (Simulyatsiya uchun):\\nMasalan: #Michi-A1B2"`,
    replace: `referralPrompt: "Havola orqali kirdingizmi? Unday bo'lsa tavsiya qilgan odamning ID raqamini kiriting (Simulyatsiya uchun):\\nMasalan: #Michi-A1B2",
      livingAddressLabel: "Yashash manzili",
      livingAddressPlaceholder: "Hozirgi manzilingiz (Prefektura, shahar, ko'cha)...",
      educationLabel: "Tugatgan maktab, kollej yoki universitetlari",
      educationPlaceholder: "Tugatgan ta'lim muassasalaringiz (maktab, kollej, OTM)...",
      viewResumeBtn: "Nomzod rezumesini ko'rish (履歴書)",
      hideResumeBtn: "Rezumening yopish"`
  },
  {
    search: `referralPrompt: "紹介リンクからアクセスしましたか？その場合は、紹介者のIDを入力してください（シミュレーション用）：\\n例: #Michi-A1B2"`,
    replace: `referralPrompt: "紹介リンクからアクセスしましたか？その場合は、紹介者のIDを入力してください（シミュレーション用）：\\n例: #Michi-A1B2",
      livingAddressLabel: "現住所（居住地）",
      livingAddressPlaceholder: "現住所を入力してください（都道府県、市区町村、番地等）",
      educationLabel: "学歴（卒業高校・大学・専門学校）",
      educationPlaceholder: "出身校を入力してください（卒業高校、専門学校、大学名等）",
      viewResumeBtn: "履歴書を表示",
      hideResumeBtn: "履歴書を閉じる"`
  },
  {
    search: `referralPrompt: "Did you join via a referral link? If so, enter the referrer's ID (for simulation):\\nExample: #Michi-A1B2"`,
    replace: `referralPrompt: "Did you join via a referral link? If so, enter the referrer's ID (for simulation):\\nExample: #Michi-A1B2",
      livingAddressLabel: "Living Address",
      livingAddressPlaceholder: "Current address (Prefecture, city, street)...",
      educationLabel: "Graduated Schools, Colleges, or Universities",
      educationPlaceholder: "Educational institutions you graduated from...",
      viewResumeBtn: "View Candidate's Resume",
      hideResumeBtn: "Hide Resume"`
  },
  {
    search: `referralPrompt: "Bạn có truy cập từ liên kết giới thiệu? Nếu có, nhập ID người giới thiệu (để mô phỏng):\\nVí dụ: #Michi-A1B2"`,
    replace: `referralPrompt: "Bạn có truy cập từ liên kết giới thiệu? Nếu có, nhập ID người giới thiệu (để mô phỏng):\\nVí dụ: #Michi-A1B2",
      livingAddressLabel: "Địa chỉ cư trú",
      livingAddressPlaceholder: "Địa chỉ hiện tại (Tỉnh/Thành phố, quận/huyện, đường)...",
      educationLabel: "Trường học, Cao đẳng hoặc Đại học đã tốt nghiệp",
      educationPlaceholder: "Các cơ sở giáo dục bạn đã tốt nghiệp...",
      viewResumeBtn: "Xem sơ yếu lý lịch ứng viên",
      hideResumeBtn: "Ẩn sơ yếu lý lịch"`
  },
  {
    search: `referralPrompt: "您是通过推荐链接加入的吗？如果是，请输入推荐人ID（用于模拟）：\\n例如: #Michi-A1B2"`,
    replace: `referralPrompt: "您是通过推荐链接加入的吗？如果是，请输入推荐人ID（用于模拟）：\\n例如: #Michi-A1B2",
      livingAddressLabel: "现居住地",
      livingAddressPlaceholder: "当前住址（都道府县、城市、街道）...",
      educationLabel: "毕业学校（高中、大专、大学）",
      educationPlaceholder: "您毕业的教育机构名称...",
      viewResumeBtn: "查看候选人简历",
      hideResumeBtn: "收起简历"`
  },
  {
    search: `referralPrompt: "के तपाईं सिफारिस लिङ्क मार्फत सामेल हुनुभयो? यदि हो भने, सिफारिसकर्ताको ID प्रविष्ट गर्नुहोस् (सिमुलेशनको लागि):\\nउदाहरण: #Michi-A1B2"`,
    replace: `referralPrompt: "के तपाईं सिफारिस लिङ्क मार्फत सामेल हुनुभयो? यदि हो भने, सिफारिसकर्ताको ID प्रविष्ट गर्नुहोस् (सिमुलेशनको लागि):\\nउदाहरण: #Michi-A1B2",
      livingAddressLabel: "बस्ने ठेगाना (Living Address)",
      livingAddressPlaceholder: "हालको ठेगाना (प्रान्त, शहर, सडक)...",
      educationLabel: "उत्तीर्ण विद्यालय, कलेज वा विश्वविद्यालयहरू",
      educationPlaceholder: "तपाईंले उत्तीर्ण गर्नुभएका शैक्षिक संस्थाहरू...",
      viewResumeBtn: "उम्मेदवारको बायोडाटा (Resume) हेर्नुहोस्",
      hideResumeBtn: "बायोडाटा बन्द गर्नुहोस्"`
  }
];

const normalize = str => str.replace(/\r\n/g, '\n');
let normalizedContent = normalize(content);

let replacedCount = 0;
for (const item of replacements) {
  const normSearch = normalize(item.search);
  const normReplace = normalize(item.replace);
  if (normalizedContent.includes(normSearch)) {
    normalizedContent = normalizedContent.replace(normSearch, normReplace);
    replacedCount++;
  } else {
    console.warn('Could not find search pattern:', normSearch.substring(0, 50));
  }
}

fs.writeFileSync(filePath, normalizedContent, 'utf8');
console.log(`Finished. Replaced ${replacedCount} blocks in i18n.js`);
