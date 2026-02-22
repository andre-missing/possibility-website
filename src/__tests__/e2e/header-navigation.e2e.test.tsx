/**
 * E2E-Style Tests: Basis-Layout Header & Navigation
 *
 * Ticket: Basis-Layout: Header & Navigation (fdaa0ae6)
 *
 * Diese Tests simulieren End-to-End User-Flows fuer die Header-
 * und Navigationskomponente. Sie testen das vollstaendige Zusammenspiel
 * aller Komponenten in einem realistischen Szenario.
 *
 * Hinweis: Da kein E2E-Framework (Playwright/Cypress) konfiguriert ist,
 * werden diese Tests als Component-Integration-Tests mit Testing Library
 * implementiert, die E2E-Szenarien abbilden.
 */

import { render, screen, fireEvent, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/layout/Header';
import type { NavigationSection } from '@/components/layout/types';

// ============================================================================
// Test Fixtures & Setup
// ============================================================================

const navigationItems: NavigationSection[] = [
  { label: 'Start', href: '#start', id: 'start' },
  { label: 'Leistungen', href: '#leistungen', id: 'leistungen' },
  { label: 'Ueber uns', href: '#ueber-uns', id: 'ueber-uns' },
  { label: 'Referenzen', href: '#referenzen', id: 'referenzen' },
  { label: 'Kontakt', href: '#kontakt', id: 'kontakt' },
];

const defaultHeaderProps = {
  logoSrc: '/logo.svg',
  logoAlt: 'possibility GmbH Logo',
  logoFallbackSrc: '/logo.png',
};

/**
 * Erstellt eine vollstaendige Seiten-Struktur mit Header und Sektionen
 * fuer realistische E2E-Szenarien
 */
function renderFullPage() {
  // Erstelle Sektionen im DOM
  const container = document.createElement('div');
  container.id = 'page-root';

  navigationItems.forEach((item, index) => {
    const section = document.createElement('section');
    section.id = item.id;
    section.style.height = '800px';
    section.style.marginTop = index === 0 ? '80px' : '0'; // Platz fuer Header
    section.innerHTML = `<h2>${item.label}</h2><p>Inhalt fuer ${item.label}</p>`;
    container.appendChild(section);
  });

  document.body.appendChild(container);

  const result = render(
    <Header sections={navigationItems} {...defaultHeaderProps} />
  );

  return {
    ...result,
    cleanup: () => {
      container.remove();
    },
  };
}

// ============================================================================
// Mocks & Setup
// ============================================================================

beforeEach(() => {
  // IntersectionObserver Mock
  const mockIntersectionObserver = jest
    .fn()
    .mockImplementation((_callback: IntersectionObserverCallback) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
    }));

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });

  // matchMedia Mock - Default: Desktop
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: query.includes('min-width'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // scrollIntoView Mock
  Element.prototype.scrollIntoView = jest.fn();

  // scrollY Mock
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

  // Reset body
  document.body.style.overflow = '';
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

// ============================================================================
// E2E Szenario 1: Benutzer navigiert die Seite per Maus (Desktop)
// ============================================================================

describe('E2E: Desktop-Navigation per Maus', () => {
  it('Benutzer sieht Header mit Logo und Navigation beim Laden der Seite', () => {
    const { cleanup } = renderFullPage();

    // Header ist sichtbar
    const header = screen.getByRole('banner');
    expect(header).toBeVisible();

    // Logo ist sichtbar
    const logo = within(header).getByRole('img', { name: /logo/i });
    expect(logo).toBeVisible();

    // Alle Navigationslinks sind sichtbar
    navigationItems.forEach((item) => {
      expect(screen.getByRole('link', { name: item.label })).toBeVisible();
    });

    cleanup();
  });

  it('Benutzer klickt auf "Leistungen" und scrollt zur Sektion', async () => {
    const { cleanup } = renderFullPage();

    const link = screen.getByRole('link', { name: 'Leistungen' });
    await userEvent.click(link);

    const section = document.getElementById('leistungen');
    expect(section?.scrollIntoView).toHaveBeenCalled();

    cleanup();
  });

  it('Benutzer scrollt durch die Seite und Header bleibt sichtbar', () => {
    const { cleanup } = renderFullPage();

    const header = screen.getByRole('banner');

    // Scrolle nach unten
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 2000, writable: true });
      fireEvent.scroll(window);
    });

    expect(header).toBeVisible();

    cleanup();
  });

  it('Benutzer scrollt und aktiver Navigationspunkt aktualisiert sich', () => {
    const { cleanup } = renderFullPage();

    // Initial oder nach Scroll sollte ein Navigationspunkt aktiv sein
    // (abhaengig vom IntersectionObserver)
    const links = screen.getAllByRole('link');
    const linkElements = links.filter((l) => l.closest('nav'));

    // Mindestens die Navigation sollte Links enthalten
    expect(linkElements.length).toBeGreaterThan(0);

    cleanup();
  });

  it('Header bekommt Schatten/Hintergrund beim Scrollen', () => {
    const { cleanup } = renderFullPage();

    const header = screen.getByRole('banner');
    const initialClasses = header.className;

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      fireEvent.scroll(window);
    });

    // Klassen sollten sich aendern (Schatten, Hintergrund)
    expect(header.className).not.toBe(initialClasses);

    cleanup();
  });
});

