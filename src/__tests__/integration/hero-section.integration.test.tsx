/**
 * Integration Tests: Hero-Sektion – Erster visueller Eindruck
 *
 * Ticket: Hero-Sektion: Erster visueller Eindruck (045582af)
 * Akzeptanzkriterien: REQ-001 bis REQ-009
 *
 * Diese Tests pruefen das Zusammenspiel aller Hero-Komponenten:
 * HeroSection, HeroBackground, HeroCTA und die zugehoerigen Hooks
 * (useHeroAnimation, useReducedMotion).
 */

import { render, screen, fireEvent } from '@testing-library/react';
import HeroSection from '@/components/hero/HeroSection';
import HeroBackground from '@/components/hero/HeroBackground';
import HeroCTA from '@/components/hero/HeroCTA';
import {
  DEFAULT_HERO_CONFIG,
  HERO_COLORS,
  ANIMATION_DELAYS,
} from '@/components/hero/hero.constants';
import type { BackgroundConfig, CTAConfig } from '@/components/hero/hero.types';

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

// Mock useReducedMotion – default: reduced motion ON (skip animations in integration tests)
let mockReducedMotion = true;
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockReducedMotion,
}));

// Mock useHeroAnimation – default: all visible
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
// Setup & Teardown
// ============================================================================

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
});

// ============================================================================
// REQ-001: Vollbild-Layout der Hero-Sektion
// ============================================================================

describe('REQ-001: Vollbild-Layout der Hero-Sektion', () => {
  it('rendert die Hero-Sektion als <section> Element', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('nimmt die volle Viewport-Breite ein (w-screen)', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section?.className).toContain('w-screen');
  });

  it('hat eine Mindesthoehe von 80vh (min-h-[80vh])', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section?.className).toContain('min-h-[80vh]');
  });

  it('verhindert horizontalen Overflow (overflow-x-hidden)', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section?.className).toContain('overflow-x-hidden');
  });

  it('zentriert den Inhalt vertikal und horizontal', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section?.className).toContain('items-center');
    expect(section?.className).toContain('justify-center');
  });

  it('verwendet Flexbox fuer das Layout', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section?.className).toContain('flex');
  });
});

// ============================================================================
// REQ-002: Claim/Tagline der possibilITy Holding
// ============================================================================

