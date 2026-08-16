import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadBookmarks, addBookmark, removeBookmark, updateBookmark, getBookmarksByCategory, exportBookmarks, importBookmarks, BOOKMARK_CATEGORIES } from './bookmarkManager';

// Mock localStorage for Vitest node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();
globalThis.localStorage = localStorageMock;

describe('Bookmark Manager Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  describe('BOOKMARK_CATEGORIES', () => {
    it('should have required category keys', () => {
      expect(BOOKMARK_CATEGORIES.home).toBeDefined();
      expect(BOOKMARK_CATEGORIES.work).toBeDefined();
      expect(BOOKMARK_CATEGORIES.cargo).toBeDefined();
      expect(BOOKMARK_CATEGORIES.fuel).toBeDefined();
      expect(BOOKMARK_CATEGORIES.rest).toBeDefined();
      expect(BOOKMARK_CATEGORIES.truckstop).toBeDefined();
      expect(BOOKMARK_CATEGORIES.custom).toBeDefined();
    });

    it('each category should have id, label, jaLabel, icon, and color', () => {
      Object.values(BOOKMARK_CATEGORIES).forEach(cat => {
        expect(cat.id).toBeDefined();
        expect(cat.label).toBeDefined();
        expect(cat.jaLabel).toBeDefined();
        expect(cat.icon).toBeDefined();
        expect(cat.color).toBeDefined();
      });
    });
  });

  describe('loadBookmarks', () => {
    it('should return empty array when no bookmarks exist', () => {
      expect(loadBookmarks()).toEqual([]);
    });

    it('should return saved bookmarks from localStorage', () => {
      const data = [{ id: 'bm_1', name: 'Test', lat: 35.6, lng: 139.7, category: 'home' }];
      localStorage.setItem('michi_bookmarks', JSON.stringify(data));
      expect(loadBookmarks()).toEqual(data);
    });
  });

  describe('addBookmark', () => {
    it('should add a bookmark and return it with an id and timestamp', () => {
      const bm = addBookmark({ name: 'Tokyo Tower', lat: 35.6586, lng: 139.7454, category: 'custom' });
      expect(bm.id).toContain('bm_');
      expect(bm.name).toBe('Tokyo Tower');
      expect(bm.lat).toBe(35.6586);
      expect(bm.lng).toBe(139.7454);
      expect(bm.createdAt).toBeDefined();
    });

    it('should persist bookmark in localStorage', () => {
      addBookmark({ name: 'Point A', lat: 35.0, lng: 139.0 });
      const stored = loadBookmarks();
      expect(stored.length).toBe(1);
      expect(stored[0].name).toBe('Point A');
    });
  });

  describe('removeBookmark', () => {
    it('should remove a bookmark by id and return true', () => {
      const bm = addBookmark({ name: 'Delete Me', lat: 35.0, lng: 139.0 });
      expect(removeBookmark(bm.id)).toBe(true);
      expect(loadBookmarks().length).toBe(0);
    });

    it('should return false if bookmark not found', () => {
      expect(removeBookmark('nonexistent')).toBe(false);
    });
  });

  describe('updateBookmark', () => {
    it('should update a bookmark name and category', () => {
      const bm = addBookmark({ name: 'Original', lat: 35.0, lng: 139.0, category: 'custom' });
      const updated = updateBookmark(bm.id, { name: 'Updated', category: 'home' });
      expect(updated.name).toBe('Updated');
      expect(updated.category).toBe('home');
    });

    it('should return null for non-existent bookmark', () => {
      expect(updateBookmark('fake_id', { name: 'X' })).toBeNull();
    });
  });

  describe('getBookmarksByCategory', () => {
    it('should filter bookmarks by category', () => {
      addBookmark({ name: 'Home A', lat: 35.0, lng: 139.0, category: 'home' });
      addBookmark({ name: 'Work B', lat: 35.1, lng: 139.1, category: 'work' });
      addBookmark({ name: 'Home C', lat: 35.2, lng: 139.2, category: 'home' });

      const homeBookmarks = getBookmarksByCategory('home');
      expect(homeBookmarks.length).toBe(2);
      expect(homeBookmarks.every(b => b.category === 'home')).toBe(true);
    });
  });

  describe('exportBookmarks / importBookmarks', () => {
    it('should export and import bookmarks', () => {
      addBookmark({ name: 'Export A', lat: 35.0, lng: 139.0 });
      addBookmark({ name: 'Export B', lat: 35.1, lng: 139.1 });

      const exported = exportBookmarks();
      localStorage.clear();
      expect(loadBookmarks().length).toBe(0);

      const count = importBookmarks(exported);
      expect(count).toBe(2);
      expect(loadBookmarks().length).toBe(2);
    });

    it('should not duplicate on re-import', () => {
      addBookmark({ name: 'Dup Test', lat: 35.0, lng: 139.0 });
      const exported = exportBookmarks();
      const count = importBookmarks(exported);
      expect(count).toBe(0); // Already exists
    });

    it('should return 0 on invalid JSON', () => {
      expect(importBookmarks('not json')).toBe(0);
    });
  });
});
