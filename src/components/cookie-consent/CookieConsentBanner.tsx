'use client';

import { useCookieConsent } from './CookieConsentContext';

export default function CookieConsentBanner() {
  const { hasConsented, setConsent, openPreferences } = useCookieConsent();

  if (hasConsented) {
    return null;
  }

  const handleAcceptAll = () => {
    setConsent({
      functional: true,
      analytics: true,
      consentTimestamp: new Date().toISOString(),
      consentVersion: '',
    });
  };

  const handleEssentialOnly = () => {
    setConsent({
      functional: false,
      analytics: false,
      consentTimestamp: new Date().toISOString(),
      consentVersion: '',
    });
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie-Einwilligung"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white p-4 shadow-lg sm:p-6"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-4">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Cookie-Einstellungen
          </h2>
          <p className="text-sm text-gray-600">
            Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf
            unserer Website zu bieten. Sie können auswählen, welche Kategorien
            von Cookies Sie zulassen möchten. Essenzielle Cookies sind für den
            Betrieb der Website notwendig und können nicht deaktiviert werden.{' '}
            <a
              href="/datenschutz"
              className="text-brand-600 underline hover:text-brand-800"
            >
              Mehr erfahren
            </a>
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={openPreferences}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Einstellungen anpassen
          </button>
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Nur essenzielle Cookies
          </button>
          <button
            type="button"
            onClick={handleAcceptAll}
            className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