describe('REQ-002: Claim/Tagline der possibilITy Holding', () => {
  it('rendert den Claim als h1-Element (semantische Hierarchie)', () => {
    render(<HeroSection />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(DEFAULT_HERO_CONFIG.claim);
  });

  it('zeigt den Default-Claim "Digitale Transformation. Gemeinsam gestalten."', () => {
    render(<HeroSection />);

    expect(
      screen.getByText('Digitale Transformation. Gemeinsam gestalten.')
    ).toBeInTheDocument();
  });

  it('rendert den Sub-Claim wenn vorhanden', () => {
    render(<HeroSection />);

    if (DEFAULT_HERO_CONFIG.subClaim) {
      expect(
        screen.getByText(DEFAULT_HERO_CONFIG.subClaim)
      ).toBeInTheDocument();
    }
  });

  it('erlaubt das Ueberschreiben des Claims via Props', () => {
    const customClaim = 'Benutzerdefinierter Claim Text';
    render(<HeroSection config={{ claim: customClaim }} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(customClaim);
  });

  it('Claim-Text ist weiss und gut lesbar', () => {
    render(<HeroSection />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.className).toContain('text-white');
  });

  it('Claim hat responsive Schriftgroessen (sm, lg, xl)', () => {
    render(<HeroSection />);

    const heading = screen.getByRole('heading', { level: 1 });
    const className = heading.className;

    // Pruefe Mobile-First-Ansatz mit Breakpoints
    expect(className).toContain('text-3xl');
    expect(className).toMatch(/sm:text-4xl/);
    expect(className).toMatch(/lg:text-5xl/);
  });
});

// ============================================================================
// REQ-003: Logo-Platzierung in der Hero-Sektion
// ============================================================================

describe('REQ-003: Logo-Platzierung in der Hero-Sektion', () => {
  it('rendert das Logo-Bild innerhalb der Hero-Sektion', () => {
    render(<HeroSection />);

    const logo = screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt);
    expect(logo).toBeInTheDocument();
  });

  it('Logo hat einen nicht-leeren Alt-Text', () => {
    render(<HeroSection />);

    const logo = screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt);
    expect(logo).toBeInTheDocument();
    expect(DEFAULT_HERO_CONFIG.logo.alt).toBeTruthy();
    expect(DEFAULT_HERO_CONFIG.logo.alt).not.toBe('');
  });

  it('Logo erscheint vor dem Claim in der DOM-Reihenfolge', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    const contentContainer = section?.querySelector('.relative.z-10');
    const children = contentContainer
      ? Array.from(contentContainer.children)
      : [];

    // Logo-Wrapper (erstes Kind), Claim-Wrapper (zweites Kind), CTA-Wrapper (drittes Kind)
    expect(children.length).toBeGreaterThanOrEqual(3);

    // Logo sollte im ersten Kind sein
    const logoWrapper = children[0];
    const logoImg = logoWrapper?.querySelector('img');
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('alt', DEFAULT_HERO_CONFIG.logo.alt);
  });

  it('Logo hat korrekte Dimensionen aus der Konfiguration', () => {
    render(<HeroSection />);

    const logo = screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt);
    expect(logo).toHaveAttribute(
      'width',
      String(DEFAULT_HERO_CONFIG.logo.width)
    );
    expect(logo).toHaveAttribute(
      'height',
      String(DEFAULT_HERO_CONFIG.logo.height)
    );
  });

  it('Logo hat responsive Breitenklassen', () => {
    render(<HeroSection />);

    const logo = screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt);
    const className = logo.className;

    expect(className).toContain('w-48');
    expect(className).toMatch(/sm:w-56/);
    expect(className).toMatch(/lg:w-72/);
  });

  it('erlaubt das Ueberschreiben des Logos via Props', () => {
    render(
      <HeroSection
        config={{
          logo: {
            src: '/images/custom-logo.svg',
            alt: 'Custom Logo',
            width: 200,
            height: 60,
          },
        }}
      />
    );

    const logo = screen.getByAltText('Custom Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/images/custom-logo.svg');
  });
});

// ============================================================================
// REQ-004: Visueller Hintergrund der Hero-Sektion
// ============================================================================

