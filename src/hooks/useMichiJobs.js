import { useState, useEffect, useCallback } from 'react';
import { michiJobsApiService } from '../services/michiJobsApiService';
import { michiLocalStorageEngine } from '../services/michiLocalStorageEngine';
import { normalizeJobPosting } from '../utils/jobPostingNormalizer';
import { validateJobSchema } from '../services/schemaValidationService';

export function useMichiJobs(initialFilters = {}) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const loadJobs = useCallback(async (filters = initialFilters) => {
    setLoading(true);
    setError(null);
    try {
      const rawJobs = await michiJobsApiService.fetchJobs(filters);
      if (Array.isArray(rawJobs) && rawJobs.length > 0) {
        const normalized = rawJobs.map(normalizeJobPosting).filter(Boolean);
        setJobs(normalized);
        michiLocalStorageEngine.cacheJobs(normalized);
        setIsOffline(false);
      } else {
        // Fallback to local cache if empty or server has no jobs
        const cached = michiLocalStorageEngine.getCachedJobs();
        if (cached.length > 0) {
          setJobs(cached.map(normalizeJobPosting).filter(Boolean));
        } else {
          setJobs([]);
        }
      }
    } catch (err) {
      console.warn('[useMichiJobs] Fetch failed, loading local cache:', err.message);
      setError(err.message);
      setIsOffline(true);
      const cached = michiLocalStorageEngine.getCachedJobs();
      setJobs(cached.map(normalizeJobPosting).filter(Boolean));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs(initialFilters);
  }, [loadJobs]);

  const postNewJob = async (jobPayload) => {
    // 1. Validation via Faza 1 Schema
    const validation = validateJobSchema(jobPayload);
    if (!validation.isValid) {
      throw new Error(`Validatsiya xatosi: ${validation.errors.join(', ')}`);
    }


    const normalized = normalizeJobPosting(jobPayload);

    try {
      const response = await michiJobsApiService.postJob(jobPayload);
      const createdJob = normalizeJobPosting(response.job || jobPayload);
      setJobs(prev => [createdJob, ...prev]);
      return { success: true, job: createdJob };
    } catch (err) {
      console.warn('[useMichiJobs] Post failed, queueing offline post:', err.message);
      michiLocalStorageEngine.queuePendingJobPost(jobPayload);
      setJobs(prev => [normalized, ...prev]);
      return { success: true, job: normalized, offlineQueued: true };
    }
  };

  return {
    jobs,
    loading,
    error,
    isOffline,
    refreshJobs: loadJobs,
    postNewJob
  };
}
