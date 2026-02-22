export type CookieCategory = 'essential' | 'functional' | 'analytics';

export interface CookieInfo {
  name: string;
  type: 'HTTP Cookie' | 'Local Storage' | 'Session Storage';
  purpose: string;
  duration: string;
  provider: string;
}

export interface CookieCategoryDefinition {
  id: CookieCategory;
  label: string;
  description: string;
  required: boolean;
  cookies: CookieInfo[];
}

export interface ConsentPreferences {
  essential: true;
  functional: boolean;
  analytics: boolean;
  consentTimestamp: string;
  consentVersion: string;
}

export interface CookieConsentState {
  hasConsented: boolean;
  preferences: ConsentPreferences | null;
  setConsent: (prefs: Omit<ConsentPreferences, 'essential'>) => void;
  revokeConsent: () => void;
  isCategoryAllowed: (category: CookieCategory) => boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  isPreferencesOpen: boolean;
}
