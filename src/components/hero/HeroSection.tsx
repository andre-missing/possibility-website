'use client';

import Image from 'next/image';
import { useHeroAnimation } from '@/hooks/useHeroAnimation';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import HeroBackground from './HeroBackground';
import HeroCTA from './HeroCTA';
import { DEFAULT_HERO_CONFIG, ANIMATION_DURATIONS } from './hero.constants';
import type { HeroSectionProps, HeroConfig } from './hero.types';

export default function HeroSection({ config }: HeroSectionProps) {
  const mergedConfig: HeroConfig = {
    ...DEFAULT_HERO_CONFIG,
    ...config,
    logo: { ...DEFAULT_HERO_CONFIG.logo, ...config?.logo },
    background: {
      ...DEFAULT_HERO_CONFIG.background,
      ...config?.background,
    },
    cta: { ...DEFAULT_HERO_CONFIG.cta, ...config?.cta },
  };

  const prefersReducedMotion = useReducedMotion();
  const { logoVisible, claimVisible, ctaVisible } = useHeroAnimation();

  const transitionClasses = prefersReducedMotion
    ? ''
    : `transition-all duration-${ANIMATION_DURATIONS.fadeIn}`;

  const transitionStyle = prefersReducedMotion
    ? {}
    : {
        transitionProperty: 'opacity, transform',
        transitionDuration: `${ANIMATION_DURATIONS.fadeIn}ms`,
        transitionTimingFunction: 'ease-out',
      };

  return (
    <section
      aria-label="Hero"
      className="relative flex min-h-[80vh] w-screen items-center justify-center overflow-x-hidden"
    >
      <HeroBackground background={mergedConfig.background} />

      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center sm:gap-8 sm:px-8 lg:gap-10">
        <div
          style={{
            ...transitionStyle,
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'translateY(0)' : 'translateY(1rem)',
          }}
          className={transitionClasses}
        >
          <Image
            src={mergedConfig.logo.src}
            alt={mergedConfig.logo.alt}
            width={mergedConfig.logo.width}
            height={mergedConfig.logo.height}
            priority
            className="mx-auto h-auto w-48 sm:w-56 lg:w-72"
          />
        </div>

        <div
          style={{
            ...transitionStyle,
            opacity: claimVisible ? 1 : 0,
            transform: claimVisible ? 'translateY(0)' : 'translateY(1rem)',
          }}
          className={transitionClasses}
        >
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            {mergedConfig.claim}
          </h1>
          {mergedConfig.subClaim && (
            <p className="mt-3 text-lg text-brand-200 sm:mt-4 sm:text-xl lg:text-2xl">
              {mergedConfig.subClaim}
            </p>
          )}
        </div>

        <div
          style={{
            ...transitionStyle,
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'translateY(0)' : 'translateY(1rem)',
          }}
          className={transitionClasses}
        >
          <HeroCTA cta={mergedConfig.cta} />
        </div>
      </div>
    </section>
  );
}