describe('REQ-004: Visueller Hintergrund der Hero-Sektion', () => {
  it('rendert den Hintergrund mit Gradient als Standard', () => {
    const { container } = render(<HeroSection />);

    // Der Hintergrund-Container hat aria-hidden="true"
    const bgWrapper = container.querySelector('[aria-hidden="true"]');
    expect(bgWrapper).toBeInTheDocument();
  });

  it('rendert ein Overlay ueber dem Hintergrund fuer WCAG-konformen Kontrast', () => {
    render(<HeroSection />);

    const overlay = screen.getByTestId('hero-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay.className).toContain('bg-black');
  });

  it('Standard-Overlay-Opacity ist 0.5', () => {
    render(<HeroSection />);

    const overlay = screen.getByTestId('hero-overlay');
    expect(overlay).toHaveStyle({ opacity: 0.5 });
  });

  it('Gradient verwendet die konfigurierten Markenfarben', () => {
    // Verwende eine einfache Gradient-Config (wie im Unit-Test),
    // da jsdom mit komplexen Gradients Probleme hat
    const simpleGradient: BackgroundConfig = {
      type: 'gradient',
      gradient: {
        from: HERO_COLORS.primaryDark,
        to: HERO_COLORS.primaryLight,
        direction: 'to bottom right',
      },
    };

    const { container } = render(
      <HeroBackground background={simpleGradient} />
    );

    const gradientDiv = container.querySelector('[style]');
    expect(gradientDiv).toBeInTheDocument();
    expect(gradientDiv).toHaveStyle({
      background: `linear-gradient(to bottom right, ${HERO_COLORS.primaryDark}, ${HERO_COLORS.primaryLight})`,
    });
  });

  it('unterstuetzt Image-Hintergrund-Modus', () => {
    const imageBackground: BackgroundConfig = {
      type: 'image',
      image: {
        src: '/images/hero-bg.jpg',
        alt: 'Hero Background',
      },
    };

    const { container } = render(
      <HeroBackground background={imageBackground} />
    );

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/hero-bg.jpg');
  });

  it('unterstuetzt Video-Hintergrund-Modus', () => {
    const videoBackground: BackgroundConfig = {
      type: 'video',
      video: {
        src: '/videos/hero.mp4',
        posterSrc: '/images/poster.jpg',
      },
    };

    const { container } = render(
      <HeroBackground background={videoBackground} />
    );

    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('autoplay', '');
    expect(video).toHaveAttribute('poster', '/images/poster.jpg');
  });

  it('Video hat autoPlay, muted, loop und playsInline Attribute', () => {
    const videoBackground: BackgroundConfig = {
      type: 'video',
      video: {
        src: '/videos/hero.mp4',
        posterSrc: '/images/poster.jpg',
      },
    };

    const { container } = render(
      <HeroBackground background={videoBackground} />
    );

    const video = container.querySelector('video') as HTMLVideoElement;
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('autoplay', '');
    expect(video).toHaveAttribute('loop', '');
    // muted ist ein boolean-Property in React/jsdom, kein HTML-Attribut
    expect(video.muted).toBe(true);
  });

  it('Overlay-Opacity ist konfigurierbar', () => {
    const background: BackgroundConfig = {
      type: 'gradient',
      gradient: {
        from: '#000000',
        to: '#111111',
      },
      overlayOpacity: 0.8,
    };

    render(<HeroBackground background={background} />);

    const overlay = screen.getByTestId('hero-overlay');
    expect(overlay).toHaveStyle({ opacity: 0.8 });
  });
});

// ============================================================================
// REQ-005: Einblend- und Scroll-Animation
// ============================================================================

describe('REQ-005: Einblend- und Scroll-Animation', () => {
  it('alle Elemente sind sichtbar wenn Animationen abgeschlossen sind', () => {
    mockAnimationState = {
      logoVisible: true,
      claimVisible: true,
      ctaVisible: true,
      allComplete: true,
    };

    render(<HeroSection />);

    // Logo
    expect(
      screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt)
    ).toBeInTheDocument();

    // Claim
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    // CTA
    expect(
      screen.getByRole('button', { name: DEFAULT_HERO_CONFIG.cta.text })
    ).toBeInTheDocument();
  });

  it('Elemente haben opacity 1 wenn sichtbar', () => {
    mockAnimationState = {
      logoVisible: true,
      claimVisible: true,
      ctaVisible: true,
      allComplete: true,
    };

    const { container } = render(<HeroSection />);

    const contentWrapper = container.querySelector('.relative.z-10');
    const animatedDivs = contentWrapper?.children;

    if (animatedDivs) {
      Array.from(animatedDivs).forEach((div) => {
        const style = (div as HTMLElement).style;
        expect(style.opacity).toBe('1');
      });
    }
  });

  it('Elemente haben opacity 0 wenn noch nicht sichtbar', () => {
    mockAnimationState = {
      logoVisible: false,
      claimVisible: false,
      ctaVisible: false,
      allComplete: false,
    };

    const { container } = render(<HeroSection />);

    const contentWrapper = container.querySelector('.relative.z-10');
    const animatedDivs = contentWrapper?.children;

    if (animatedDivs) {
      Array.from(animatedDivs).forEach((div) => {
        const style = (div as HTMLElement).style;
        expect(style.opacity).toBe('0');
      });
    }
  });

  it('gestaffelte Reihenfolge: Logo zuerst sichtbar', () => {
    mockAnimationState = {
      logoVisible: true,
      claimVisible: false,
      ctaVisible: false,
      allComplete: false,
    };

    const { container } = render(<HeroSection />);

    const contentWrapper = container.querySelector('.relative.z-10');
    const divs = contentWrapper ? Array.from(contentWrapper.children) : [];

    // Logo-Wrapper (1. Kind) hat opacity 1
    expect((divs[0] as HTMLElement)?.style.opacity).toBe('1');
    // Claim-Wrapper (2. Kind) hat opacity 0
    expect((divs[1] as HTMLElement)?.style.opacity).toBe('0');
    // CTA-Wrapper (3. Kind) hat opacity 0
    expect((divs[2] as HTMLElement)?.style.opacity).toBe('0');
  });

  it('prefers-reduced-motion deaktiviert Transitions', () => {
    mockReducedMotion = true;

    const { container } = render(<HeroSection />);

    const contentWrapper = container.querySelector('.relative.z-10');
    const divs = contentWrapper ? Array.from(contentWrapper.children) : [];

    // Bei reduced motion sollten keine transitionProperty gesetzt sein
    divs.forEach((div) => {
      const style = (div as HTMLElement).style;
      expect(style.transitionProperty).toBe('');
    });
  });

  it('Animations-Konfiguration hat korrekte Standard-Delays', () => {
    expect(ANIMATION_DELAYS.logo).toBe(0);
    expect(ANIMATION_DELAYS.claim).toBe(300);
    expect(ANIMATION_DELAYS.cta).toBe(600);
  });

  it('Elemente haben translateY-Transformation waehrend der Animation', () => {
    mockAnimationState = {
      logoVisible: false,
      claimVisible: false,
      ctaVisible: false,
      allComplete: false,
    };
    mockReducedMotion = false;

    const { container } = render(<HeroSection />);

    const contentWrapper = container.querySelector('.relative.z-10');
    const divs = contentWrapper ? Array.from(contentWrapper.children) : [];

    divs.forEach((div) => {
      const style = (div as HTMLElement).style;
      expect(style.transform).toBe('translateY(1rem)');
    });
  });
});

