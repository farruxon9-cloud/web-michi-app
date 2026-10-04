const fs = require('fs');

const i18nPath = './src/i18n.js';
let content = fs.readFileSync(i18nPath, 'utf8');

const newTrans = {
  uz: '\n      // Dashboard Banner\n      heroSlide1Badge: "🔥 Bonus",\n      heroSlide1Title: "Shoukai Pulini Oling",\n      heroSlide1Desc: "Tanishlaringizni ishga taklif qiling, maxsus shoukai pul mukofotini oling!",\n      heroSlide2Badge: "⏳ Tez kunda",\n      heroSlide2Title: "Navbatlarsiz Servis",\n      heroSlide2Desc: "Avtoservislarga oldindan navbat oling va to\'lov qiling. Vaqtingizni tejang!",\n      heroSlide3Badge: "💼 Vakansiyalar",\n      heroSlide3Title: "Orzuingizdagi Ish",\n      heroSlide3Desc: "Eng so\'nggi va yuqori maoshli vakansiyalarni birinchilardan bo\'lib toping.",',
  ja: '\n      // Dashboard Banner\n      heroSlide1Badge: "🔥 ボーナス",\n      heroSlide1Title: "紹介ボーナスをゲット",\n      heroSlide1Desc: "友達を仕事に紹介して、特別な紹介ボーナスを受け取りましょう！",\n      heroSlide2Badge: "⏳ 近日公開",\n      heroSlide2Title: "待ち時間なしのサービス",\n      heroSlide2Desc: "事前にカーサービスを予約して支払いを済ませましょう。時間を節約！",\n      heroSlide3Badge: "💼 求人",\n      heroSlide3Title: "理想の仕事",\n      heroSlide3Desc: "最新の高時給求人をいち早く見つけましょう。",',
  en: '\n      // Dashboard Banner\n      heroSlide1Badge: "🔥 Bonus",\n      heroSlide1Title: "Get Shoukai Bonus",\n      heroSlide1Desc: "Invite your friends to work and receive a special shoukai bonus!",\n      heroSlide2Badge: "⏳ Coming Soon",\n      heroSlide2Title: "Queue-free Service",\n      heroSlide2Desc: "Book car services and pay in advance. Save your time!",\n      heroSlide3Badge: "💼 Vacancies",\n      heroSlide3Title: "Your Dream Job",\n      heroSlide3Desc: "Be the first to find the latest and highest paying job vacancies.",',
  vi: '\n      // Dashboard Banner\n      heroSlide1Badge: "🔥 Tiền thưởng",\n      heroSlide1Title: "Nhận tiền thưởng Shoukai",\n      heroSlide1Desc: "Mời bạn bè làm việc và nhận tiền thưởng shoukai đặc biệt!",\n      heroSlide2Badge: "⏳ Sắp ra mắt",\n      heroSlide2Title: "Dịch vụ không phải chờ đợi",\n      heroSlide2Desc: "Đặt trước dịch vụ xe và thanh toán trước. Tiết kiệm thời gian!",\n      heroSlide3Badge: "💼 Việc làm",\n      heroSlide3Title: "Công việc mơ ước",\n      heroSlide3Desc: "Hãy là người đầu tiên tìm thấy các công việc mới nhất và lương cao.",',
  zh: '\n      // Dashboard Banner\n      heroSlide1Badge: "🔥 奖金",\n      heroSlide1Title: "获得介绍奖金",\n      heroSlide1Desc: "邀请朋友工作，即可获得特别的介绍奖金！",\n      heroSlide2Badge: "⏳ 敬请期待",\n      heroSlide2Title: "免排队服务",\n      heroSlide2Desc: "提前预约汽车服务并付款。节省您的时间！",\n      heroSlide3Badge: "💼 招聘信息",\n      heroSlide3Title: "理想的工作",\n      heroSlide3Desc: "第一时间找到最新、高薪的招聘信息。",',
  ru: '\n      // Dashboard Banner\n      heroSlide1Badge: "🔥 Бонус",\n      heroSlide1Title: "Получите Shoukai Бонус",\n      heroSlide1Desc: "Пригласите друзей на работу и получите специальный бонус Shoukai!",\n      heroSlide2Badge: "⏳ Скоро",\n      heroSlide2Title: "Сервис без очередей",\n      heroSlide2Desc: "Бронируйте автосервисы и оплачивайте заранее. Экономьте свое время!",\n      heroSlide3Badge: "💼 Вакансии",\n      heroSlide3Title: "Работа мечты",\n      heroSlide3Desc: "Узнавайте первыми о новых и высокооплачиваемых вакансиях.",'
};

for (const lang of ['uz', 'ja', 'en', 'vi', 'zh', 'ru']) {
  const regex = new RegExp("(" + lang + ":\\s*\\{\\s*translation:\\s*\\{)", 'g');
  content = content.replace(regex, "$1" + newTrans[lang]);
}

fs.writeFileSync(i18nPath, content, 'utf8');
console.log('Injected translations.');
