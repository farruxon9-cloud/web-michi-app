const fs = require('fs');

let profile = fs.readFileSync('src/components/Profile.jsx', 'utf8');
const pReplacements = [
  ["Kelib tushgan arizalar", "{t('incomingApps', 'Kelib tushgan arizalar')}"],
  ["Hozircha kompaniyangizga arizalar kelib tushmadi. E'lonlaringizni kuzatib boring.", "{t('noCompanyApps', 'Hozircha kompaniyangizga arizalar kelib tushmadi. E\\'lonlaringizni kuzatib boring.')}"],
  ["Siz hali hech qayerga ishga yoki o'qishga ariza topshirmadingiz. O'zingizga mos ish toping!", "{t('noDriverApps', 'Siz hali hech qayerga ishga yoki o\\'qishga ariza topshirmadingiz. O\\'zingizga mos ish toping!')}"],
  ["Bo'sh ish o'rinlarini ko'rish", "{t('viewJobs', 'Bo\\'sh ish o\\'rinlarini ko\\'rish')}"],
  ["Mening Shoukai'larim", "{t('myShoukai', 'Mening Shoukai\\'larim')}"],
  ["Shoukai Statistikasi", "{t('shoukaiStats', 'Shoukai Statistikasi')}"],
  ["Jami taklif qilinganlar:", "{t('totalReferred', 'Jami taklif qilinganlar:')}"],
  ["Xodimlar (HR)", "{t('employeesHR', 'Xodimlar (HR)')}"],
  [">Yangi xodim qo'shish<", ">{t('addNewEmployee', 'Yangi xodim qo\\'shish')}<"],
  ["placeholder=\"Michi ID (Ixtiyoriy, masalan: #Michi-A1B2)\"", "placeholder={t('michiIdPlaceholder', 'Michi ID (Ixtiyoriy, masalan: #Michi-A1B2)')}"],
  ["placeholder=\"Xodim ismi\"", "placeholder={t('empNamePlaceholder', 'Xodim ismi')}"],
  [">Barcha xodimlar<", ">{t('allEmployees', 'Barcha xodimlar')}<"],
  ["Hali xodimlar qo'shilmagan", "{t('noEmployeesYet', 'Hali xodimlar qo\\'shilmagan')}"],
  [">Qo'shish<", ">{t('addBtn', 'Qo\\'shish')}<"],
  [">Saqlanganlar<", ">{t('savedItemsTitle', 'Saqlanganlar')}<"],
  ["Hozircha hech narsa saqlanmagan", "{t('noSavedItems', 'Hozircha hech narsa saqlanmagan')}"],
  [">Ish e'lonlari<", ">{t('jobAds', 'Ish e\\'lonlari')}<"],
  [">Avtomaktablar<", ">{t('drivingSchools', 'Avtomaktablar')}<"],
  ["Tavsiya qilgan ID:", "{t('referredById', 'Tavsiya qilgan ID:')}"],
  [">To'lov qilish<", ">{t('makePayment', 'To\\'lov qilish')}<"],
  ["> To'landi", "> {t('paidStatus', 'To\\'landi')}"],
  ["To'lov kutilmoqda", "{t('paymentPending', 'To\\'lov kutilmoqda')}"]
];

for (let [s, r] of pReplacements) {
  profile = profile.split(s).join(r);
}
fs.writeFileSync('src/components/Profile.jsx', profile);

let i18n = fs.readFileSync('src/i18n.js', 'utf8');

