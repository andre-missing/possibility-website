import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from './Navigation';
import type { NavigationSection } from './types';

const mockSections: NavigationSection[] = [
  { id: 'about', href: '#about', label: 'Ueber uns' },
  { id: 'services', href: '#services', label: 'Leistungen' },
  { id: 'contact', href: '#contact', label: 'Kontakt' },
];

describe('Navigation', () => {
  let mockOnNavigate: jest.Mock;

  beforeEach(() => {
    mockOnNavigate = jest.fn();
  });

  // REQ-007: Test dass Navigation ein <nav>-Element rendert
  it('should render a <nav> element', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });

  // REQ-007: Test dass Navigation ein <nav>-Element mit aria-label rendert
  it('should have aria-label on <nav>', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Hauptnavigation');
  });

  // REQ-002: Test dass Navigation fuer jede uebergebene Section einen Link rendert
  it('should render a link for each section', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    expect(screen.getByText('Ueber uns')).toBeInTheDocument();
    expect(screen.getByText('Leistungen')).toBeInTheDocument();
    expect(screen.getByText('Kontakt')).toBeInTheDocument();
  });

  // REQ-002: Test dass Navigation.onNavigate mit korrekter sectionId aufgerufen wird bei Klick
  it('should call onNavigate with correct sectionId on click', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const aboutLink = screen.getByText('Ueber uns');
    fireEvent.click(aboutLink);

    expect(mockOnNavigate).toHaveBeenCalledWith('about');
  });

  // REQ-006: Test dass Enter-Taste auf Navigationslink onNavigate ausloest
  it('should call onNavigate on Enter key press', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const servicesLink = screen.getByText('Leistungen');
    fireEvent.keyDown(servicesLink, { key: 'Enter' });

    expect(mockOnNavigate).toHaveBeenCalledWith('services');
  });

  // REQ-005: Test dass Navigation aria-current='page' auf dem aktiven Link setzt
  it('should set aria-current="page" on the active link', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId="services"
        onNavigate={mockOnNavigate}
      />
    );

    const activeLink = screen.getByText('Leistungen');
    expect(activeLink).toHaveAttribute('aria-current', 'page');

    // Other links should NOT have aria-current
    const aboutLink = screen.getByText('Ueber uns');
    expect(aboutLink).not.toHaveAttribute('aria-current');

    const contactLink = screen.getByText('Kontakt');
    expect(contactLink).not.toHaveAttribute('aria-current');
  });

  // REQ-005: Test dass Navigation den aktiven Link visuell hervorhebt (CSS-Klasse)
  it('should visually highlight the active link with CSS class', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId="about"
        onNavigate={mockOnNavigate}
      />
    );

    const activeLink = screen.getByText('Ueber uns');
    expect(activeLink.className).toContain('text-blue-400');
    expect(activeLink.className).toContain('bg-blue-600/10');
  });

  it('should apply default style to inactive links', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId="about"
        onNavigate={mockOnNavigate}
      />
    );

    const inactiveLink = screen.getByText('Leistungen');
    expect(inactiveLink.className).toContain('text-gray-300');
  });

  it('should prevent default anchor behavior on click', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const link = screen.getByText('Ueber uns');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

    link.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should render links with correct href attributes', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const aboutLink = screen.getByText('Ueber uns');
    expect(aboutLink).toHaveAttribute('href', '#about');

    const servicesLink = screen.getByText('Leistungen');
    expect(servicesLink).toHaveAttribute('href', '#services');
  });

  // REQ-006: Test dass alle interaktiven Elemente per Tab fokussierbar sind
  it('all links should be focusable (no negative tabIndex)', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).not.toHaveAttribute('tabindex', '-1');
    });
  });

  it('should apply additional className', () => {
    render(
      <Navigation
        sections={mockSections}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
        className="extra-class"
      />
    );

    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('extra-class');
  });

  it('should render empty list when no sections provided', () => {
    render(
      <Navigation
        sections={[]}
        activeSectionId={null}
        onNavigate={mockOnNavigate}
      />
    );

    const links = screen.queryAllByRole('link');
    expect(links).toHaveLength(0);
  });
});
