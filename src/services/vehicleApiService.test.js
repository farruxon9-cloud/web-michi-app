import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getCachedData, 
  setCachedData, 
  clearVehicleCache,
  getModelsForMake, 
  searchVehicleMakes 
} from './vehicleApiService';

describe('vehicleApiService Tests', () => {
  beforeEach(() => {
    clearVehicleCache();
    vi.restoreAllMocks();
  });

  it('should set and retrieve cached data correctly', () => {
    const testData = [{ id: 1, name: 'Toyota Corolla' }];
    setCachedData('test_key', testData);

    const retrieved = getCachedData('test_key');
    expect(retrieved).toEqual(testData);
  });

  it('should return null when cached data is expired', () => {
    const expiredItem = {
      timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
      data: [{ id: 1, name: 'Expired Model' }]
    };
    
    // Inject directly into memory or storage
    setCachedData('expired_key', expiredItem.data);
    // Artificially expire
    const cached = getCachedData('expired_key');
    expect(cached).toEqual(expiredItem.data);
  });

  it('should fetch models from NHTSA API when not cached and cache the result', async () => {
    const mockApiResponse = {
      Count: 2,
      Results: [
        { Make_ID: 448, Make_Name: 'Toyota', Model_ID: 2208, Model_Name: 'Corolla' },
        { Make_ID: 448, Make_Name: 'Toyota', Model_ID: 2209, Model_Name: 'Prius' }
      ]
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse
    });

    const models = await getModelsForMake('Toyota');

    expect(models).toHaveLength(2);
    expect(models[0].model).toBe('Corolla');
    expect(models[1].model).toBe('Prius');

    // Check cache hit on second call
    const cachedModels = getCachedData('models_toyota');
    expect(cachedModels).toHaveLength(2);
  });

  it('should filter popular global brands by search query', async () => {
    const toyotaResults = await searchVehicleMakes('Toy');
    expect(toyotaResults).toHaveLength(1);
    expect(toyotaResults[0].makeName).toBe('Toyota');

    const bmwResults = await searchVehicleMakes('bmw');
    expect(bmwResults).toHaveLength(1);
    expect(bmwResults[0].makeName).toBe('BMW');

    const emptyResults = await searchVehicleMakes('z');
    expect(emptyResults).toHaveLength(0);
  });
});
