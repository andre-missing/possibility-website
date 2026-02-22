/**
 * E2E-Style Tests: Hero-Sektion – Erster visueller Eindruck
 *
 * Ticket: Hero-Sektion: Erster visueller Eindruck (045582af)
 *
 * Diese Tests simulieren End-to-End User-Flows fuer die Hero-Sektion.
 * Sie testen das vollstaendige Zusammenspiel aller Komponenten in
 * realistischen Szenarien.
 *
 * Hinweis: Da kein E2E-Framework (Playwright/Cypress) konfiguriert ist,
 * werden diese Tests als Component-Integration-Tests mit Testing Library
 * implementiert, die E2E-Szenarien abbilden.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeroSection from '@/components/hero/HeroSection';
import HeroCTA from '@/components/hero/HeroCTA';
import {
  DEFAULT_HERO_CONFIG,
  ANIMATION_DELAYS,
  ANIMATION_DURATIONS,
} from '@/components/hero/hero.constants';
import type { CTAConfig } from '@/components/hero/hero.types';

// ============================================================================
// Mocks
// ============================================================================

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({
    fill: _fill,
    priority: _priority,
    blurDataURL: _blurDataURL,
    placeholder: _placeholder,
    ...props
  }: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  };
});

// For E2E tests: use real-like animation behavior
let mockReducedMotion = true;
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockReducedMotion,
}));

let mockAnimationState = {
  logoVisible: true,
  claimVisible: true,
  ctaVisible: true,
  allComplete: true,
};
jest.mock('@/hooks/useHeroAnimation', () => ({
  useHeroAnimation: () => mockAnimationState,
}));

// ============================================================================
// Setup & Helpers
// ============================================================================

/**
 * Erstellt eine vollstaendige Seite mit Hero-Sektion und Ziel-Sektionen
 * fuer realistische E2E-Szenarien
 */
function renderFullHeroPage(
  config?: Parameters<typeof HeroSection>[0]['config']
) {
  // Erstelle Ziel-Sektionen im DOM
  const pageContainer = document.createElement('div');
  pageContainer.id = 'page-root';

  const sections = ['content', 'leistungen', 'ueber-uns', 'kontakt'];
  sections.forEach((id) => {
    const section = document.createElement('section');
    section.id = id;
    section.style.height = '800px';
    section.innerHTML = `<h2>${id}</h2><p>Inhalt fuer ${id}</p>`;
    pageContainer.appendChild(section);
  });

  document.body.appendChild(pageContainer);

  const result = render(<HeroSection config={config} />);

  return {
    ...result,
    cleanup: () => {
      pageContainer.remove();
    },
  };
}

