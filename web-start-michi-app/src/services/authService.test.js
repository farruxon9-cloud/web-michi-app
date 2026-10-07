import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getStoredToken, 
  setStoredToken, 
  getStoredUser, 
  setStoredUser, 
  logoutUser,
  checkEmailExists
} from './authService';

describe('authService Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should store and retrieve JWT token correctly', () => {
    setStoredToken('test_jwt_token_123');
    expect(getStoredToken()).toBe('test_jwt_token_123');

    setStoredToken(null);
    expect(getStoredToken()).toBeNull();
  });

  it('should store user session safely without plaintext password', () => {
    const mockUser = { email: 'test@michi.jp', role: 'driver', fullName: 'Test User', password: 'secretpassword123' };
    setStoredUser(mockUser);

    const retrieved = getStoredUser();
    expect(retrieved.email).toBe('test@michi.jp');
    expect(retrieved.password).toBeUndefined();
  });

  it('should clear token and user on logoutUser()', () => {
    setStoredToken('token_abc');
    setStoredUser({ email: 'user@michi.jp' });

    logoutUser();

    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it('should check if email exists via API response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ exists: true })
    });

    const exists = await checkEmailExists('existing@michi.jp');
    expect(exists).toBe(true);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ exists: false })
    });

    const notExists = await checkEmailExists('nonexisting@michi.jp');
    expect(notExists).toBe(false);
  });
});
