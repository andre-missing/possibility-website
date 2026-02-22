import { render, screen, fireEvent } from '@testing-library/react';
import PrivacyCheckbox from '../PrivacyCheckbox';

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

describe('PrivacyCheckbox', () => {
  it('should render unchecked by default when checked=false', () => {
    render(<PrivacyCheckbox checked={false} onChange={jest.fn()} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked when checked=true', () => {
    render(<PrivacyCheckbox checked={true} onChange={jest.fn()} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onChange with correct value when clicked', () => {
    const handleChange = jest.fn();
    render(<PrivacyCheckbox checked={false} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('should call onChange with false when unchecked', () => {
    const handleChange = jest.fn();
    render(<PrivacyCheckbox checked={true} onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('should contain a link to /datenschutz', () => {
    render(<PrivacyCheckbox checked={false} onChange={jest.fn()} />);

    const link = screen.getByRole('link', { name: 'Datenschutzerklärung' });
    expect(link).toHaveAttribute('href', '/datenschutz');
  });

  it('should display an error message when error prop is provided', () => {
    render(
      <PrivacyCheckbox
        checked={false}
        onChange={jest.fn()}
        error="Bitte stimmen Sie der Datenschutzerklärung zu."
      />
    );

    expect(
      screen.getByText('Bitte stimmen Sie der Datenschutzerklärung zu.')
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should not display an error message when error prop is not provided', () => {
    render(<PrivacyCheckbox checked={false} onChange={jest.fn()} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should set aria-invalid when error is present', () => {
    render(
      <PrivacyCheckbox
        checked={false}
        onChange={jest.fn()}
        error="Error message"
      />
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  });
});