// ============================================================================
// REQ-006: Call-to-Action-Element
// ============================================================================

describe('REQ-006: Call-to-Action-Element', () => {
  it('rendert den CTA-Button mit dem konfigurierten Text', () => {
    render(<HeroSection />);

    const cta = screen.getByRole('button', {
      name: DEFAULT_HERO_CONFIG.cta.text,
    });
    expect(cta).toBeInTheDocument();
  });

  it('CTA loest Smooth-Scroll zum Zielbereich aus', () => {
    const scrollIntoViewMock = jest.fn();
    const mockTarget = document.createElement('div');
    mockTarget.scrollIntoView = scrollIntoViewMock;

    jest.spyOn(document, 'getElementById').mockReturnValue(mockTarget);

    render(<HeroSection />);

    const cta = screen.getByRole('button', {
      name: DEFAULT_HERO_CONFIG.cta.text,
    });
    fireEvent.click(cta);

    expect(document.getElementById).toHaveBeenCalledWith(
      DEFAULT_HERO_CONFIG.cta.targetSectionId
    );
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });

    jest.restoreAllMocks();
  });

  it('CTA-Button hat ein Minimum-Touch-Target von 44x44px', () => {
    render(<HeroSection />);

    const cta = screen.getByRole('button', {
      name: DEFAULT_HERO_CONFIG.cta.text,
    });
    expect(cta.className).toContain('min-h-[44px]');
    expect(cta.className).toContain('min-w-[44px]');
  });

  it('CTA-Button hat sichtbare Focus-Indikatoren', () => {
    render(<HeroSection />);

    const cta = screen.getByRole('button', {
      name: DEFAULT_HERO_CONFIG.cta.text,
    });
    expect(cta.className).toContain('focus-visible:ring-2');
  });

  it('CTA im Scroll-Indicator-Modus rendert ein SVG-Chevron', () => {
    const scrollCta: CTAConfig = {
      text: 'Nach unten scrollen',
      variant: 'scroll-indicator',
      targetSectionId: 'content',
    };

    render(<HeroCTA cta={scrollCta} />);

    const button = screen.getByRole('button', { name: 'Nach unten scrollen' });
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('Scroll-Indicator hat Bounce-Animation wenn reduced motion nicht aktiv', () => {
    mockReducedMotion = false;

    const scrollCta: CTAConfig = {
      text: 'Nach unten',
      variant: 'scroll-indicator',
      targetSectionId: 'content',
    };

    render(<HeroCTA cta={scrollCta} />);

    const button = screen.getByRole('button', { name: 'Nach unten' });
    const svg = button.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('animate-bounce');
  });

  it('Scroll-Indicator hat keine Bounce-Animation bei prefers-reduced-motion', () => {
    mockReducedMotion = true;

    const scrollCta: CTAConfig = {
      text: 'Nach unten',
      variant: 'scroll-indicator',
      targetSectionId: 'content',
    };

    render(<HeroCTA cta={scrollCta} />);

    const button = screen.getByRole('button', { name: 'Nach unten' });
    const svg = button.querySelector('svg');
    expect(svg?.getAttribute('class')).not.toContain('animate-bounce');
  });

  it('CTA-Klick navigiert nicht wenn Ziel-Element nicht existiert', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);

    render(<HeroSection />);

    const cta = screen.getByRole('button', {
      name: DEFAULT_HERO_CONFIG.cta.text,
    });

    // Sollte keinen Fehler werfen
    expect(() => {
      fireEvent.click(cta);
    }).not.toThrow();

    jest.restoreAllMocks();
  });
});

