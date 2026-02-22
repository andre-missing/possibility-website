import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';

describe('HomePage', () => {
  it('renders without errors', () => {
    render(<HomePage />);

    // The page should render without throwing
    expect(document.querySelector('main')).toBeInTheDocument();
  });

  it('displays the company name as heading', () => {
    render(<HomePage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('possibility GmbH');
  });

  it('displays the company tagline', () => {
    render(<HomePage />);

    expect(
      screen.getByText(
        /Ihr Partner für innovative Lösungen und digitale Transformation/i
      )
    ).toBeInTheDocument();
  });

  it('has a main element as root container', () => {
    render(<HomePage />);

    const mainElement = document.querySelector('main');
    expect(mainElement).toBeInTheDocument();
  });

  it('applies Tailwind utility classes for layout', () => {
    render(<HomePage />);

    const mainElement = document.querySelector('main');
    expect(mainElement).toHaveClass('flex');
    expect(mainElement).toHaveClass('min-h-screen');
    expect(mainElement).toHaveClass('items-center');
    expect(mainElement).toHaveClass('justify-center');
  });
});
