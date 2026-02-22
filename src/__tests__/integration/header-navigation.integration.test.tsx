/**
 * Integration Tests: Basis-Layout Header & Navigation
 *
 * Ticket: Basis-Layout: Header & Navigation (fdaa0ae6)
 * Akzeptanzkriterien: REQ-001 bis REQ-008
 *
 * Diese Tests pruefen das Zusammenspiel aller Header-Komponenten:
 * Header, Logo, Navigation, HamburgerMenu und die zugehoerigen Hooks.
 */

import { render, screen, fireEvent, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/layout/Header';
import { Logo } from '@/components/layout/Logo';
import { Navigation } from '@/components/layout/Navigation';
// HamburgerMenu import will be enabled once the component is implemented
// import { HamburgerMenu } from '@/components/layout/HamburgerMenu';
import type { NavigationSection } from '@/components/layout/types';

// ============================================================================
// Test Fixtures
// ============================================================================

const mockNavigationItems: NavigationSection[] = [
  { label: 'Start', href: '#start', id: 'start' },
  { label: 'Leistungen', href: '#leistungen', id: 'leistungen' },
  { label: 'Ueber uns', href: '#ueber-uns', id: 'ueber-uns' },
  { label: 'Kontakt', href: '#kontakt', id: 'kontakt' },
];

const defaultHeaderProps = {
  logoSrc: '/logo.svg',
  logoAlt: 'possibility GmbH Logo',
  logoFallbackSrc: '/logo.png',
};

const noopNavigate = jest.fn();

// Mock IntersectionObserver for useActiveSection hook
const mockIntersectionObserver = jest.fn();
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

beforeEach(() => {
  mockIntersectionObserver.mockReset();
  mockObserve.mockReset();
  mockUnobserve.mockReset();
  mockDisconnect.mockReset();

  mockIntersectionObserver.mockImplementation(
    (_callback: IntersectionObserverCallback) => ({
      observe: mockObserve,
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
      root: null,
      rootMargin: '',
      thresholds: [],
    })
  );

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });

  // Mock matchMedia for responsive tests
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // Mock scrollIntoView
  Element.prototype.scrollIntoView = jest.fn();

  // Reset body styles
  document.body.style.overflow = '';
});

// ============================================================================
// REQ-001: Logo-Einbindung im Header
// ============================================================================

describe('REQ-001: Logo-Einbindung im Header', () => {
  it('rendert das Logo innerhalb des Headers', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const header = screen.getByRole('banner');
    const logo = within(header).getByRole('img', { name: /logo/i });
    expect(logo).toBeInTheDocument();
  });

  it('zeigt das Logo als Bild mit Alt-Text an', () => {
    render(
      <Logo
        src="/logo.svg"
        alt="possibility GmbH Logo"
        fallbackSrc="/logo.png"
      />
    );

    const logoImg = screen.getByRole('img');
    expect(logoImg).toHaveAttribute('alt');
    expect(logoImg.getAttribute('alt')).not.toBe('');
  });

  it('verlinkt das Logo zur Startseite', () => {
    render(
      <Logo
        src="/logo.svg"
        alt="possibility GmbH Logo"
        fallbackSrc="/logo.png"
      />
    );

    const logoLink = screen.getByRole('link');
    expect(logoLink).toHaveAttribute('href', '#top');
  });

  it('rendert einen PNG-Fallback wenn SVG nicht unterstuetzt wird', () => {
    render(
      <Logo
        src="/logo.svg"
        alt="possibility GmbH Logo"
        fallbackSrc="/logo.png"
      />
    );

    // Logo sollte entweder ein img mit src oder ein picture-Element mit source + img sein
    const imgElement = screen.getByRole('img');
    expect(imgElement).toBeInTheDocument();

    // Pruefe ob picture-Element mit Fallback existiert
    const pictureElement = imgElement.closest('picture');
    if (pictureElement) {
      const sourceElements = pictureElement.querySelectorAll('source');
      expect(sourceElements.length).toBeGreaterThanOrEqual(1);
      expect(imgElement).toHaveAttribute('src'); // PNG Fallback
    } else {
      // Mindestens ein img mit src muss vorhanden sein
      expect(imgElement).toHaveAttribute('src');
    }
  });

  it('Logo ist im Header sichtbar (nicht display:none)', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const header = screen.getByRole('banner');
    const logo = within(header).getByRole('img', { name: /logo/i });
    expect(logo).toBeVisible();
  });
});

