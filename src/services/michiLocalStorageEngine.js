/**
 * 🔒 Michi AI — Privacy-First Local Storage Engine
 * Device-local IndexedDB storage with localStorage fallback.
 */

class MichiLocalStorageEngine {
  constructor() {
    this.dbName = 'MichiAiLocalDatabase';
    this.storeName = 'conversations';
    this.db = null;
    this.dbReadyPromise = this.initIndexedDB();
    this.requestPersistentStorage();
  }

  async requestPersistentStorage() {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      try {
        await navigator.storage.persist();
      } catch (err) {
        console.warn('[MichiLocalStorage] Storage persist warning:', err);
      }
    }
  }

  async initIndexedDB() {
    if (typeof window === 'undefined' || !window.indexedDB) return false;
    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(this.dbName, 1);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('language', 'language', { unique: false });
          }
        };
        request.onsuccess = (e) => {
          this.db = e.target.result;
          resolve(true);
        };
        request.onerror = () => {
          console.warn('[MichiLocalStorage] IndexedDB failed, fallback to localStorage');
          resolve(false);
        };
      } catch (err) {
        console.warn('[MichiLocalStorage] DB Init error:', err);
        resolve(false);
      }
    });
  }

  /**
   * Suhbatni xavfsiz saqlash
   */
  async saveConversation(chatData) {
    await this.dbReadyPromise;

    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      question: chatData.question || '',
      answer: chatData.answer || '',
      language: chatData.language || 'ja',
      category: chatData.category || 'general',
      isError: !!chatData.isError,
      timestamp: new Date().toISOString(),
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      formattedDate: new Date().toLocaleDateString()
    };

    if (this.db) {
      try {
        const tx = this.db.transaction(this.storeName, 'readwrite');
        tx.objectStore(this.storeName).put(entry);
      } catch (e) {
        console.warn('[MichiLocalStorage] IndexedDB write failed:', e);
      }
    }

    // LocalStorage zaxirasi (oxirgi 100 ta xabar bilan cheklangan)
    try {
      const existing = JSON.parse(localStorage.getItem('michi_chat_history') || '[]');
      existing.push(entry);
      localStorage.setItem('michi_chat_history', JSON.stringify(existing.slice(-100)));
    } catch (e) {}

    return entry;
  }

  /**
   * Barcha suhbatlar tarixini olish (saralangan holda)
   */
  async getAllConversations() {
    await this.dbReadyPromise;

    if (this.db) {
      return new Promise((resolve) => {
        try {
          const tx = this.db.transaction(this.storeName, 'readonly');
          const store = tx.objectStore(this.storeName);
          const req = store.getAll();
          
          req.onsuccess = () => {
            const results = req.result || [];
            if (results.length > 0) {
              // Asil massivga tegmasdan yangi teskari massiv qaytarish
              resolve([...results].reverse());
              return;
            }
            resolve(this.getLocalStorageConversations());
          };
          req.onerror = () => resolve(this.getLocalStorageConversations());
        } catch (e) {
          resolve(this.getLocalStorageConversations());
        }
      });
    }
    return this.getLocalStorageConversations();
  }

  getLocalStorageConversations() {
    try {
      const history = JSON.parse(localStorage.getItem('michi_chat_history') || '[]');
      return [...history].reverse();
    } catch {
      return [];
    }
  }

  /**
   * Suhbatlar orasidan so'z bo'yicha qidirish
   */
  async searchConversations(keyword) {
    const all = await this.getAllConversations();
    if (!keyword || !keyword.trim()) return all;
    const q = keyword.toLowerCase().trim();
    return all.filter(item => 
      (item.question && item.question.toLowerCase().includes(q)) ||
      (item.answer && item.answer.toLowerCase().includes(q))
    );
  }

  /**
   * Tarixni JSON fayl ko'rinishida yuklab olish (Export)
   */
  async exportConversationsToFile() {
    const data = await this.getAllConversations();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `michi_ai_conversations_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Fayldan bitta tezkor tranzaksiya orqali import qilish
   */
  async importConversationsFromFile(file) {
    await this.dbReadyPromise;
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (!Array.isArray(imported)) {
            return reject(new Error('Noto\'g\'ri fayl formati'));
          }

          if (this.db) {
            const tx = this.db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            for (const item of imported) {
              if (item.question && item.answer) {
                store.put({
                  ...item,
                  id: item.id || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
                });
              }
            }
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => reject(tx.error);
          } else {
            localStorage.setItem('michi_chat_history', JSON.stringify(imported.slice(-100)));
            resolve(true);
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  /**
   * Barcha lokal ma'lumotlarni to'liq o'chirish (Wipe)
   */
  async clearAllDeviceData() {
    await this.dbReadyPromise;
    localStorage.removeItem('michi_chat_history');
    localStorage.removeItem('michi_ai_memory_cache');
    localStorage.removeItem('michi_cached_jobs');
    localStorage.removeItem('michi_cached_schools');
    localStorage.removeItem('michi_pending_job_posts');
    localStorage.removeItem('michi_pending_school_posts');

    if (this.db) {
      try {
        const tx = this.db.transaction(this.storeName, 'readwrite');
        tx.objectStore(this.storeName).clear();
      } catch (e) {}
    }
    return true;
  }

  // ============================================================
  // FAZA 3: JOBS & SCHOOLS LOCAL CACHING AND OFFLINE QUEUE
  // ============================================================

  cacheJobs(jobsList) {
    try {
      if (Array.isArray(jobsList)) {
        localStorage.setItem('michi_cached_jobs', JSON.stringify({
          timestamp: Date.now(),
          data: jobsList
        }));
      }
    } catch (err) {
      console.warn('[MichiLocalStorage] Cache jobs error:', err);
    }
  }

  getCachedJobs() {
    try {
      const raw = localStorage.getItem('michi_cached_jobs');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.data) ? parsed.data : [];
    } catch {
      return [];
    }
  }

  cacheSchools(schoolsList) {
    try {
      if (Array.isArray(schoolsList)) {
        localStorage.setItem('michi_cached_schools', JSON.stringify({
          timestamp: Date.now(),
          data: schoolsList
        }));
      }
    } catch (err) {
      console.warn('[MichiLocalStorage] Cache schools error:', err);
    }
  }

  getCachedSchools() {
    try {
      const raw = localStorage.getItem('michi_cached_schools');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.data) ? parsed.data : [];
    } catch {
      return [];
    }
  }

  queuePendingJobPost(jobPayload) {
    try {
      const pending = this.getPendingJobPosts();
      pending.push({
        ...jobPayload,
        _clientTimestamp: Date.now()
      });
      localStorage.setItem('michi_pending_job_posts', JSON.stringify(pending));
    } catch (err) {
      console.warn('[MichiLocalStorage] Queue job post error:', err);
    }
  }

  getPendingJobPosts() {
    try {
      const raw = localStorage.getItem('michi_pending_job_posts');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  clearPendingJobPosts() {
    localStorage.removeItem('michi_pending_job_posts');
  }

  queuePendingSchoolPost(schoolPayload) {
    try {
      const pending = this.getPendingSchoolPosts();
      pending.push({
        ...schoolPayload,
        _clientTimestamp: Date.now()
      });
      localStorage.setItem('michi_pending_school_posts', JSON.stringify(pending));
    } catch (err) {
      console.warn('[MichiLocalStorage] Queue school post error:', err);
    }
  }

  getPendingSchoolPosts() {
    try {
      const raw = localStorage.getItem('michi_pending_school_posts');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  clearPendingSchoolPosts() {
    localStorage.removeItem('michi_pending_school_posts');
  }
}

export const michiLocalStorageEngine = new MichiLocalStorageEngine();