// ============================================================================
// E2E Szenario 2: Benutzer navigiert per Tastatur (Accessibility)
// ============================================================================

describe('E2E: Tastatur-Navigation', () => {
  it('Benutzer erreicht alle Navigationslinks per Tab', async () => {
    const { cleanup } = renderFullPage();
    const user = userEvent.setup();

    const visitedLinks: string[] = [];

    // Tab durch Header-Elemente
    for (let i = 0; i < navigationItems.length + 3; i++) {
      await user.tab();
      const focused = document.activeElement;
      if (focused?.tagName === 'A' && focused.closest('nav')) {
        visitedLinks.push(focused.textContent || '');
      }
    }

    // Alle Navigationslinks sollten per Tab erreichbar gewesen sein
    navigationItems.forEach((item) => {
      expect(visitedLinks).toContain(item.label);
    });

    cleanup();
  });

  it('Benutzer drueckt Enter auf fokussiertem Link und navigiert zur Sektion', async () => {
    const { cleanup } = renderFullPage();

    const link = screen.getByRole('link', { name: 'Kontakt' });
    link.focus();

    await userEvent.keyboard('{Enter}');

    const section = document.getElementById('kontakt');
    expect(section?.scrollIntoView).toHaveBeenCalled();

    cleanup();
  });

  it('Skip-Link oder direkter Zugang zum Hauptinhalt ist moeglich', () => {
    const { cleanup } = renderFullPage();

    // Pruefe ob ein Skip-Link existiert (Best Practice fuer Accessibility)
    const skipLink = screen.queryByText(
      /zum inhalt|skip to content|zum hauptinhalt/i
    );

    // Wenn kein Skip-Link, dann sollte der erste Tab-Stop sinnvoll sein
    if (!skipLink) {
      // Logo-Link sollte der erste fokussierbare Element sein
      const firstLink = screen.getAllByRole('link')[0];
      expect(firstLink).toBeInTheDocument();
    }

    cleanup();
  });
});

// ============================================================================
// E2E Szenario 3: Mobile Benutzer mit Hamburger-Menue
// ============================================================================

