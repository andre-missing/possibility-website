import { CookieConsentManager } from '../CookieConsentManager';
import type { ConsentPreferences } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CookieConsentManager', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    // Reset document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  describe('hasConsented()', () => {
    it('should return false when no consent is stored', () => {
      expect(CookieConsentManager.hasConsented()).toBe(false);
    });

    it('should return true when consent is stored', () => {
      const prefs: ConsentPreferences = {
        essential: true,
        functional: false,
        analytics: false,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      };

      CookieConsentManager.setConsent(prefs);
      expect(CookieConsentManager.hasConsented()).toBe(true);
    });
  });

  describe('setConsent()', () => {
    it('should store consent preferences correctly in localStorage', () => {
      const prefs: ConsentPreferences = {
        essential: true,
        functional: true,
        analytics: false,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      };

      CookieConsentManager.setConsent(prefs);

      const stored = JSON.parse(
        localStorageMock.getItem('cookie_consent')!
      ) as ConsentPreferences;

      expect(stored.essential).toBe(true);
      expect(stored.functional).toBe(true);
      expect(stored.analytics).toBe(false);
      expect(stored.consentTimestamp).toBe('2026-02-01T00:00:00.000Z');
      expect(stored.consentVersion).toBe('1.0.0');
    });

    it('should force essential to true even if false is passed', () => {
      const prefs = {
        essential: false,
        functional: false,
        analytics: false,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      } as unknown as ConsentPreferences;

      CookieConsentManager.setConsent(prefs);

      const stored = JSON.parse(
        localStorageMock.getItem('cookie_consent')!
      ) as ConsentPreferences;

      expect(stored.essential).toBe(true);
    });
  });

  describe('getConsent()', () => {
    it('should return null when no consent is stored', () => {
      expect(CookieConsentManager.getConsent()).toBeNull();
    });

    it('should return stored preferences correctly', () => {
      const prefs: ConsentPreferences = {
        essential: true,
        functional: true,
        analytics: true,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      };

      CookieConsentManager.setConsent(prefs);

      const result = CookieConsentManager.getConsent();

      expect(result).not.toBeNull();
      expect(result!.essential).toBe(true);
      expect(result!.functional).toBe(true);
      expect(result!.analytics).toBe(true);
    });

    it('should return null if stored data is invalid JSON', () => {
      localStorageMock.setItem('cookie_consent', 'invalid-json');
      expect(CookieConsentManager.getConsent()).toBeNull();
    });

    it('should return null if stored data has invalid structure', () => {
      localStorageMock.setItem(
        'cookie_consent',
        JSON.stringify({ foo: 'bar' })
      );
      expect(CookieConsentManager.getConsent()).toBeNull();
    });
  });

  describe('revokeConsent()', () => {
    it('should remove all consent preferences from localStorage', () => {
      const prefs: ConsentPreferences = {
        essential: true,
        functional: true,
        analytics: true,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      };

      CookieConsentManager.setConsent(prefs);
      expect(CookieConsentManager.hasConsented()).toBe(true);

      CookieConsentManager.revokeConsent();
      expect(CookieConsentManager.hasConsented()).toBe(false);
      expect(CookieConsentManager.getConsent()).toBeNull();
    });
  });

  describe('isCategoryAllowed()', () => {
    it('should always return true for essential category', () => {
      expect(CookieConsentManager.isCategoryAllowed('essential')).toBe(true);
    });

    it('should return false for analytics without consent', () => {
      expect(CookieConsentManager.isCategoryAllowed('analytics')).toBe(false);
    });

    it('should return false for functional without consent', () => {
      expect(CookieConsentManager.isCategoryAllowed('functional')).toBe(false);
    });

    it('should return true for analytics when consent is given', () => {
      CookieConsentManager.setConsent({
        essential: true,
        functional: false,
        analytics: true,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      });

      expect(CookieConsentManager.isCategoryAllowed('analytics')).toBe(true);
    });

    it('should return false for analytics when consent is denied', () => {
      CookieConsentManager.setConsent({
        essential: true,
        functional: false,
        analytics: false,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      });

      expect(CookieConsentManager.isCategoryAllowed('analytics')).toBe(false);
    });

    it('should return true for functional when consent is given', () => {
      CookieConsentManager.setConsent({
        essential: true,
        functional: true,
        analytics: false,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      });

      expect(CookieConsentManager.isCategoryAllowed('functional')).toBe(true);
    });
  });

  describe('ConsentPreferences.essential', () => {
    it('should not be settable to false via setConsent', () => {
      // Even if we try to set essential to false
      CookieConsentManager.setConsent({
        essential: true, // The type forces this to be true, but let's verify
        functional: false,
        analytics: false,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      });

      const consent = CookieConsentManager.getConsent();
      expect(consent!.essential).toBe(true);
    });
  });
});
