'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { NavigationSection } from '@/components/layout/types';

/** Props fuer die HamburgerMenu-Komponente */
export interface HamburgerMenuProps {
  /** Array der Navigations-Sektionen */
  sections: NavigationSection[];
  /** ID der aktuell aktiven Sektion */
  activeSectionId: string | null;
  /** Callback bei Navigation zu einer Sektion */
  onNavigate: (sectionId: string) => void;
}

const MENU_ID = 'mobile-navigation-menu';
const DESKTOP_BREAKPOINT = 768;

/**
 * HamburgerMenu-Komponente: Mobile Navigation (<768px).
 * Toggle-Button mit animiertem Hamburger-Icon (3 Balken → X-Transformation).
 * Overlay-Menu mit vertikaler Linkliste.
 * Schliesst automatisch bei Linkauswahl und bei Viewport-Wechsel auf Desktop.
 * Verwaltet Fokus-Trap im geoeffneten Zustand.
 */
export function HamburgerMenu({
  sections,
  activeSectionId,
  onNavigate,
}: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const lastLinkRef = useRef<HTMLAnchorElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    // Fokus zurueck zum Toggle-Button
    toggleRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleNavigate = useCallback(
    (sectionId: string) => {
      onNavigate(sectionId);
      close();
    },
    [onNavigate, close]
  );

  // Schliesst bei Viewport-Wechsel auf Desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(min-width: ${DESKTOP_BREAKPOINT}px)`
    );

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && isOpen) {
        setIsOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [isOpen]);

  // Escape-Taste schliesst Menu
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  // Fokus-Trap im geoeffneten Menu
  useEffect(() => {
    if (!isOpen) return;

    // Fokus auf erstes Link-Element setzen
    requestAnimationFrame(() => {
      firstLinkRef.current?.focus();
    });

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = menuRef.current?.querySelectorAll(
        'a[href], button:not([disabled])'
      );
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleFocusTrap);
    return () => {
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [isOpen]);

  // Body-Scroll verhindern bei geoeffnetem Menu
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      {/* Toggle Button */}
      <button
        ref={toggleRef}
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={MENU_ID}
        aria-label={isOpen ? 'Navigation schliessen' : 'Navigation oeffnen'}
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg
          text-gray-300 transition-colors duration-200
          hover:bg-gray-800 hover:text-white focus:outline-none
          focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="relative flex h-5 w-6 flex-col justify-between">
          <span
            className={`block h-0.5 w-6 origin-center transform bg-current transition-all duration-300 ${
              isOpen ? 'translate-y-[9px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
              isOpen ? 'scale-x-0 opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`block h-0.5 w-6 origin-center transform bg-current transition-all duration-300 ${
              isOpen ? '-translate-y-[9px] -rotate-45' : ''
            }`}
          />
        </div>
      </button>

      {/* Overlay + Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div
            ref={menuRef}
            id={MENU_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="fixed right-0 top-0 z-40 h-full w-72 transform border-l border-gray-800
              bg-gray-950 px-4 pt-20 shadow-2xl transition-transform
              duration-300 ease-in-out"
          >
            <nav aria-label="Mobile Hauptnavigation">
              <ul className="flex flex-col gap-1" role="list">
                {sections.map((section, index) => {
                  const isActive = activeSectionId === section.id;
                  const isFirst = index === 0;
                  const isLast = index === sections.length - 1;

                  return (
                    <li key={section.id}>
                      <a
                        ref={
                          isFirst
                            ? firstLinkRef
                            : isLast
                              ? lastLinkRef
                              : undefined
                        }
                        href={section.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigate(section.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNavigate(section.id);
                          }
                        }}
                        aria-current={isActive ? 'page' : undefined}
                        className={`
                          block rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200
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
          </div>
        </>
      )}
    </div>
  );
}
