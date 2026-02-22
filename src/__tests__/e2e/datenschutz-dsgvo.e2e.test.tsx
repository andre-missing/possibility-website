/**
 * E2E-Style Tests: Datenschutzerklärung (DSGVO-Pflicht)
 *
 * Ticket: Datenschutzerklärung (DSGVO-Pflicht) (3b635132)
 *
 * Diese Tests simulieren End-to-End User-Flows für die DSGVO-
 * Datenschutzfunktionalität. Sie testen das vollständige Zusammenspiel
 * aller Komponenten in realistischen Benutzerszenarien.
 *
 * Hinweis: Da kein E2E-Framework (Playwright/Cypress) konfiguriert ist,
 * werden diese Tests als Component-Integration-Tests mit Testing Library
 * implementiert, die E2E-Szenarien abbilden.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatenschutzPage from '@/app/datenschutz/page';
import CookieConsentBanner from '@/components/cookie-consent/CookieConsentBanner';
import CookiePreferencesModal from '@/components/cookie-consent/CookiePreferencesModal';
import {
  CookieConsentProvider,
  useCookieConsent,
} from '@/components/cookie-consent/CookieConsentContext';
import ContactForm from '@/components/contact/ContactForm';
import Footer from '@/components/layout/Footer';
import ClientLayout from '@/components/layout/ClientLayout';
import { datenschutzContent } from '@/content/datenschutz';

// ============================================================================
// Mocks
// ============================================================================

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

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

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Simuliert eine vollständige Seite mit allen DSGVO-relevanten Elementen
 */
function FullDSGVOPage() {
  return (
    <ClientLayout>
      <main>
        <h1>Willkommen</h1>
        <section id="kontakt">
          <h2>Kontakt</h2>
          <ContactForm />
        </section>
      </main>
    </ClientLayout>
  );
}

/**
 * Komponente die Banner UND Modal zusammen rendert (wie im echten Layout)
 */
