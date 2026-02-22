import { renderHook, act } from '@testing-library/react';
import { useActiveSection } from './useActiveSection';

describe('useActiveSection', () => {
  let observerInstances: Array<{
    callback: IntersectionObserverCallback;
    options: IntersectionObserverInit | undefined;
    observe: jest.Mock;
    unobserve: jest.Mock;
    disconnect: jest.Mock;
  }>;

  beforeEach(() => {
    observerInstances = [];

    // Mock IntersectionObserver
    const MockIntersectionObserver = jest.fn(
      (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit
      ) => {
        const instance = {
          callback,
          options,
          observe: jest.fn(),
          unobserve: jest.fn(),
          disconnect: jest.fn(),
          root: null,
          rootMargin: options?.rootMargin ?? '',
          thresholds: Array.isArray(options?.threshold)
            ? options.threshold
            : [options?.threshold ?? 0],
          takeRecords: jest.fn().mockReturnValue([]),
        };
        observerInstances.push(instance);
        return instance;
      }
    );

    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    observerInstances = [];
  });

  function createMockElement(id: string): HTMLElement {
    const element = document.createElement('div');
    element.id = id;
    document.body.appendChild(element);
    return element;
  }

  function simulateIntersection(
    entries: Array<{ target: Element; intersectionRatio: number }>
  ) {
    if (observerInstances.length > 0) {
      const observer = observerInstances[observerInstances.length - 1];
      observer.callback(
        entries.map((entry) => ({
          target: entry.target,
          intersectionRatio: entry.intersectionRatio,
          isIntersecting: entry.intersectionRatio > 0,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        })),
        observer as unknown as IntersectionObserver
      );
    }
  }

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should return the correct sectionId when a section is visible', () => {
    const aboutEl = createMockElement('about');
    createMockElement('services');

    const { result } = renderHook(() =>
      useActiveSection(['about', 'services'])
    );

    act(() => {
      simulateIntersection([{ target: aboutEl, intersectionRatio: 0.8 }]);
    });

    expect(result.current).toBe('about');
  });

  it('should return null when no sections are provided', () => {
    const { result } = renderHook(() => useActiveSection([]));

    expect(result.current).toBe(null);
  });

  it('should return the section with the highest intersectionRatio', () => {
    const aboutEl = createMockElement('about');
    const servicesEl = createMockElement('services');

    const { result } = renderHook(() =>
      useActiveSection(['about', 'services'])
    );

    act(() => {
      simulateIntersection([
        { target: aboutEl, intersectionRatio: 0.3 },
        { target: servicesEl, intersectionRatio: 0.7 },
      ]);
    });

    expect(result.current).toBe('services');
  });

  it('should set initial section when elements are found', () => {
    createMockElement('about');
    createMockElement('services');

    const { result } = renderHook(() =>
      useActiveSection(['about', 'services'])
    );

    // Initial section should be the first one
    expect(result.current).toBe('about');
  });

  it('should observe all section elements', () => {
    createMockElement('about');
    createMockElement('services');
    createMockElement('contact');

    renderHook(() => useActiveSection(['about', 'services', 'contact']));

    expect(observerInstances.length).toBeGreaterThan(0);
    const observer = observerInstances[observerInstances.length - 1];
    expect(observer.observe).toHaveBeenCalledTimes(3);
  });

  it('should skip elements that dont exist in the DOM', () => {
    createMockElement('about');
    // 'nonexistent' is not created in the DOM

    renderHook(() => useActiveSection(['about', 'nonexistent']));

    const observer = observerInstances[observerInstances.length - 1];
    expect(observer.observe).toHaveBeenCalledTimes(1);
  });

  it('should disconnect observer and clean up on unmount', () => {
    createMockElement('about');

    const { unmount } = renderHook(() => useActiveSection(['about']));

    const observer = observerInstances[observerInstances.length - 1];

    unmount();

    expect(observer.unobserve).toHaveBeenCalled();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('should use custom rootMargin option', () => {
    createMockElement('about');

    renderHook(() =>
      useActiveSection(['about'], { rootMargin: '-10% 0px -10% 0px' })
    );

    const observer = observerInstances[observerInstances.length - 1];
    expect(observer.options?.rootMargin).toBe('-10% 0px -10% 0px');
  });

  it('should use custom threshold option', () => {
    createMockElement('about');

    renderHook(() => useActiveSection(['about'], { threshold: [0, 0.5, 1] }));

    const observer = observerInstances[observerInstances.length - 1];
    expect(observer.options?.threshold).toEqual([0, 0.5, 1]);
  });

  it('should return null when all sections have 0 intersectionRatio', () => {
    const aboutEl = createMockElement('about');
    const servicesEl = createMockElement('services');
    // Stabile Referenzen damit useEffect-Dependencies sich nicht aendern
    const sectionIds = ['about', 'services'];
    const options = { threshold: [0, 0.25, 0.5, 0.75, 1] };

    const { result } = renderHook(() => useActiveSection(sectionIds, options));

    // Erst eine Sektion sichtbar machen
    act(() => {
      simulateIntersection([{ target: aboutEl, intersectionRatio: 0.5 }]);
    });

    expect(result.current).toBe('about');

    // Dann alle Sektionen verlassen Viewport
    act(() => {
      simulateIntersection([
        { target: aboutEl, intersectionRatio: 0 },
        { target: servicesEl, intersectionRatio: 0 },
      ]);
    });

    expect(result.current).toBe(null);
  });
});
