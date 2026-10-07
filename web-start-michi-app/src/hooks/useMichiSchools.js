import { useState, useEffect, useCallback } from 'react';
import { michiSchoolsApiService } from '../services/michiSchoolsApiService';
import { michiLocalStorageEngine } from '../services/michiLocalStorageEngine';
import { normalizeSchoolPosting } from '../utils/jobPostingNormalizer';
import { validateSchoolSchema } from '../services/schemaValidationService';

export function useMichiSchools(initialFilters = {}) {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const loadSchools = useCallback(async (filters = initialFilters) => {
    setLoading(true);
    setError(null);
    try {
      const rawSchools = await michiSchoolsApiService.fetchSchools(filters);
      if (Array.isArray(rawSchools) && rawSchools.length > 0) {
        const normalized = rawSchools.map(normalizeSchoolPosting).filter(Boolean);
        setSchools(normalized);
        michiLocalStorageEngine.cacheSchools(normalized);
        setIsOffline(false);
      } else {
        const cached = michiLocalStorageEngine.getCachedSchools();
        if (cached.length > 0) {
          setSchools(cached.map(normalizeSchoolPosting).filter(Boolean));
        } else {
          setSchools([]);
        }
      }
    } catch (err) {
      console.warn('[useMichiSchools] Fetch failed, loading local cache:', err.message);
      setError(err.message);
      setIsOffline(true);
      const cached = michiLocalStorageEngine.getCachedSchools();
      setSchools(cached.map(normalizeSchoolPosting).filter(Boolean));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchools(initialFilters);
  }, [loadSchools]);

  const postNewSchool = async (schoolPayload) => {
    const validation = validateSchoolSchema(schoolPayload);
    if (!validation.isValid) {
      throw new Error(`Validatsiya xatosi: ${validation.errors.join(', ')}`);
    }


    const normalized = normalizeSchoolPosting(schoolPayload);

    try {
      const response = await michiSchoolsApiService.postSchool(schoolPayload);
      const createdSchool = normalizeSchoolPosting(response.school || schoolPayload);
      setSchools(prev => [createdSchool, ...prev]);
      return { success: true, school: createdSchool };
    } catch (err) {
      console.warn('[useMichiSchools] Post failed, queueing offline post:', err.message);
      michiLocalStorageEngine.queuePendingSchoolPost(schoolPayload);
      setSchools(prev => [normalized, ...prev]);
      return { success: true, school: normalized, offlineQueued: true };
    }
  };

  return {
    schools,
    loading,
    error,
    isOffline,
    refreshSchools: loadSchools,
    postNewSchool
  };
}