function CookieConsentFullUI() {
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

function renderCookieConsentFull() {
  return render(
    <CookieConsentProvider>
      <CookieConsentFullUI />
    </CookieConsentProvider>
  );
}

// ============================================================================
// Setup / Teardown
// ============================================================================

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

// ============================================================================
// E2E Szenario 1: Erstbesucher liest die Datenschutzerklärung
// ============================================================================

describe('E2E: Erstbesucher liest die Datenschutzerklärung', () => {
  it('Benutzer öffnet die Datenschutzseite und sieht alle DSGVO-Pflichtinformationen', () => {
    render(<DatenschutzPage />);

    // 1. Seite wird geladen
    expect(
      screen.getByRole('heading', { name: 'Datenschutzerklärung' })
    ).toBeInTheDocument();

    // 2. Inhaltsverzeichnis ist sichtbar
    expect(
      screen.getByRole('navigation', { name: /Inhaltsverzeichnis/i })
    ).toBeInTheDocument();

    // 3. Alle Pflichtsektionen sind vorhanden
    const pflichtSektionen = [
      'verantwortlicher',
      'rechtsgrundlagen',
      'betroffenenrechte',
      'server-logfiles',
      'kontaktformular',
      'cookies',
    ];

    pflichtSektionen.forEach((id) => {
      expect(document.getElementById(id)).toBeInTheDocument();
    });

    // 4. Aktuelles Datum ist angezeigt
    expect(screen.getByText(/Stand:.*Februar 2026/)).toBeInTheDocument();
  });

  it('Benutzer navigiert über das Inhaltsverzeichnis zu einer Sektion', () => {
    render(<DatenschutzPage />);

    const nav = screen.getByRole('navigation', {
      name: /Inhaltsverzeichnis/i,
    });

    // Benutzer findet "Cookies und Einwilligungsmanagement" im Inhaltsverzeichnis
    const cookieLinks = screen.getAllByText(
      /Cookies und Einwilligungsmanagement/i
    );
    // At least one of them is in the ToC nav
    const tocLink = cookieLinks.find((el) => nav.contains(el));
    expect(tocLink).toBeTruthy();
    expect(tocLink?.closest('a')).toHaveAttribute('href', '#cookies');

    // Die Cookie-Sektion existiert
    const cookieSection = document.getElementById('cookies');
    expect(cookieSection).toBeInTheDocument();
  });

  it('Benutzer sieht die hierarchische Struktur der Datenschutzerklärung', () => {
    render(<DatenschutzPage />);

    // Multiple heading levels are used
    const allHeadings = screen.getAllByRole('heading');
    expect(allHeadings.length).toBeGreaterThan(5);

    // There are h2 headings from subsections and ToC
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThan(0);
  });

  it('Benutzer liest die Informationen zu seinen DSGVO-Rechten', () => {
    render(<DatenschutzPage />);

    // Betroffenenrechte-Sektion vorhanden
    const section = document.getElementById('betroffenenrechte');
    expect(section).toBeInTheDocument();

    // Alle 8 Rechte sind aufgelistet (use getByText for unique partial matches)
    expect(screen.getByText(/Auskunftsrecht.*Art\. 15/)).toBeInTheDocument();
    expect(
      screen.getByText(/Recht auf Berichtigung.*Art\. 16/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Recht auf Löschung.*Art\. 17/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Recht auf Einschränkung.*Art\. 18/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Recht auf Datenübertragbarkeit.*Art\. 20/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Widerspruchsrecht.*Art\. 21/)).toBeInTheDocument();
    expect(screen.getByText(/Recht auf Widerruf.*Art\. 7/)).toBeInTheDocument();
    expect(screen.getByText(/Beschwerderecht.*Art\. 77/)).toBeInTheDocument();
  });
});

// ============================================================================
// E2E Szenario 2: Cookie-Consent Erstbesucher-Flow
// ============================================================================

describe('E2E: Cookie-Consent Erstbesucher-Flow', () => {
  it('Benutzer sieht Banner → akzeptiert alle → Banner verschwindet', () => {
    renderCookieConsentFull();

    // 1. Banner ist sichtbar
    expect(
      screen.getByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).toBeInTheDocument();

    // 2. Benutzer klickt "Alle akzeptieren"
    fireEvent.click(screen.getByRole('button', { name: /Alle akzeptieren/i }));

    // 3. Banner verschwindet
    expect(
      screen.queryByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).not.toBeInTheDocument();

    // 4. Consent ist gespeichert
    const consentCall = localStorageMock.setItem.mock.calls.find(
      (call: string[]) => call[0] === 'cookie_consent'
    );
    expect(consentCall).toBeTruthy();

    const stored = JSON.parse(consentCall![1]);
    expect(stored.essential).toBe(true);
    expect(stored.functional).toBe(true);
    expect(stored.analytics).toBe(true);
  });

  it('Benutzer sieht Banner → wählt nur essenzielle → Banner verschwindet', () => {
    renderCookieConsentFull();

    // 1. Banner ist sichtbar
    expect(
      screen.getByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).toBeInTheDocument();

    // 2. Benutzer klickt "Nur essenzielle Cookies"
    fireEvent.click(
      screen.getByRole('button', { name: /Nur essenzielle Cookies/i })
    );

    // 3. Banner verschwindet
    expect(
      screen.queryByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).not.toBeInTheDocument();

    // 4. Nur essenzielle Cookies sind erlaubt
    const consentCall = localStorageMock.setItem.mock.calls.find(
      (call: string[]) => call[0] === 'cookie_consent'
    );
    expect(consentCall).toBeTruthy();

    const stored = JSON.parse(consentCall![1]);
    expect(stored.essential).toBe(true);
    expect(stored.functional).toBe(false);
    expect(stored.analytics).toBe(false);
  });

  it('Benutzer öffnet Einstellungen → wählt granular → speichert', () => {
    renderCookieConsentFull();

    // 1. Banner ist sichtbar
    expect(
      screen.getByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).toBeInTheDocument();

    // 2. Benutzer klickt "Einstellungen anpassen"
    fireEvent.click(
      screen.getByRole('button', { name: /Einstellungen anpassen/i })
    );

    // 3. Präferenzen-Modal öffnet sich
    const modal = screen.getByRole('dialog', {
      name: /Cookie-Einstellungen/i,
    });
    expect(modal).toBeInTheDocument();

    // 4. Essenzielle Cookies sind aktiviert und deaktiviert (disabled)
    const essentialCheckbox = screen.getByRole('checkbox', {
      name: /Essenzielle Cookies/i,
    });
    expect(essentialCheckbox).toBeChecked();
    expect(essentialCheckbox).toBeDisabled();

    // 5. Funktionale Cookies aktivieren
    const functionalCheckbox = screen.getByRole('checkbox', {
      name: /Funktionale Cookies/i,
    });
    expect(functionalCheckbox).not.toBeChecked();
    fireEvent.click(functionalCheckbox);
    expect(functionalCheckbox).toBeChecked();

    // 6. Analytics NICHT aktivieren (bleibt deaktiviert)
    const analyticsCheckbox = screen.getByRole('checkbox', {
      name: /Analyse & Tracking/i,
    });
    expect(analyticsCheckbox).not.toBeChecked();

    // 7. Speichern
    fireEvent.click(
      screen.getByRole('button', { name: /Einstellungen speichern/i })
    );

    // 8. Consent ist gespeichert mit korrekten Werten
    const consentCall = localStorageMock.setItem.mock.calls.find(
      (call: string[]) => call[0] === 'cookie_consent'
    );
    expect(consentCall).toBeTruthy();

    const stored = JSON.parse(consentCall![1]);
    expect(stored.essential).toBe(true);
    expect(stored.functional).toBe(true);
    expect(stored.analytics).toBe(false);
  });

  it('Benutzer öffnet Einstellungen → bricht ab → Banner bleibt', () => {
    renderCookieConsentFull();

    // 1. Einstellungen öffnen
    fireEvent.click(
      screen.getByRole('button', { name: /Einstellungen anpassen/i })
    );

    // 2. Modal ist offen
    expect(
      screen.getByRole('dialog', { name: /Cookie-Einstellungen/i })
    ).toBeInTheDocument();

    // 3. Abbrechen klicken
    fireEvent.click(screen.getByRole('button', { name: /Abbrechen/i }));

    // 4. Banner sollte noch/wieder sichtbar sein
    expect(
      screen.getByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).toBeInTheDocument();
  });

  it('Benutzer öffnet Einstellungen → schließt via X-Button', () => {
    renderCookieConsentFull();

    // Einstellungen öffnen
    fireEvent.click(
      screen.getByRole('button', { name: /Einstellungen anpassen/i })
    );

    // Schließen-Button klicken
    fireEvent.click(screen.getByRole('button', { name: /Schließen/i }));

    // Banner ist noch da, Modal ist zu
    expect(
      screen.getByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).toBeInTheDocument();
  });
});

// ============================================================================
// E2E Szenario 3: Wiederkehrender Besucher
// ============================================================================

describe('E2E: Wiederkehrender Besucher', () => {
  it('Banner wird nicht angezeigt wenn Consent bereits vorhanden', () => {
    localStorageMock.setItem(
      'cookie_consent',
      JSON.stringify({
        essential: true,
        functional: true,
        analytics: false,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      })
    );

    renderCookieConsentFull();

    expect(
      screen.queryByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).not.toBeInTheDocument();
  });

  it('Benutzer ändert Cookie-Einstellungen über den Footer-Button', () => {
    // Pre-set consent
    localStorageMock.setItem(
      'cookie_consent',
      JSON.stringify({
        essential: true,
        functional: false,
        analytics: false,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      })
    );

    // Render die vollständige Seite mit Footer und Cookie-UI
    function PageWithFooterAndCookies() {
      const { isPreferencesOpen, closePreferences } = useCookieConsent();
      return (
        <>
          <Footer />
          <CookiePreferencesModal
            isOpen={isPreferencesOpen}
            onClose={closePreferences}
          />
        </>
      );
    }

    render(
      <CookieConsentProvider>
        <PageWithFooterAndCookies />
      </CookieConsentProvider>
    );

    // 1. Footer-Button klicken
    const cookieSettingsButton = screen.getByRole('button', {
      name: /Cookie-Einstellungen/i,
    });
    fireEvent.click(cookieSettingsButton);

    // 2. Modal öffnet sich
    expect(
      screen.getByRole('dialog', { name: /Cookie-Einstellungen/i })
    ).toBeInTheDocument();

    // 3. Essential ist checked und disabled
    const essentialCheckbox = screen.getByRole('checkbox', {
      name: /Essenzielle Cookies/i,
    });
    expect(essentialCheckbox).toBeChecked();
    expect(essentialCheckbox).toBeDisabled();
  });
});

// ============================================================================
// E2E Szenario 4: Kontaktformular mit Datenschutz-Einwilligung
// ============================================================================

describe('E2E: Kontaktformular mit Datenschutz-Einwilligung', () => {
  it('Benutzer füllt Formular aus und stimmt der Datenschutzerklärung zu', () => {
    render(<ContactForm />);

    // 1. Formularfelder ausfüllen
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Max Mustermann' },
    });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), {
      target: { value: 'max@mustermann.de' },
    });
    fireEvent.change(screen.getByLabelText(/Nachricht/i), {
      target: { value: 'Ich hätte gerne weitere Informationen.' },
    });

    // 2. Datenschutz-Link prüfen
    const privacyLink = screen.getByRole('link', {
      name: 'Datenschutzerklärung',
    });
    expect(privacyLink).toHaveAttribute('href', '/datenschutz');
    expect(privacyLink).toHaveAttribute('target', '_blank');

    // 3. Checkbox anklicken
    fireEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).toBeChecked();

    // 4. Absenden
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    // 5. Erfolgsmeldung
    expect(
      screen.getByText(/Vielen Dank für Ihre Nachricht/i)
    ).toBeInTheDocument();
  });

  it('Benutzer versucht Formular ohne Datenschutz-Einwilligung zu senden', () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Max Mustermann' },
    });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), {
      target: { value: 'max@mustermann.de' },
    });
    fireEvent.change(screen.getByLabelText(/Nachricht/i), {
      target: { value: 'Testanfrage.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    expect(
      screen.getByText(/Bitte stimmen Sie der Datenschutzerklärung zu/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Vielen Dank für Ihre Nachricht/i)
    ).not.toBeInTheDocument();

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  });

  it('Benutzer sendet leeres Formular ab und sieht alle Validierungsfehler', () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBe(4); // Name, E-Mail, Nachricht, Datenschutz

    expect(
      screen.getByText(/Bitte geben Sie Ihren Namen ein/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Bitte geben Sie Ihre E-Mail-Adresse ein/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Bitte geben Sie eine Nachricht ein/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Bitte stimmen Sie der Datenschutzerklärung zu/i)
    ).toBeInTheDocument();
  });

  it('Benutzer korrigiert ungültige E-Mail-Adresse', () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Max' },
    });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), {
      target: { value: 'keine-email' },
    });
    fireEvent.change(screen.getByLabelText(/Nachricht/i), {
      target: { value: 'Test' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    expect(
      screen.getByText(/Bitte geben Sie eine gültige E-Mail-Adresse ein/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/E-Mail/i), {
      target: { value: 'max@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    expect(
      screen.getByText(/Vielen Dank für Ihre Nachricht/i)
    ).toBeInTheDocument();
  });
});

// ============================================================================
// E2E Szenario 5: Cookie-Preferences Modal Details
// ============================================================================

describe('E2E: Cookie-Preferences Modal Details', () => {
  it('Modal zeigt alle Cookie-Kategorie-Details mit Tabellen', () => {
    renderCookieConsentFull();

    fireEvent.click(
      screen.getByRole('button', { name: /Einstellungen anpassen/i })
    );

    // Cookie-Details sind sichtbar (cookie names in tables)
    expect(screen.getByText('cookie_consent')).toBeInTheDocument();
    expect(screen.getByText('language_preference')).toBeInTheDocument();
    expect(screen.getByText('_ga')).toBeInTheDocument();
    expect(screen.getByText('_ga_*')).toBeInTheDocument();

    // Anbieter werden angezeigt
    expect(screen.getAllByText(/possibility GmbH/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Google LLC/).length).toBeGreaterThan(0);
  });

  it('Modal zeigt Spaltenüberschriften für Cookie-Details', () => {
    renderCookieConsentFull();

    fireEvent.click(
      screen.getByRole('button', { name: /Einstellungen anpassen/i })
    );

    // Tabellen-Header prüfen (multiple tables, one per category)
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Zweck').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Dauer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Anbieter').length).toBeGreaterThan(0);
  });

  it('Essenzielle Checkbox kann nicht deaktiviert werden', () => {
    renderCookieConsentFull();

    fireEvent.click(
      screen.getByRole('button', { name: /Einstellungen anpassen/i })
    );

    const essentialCheckbox = screen.getByRole('checkbox', {
      name: /Essenzielle Cookies/i,
    });

    expect(essentialCheckbox).toBeChecked();
    expect(essentialCheckbox).toBeDisabled();

    fireEvent.click(essentialCheckbox);
    expect(essentialCheckbox).toBeChecked();
  });

  it('Funktionale und Analytics Checkboxen sind umschaltbar', () => {
    renderCookieConsentFull();

    fireEvent.click(
      screen.getByRole('button', { name: /Einstellungen anpassen/i })
    );

    const functionalCheckbox = screen.getByRole('checkbox', {
      name: /Funktionale Cookies/i,
    });

    expect(functionalCheckbox).not.toBeChecked();
    fireEvent.click(functionalCheckbox);
    expect(functionalCheckbox).toBeChecked();

    fireEvent.click(functionalCheckbox);
    expect(functionalCheckbox).not.toBeChecked();
  });
});

