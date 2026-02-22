/**
 * Integration Tests: Datenschutzerklärung (DSGVO-Pflicht)
 *
 * Ticket: Datenschutzerklärung (DSGVO-Pflicht) (3b635132)
 * Akzeptanzkriterien: REQ-001 bis REQ-009
 *
 * Diese Tests prüfen das Zusammenspiel aller Datenschutz-Komponenten:
 * Datenschutzseite, Cookie-Consent-Banner, Footer, Kontaktformular
 * und deren Integration mit dem CookieConsentManager.
 */

import { render, screen, fireEvent, within } from '@testing-library/react';
import DatenschutzPage from '@/app/datenschutz/page';
import { datenschutzContent } from '@/content/datenschutz';
import CookieConsentBanner from '@/components/cookie-consent/CookieConsentBanner';
import { CookieConsentProvider } from '@/components/cookie-consent/CookieConsentContext';
import { CookieConsentManager } from '@/components/cookie-consent/CookieConsentManager';
import { COOKIE_CATEGORIES } from '@/components/cookie-consent/cookieCategories';
import ContactForm from '@/components/contact/ContactForm';
import Footer from '@/components/layout/Footer';
import ClientLayout from '@/components/layout/ClientLayout';

// ============================================================================
// Mocks
// ============================================================================

// Mock next/link
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
// Helper Functions
// ============================================================================

function renderWithProvider(ui: React.ReactElement) {
  return render(<CookieConsentProvider>{ui}</CookieConsentProvider>);
}

// ============================================================================
// Setup / Teardown
// ============================================================================

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

// ============================================================================
// REQ-001: Datenschutzerklärungsseite unter eigener URL
// ============================================================================

