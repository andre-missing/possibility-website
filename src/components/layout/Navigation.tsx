'use client';

import React, { useCallback } from 'react';
import type { NavigationSection } from '@/components/layout/types';

/** Props fuer die Navigation-Komponente */
export interface NavigationProps {
  /** Array der Navigations-Sektionen */
  sections: NavigationSection[];
  /** ID der aktuell aktiven Sektion */
  activeSectionId: string | null;
  /** Callback bei Navigation zu einer Sektion */
  onNavigate: (sectionId: string) => void;
  /** Zusaetzliche CSS-Klassen */
  className?: string;
}

/**
 * Navigation-Komponente: Rendert die horizontale Navigationsleiste (Desktop >= 768px).
 * Zeigt Links zu allen Sektionen an und markiert den aktiven Link.
 * Nutzt semantisches <nav>-Element mit aria-label.
 */
export function Navigation({
  sections,
  activeSectionId,
  onNavigate,
  className = '',
}: NavigationProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      e.preventDefault();
      onNavigate(sectionId);
    },
    [onNavigate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLAnchorElement>, sectionId: string) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNavigate(sectionId);
      }
    },
    [onNavigate]
  );

  return (
    <nav
      aria-label="Hauptnavigation"
      className={`hidden items-center gap-1 md:flex ${className}`}
    >
      <ul className="flex items-center gap-1" role="list">
        {sections.map((section) => {
          const isActive = activeSectionId === section.id;

          return (
            <li key={section.id}>
              <a
                href={section.href}
                onClick={(e) => handleClick(e, section.id)}
                onKeyDown={(e) => handleKeyDown(e, section.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`
                  rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-400'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