// ============================================================================
// E2E Szenario 6: Vollständige Seite mit allen DSGVO-Elementen
// ============================================================================

describe('E2E: Vollständige Seite mit allen DSGVO-Elementen', () => {
  it('Erstbesucher sieht Cookie-Banner, Footer und Kontaktformular', () => {
    render(<FullDSGVOPage />);

    // Cookie-Banner ist sichtbar
    expect(
      screen.getByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).toBeInTheDocument();

    // Footer ist sichtbar mit Datenschutz-Link
    const datenschutzLinks = screen.getAllByRole('link', {
      name: /Datenschutzerklärung/i,
    });
    expect(datenschutzLinks.length).toBeGreaterThan(0);

    // Cookie-Einstellungen-Button ist im Footer
    expect(
      screen.getByRole('button', { name: /Cookie-Einstellungen/i })
    ).toBeInTheDocument();

    // Kontaktformular ist vorhanden
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
  });

  it('Benutzer akzeptiert Cookies und füllt dann Kontaktformular aus', () => {
    render(<FullDSGVOPage />);

    // 1. Cookies akzeptieren
    fireEvent.click(screen.getByRole('button', { name: /Alle akzeptieren/i }));

    // 2. Banner ist verschwunden
    expect(
      screen.queryByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).not.toBeInTheDocument();

    // 3. Kontaktformular ausfüllen
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Anna Beispiel' },
    });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), {
      target: { value: 'anna@beispiel.de' },
    });
    fireEvent.change(screen.getByLabelText(/Nachricht/i), {
      target: { value: 'Interesse an Ihren Leistungen.' },
    });

    // 4. Datenschutz-Checkbox anklicken
    fireEvent.click(screen.getByRole('checkbox'));

    // 5. Absenden
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    // 6. Erfolgsmeldung
    expect(
      screen.getByText(/Vielen Dank für Ihre Nachricht/i)
    ).toBeInTheDocument();
  });
});

