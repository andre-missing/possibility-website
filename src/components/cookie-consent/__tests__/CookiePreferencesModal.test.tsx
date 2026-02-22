import { render, screen, fireEvent } from '@testing-library/react';
import CookiePreferencesModal from '../CookiePreferencesModal';
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

function renderModal(isOpen: boolean, onClose = jest.fn()) {
  return render(
    <CookieConsentProvider>
      <CookiePreferencesModal isOpen={isOpen} onClose={onClose} />
    </CookieConsentProvider>
  );
}

describe('CookiePreferencesModal', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    renderModal(false);

    expect(
      screen.queryByRole('dialog', { name: /Cookie-Einstellungen/i })
    ).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    renderModal(true);

    expect(
      screen.getByRole('dialog', { name: /Cookie-Einstellungen/i })
    ).toBeInTheDocument();
  });

  it('should display all cookie categories', () => {
    renderModal(true);

    expect(screen.getByText('Essenzielle Cookies')).toBeInTheDocument();
    expect(screen.getByText('Funktionale Cookies')).toBeInTheDocument();
    expect(screen.getByText('Analyse & Tracking')).toBeInTheDocument();
  });

  it('should have essential cookies checkbox disabled and checked', () => {
    renderModal(true);

    const essentialCheckbox = screen.getByRole('checkbox', {
      name: /Essenzielle Cookies/i,
    });
    expect(essentialCheckbox).toBeChecked();
    expect(essentialCheckbox).toBeDisabled();
  });

  it('should have functional cookies checkbox enabled and unchecked by default', () => {
    renderModal(true);

    const functionalCheckbox = screen.getByRole('checkbox', {
      name: /Funktionale Cookies/i,
    });
    expect(functionalCheckbox).not.toBeChecked();
    expect(functionalCheckbox).not.toBeDisabled();
  });

  it('should have a save button', () => {
    renderModal(true);

    expect(
      screen.getByRole('button', { name: /Einstellungen speichern/i })
    ).toBeInTheDocument();
  });

  it('should have a cancel button', () => {
    renderModal(true);

    expect(
      screen.getByRole('button', { name: /Abbrechen/i })
    ).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    const onClose = jest.fn();
    renderModal(true, onClose);

    fireEvent.click(screen.getByRole('button', { name: /Abbrechen/i }));

    expect(onClose).toHaveBeenCalled();
  });

  it('should save preferences when save button is clicked', () => {
    renderModal(true);

    // Toggle analytics
    const analyticsCheckbox = screen.getByRole('checkbox', {
      name: /Analyse & Tracking/i,
    });
    fireEvent.click(analyticsCheckbox);

    // Save
    fireEvent.click(
      screen.getByRole('button', { name: /Einstellungen speichern/i })
    );

    // Verify saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cookie_consent',
      expect.any(String)
    );
  });

  it('should have a close button', () => {
    renderModal(true);

    expect(
      screen.getByRole('button', { name: /Schließen/i })
    ).toBeInTheDocument();
  });
});
