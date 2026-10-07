import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchJobs,
  createJob,
  fetchJobById,
  buildJobsQueryUrl,
  MICHI_JOBS_API_ENDPOINT,
  DEFAULT_API_HEADERS
} from './michiJobsApiService';

describe('FAZA 2: Jobs Central API Service Tests (https://api.michi.jp.net)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildJobsQueryUrl', () => {
    it('should build endpoint URL without parameters when params object is empty', () => {
      const url = buildJobsQueryUrl({});
      expect(url).toBe('https://api.michi.jp.net/api/jobs');
    });

    it('should construct correct query string for prefecture, license, minSalary, and q', () => {
      const url = buildJobsQueryUrl({
        prefecture: 'Tokyo',
        license: 'oogata',
        minSalary: 350000,
        q: 'Sagawa'
      });

      expect(url).toContain('prefecture=Tokyo');
      expect(url).toContain('license=oogata');
      expect(url).toContain('minSalary=350000');
      expect(url).toContain('q=Sagawa');
    });
  });

  describe('fetchJobs (GET /api/jobs)', () => {
    it('should fetch jobs successfully with correct headers and return validated list', async () => {
      const mockJobs = [
        {
          id: 'job_101',
          title: '大型トラックドライバー',
          company: '佐川急便株式会社',
          salary: { min: 380000, max: 550000 },
          location: { prefecture: 'Tokyo', lat: 35.6895, lng: 139.6917 },
          licenses: ['Heavy']
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockJobs
      });

      const result = await fetchJobs({ prefecture: 'Tokyo', license: 'Heavy', minSalary: 350000, q: 'Sagawa' });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.michi.jp.net/api/jobs'),
        expect.objectContaining({
          method: 'GET',
          headers: DEFAULT_API_HEADERS
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].company).toBe('佐川急便株式会社');
    });

    it('should throw an error on API failure', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error'
      });

      await expect(fetchJobs()).rejects.toThrow('API Error (500)');
    });
  });

  describe('createJob (POST /api/jobs)', () => {
    it('should reject invalid job payload with 400 Bad Request before calling fetch', async () => {
      const invalidJob = {
        title: 'ドライバー',
        // missing company name!
        salary: { min: 300000 },
        location: { prefecture: 'Tokyo', lat: 35.6895, lng: 139.6917 },
        licenses: ['AT']
      };

      try {
        await createJob(invalidJob);
        expect.fail('Should have thrown validation error');
      } catch (err) {
        expect(err.isValid).toBe(false);
        expect(err.status).toBe(400);
        expect(err.error).toBe('Bad Request');
        expect(err.message).toContain('Company name is required');
      }

      expect(fetch).not.toHaveBeenCalled();
    });

    it('should send POST request with correct payload and headers when schema is valid', async () => {
      const validJob = {
        title: '中型トラックドライバー',
        company: 'ヤマト運輸',
        salary: { min: 320000 },
        location: { prefecture: 'Osaka', lat: 34.6937, lng: 135.5023 },
        licenses: ['Medium']
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success', job: { id: 'job_777', ...validJob } })
      });

      const savedJob = await createJob(validJob);

      expect(fetch).toHaveBeenCalledWith(
        MICHI_JOBS_API_ENDPOINT,
        expect.objectContaining({
          method: 'POST',
          headers: DEFAULT_API_HEADERS,
          body: expect.stringContaining('ヤマト運輸')
        })
      );
      expect(savedJob.company).toBe('ヤマト運輸');
    });
  });

  describe('fetchJobById (GET /api/jobs/:id)', () => {
    it('should fetch single job details by ID', async () => {
      const mockJob = {
        id: 'job_99',
        title: '役員運転手',
        company: '日本交通',
        salary: { min: 400000 },
        location: { prefecture: 'Tokyo', lat: 35.6895, lng: 139.6917 },
        licenses: ['AT']
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockJob
      });

      const job = await fetchJobById('job_99');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.michi.jp.net/api/jobs/job_99',
        expect.objectContaining({
          method: 'GET',
          headers: DEFAULT_API_HEADERS
        })
      );
      expect(job.title).toBe('役員運転手');
    });

    it('should throw error when job ID is not found (404)', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(fetchJobById('non_existent_id')).rejects.toThrow('Job post not found');
    });
  });
});