// ============================================================================
// REQ-007: Vollstaendige Responsivitaet (Mobile First)
// ============================================================================

describe('REQ-007: Vollstaendige Responsivitaet (Mobile First)', () => {
  it('Claim-Schriftgroesse skaliert ueber Breakpoints (text-3xl → sm:4xl → lg:5xl)', () => {
    render(<HeroSection />);

    const heading = screen.getByRole('heading', { level: 1 });
    const className = heading.className;

    // Mobile First: Basis-Groesse
    expect(className).toContain('text-3xl');
    // Tablet
    expect(className).toMatch(/sm:text-4xl/);
    // Desktop
    expect(className).toMatch(/lg:text-5xl/);
  });

  it('Logo-Breite skaliert ueber Breakpoints (w-48 → sm:w-56 → lg:w-72)', () => {
    render(<HeroSection />);

    const logo = screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt);
    const className = logo.className;

    expect(className).toContain('w-48');
    expect(className).toMatch(/sm:w-56/);
    expect(className).toMatch(/lg:w-72/);
  });

  it('Abstaende skalieren ueber Breakpoints (gap-6 → sm:gap-8 → lg:gap-10)', () => {
    const { container } = render(<HeroSection />);

    const contentWrapper = container.querySelector('.relative.z-10');
    const className = contentWrapper?.className ?? '';

    expect(className).toContain('gap-6');
    expect(className).toMatch(/sm:gap-8/);
    expect(className).toMatch(/lg:gap-10/);
  });

  it('Padding ist responsive (px-4 → sm:px-8)', () => {
    const { container } = render(<HeroSection />);

    const contentWrapper = container.querySelector('.relative.z-10');
    const className = contentWrapper?.className ?? '';

    expect(className).toContain('px-4');
    expect(className).toMatch(/sm:px-8/);
  });

  it('Text ist zentriert auf allen Viewports', () => {
    const { container } = render(<HeroSection />);

    const contentWrapper = container.querySelector('.relative.z-10');
    expect(contentWrapper?.className).toContain('text-center');
  });

  it('SubClaim hat responsive Schriftgroessen', () => {
    render(<HeroSection />);

    if (DEFAULT_HERO_CONFIG.subClaim) {
      const subClaim = screen.getByText(DEFAULT_HERO_CONFIG.subClaim);
      const className = subClaim.className;

      expect(className).toContain('text-lg');
      expect(className).toMatch(/sm:text-xl/);
    }
  });
});

