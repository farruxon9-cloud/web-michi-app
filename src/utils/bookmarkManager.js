/**
 * Bookmark / Favorites Manager for saved locations in Japan.
 * Stores user-pinned locations with categories in localStorage.
 */

const BOOKMARKS_STORAGE_KEY = 'michi_bookmarks';

// Default categories for truck driver navigation
export const BOOKMARK_CATEGORIES = {
  home: { id: 'home', label: 'Home', jaLabel: 'ホーム', uzLabel: 'Uy', icon: '🏠', color: '#30D158' },
  work: { id: 'work', label: 'Work', jaLabel: '勤務先', uzLabel: 'Ish', icon: '🏢', color: '#0A84FF' },
  cargo: { id: 'cargo', label: 'Cargo Center', jaLabel: '物流拠点', uzLabel: 'Ombor', icon: '📦', color: '#FF9500' },
  fuel: { id: 'fuel', label: 'Gas Station', jaLabel: 'ガソリンスタンド', uzLabel: 'Yoqilg\'i', icon: '⛽', color: '#FF453A' },
  rest: { id: 'rest', label: 'Rest Area', jaLabel: '休憩所', uzLabel: 'Hordiq', icon: '🅿️', color: '#5856D6' },
  truckstop: { id: 'truckstop', label: 'Truck Stop', jaLabel: 'トラックステーション', uzLabel: 'Bekat', icon: '🚛', color: '#FF6B00' },
  custom: { id: 'custom', label: 'Custom', jaLabel: 'カスタム', uzLabel: 'Moslashtirilgan', icon: '📍', color: '#8E8E93' }
};

/**
 * Load all bookmarks from localStorage
 * @returns {Array} Array of bookmark objects
 */
export function loadBookmarks() {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[Bookmarks] Failed to load bookmarks:', e);
    return [];
  }
}

/**
 * Save bookmarks array to localStorage
 * @param {Array} bookmarks
 */
function persistBookmarks(bookmarks) {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (e) {
    console.warn('[Bookmarks] Failed to persist bookmarks:', e);
  }
}

/**
 * Add a new bookmark
 * @param {Object} bookmark - { name, lat, lng, category, address? }
 * @returns {Object} The created bookmark with generated id and timestamp
 */
export function addBookmark({ name, lat, lng, category = 'custom', address = '' }) {
  const bookmarks = loadBookmarks();
  const newBookmark = {
    id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    lat,
    lng,
    category,
    address,
    createdAt: new Date().toISOString()
  };
  bookmarks.push(newBookmark);
  persistBookmarks(bookmarks);
  return newBookmark;
}

/**
 * Remove a bookmark by id
 * @param {string} bookmarkId
 * @returns {boolean} True if bookmark was found and removed
 */
export function removeBookmark(bookmarkId) {
  const bookmarks = loadBookmarks();
  const filtered = bookmarks.filter(b => b.id !== bookmarkId);
  if (filtered.length === bookmarks.length) return false;
  persistBookmarks(filtered);
  return true;
}

/**
 * Update an existing bookmark
 * @param {string} bookmarkId
 * @param {Object} updates - Partial updates { name?, category?, address? }
 * @returns {Object|null} Updated bookmark or null if not found
 */
export function updateBookmark(bookmarkId, updates) {
  const bookmarks = loadBookmarks();
  const idx = bookmarks.findIndex(b => b.id === bookmarkId);
  if (idx === -1) return null;
  bookmarks[idx] = { ...bookmarks[idx], ...updates };
  persistBookmarks(bookmarks);
  return bookmarks[idx];
}

/**
 * Get bookmarks filtered by category
 * @param {string} categoryId
 * @returns {Array}
 */
export function getBookmarksByCategory(categoryId) {
  return loadBookmarks().filter(b => b.category === categoryId);
}

/**
 * Export all bookmarks as JSON string
 * @returns {string} JSON string of all bookmarks
 */
export function exportBookmarks() {
  return JSON.stringify(loadBookmarks(), null, 2);
}

/**
 * Import bookmarks from JSON string (merges with existing)
 * @param {string} jsonStr
 * @returns {number} Number of bookmarks imported
 */
export function importBookmarks(jsonStr) {
  try {
    const imported = JSON.parse(jsonStr);
    if (!Array.isArray(imported)) return 0;

    const existing = loadBookmarks();
    const existingIds = new Set(existing.map(b => b.id));

    let count = 0;
    for (const bm of imported) {
      if (bm.id && bm.name && bm.lat && bm.lng && !existingIds.has(bm.id)) {
        existing.push(bm);
        count++;
      }
    }
    persistBookmarks(existing);
    return count;
  } catch (e) {
    console.warn('[Bookmarks] Failed to import bookmarks:', e);
    return 0;
  }
}
