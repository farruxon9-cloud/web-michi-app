const fs = require('fs');

let content = fs.readFileSync('src/components/RoleSelect.jsx', 'utf8');
const replacements = [
  ['<h2>Tizimga kirish</h2>', '<h2>{t("loginTitle", "Tizimga kirish")}</h2>'],
  ['Profiliga kirish</p>', 'profiliga kirish</p>'],
  ['>Kirish<', '>{t("loginBtn", "Kirish")}<'],
  ['Akkauntingiz yo\\'qmi?', '{t("noAccount", "Akkauntingiz yo\\'qmi?")}'],
  ['>Ro\\'yxatdan o\\'tish<', '>{t("registerTitle", "Ro\\'yxatdan o\\'tish")}<'],
  ['<h2>Ro\\'yxatdan o\\'tish</h2>', '<h2>{t("registerTitle", "Ro\\'yxatdan o\\'tish")}</h2>'],
  ['<p>Michi platformasida professional profil yaratish</p>', '<p>{t("registerSub", "Michi platformasida professional profil yaratish")}</p>'],
  ['<span>Rasm yuklash</span>', '<span>{t("uploadPhoto", "Rasm yuklash")}</span>'],
  ['<h4>Shaxsiy ma\\'lumotlar</h4>', '<h4>{t("personalInfo", "Shaxsiy ma\\'lumotlar")}</h4>'],
  ['<label>Jinsingiz</label>', '<label>{t("genderLabel", "Jinsingiz")}</label>'],
  ['>Erkak<', '>{t("male", "Erkak")}<'],
  ['>Ayol<', '>{t("female", "Ayol")}<'],
  ['<label>Tug\\'ilgan sana</label>', '<label>{t("dobLabel", "Tug\\'ilgan sana")}</label>'],
  ['<h4>Kasbiy ma\\'lumotlar</h4>', '<h4>{t("proInfo", "Kasbiy ma\\'lumotlar")}</h4>'],
  ['<h4>Ish tajribasi (Ixtiyoriy)</h4>', '<h4>{t("workExperience", "Ish tajribasi")}</h4>'],
  ['<h4>Kompaniya ma\\'lumotlari</h4>', '<h4>{t("companyInfo", "Kompaniya ma\\'lumotlari")}</h4>'],
  ['<label>Faoliyat turi</label>', '<label>{t("companyTypeLabel", "Faoliyat turi")}</label>'],
  ['<h4>Bog\\'lanish uchun</h4>', '<h4>{t("companyDetailsTitle", "Bog\\'lanish uchun")}</h4>'],
  ['<h4>Hisob ma\\'lumotlari</h4>', '<h4>{t("accInfo", "Hisob ma\\'lumotlari")}</h4>'],
  ['YAPONIYA QONUNIY SHARTLARI', '{t("legalInfo", "YAPONIYA QONUNIY SHARTLARI")}'],
  ['Yaponiya Mehnat standarti qonuniga (労働基準法) rioya qilishga roziman.', '{t("legalLabor")}'],
  ['Chet el fuqarolari uchun tegishli viza maqomini taqdim etishga roziman.', '{t("legalVisa")}'],
  ['Ma\\'lumotlarimdan reklama maqsadida foydalanishga rozilik bildiraman.', '{t("legalAd")}'],
  ['<h3>Haydovchi</h3>', '<h3>{t("roleDriverTitle", "Haydovchi")}</h3>'],
  ['<p>Ish qidirish, akademiyada o\\'qish va xizmatlar</p>', '<p>{t("roleDriverDesc", "Ish qidirish, akademiyada o\\'qish va xizmatlar")}</p>'],
  ['<h3>Kompaniya / Maktab</h3>', '<h3>{t("roleCompanyTitle", "Kompaniya / Maktab")}</h3>'],
  ['<p>E\\'lon berish, xodimlarni boshqarish</p>', '<p>{t("roleCompanyDesc", "E\\'lon berish, xodimlarni boshqarish")}</p>'],
  ['Mehmon sifatida kirish', '{t("guestBtn", "Mehmon sifatida kirish")}']
];

for (let [search, replace] of replacements) {
  content = content.split(search).join(replace);
}

// Ensure placeholders are replaced
content = content.replace(/placeholder="Email yoki Login"/g, `placeholder={t('emailOrLogin', 'Email yoki Login')}`);
content = content.replace(/placeholder="Parol"/g, `placeholder={t('passPlaceholder', 'Parol')}`);
content = content.replace(/placeholder="To\\'liq ismingiz"/g, `placeholder={t('namePlaceholder', "To\\'liq ismingiz")}`);
content = content.replace(/placeholder="Kompaniya nomi"/g, `placeholder={t('companyNamePlaceholder', 'Kompaniya nomi')}`);
content = content.replace(/placeholder="Lavozim"/g, `placeholder={t('positionLabel', 'Lavozim')}`);
content = content.replace(/placeholder="Kompaniya manzili"/g, `placeholder={t('companyAddressPlaceholder', 'Kompaniya manzili')}`);
content = content.replace(/placeholder="Mas\\'ul shaxs ismi"/g, `placeholder={t('contactPersonPlaceholder', "Mas\\'ul shaxs ismi")}`);
content = content.replace(/placeholder="Telefon raqam"/g, `placeholder={t('companyPhonePlaceholder', 'Telefon raqam')}`);
content = content.replace(/placeholder="Ishchilar soni"/g, `placeholder={t('employeeCountPlaceholder', 'Ishchilar soni')}`);
content = content.replace(/placeholder="Kompaniya haqida qisqacha"/g, `placeholder={t('companyDescPlaceholder', 'Kompaniya haqida qisqacha')}`);
content = content.replace(/placeholder="Email manzili"/g, `placeholder={t('emailPlaceholder', 'Email manzili')}`);
content = content.replace(/placeholder="Yangi parol"/g, `placeholder={t('passPlaceholder', 'Yangi parol')}`);

fs.writeFileSync('src/components/RoleSelect.jsx', content);
console.log('Replaced RoleSelect.jsx');
