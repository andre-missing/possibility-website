import { render, screen, fireEvent } from '@testing-library/react';
import { Logo } from './Logo';

// Mock useSmoothScroll
const mockScrollToTop = jest.fn();
jest.mock('@/hooks/useSmoothScroll', () => ({
  useSmoothScroll: () => ({
    scrollToSection: jest.fn(),
    scrollToTop: mockScrollToTop,
  }),
}));

describe('Logo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // REQ-001: Test dass Logo-Komponente ein <img>-Tag mit korrektem src und alt rendert
  it('should render an <img> tag with correct src and alt', () => {
    render(<Logo src="/logo.svg" alt="Company Logo" />);

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/logo.svg');
    expect(img).toHaveAttribute('alt', 'Company Logo');
  });

  // REQ-001: Test dass Logo-Komponente bei onError das fallbackSrc setzt
  it('should set fallbackSrc on image error when fallbackSrc is provided', () => {
    render(<Logo src="/logo.svg" alt="Company Logo" fallbackSrc="/logo.png" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/logo.svg');

    // Simulate image load error
    fireEvent.error(img);

    expect(img).toHaveAttribute('src', '/logo.png');
  });

  // REQ-001: Test dass Logo-Komponente ohne fallbackSrc bei Fehler kein Fallback laedt
  it('should not set fallback when no fallbackSrc is provided on error', () => {
    render(<Logo src="/logo.svg" alt="Company Logo" />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/logo.svg');

    // Simulate image load error
    fireEvent.error(img);

    // Should remain the same src
    expect(img).toHaveAttribute('src', '/logo.svg');
  });

  it('should only apply fallback once (not loop on fallback error)', () => {
    render(<Logo src="/logo.svg" alt="Company Logo" fallbackSrc="/logo.png" />);

    const img = screen.getByRole('img');

    // First error: switch to fallback
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', '/logo.png');

    // Second error: should NOT switch again
    fireEvent.error(img);
    expect(img).toHaveAttribute('src', '/logo.png');
  });

  it('should render as an anchor link', () => {
    render(<Logo src="/logo.svg" alt="Company Logo" />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#top');
  });

  it('should call scrollToTop on click', () => {
    render(<Logo src="/logo.svg" alt="Company Logo" />);

    const link = screen.getByRole('link');
    fireEvent.click(link);

    expect(mockScrollToTop).toHaveBeenCalledTimes(1);
  });

  // REQ-006: Test dass Enter-Taste auf Logo scrollToTop ausloest
  it('should call scrollToTop on Enter keydown', () => {
    render(<Logo src="/logo.svg" alt="Company Logo" />);

    const link = screen.getByRole('link');
    fireEvent.keyDown(link, { key: 'Enter' });

    expect(mockScrollToTop).toHaveBeenCalledTimes(1);
  });

  // REQ-007: Test dass Logo einen zugaenglichen aria-label hat
  it('should have accessible aria-label', () => {
    render(<Logo src="/logo.svg" alt="Company Logo" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'aria-label',
      'Company Logo - Zum Seitenanfang scrollen'
    );
  });

  // REQ-006: Test dass Logo per Tab fokussierbar ist
  it('should be focusable via Tab (no explicit tabIndex needed for <a>)', () => {
    render(<Logo src="/logo.svg" alt="Company Logo" />);

    const link = screen.getByRole('link');
    // Anchors are naturally focusable
    expect(link.tagName).toBe('A');
    // Should not have tabIndex=-1 (which would make it unfocusable)
    expect(link).not.toHaveAttribute('tabindex', '-1');
  });

  it('should apply additional className', () => {
    render(
      <Logo src="/logo.svg" alt="Company Logo" className="custom-class" />
    );

    const link = screen.getByRole('link');
    expect(link.className).toContain('custom-class');
  });

  // REQ-008: Test dass Logo responsive Groessenanpassung hat
  it('should have responsive image sizing classes', () => {
    render(<Logo src="/logo.svg" alt="Company Logo" />);

    const img = screen.getByRole('img');
    expect(img.className).toContain('h-8');
    expect(img.className).toContain('md:h-10');
  });
});
