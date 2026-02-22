import { render, screen, fireEvent } from '@testing-library/react';
import CookieConsentBanner from '../CookieConsentBanner';
import { CookieConsentProvider } from '../CookieConsentContext';

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
      <CookieConsentBanner />
    </CookieConsentProvider>
  );
}

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should render the banner when no consent has been given', () => {
    renderWithProvider();

    expect(
      screen.getByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).toBeInTheDocument();
  });

  it('should display the "Alle akzeptieren" button', () => {
    renderWithProvider();

    expect(
      screen.getByRole('button', { name: /Alle akzeptieren/i })
    ).toBeInTheDocument();
  });

  it('should display the "Nur essenzielle Cookies" button', () => {
    renderWithProvider();

    expect(
      screen.getByRole('button', { name: /Nur essenzielle Cookies/i })
    ).toBeInTheDocument();
  });

  it('should display the "Einstellungen anpassen" button', () => {
    renderWithProvider();

    expect(
      screen.getByRole('button', { name: /Einstellungen anpassen/i })
    ).toBeInTheDocument();
  });

  it('should contain a link to the privacy policy', () => {
    renderWithProvider();

    const link = screen.getByRole('link', { name: /Mehr erfahren/i });
    expect(link).toHaveAttribute('href', '/datenschutz');
  });

  it('should hide the banner after accepting all cookies', () => {
    renderWithProvider();

    const acceptButton = screen.getByRole('button', {
      name: /Alle akzeptieren/i,
    });
    fireEvent.click(acceptButton);

    expect(
      screen.queryByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).not.toBeInTheDocument();
  });

  it('should hide the banner after accepting only essential cookies', () => {
    renderWithProvider();

    const essentialButton = screen.getByRole('button', {
      name: /Nur essenzielle Cookies/i,
    });
    fireEvent.click(essentialButton);

    expect(
      screen.queryByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).not.toBeInTheDocument();
  });

  it('should not render the banner when consent already exists', () => {
    // Pre-set consent
    localStorageMock.setItem(
      'cookie_consent',
      JSON.stringify({
        essential: true,
        functional: false,
        analytics: false,
        consentTimestamp: '2026-02-01T00:00:00.000Z',
        consentVersion: '1.0.0',
      })
    );

    renderWithProvider();

    // Banner should still not appear (after useEffect runs)
    // Note: Due to useEffect timing, the banner may flash initially,
    // but functionally the hasConsented state will be true after mount
    expect(
      screen.queryByRole('dialog', { name: /Cookie-Einwilligung/i })
    ).not.toBeInTheDocument();
  });
});