// ============================================================================
// E2E Szenario 7: Barrierefreiheit der gesamten DSGVO-Funktionalität
// ============================================================================

describe('E2E: Barrierefreiheit der DSGVO-Funktionalität', () => {
  it('Cookie-Banner ist per Tastatur bedienbar', async () => {
    renderCookieConsentFull();

    const user = userEvent.setup();

    await user.tab();

    const focusedElement = document.activeElement;
    // First focusable element in banner could be the "Mehr erfahren" link or a button
    expect(['A', 'BUTTON']).toContain(focusedElement?.tagName);
  });

  it('Cookie-Banner hat korrekte ARIA-Attribute', () => {
    renderCookieConsentFull();

    const dialog = screen.getByRole('dialog', {
      name: /Cookie-Einwilligung/i,
    });
    expect(dialog).toHaveAttribute('aria-label', 'Cookie-Einwilligung');
  });

  it('Cookie-Modal hat korrekte ARIA-Attribute', () => {
    renderCookieConsentFull();

    fireEvent.click(
      screen.getByRole('button', { name: /Einstellungen anpassen/i })
    );

    const modal = screen.getByRole('dialog', {
      name: /Cookie-Einstellungen/i,
    });
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-label', 'Cookie-Einstellungen');
  });

  it('Deaktivierte Checkboxen sind korrekt gekennzeichnet', () => {
    renderCookieConsentFull();

    fireEvent.click(
      screen.getByRole('button', { name: /Einstellungen anpassen/i })
    );

    const essentialCheckbox = screen.getByRole('checkbox', {
      name: /Essenzielle Cookies.*erforderlich/i,
    });
    expect(essentialCheckbox).toBeDisabled();
  });

  it('Datenschutzseite-Sektionen haben IDs für Ankernavigation', () => {
    render(<DatenschutzPage />);

    datenschutzContent.sections.forEach((section) => {
      const sectionElement = document.getElementById(section.id);
      expect(sectionElement).toBeInTheDocument();

      if (section.subsections) {
        section.subsections.forEach((sub) => {
          const subElement = document.getElementById(sub.id);
          expect(subElement).toBeInTheDocument();
        });
      }
    });
  });

  it('Kontaktformular-Fehlermeldungen sind mit Inputs verknüpft', () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    const nameInput = screen.getByLabelText(/Name/i);
    const describedBy = nameInput.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const errorElement = document.getElementById(describedBy!);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement?.textContent).toContain(
      'Bitte geben Sie Ihren Namen ein'
    );
  });
});