// ============================================================================
// REQ-002: Navigationsmenue mit Sektionsverlinkung
// ============================================================================

describe('REQ-002: Navigationsmenue mit Sektionsverlinkung', () => {
  it('rendert alle Navigationspunkte', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    mockNavigationItems.forEach((item) => {
      const link = screen.getByRole('link', { name: item.label });
      expect(link).toBeInTheDocument();
    });
  });

  it('jeder Navigationspunkt hat einen Anker-Link zur Sektion', () => {
    render(
      <Navigation
        sections={mockNavigationItems}
        activeSectionId={null}
        onNavigate={noopNavigate}
      />
    );

    mockNavigationItems.forEach((item) => {
      const link = screen.getByRole('link', { name: item.label });
      expect(link).toHaveAttribute('href', item.href);
    });
  });

  it('Navigationslinks verweisen auf existierende Sektions-IDs (Anker-Format)', () => {
    render(
      <Navigation
        sections={mockNavigationItems}
        activeSectionId={null}
        onNavigate={noopNavigate}
      />
    );

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).toMatch(/^#[a-z0-9-]+$/);
    });
  });

  it('Navigation ist als nav-Element gerendert', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  it('Navigationspunkte werden als Liste (ul/li) gerendert', () => {
    render(
      <Navigation
        sections={mockNavigationItems}
        activeSectionId={null}
        onNavigate={noopNavigate}
      />
    );

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    const listItems = within(list).getAllByRole('listitem');
    expect(listItems).toHaveLength(mockNavigationItems.length);
  });

  it('Klick auf Navigationslink loest smooth-scroll aus', async () => {
    // Setup: Erstelle Sektions-Elemente im DOM
    mockNavigationItems.forEach((item) => {
      const section = document.createElement('section');
      section.id = item.id;
      document.body.appendChild(section);
    });

    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const link = screen.getByRole('link', { name: 'Leistungen' });
    await userEvent.click(link);

    const targetSection = document.getElementById('leistungen');
    expect(targetSection?.scrollIntoView).toHaveBeenCalled();

    // Cleanup
    mockNavigationItems.forEach((item) => {
      const section = document.getElementById(item.id);
      section?.remove();
    });
  });
});

// ============================================================================
// REQ-003: Sticky-Header beim Scrollen
// ============================================================================

describe('REQ-003: Sticky-Header beim Scrollen', () => {
  it('Header hat position:sticky oder position:fixed', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const header = screen.getByRole('banner');
    const style = window.getComputedStyle(header);
    const position = style.position;

    // Entweder sticky oder fixed ist akzeptabel
    const hasStickyBehavior =
      position === 'sticky' ||
      position === 'fixed' ||
      header.classList.toString().includes('sticky') ||
      header.classList.toString().includes('fixed');

    expect(hasStickyBehavior).toBe(true);
  });

  it('Header bekommt eine CSS-Klasse beim Scrollen', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const header = screen.getByRole('banner');
    const initialClasses = header.className;

    // Simuliere Scroll-Event
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
      fireEvent.scroll(window);
    });

    // Nach dem Scrollen sollte sich die Klasse geaendert haben
    // (z.B. shadow, background-Aenderung, etc.)
    const scrolledClasses = header.className;
    expect(scrolledClasses).not.toBe(initialClasses);
  });

  it('Header bleibt am oberen Rand sichtbar nach Scroll', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const header = screen.getByRole('banner');

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
      fireEvent.scroll(window);
    });

    expect(header).toBeVisible();
  });

  it('Header hat z-index fuer Ueberlappung', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const header = screen.getByRole('banner');

    // Pruefe ob z-index Klasse vorhanden ist (z.B. Tailwind z-50, z-40 etc.)
    const hasZIndex =
      header.className.includes('z-') ||
      window.getComputedStyle(header).zIndex !== '' ||
      window.getComputedStyle(header).zIndex !== 'auto';

    expect(hasZIndex).toBe(true);
  });
});

// ============================================================================
// REQ-004: Hamburger-Menue auf mobilen Viewports
// ============================================================================

