const fs = require('fs');

let roleSelect = fs.readFileSync('src/components/RoleSelect.jsx', 'utf8');
const rsReplacements = [
  ["<h3>Haydovchi</h3>", "<h3>{t('roleDriverTitle', 'Haydovchi')}</h3>"],
  ["<p>Ish qidirish, akademiyada o'qish va xizmatlar</p>", "<p>{t('roleDriverDesc', 'Ish qidirish, akademiyada o\\'qish va xizmatlar')}</p>"],
  ["<h3>Kompaniya / Maktab</h3>", "<h3>{t('roleCompanyTitle', 'Kompaniya / Maktab')}</h3>"],
  ["<p>E'lon berish, xodimlarni boshqarish</p>", "<p>{t('roleCompanyDesc', 'E\\'lon berish, xodimlarni boshqarish')}</p>"],
  ["<h2>Tizimga kirish</h2>", "<h2>{t('loginTitle', 'Tizimga kirish')}</h2>"],
  ["<h2>Email tasdiqlash</h2>", "<h2>{t('emailVerification', 'Email tasdiqlash')}</h2>"],
  ["Tasdiqlash va Kirish", "{t('verifyAndLogin', 'Tasdiqlash va Kirish')}"],
  ["<label>Jinsingiz</label>", "<label>{t('genderLabel', 'Jinsingiz')}</label>"],
  [">Erkak<", ">{t('male', 'Erkak')}<"],
  [">Ayol<", ">{t('female', 'Ayol')}<"],
  ["<label>Tug'ilgan sana</label>", "<label>{t('dobLabel', 'Tug\\'ilgan sana')}</label>"],
  ["<label>Faoliyat turi</label>", "<label>{t('companyTypeLabel', 'Faoliyat turi')}</label>"],
  ["Kirish</button>", "{t('loginBtn', 'Kirish')}</button>"],
  ["placeholder=\"Kompaniya nomi\"", "placeholder={t('companyNamePlaceholder', 'Kompaniya nomi')}"],
  ["placeholder=\"Lavozim\"", "placeholder={t('positionLabel', 'Lavozim')}"],
  ["placeholder=\"Kompaniya manzili\"", "placeholder={t('companyAddressPlaceholder', 'Kompaniya manzili')}"],
  ["placeholder=\"Mas'ul shaxs ismi\"", "placeholder={t('contactPersonPlaceholder', 'Mas\\'ul shaxs ismi')}"],
  ["placeholder=\"Telefon raqam\"", "placeholder={t('companyPhonePlaceholder', 'Telefon raqam')}"],
  ["placeholder=\"Ishchilar soni\"", "placeholder={t('employeeCountPlaceholder', 'Ishchilar soni')}"],
  ["placeholder=\"Kompaniya haqida qisqacha\"", "placeholder={t('companyDescPlaceholder', 'Kompaniya haqida qisqacha')}"],
  [">Logistika & Tashish<", ">{t('typeLogistics', 'Logistika / Yuk tashish')}<"],
  [">Avtomaktab<", ">{t('typeDrivingSchool', 'Avtomaktab')}<"],
  [">Zavod & Fabrika<", ">{t('typeManufacturing', 'Ishlab chiqarish')}<"],
  [">Oziq-ovqat ishlab chiqarish<", ">{t('typeFoodService', 'Oziq-ovqat xizmati')}<"],
  [">Qurilish<", ">{t('typeConstruction', 'Qurilish')}<"],
  [">Boshqa<", ">{t('typeOther', 'Boshqa')}<"]
];

for (let [s, r] of rsReplacements) {
  roleSelect = roleSelect.split(s).join(r);
}
fs.writeFileSync('src/components/RoleSelect.jsx', roleSelect);

let i18n = fs.readFileSync('src/i18n.js', 'utf8');

const additions = {
  uz: "\\n      roleDriverTitle: 'Haydovchi',\\n      roleDriverDesc: 'Ish qidirish, akademiyada o\\'qish va xizmatlar',\\n      roleCompanyTitle: 'Kompaniya / Maktab',\\n      roleCompanyDesc: 'E\\'lon berish, xodimlarni boshqarish',\\n      loginTitle: 'Tizimga kirish',\\n      emailVerification: 'Email tasdiqlash',\\n      verifyAndLogin: 'Tasdiqlash va Kirish',\\n      genderLabel: 'Jinsingiz',\\n      male: 'Erkak',\\n      female: 'Ayol',\\n      loginBtn: 'Kirish',",
  ja: "\\n      roleDriverTitle: 'ドライバー',\\n      roleDriverDesc: '求職、学校、サービス',\\n      roleCompanyTitle: '企業 / 学校',\\n      roleCompanyDesc: '求人掲載、従業員管理',\\n      loginTitle: 'ログイン',\\n      emailVerification: 'メール確認',\\n      verifyAndLogin: '確認してログイン',\\n      genderLabel: '性別',\\n      male: '男性',\\n      female: '女性',\\n      loginBtn: 'ログイン',",
  en: "\\n      roleDriverTitle: 'Driver',\\n      roleDriverDesc: 'Job search, academy, and services',\\n      roleCompanyTitle: 'Company / School',\\n      roleCompanyDesc: 'Post jobs, manage employees',\\n      loginTitle: 'Login',\\n      emailVerification: 'Email Verification',\\n      verifyAndLogin: 'Verify & Login',\\n      genderLabel: 'Gender',\\n      male: 'Male',\\n      female: 'Female',\\n      loginBtn: 'Login',",
  vi: "\\n      roleDriverTitle: 'Tài xế',\\n      roleDriverDesc: 'Tìm việc, học viện và dịch vụ',\\n      roleCompanyTitle: 'Công ty / Trường học',\\n      roleCompanyDesc: 'Đăng việc, quản lý nhân viên',\\n      loginTitle: 'Đăng nhập',\\n      emailVerification: 'Xác minh email',\\n      verifyAndLogin: 'Xác minh & Đăng nhập',\\n      genderLabel: 'Giới tính',\\n      male: 'Nam',\\n      female: 'Nữ',\\n      loginBtn: 'Đăng nhập',",
  zh: "\\n      roleDriverTitle: '司机',\\n      roleDriverDesc: '求职、学院和服务',\\n      roleCompanyTitle: '公司 / 学校',\\n      roleCompanyDesc: '发布职位，管理员工',\\n      loginTitle: '登录',\\n      emailVerification: '电子邮件验证',\\n      verifyAndLogin: '验证并登录',\\n      genderLabel: '性别',\\n      male: '男',\\n      female: '女',\\n      loginBtn: '登录',"
};

for (const [lang, block] of Object.entries(additions)) {
  const marker = new RegExp("(\\\\b" + lang + "\\\\s*:\\s*\\{\\s*translation\\s*:\\s*\\{)");
  i18n = i18n.replace(marker, "$1" + block);
}

fs.writeFileSync('src/i18n.js', i18n);

console.log('Done updating translations!');
