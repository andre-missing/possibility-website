'use client';

import { useCallback } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { HeroCTAProps } from './hero.types';

export default function HeroCTA({ cta }: HeroCTAProps) {
  const prefersReducedMotion = useReducedMotion();

  const handleClick = useCallback(() => {
    const target = document.getElementById(cta.targetSectionId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [cta.targetSectionId]);

  if (cta.variant === 'scroll-indicator') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="group flex min-h-[44px] min-w-[44px] flex-col items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label={cta.text}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-8 w-8 text-white ${
            prefersReducedMotion ? '' : 'animate-bounce'
          }`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="min-h-[44px] min-w-[44px] rounded-lg bg-white px-8 py-3 text-base font-semibold text-brand-900 transition-colors duration-200 hover:bg-brand-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      {cta.text}
    </button>
  );
}
