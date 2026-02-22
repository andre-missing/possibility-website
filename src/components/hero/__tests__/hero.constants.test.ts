import {
  DEFAULT_HERO_CONFIG,
  HERO_COLORS,
  ANIMATION_DURATIONS,
  ANIMATION_DELAYS,
} from '../hero.constants';

describe('hero.constants', () => {
  describe('HERO_COLORS', () => {
    it('should contain primaryDark color', () => {
      expect(HERO_COLORS.primaryDark).toBeDefined();
      expect(HERO_COLORS.primaryDark).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should contain primaryMid color', () => {
      expect(HERO_COLORS.primaryMid).toBeDefined();
      expect(HERO_COLORS.primaryMid).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should contain primaryLight color', () => {
      expect(HERO_COLORS.primaryLight).toBeDefined();
      expect(HERO_COLORS.primaryLight).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should contain accent color', () => {
      expect(HERO_COLORS.accent).toBeDefined();
      expect(HERO_COLORS.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should contain textPrimary color', () => {
      expect(HERO_COLORS.textPrimary).toBeDefined();
    });

    it('should contain textSecondary color', () => {
      expect(HERO_COLORS.textSecondary).toBeDefined();
    });
  });

  describe('ANIMATION_DURATIONS', () => {
    it('should have a fadeIn duration', () => {
      expect(ANIMATION_DURATIONS.fadeIn).toBeDefined();
      expect(typeof ANIMATION_DURATIONS.fadeIn).toBe('number');
      expect(ANIMATION_DURATIONS.fadeIn).toBeGreaterThan(0);
    });

    it('should have a slideUp duration', () => {
      expect(ANIMATION_DURATIONS.slideUp).toBeDefined();
      expect(typeof ANIMATION_DURATIONS.slideUp).toBe('number');
      expect(ANIMATION_DURATIONS.slideUp).toBeGreaterThan(0);
    });

    it('should have a bounce duration', () => {
      expect(ANIMATION_DURATIONS.bounce).toBeDefined();
      expect(typeof ANIMATION_DURATIONS.bounce).toBe('number');
      expect(ANIMATION_DURATIONS.bounce).toBeGreaterThan(0);
    });
  });

  describe('ANIMATION_DELAYS', () => {
    it('should have a logo delay of 0ms (first element)', () => {
      expect(ANIMATION_DELAYS.logo).toBe(0);
    });

    it('should have a claim delay greater than logo delay', () => {
      expect(ANIMATION_DELAYS.claim).toBeGreaterThan(ANIMATION_DELAYS.logo);
    });

    it('should have a cta delay greater than claim delay', () => {
      expect(ANIMATION_DELAYS.cta).toBeGreaterThan(ANIMATION_DELAYS.claim);
    });

    it('should maintain staggered order: logo < claim < cta', () => {
      expect(ANIMATION_DELAYS.logo).toBeLessThan(ANIMATION_DELAYS.claim);
      expect(ANIMATION_DELAYS.claim).toBeLessThan(ANIMATION_DELAYS.cta);
    });

    it('should have specific delay values (0ms, 300ms, 600ms)', () => {
      expect(ANIMATION_DELAYS.logo).toBe(0);
      expect(ANIMATION_DELAYS.claim).toBe(300);
      expect(ANIMATION_DELAYS.cta).toBe(600);
    });
  });

  describe('DEFAULT_HERO_CONFIG', () => {
    it('should have a non-empty claim text', () => {
      expect(DEFAULT_HERO_CONFIG.claim).toBeDefined();
      expect(DEFAULT_HERO_CONFIG.claim.length).toBeGreaterThan(0);
    });

    it('should have a subClaim text', () => {
      expect(DEFAULT_HERO_CONFIG.subClaim).toBeDefined();
      expect(DEFAULT_HERO_CONFIG.subClaim!.length).toBeGreaterThan(0);
    });

    it('should have a complete logo configuration', () => {
      expect(DEFAULT_HERO_CONFIG.logo).toBeDefined();
      expect(DEFAULT_HERO_CONFIG.logo.src).toBeDefined();
      expect(DEFAULT_HERO_CONFIG.logo.alt).toBeDefined();
      expect(DEFAULT_HERO_CONFIG.logo.alt.length).toBeGreaterThan(0);
      expect(DEFAULT_HERO_CONFIG.logo.width).toBeGreaterThan(0);
      expect(DEFAULT_HERO_CONFIG.logo.height).toBeGreaterThan(0);
    });

    it('should have an SVG logo source path', () => {
      expect(DEFAULT_HERO_CONFIG.logo.src).toContain('.svg');
    });

    it('should have a complete background configuration', () => {
      expect(DEFAULT_HERO_CONFIG.background).toBeDefined();
      expect(DEFAULT_HERO_CONFIG.background.type).toBe('gradient');
      expect(DEFAULT_HERO_CONFIG.background.gradient).toBeDefined();
      expect(DEFAULT_HERO_CONFIG.background.overlayOpacity).toBeDefined();
    });

    it('should have background gradient using HERO_COLORS palette', () => {
      const gradient = DEFAULT_HERO_CONFIG.background.gradient!;
      expect(gradient.from).toBe(HERO_COLORS.primaryDark);
      expect(gradient.via).toBe(HERO_COLORS.primaryMid);
      expect(gradient.to).toBe(HERO_COLORS.primaryLight);
    });

    it('should have overlay opacity between 0 and 1', () => {
      const opacity = DEFAULT_HERO_CONFIG.background.overlayOpacity!;
      expect(opacity).toBeGreaterThanOrEqual(0);
      expect(opacity).toBeLessThanOrEqual(1);
    });

    it('should have a complete CTA configuration', () => {
      expect(DEFAULT_HERO_CONFIG.cta).toBeDefined();
      expect(DEFAULT_HERO_CONFIG.cta.text).toBeDefined();
      expect(DEFAULT_HERO_CONFIG.cta.text.length).toBeGreaterThan(0);
      expect(DEFAULT_HERO_CONFIG.cta.variant).toBeDefined();
      expect(['button', 'scroll-indicator']).toContain(
        DEFAULT_HERO_CONFIG.cta.variant
      );
      expect(DEFAULT_HERO_CONFIG.cta.targetSectionId).toBeDefined();
      expect(DEFAULT_HERO_CONFIG.cta.targetSectionId.length).toBeGreaterThan(0);
    });

    it('should allow claim text exchange without structural code changes', () => {
      // Verify the config is a plain object that can be spread/overridden
      const overridden = {
        ...DEFAULT_HERO_CONFIG,
        claim: 'Neuer Claim-Text für Tests',
      };
      expect(overridden.claim).toBe('Neuer Claim-Text für Tests');
      // Other properties remain intact
      expect(overridden.logo).toEqual(DEFAULT_HERO_CONFIG.logo);
      expect(overridden.cta).toEqual(DEFAULT_HERO_CONFIG.cta);
      expect(overridden.background).toEqual(DEFAULT_HERO_CONFIG.background);
    });
  });
});