const additions = {
  uz: "\\n      incomingApps: 'Kelib tushgan arizalar',\\n      noCompanyApps: 'Hozircha kompaniyangizga arizalar kelib tushmadi. E\\'lonlaringizni kuzatib boring.',\\n      noDriverApps: 'Siz hali hech qayerga ishga yoki o\\'qishga ariza topshirmadingiz. O\\'zingizga mos ish toping!',\\n      viewJobs: 'Bo\\'sh ish o\\'rinlarini ko\\'rish',\\n      myShoukai: 'Mening Shoukai\\'larim',\\n      shoukaiStats: 'Shoukai Statistikasi',\\n      totalReferred: 'Jami taklif qilinganlar:',\\n      employeesHR: 'Xodimlar (HR)',\\n      addNewEmployee: 'Yangi xodim qo\\'shish',\\n      michiIdPlaceholder: 'Michi ID (Ixtiyoriy, masalan: #Michi-A1B2)',\\n      empNamePlaceholder: 'Xodim ismi',\\n      allEmployees: 'Barcha xodimlar',\\n      noEmployeesYet: 'Hali xodimlar qo\\'shilmagan',\\n      addBtn: 'Qo\\'shish',\\n      savedItemsTitle: 'Saqlanganlar',\\n      noSavedItems: 'Hozircha hech narsa saqlanmagan',\\n      jobAds: 'Ish e\\'lonlari',\\n      drivingSchools: 'Avtomaktablar',\\n      referredById: 'Tavsiya qilgan ID:',\\n      makePayment: 'To\\'lov qilish',\\n      paidStatus: 'To\\'landi',\\n      paymentPending: 'To\\'lov kutilmoqda',",
  ja: "\\n      incomingApps: '受信した応募',\\n      noCompanyApps: '現在、企業への応募はありません。求人を確認してください。',\\n      noDriverApps: 'まだどこにも応募していません。自分に合った仕事を見つけましょう！',\\n      viewJobs: '求人を見る',\\n      myShoukai: '私の紹介',\\n      shoukaiStats: '紹介統計',\\n      totalReferred: '合計紹介数:',\\n      employeesHR: '従業員 (HR)',\\n      addNewEmployee: '新しい従業員を追加',\\n      michiIdPlaceholder: 'Michi ID (任意、例: #Michi-A1B2)',\\n      empNamePlaceholder: '従業員名',\\n      allEmployees: 'すべての従業員',\\n      noEmployeesYet: 'まだ従業員が追加されていません',\\n      addBtn: '追加',\\n      savedItemsTitle: '保存済み',\\n      noSavedItems: '保存された項目はありません',\\n      jobAds: '求人広告',\\n      drivingSchools: '自動車学校',\\n      referredById: '紹介者 ID:',\\n      makePayment: '支払いを行う',\\n      paidStatus: '支払い済み',\\n      paymentPending: '支払い待ち',",
  en: "\\n      incomingApps: 'Incoming Applications',\\n      noCompanyApps: 'No applications received yet. Keep an eye on your job postings.',\\n      noDriverApps: 'You haven\\'t applied anywhere yet. Find a job that suits you!',\\n      viewJobs: 'View Vacancies',\\n      myShoukai: 'My Shoukai',\\n      shoukaiStats: 'Shoukai Statistics',\\n      totalReferred: 'Total Referred:',\\n      employeesHR: 'Employees (HR)',\\n      addNewEmployee: 'Add New Employee',\\n      michiIdPlaceholder: 'Michi ID (Optional, e.g. #Michi-A1B2)',\\n      empNamePlaceholder: 'Employee Name',\\n      allEmployees: 'All Employees',\\n      noEmployeesYet: 'No employees added yet',\\n      addBtn: 'Add',\\n      savedItemsTitle: 'Saved Items',\\n      noSavedItems: 'Nothing saved yet',\\n      jobAds: 'Job Ads',\\n      drivingSchools: 'Driving Schools',\\n      referredById: 'Referred by ID:',\\n      makePayment: 'Make Payment',\\n      paidStatus: 'Paid',\\n      paymentPending: 'Payment Pending',",
  vi: "\\n      incomingApps: 'Đơn ứng tuyển nhận được',\\n      noCompanyApps: 'Chưa nhận được đơn ứng tuyển nào. Hãy theo dõi các bài đăng của bạn.',\\n      noDriverApps: 'Bạn chưa ứng tuyển ở đâu. Hãy tìm công việc phù hợp!',\\n      viewJobs: 'Xem Việc Làm',\\n      myShoukai: 'Shoukai Của Tôi',\\n      shoukaiStats: 'Thống Kê Shoukai',\\n      totalReferred: 'Tổng số đã giới thiệu:',\\n      employeesHR: 'Nhân Viên (HR)',\\n      addNewEmployee: 'Thêm Nhân Viên Mới',\\n      michiIdPlaceholder: 'Michi ID (Tùy chọn, vd: #Michi-A1B2)',\\n      empNamePlaceholder: 'Tên Nhân Viên',\\n      allEmployees: 'Tất Cả Nhân Viên',\\n      noEmployeesYet: 'Chưa có nhân viên nào được thêm',\\n      addBtn: 'Thêm',\\n      savedItemsTitle: 'Đã Lưu',\\n      noSavedItems: 'Chưa lưu gì cả',\\n      jobAds: 'Việc Làm',\\n      drivingSchools: 'Trường Lái Xe',\\n      referredById: 'Giới thiệu bởi ID:',\\n      makePayment: 'Thanh Toán',\\n      paidStatus: 'Đã thanh toán',\\n      paymentPending: 'Đang chờ thanh toán',",
  zh: "\\n      incomingApps: '收到的申请',\\n      noCompanyApps: '目前尚未收到申请。请关注您的招聘广告。',\\n      noDriverApps: '您还没有申请任何职位。找一份适合您的工作吧！',\\n      viewJobs: '查看职位',\\n      myShoukai: '我的介绍 (Shoukai)',\\n      shoukaiStats: '介绍统计',\\n      totalReferred: '总推荐人数:',\\n      employeesHR: '员工 (HR)',\\n      addNewEmployee: '添加新员工',\\n      michiIdPlaceholder: 'Michi ID (可选，如: #Michi-A1B2)',\\n      empNamePlaceholder: '员工姓名',\\n      allEmployees: '所有员工',\\n      noEmployeesYet: '暂无员工',\\n      addBtn: '添加',\\n      savedItemsTitle: '已保存',\\n      noSavedItems: '暂无保存项',\\n      jobAds: '招聘广告',\\n      drivingSchools: '驾校',\\n      referredById: '推荐人 ID:',\\n      makePayment: '付款',\\n      paidStatus: '已付款',\\n      paymentPending: '等待付款',"
};

for (const [lang, block] of Object.entries(additions)) {
  const marker = new RegExp("(\\\\b" + lang + "\\\\s*:\\s*\\{\\s*translation\\s*:\\s*\\{)");
  i18n = i18n.replace(marker, "$1" + block);
}

fs.writeFileSync('src/i18n.js', i18n);

console.log('Done Profile translations!');
