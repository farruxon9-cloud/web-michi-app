const fs = require('fs');

const i18nPath = './src/i18n.js';
let content = fs.readFileSync(i18nPath, 'utf8');

const newTrans = {
  uz: `
      // Dashboard Banner
      heroSlide1Badge: "🔥 Bonus",
      heroSlide1Title: "Shoukai Pulini Oling",
      heroSlide1Desc: "Tanishlaringizni ishga taklif qiling, maxsus shoukai pul mukofotini oling!",
      heroSlide2Badge: "⏳ Tez kunda",
      heroSlide2Title: "Navbatlarsiz Servis",
      heroSlide2Desc: "Avtoservislarga oldindan navbat oling va to'lov qiling. Vaqtingizni tejang!",
      heroSlide3Badge: "💼 Vakansiyalar",
      heroSlide3Title: "Orzuingizdagi Ish",
      heroSlide3Desc: "Eng so'nggi va yuqori maoshli vakansiyalarni birinchilardan bo'lib toping.",`,
  ja: `
      // Dashboard Banner
      heroSlide1Badge: "🔥 ボーナス",
      heroSlide1Title: "紹介ボーナスをゲット",
      heroSlide1Desc: "友達を仕事に紹介して、特別な紹介ボーナスを受け取りましょう！",
      heroSlide2Badge: "⏳ 近日公開",
      heroSlide2Title: "待ち時間なしのサービス",
      heroSlide2Desc: "事前にカーサービスを予約して支払いを済ませましょう。時間を節約！",
      heroSlide3Badge: "💼 求人",
      heroSlide3Title: "理想の仕事",
      heroSlide3Desc: "最新の高時給求人をいち早く見つけましょう。",`,
  en: `
      // Dashboard Banner
      heroSlide1Badge: "🔥 Bonus",
      heroSlide1Title: "Get Shoukai Bonus",
      heroSlide1Desc: "Invite your friends to work and receive a special shoukai bonus!",
      heroSlide2Badge: "⏳ Coming Soon",
      heroSlide2Title: "Queue-free Service",
      heroSlide2Desc: "Book car services and pay in advance. Save your time!",
      heroSlide3Badge: "💼 Vacancies",
      heroSlide3Title: "Your Dream Job",
      heroSlide3Desc: "Be the first to find the latest and highest paying job vacancies.",`,
  vi: `
      // Dashboard Banner
      heroSlide1Badge: "🔥 Tiền thưởng",
      heroSlide1Title: "Nhận tiền thưởng Shoukai",
      heroSlide1Desc: "Mời bạn bè làm việc và nhận tiền thưởng shoukai đặc biệt!",
      heroSlide2Badge: "⏳ Sắp ra mắt",
      heroSlide2Title: "Dịch vụ không phải chờ đợi",
      heroSlide2Desc: "Đặt trước dịch vụ xe và thanh toán trước. Tiết kiệm thời gian!",
      heroSlide3Badge: "💼 Việc làm",
      heroSlide3Title: "Công việc mơ ước",
      heroSlide3Desc: "Hãy là người đầu tiên tìm thấy các công việc mới nhất và lương cao.",`,
  zh: `
      // Dashboard Banner
      heroSlide1Badge: "🔥 奖金",
      heroSlide1Title: "获得介绍奖金",
      heroSlide1Desc: "邀请朋友工作，即可获得特别的介绍奖金！",
      heroSlide2Badge: "⏳ 敬请期待",
      heroSlide2Title: "免排队服务",
      heroSlide2Desc: "提前预约汽车服务并付款。节省您的时间！",
      heroSlide3Badge: "💼 招聘信息",
      heroSlide3Title: "理想的工作",
      heroSlide3Desc: "第一时间找到最新、高薪的招聘信息。",`,
  ru: `
      // Dashboard Banner
      heroSlide1Badge: "🔥 Бонус",
      heroSlide1Title: "Получите Shoukai Бонус",
      heroSlide1Desc: "Пригласите друзей на работу и получите специальный бонус Shoukai!",
      heroSlide2Badge: "⏳ Скоро",
      heroSlide2Title: "Сервис без очередей",
      heroSlide2Desc: "Бронируйте автосервисы и оплачивайте заранее. Экономьте свое время!",
      heroSlide3Badge: "💼 Вакансии",
      heroSlide3Title: "Работа мечты",
      heroSlide3Desc: "Узнавайте первыми о новых и высокооплачиваемых вакансиях.",`
};

for (const lang of ['uz', 'ja', 'en', 'vi', 'zh', 'ru']) {
  // Regex to match "lang: { translation: {"
  const regex = new RegExp(\`(\${lang}:\\\\s*\\\\{\\\\s*translation:\\\\s*\\\\{)\`, 'g');
  content = content.replace(regex, \`$1\${newTrans[lang]}\`);
}

fs.writeFileSync(i18nPath, content, 'utf8');
console.log('Injected translations.');
