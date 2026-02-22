import { renderHook, act } from '@testing-library/react';
import { useSmoothScroll } from './useSmoothScroll';

describe('useSmoothScroll', () => {
  const originalRAF = window.requestAnimationFrame;

  beforeEach(() => {
    // Mock window.scrollTo
    jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

    // Mock window.scrollY
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    // Mock history.pushState
    jest.spyOn(window.history, 'pushState').mockImplementation(() => {});

    // Mock requestAnimationFrame via defineProperty (jsdom may not have it as own property)
    window.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
      cb(performance.now());
      return 1;
    });

    // Use fake timers fuer setTimeout
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    window.requestAnimationFrame = originalRAF;
    document.body.innerHTML = '';
  });

  it('should return scrollToSection and scrollToTop functions', () => {
    const { result } = renderHook(() => useSmoothScroll());

    expect(typeof result.current.scrollToSection).toBe('function');
    expect(typeof result.current.scrollToTop).toBe('function');
  });

  // Test dass useSmoothScroll.scrollToSection die korrekte Element-ID anspricht
  it('should scroll to the correct element by sectionId', () => {
    const element = document.createElement('div');
    element.id = 'about';
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: 500,
      bottom: 1000,
      left: 0,
      right: 100,
      width: 100,
      height: 500,
      x: 0,
      y: 500,
      toJSON: () => ({}),
    });
    document.body.appendChild(element);

    const { result } = renderHook(() => useSmoothScroll());

    act(() => {
      result.current.scrollToSection('about');
    });

    // window.scrollTo sollte mit der berechneten Position aufgerufen werden
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 420, // 500 + 0 (scrollY) - 80 (default headerOffset)
      behavior: 'smooth',
    });
  });

  it('should not scroll if element does not exist', () => {
    const { result } = renderHook(() => useSmoothScroll());

    act(() => {
      result.current.scrollToSection('nonexistent');
    });

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('should update URL hash when scrolling to section', () => {
    const element = document.createElement('div');
    element.id = 'services';
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: 300,
      bottom: 600,
      left: 0,
      right: 100,
      width: 100,
      height: 300,
      x: 0,
      y: 300,
      toJSON: () => ({}),
    });
    document.body.appendChild(element);

    const { result } = renderHook(() => useSmoothScroll());

    act(() => {
      result.current.scrollToSection('services');
    });

    expect(window.history.pushState).toHaveBeenCalledWith(
      null,
      '',
      '#services'
    );
  });

  it('should scroll to top with scrollToTop', () => {
    const { result } = renderHook(() => useSmoothScroll());

    act(() => {
      result.current.scrollToTop();
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('should remove URL hash when scrolling to top', () => {
    const { result } = renderHook(() => useSmoothScroll());

    act(() => {
      result.current.scrollToTop();
    });

    expect(window.history.pushState).toHaveBeenCalledWith(
      null,
      '',
      window.location.pathname
    );
  });

  it('should respect custom headerOffset', () => {
    const element = document.createElement('div');
    element.id = 'contact';
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: 400,
      bottom: 800,
      left: 0,
      right: 100,
      width: 100,
      height: 400,
      x: 0,
      y: 400,
      toJSON: () => ({}),
    });
    document.body.appendChild(element);

    const { result } = renderHook(() => useSmoothScroll(100));

    act(() => {
      result.current.scrollToSection('contact');
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 300, // 400 + 0 - 100
      behavior: 'smooth',
    });
  });

  it('should prevent concurrent scrolling', () => {
    const element = document.createElement('div');
    element.id = 'about';
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: 500,
      bottom: 1000,
      left: 0,
      right: 100,
      width: 100,
      height: 500,
      x: 0,
      y: 500,
      toJSON: () => ({}),
    });
    document.body.appendChild(element);

    const { result } = renderHook(() => useSmoothScroll());

    act(() => {
      result.current.scrollToSection('about');
    });

    // Zweiter Aufruf sollte blockiert werden
    act(() => {
      result.current.scrollToSection('about');
    });

    // scrollTo sollte nur einmal aufgerufen worden sein
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('should allow scrolling again after timeout', () => {
    const element = document.createElement('div');
    element.id = 'about';
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      top: 500,
      bottom: 1000,
      left: 0,
      right: 100,
      width: 100,
      height: 500,
      x: 0,
      y: 500,
      toJSON: () => ({}),
    });
    document.body.appendChild(element);

    const { result } = renderHook(() => useSmoothScroll());

    act(() => {
      result.current.scrollToSection('about');
    });

    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    // Nach Timeout sollte erneutes Scrollen moeglich sein
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.scrollToSection('about');
    });

    expect(window.scrollTo).toHaveBeenCalledTimes(2);
  });
});
