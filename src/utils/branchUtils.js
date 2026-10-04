// ============================================================
// Branch (支店・営業所) helpers shared by the company form and job-seeker views.
// ============================================================
import { ALL_47_PREFECTURES } from '../data/japanRegions';

export const PHONE_RE = /^0\d{1,4}-?\d{1,4}-?\d{3,4}$/;
export const ZIP_RE = /^\d{3}-?\d{4}$/;

/** Shown to job seekers when the company keeps the branch phone private. */
export const HIDDEN_PHONE_TEXT = '面接時にお知らせします';

const str = (v) => (v === null || v === undefined ? '' : String(v).trim());

/**
 * Returns an object of field -> Japanese error message. Empty object = valid.
 */
export function validateBranch(b) {
  const e = {};
  if (!b) return { name: '支店・営業所の情報がありません' };
  if (!str(b.name)) e.name = '支店・営業所名を入力してください';
  if (!str(b.postalCode)) e.postalCode = '郵便番号を入力してください';
  else if (!ZIP_RE.test(str(b.postalCode))) e.postalCode = '郵便番号は7桁（例：100-0001）で入力してください';
  if (!str(b.prefecture)) e.prefecture = '都道府県を選択してください';
  if (!str(b.city)) e.city = '市区町村を入力してください';
  if (!str(b.town)) e.town = '町名・番地を入力してください';
  const phone = str(b.phone).replace(/[\s（）()]/g, '');
  if (!phone) e.phone = '電話番号を入力してください';
  else if (!PHONE_RE.test(phone)) e.phone = '電話番号の形式が正しくありません（例：03-1234-5678）';
  const walk = str(b.walkMinutes);
  if (walk && !(/^\d{1,3}$/.test(walk))) e.walkMinutes = '徒歩（分）は数字で入力してください';
  const hc = str(b.headcount);
  if (hc && !(/^\d{1,4}$/.test(hc) && Number(hc) > 0)) e.headcount = '募集人数は1以上の数字で入力してください';
  return e;
}

export function prefectureKanji(pref) {
  if (!pref) return '';
  const m = ALL_47_PREFECTURES.find((p) => p.id === pref || p.kanji === pref || p.name === pref);
  return m ? m.kanji : String(pref);
}

export function formatBranchAddress(b) {
  if (!b) return '';
  const zip = str(b.postalCode);
  const addr = [prefectureKanji(b.prefecture), str(b.city), str(b.town), str(b.building)].filter(Boolean).join(' ');
  return zip ? `〒${zip} ${addr}` : addr;
}

export function branchMapsUrl(b) {
  if (!b) return '';
  if (Number.isFinite(b.lat) && Number.isFinite(b.lng)) {
    return `https://www.google.com/maps/search/?api=1&query=${b.lat},${b.lng}`;
  }
  const q = [prefectureKanji(b.prefecture), str(b.city), str(b.town), str(b.building)].filter(Boolean).join('');
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : '';
}

/** Visible phone for job seekers; null when hidden or missing. */
export function publicBranchPhone(b) {
  if (!b || b.phonePublic === false) return null;
  const p = str(b.phone);
  return p || null;
}

export function newBranchId() {
  return `br_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
