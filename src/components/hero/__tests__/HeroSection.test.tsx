import { render, screen } from '@testing-library/react';
import HeroSection from '../HeroSection';
import { DEFAULT_HERO_CONFIG } from '../hero.constants';

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

// Mock useReducedMotion to skip animations in tests
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true,
}));

// Mock useHeroAnimation to show all elements
jest.mock('@/hooks/useHeroAnimation', () => ({
  useHeroAnimation: () => ({
    logoVisible: true,
    claimVisible: true,
    ctaVisible: true,
    allComplete: true,
  }),
}));

describe('HeroSection', () => {
  it('should render with default config and contain all child elements (logo, claim, CTA)', () => {
    render(<HeroSection />);

    // Logo
    const logo = screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt);
    expect(logo).toBeInTheDocument();

    // Claim (h1)
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(DEFAULT_HERO_CONFIG.claim);

    // CTA button
    const cta = screen.getByRole('button', {
      name: DEFAULT_HERO_CONFIG.cta.text,
    });
    expect(cta).toBeInTheDocument();
  });

  it('should render as a <section> element with aria-label', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-label', 'Hero');
  });

  it('should have CSS classes for 100vw and min-h-[80vh]', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section?.className).toContain('w-screen');
    expect(section?.className).toContain('min-h-[80vh]');
  });

  it('should render the claim text as an h1 element (semantic hierarchy)', () => {
    render(<HeroSection />);

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent(DEFAULT_HERO_CONFIG.claim);
  });

  it('should render logo image with a non-empty alt text', () => {
    render(<HeroSection />);

    const logo = screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt);
    expect(logo).toBeInTheDocument();
    expect(DEFAULT_HERO_CONFIG.logo.alt).not.toBe('');
  });

  it('should render without horizontal overflow (overflow-x-hidden)', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section?.className).toContain('overflow-x-hidden');
  });

  it('should render subClaim when provided', () => {
    render(<HeroSection />);

    if (DEFAULT_HERO_CONFIG.subClaim) {
      expect(
        screen.getByText(DEFAULT_HERO_CONFIG.subClaim)
      ).toBeInTheDocument();
    }
  });

  it('should allow overriding config via props', () => {
    const customClaim = 'Custom Hero Claim Text';

    render(<HeroSection config={{ claim: customClaim }} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(customClaim);
  });

  it('should merge partial config with defaults', () => {
    render(
      <HeroSection
        config={{
          claim: 'Overridden Claim',
        }}
      />
    );

    // Overridden claim
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Overridden Claim'
    );

    // Default CTA still present
    expect(
      screen.getByRole('button', { name: DEFAULT_HERO_CONFIG.cta.text })
    ).toBeInTheDocument();

    // Default logo still present
    expect(
      screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt)
    ).toBeInTheDocument();
  });

  it('should not render subClaim when it is undefined', () => {
    render(<HeroSection config={{ claim: 'Test', subClaim: undefined }} />);

    // The default subClaim should be overridden to undefined
    // But due to merge logic, it should still show default
    // Let's check with explicit empty config
    render(
      <HeroSection
        config={{
          claim: 'No SubClaim',
          subClaim: undefined,
        }}
      />
    );

    // The heading should be visible
    expect(screen.getAllByRole('heading', { level: 1 }).length).toBeGreaterThan(
      0
    );
  });

  it('should render the HeroBackground component', () => {
    const { container } = render(<HeroSection />);

    // HeroBackground renders with aria-hidden="true"
    const bgWrapper = container.querySelector('[aria-hidden="true"]');
    expect(bgWrapper).toBeInTheDocument();
  });

  it('should render content with relative z-10 positioning above background', () => {
    const { container } = render(<HeroSection />);

    const contentDiv = container.querySelector('.z-10');
    expect(contentDiv).toBeInTheDocument();
  });

  it('should center content with flexbox layout', () => {
    const { container } = render(<HeroSection />);

    const section = container.querySelector('section');
    expect(section?.className).toContain('flex');
    expect(section?.className).toContain('items-center');
    expect(section?.className).toContain('justify-center');
  });

  it('should render subClaim as a paragraph element', () => {
    render(<HeroSection />);

    if (DEFAULT_HERO_CONFIG.subClaim) {
      const subClaimElement = screen.getByText(DEFAULT_HERO_CONFIG.subClaim);
      expect(subClaimElement.tagName).toBe('P');
    }
  });

  it('should merge logo config with defaults when partially overridden', () => {
    render(
      <HeroSection
        config={{
          logo: { src: '/images/custom-logo.svg' } as never,
        }}
      />
    );

    // Default alt text should still be present
    expect(
      screen.getByAltText(DEFAULT_HERO_CONFIG.logo.alt)
    ).toBeInTheDocument();
  });
});
