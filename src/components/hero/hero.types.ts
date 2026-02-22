export interface GradientConfig {
  from: string;
  via?: string;
  to: string;
  direction?: string;
}

export interface ImageConfig {
  src: string;
  alt: string;
  blurDataURL?: string;
}

export interface VideoConfig {
  src: string;
  type?: string;
  posterSrc: string;
}

export interface BackgroundConfig {
  type: 'gradient' | 'image' | 'video';
  gradient?: GradientConfig;
  image?: ImageConfig;
  video?: VideoConfig;
  overlayOpacity?: number;
}

export interface LogoConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface CTAConfig {
  text: string;
  variant: 'button' | 'scroll-indicator';
  targetSectionId: string;
}

export interface HeroConfig {
  claim: string;
  subClaim?: string;
  logo: LogoConfig;
  background: BackgroundConfig;
  cta: CTAConfig;
}

export interface HeroSectionProps {
  config?: Partial<HeroConfig>;
}

export interface HeroBackgroundProps {
  background: BackgroundConfig;
}

export interface HeroCTAProps {
  cta: CTAConfig;
}

export interface AnimationOptions {
  logoDelay?: number;
  claimDelay?: number;
  ctaDelay?: number;
  enabled?: boolean;
}

export interface HeroAnimationState {
  logoVisible: boolean;
  claimVisible: boolean;
  ctaVisible: boolean;
  allComplete: boolean;
}
