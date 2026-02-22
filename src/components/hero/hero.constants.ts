import type { HeroConfig } from './hero.types';

export const HERO_COLORS: Record<string, string> = {
  primaryDark: '#1a1a2e',
  primaryMid: '#16213e',
  primaryLight: '#0f3460',
  accent: '#0c93e7',
  textPrimary: '#ffffff',
  textSecondary: '#e0effe',
};

export const ANIMATION_DURATIONS: Record<string, number> = {
  fadeIn: 700,
  slideUp: 500,
  bounce: 1500,
};

export const ANIMATION_DELAYS: Record<string, number> = {
  logo: 0,
  claim: 300,
  cta: 600,
};

export const DEFAULT_HERO_CONFIG: HeroConfig = {
  claim: 'Digitale Transformation. Gemeinsam gestalten.',
  subClaim: 'Innovative IT-Lösungen für Ihren Erfolg',
  logo: {
    src: '/images/possibilITy-logo.svg',
    alt: 'possibilITy Holding Logo',
    width: 280,
    height: 80,
  },
  background: {
    type: 'gradient',
    gradient: {
      from: HERO_COLORS.primaryDark,
      via: HERO_COLORS.primaryMid,
      to: HERO_COLORS.primaryLight,
      direction: 'to bottom right',
    },
    overlayOpacity: 0.5,
  },
  cta: {
    text: 'Mehr erfahren',
    variant: 'button',
    targetSectionId: 'content',
  },
};
