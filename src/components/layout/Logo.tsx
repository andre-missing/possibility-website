'use client';

import React, { useState, useCallback } from 'react';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

/** Props fuer die Logo-Komponente */
export interface LogoProps {
  /** Pfad zum Logo-Bild (bevorzugt SVG) */
  src: string;
  /** Alt-Text fuer das Logo */
  alt: string;
  /** Optionaler Pfad zum Fallback-Bild (z.B. PNG) */
  fallbackSrc?: string;
  /** Zusaetzliche CSS-Klassen */
  className?: string;
}

/**
 * Logo-Komponente: Zeigt das Logo als Bild mit optionalem PNG-Fallback an.
 * Implementiert als Ankerlink zum Seitenanfang mit Smooth-Scroll.
 * Responsive Groessenanpassung via Tailwind-Klassen.
 */
export function Logo({ src, alt, fallbackSrc, className = '' }: LogoProps) {
  const { scrollToTop } = useSmoothScroll();
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (fallbackSrc && !hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  }, [fallbackSrc, hasError]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      scrollToTop();
    },
    [scrollToTop]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLAnchorElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        scrollToTop();
      }
    },
    [scrollToTop]
  );

  return (
    <a
      href="#top"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`inline-flex items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${className}`}
      aria-label={`${alt} - Zum Seitenanfang scrollen`}
    >
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        className="h-8 w-auto transition-all duration-300 md:h-10"
      />
    </a>
  );
}
