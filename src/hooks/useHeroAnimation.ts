'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';
import type {
  AnimationOptions,
  HeroAnimationState,
} from '@/components/hero/hero.types';
import { ANIMATION_DELAYS } from '@/components/hero/hero.constants';

export function useHeroAnimation(
  options: AnimationOptions = {}
): HeroAnimationState {
  const prefersReducedMotion = useReducedMotion();

  const {
    logoDelay = ANIMATION_DELAYS.logo,
    claimDelay = ANIMATION_DELAYS.claim,
    ctaDelay = ANIMATION_DELAYS.cta,
    enabled = true,
  } = options;

  const shouldAnimate = enabled && !prefersReducedMotion;

  const [logoVisible, setLogoVisible] = useState(!shouldAnimate);
  const [claimVisible, setClaimVisible] = useState(!shouldAnimate);
  const [ctaVisible, setCtaVisible] = useState(!shouldAnimate);
  const [allComplete, setAllComplete] = useState(!shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate) {
      setLogoVisible(true);
      setClaimVisible(true);
      setCtaVisible(true);
      setAllComplete(true);
      return;
    }

    setLogoVisible(false);
    setClaimVisible(false);
    setCtaVisible(false);
    setAllComplete(false);

    let logoTimer: ReturnType<typeof setTimeout>;
    let claimTimer: ReturnType<typeof setTimeout>;
    let ctaTimer: ReturnType<typeof setTimeout>;

    const rafId = requestAnimationFrame(() => {
      logoTimer = setTimeout(() => {
        setLogoVisible(true);
      }, logoDelay);

      claimTimer = setTimeout(() => {
        setClaimVisible(true);
      }, claimDelay);

      ctaTimer = setTimeout(() => {
        setCtaVisible(true);
        setAllComplete(true);
      }, ctaDelay);
    });

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(logoTimer);
      clearTimeout(claimTimer);
      clearTimeout(ctaTimer);
    };
  }, [shouldAnimate, logoDelay, claimDelay, ctaDelay]);

  return { logoVisible, claimVisible, ctaVisible, allComplete };
}
