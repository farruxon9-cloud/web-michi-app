import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateRegionTileUrls, downloadRegionTiles, isRegionCached } from './offlineTileDownloader';

describe('Offline Map Tile Downloader Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Mock global fetch
    globalThis.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ success: true })
      })
    );

    // Mock global caches API
    const mockCache = {
      match: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(true)
    };

    globalThis.caches = {
      open: vi.fn().mockResolvedValue(mockCache),
      match: vi.fn().mockResolvedValue(null)
    };
  });

  describe('generateRegionTileUrls', () => {
    it('should generate slippy map tile URLs for valid prefecture keys', () => {
      const urls = generateRegionTileUrls('tokyo');
      expect(urls.length).toBeGreaterThan(0);
      expect(urls[0]).toContain('basemaps.cartocdn.com');
      expect(urls[urls.length - 1]).toContain('.png');
    });

    it('should return empty list for invalid prefecture keys', () => {
      const urls = generateRegionTileUrls('unknown_prefecture');
      expect(urls).toEqual([]);
    });
  });

  describe('downloadRegionTiles', () => {
    it('should download and cache generated tile URLs successfully', async () => {
      const progressTracker = [];
      const onProgress = (percent) => progressTracker.push(percent);

      const result = await downloadRegionTiles('tokyo', onProgress);
      
      expect(result).toBe(true);
      expect(progressTracker.length).toBeGreaterThan(0);
      expect(progressTracker[progressTracker.length - 1]).toBe(100);
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it('should gracefully return false and 100% progress for invalid prefectures', async () => {
      const progressTracker = [];
      const onProgress = (percent) => progressTracker.push(percent);

      const result = await downloadRegionTiles('unknown', onProgress);

      expect(result).toBe(false);
      expect(progressTracker).toEqual([100]);
    });
  });

  describe('isRegionCached', () => {
    it('should return false if some sample tiles are not cached', async () => {
      const cached = await isRegionCached('tokyo');
      expect(cached).toBe(false);
    });

    it('should return true if sample tiles match existing cache hits', async () => {
      const mockCache = {
        match: vi.fn().mockResolvedValue({ status: 200 })
      };
      globalThis.caches.open = vi.fn().mockResolvedValue(mockCache);

      const cached = await isRegionCached('tokyo');
      expect(cached).toBe(true);
    });
  });
});