// ============================================================================
// E2E Szenario 8: Edge Cases und Fehler-Fälle
// ============================================================================

describe('E2E: Edge Cases und Fehler-Fälle', () => {
  it('Ungültige Consent-Daten im Storage werden ignoriert', () => {
    localStorageMock.setItem('cookie_consent', 'not-valid-json');

    renderCookieConsentFull();

    // Banner sollte angezeigt werden (ungültige Daten = kein Consent)
    expect(
      screen.getByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).toBeInTheDocument();
  });

  it('Unvollständige Consent-Daten werden als ungültig behandelt', () => {
    localStorageMock.setItem(
      'cookie_consent',
      JSON.stringify({ essential: true })
    );

    renderCookieConsentFull();

    expect(
      screen.getByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).toBeInTheDocument();
  });

  it('Datenschutzseite rendert ohne Fehler', () => {
    expect(() => {
      render(<DatenschutzPage />);
    }).not.toThrow();
  });

  it('Kontaktformular mit Sonderzeichen in den Feldern', () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Ärzte für Übermorgen GmbH & Co. KG' },
    });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), {
      target: { value: 'info@aerzte-uebermorgen.de' },
    });
    fireEvent.change(screen.getByLabelText(/Nachricht/i), {
      target: {
        value:
          'Möchte informiert werden über Änderungen der AGBs & Datenschutzerklärung.',
      },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    expect(
      screen.getByText(/Vielen Dank für Ihre Nachricht/i)
    ).toBeInTheDocument();
  });

  it('Datenschutzseite wird mit korrekten Metadaten exportiert', async () => {
    const { metadata } = await import('@/app/datenschutz/page');

    expect(metadata).toBeDefined();
    expect(metadata.title).toBeTruthy();
    expect(metadata.description).toBeTruthy();
    expect(metadata.title).toContain('Datenschutzerklärung');
    expect(metadata.description).toContain('DSGVO');
  });
});
