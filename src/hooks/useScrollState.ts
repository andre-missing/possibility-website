'use client';

import { useEffect, useState, useRef } from 'react';
import type { ScrollState } from '@/components/layout/types';

/**
 * Custom Hook: Trackt die Scroll-Position des Fensters.
 * Gibt isScrolled (boolean) zurueck, sobald scrollY > threshold (Standard: 50px).
 * Nutzt requestAnimationFrame fuer performantes Scroll-Event-Handling.
 *
 * @param threshold - Scroll-Schwelle in px (Standard: 50)
 * @returns ScrollState mit isScrolled, scrollY und scrollDirection
 */
export function useScrollState(threshold: number = 50): ScrollState {
  const [scrollState, setScrollState] = useState<ScrollState>({
    isScrolled: false,
    scrollY: 0,
    scrollDirection: null,
  });

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;

      ticking.current = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const direction: 'up' | 'down' | null =
          currentScrollY > lastScrollY.current
            ? 'down'
            : currentScrollY < lastScrollY.current
              ? 'up'
              : null;

        setScrollState({
          isScrolled: currentScrollY > threshold,
          scrollY: currentScrollY,
          scrollDirection: direction,
        });

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    // Initiale Position setzen
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return scrollState;
}
