import type { CookieCategory, ConsentPreferences } from './types';
import { datenschutzContent } from '@/content/datenschutz';

const STORAGE_KEY = 'cookie_consent';

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const CookieConsentManager = {
  /**
   * Returns the current consent preferences from localStorage.
   * Returns null if no consent has been given yet.
   */
  getConsent(): ConsentPreferences | null {
    if (!isLocalStorageAvailable()) {
      return null;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored) as ConsentPreferences;

      // Validate the structure
      if (
        typeof parsed.essential !== 'boolean' ||
        typeof parsed.functional !== 'boolean' ||
        typeof parsed.analytics !== 'boolean' ||
        typeof parsed.consentTimestamp !== 'string' ||
        typeof parsed.consentVersion !== 'string'
      ) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  },

  /**
   * Saves consent preferences to localStorage.
   * The `essential` property is always forced to `true`.
   */
  setConsent(prefs: ConsentPreferences): void {
    if (!isLocalStorageAvailable()) {
      return;
    }

    const safePrefs: ConsentPreferences = {
      essential: true,
      functional: prefs.functional,
      analytics: prefs.analytics,
      consentTimestamp: prefs.consentTimestamp || new Date().toISOString(),
      consentVersion: prefs.consentVersion || datenschutzContent.version,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(safePrefs));
  },

  /**
   * Returns whether the user has already given consent (any choice).
   */
  hasConsented(): boolean {
    return this.getConsent() !== null;
  },

  /**
   * Revokes all consent and removes non-essential cookies.
   * Clears the consent preferences from localStorage.
   */
  revokeConsent(): void {
    if (!isLocalStorageAvailable()) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);

    // Remove all non-essential cookies
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const name = cookie.split('=')[0].trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      }
    }
  },

  /**
   * Returns whether a specific cookie category is currently allowed.
   * Essential cookies are always allowed.
   */
  isCategoryAllowed(category: CookieCategory): boolean {
    if (category === 'essential') {
      return true;
    }

    const consent = this.getConsent();
    if (!consent) {
      return false;
    }

    return consent[category] === true;
  },
};