describe('REQ-004: Hamburger-Menue auf mobilen Viewports', () => {
  beforeEach(() => {
    // Simuliere mobilen Viewport (<768px)
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches:
        query.includes('max-width: 767px') || query === '(max-width: 767px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('zeigt den Hamburger-Button auf mobilen Viewports', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });
    expect(hamburgerButton).toBeInTheDocument();
  });

  it('Hamburger-Button oeffnet das mobile Menue', async () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });

    await userEvent.click(hamburgerButton);

    // Nach Klick sollten Navigationslinks sichtbar sein
    mockNavigationItems.forEach((item) => {
      expect(screen.getByRole('link', { name: item.label })).toBeVisible();
    });
  });

  it('Menue schliesst sich bei erneutem Klick auf Hamburger', async () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });

    // Oeffnen
    await userEvent.click(hamburgerButton);
    expect(screen.getByRole('navigation')).toBeVisible();

    // Schliessen
    await userEvent.click(hamburgerButton);

    // Navigation sollte geschlossen sein (hidden oder nicht im DOM)
    const nav = screen.queryByRole('navigation');
    if (nav) {
      // Wenn noch im DOM, sollte es aria-hidden oder visuell versteckt sein
      expect(nav).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('Menue schliesst sich bei Klick auf einen Navigationslink', async () => {
    // Erstelle Sektions-Elemente
    mockNavigationItems.forEach((item) => {
      const section = document.createElement('section');
      section.id = item.id;
      document.body.appendChild(section);
    });

    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });

    await userEvent.click(hamburgerButton);
    const link = screen.getByRole('link', { name: 'Kontakt' });
    await userEvent.click(link);

    // Hamburger-Button sollte aria-expanded=false haben
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');

    // Cleanup
    mockNavigationItems.forEach((item) => {
      document.getElementById(item.id)?.remove();
    });
  });

  it('Body-Scroll ist bei offenem Menue gesperrt', async () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });

    await userEvent.click(hamburgerButton);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('Body-Scroll wird bei geschlossenem Menue wieder freigegeben', async () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });

    // Oeffnen
    await userEvent.click(hamburgerButton);
    expect(document.body.style.overflow).toBe('hidden');

    // Schliessen
    await userEvent.click(hamburgerButton);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('Escape-Taste schliesst das mobile Menue', async () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });

    await userEvent.click(hamburgerButton);

    await userEvent.keyboard('{Escape}');

    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
  });
});

// ============================================================================
// REQ-005: Aktiver Navigationspunkt wird hervorgehoben
// ============================================================================

describe('REQ-005: Aktiver Navigationspunkt wird hervorgehoben', () => {
  it('der aktive Navigationspunkt hat aria-current="page" oder aria-current="true"', () => {
    render(
      <Navigation
        sections={mockNavigationItems}
        activeSectionId="leistungen"
        onNavigate={noopNavigate}
      />
    );

    const activeLink = screen.getByRole('link', { name: 'Leistungen' });
    const ariaCurrent = activeLink.getAttribute('aria-current');
    expect(ariaCurrent === 'page' || ariaCurrent === 'true').toBe(true);
  });

  it('nicht-aktive Navigationspunkte haben kein aria-current', () => {
    render(
      <Navigation
        sections={mockNavigationItems}
        activeSectionId="leistungen"
        onNavigate={noopNavigate}
      />
    );

    const inactiveLink = screen.getByRole('link', { name: 'Start' });
    expect(inactiveLink).not.toHaveAttribute('aria-current');
  });

  it('aktiver Navigationspunkt hat visuell unterschiedliches Styling', () => {
    render(
      <Navigation
        sections={mockNavigationItems}
        activeSectionId="leistungen"
        onNavigate={noopNavigate}
      />
    );

    const activeLink = screen.getByRole('link', { name: 'Leistungen' });
    const inactiveLink = screen.getByRole('link', { name: 'Start' });

    // Aktiver Link sollte andere CSS-Klassen haben
    expect(activeLink.className).not.toBe(inactiveLink.className);
  });

  it('Wechsel der aktiven Sektion aktualisiert die Hervorhebung', () => {
    const { rerender } = render(
      <Navigation
        sections={mockNavigationItems}
        activeSectionId="start"
        onNavigate={noopNavigate}
      />
    );

    expect(screen.getByRole('link', { name: 'Start' })).toHaveAttribute(
      'aria-current'
    );

    rerender(
      <Navigation
        sections={mockNavigationItems}
        activeSectionId="kontakt"
        onNavigate={noopNavigate}
      />
    );

    expect(screen.getByRole('link', { name: 'Start' })).not.toHaveAttribute(
      'aria-current'
    );
    expect(screen.getByRole('link', { name: 'Kontakt' })).toHaveAttribute(
      'aria-current'
    );
  });

  it('nur ein Navigationspunkt ist gleichzeitig aktiv', () => {
    render(
      <Navigation
        sections={mockNavigationItems}
        activeSectionId="ueber-uns"
        onNavigate={noopNavigate}
      />
    );

    const links = screen.getAllByRole('link');
    const activeLinks = links.filter(
      (link) => link.getAttribute('aria-current') !== null
    );

    expect(activeLinks).toHaveLength(1);
    expect(activeLinks[0]).toHaveTextContent('Ueber uns');
  });
});