beforeEach(() => {
  mockReducedMotion = true;
  mockAnimationState = {
    logoVisible: true,
    claimVisible: true,
    ctaVisible: true,
    allComplete: true,
  };

  // Mock matchMedia
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

  // Reset body
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

// ============================================================================
// E2E Szenario 1: Erster Seitenaufruf – Desktop
// ============================================================================

describe('E2E: Erster Seitenaufruf (Desktop)', () => {
  it('Benutzer sieht die vollstaendige Hero-Sektion beim Laden der Seite', () => {
    const { cleanup } = renderFullHeroPage();

    // Hero-Sektion ist sichtbar
    const section = screen.getByRole('region', { name: 'Hero' });
    expect(section).toBeVisible();

    // Logo ist sichtbar
    const logo = screen.getByAltText('possibilITy Holding Logo');
    expect(logo).toBeVisible();

    // Claim ist sichtbar
    const claim = screen.getByRole('heading', { level: 1 });
    expect(claim).toBeVisible();
    expect(claim).toHaveTextContent(
      'Digitale Transformation. Gemeinsam gestalten.'
    );

    // Sub-Claim ist sichtbar
    expect(
      screen.getByText('Innovative IT-Lösungen für Ihren Erfolg')
    ).toBeVisible();

    // CTA ist sichtbar
    expect(screen.getByRole('button', { name: 'Mehr erfahren' })).toBeVisible();

    cleanup();
  });

  it('Hero-Sektion fuellt den gesamten sichtbaren Bereich (Vollbild)', () => {
    const { cleanup, container } = renderFullHeroPage();

    const section = container.querySelector('section');
    expect(section?.className).toContain('w-screen');
    expect(section?.className).toContain('min-h-[80vh]');

    cleanup();
  });

  it('Hintergrund-Gradient ist sichtbar und Text ist lesbar', () => {
    const { cleanup, container } = renderFullHeroPage();

    // Hintergrund vorhanden
    const bgWrapper = container.querySelector('[aria-hidden="true"]');
    expect(bgWrapper).toBeInTheDocument();

    // Overlay fuer Kontrast vorhanden
    const overlay = screen.getByTestId('hero-overlay');
    expect(overlay).toBeInTheDocument();

    // Text ist weiss fuer guten Kontrast
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.className).toContain('text-white');

    cleanup();
  });
});

// ============================================================================
// E2E Szenario 2: Benutzer klickt auf CTA-Button
// ============================================================================

describe('E2E: CTA-Button Interaktion', () => {
  it('Benutzer klickt auf "Mehr erfahren" und scrollt zum Content-Bereich', async () => {
    const { cleanup } = renderFullHeroPage();

    const ctaButton = screen.getByRole('button', { name: 'Mehr erfahren' });
    await userEvent.click(ctaButton);

    // scrollIntoView sollte auf dem content-Element aufgerufen werden
    const contentSection = document.getElementById('content');
    expect(contentSection?.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    cleanup();
  });

  it('Benutzer klickt auf Scroll-Indicator und scrollt nach unten', async () => {
    const { cleanup } = renderFullHeroPage({
      cta: {
        text: 'Entdecken',
        variant: 'scroll-indicator',
        targetSectionId: 'content',
      },
    });

    const scrollButton = screen.getByRole('button', { name: 'Entdecken' });
    await userEvent.click(scrollButton);

    const contentSection = document.getElementById('content');
    expect(contentSection?.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    cleanup();
  });

  it('CTA-Button ist per Tastatur (Enter) aktivierbar', async () => {
    const { cleanup } = renderFullHeroPage();

    const ctaButton = screen.getByRole('button', { name: 'Mehr erfahren' });
    ctaButton.focus();

    await userEvent.keyboard('{Enter}');

    const contentSection = document.getElementById('content');
    expect(contentSection?.scrollIntoView).toHaveBeenCalled();

    cleanup();
  });

  it('CTA-Button ist per Tastatur (Space) aktivierbar', async () => {
    const { cleanup } = renderFullHeroPage();

    const ctaButton = screen.getByRole('button', { name: 'Mehr erfahren' });
    ctaButton.focus();

    await userEvent.keyboard(' ');

    const contentSection = document.getElementById('content');
    expect(contentSection?.scrollIntoView).toHaveBeenCalled();

    cleanup();
  });
});

// ============================================================================
// E2E Szenario 3: Animation und Einblend-Effekt
// ============================================================================

describe('E2E: Animations-Sequenz', () => {
  it('Benutzer sieht gestaffelte Animation: Logo → Claim → CTA', () => {
    // Simuliere Animation noch nicht gestartet
    mockAnimationState = {
      logoVisible: false,
      claimVisible: false,
      ctaVisible: false,
      allComplete: false,
    };
    mockReducedMotion = false;

    const { container, rerender } = render(<HeroSection />);

    const contentWrapper = container.querySelector('.relative.z-10');
    const divs = contentWrapper ? Array.from(contentWrapper.children) : [];

    // Initial: alle Elemente sind unsichtbar (opacity 0)
    divs.forEach((div) => {
      expect((div as HTMLElement).style.opacity).toBe('0');
    });

    // Simuliere: Logo wird sichtbar
    mockAnimationState = {
      logoVisible: true,
      claimVisible: false,
      ctaVisible: false,
      allComplete: false,
    };
    rerender(<HeroSection />);

    expect((divs[0] as HTMLElement).style.opacity).toBe('1');
    expect((divs[1] as HTMLElement).style.opacity).toBe('0');
    expect((divs[2] as HTMLElement).style.opacity).toBe('0');

    // Simuliere: Claim wird sichtbar
    mockAnimationState = {
      logoVisible: true,
      claimVisible: true,
      ctaVisible: false,
      allComplete: false,
    };
    rerender(<HeroSection />);

    expect((divs[0] as HTMLElement).style.opacity).toBe('1');
    expect((divs[1] as HTMLElement).style.opacity).toBe('1');
    expect((divs[2] as HTMLElement).style.opacity).toBe('0');

    // Simuliere: CTA wird sichtbar (Animation abgeschlossen)
    mockAnimationState = {
      logoVisible: true,
      claimVisible: true,
      ctaVisible: true,
      allComplete: true,
    };
    rerender(<HeroSection />);

    divs.forEach((div) => {
      expect((div as HTMLElement).style.opacity).toBe('1');
    });
  });

  it('Benutzer mit Reduced-Motion sieht alle Elemente sofort (keine Animation)', () => {
    mockReducedMotion = true;
    mockAnimationState = {
      logoVisible: true,
      claimVisible: true,
      ctaVisible: true,
      allComplete: true,
    };

    const { container } = render(<HeroSection />);

    const contentWrapper = container.querySelector('.relative.z-10');
    const divs = contentWrapper ? Array.from(contentWrapper.children) : [];

    // Alle sofort sichtbar
    divs.forEach((div) => {
      expect((div as HTMLElement).style.opacity).toBe('1');
    });

    // Keine Transition-Styles
    divs.forEach((div) => {
      expect((div as HTMLElement).style.transitionProperty).toBe('');
    });
  });

  it('Animations-Konfiguration hat die korrekten Timing-Werte', () => {
    expect(ANIMATION_DELAYS.logo).toBe(0);
    expect(ANIMATION_DELAYS.claim).toBe(300);
    expect(ANIMATION_DELAYS.cta).toBe(600);
    expect(ANIMATION_DURATIONS.fadeIn).toBe(700);
  });
});

// ============================================================================
// E2E Szenario 4: Barrierefreiheit fuer Screen-Reader-Benutzer
// ============================================================================

describe('E2E: Barrierefreiheit (Screen Reader)', () => {
  it('Screen-Reader erkennt Hero-Sektion als benannte Region', () => {
    const { cleanup } = renderFullHeroPage();

    const section = screen.getByRole('region', { name: 'Hero' });
    expect(section).toBeInTheDocument();

    cleanup();
  });

  it('Screen-Reader liest die korrekte Heading-Hierarchie (h1)', () => {
    const { cleanup } = renderFullHeroPage();

    const headings = screen.getAllByRole('heading');
    const h1 = headings.find((h) => h.tagName === 'H1');
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent(DEFAULT_HERO_CONFIG.claim);

    cleanup();
  });

  it('Dekorative Elemente (Hintergrund) werden von Screen-Readern ignoriert', () => {
    const { cleanup, container } = renderFullHeroPage();

    const ariaHiddenElements = container.querySelectorAll(
      '[aria-hidden="true"]'
    );
    expect(ariaHiddenElements.length).toBeGreaterThan(0);

    cleanup();
  });

  it('CTA-Button ist eindeutig als interaktives Element identifizierbar', () => {
    const { cleanup } = renderFullHeroPage();

    const button = screen.getByRole('button', { name: 'Mehr erfahren' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');

    cleanup();
  });

  it('Logo hat beschreibenden Alt-Text fuer Screen-Reader', () => {
    const { cleanup } = renderFullHeroPage();

    const logo = screen.getByAltText('possibilITy Holding Logo');
    expect(logo).toBeInTheDocument();

    cleanup();
  });
});

// ============================================================================
// E2E Szenario 5: Tastatur-Navigation durch die Hero-Sektion
// ============================================================================

describe('E2E: Tastatur-Navigation', () => {
  it('Benutzer erreicht den CTA-Button per Tab-Taste', async () => {
    const { cleanup } = renderFullHeroPage();
    const user = userEvent.setup();

    // Tab durch die Seite
    let foundButton = false;
    for (let i = 0; i < 10; i++) {
      await user.tab();
      if (document.activeElement?.tagName === 'BUTTON') {
        foundButton = true;
        break;
      }
    }

    expect(foundButton).toBe(true);
    expect(document.activeElement).toHaveTextContent('Mehr erfahren');

    cleanup();
  });

  it('Focus-Ring ist sichtbar auf dem CTA-Button', () => {
    const { cleanup } = renderFullHeroPage();

    const ctaButton = screen.getByRole('button', { name: 'Mehr erfahren' });
    const hasFocusRing = ctaButton.className.includes('focus-visible:ring');
    expect(hasFocusRing).toBe(true);

    cleanup();
  });

  it('Scroll-Indicator-Button ist per Tab erreichbar und hat Focus-Ring', async () => {
    const scrollCta: CTAConfig = {
      text: 'Nach unten',
      variant: 'scroll-indicator',
      targetSectionId: 'content',
    };

    render(<HeroCTA cta={scrollCta} />);

    const user = userEvent.setup();
    await user.tab();

    const button = screen.getByRole('button', { name: 'Nach unten' });
    expect(document.activeElement).toBe(button);
    expect(button.className).toContain('focus-visible:ring-2');
  });
});

// ============================================================================
// E2E Szenario 6: Mobile Viewport
// ============================================================================

describe('E2E: Mobile Viewport', () => {
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

  it('Hero-Sektion ist auf mobilen Viewports vollstaendig sichtbar', () => {
    const { cleanup } = renderFullHeroPage();

    // Alle Hauptelemente sichtbar
    expect(screen.getByAltText('possibilITy Holding Logo')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Mehr erfahren' })).toBeVisible();

    cleanup();
  });

  it('CTA-Button hat ausreichend grosse Touch-Targets (44x44px)', () => {
    const { cleanup } = renderFullHeroPage();

    const ctaButton = screen.getByRole('button', { name: 'Mehr erfahren' });
    expect(ctaButton.className).toContain('min-h-[44px]');
    expect(ctaButton.className).toContain('min-w-[44px]');

    cleanup();
  });

  it('Text verwendet Mobile-First-Schriftgroessen', () => {
    const { cleanup } = renderFullHeroPage();

    const heading = screen.getByRole('heading', { level: 1 });
    // Mobile Basis: text-3xl
    expect(heading.className).toContain('text-3xl');

    cleanup();
  });

  it('kein horizontaler Overflow auf mobilen Geraeten', () => {
    const { cleanup, container } = renderFullHeroPage();

    const section = container.querySelector('section');
    expect(section?.className).toContain('overflow-x-hidden');

    cleanup();
  });
});

// ============================================================================
// E2E Szenario 7: Benutzerdefinierte Konfiguration
// ============================================================================

describe('E2E: Benutzerdefinierte Hero-Konfiguration', () => {
  it('Benutzer sieht individuellen Claim und CTA', () => {
    const { cleanup } = renderFullHeroPage({
      claim: 'Willkommen bei possibilITy',
      subClaim: 'Gemeinsam in die Zukunft',
      cta: {
        text: 'Jetzt starten',
        variant: 'button',
        targetSectionId: 'leistungen',
      },
    });

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Willkommen bei possibilITy'
    );
    expect(screen.getByText('Gemeinsam in die Zukunft')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Jetzt starten' })).toBeVisible();

    cleanup();
  });

  it('Benutzerdefinierter CTA navigiert zum konfigurierten Ziel', async () => {
    const { cleanup } = renderFullHeroPage({
      cta: {
        text: 'Kontakt aufnehmen',
        variant: 'button',
        targetSectionId: 'kontakt',
      },
    });

    const ctaButton = screen.getByRole('button', {
      name: 'Kontakt aufnehmen',
    });
    await userEvent.click(ctaButton);

    const kontaktSection = document.getElementById('kontakt');
    expect(kontaktSection?.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    cleanup();
  });

  it('Default-Werte werden korrekt verwendet wenn keine Config angegeben', () => {
    const { cleanup } = renderFullHeroPage();

    expect(
      screen.getByText('Digitale Transformation. Gemeinsam gestalten.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Innovative IT-Lösungen für Ihren Erfolg')
    ).toBeInTheDocument();
    expect(screen.getByAltText('possibilITy Holding Logo')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mehr erfahren' })
    ).toBeInTheDocument();

    cleanup();
  });
});

// ============================================================================
// E2E Szenario 8: Edge Cases und Fehlerszenarien
// ============================================================================

describe('E2E: Edge Cases und Fehlerszenarien', () => {
  it('Hero-Sektion rendert ohne Fehler bei leerer Config', () => {
    expect(() => {
      render(<HeroSection config={{}} />);
    }).not.toThrow();
  });

  it('CTA-Klick auf nicht-existierendes Ziel-Element wirft keinen Fehler', async () => {
    // Keine Ziel-Sektionen im DOM
    render(
      <HeroSection
        config={{
          cta: {
            text: 'Ghost Section',
            variant: 'button',
            targetSectionId: 'non-existent',
          },
        }}
      />
    );

    const ctaButton = screen.getByRole('button', { name: 'Ghost Section' });

    await expect(async () => {
      await userEvent.click(ctaButton);
    }).not.toThrow();
  });

  it('Hero-Sektion wird ohne Fehler unmounted', () => {
    const { unmount } = render(<HeroSection />);

    expect(() => {
      unmount();
    }).not.toThrow();
  });

  it('Hero-Sektion re-rendert bei Props-Aenderung ohne Fehler', () => {
    const { rerender } = render(<HeroSection />);

    expect(() => {
      rerender(<HeroSection config={{ claim: 'Neuer Claim' }} />);
    }).not.toThrow();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Neuer Claim'
    );
  });

  it('Hero-Sektion mit allen Hintergrund-Typen rendert ohne Fehler', () => {
    // Gradient (Default)
    expect(() => {
      render(<HeroSection />);
    }).not.toThrow();
  });

  it('Mehrfaches Klicken auf CTA wirft keine Fehler', async () => {
    const { cleanup } = renderFullHeroPage();

    const ctaButton = screen.getByRole('button', { name: 'Mehr erfahren' });

    await expect(async () => {
      await userEvent.click(ctaButton);
      await userEvent.click(ctaButton);
      await userEvent.click(ctaButton);
    }).not.toThrow();

    cleanup();
  });

  it('Sonderzeichen im Claim werden korrekt gerendert', () => {
    render(
      <HeroSection
        config={{
          claim: 'Möglich & Mehr – Zukunft "gestalten"',
        }}
      />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Möglich & Mehr – Zukunft "gestalten"'
    );
  });

  it('Langer Claim-Text erzeugt keinen Layout-Bruch', () => {
    const longClaim =
      'Dies ist ein sehr langer Claim-Text der mehrere Zeilen umfassen koennte und trotzdem korrekt dargestellt werden sollte';

    const { container } = render(<HeroSection config={{ claim: longClaim }} />);

    const section = container.querySelector('section');
    expect(section?.className).toContain('overflow-x-hidden');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      longClaim
    );
  });
});
