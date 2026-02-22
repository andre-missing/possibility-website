'use client';

import React, { useMemo } from 'react';
import { Logo } from '@/components/layout/Logo';
import { Navigation } from '@/components/layout/Navigation';
import { HamburgerMenu } from '@/components/layout/HamburgerMenu';
import { useScrollState } from '@/hooks/useScrollState';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import type { NavigationSection } from '@/components/layout/types';

/** Props fuer die Header-Komponente */
export interface HeaderProps {
  /** Array der Navigations-Sektionen */
  sections: NavigationSection[];
  /** Pfad zum Logo-Bild */
  logoSrc: string;
  /** Alt-Text fuer das Logo */
  logoAlt: string;
  /** Optionaler Pfad zum Fallback-Logo */
  logoFallbackSrc?: string;
  /** Zusaetzliche CSS-Klassen */
  className?: string;
  /** Scroll-Schwelle fuer Sticky-Transition in px (Standard: 50) */
  stickyOffset?: number;
}

/**
 * Header-Komponente: Wurzelkomponente des Headers.
 * Orchestriert Logo, Navigation und HamburgerMenu.
 * Verwaltet den Sticky-Zustand (isScrolled) via useScrollState-Hook
 * und leitet ihn als visuelle Klassen weiter.
 * Rendert ein semantisches <header>-Element mit role='banner'.
 */
export function Header({
  sections,
  logoSrc,
  logoAlt,
  logoFallbackSrc,
  className = '',
  stickyOffset = 50,
}: HeaderProps) {
  const { isScrolled } = useScrollState(stickyOffset);

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  const activeSectionId = useActiveSection(sectionIds);
  const { scrollToSection } = useSmoothScroll();

  return (
    <header
      role="banner"
      className={`
        sticky top-0 z-50 w-full
        transition-all duration-300 ease-in-out
        ${
          isScrolled
            ? 'border-b border-gray-800 bg-gray-950/95 shadow-lg backdrop-blur-md'
            : 'bg-transparent'
        }
        ${className}
      `}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-20">
          {/* Logo */}
          <Logo src={logoSrc} alt={logoAlt} fallbackSrc={logoFallbackSrc} />

          {/* Desktop Navigation */}
          <Navigation
            sections={sections}
            activeSectionId={activeSectionId}
            onNavigate={scrollToSection}
          />

          {/* Mobile Hamburger Menu */}
          <HamburgerMenu
            sections={sections}
            activeSectionId={activeSectionId}
            onNavigate={scrollToSection}
          />
        </div>
      </div>
    </header>
  );
}