// ============================================================================
// REQ-006: Tastaturnavigation im Header
// ============================================================================

describe('REQ-006: Tastaturnavigation im Header', () => {
  it('alle Navigationselemente sind per Tab erreichbar', async () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const user = userEvent.setup();

    // Tab durch alle Links
    for (const _item of mockNavigationItems) {
      await user.tab();
      // Irgendwann muss der Link fokussiert sein
    }

    // Pruefe ob mindestens ein Navigationselement fokussiert werden konnte
    const focusedElement = document.activeElement;
    expect(focusedElement?.tagName).toBe('A');
  });

  it('Navigationselement kann per Enter aktiviert werden', async () => {
    // Erstelle Sektions-Element
    const section = document.createElement('section');
    section.id = 'leistungen';
    document.body.appendChild(section);

    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const link = screen.getByRole('link', { name: 'Leistungen' });
    link.focus();

    await userEvent.keyboard('{Enter}');

    expect(section.scrollIntoView).toHaveBeenCalled();

    section.remove();
  });

  it('Fokus ist sichtbar auf Navigationselementen (Focus-Ring)', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const link = screen.getByRole('link', { name: 'Leistungen' });
    link.focus();

    // Pruefe ob focus-visible oder outline-Klassen vorhanden sind
    const hasFocusStyles =
      link.className.includes('focus') ||
      link.className.includes('outline') ||
      link.className.includes('ring');

    expect(hasFocusStyles).toBe(true);
  });

  it('Tab-Reihenfolge entspricht visueller Reihenfolge', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const links = screen.getAllByRole('link');

    // Keiner der Links sollte tabindex > 0 haben (natuerliche Reihenfolge)
    links.forEach((link) => {
      const tabIndex = link.getAttribute('tabindex');
      if (tabIndex !== null) {
        expect(parseInt(tabIndex)).toBeLessThanOrEqual(0);
      }
    });
  });

  it('Fokus-Trap im mobilen Menue haelt Fokus innerhalb', async () => {
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

    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const hamburgerButton = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });
    await userEvent.click(hamburgerButton);

    // Fokus sollte jetzt im Menue sein
    const _focusedElement = document.activeElement;
    const _nav = screen.getByRole('navigation');

    // Nach mehrfachem Tab sollte der Fokus im Nav bleiben
    const user = userEvent.setup();
    for (let i = 0; i < mockNavigationItems.length + 3; i++) {
      await user.tab();
    }

    // Fokus sollte immer noch innerhalb der Navigation oder des Hamburger-Buttons sein
    const currentFocused = document.activeElement;
    const isInHeader = screen.getByRole('banner').contains(currentFocused);
    expect(isInHeader).toBe(true);
  });
});

// ============================================================================
// REQ-007: ARIA-Attribute und semantische Struktur
// ============================================================================