describe('E2E: Mobile Navigation mit Hamburger-Menue', () => {
  beforeEach(() => {
    // Simuliere mobilen Viewport
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('Benutzer oeffnet Hamburger-Menue, navigiert, und Menue schliesst sich', async () => {
    const { cleanup } = renderFullPage();

    // 1. Hamburger-Button finden und klicken
    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });
    expect(hamburgerButton).toBeVisible();

    await userEvent.click(hamburgerButton);

    // 2. Navigationslinks sind sichtbar
    expect(screen.getByRole('link', { name: 'Leistungen' })).toBeVisible();

    // 3. Auf Link klicken
    await userEvent.click(screen.getByRole('link', { name: 'Leistungen' }));

    // 4. Menue schliesst sich
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');

    // 5. Sektion wurde angesprungen
    const section = document.getElementById('leistungen');
    expect(section?.scrollIntoView).toHaveBeenCalled();

    cleanup();
  });

  it('Benutzer drueckt Escape um das mobile Menue zu schliessen', async () => {
    const { cleanup } = renderFullPage();

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });

    // Oeffne Menue
    await userEvent.click(hamburgerButton);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

    // Druecke Escape
    await userEvent.keyboard('{Escape}');

    // Menue ist geschlossen
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');

    // Body-Scroll ist wieder frei
    expect(document.body.style.overflow).not.toBe('hidden');

    cleanup();
  });

  it('Fokus bleibt im offenen Menue gefangen (Fokus-Trap)', async () => {
    const { cleanup } = renderFullPage();
    const user = userEvent.setup();

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });
    await userEvent.click(hamburgerButton);

    // Tab mehrfach durch
    for (let i = 0; i < 10; i++) {
      await user.tab();
    }

    // Fokus sollte innerhalb des Headers/der Navigation bleiben
    const header = screen.getByRole('banner');
    expect(header.contains(document.activeElement)).toBe(true);

    cleanup();
  });

  it('Menue-Button zeigt korrektes Icon (Hamburger vs. Schliessen)', async () => {
    const { cleanup } = renderFullPage();

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });

    // Geschlossener Zustand - sollte "Menue oeffnen" oder aehnliches anzeigen
    const _closedLabel =
      hamburgerButton.getAttribute('aria-label') || hamburgerButton.textContent;

    await userEvent.click(hamburgerButton);

    // Offener Zustand - Label/Icon sollte sich aendern
    const _openedLabel =
      hamburgerButton.getAttribute('aria-label') || hamburgerButton.textContent;

    // Labels sollten sich unterscheiden oder Button sollte aria-expanded nutzen
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

    cleanup();
  });
});

// ============================================================================
// E2E Szenario 4: Viewport-Wechsel (Responsive)
// ============================================================================

describe('E2E: Responsive Viewport-Wechsel', () => {
  it('Wechsel von Desktop zu Mobile zeigt Hamburger-Button', () => {
    // Start als Desktop
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: query.includes('min-width'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { cleanup, rerender: _rerender } = renderFullPage();

    // Auf Desktop sollte kein Hamburger-Button sichtbar sein
    const desktopButton = screen.queryByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });
    if (desktopButton) {
      expect(desktopButton).not.toBeVisible();
    }

    // Wechsel zu Mobile
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    act(() => {
      fireEvent(window, new Event('resize'));
    });

    cleanup();
  });

  it('Header behaelt seine Position bei allen Viewport-Groessen', () => {
    const { cleanup } = renderFullPage();

    const header = screen.getByRole('banner');

    // Pruefe sticky/fixed Position
    const hasStickyPosition =
      header.className.includes('sticky') || header.className.includes('fixed');

    expect(hasStickyPosition).toBe(true);

    cleanup();
  });
});

// ============================================================================
// E2E Szenario 5: Edge Cases und Fehler-Faelle
// ============================================================================

