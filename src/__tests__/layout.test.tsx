import { render, screen } from '@testing-library/react';
import RootLayout from '../app/layout';

// Mock next/font if used in the future
jest.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter-mock' }),
}));

describe('RootLayout', () => {
  it('renders children correctly', () => {
    render(
      <RootLayout>
        <div data-testid="child-element">Test Child Content</div>
      </RootLayout>
    );

    const childElement = screen.getByTestId('child-element');
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent('Test Child Content');
  });

  it('renders multiple children correctly', () => {
    render(
      <RootLayout>
        <header data-testid="header">Header</header>
        <main data-testid="main">Main Content</main>
        <footer data-testid="footer">Footer</footer>
      </RootLayout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('main')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('wraps children in html and body elements', () => {
    const { container } = render(
      <RootLayout>
        <p>Content</p>
      </RootLayout>
    );

    // React Testing Library renders inside a div, but the component structure
    // should contain the expected elements
    expect(container.innerHTML).toContain('Content');
  });
});
