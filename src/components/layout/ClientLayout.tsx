'use client';

import type { ReactNode } from 'react';
import { CookieConsentProvider } from '@/components/cookie-consent/CookieConsentContext';
import CookieConsentBanner from '@/components/cookie-consent/CookieConsentBanner';
import CookiePreferencesModal from '@/components/cookie-consent/CookiePreferencesModal';
import { useCookieConsent } from '@/components/cookie-consent/CookieConsentContext';
import Footer from './Footer';

function CookieConsentUI() {
  const { isPreferencesOpen, closePreferences } = useCookieConsent();

  return (
    <>
      <CookieConsentBanner />
      <CookiePreferencesModal
        isOpen={isPreferencesOpen}
        onClose={closePreferences}
      />
    </>
  );
}

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <CookieConsentProvider>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
      <CookieConsentUI />
    </CookieConsentProvider>
  );
}
