import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMichiSchools } from './useMichiSchools';
import { michiSchoolsApiService } from '../services/michiSchoolsApiService';
import { michiLocalStorageEngine } from '../services/michiLocalStorageEngine';

vi.mock('../services/michiSchoolsApiService', () => ({
  michiSchoolsApiService: {
    fetchSchools: vi.fn(),
    postSchool: vi.fn()
  }
}));

describe('FAZA 4: useMichiSchools React Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should fetch schools and normalize on mount', async () => {
    const mockSchoolsData = [
      { id: '1', name: 'Tokyo Auto School', price: 300000, prefecture: 'Tokyo' }
    ];
    michiSchoolsApiService.fetchSchools.mockResolvedValueOnce(mockSchoolsData);

    const { result } = renderHook(() => useMichiSchools());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.schools).toHaveLength(1);
    expect(result.current.schools[0].name).toBe('Tokyo Auto School');
    expect(result.current.schools[0].price).toBe('¥300,000');
  });

  it('should post new school with validation', async () => {
    const schoolPayload = {
      name: 'Fuji Gasshuku Academy',
      courses: [{ name: 'Oogata Course', license: 'Heavy', price: 280000 }],
      location: { prefecture: 'Tokyo', lat: 35.6812, lng: 139.7671 }
    };

    michiSchoolsApiService.fetchSchools.mockResolvedValueOnce([]);
    michiSchoolsApiService.postSchool.mockResolvedValueOnce({ school: schoolPayload });


    const { result } = renderHook(() => useMichiSchools());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let res;
    await act(async () => {
      res = await result.current.postNewSchool(schoolPayload);
    });

    expect(res.success).toBe(true);
    expect(result.current.schools[0].name).toBe('Fuji Gasshuku Academy');
  });
});
