import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from '../useReducedMotion';

describe('useReducedMotion', () => {
  let listeners: Map<string, (event: MediaQueryListEvent) => void>;
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    listeners = new Map();

    matchMediaMock = jest.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(
        (event: string, handler: (e: MediaQueryListEvent) => void) => {
          listeners.set(event, handler);
        }
      ),
      removeEventListener: jest.fn(
        (event: string, _handler: (e: MediaQueryListEvent) => void) => {
          listeners.delete(event);
        }
      ),
      dispatchEvent: jest.fn(),
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  it('should return false when no reduced motion preference is set', () => {
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it('should return true when matchMedia matches prefers-reduced-motion: reduce', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it('should react to changes in matchMedia', () => {
    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);

    const changeHandler = listeners.get('change');
    expect(changeHandler).toBeDefined();

    act(() => {
      changeHandler!({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
      } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);

    act(() => {
      changeHandler!({
        matches: false,
        media: '(prefers-reduced-motion: reduce)',
      } as MediaQueryListEvent);
    });

    expect(result.current).toBe(false);
  });

  it('should call matchMedia with the correct query', () => {
    renderHook(() => useReducedMotion());

    expect(matchMediaMock).toHaveBeenCalledWith(
      '(prefers-reduced-motion: reduce)'
    );
  });

  it('should remove event listener on unmount', () => {
    const removeEventListenerMock = jest.fn();

    matchMediaMock.mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(
        (event: string, handler: (e: MediaQueryListEvent) => void) => {
          listeners.set(event, handler);
        }
      ),
      removeEventListener: removeEventListenerMock,
      dispatchEvent: jest.fn(),
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    const { unmount } = renderHook(() => useReducedMotion());

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });
});
