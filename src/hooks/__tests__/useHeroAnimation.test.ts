import { renderHook, act } from '@testing-library/react';
import { useHeroAnimation } from '../useHeroAnimation';

// Mock useReducedMotion
let mockReducedMotion = false;
jest.mock('../useReducedMotion', () => ({
  useReducedMotion: () => mockReducedMotion,
}));

describe('useHeroAnimation', () => {
  beforeEach(() => {
    mockReducedMotion = false;
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should set all elements visible immediately when reducedMotion is true', () => {
    mockReducedMotion = true;

    const { result } = renderHook(() => useHeroAnimation());

    expect(result.current.logoVisible).toBe(true);
    expect(result.current.claimVisible).toBe(true);
    expect(result.current.ctaVisible).toBe(true);
    expect(result.current.allComplete).toBe(true);
  });

  it('should start with all elements hidden when reducedMotion is false', () => {
    const { result } = renderHook(() => useHeroAnimation());

    // Before rAF fires, elements should be hidden
    expect(result.current.logoVisible).toBe(false);
    expect(result.current.claimVisible).toBe(false);
    expect(result.current.ctaVisible).toBe(false);
    expect(result.current.allComplete).toBe(false);
  });

  it('should stagger elements in order: logo -> claim -> cta (0ms -> 300ms -> 600ms)', () => {
    const { result } = renderHook(() => useHeroAnimation());

    // Fire requestAnimationFrame
    act(() => {
      jest.advanceTimersByTime(16);
    });

    // Logo should be visible immediately (0ms delay)
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.logoVisible).toBe(true);
    expect(result.current.claimVisible).toBe(false);
    expect(result.current.ctaVisible).toBe(false);

    // Claim should be visible after 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.claimVisible).toBe(true);
    expect(result.current.ctaVisible).toBe(false);

    // CTA should be visible after 600ms (total)
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.ctaVisible).toBe(true);
    expect(result.current.allComplete).toBe(true);
  });

  it('should respect custom delays', () => {
    const { result } = renderHook(() =>
      useHeroAnimation({
        logoDelay: 100,
        claimDelay: 500,
        ctaDelay: 900,
      })
    );

    // Fire rAF
    act(() => {
      jest.advanceTimersByTime(16);
    });

    // After 100ms: logo visible
    act(() => {
      jest.advanceTimersByTime(101);
    });
    expect(result.current.logoVisible).toBe(true);
    expect(result.current.claimVisible).toBe(false);

    // After 500ms: claim visible
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.claimVisible).toBe(true);
    expect(result.current.ctaVisible).toBe(false);

    // After 900ms: cta visible
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(result.current.ctaVisible).toBe(true);
    expect(result.current.allComplete).toBe(true);
  });

  it('should set allComplete to true only when the last element is visible', () => {
    const { result } = renderHook(() => useHeroAnimation());

    // Fire rAF + logo delay
    act(() => {
      jest.advanceTimersByTime(17);
    });
    expect(result.current.logoVisible).toBe(true);
    expect(result.current.allComplete).toBe(false);

    // After claim delay
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.claimVisible).toBe(true);
    expect(result.current.allComplete).toBe(false);

    // After cta delay
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current.ctaVisible).toBe(true);
    expect(result.current.allComplete).toBe(true);
  });

  it('should skip animations when enabled is false', () => {
    const { result } = renderHook(() => useHeroAnimation({ enabled: false }));

    expect(result.current.logoVisible).toBe(true);
    expect(result.current.claimVisible).toBe(true);
    expect(result.current.ctaVisible).toBe(true);
    expect(result.current.allComplete).toBe(true);
  });
});
