'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  CookieCategory,
  CookieConsentState,
  ConsentPreferences,
} from './types';
import { CookieConsentManager } from './CookieConsentManager';
import { datenschutzContent } from '@/content/datenschutz';

const defaultState: CookieConsentState = {
  hasConsented: false,
  preferences: null,
  setConsent: () => undefined,
  revokeConsent: () => undefined,
  isCategoryAllowed: () => false,
  openPreferences: () => undefined,
  closePreferences: () => undefined,
  isPreferencesOpen: false,
};

const CookieConsentCtx = createContext<CookieConsentState>(defaultState);

interface CookieConsentProviderProps {
  children: ReactNode;
}

export function CookieConsentProvider({
  children,
}: CookieConsentProviderProps) {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(
    null
  );
  const [hasConsented, setHasConsented] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    const stored = CookieConsentManager.getConsent();
    if (stored) {
      setPreferences(stored);
      setHasConsented(true);
    }
  }, []);

  const setConsent = useCallback(
    (prefs: Omit<ConsentPreferences, 'essential'>) => {
      const fullPrefs: ConsentPreferences = {
        essential: true,
        functional: prefs.functional,
        analytics: prefs.analytics,
        consentTimestamp: prefs.consentTimestamp || new Date().toISOString(),
        consentVersion: prefs.consentVersion || datenschutzContent.version,
      };

      CookieConsentManager.setConsent(fullPrefs);
      setPreferences(fullPrefs);
      setHasConsented(true);
      setIsPreferencesOpen(false);
    },
    []
  );

  const revokeConsent = useCallback(() => {
    CookieConsentManager.revokeConsent();
    setPreferences(null);
    setHasConsented(false);
  }, []);

  const isCategoryAllowed = useCallback(
    (category: CookieCategory): boolean => {
      if (category === 'essential') return true;
      if (!preferences) return false;
      return preferences[category] === true;
    },
    [preferences]
  );

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false);
  }, []);

  const value = useMemo<CookieConsentState>(
    () => ({
      hasConsented,
      preferences,
      setConsent,
      revokeConsent,
      isCategoryAllowed,
      openPreferences,
      closePreferences,
      isPreferencesOpen,
    }),
    [
      hasConsented,
      preferences,
      setConsent,
      revokeConsent,
      isCategoryAllowed,
      openPreferences,
      closePreferences,
      isPreferencesOpen,
    ]
  );

  return (
    <CookieConsentCtx.Provider value={value}>
      {children}
    </CookieConsentCtx.Provider>
  );
}

export function useCookieConsent(): CookieConsentState {
  const context = useContext(CookieConsentCtx);
  if (!context) {
    throw new Error(
      'useCookieConsent must be used within a CookieConsentProvider'
    );
  }
  return context;
}
