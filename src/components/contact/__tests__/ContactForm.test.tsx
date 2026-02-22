import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from '../ContactForm';

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

describe('ContactForm', () => {
  it('should render the form with all required fields', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nachricht/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should have the privacy checkbox unchecked by default', () => {
    render(<ContactForm />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should not submit the form without the privacy checkbox checked', () => {
    render(<ContactForm />);

    // Fill in all fields except privacy consent
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Nachricht/i), {
      target: { value: 'Test message' },
    });

    // Try to submit
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    // Should show error, not success
    expect(
      screen.getByText(/Bitte stimmen Sie der Datenschutzerklärung zu/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Vielen Dank für Ihre Nachricht/i)
    ).not.toBeInTheDocument();
  });

  it('should submit successfully when all fields are filled and privacy checkbox is checked', () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Nachricht/i), {
      target: { value: 'Test message' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    expect(
      screen.getByText(/Vielen Dank für Ihre Nachricht/i)
    ).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields', () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    expect(
      screen.getByText(/Bitte geben Sie Ihren Namen ein/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Bitte geben Sie Ihre E-Mail-Adresse ein/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Bitte geben Sie eine Nachricht ein/i)
    ).toBeInTheDocument();
  });

  it('should show validation error for invalid email format', () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Test' },
    });
    fireEvent.change(screen.getByLabelText(/E-Mail/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByLabelText(/Nachricht/i), {
      target: { value: 'Test' },
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Nachricht senden/i }));

    expect(
      screen.getByText(/Bitte geben Sie eine gültige E-Mail-Adresse ein/i)
    ).toBeInTheDocument();
  });

  it('should contain a link to /datenschutz in the privacy checkbox', () => {
    render(<ContactForm />);

    const link = screen.getByRole('link', { name: 'Datenschutzerklärung' });
    expect(link).toHaveAttribute('href', '/datenschutz');
  });
});