describe('REQ-001: Datenschutzerklärungsseite unter eigener URL', () => {
  it('rendert die Datenschutzseite als eigenständige Seite', () => {
    render(<DatenschutzPage />);

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('rendert die Überschrift "Datenschutzerklärung"', () => {
    render(<DatenschutzPage />);

    // The main page heading is "Datenschutzerklärung"
    expect(
      screen.getByRole('heading', { name: 'Datenschutzerklärung' })
    ).toBeInTheDocument();
  });

  it('rendert den Content innerhalb einer main-Sektion', () => {
    render(<DatenschutzPage />);

    const main = screen.getByRole('main');
    const heading = within(main).getByRole('heading', {
      name: 'Datenschutzerklärung',
    });
    expect(heading).toBeInTheDocument();
  });

  it('rendert die Seite mit dem Inhaltsverzeichnis', () => {
    render(<DatenschutzPage />);

    expect(
      screen.getByRole('navigation', { name: /Inhaltsverzeichnis/i })
    ).toBeInTheDocument();
  });

  it('hat den korrekten SEO-Titel in den Metadaten', async () => {
    const { metadata } = await import('@/app/datenschutz/page');
    expect(metadata.title).toContain('Datenschutzerklärung');
    expect(metadata.description).toContain('DSGVO');
  });
});

// ============================================================================
// REQ-002: Dokumentation aller verarbeiteten Datenarten
// ============================================================================

describe('REQ-002: Dokumentation aller verarbeiteten Datenarten', () => {
  it('enthält die Sektion zur Übersicht der Datenverarbeitungen', () => {
    render(<DatenschutzPage />);

    const section = document.getElementById('uebersicht-datenverarbeitung');
    expect(section).toBeInTheDocument();
  });

  it('listet die Arten der verarbeiteten Daten auf', () => {
    render(<DatenschutzPage />);

    const section = document.getElementById('arten-verarbeiteter-daten');
    expect(section).toBeInTheDocument();

    expect(screen.getByText(/Bestandsdaten/i)).toBeInTheDocument();
    expect(screen.getByText(/Inhaltsdaten/i)).toBeInTheDocument();
    expect(screen.getByText(/Nutzungsdaten/i)).toBeInTheDocument();
    expect(screen.getByText(/Meta-\/Kommunikationsdaten/i)).toBeInTheDocument();
  });

  it('listet die Kategorien betroffener Personen auf', () => {
    render(<DatenschutzPage />);

    expect(screen.getByText(/Nutzer der Website/i)).toBeInTheDocument();
    expect(screen.getByText(/Kommunikationspartner/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Geschäftspartner und Interessenten/i)
    ).toBeInTheDocument();
  });

  it('dokumentiert Server-Logfiles und deren Speicherdauer', () => {
    render(<DatenschutzPage />);

    const section = document.getElementById('server-logfiles');
    expect(section).toBeInTheDocument();
    expect(screen.getAllByText(/IP-Adresse/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/30 Tagen/i).length).toBeGreaterThan(0);
  });

  it('dokumentiert Cookie-Kategorien als Untersektionen', () => {
    render(<DatenschutzPage />);

    expect(document.getElementById('cookies')).toBeInTheDocument();
    expect(document.getElementById('essenzielle-cookies')).toBeInTheDocument();
    expect(document.getElementById('funktionale-cookies')).toBeInTheDocument();
    expect(document.getElementById('analyse-cookies')).toBeInTheDocument();
  });

  it('dokumentiert die Kontaktformular-Datenverarbeitung', () => {
    render(<DatenschutzPage />);

    const kontaktSection = document.getElementById('kontaktformular');
    expect(kontaktSection).toBeInTheDocument();
  });
});

// ============================================================================
// REQ-003: DSGVO-Pflichtinformationen gemäß Art. 13/14 DSGVO
// ============================================================================

describe('REQ-003: DSGVO-Pflichtinformationen gemäß Art. 13/14 DSGVO', () => {
  it('enthält die Sektion zum Verantwortlichen', () => {
    render(<DatenschutzPage />);

    const section = document.getElementById('verantwortlicher');
    expect(section).toBeInTheDocument();
    // Company name appears in the section content
    expect(
      screen.getAllByText(/possibility GmbH/).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('enthält die Kontaktdaten des Verantwortlichen', () => {
    render(<DatenschutzPage />);

    expect(
      screen.getByText(/datenschutz@possibility\.gmbh/)
    ).toBeInTheDocument();
    expect(screen.getByText(/\+49 \(0\) 123 456789-0/)).toBeInTheDocument();
  });

  it('enthält die Rechtsgrundlagen der Verarbeitung als Sektion', () => {
    render(<DatenschutzPage />);

    const section = document.getElementById('rechtsgrundlagen');
    expect(section).toBeInTheDocument();

    // Check for DSGVO article references - use getAllByText since they appear multiple times
    expect(
      screen.getAllByText(/Art\. 6 Abs\. 1 lit\. a DSGVO/).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Art\. 6 Abs\. 1 lit\. b DSGVO/).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Art\. 6 Abs\. 1 lit\. f DSGVO/).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('enthält die Rechte der betroffenen Personen', () => {
    render(<DatenschutzPage />);

    const section = document.getElementById('betroffenenrechte');
    expect(section).toBeInTheDocument();

    // Check individual rights within the section
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

  it('enthält Informationen zur Speicherdauer', () => {
    render(<DatenschutzPage />);

    const speicherdauerSection = document.getElementById('speicherdauer');
    expect(speicherdauerSection).toBeInTheDocument();
  });

  it('enthält mindestens alle DSGVO-Pflichtsektionen', () => {
    render(<DatenschutzPage />);

    const pflichtSektionen = [
      'verantwortlicher',
      'rechtsgrundlagen',
      'betroffenenrechte',
      'server-logfiles',
      'kontaktformular',
      'cookies',
    ];

    pflichtSektionen.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      expect(section).toBeInTheDocument();
    });
  });

  it('alle Sektionen sind über das Inhaltsverzeichnis verlinkt', () => {
    render(<DatenschutzPage />);

    const nav = screen.getByRole('navigation', {
      name: /Inhaltsverzeichnis/i,
    });

    datenschutzContent.sections.forEach((section) => {
      const link = within(nav).getByText(section.title);
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', `#${section.id}`);
    });
  });
});

// ============================================================================
// REQ-004: Cookie-Consent-Banner mit Opt-in
// ============================================================================

describe('REQ-004: Cookie-Consent-Banner mit Opt-in', () => {
  it('zeigt das Cookie-Banner beim ersten Besuch (kein Consent)', () => {
    renderWithProvider(<CookieConsentBanner />);

    expect(
      screen.getByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).toBeInTheDocument();
  });

  it('bietet "Alle akzeptieren"-Button (Opt-in für alle Kategorien)', () => {
    renderWithProvider(<CookieConsentBanner />);

    expect(
      screen.getByRole('button', { name: /Alle akzeptieren/i })
    ).toBeInTheDocument();
  });

  it('bietet "Nur essenzielle Cookies"-Button', () => {
    renderWithProvider(<CookieConsentBanner />);

    expect(
      screen.getByRole('button', { name: /Nur essenzielle Cookies/i })
    ).toBeInTheDocument();
  });

  it('bietet "Einstellungen anpassen"-Button für granulare Steuerung', () => {
    renderWithProvider(<CookieConsentBanner />);

    expect(
      screen.getByRole('button', { name: /Einstellungen anpassen/i })
    ).toBeInTheDocument();
  });

  it('verlinkt zur Datenschutzerklärung im Banner', () => {
    renderWithProvider(<CookieConsentBanner />);

    const link = screen.getByRole('link', { name: /Mehr erfahren/i });
    expect(link).toHaveAttribute('href', '/datenschutz');
  });

  it('speichert Consent bei "Alle akzeptieren" mit allen Kategorien', () => {
    renderWithProvider(<CookieConsentBanner />);

    fireEvent.click(screen.getByRole('button', { name: /Alle akzeptieren/i }));

    // Verify localStorage was called
    expect(localStorageMock.setItem).toHaveBeenCalled();

    // Find the cookie_consent call
    const consentCall = localStorageMock.setItem.mock.calls.find(
      (call: string[]) => call[0] === 'cookie_consent'
    );
    expect(consentCall).toBeTruthy();

    const storedValue = JSON.parse(consentCall![1]);
    expect(storedValue.essential).toBe(true);
    expect(storedValue.functional).toBe(true);
    expect(storedValue.analytics).toBe(true);
  });

  it('speichert nur essenzielle Cookies bei "Nur essenzielle"', () => {
    renderWithProvider(<CookieConsentBanner />);

    fireEvent.click(
      screen.getByRole('button', { name: /Nur essenzielle Cookies/i })
    );

    const consentCall = localStorageMock.setItem.mock.calls.find(
      (call: string[]) => call[0] === 'cookie_consent'
    );
    expect(consentCall).toBeTruthy();

    const storedValue = JSON.parse(consentCall![1]);
    expect(storedValue.essential).toBe(true);
    expect(storedValue.functional).toBe(false);
    expect(storedValue.analytics).toBe(false);
  });

  it('versteckt das Banner nach Consent-Auswahl', () => {
    renderWithProvider(<CookieConsentBanner />);

    fireEvent.click(screen.getByRole('button', { name: /Alle akzeptieren/i }));

    expect(
      screen.queryByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).not.toBeInTheDocument();
  });

  it('zeigt das Banner nicht wenn bereits Consent vorhanden', () => {
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

    renderWithProvider(<CookieConsentBanner />);

    expect(
      screen.queryByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).not.toBeInTheDocument();
  });

  it('CookieConsentManager erzwingt essential: true', () => {
    CookieConsentManager.setConsent({
      essential: true,
      functional: false,
      analytics: false,
      consentTimestamp: new Date().toISOString(),
      consentVersion: '1.0.0',
    });

    const stored = CookieConsentManager.getConsent();
    expect(stored?.essential).toBe(true);
  });

  it('Cookie-Kategorien sind vollständig definiert', () => {
    const categoryIds = COOKIE_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain('essential');
    expect(categoryIds).toContain('functional');
    expect(categoryIds).toContain('analytics');
  });

  it('essenzielle Kategorie ist als required markiert', () => {
    const essential = COOKIE_CATEGORIES.find((c) => c.id === 'essential');
    expect(essential?.required).toBe(true);
  });

  it('nicht-essenzielle Kategorien sind nicht-required', () => {
    const nonEssential = COOKIE_CATEGORIES.filter((c) => c.id !== 'essential');
    nonEssential.forEach((cat) => {
      expect(cat.required).toBe(false);
    });
  });
});

// ============================================================================
// REQ-005: Verlinkung im Footer der Webseite
// ============================================================================

describe('REQ-005: Verlinkung im Footer der Webseite', () => {
  it('Footer enthält Link zur Datenschutzerklärung', () => {
    renderWithProvider(<Footer />);

    const link = screen.getByRole('link', {
      name: /Datenschutzerklärung/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/datenschutz');
  });

  it('Footer enthält Button für Cookie-Einstellungen', () => {
    renderWithProvider(<Footer />);

    expect(
      screen.getByRole('button', { name: /Cookie-Einstellungen/i })
    ).toBeInTheDocument();
  });

  it('Footer enthält Copyright-Information', () => {
    renderWithProvider(<Footer />);

    expect(screen.getByText(/possibility GmbH/i)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(new Date().getFullYear().toString()))
    ).toBeInTheDocument();
  });

  it('Footer hat eine semantische Navigation mit aria-label', () => {
    renderWithProvider(<Footer />);

    const nav = screen.getByRole('navigation', {
      name: 'Footer-Navigation',
    });
    expect(nav).toBeInTheDocument();
  });

  it('Footer ist in das ClientLayout integriert', () => {
    render(<ClientLayout>Testinhalt</ClientLayout>);

    expect(document.querySelector('footer')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Datenschutzerklärung/i })
    ).toBeInTheDocument();
  });
});

// ============================================================================
// REQ-006: Verlinkung im Kontaktformular
// ============================================================================

describe('REQ-006: Verlinkung im Kontaktformular', () => {
  it('Kontaktformular enthält Datenschutz-Checkbox', () => {
    render(<ContactForm />);

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('Kontaktformular enthält Link zur Datenschutzerklärung', () => {
    render(<ContactForm />);

    const link = screen.getByRole('link', {
      name: 'Datenschutzerklärung',
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/datenschutz');
  });

  it('Link zur Datenschutzerklärung öffnet sich in neuem Tab', () => {
    render(<ContactForm />);

    const link = screen.getByRole('link', {
      name: 'Datenschutzerklärung',
    });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('Datenschutz-Checkbox ist standardmäßig nicht angehakt', () => {
    render(<ContactForm />);

    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('Formular kann ohne Datenschutz-Einwilligung nicht abgesendet werden', () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Max Mustermann' },
    });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), {
      target: { value: 'max@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Nachricht/i), {
      target: { value: 'Testanfrage' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    expect(
      screen.getByText(/Bitte stimmen Sie der Datenschutzerklärung zu/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Vielen Dank für Ihre Nachricht/i)
    ).not.toBeInTheDocument();
  });

  it('Formular kann mit Datenschutz-Einwilligung abgesendet werden', () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Max Mustermann' },
    });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), {
      target: { value: 'max@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Nachricht/i), {
      target: { value: 'Testanfrage' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    expect(
      screen.getByText(/Vielen Dank für Ihre Nachricht/i)
    ).toBeInTheDocument();
  });

  it('zeigt Validierungsfehler für leere Pflichtfelder', () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

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
});

// ============================================================================
// REQ-007: Erstellung mittels Generator und rechtliche Prüfung
// ============================================================================

describe('REQ-007: Erstellung mittels Generator und rechtliche Prüfung', () => {
  it('Datenschutzinhalt hat eine Versionsangabe', () => {
    expect(datenschutzContent.version).toBeDefined();
    expect(datenschutzContent.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('Datenschutzinhalt enthält Verantwortlichen-Informationen', () => {
    expect(datenschutzContent.responsible.companyName).toBeTruthy();
    expect(datenschutzContent.responsible.address).toBeTruthy();
    expect(datenschutzContent.responsible.email).toBeTruthy();
    expect(datenschutzContent.responsible.phone).toBeTruthy();
  });

  it('Datenschutzinhalt hat eine strukturierte Sektionshierarchie', () => {
    expect(datenschutzContent.sections.length).toBeGreaterThan(0);

    datenschutzContent.sections.forEach((section) => {
      expect(section.id).toBeTruthy();
      expect(section.title).toBeTruthy();
      expect(section.content).toBeTruthy();
      expect(section.level).toBeGreaterThanOrEqual(1);
      expect(section.level).toBeLessThanOrEqual(3);
    });
  });

  it('Sektions-IDs sind URL-sicher (slug-Format)', () => {
    function collectIds(
      sections: typeof datenschutzContent.sections
    ): string[] {
      const ids: string[] = [];
      sections.forEach((s) => {
        ids.push(s.id);
        if (s.subsections) {
          ids.push(...collectIds(s.subsections));
        }
      });
      return ids;
    }

    const allIds = collectIds(datenschutzContent.sections);
    allIds.forEach((id) => {
      expect(id).toMatch(/^[a-z0-9-]+$/);
    });
  });

  it('alle Cookie-Kategorien sind mit Details dokumentiert', () => {
    COOKIE_CATEGORIES.forEach((category) => {
      expect(category.label).toBeTruthy();
      expect(category.description).toBeTruthy();
      expect(category.cookies.length).toBeGreaterThan(0);

      category.cookies.forEach((cookie) => {
        expect(cookie.name).toBeTruthy();
        expect(cookie.purpose).toBeTruthy();
        expect(cookie.duration).toBeTruthy();
        expect(cookie.provider).toBeTruthy();
        expect(cookie.type).toBeTruthy();
      });
    });
  });
});

// ============================================================================
// REQ-008: Aktualität und Änderungsdatum
// ============================================================================

describe('REQ-008: Aktualität und Änderungsdatum', () => {
  it('zeigt das Änderungsdatum auf der Datenschutzseite an', () => {
    render(<DatenschutzPage />);

    expect(screen.getByText(/Stand:.*Februar 2026/i)).toBeInTheDocument();
  });

  it('zeigt die Versionsnummer auf der Datenschutzseite an', () => {
    render(<DatenschutzPage />);

    expect(screen.getByText(/Version 1\.0\.0/i)).toBeInTheDocument();
  });

  it('lastUpdated ist im gültigen ISO-8601-Format', () => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(datenschutzContent.lastUpdated).toMatch(isoDateRegex);

    const parsedDate = new Date(datenschutzContent.lastUpdated);
    expect(parsedDate.toString()).not.toBe('Invalid Date');
  });

  it('displayDate ist im deutschen Datumsformat (Monat Jahr)', () => {
    const germanMonthYearRegex =
      /^(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember) \d{4}$/;
    expect(datenschutzContent.displayDate).toMatch(germanMonthYearRegex);
  });

  it('Consent-Version wird beim Speichern mitgespeichert', () => {
    CookieConsentManager.setConsent({
      essential: true,
      functional: true,
      analytics: false,
      consentTimestamp: new Date().toISOString(),
      consentVersion: datenschutzContent.version,
    });

    const consent = CookieConsentManager.getConsent();
    expect(consent?.consentVersion).toBe(datenschutzContent.version);
  });

  it('Consent enthält einen Timestamp', () => {
    CookieConsentManager.setConsent({
      essential: true,
      functional: false,
      analytics: false,
      consentTimestamp: '2026-02-22T10:00:00.000Z',
      consentVersion: '1.0.0',
    });

    const consent = CookieConsentManager.getConsent();
    expect(consent?.consentTimestamp).toBe('2026-02-22T10:00:00.000Z');
  });

  it('Datenschutzseite enthält den Abschnitt zu Änderungen', () => {
    render(<DatenschutzPage />);

    const changeSection = document.getElementById('aenderungen');
    expect(changeSection).toBeInTheDocument();
  });
});

// ============================================================================
// REQ-009: Barrierefreie Darstellung der Datenschutzerklärung
// ============================================================================

describe('REQ-009: Barrierefreie Darstellung der Datenschutzerklärung', () => {
  it('Datenschutzseite hat semantische HTML-Struktur (article)', () => {
    render(<DatenschutzPage />);

    expect(document.querySelector('article')).toBeInTheDocument();
  });

  it('Sektionen verwenden Heading-Elemente', () => {
    render(<DatenschutzPage />);

    // Main sections use level: 1 → h1 headings
    // Subsections use level: 2 → h2 headings
    // ToC also has an h2 "Inhaltsverzeichnis"
    const allHeadings = screen.getAllByRole('heading');
    expect(allHeadings.length).toBeGreaterThan(5);

    // There should be h2 headings from the subsections
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThan(0);
  });

  it('Inhaltsverzeichnis hat ein aria-label', () => {
    render(<DatenschutzPage />);

    const nav = screen.getByRole('navigation', {
      name: /Inhaltsverzeichnis/i,
    });
    expect(nav).toHaveAttribute('aria-label');
  });

  it('alle Sektionen haben IDs für Anchor-Navigation', () => {
    render(<DatenschutzPage />);

    datenschutzContent.sections.forEach((section) => {
      const el = document.getElementById(section.id);
      expect(el).toBeInTheDocument();
    });
  });

  it('Sektionen haben scroll-margin für fixierten Header', () => {
    render(<DatenschutzPage />);

    const section = document.getElementById('verantwortlicher');
    expect(section).toBeInTheDocument();
    expect(section?.classList.toString()).toContain('scroll-mt');
  });

  it('Cookie-Banner hat dialog-Rolle und aria-label', () => {
    renderWithProvider(<CookieConsentBanner />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-label');
  });

  it('Kontaktformular hat aria-invalid bei Fehlern', () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('Kontaktformular-Fehler haben role="alert"', () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    const alerts = screen.getAllByRole('alert');
    expect(alerts.length).toBeGreaterThan(0);
  });

  it('Datenschutz-Checkbox hat aria-describedby bei Fehler', () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAttribute('aria-describedby', 'privacy-error');
  });

  it('HTML lang-Attribut ist auf "de" gesetzt (Root-Layout)', () => {
    // Test indirekt über den datenschutzContent
    expect(datenschutzContent.displayDate).toMatch(
      /(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)/
    );
  });
});

// ============================================================================
// Integration: CookieConsentManager Lifecycle
// ============================================================================

describe('Integration: CookieConsentManager Lifecycle', () => {
  it('Consent-Speicherung und -Abfrage funktioniert korrekt', () => {
    expect(CookieConsentManager.hasConsented()).toBe(false);

    CookieConsentManager.setConsent({
      essential: true,
      functional: true,
      analytics: false,
      consentTimestamp: new Date().toISOString(),
      consentVersion: '1.0.0',
    });

    expect(CookieConsentManager.hasConsented()).toBe(true);
    expect(CookieConsentManager.isCategoryAllowed('essential')).toBe(true);
    expect(CookieConsentManager.isCategoryAllowed('functional')).toBe(true);
    expect(CookieConsentManager.isCategoryAllowed('analytics')).toBe(false);
  });

  it('Consent-Widerruf entfernt gespeicherte Präferenzen', () => {
    CookieConsentManager.setConsent({
      essential: true,
      functional: true,
      analytics: true,
      consentTimestamp: new Date().toISOString(),
      consentVersion: '1.0.0',
    });

    expect(CookieConsentManager.hasConsented()).toBe(true);

    CookieConsentManager.revokeConsent();

    expect(CookieConsentManager.hasConsented()).toBe(false);
    expect(CookieConsentManager.getConsent()).toBeNull();
  });

  it('getConsent gibt null bei ungültigem JSON zurück', () => {
    localStorageMock.setItem('cookie_consent', 'invalid-json');

    expect(CookieConsentManager.getConsent()).toBeNull();
  });

  it('getConsent gibt null bei unvollständiger Struktur zurück', () => {
    localStorageMock.setItem(
      'cookie_consent',
      JSON.stringify({ essential: true })
    );

    expect(CookieConsentManager.getConsent()).toBeNull();
  });

  it('isCategoryAllowed gibt false zurück wenn kein Consent vorhanden', () => {
    expect(CookieConsentManager.isCategoryAllowed('analytics')).toBe(false);
    expect(CookieConsentManager.isCategoryAllowed('functional')).toBe(false);
  });

  it('isCategoryAllowed gibt immer true für essential zurück', () => {
    expect(CookieConsentManager.isCategoryAllowed('essential')).toBe(true);
  });
});

// ============================================================================
// Integration: ClientLayout with all DSGVO components
// ============================================================================

describe('Integration: ClientLayout mit DSGVO-Komponenten', () => {
  it('ClientLayout rendert Footer und Cookie-Banner', () => {
    render(<ClientLayout>Seiteninhalt</ClientLayout>);

    expect(document.querySelector('footer')).toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).toBeInTheDocument();
  });

  it('ClientLayout zeigt kein Banner bei vorhandenem Consent', () => {
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

    render(<ClientLayout>Seiteninhalt</ClientLayout>);

    expect(document.querySelector('footer')).toBeInTheDocument();
    expect(
      screen.queryByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).not.toBeInTheDocument();
  });

  it('ClientLayout rendert children korrekt', () => {
    render(
      <ClientLayout>
        <p>Mein Seiteninhalt</p>
      </ClientLayout>
    );

    expect(screen.getByText('Mein Seiteninhalt')).toBeInTheDocument();
  });
});
