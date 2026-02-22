import { renderHook, act } from '@testing-library/react';
import { useHeroAnimation } from './useHeroAnimation';
import { ANIMATION_DELAYS } from '@/components/hero/hero.constants';

// Mock useReducedMotion
jest.mock('./useReducedMotion', () => ({
  useReducedMotion: jest.fn(() => false),
}));

import { useReducedMotion } from './useReducedMotion';

const mockedUseReducedMotion = useReducedMotion as jest.MockedFunction<
  typeof useReducedMotion
>;

describe('useHeroAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedUseReducedMotion.mockReturnValue(false);

    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });

    jest
      .spyOn(window, 'cancelAnimationFrame')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('sets all elements immediately visible when reducedMotion is true', () => {
    mockedUseReducedMotion.mockReturnValue(true);

    const { result } = renderHook(() => useHeroAnimation());

    expect(result.current.logoVisible).toBe(true);
    expect(result.current.claimVisible).toBe(true);
    expect(result.current.ctaVisible).toBe(true);
    expect(result.current.allComplete).toBe(true);
  });

  it('starts with all elements hidden when reducedMotion is false', () => {
    const { result } = renderHook(() => useHeroAnimation());

    // After requestAnimationFrame fires but before timeouts
    // Logo has delay 0 so it fires immediately
    expect(result.current.claimVisible).toBe(false);
    expect(result.current.ctaVisible).toBe(false);
  });

  it('shows elements in staggered order: logo -> claim -> cta', () => {
    const { result } = renderHook(() => useHeroAnimation());

    // Logo delay = 0ms, should be visible immediately after RAF + setTimeout(0)
    act(() => {
      jest.advanceTimersByTime(0);
    });
    expect(result.current.logoVisible).toBe(true);
    expect(result.current.claimVisible).toBe(false);
    expect(result.current.ctaVisible).toBe(false);

    // Claim delay = 300ms
    act(() => {
      jest.advanceTimersByTime(ANIMATION_DELAYS.claim);
    });
    expect(result.current.claimVisible).toBe(true);
    expect(result.current.ctaVisible).toBe(false);

    // CTA delay = 600ms (300ms more from current position)
    act(() => {
      jest.advanceTimersByTime(ANIMATION_DELAYS.cta - ANIMATION_DELAYS.claim);
    });
    expect(result.current.ctaVisible).toBe(true);
    expect(result.current.allComplete).toBe(true);
  });

  it('uses correct default delays from ANIMATION_DELAYS constants', () => {
    const { result } = renderHook(() => useHeroAnimation());

    // Advance to just before claim delay
    act(() => {
      jest.advanceTimersByTime(ANIMATION_DELAYS.claim - 1);
    });
    expect(result.current.claimVisible).toBe(false);

    // Advance 1ms more to hit claim delay
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.claimVisible).toBe(true);

    // Advance to just before CTA delay
    act(() => {
      jest.advanceTimersByTime(
        ANIMATION_DELAYS.cta - ANIMATION_DELAYS.claim - 1
      );
    });
    expect(result.current.ctaVisible).toBe(false);

    // Advance 1ms more to hit CTA delay
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.ctaVisible).toBe(true);
  });

  it('accepts custom delays via options', () => {
    const customDelays = {
      logoDelay: 100,
      claimDelay: 200,
      ctaDelay: 400,
    };

    const { result } = renderHook(() => useHeroAnimation(customDelays));

    // Before logo delay
    expect(result.current.logoVisible).toBe(false);

    // After logo delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current.logoVisible).toBe(true);
    expect(result.current.claimVisible).toBe(false);

    // After claim delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current.claimVisible).toBe(true);
    expect(result.current.ctaVisible).toBe(false);

    // After CTA delay
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current.ctaVisible).toBe(true);
    expect(result.current.allComplete).toBe(true);
  });

  it('disables animation when enabled option is false', () => {
    const { result } = renderHook(() => useHeroAnimation({ enabled: false }));

    expect(result.current.logoVisible).toBe(true);
    expect(result.current.claimVisible).toBe(true);
    expect(result.current.ctaVisible).toBe(true);
    expect(result.current.allComplete).toBe(true);
  });

  it('sets allComplete to true only after all elements are visible', () => {
    const { result } = renderHook(() => useHeroAnimation());

    act(() => {
      jest.advanceTimersByTime(0);
    });
    expect(result.current.allComplete).toBe(false);

    act(() => {
      jest.advanceTimersByTime(ANIMATION_DELAYS.claim);
    });
    expect(result.current.allComplete).toBe(false);

    act(() => {
      jest.advanceTimersByTime(ANIMATION_DELAYS.cta - ANIMATION_DELAYS.claim);
    });
    expect(result.current.allComplete).toBe(true);
  });

  it('cleans up timers on unmount', () => {
    const cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');

    const { unmount } = renderHook(() => useHeroAnimation());

    unmount();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it('uses requestAnimationFrame for smooth rendering', () => {
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame');

    renderHook(() => useHeroAnimation());

    expect(rafSpy).toHaveBeenCalled();
  });

  it('returns all four state properties', () => {
    const { result } = renderHook(() => useHeroAnimation());

    expect(result.current).toHaveProperty('logoVisible');
    expect(result.current).toHaveProperty('claimVisible');
    expect(result.current).toHaveProperty('ctaVisible');
    expect(result.current).toHaveProperty('allComplete');
  });
});
