'use client';

import { useCallback, useRef } from 'react';

/** API des useSmoothScroll-Hooks */
export interface SmoothScrollAPI {
  /** Scrollt zur angegebenen Sektion */
  scrollToSection: (sectionId: string) => void;
  /** Scrollt zum Seitenanfang */
  scrollToTop: () => void;
}

/**
 * Custom Hook: Stellt scrollToSection und scrollToTop bereit.
 * Nutzt Element.scrollIntoView({ behavior: 'smooth' }) mit Fallback
 * auf requestAnimationFrame-basiertes Scrolling.
 * Beruecksichtigt Header-Offset (sticky header height).
 * Aktualisiert URL-Hash ohne Seiten-Sprung.
 *
 * @param headerOffset - Hoehe des sticky Headers in px (Standard: 80)
 * @returns SmoothScrollAPI mit scrollToSection und scrollToTop
 */
export function useSmoothScroll(headerOffset: number = 80): SmoothScrollAPI {
  const isScrolling = useRef(false);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (!element || isScrolling.current) return;

      isScrolling.current = true;

      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      try {
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      } catch {
        // Fallback: requestAnimationFrame-basiertes Scrolling
        smoothScrollFallback(offsetPosition);
      }

      // URL-Hash aktualisieren ohne Seiten-Sprung
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `#${sectionId}`);
      }

      // Reset scrolling flag nach Animation
      setTimeout(() => {
        isScrolling.current = false;
      }, 1000);
    },
    [headerOffset]
  );

  const scrollToTop = useCallback(() => {
    if (isScrolling.current) return;

    isScrolling.current = true;

    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch {
      smoothScrollFallback(0);
    }

    // URL-Hash entfernen
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', window.location.pathname);
    }

    setTimeout(() => {
      isScrolling.current = false;
    }, 1000);
  }, []);

  return { scrollToSection, scrollToTop };
}

/**
 * Fallback-Implementierung fuer Smooth Scrolling mit
 * requestAnimationFrame und easeInOutCubic-Easing.
 */
function smoothScrollFallback(targetY: number): void {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const duration = 600;
  let startTime: number | null = null;

  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp: number): void {
    if (startTime === null) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}
