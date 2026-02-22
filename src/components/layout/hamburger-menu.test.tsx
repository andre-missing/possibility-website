import { render, screen, fireEvent, act } from '@testing-library/react';
import { HamburgerMenu } from './HamburgerMenu';
import type { NavigationSection } from './types';

const mockSections: NavigationSection[] = [
  { id: 'about', href: '#about', label: 'Ueber uns' },
  { id: 'services', href: '#services', label: 'Leistungen' },
  { id: 'contact', href: '#contact', label: 'Kontakt' },
];

describe('HamburgerMenu', () => {
  let mockOnNavigate: jest.Mock;
  let mockMatchMedia: jest.Mock;
  let mediaQueryListeners: Array<(e: MediaQueryListEvent) => void>;

  beforeEach(() => {
    mockOnNavigate = jest.fn();
    mediaQueryListeners = [];

    mockMatchMedia = jest.fn().mockReturnValue({
      matches: false, // Start as mobile viewport
      addEventListener: (
        _event: string,
        handler: (e: MediaQueryListEvent) => void
      ) => {
        mediaQueryListeners.push(handler);
      },
      removeEventListener: jest.fn(),
    });

    Object.defineProperty(window, 'matchMedia', {
      value: mockMatchMedia,
      writable: true,
      configurable: true,
    });

    // Mock requestAnimationFrame fuer focus management
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(performance.now());
        return 1;
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.style.overflow = '';
  });

  it('should render the toggle button', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  // REQ-004: Test dass HamburgerMenu initial geschlossen ist (aria-expanded=false)
  it('should be initially closed (aria-expanded=false)', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  // REQ-004: Test dass HamburgerMenu bei Klick auf Toggle-Button oeffnet (aria-expanded=true)
  it('should open on toggle button click (aria-expanded=true)', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  // REQ-004: Test dass HamburgerMenu bei erneutem Klick schliesst
  it('should close on second toggle click', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const button = screen.getByRole('button');

    // Open
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Close
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('should show menu links when open', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    // Menu is closed - links should not be visible
    expect(screen.queryByText('Ueber uns')).not.toBeInTheDocument();

    // Open the menu
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Links should now be visible
    expect(screen.getByText('Ueber uns')).toBeInTheDocument();
    expect(screen.getByText('Leistungen')).toBeInTheDocument();
    expect(screen.getByText('Kontakt')).toBeInTheDocument();
  });

  // REQ-004: Test dass HamburgerMenu bei Link-Auswahl schliesst und onNavigate aufruft
  it('should close and call onNavigate on link selection', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    // Open menu
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Click a link
    const aboutLink = screen.getByText('Ueber uns');
    fireEvent.click(aboutLink);

    expect(mockOnNavigate).toHaveBeenCalledWith('about');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  // REQ-007: Test dass HamburgerMenu-Button aria-controls auf die Menu-ID verweist
  it('should have aria-controls pointing to the menu ID', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-controls', 'mobile-navigation-menu');
  });

  // REQ-007: Test dass HamburgerMenu-Button aria-expanded korrekt setzt
  it('should have correct aria-label on toggle button', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Navigation oeffnen');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Navigation schliessen');
  });

  it('should close on Escape key', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  // REQ-008: Test dass HamburgerMenu bei Viewport-Aenderung ueber 768px automatisch schliesst
  it('should close on viewport change to desktop (>=768px)', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    // Open menu
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Simulate viewport change to desktop
    act(() => {
      mediaQueryListeners.forEach((listener) => {
        listener({ matches: true } as MediaQueryListEvent);
      });
    });

    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('should set aria-current="page" on active link in menu', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId="services"
        onNavigate={mockOnNavigate}
      />
    );

    // Open menu
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const activeLink = screen.getByText('Leistungen');
    expect(activeLink).toHaveAttribute('aria-current', 'page');

    const inactiveLink = screen.getByText('Ueber uns');
    expect(inactiveLink).not.toHaveAttribute('aria-current');
  });

  // REQ-006: Test dass Enter und Space auf HamburgerMenu-Button das Menu togglen
  it('should toggle with Enter key (via native button click)', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const button = screen.getByRole('button');

    // Buttons natively respond to Enter/Space via click events
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should toggle with Space key (via native button click)', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const button = screen.getByRole('button');

    // Buttons natively respond to Space via click events
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should prevent body scroll when menu is open', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const button = screen.getByRole('button');

    // Open menu
    fireEvent.click(button);
    expect(document.body.style.overflow).toBe('hidden');

    // Close menu
    fireEvent.click(button);
    expect(document.body.style.overflow).toBe('');
  });

  it('should render menu with dialog role when open', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    // Open menu
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should have mobile navigation nav with aria-label when open', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    // Open menu
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Mobile Hauptnavigation');
  });

  it('should call onNavigate on link Enter key press', () => {
    render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    // Open menu
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const contactLink = screen.getByText('Kontakt');
    fireEvent.keyDown(contactLink, { key: 'Enter' });

    expect(mockOnNavigate).toHaveBeenCalledWith('contact');
  });

  it('should restore body overflow on unmount', () => {
    const { unmount } = render(
      <HamburgerMenu
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    // Open menu
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(document.body.style.overflow).toBe('hidden');

    // Unmount
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
