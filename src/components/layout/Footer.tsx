'use client';

import Link from 'next/link';
import { useCookieConsent } from '@/components/cookie-consent/CookieConsentContext';

/** Rechtlich relevante Links im Footer (Impressum, Datenschutz etc.) */
export const FOOTER_LEGAL_LINKS: Array<{ href: string; label: string }> = [
  { href: '/impressum', label: 'Impressum' },
  { href: '/datenschutz', label: 'Datenschutzerklärung' },
];

export default function Footer() {
  const { openPreferences } = useCookieConsent();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} possibility GmbH. Alle Rechte
            vorbehalten.
          </p>
          <nav aria-label="Footer-Navigation" className="flex gap-4">
            {FOOTER_LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={openPreferences}
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              Cookie-Einstellungen
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
