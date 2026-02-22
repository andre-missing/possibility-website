/**
 * Zentrale TypeScript-Typdefinitionen fuer Header/Navigation-Module.
 * Single Source of Truth fuer Datenstrukturen.
 */

/** Repraesentiert eine Navigationssektion mit Ankerlink */
export interface NavigationSection {
  /** Eindeutige ID, korrespondiert mit HTML-id der Sektion (z.B. 'about', 'services') */
  id: string;
  /** Ankerlink (z.B. '#about') */
  href: string;
  /** Anzeigename im Menu (z.B. 'Ueber uns') */
  label: string;
}

/** Konfiguration fuer den Header */
export interface HeaderConfig {
  /** Pfad zum SVG-Logo */
  logoSrc: string;
  /** Alt-Text fuer Logo */
  logoAlt: string;
  /** Pfad zum PNG-Fallback */
  logoFallbackSrc?: string;
  /** Navigations-Sektionen */
  sections: NavigationSection[];
  /** Hoehe des Headers fuer Scroll-Offset in px (Standard: 64/80) */
  headerHeight?: number;
  /** Scroll-Schwelle fuer Sticky-Transition in px (Standard: 50) */
  stickyOffset?: number;
}

/** Zustand der Scroll-Position */
export interface ScrollState {
  /** true wenn scrollY > threshold */
  isScrolled: boolean;
  /** Aktuelle Scroll-Position */
  scrollY: number;
  /** Scroll-Richtung */
  scrollDirection: 'up' | 'down' | null;
}
