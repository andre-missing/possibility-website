import { render, screen } from '@testing-library/react';
import Footer, { FOOTER_LEGAL_LINKS } from '../Footer';
import { CookieConsentProvider } from '@/components/cookie-consent/CookieConsentContext';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

function renderWithProvider() {
  return render(
    <CookieConsentProvider>
      <Footer />
    </CookieConsentProvider>
  );
}

describe('Footer', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should render a footer element', () => {
    renderWithProvider();

    expect(document.querySelector('footer')).toBeInTheDocument();
  });

  it('should contain a "Datenschutzerklärung" link', () => {
    renderWithProvider();

    const link = screen.getByRole('link', {
      name: /Datenschutzerklärung/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/datenschutz');
  });

  it('should contain an "Impressum" link with href="/impressum"', () => {
    renderWithProvider();

    const link = screen.getByRole('link', {
      name: /^Impressum$/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/impressum');
  });

  it('should contain a "Cookie-Einstellungen" button', () => {
    renderWithProvider();

    expect(
      screen.getByRole('button', { name: /Cookie-Einstellungen/i })
    ).toBeInTheDocument();
  });

  it('should display copyright information', () => {
    renderWithProvider();

    expect(screen.getByText(/possibility GmbH/i)).toBeInTheDocument();
  });

  it('should have footer navigation with aria-label', () => {
    renderWithProvider();

    expect(
      screen.getByRole('navigation', { name: 'Footer-Navigation' })
    ).toBeInTheDocument();
  });

  it('should have border-top styling', () => {
    renderWithProvider();

    const footer = document.querySelector('footer');
    expect(footer).toHaveClass('border-t');
  });
});

describe('FOOTER_LEGAL_LINKS', () => {
  it('should be an array with at least one entry', () => {
    expect(Array.isArray(FOOTER_LEGAL_LINKS)).toBe(true);
    expect(FOOTER_LEGAL_LINKS.length).toBeGreaterThanOrEqual(1);
  });

  it('should contain an Impressum link with href "/impressum"', () => {
    const impressumLink = FOOTER_LEGAL_LINKS.find(
      (link) => link.label === 'Impressum'
    );
    expect(impressumLink).toBeDefined();
    expect(impressumLink!.href).toBe('/impressum');
  });

  it('should contain a Datenschutzerklaerung link with href "/datenschutz"', () => {
    const datenschutzLink = FOOTER_LEGAL_LINKS.find(
      (link) => link.label === 'Datenschutzerklärung'
    );
    expect(datenschutzLink).toBeDefined();
    expect(datenschutzLink!.href).toBe('/datenschutz');
  });

  it('should have href and label as non-empty strings for each entry', () => {
    for (const link of FOOTER_LEGAL_LINKS) {
      expect(typeof link.href).toBe('string');
      expect(link.href.trim()).not.toBe('');
      expect(typeof link.label).toBe('string');
      expect(link.label.trim()).not.toBe('');
    }
  });
});
