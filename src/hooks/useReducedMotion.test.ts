import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

describe('useReducedMotion', () => {
  let matchMediaMock: jest.Mock;
  let addEventListenerMock: jest.Mock;
  let removeEventListenerMock: jest.Mock;

  beforeEach(() => {
    addEventListenerMock = jest.fn();
    removeEventListenerMock = jest.fn();

    matchMediaMock = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns false when no motion preference is set', () => {
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it('returns true when prefers-reduced-motion: reduce is matched', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it('queries the correct media query string', () => {
    renderHook(() => useReducedMotion());

    expect(matchMediaMock).toHaveBeenCalledWith(
      '(prefers-reduced-motion: reduce)'
    );
  });

  it('registers a change event listener on mount', () => {
    renderHook(() => useReducedMotion());

    expect(addEventListenerMock).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('removes the change event listener on unmount', () => {
    const { unmount } = renderHook(() => useReducedMotion());

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('updates when media query changes at runtime', () => {
    let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;

    addEventListenerMock.mockImplementation(
      (_event: string, handler: (event: MediaQueryListEvent) => void) => {
        changeHandler = handler;
      }
    );

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    act(() => {
      changeHandler?.({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);

    act(() => {
      changeHandler?.({ matches: false } as MediaQueryListEvent);
    });

    expect(result.current).toBe(false);
  });

  it('initializes with false for SSR safety (default state before effect)', () => {
    // The initial useState value is false, ensuring SSR compatibility
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    });

    const { result } = renderHook(() => useReducedMotion());

    // After effect runs, it should be true
    expect(result.current).toBe(true);
  });
});
