import { render, screen, fireEvent } from '@testing-library/react';
import HeroCTA from '../HeroCTA';
import type { CTAConfig } from '../hero.types';

// Mock useReducedMotion
let mockReducedMotion = false;
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => mockReducedMotion,
}));

describe('HeroCTA', () => {
  beforeEach(() => {
    mockReducedMotion = false;
  });

  describe('button variant', () => {
    const buttonCta: CTAConfig = {
      text: 'Mehr erfahren',
      variant: 'button',
      targetSectionId: 'content',
    };

    it('should render a button with the configured label', () => {
      render(<HeroCTA cta={buttonCta} />);

      const button = screen.getByRole('button', { name: 'Mehr erfahren' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Mehr erfahren');
    });

    it('should call scrollIntoView with smooth behavior on click', () => {
      const scrollIntoViewMock = jest.fn();
      const mockElement = document.createElement('div');
      mockElement.scrollIntoView = scrollIntoViewMock;

      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);

      render(<HeroCTA cta={buttonCta} />);

      fireEvent.click(screen.getByRole('button', { name: 'Mehr erfahren' }));

      expect(document.getElementById).toHaveBeenCalledWith('content');
      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });

      jest.restoreAllMocks();
    });

    it('should have a visible focus ring on keyboard focus (focus-visible class)', () => {
      render(<HeroCTA cta={buttonCta} />);

      const button = screen.getByRole('button', { name: 'Mehr erfahren' });
      expect(button.className).toContain('focus-visible:ring-2');
    });

    it('should have a minimum touch target of 44x44px', () => {
      render(<HeroCTA cta={buttonCta} />);

      const button = screen.getByRole('button', { name: 'Mehr erfahren' });
      expect(button.className).toContain('min-h-[44px]');
      expect(button.className).toContain('min-w-[44px]');
    });
  });

  describe('scroll-indicator variant', () => {
    const scrollCta: CTAConfig = {
      text: 'Nach unten scrollen',
      variant: 'scroll-indicator',
      targetSectionId: 'content',
    };

    it('should render an animated chevron', () => {
      render(<HeroCTA cta={scrollCta} />);

      const button = screen.getByRole('button', {
        name: 'Nach unten scrollen',
      });
      expect(button).toBeInTheDocument();

      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have bounce animation when reduced motion is not preferred', () => {
      mockReducedMotion = false;

      render(<HeroCTA cta={scrollCta} />);

      const button = screen.getByRole('button', {
        name: 'Nach unten scrollen',
      });
      const svg = button.querySelector('svg');
      const svgClass = svg?.getAttribute('class') ?? '';
      expect(svgClass).toContain('animate-bounce');
    });

    it('should not have bounce animation when reduced motion is preferred', () => {
      mockReducedMotion = true;

      render(<HeroCTA cta={scrollCta} />);

      const button = screen.getByRole('button', {
        name: 'Nach unten scrollen',
      });
      const svg = button.querySelector('svg');
      const svgClass = svg?.getAttribute('class') ?? '';
      expect(svgClass).not.toContain('animate-bounce');
    });

    it('should have a minimum touch target of 44x44px', () => {
      render(<HeroCTA cta={scrollCta} />);

      const button = screen.getByRole('button', {
        name: 'Nach unten scrollen',
      });
      expect(button.className).toContain('min-h-[44px]');
      expect(button.className).toContain('min-w-[44px]');
    });

    it('should call scrollIntoView on click', () => {
      const scrollIntoViewMock = jest.fn();
      const mockElement = document.createElement('div');
      mockElement.scrollIntoView = scrollIntoViewMock;

      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);

      render(<HeroCTA cta={scrollCta} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Nach unten scrollen' })
      );

      expect(scrollIntoViewMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });

      jest.restoreAllMocks();
    });

    it('should have a visible focus ring on keyboard focus (focus-visible class)', () => {
      render(<HeroCTA cta={scrollCta} />);

      const button = screen.getByRole('button', {
        name: 'Nach unten scrollen',
      });
      expect(button.className).toContain('focus-visible:ring-2');
    });

    it('should have aria-hidden on the SVG chevron icon', () => {
      render(<HeroCTA cta={scrollCta} />);

      const button = screen.getByRole('button', {
        name: 'Nach unten scrollen',
      });
      const svg = button.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('graceful handling', () => {
    it('should not throw when target element does not exist', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);

      const cta: CTAConfig = {
        text: 'Click me',
        variant: 'button',
        targetSectionId: 'nonexistent',
      };

      render(<HeroCTA cta={cta} />);

      expect(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Click me' }));
      }).not.toThrow();

      jest.restoreAllMocks();
    });
  });
});
