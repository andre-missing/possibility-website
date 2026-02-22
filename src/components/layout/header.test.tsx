import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import type { NavigationSection } from './types';

// Mock hooks
const mockScrollState = {
  isScrolled: false,
  scrollY: 0,
  scrollDirection: null as 'up' | 'down' | null,
};

const mockScrollToSection = jest.fn();
const mockScrollToTop = jest.fn();

jest.mock('@/hooks/useScrollState', () => ({
  useScrollState: () => mockScrollState,
}));

jest.mock('@/hooks/useActiveSection', () => ({
  useActiveSection: () => null,
}));

jest.mock('@/hooks/useSmoothScroll', () => ({
  useSmoothScroll: () => ({
    scrollToSection: mockScrollToSection,
    scrollToTop: mockScrollToTop,
  }),
}));

const mockSections: NavigationSection[] = [
  { id: 'about', href: '#about', label: 'Ueber uns' },
  { id: 'services', href: '#services', label: 'Leistungen' },
  { id: 'contact', href: '#contact', label: 'Kontakt' },
];

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScrollState.isScrolled = false;
    mockScrollState.scrollY = 0;
    mockScrollState.scrollDirection = null;

    // Mock matchMedia for HamburgerMenu component
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // REQ-007: Test dass Header ein <header>-Element rendert
  it('should render a <header> element', () => {
    render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
      />
    );

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe('HEADER');
  });

  it('should have role="banner"', () => {
    render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
      />
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('should render the Logo component', () => {
    render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/logo.svg');
    expect(img).toHaveAttribute('alt', 'Company Logo');
  });

  it('should render the Navigation component', () => {
    render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
      />
    );

    const nav = screen.getByRole('navigation', {
      name: 'Hauptnavigation',
    });
    expect(nav).toBeInTheDocument();
  });

  it('should render the HamburgerMenu toggle button', () => {
    render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
      />
    );

    const hamburgerButton = screen.getByRole('button', {
      name: 'Navigation oeffnen',
    });
    expect(hamburgerButton).toBeInTheDocument();
  });

  it('should apply bg-transparent class when not scrolled', () => {
    mockScrollState.isScrolled = false;

    render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
      />
    );

    const header = screen.getByRole('banner');
    expect(header.className).toContain('bg-transparent');
  });

  // Test dass Header-Komponente im Sticky-Zustand die CSS-Transition-Klasse traegt
  it('should apply sticky transition CSS class when scrolled', () => {
    mockScrollState.isScrolled = true;

    render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
      />
    );

    const header = screen.getByRole('banner');
    expect(header.className).toContain('bg-gray-950/95');
    expect(header.className).toContain('backdrop-blur-md');
    expect(header.className).toContain('shadow-lg');
  });

  it('should have sticky positioning', () => {
    render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
      />
    );

    const header = screen.getByRole('banner');
    expect(header.className).toContain('sticky');
    expect(header.className).toContain('top-0');
  });

  it('should have transition classes for smooth background change', () => {
    render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
      />
    );

    const header = screen.getByRole('banner');
    expect(header.className).toContain('transition-all');
    expect(header.className).toContain('duration-300');
  });

  it('should pass logoFallbackSrc to Logo component', () => {
    render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
        logoFallbackSrc="/logo.png"
      />
    );

    // Logo should render correctly
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  it('should apply additional className', () => {
    render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
        className="custom-header"
      />
    );

    const header = screen.getByRole('banner');
    expect(header.className).toContain('custom-header');
  });

  it('should contain max-width container', () => {
    const { container } = render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
      />
    );

    const wrapper = container.querySelector('.max-w-7xl');
    expect(wrapper).toBeInTheDocument();
  });

  it('should have flex layout for logo and navigation', () => {
    const { container } = render(
      <Header
        sections={mockSections}
        logoSrc="/logo.svg"
        logoAlt="Company Logo"
      />
    );

    const flexContainer = container.querySelector(
      '.flex.items-center.justify-between'
    );
    expect(flexContainer).toBeInTheDocument();
  });
});
