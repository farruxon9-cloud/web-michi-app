const fs = require('fs');
const content = fs.readFileSync('src/i18n.js', 'utf8');

const missingJA = {
  uploadAdImage: '求人画像をアップロード',
  schoolTypePlaceholder: '例：大型・特殊、全車種',
  schoolPricePlaceholder: '例：¥280,000〜',
  schoolDiscountPlaceholder: '例：20,000円割引',
  schoolTypeLabel: '車種・カテゴリー',
  schoolPriceLabel: '初期教習料金',
  schoolDiscountLabel: '会員割引（任意）',
  locationPlaceholder: '埼玉、大宮',
  fullAddressLabel: '詳細な住所（郵便番号を含む）',
  fullAddressPlaceholder: '〒330-0854 埼玉県さいたま市大宮区桜木町 2-1',
  schoolCoursesLanguages: 'コースと対応言語',
  availableCoursesLabel: '対応車種',
  availableLangsLabel: '対応言語',
  contactInfoAndDesc: '求人の詳細・連絡先',
  phoneLabel: '連絡先電話番号',
  phonePlaceholder: '+81 48-555-1234',
  emailLabel: '連絡先メールアドレス',
  emailContactPlaceholder: 'info@saitama-auto.jp',
  schoolDescLabel: '教習所の詳細情報',
  schoolDescPlaceholder: 'さいたま市中心部に広大な教習コースを持つ自動車学校...',
  reqTitle: 'タイトルは必須です',
  reqSalary: '料金/給与は必須です',
  reqLocation: '簡単な所在地は必須です',
  reqFullAddress: '詳細な住所は必須です',
  reqPhone: '電話番号は必須です',
  reqEmail: 'メールアドレスは必須です',
  reqDesc: '詳細情報は必須です',
  reqShoukai: '紹介報酬の有無を選択してください',
  reqShoukaiSum: '紹介報酬額を入力してください',
  shoukaiFeePlaceholder: '5000',
  employeeRequestMsg: '企業があなたを従業員リストに追加しようとしています。',
  companyInfoTitle: '会社情報',
  currentAddressLabel: '現住所',
  addAddressBtn: '住所を追加',
  currentlyStudyingLabel: '在学中',
  addEducationBtn: '学歴を追加',
  emailRequired: 'メールアドレスを入力してください。',
  loginError: 'ログイン名またはパスワードが正しくありません。',
  verifyError: '認証コードが正しくありません！',
  passwordRequired: '新しいパスワードを入力してください。',
  recoverySuccessAlert: 'パスワードが正常にリセットされ、ログインしました！',
  recoveryTitle: 'パスワードのリセット',
  recoveryEmailSub: 'メールアドレスを入力してください',
  recoveryCodeSub: '認証コードを入力してください',
  recoveryPassSub: '新しいパスワードを設定してください',
  recoveryCodeSentMsg: 'リカバリーコードがメールに送信されました。（テストコード：1234）',
  sendCodeBtn: 'コードを送信',
  verifyCodeBtn: 'コードを認証',
  updateAndLoginBtn: 'パスワードを更新してログイン',
  forgotPasswordBtn: 'パスワードを忘れた場合',
  employeeConfirmed: '従業員として承認されました！',
  confirmBtn: '確認（承認）',
  confirmedStatus: '確認済み ✓',
  preferencesTitle: '環境設定',
  notifSoundLabel: '通知音',
  showBadgesLabel: 'バッジ数の表示',
  reviewedNotifTitle: '応募が確認されました',
  rejectedNotifTitle: '応募が却下されました',
  reviewedNotifMsg: 'あなたの応募が確認されました：',
  rejectedNotifMsg: 'あなたの応募が却下されました：',
  companyAddressPlaceholder: '住所（都道府県、市区町村）',
  contactPersonPlaceholder: '担当者名',
  companyPhonePlaceholder: '電話番号',
  employeeCountPlaceholder: '従業員数',
  companyDescPlaceholder: '組織の簡単な説明（任意）'
};

const insertIndex = content.indexOf('ja: {\\n    translation: {');
let targetIndex = -1;
if (insertIndex !== -1) {
    targetIndex = insertIndex + 'ja: {\\n    translation: {'.length;
} else if (content.indexOf('ja: {\\r\\n    translation: {') !== -1) {
    targetIndex = content.indexOf('ja: {\\r\\n    translation: {') + 'ja: {\\r\\n    translation: {'.length;
}

if (targetIndex === -1) {
  targetIndex = content.indexOf('ja:');
  targetIndex = content.indexOf('translation:', targetIndex) + 'translation: {'.length;
}

let newEntries = Object.entries(missingJA).map(([k, v]) => '\\n      ' + k + ': \"' + v + '\",').join('');

const newContent = content.substring(0, targetIndex) + newEntries + content.substring(targetIndex);
fs.writeFileSync('src/i18n.js', newContent);
console.log('Successfully injected general translations.');
