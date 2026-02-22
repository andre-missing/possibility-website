import { renderHook, act } from '@testing-library/react';
import { useScrollState } from './useScrollState';

describe('useScrollState', () => {
  let scrollListeners: Array<EventListener>;
  let _rafCallback: FrameRequestCallback | null;

  beforeEach(() => {
    scrollListeners = [];
    _rafCallback = null;

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Mock requestAnimationFrame
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        _rafCallback = cb;
        // Sofort ausfuehren
        cb(performance.now());
        return 1;
      });

    // Mock addEventListener/removeEventListener fuer scroll
    const originalAdd = window.addEventListener.bind(window);
    const originalRemove = window.removeEventListener.bind(window);

    jest
      .spyOn(window, 'addEventListener')
      .mockImplementation(
        (
          event: string,
          handler: EventListener | EventListenerObject,
          options?: boolean | AddEventListenerOptions
        ) => {
          if (event === 'scroll') {
            scrollListeners.push(handler as EventListener);
          }
          originalAdd(event, handler, options);
        }
      );

    jest
      .spyOn(window, 'removeEventListener')
      .mockImplementation(
        (
          event: string,
          handler: EventListener | EventListenerObject,
          options?: boolean | EventListenerOptions
        ) => {
          if (event === 'scroll') {
            scrollListeners = scrollListeners.filter((l) => l !== handler);
          }
          originalRemove(event, handler, options);
        }
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function simulateScroll(scrollY: number) {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: scrollY,
    });
    // Trigger alle scroll-listener
    scrollListeners.forEach((listener) => {
      listener(new Event('scroll'));
    });
  }

  it('should return isScrolled=false when scrollY=0', () => {
    const { result } = renderHook(() => useScrollState());

    expect(result.current.isScrolled).toBe(false);
    expect(result.current.scrollY).toBe(0);
  });

  it('should return isScrolled=true when scrollY > threshold (default: 50)', () => {
    const { result } = renderHook(() => useScrollState());

    act(() => {
      simulateScroll(100);
    });

    expect(result.current.isScrolled).toBe(true);
    expect(result.current.scrollY).toBe(100);
  });

  it('should return isScrolled=false when scrollY <= threshold', () => {
    const { result } = renderHook(() => useScrollState());

    act(() => {
      simulateScroll(50);
    });

    expect(result.current.isScrolled).toBe(false);
  });

  it('should respect custom threshold', () => {
    const { result } = renderHook(() => useScrollState(100));

    act(() => {
      simulateScroll(80);
    });

    expect(result.current.isScrolled).toBe(false);

    act(() => {
      simulateScroll(150);
    });

    expect(result.current.isScrolled).toBe(true);
  });

  it('should set scrollDirection to "down" when scrolling down', () => {
    const { result } = renderHook(() => useScrollState());

    act(() => {
      simulateScroll(100);
    });

    expect(result.current.scrollDirection).toBe('down');
  });

  it('should set scrollDirection to "up" when scrolling up', () => {
    const { result } = renderHook(() => useScrollState());

    act(() => {
      simulateScroll(200);
    });

    act(() => {
      simulateScroll(50);
    });

    expect(result.current.scrollDirection).toBe('up');
  });

  it('should set scrollDirection to null when scroll position unchanged', () => {
    const { result } = renderHook(() => useScrollState());

    // Initial state
    expect(result.current.scrollDirection).toBe(null);
  });

  it('should add scroll event listener with passive option', () => {
    renderHook(() => useScrollState());

    expect(window.addEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true }
    );
  });

  it('should clean up scroll event listener on unmount', () => {
    const { unmount } = renderHook(() => useScrollState());

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });

  it('should use requestAnimationFrame for performance', () => {
    renderHook(() => useScrollState());

    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });
});