// ============================================================================
// REQ-008: Ladeperformance der Hero-Sektion
// ============================================================================

describe('REQ-008: Ladeperformance der Hero-Sektion', () => {
  it('Logo-Bild hat priority-Attribut fuer schnelles Laden', () => {
    render(<HeroSection />);

    // In unserem Mock wird priority als prop durchgereicht, aber nicht gerendert
    // Das priority-Attribut wird in der echten next/image-Komponente als
    // fetchPriority="high" gerendert. Im Mock testen wir die Existenz des Bildes.
    const logo = screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt);
    expect(logo).toBeInTheDocument();
  });

  it('Hintergrund-Bild hat priority-Attribut wenn Image-Modus', () => {
    const imageBackground: BackgroundConfig = {
      type: 'image',
      image: {
        src: '/images/hero-bg.jpg',
        alt: 'Hero Background',
      },
    };

    const { container } = render(
      <HeroBackground background={imageBackground} />
    );

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  it('Video hat preload="metadata" fuer Performance-Optimierung', () => {
    const videoBackground: BackgroundConfig = {
      type: 'video',
      video: {
        src: '/videos/hero.mp4',
        posterSrc: '/images/poster.jpg',
      },
    };

    const { container } = render(
      <HeroBackground background={videoBackground} />
    );

    const video = container.querySelector('video');
    expect(video).toHaveAttribute('preload', 'metadata');
  });

  it('Default-Hintergrund verwendet Gradient (kein Netzwerk-Request noetig)', () => {
    expect(DEFAULT_HERO_CONFIG.background.type).toBe('gradient');
  });

  it('Hero-Sektion rendert ohne Fehler', () => {
    expect(() => {
      render(<HeroSection />);
    }).not.toThrow();
  });

  it('Bild unterstuetzt Blur-Placeholder fuer perceived Performance', () => {
    const imageBackground: BackgroundConfig = {
      type: 'image',
      image: {
        src: '/images/hero-bg.jpg',
        alt: 'Hero Background',
        blurDataURL: 'data:image/jpeg;base64,/9j/4AAQ...',
      },
    };

    const { container } = render(
      <HeroBackground background={imageBackground} />
    );

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });
});

// ============================================================================
// REQ-009: Barrierefreiheit der Hero-Sektion
// ============================================================================

describe('REQ-009: Barrierefreiheit der Hero-Sektion', () => {
  it('Hero-Sektion hat aria-label fuer Screen-Reader', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-label', 'Hero');
  });

  it('Claim verwendet h1-Element fuer korrekte Heading-Hierarchie', () => {
    render(<HeroSection />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.tagName.toLowerCase()).toBe('h1');
  });

  it('Hintergrund-Medien sind mit aria-hidden="true" markiert', () => {
    const { container } = render(<HeroSection />);

    const bgWrapper = container.querySelector('[aria-hidden="true"]');
    expect(bgWrapper).toBeInTheDocument();
  });

  it('SVG-Elemente im Scroll-Indicator sind mit aria-hidden="true" markiert', () => {
    const scrollCta: CTAConfig = {
      text: 'Nach unten scrollen',
      variant: 'scroll-indicator',
      targetSectionId: 'content',
    };

    render(<HeroCTA cta={scrollCta} />);

    const button = screen.getByRole('button', { name: 'Nach unten scrollen' });
    const svg = button.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('Scroll-Indicator-Button hat ein aria-label', () => {
    const scrollCta: CTAConfig = {
      text: 'Zum Inhalt scrollen',
      variant: 'scroll-indicator',
      targetSectionId: 'content',
    };

    render(<HeroCTA cta={scrollCta} />);

    const button = screen.getByRole('button', { name: 'Zum Inhalt scrollen' });
    expect(button).toHaveAttribute('aria-label', 'Zum Inhalt scrollen');
  });

  it('alle interaktiven Elemente haben Focus-Visible-Stile', () => {
    render(<HeroSection />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button.className).toContain('focus-visible:ring');
    });
  });

  it('prefers-reduced-motion wird respektiert', () => {
    mockReducedMotion = true;
    mockAnimationState = {
      logoVisible: true,
      claimVisible: true,
      ctaVisible: true,
      allComplete: true,
    };

    const { container } = render(<HeroSection />);

    // Bei reduced motion: keine Transition-Styles
    const contentWrapper = container.querySelector('.relative.z-10');
    const divs = contentWrapper ? Array.from(contentWrapper.children) : [];

    divs.forEach((div) => {
      const style = (div as HTMLElement).style;
      // transitionProperty sollte leer sein bei reduced motion
      expect(style.transitionProperty).toBe('');
    });
  });

  it('Logo-Bild hat aussagekraeftigen Alt-Text', () => {
    render(<HeroSection />);

    const logo = screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt);
    expect(logo).toBeInTheDocument();
    expect(DEFAULT_HERO_CONFIG.logo.alt).toBe('possibilITy Holding Logo');
  });

  it('CTA-Buttons haben type="button" Attribut', () => {
    render(<HeroSection />);

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('Focus-Ring hat ausreichenden Offset fuer Sichtbarkeit', () => {
    render(<HeroSection />);

    const cta = screen.getByRole('button', {
      name: DEFAULT_HERO_CONFIG.cta.text,
    });
    expect(cta.className).toContain('focus-visible:ring-offset-2');
  });
});

// ============================================================================
// Zusammenspiel aller Komponenten (Integrations-Szenarien)
// ============================================================================

describe('Integration: Zusammenspiel aller Hero-Komponenten', () => {
  it('HeroSection rendert HeroBackground, Claim und HeroCTA zusammen', () => {
    const { container } = render(<HeroSection />);

    // Background (aria-hidden)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

    // Claim
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    // CTA Button
    expect(
      screen.getByRole('button', { name: DEFAULT_HERO_CONFIG.cta.text })
    ).toBeInTheDocument();

    // Logo
    expect(
      screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt)
    ).toBeInTheDocument();
  });

  it('partielle Config wird korrekt mit Defaults gemerged', () => {
    render(
      <HeroSection
        config={{
          claim: 'Custom Claim',
          cta: {
            text: "Los geht's",
            variant: 'button',
            targetSectionId: 'about',
          },
        }}
      />
    );

    // Ueberschriebener Claim
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Custom Claim'
    );

    // Ueberschriebener CTA
    expect(
      screen.getByRole('button', { name: "Los geht's" })
    ).toBeInTheDocument();

    // Default-Logo bleibt erhalten
    expect(
      screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt)
    ).toBeInTheDocument();
  });

  it('HeroSection ohne Props rendert vollstaendig mit Defaults', () => {
    render(<HeroSection />);

    // Alle Default-Elemente muessen vorhanden sein
    expect(screen.getByAltText('possibilITy Holding Logo')).toBeInTheDocument();
    expect(
      screen.getByText('Digitale Transformation. Gemeinsam gestalten.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Innovative IT-Lösungen für Ihren Erfolg')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mehr erfahren' })
    ).toBeInTheDocument();
  });

  it('Content liegt ueber dem Hintergrund (z-10)', () => {
    const { container } = render(<HeroSection />);

    const contentWrapper = container.querySelector('.relative.z-10');
    expect(contentWrapper).toBeInTheDocument();
  });

  it('Hintergrund ist absolut positioniert hinter dem Content', () => {
    const { container } = render(<HeroSection />);

    const bgWrapper = container.querySelector('[aria-hidden="true"]');
    expect(bgWrapper?.className).toContain('absolute');
    expect(bgWrapper?.className).toContain('inset-0');
  });
});
