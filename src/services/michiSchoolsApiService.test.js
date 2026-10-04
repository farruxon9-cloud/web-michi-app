import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchSchools,
  createSchool,
  fetchSchoolById,
  buildSchoolsQueryUrl,
  MICHI_SCHOOLS_API_ENDPOINT,
  DEFAULT_API_HEADERS
} from './michiSchoolsApiService';

describe('FAZA 2: Driving Schools Central API Service Tests (https://api.michi.jp.net)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildSchoolsQueryUrl', () => {
    it('should build endpoint URL without parameters when params object is empty', () => {
      const url = buildSchoolsQueryUrl({});
      expect(url).toBe('https://api.michi.jp.net/api/schools');
    });

    it('should construct correct query string for license and search parameters', () => {
      const url = buildSchoolsQueryUrl({
        license: 'Heavy',
        search: 'Fuchu'
      });

      expect(url).toContain('license=Heavy');
      expect(url).toContain('search=Fuchu');
    });
  });

  describe('fetchSchools (GET /api/schools)', () => {
    it('should fetch driving schools successfully with correct headers and return validated list', async () => {
      const mockSchools = [
        {
          id: 'school_101',
          name: '府中自動車教習所',
          location: { prefecture: 'Tokyo', city: 'Fuchu', lat: 35.6686, lng: 139.4776 },
          courses: [{ name: '大型自動車 免許取得コース', price: 320000, license: 'Heavy' }]
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSchools
      });

      const result = await fetchSchools({ license: 'Heavy', search: 'Fuchu' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.michi.jp.net/api/schools'),
        expect.objectContaining({
          method: 'GET',
          headers: DEFAULT_API_HEADERS
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('府中自動車教習所');
    });

    it('should handle 404 gracefully and return empty list', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await fetchSchools();
      expect(result).toEqual([]);
    });

    it('should throw an error on 500 server failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error'
      });

      await expect(fetchSchools()).rejects.toThrow('API Error (500)');
    });
  });

  describe('createSchool (POST /api/schools)', () => {
    it('should reject invalid school payload with 400 Bad Request before calling fetch', async () => {
      const invalidSchool = {
        // missing name!
        location: { prefecture: 'Tokyo', lat: 35.6686, lng: 139.4776 },
        courses: [{ name: 'AT Course', price: 200000, license: 'AT' }]
      };

      try {
        await createSchool(invalidSchool);
        expect.fail('Should have thrown validation error');
      } catch (err) {
        expect(err.isValid).toBe(false);
        expect(err.status).toBe(400);
        expect(err.error).toBe('Bad Request');
        expect(err.message).toContain('School name is required');
      }

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should send POST request with correct payload and headers when schema is valid', async () => {
      const validSchool = {
        name: '大阪自動車教習所',
        location: { prefecture: 'Osaka', city: 'Umeda', lat: 34.7024, lng: 135.4959 },
        courses: [{ name: '中型免許可', price: 280000, license: 'Medium' }]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success', school: { id: 'school_888', ...validSchool } })
      });

      const savedSchool = await createSchool(validSchool);

      expect(fetch).toHaveBeenCalledWith(
        MICHI_SCHOOLS_API_ENDPOINT,
        expect.objectContaining({
          method: 'POST',
          headers: DEFAULT_API_HEADERS,
          body: expect.stringContaining('大阪自動車教習所')
        })
      );
      expect(savedSchool.name).toBe('大阪自動車教習所');
    });
  });

  describe('fetchSchoolById (GET /api/schools/:id)', () => {
    it('should fetch single driving school details by ID', async () => {
      const mockSchool = {
        id: 'school_55',
        name: '新小岩自動車教習所',
        location: { prefecture: 'Tokyo', lat: 35.7165, lng: 139.8582 },
        courses: [{ name: '普通AT限定', price: 240000, license: 'AT' }]
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSchool
      });

      const school = await fetchSchoolById('school_55');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.michi.jp.net/api/schools/school_55',
        expect.objectContaining({
          method: 'GET',
          headers: DEFAULT_API_HEADERS
        })
      );
      expect(school.name).toBe('新小岩自動車教習所');
    });

    it('should throw error when school ID is not found (404)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(fetchSchoolById('non_existent_id')).rejects.toThrow('Driving school post not found');
    });
  });
});
