'use client';

import { useCallback, useEffect, useState } from 'react';
import { COOKIE_CATEGORIES } from './cookieCategories';
import { useCookieConsent } from './CookieConsentContext';
import type { CookieCategory } from './types';

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookiePreferencesModal({
  isOpen,
  onClose,
}: CookiePreferencesModalProps) {
  const { preferences, setConsent } = useCookieConsent();

  const [localPrefs, setLocalPrefs] = useState<Record<CookieCategory, boolean>>(
    {
      essential: true,
      functional: preferences?.functional ?? false,
      analytics: preferences?.analytics ?? false,
    }
  );

  // Sync local preferences when modal opens or preferences change
  useEffect(() => {
    if (isOpen) {
      setLocalPrefs({
        essential: true,
        functional: preferences?.functional ?? false,
        analytics: preferences?.analytics ?? false,
      });
    }
  }, [isOpen, preferences]);

  const handleToggle = useCallback((category: CookieCategory) => {
    if (category === 'essential') return; // Cannot toggle essential
    setLocalPrefs((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  const handleSave = useCallback(() => {
    setConsent({
      functional: localPrefs.functional,
      analytics: localPrefs.analytics,
      consentTimestamp: new Date().toISOString(),
      consentVersion: '',
    });
    onClose();
  }, [localPrefs, setConsent, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Cookie-Einstellungen"
    >
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Cookie-Einstellungen
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="mb-6 text-sm text-gray-600">
          Hier können Sie Ihre Cookie-Einstellungen granular anpassen. Bitte
          beachten Sie, dass das Deaktivieren einiger Cookie-Kategorien
          Auswirkungen auf Ihre Nutzungserfahrung haben kann.
        </p>

        <div className="space-y-6">
          {COOKIE_CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {category.label}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {category.description}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={localPrefs[category.id]}
                    disabled={category.required}
                    onChange={() => handleToggle(category.id)}
                    className="peer sr-only"
                    aria-label={`${category.label} ${category.required ? '(erforderlich)' : ''}`}
                  />
                  <div
                    className={`h-6 w-11 rounded-full after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full ${
                      category.required
                        ? 'cursor-not-allowed bg-brand-600 opacity-60'
                        : 'bg-gray-300 peer-checked:bg-brand-600'
                    }`}
                  />
                </label>
              </div>

              {category.cookies.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="pb-1 pr-2 font-medium">Name</th>
                        <th className="pb-1 pr-2 font-medium">Zweck</th>
                        <th className="pb-1 pr-2 font-medium">Dauer</th>
                        <th className="pb-1 font-medium">Anbieter</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      {category.cookies.map((cookie) => (
                        <tr key={cookie.name}>
                          <td className="py-1 pr-2 font-mono">{cookie.name}</td>
                          <td className="py-1 pr-2">{cookie.purpose}</td>
                          <td className="py-1 pr-2">{cookie.duration}</td>
                          <td className="py-1">{cookie.provider}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Einstellungen speichern
          </button>
        </div>
      </div>
    </div>
  );
}