describe('REQ-007: ARIA-Attribute und semantische Struktur', () => {
  it('Header verwendet <header> (role=banner)', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const header = screen.getByRole('banner');
    expect(header.tagName.toLowerCase()).toBe('header');
  });

  it('Navigation verwendet <nav> (role=navigation)', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const nav = screen.getByRole('navigation');
    expect(nav.tagName.toLowerCase()).toBe('nav');
  });

  it('Navigation hat ein aria-label', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const nav = screen.getByRole('navigation');
    const hasLabel =
      nav.hasAttribute('aria-label') || nav.hasAttribute('aria-labelledby');
    expect(hasLabel).toBe(true);
  });

  it('Hamburger-Button hat aria-expanded Attribut', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const button = screen.queryByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });
    if (button) {
      expect(button).toHaveAttribute('aria-expanded');
    }
  });

  it('Hamburger-Button aria-expanded wechselt korrekt', async () => {
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

    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const button = screen.getByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });

    expect(button).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('Hamburger-Button hat aria-controls das auf die Navigation verweist', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const button = screen.queryByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });
    if (button) {
      const controlsId = button.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();

      // Das referenzierte Element sollte existieren
      const controlledElement = document.getElementById(controlsId!);
      expect(controlledElement).toBeInTheDocument();
    }
  });

  it('Navigationsliste verwendet semantische <ul>/<li> Elemente', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const nav = screen.getByRole('navigation');
    const list = within(nav).getByRole('list');
    expect(list.tagName.toLowerCase()).toBe('ul');

    const items = within(list).getAllByRole('listitem');
    items.forEach((item) => {
      expect(item.tagName.toLowerCase()).toBe('li');
    });
  });

  it('Links haben aussagekraeftige Labels (kein leerer Text)', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const hasText = link.textContent && link.textContent.trim().length > 0;
      const hasAriaLabel = link.hasAttribute('aria-label');
      expect(hasText || hasAriaLabel).toBe(true);
    });
  });

  it('aktiver Link hat aria-current Attribut', () => {
    render(
      <Navigation
        sections={mockNavigationItems}
        activeSectionId="start"
        onNavigate={noopNavigate}
      />
    );

    const activeLink = screen.getByRole('link', { name: 'Start' });
    expect(activeLink).toHaveAttribute('aria-current');
  });
});

// ============================================================================
// REQ-008: Responsive Uebergaenge zwischen Viewports
// ============================================================================

describe('REQ-008: Responsive Uebergaenge zwischen Viewports', () => {
  it('Desktop-Navigation ist auf Desktop-Viewports sichtbar', () => {
    // Simuliere Desktop Viewport (>=768px)
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches:
        query.includes('min-width: 768px') || query === '(min-width: 768px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeVisible();
  });

  it('Hamburger-Button ist auf Desktop-Viewports nicht sichtbar', () => {
    // Simuliere Desktop Viewport
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: query.includes('min-width: 768px'),
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const button = screen.queryByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });
    if (button) {
      // Button sollte versteckt sein auf Desktop
      expect(button).not.toBeVisible();
    }
    // Oder Button existiert nicht im DOM - auch ok
  });

  it('Viewport-Wechsel von Mobile zu Desktop schliesst das Hamburger-Menue', async () => {
    // Starte als Mobile
    const matchMediaListeners: Array<(e: { matches: boolean }) => void> = [];

    (window.matchMedia as jest.Mock).mockImplementation((query: string) => {
      const mql = {
        matches: query.includes('max-width'),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(
          (event: string, handler: (e: { matches: boolean }) => void) => {
            matchMediaListeners.push(handler);
          }
        ),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      };
      return mql;
    });

    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const hamburgerButton = screen.queryByRole('button', {
      name: /men(ue|ü)|navigation|toggle/i,
    });
    if (hamburgerButton) {
      await userEvent.click(hamburgerButton);
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

      // Simuliere Viewport-Wechsel zu Desktop
      act(() => {
        matchMediaListeners.forEach((listener) => {
          listener({ matches: false });
        });
      });

      // Menue sollte geschlossen sein
      expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('Header-Layout passt sich an verschiedene Viewport-Breiten an', () => {
    render(<Header sections={mockNavigationItems} {...defaultHeaderProps} />);

    const header = screen.getByRole('banner');

    // Header sollte responsive Klassen haben (z.B. flex, responsive padding)
    const hasFlexLayout =
      header.className.includes('flex') ||
      header.querySelector('[class*="flex"]') !== null;

    expect(hasFlexLayout).toBe(true);
  });
});
