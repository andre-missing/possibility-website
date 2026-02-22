'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

/** Konfigurationsoptionen fuer useActiveSection */
export interface ActiveSectionOptions {
  /** Root-Margin fuer den IntersectionObserver (Standard: '0px 0px -20% 0px') */
  rootMargin?: string;
  /** Threshold(s) fuer den IntersectionObserver */
  threshold?: number | number[];
}

/**
 * Custom Hook: Beobachtet alle Sektions-Elemente via IntersectionObserver.
 * Bestimmt die aktuell dominante Sektion im Viewport (hoechster intersectionRatio).
 * Gibt die activeSectionId zurueck.
 *
 * @param sectionIds - Array von HTML-Element-IDs der zu beobachtenden Sektionen
 * @param options - Optionale IntersectionObserver-Konfiguration
 * @returns ID der aktuell sichtbaren Sektion oder null
 */
export function useActiveSection(
  sectionIds: string[],
  options: ActiveSectionOptions = {}
): string | null {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const ratioMap = useRef<Map<string, number>>(new Map());

  const {
    rootMargin = '0px 0px -20% 0px',
    threshold = [0, 0.25, 0.5, 0.75, 1],
  } = options;

  const updateActiveSection = useCallback(() => {
    let maxRatio = 0;
    let maxId: string | null = null;

    ratioMap.current.forEach((ratio, id) => {
      if (ratio > maxRatio) {
        maxRatio = ratio;
        maxId = id;
      }
    });

    setActiveSectionId(maxId);
  }, []);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratioMap.current.set(entry.target.id, entry.intersectionRatio);
        });
        updateActiveSection();
      },
      {
        rootMargin,
        threshold,
      }
    );

    const elements: Element[] = [];
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        elements.push(element);
      }
    });

    // Initiale Sektion setzen
    if (elements.length > 0 && !activeSectionId) {
      setActiveSectionId(sectionIds[0]);
    }

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element);
      });
      observer.disconnect();
      ratioMap.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds, rootMargin, threshold, updateActiveSection]);

  return activeSectionId;
}
