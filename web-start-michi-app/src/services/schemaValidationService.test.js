import { describe, it, expect } from 'vitest';
import {
  validateJobPayload,
  validateSchoolPayload,
  parseNumericValue,
  parseCoordinateValue,
  buildValidationError
} from './schemaValidationService';

describe('FAZA 1: Schema & Data Validation Engine Tests', () => {
  describe('parseNumericValue & parseCoordinateValue helpers', () => {
    it('should parse numbers directly', () => {
      expect(parseNumericValue(300000)).toBe(300000);
      expect(parseNumericValue(0)).toBe(0);
    });

    it('should parse numeric strings with currency or comma formatting', () => {
      expect(parseNumericValue('350,000')).toBe(350000);
      expect(parseNumericValue('¥400,000')).toBe(400000);
      expect(parseNumericValue('$3000')).toBe(3000);
    });

    it('should return null for invalid non-numeric inputs', () => {
      expect(parseNumericValue('abc')).toBeNull();
      expect(parseNumericValue(null)).toBeNull();
      expect(parseNumericValue(undefined)).toBeNull();
      expect(parseNumericValue(NaN)).toBeNull();
    });

    it('should parse valid float coordinates', () => {
      expect(parseCoordinateValue('35.6762')).toBe(35.6762);
      expect(parseCoordinateValue(139.6503)).toBe(139.6503);
      expect(parseCoordinateValue('invalid')).toBeNull();
    });
  });

  describe('validateJobPayload', () => {
    it('should validate a complete valid job payload', () => {
      const validPayload = {
        title: '大型トラックドライバー',
        company: 'ヤマト運輸株式会社',
        salary: { min: 350000, max: 500000 },
        location: {
          prefecture: 'Tokyo',
          city: 'Shinjuku',
          lat: 35.6895,
          lng: 139.6917
        },
        licenses: ['Heavy', 'AT'],
        tags: ['High Pay', 'Day Shift']
      };

      const result = validateJobPayload(validPayload);
      expect(result.isValid).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data.title).toBe('大型トラックドライバー');
      expect(result.data.salary.min).toBe(350000);
      expect(result.data.salary.max).toBe(500000);
      expect(result.data.location.lat).toBe(35.6895);
      expect(result.data.location.lng).toBe(139.6917);
    });

    it('should coerce numeric strings for salary and coordinates', () => {
      const payloadWithStrings = {
        title: '中型ドライバー',
        company: '佐川急便',
        salary: { min: '300,000', max: '400,000' },
        location: {
          prefecture: 'Osaka',
          lat: '34.6937',
          lng: '135.5023'
        },
        licenses: ['Medium']
      };

      const result = validateJobPayload(payloadWithStrings);
      expect(result.isValid).toBe(true);
      expect(result.data.salary.min).toBe(300000);
      expect(result.data.salary.max).toBe(400000);
      expect(result.data.location.lat).toBe(34.6937);
      expect(result.data.location.lng).toBe(135.5023);
    });

    it('should return 400 Bad Request if company is missing', () => {
      const invalidPayload = {
        title: 'ドライバー',
        salary: { min: 300000 },
        location: { prefecture: 'Tokyo', lat: 35.6895, lng: 139.6917 },
        licenses: ['AT']
      };

      const result = validateJobPayload(invalidPayload);
      expect(result.isValid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toBe('Bad Request');
      expect(result.message).toContain('Company name is required');
    });

    it('should return 400 Bad Request if licenses array is missing or empty', () => {
      const invalidPayload = {
        title: 'ドライバー',
        company: 'Michi Express',
        salary: { min: 300000 },
        location: { prefecture: 'Tokyo', lat: 35.6895, lng: 139.6917 },
        licenses: []
      };

      const result = validateJobPayload(invalidPayload);
      expect(result.isValid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain('Licenses array is required');
    });

    it('should return 400 Bad Request if minimum salary is missing or invalid', () => {
      const invalidPayload = {
        title: 'ドライバー',
        company: 'Michi Express',
        salary: { min: 'invalid_salary' },
        location: { prefecture: 'Tokyo', lat: 35.6895, lng: 139.6917 },
        licenses: ['AT']
      };

      const result = validateJobPayload(invalidPayload);
      expect(result.isValid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain('Minimum salary is required');
    });

    it('should return 400 Bad Request if coordinates are out of Japan bounds', () => {
      const invalidPayload = {
        title: 'ドライバー',
        company: 'Michi Express',
        salary: { min: 300000 },
        location: { prefecture: 'Tokyo', lat: 99.0, lng: 139.6917 },
        licenses: ['AT']
      };

      const result = validateJobPayload(invalidPayload);
      expect(result.isValid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain('Latitude (lat) must be a valid float');
    });
  });

  describe('validateSchoolPayload', () => {
    it('should validate a valid driving school payload', () => {
      const validSchool = {
        name: '東京自動車教習所',
        location: {
          prefecture: 'Tokyo',
          city: 'Fuchu',
          lat: 35.6686,
          lng: 139.4776
        },
        courses: [
          { name: '大型免許コース', price: 320000, license: 'Heavy' }
        ]
      };

      const result = validateSchoolPayload(validSchool);
      expect(result.isValid).toBe(true);
      expect(result.status).toBe(200);
      expect(result.data.name).toBe('東京自動車教習所');
      expect(result.data.courses).toHaveLength(1);
    });

    it('should return 400 Bad Request if school name is missing', () => {
      const invalidSchool = {
        location: { prefecture: 'Tokyo', lat: 35.6686, lng: 139.4776 },
        courses: [{ name: 'AT Course', price: 200000, license: 'AT' }]
      };

      const result = validateSchoolPayload(invalidSchool);
      expect(result.isValid).toBe(false);
      expect(result.status).toBe(400);
      expect(result.message).toContain('School name is required');
    });
  });
});