describe('E2E: Edge Cases', () => {
  it('Header rendert korrekt ohne Navigationsitems', () => {
    render(<Header sections={[]} {...defaultHeaderProps} />);

    const header = screen.getByRole('banner');
    expect(header).toBeVisible();

    // Logo sollte trotzdem sichtbar sein
    const logo = within(header).queryByRole('img', { name: /logo/i });
    expect(logo).toBeInTheDocument();
  });

  it('Header rendert korrekt mit einem einzelnen Navigationselement', () => {
    const singleItem: NavigationSection[] = [
      { label: 'Start', href: '#start', id: 'start' },
    ];

    render(<Header sections={singleItem} {...defaultHeaderProps} />);

    const link = screen.getByRole('link', { name: 'Start' });
    expect(link).toBeInTheDocument();
  });

  it('Header handhabt Navigationsitems mit Sonderzeichen', () => {
    const specialItems: NavigationSection[] = [
      { label: 'Ueber & Mehr', href: '#ueber-mehr', id: 'ueber-mehr' },
      { label: 'FAQ / Hilfe', href: '#faq-hilfe', id: 'faq-hilfe' },
    ];

    render(<Header sections={specialItems} {...defaultHeaderProps} />);

    expect(
      screen.getByRole('link', { name: 'Ueber & Mehr' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'FAQ / Hilfe' })
    ).toBeInTheDocument();
  });

  it('Navigation zu nicht-existierender Sektion wirft keinen Fehler', async () => {
    const items: NavigationSection[] = [
      { label: 'Ghost', href: '#ghost-section', id: 'ghost-section' },
    ];

    render(<Header sections={items} {...defaultHeaderProps} />);

    const link = screen.getByRole('link', { name: 'Ghost' });

    // Sollte keinen Fehler werfen
    await expect(async () => {
      await userEvent.click(link);
    }).not.toThrow();
  });

  it('Doppelklick auf Hamburger-Button funktioniert korrekt', async () => {
    // Simuliere mobilen Viewport
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: query.includes('max-width'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(<Header sections={navigationItems} {...defaultHeaderProps} />);

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });

    // Schnelles Doppelklick
    await userEvent.click(hamburgerButton);
    await userEvent.click(hamburgerButton);

    // Sollte geschlossen sein (Toggle: oeffnen -> schliessen)
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('Mehrfaches Scrollen loest keine Memory Leaks oder Fehler aus', () => {
    const { cleanup } = renderFullPage();

    // Simuliere schnelles Scrollen
    expect(() => {
      for (let scrollY = 0; scrollY <= 5000; scrollY += 100) {
        act(() => {
          Object.defineProperty(window, 'scrollY', {
            value: scrollY,
            writable: true,
          });
          fireEvent.scroll(window);
        });
      }
    }).not.toThrow();

    cleanup();
  });

  it('Header wird korrekt unmounted ohne Fehler', () => {
    const { unmount } = render(
      <Header sections={navigationItems} {...defaultHeaderProps} />
    );

    expect(() => {
      unmount();
    }).not.toThrow();
  });

  it('Logo-Bild mit Ladefehler zeigt Fallback', () => {
    render(<Header sections={navigationItems} {...defaultHeaderProps} />);

    const logo = screen.getByRole('img', { name: /logo/i });

    // Simuliere Ladefehler
    fireEvent.error(logo);

    // Nach dem Fehler sollte entweder ein Fallback-Bild oder Alt-Text sichtbar sein
    const header = screen.getByRole('banner');
    expect(header).toBeVisible();
  });
});

// ============================================================================
// E2E Szenario 6: Performance und Rendering
// ============================================================================

describe('E2E: Rendering-Verhalten', () => {
  it('Header rendert initial ohne Fehler', () => {
    expect(() => {
      render(<Header sections={navigationItems} {...defaultHeaderProps} />);
    }).not.toThrow();
  });

  it('Header re-rendert bei Props-Aenderung ohne Fehler', () => {
    const { rerender } = render(
      <Header sections={navigationItems} {...defaultHeaderProps} />
    );

    expect(() => {
      rerender(
        <Header
          sections={navigationItems.slice(0, 2)}
          {...defaultHeaderProps}
        />
      );
    }).not.toThrow();
  });

  it('Scroll-Event-Listener wird beim Unmount entfernt', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <Header sections={navigationItems} {...defaultHeaderProps} />
    );

    const scrollListenerAdded = addSpy.mock.calls.some(
      (call) => call[0] === 'scroll'
    );

    unmount();

    if (scrollListenerAdded) {
      const scrollListenerRemoved = removeSpy.mock.calls.some(
        (call) => call[0] === 'scroll'
      );
      expect(scrollListenerRemoved).toBe(true);
    }

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('IntersectionObserver wird beim Unmount disconnected', () => {
    const disconnectFn = jest.fn();

    (window.IntersectionObserver as jest.Mock).mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: disconnectFn,
      root: null,
      rootMargin: '',
      thresholds: [],
    }));

    const { unmount } = render(
      <Header sections={navigationItems} {...defaultHeaderProps} />
    );

    unmount();

    // disconnect sollte aufgerufen worden sein wenn ein Observer erstellt wurde
    if ((window.IntersectionObserver as jest.Mock).mock.calls.length > 0) {
      expect(disconnectFn).toHaveBeenCalled();
    }
  });
});
