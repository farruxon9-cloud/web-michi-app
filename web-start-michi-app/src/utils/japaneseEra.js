/**
 * Helpers for Japanese Era calendar conversion and age calculation
 */

export function getEraInfo(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const time = date.getTime();
  const reiwaStart = new Date('2019-05-01').getTime();
  const heiseiStart = new Date('1989-01-08').getTime();
  const showaStart = new Date('1926-12-25').getTime();

  if (time >= reiwaStart) {
    const eraYear = y - 2019 + 1;
    return {
      eraName: '令和',
      eraYear: eraYear === 1 ? '元' : eraYear,
      year: y,
      month: m,
      day: d
    };
  } else if (time >= heiseiStart) {
    const eraYear = y - 1989 + 1;
    return {
      eraName: '平成',
      eraYear: eraYear === 1 ? '元' : eraYear,
      year: y,
      month: m,
      day: d
    };
  } else if (time >= showaStart) {
    const eraYear = y - 1926 + 1;
    return {
      eraName: '昭和',
      eraYear: eraYear === 1 ? '元' : eraYear,
      year: y,
      month: m,
      day: d
    };
  } else {
    return {
      eraName: '',
      eraYear: y,
      year: y,
      month: m,
      day: d
    };
  }
}

export function toJapaneseEra(dateString) {
  const info = getEraInfo(dateString);
  if (!info) return '';
  if (info.eraName) {
    return `${info.eraName}${info.eraYear}年${info.month}月${info.day}日`;
  }
  return `${info.year}年${info.month}月${info.day}日`;
}

export function calculateAge(birthDateString) {
  if (!birthDateString) return '';
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return '';
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function toJapaneseEraYear(year) {
  if (!year) return '';
  const numericYear = parseInt(year, 10);
  if (isNaN(numericYear)) return '';

  if (numericYear >= 2019) {
    const eraYear = numericYear - 2019 + 1;
    return `令和${eraYear === 1 ? '元' : eraYear}年`;
  } else if (numericYear >= 1989) {
    const eraYear = numericYear - 1989 + 1;
    return `平成${eraYear === 1 ? '元' : eraYear}年`;
  } else if (numericYear >= 1926) {
    const eraYear = numericYear - 1926 + 1;
    return `昭和${eraYear === 1 ? '元' : eraYear}年`;
  }
  return `${numericYear}年`;
}
