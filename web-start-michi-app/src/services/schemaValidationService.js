/**
 * 🛡️ Michi Server — Schema & Data Validation Engine
 * 
 * Central JSON Schema & Validation Middleware for Jobs and Driving Schools.
 * Enforces strict types, mandatory fields, numeric salary parsing, float coordinates,
 * and standard 400 Bad Request response payloads across all platforms.
 */

/**
 * Valid Prefectures in Japan for Geographic Validation
 */
export const VALID_JAPAN_PREFECTURES = [
  'Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima',
  'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa',
  'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano', 'Gifu',
  'Shizuoka', 'Aichi', 'Mie', 'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara',
  'Wakayama', 'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi',
  'Tokushima', 'Kagawa', 'Ehime', 'Kochi', 'Fukuoka', 'Saga', 'Nagasaki',
  'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa',
  // Japanese localized names
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

/**
 * Valid License Types in Michi Logistics Platform
 */
export const VALID_LICENSE_TYPES = [
  'AT', 'MT', 'Heavy', 'Medium', 'Semi-Medium', 'Towing', 'Taxi', 'Forklift', 'Crane',
  '普通AT', '普通MT', '大型', '中型', '準中型', '牽引', '二種', 'フォークリフト'
];

/**
 * Helper: Parse value strictly into a valid number or null
 */
export function parseNumericValue(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') {
    return isNaN(val) ? null : val;
  }
  if (typeof val === 'string') {
    // Remove commas, currency symbols, and spaces
    const cleaned = val.replace(/[,¥$\s]/g, '');
    const parsed = Number(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Helper: Parse value strictly into a valid float coordinate
 */
export function parseCoordinateValue(val) {
  const num = parseNumericValue(val);
  return num !== null ? Number(num.toFixed(6)) : null;
}

/**
 * Helper: Standard 400 Bad Request error object builder
 */
export function buildValidationError(message, fieldErrors = []) {
  return {
    isValid: false,
    status: 400,
    error: 'Bad Request',
    message: message || 'Validation failed. Please check payload formatting.',
    errors: fieldErrors
  };
}

/**
 * 1. Validate Job Ad Payload
 * 
 * Required Schema:
 * - title: string
 * - company: string
 * - salary: { min: number, max?: number }
 * - location: { prefecture: string, city?: string, lat: float, lng: float }
 * - licenses: array of non-empty strings
 * - tags?: array of strings
 */
export function validateJobPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return buildValidationError('Payload must be a valid JSON object.');
  }

  const errors = [];

  // Title validation
  const title = typeof payload.title === 'string' ? payload.title.trim() : '';
  if (!title) {
    errors.push({ field: 'title', message: 'Job title is required and must be a string.' });
  }

  // Company validation
  const company = typeof payload.company === 'string' ? payload.company.trim() : '';
  if (!company) {
    errors.push({ field: 'company', message: 'Company name is required and must be a string.' });
  }

  // Salary validation
  if (!payload.salary || typeof payload.salary !== 'object') {
    errors.push({ field: 'salary', message: 'Salary object with min value is required.' });
  } else {
    const minSalary = parseNumericValue(payload.salary.min);
    if (minSalary === null || minSalary <= 0) {
      errors.push({ field: 'salary.min', message: 'Minimum salary is required and must be a positive number.' });
    }

    let maxSalary = null;
    if (payload.salary.max !== undefined && payload.salary.max !== null) {
      maxSalary = parseNumericValue(payload.salary.max);
      if (maxSalary === null || maxSalary < (minSalary || 0)) {
        errors.push({ field: 'salary.max', message: 'Maximum salary must be a valid number greater than or equal to minimum salary.' });
      }
    }
  }

  // Location validation
  if (!payload.location || typeof payload.location !== 'object') {
    errors.push({ field: 'location', message: 'Location object with prefecture, lat, and lng is required.' });
  } else {
    const prefecture = typeof payload.location.prefecture === 'string' ? payload.location.prefecture.trim() : '';
    if (!prefecture) {
      errors.push({ field: 'location.prefecture', message: 'Prefecture is required.' });
    }

    const lat = parseCoordinateValue(payload.location.lat);
    if (lat === null || lat < 20 || lat > 46) {
      errors.push({ field: 'location.lat', message: 'Latitude (lat) must be a valid float within Japan bounds (20.0 to 46.0).' });
    }

    const lng = parseCoordinateValue(payload.location.lng);
    if (lng === null || lng < 122 || lng > 154) {
      errors.push({ field: 'location.lng', message: 'Longitude (lng) must be a valid float within Japan bounds (122.0 to 154.0).' });
    }
  }

  // Licenses validation
  if (!Array.isArray(payload.licenses) || payload.licenses.length === 0) {
    errors.push({ field: 'licenses', message: 'Licenses array is required and must contain at least one valid license category.' });
  } else {
    const invalidLicenses = payload.licenses.filter(lic => typeof lic !== 'string' || !lic.trim());
    if (invalidLicenses.length > 0) {
      errors.push({ field: 'licenses', message: 'All items in licenses array must be valid strings.' });
    }
  }

  if (errors.length > 0) {
    return buildValidationError(errors[0].message, errors);
  }

  // Return normalized valid object
  const minSalary = parseNumericValue(payload.salary.min);
  const maxSalary = payload.salary.max ? parseNumericValue(payload.salary.max) : null;
  const lat = parseCoordinateValue(payload.location.lat);
  const lng = parseCoordinateValue(payload.location.lng);

  return {
    isValid: true,
    status: 200,
    data: {
      id: payload.id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: title,
      company: company,
      salary: {
        min: minSalary,
        max: maxSalary
      },
      location: {
        prefecture: payload.location.prefecture.trim(),
        city: payload.location.city ? payload.location.city.trim() : '',
        lat: lat,
        lng: lng
      },
      licenses: payload.licenses.map(l => l.trim()).filter(Boolean),
      tags: Array.isArray(payload.tags) ? payload.tags.map(t => typeof t === 'string' ? t.trim() : '').filter(Boolean) : [],
      createdAt: payload.createdAt || new Date().toISOString()
    }
  };
}

/**
 * 2. Validate Driving School Payload
 * 
 * Required Schema:
 * - name: string (School Name)
 * - location: { prefecture: string, city?: string, lat: float, lng: float }
 * - courses: array of objects [{ name: string, price: number, license: string }]
 */
export function validateSchoolPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return buildValidationError('Payload must be a valid JSON object.');
  }

  const errors = [];

  // School name validation
  const name = typeof payload.name === 'string' ? payload.name.trim() : (typeof payload.title === 'string' ? payload.title.trim() : '');
  if (!name) {
    errors.push({ field: 'name', message: 'School name is required and must be a string.' });
  }

  // Location validation
  if (!payload.location || typeof payload.location !== 'object') {
    errors.push({ field: 'location', message: 'Location object with prefecture, lat, and lng is required.' });
  } else {
    const prefecture = typeof payload.location.prefecture === 'string' ? payload.location.prefecture.trim() : '';
    if (!prefecture) {
      errors.push({ field: 'location.prefecture', message: 'Prefecture is required.' });
    }

    const lat = parseCoordinateValue(payload.location.lat);
    if (lat === null || lat < 20 || lat > 46) {
      errors.push({ field: 'location.lat', message: 'Latitude (lat) must be a valid float within Japan bounds (20.0 to 46.0).' });
    }

    const lng = parseCoordinateValue(payload.location.lng);
    if (lng === null || lng < 122 || lng > 154) {
      errors.push({ field: 'location.lng', message: 'Longitude (lng) must be a valid float within Japan bounds (122.0 to 154.0).' });
    }
  }

  // Courses validation
  const courses = Array.isArray(payload.courses) ? payload.courses : (Array.isArray(payload.licenses) ? payload.licenses.map(l => ({ license: l })) : []);
  if (courses.length === 0) {
    errors.push({ field: 'courses', message: 'Driving school must have at least one valid course or license offering.' });
  }

  if (errors.length > 0) {
    return buildValidationError(errors[0].message, errors);
  }

  const lat = parseCoordinateValue(payload.location.lat);
  const lng = parseCoordinateValue(payload.location.lng);

  const normalizedCourses = courses.map((c, index) => {
    const cName = typeof c === 'object' && c.name ? c.name.trim() : `Course ${index + 1}`;
    const cLicense = typeof c === 'object' && c.license ? c.license.trim() : (typeof c === 'string' ? c.trim() : 'AT');
    // Missing price stays null (UI shows 未入力) — never invent a figure
    const cPrice = typeof c === 'object' ? (parseNumericValue(c.price) || null) : null;
    return { name: cName, license: cLicense, price: cPrice };
  });

  return {
    isValid: true,
    status: 200,
    data: {
      id: payload.id || `school_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: name,
      location: {
        prefecture: payload.location.prefecture.trim(),
        city: payload.location.city ? payload.location.city.trim() : '',
        lat: lat,
        lng: lng
      },
      courses: normalizedCourses,
      tags: Array.isArray(payload.tags) ? payload.tags.map(t => typeof t === 'string' ? t.trim() : '').filter(Boolean) : [],
      createdAt: payload.createdAt || new Date().toISOString()
    }
  };
}

/**
 * Middleware adapter function for Express server or Client API handler
 */
export function validationMiddleware(type = 'job') {
  return (req, res, next) => {
    const validator = type === 'school' ? validateSchoolPayload : validateJobPayload;
    const result = validator(req.body);
    
    if (!result.isValid) {
      if (res && typeof res.status === 'function') {
        return res.status(400).json(result);
      }
      return result;
    }

    req.validatedData = result.data;
    if (typeof next === 'function') next();
    return result;
  };
}

export function validateJobSchema(payload) {
  const res = validateJobPayload(payload);
  if (!res.isValid) {
    return {
      isValid: false,
      errors: res.details ? res.details.map(d => d.message) : [res.message]
    };
  }
  return { isValid: true, data: res.data, errors: [] };
}

export function validateSchoolSchema(payload) {
  const res = validateSchoolPayload(payload);
  if (!res.isValid) {
    return {
      isValid: false,
      errors: res.details ? res.details.map(d => d.message) : [res.message]
    };
  }
  return { isValid: true, data: res.data, errors: [] };
}

export default {
  validateJobPayload,
  validateSchoolPayload,
  validateJobSchema,
  validateSchoolSchema,
  validationMiddleware,
  parseNumericValue,
  parseCoordinateValue,
  buildValidationError
};

