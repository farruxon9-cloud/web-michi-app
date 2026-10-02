import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMichiJobs } from './useMichiJobs';
import { michiJobsApiService } from '../services/michiJobsApiService';
import { michiLocalStorageEngine } from '../services/michiLocalStorageEngine';

vi.mock('../services/michiJobsApiService', () => ({
  michiJobsApiService: {
    fetchJobs: vi.fn(),
    postJob: vi.fn()
  }
}));

describe('FAZA 4: useMichiJobs React Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should fetch jobs and normalize data on mount', async () => {
    const mockJobsData = [
      { id: '101', title: 'Yuk haydovchisi', company: 'Sagawa', salary: 380000, prefecture: 'Tokyo' }
    ];
    michiJobsApiService.fetchJobs.mockResolvedValueOnce(mockJobsData);

    const { result } = renderHook(() => useMichiJobs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.jobs[0].title).toBe('Yuk haydovchisi');
    expect(result.current.jobs[0].salary).toBe('¥380,000 / oyiga');
    expect(result.current.isOffline).toBe(false);
  });

  it('should fallback to local cache on API network error', async () => {
    michiJobsApiService.fetchJobs.mockRejectedValueOnce(new Error('Network error'));
    michiLocalStorageEngine.cacheJobs([
      { id: '202', title: 'Kuryer Cache', salary: '¥250,000 / oyiga', prefecture: 'Osaka' }
    ]);

    const { result } = renderHook(() => useMichiJobs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isOffline).toBe(true);
    expect(result.current.jobs).toHaveLength(1);
    expect(result.current.jobs[0].title).toBe('Kuryer Cache');
  });

  it('should validate and post a new job', async () => {
    const newJobPayload = {
      title: 'Taksi Haydovchisi',
      company: 'Nihon Kotsu',
      salary: { min: 420000, max: 550000 },
      licenses: ['futsu'],
      location: { prefecture: 'Tokyo', lat: 35.6812, lng: 139.7671 }
    };

    michiJobsApiService.fetchJobs.mockResolvedValueOnce([]);
    michiJobsApiService.postJob.mockResolvedValueOnce({ job: newJobPayload });


    const { result } = renderHook(() => useMichiJobs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let res;
    await act(async () => {
      res = await result.current.postNewJob(newJobPayload);
    });

    expect(res.success).toBe(true);
    expect(result.current.jobs[0].company).toBe('Nihon Kotsu');
  });
});
