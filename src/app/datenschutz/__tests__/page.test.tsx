import { render, screen } from '@testing-library/react';
import DatenschutzPage from '../page';

describe('DatenschutzPage', () => {
  it('should render the page with a main element', () => {
    render(<DatenschutzPage />);

    expect(document.querySelector('main')).toBeInTheDocument();
  });

  it('should render the "Datenschutzerklärung" heading', () => {
    render(<DatenschutzPage />);

    // Use exact match to avoid matching "Änderungen dieser Datenschutzerklärung"
    expect(
      screen.getByRole('heading', { name: 'Datenschutzerklärung' })
    ).toBeInTheDocument();
  });

  it('should render the table of contents', () => {
    render(<DatenschutzPage />);

    expect(
      screen.getByRole('navigation', { name: 'Inhaltsverzeichnis' })
    ).toBeInTheDocument();
  });

  it('should contain all mandatory sections', () => {
    const { container } = render(<DatenschutzPage />);

    // Check for required section IDs (anchor targets)
    expect(container.querySelector('#verantwortlicher')).toBeInTheDocument();
    expect(container.querySelector('#rechtsgrundlagen')).toBeInTheDocument();
    expect(container.querySelector('#betroffenenrechte')).toBeInTheDocument();
    expect(container.querySelector('#server-logfiles')).toBeInTheDocument();
    expect(container.querySelector('#kontaktformular')).toBeInTheDocument();
    expect(container.querySelector('#cookies')).toBeInTheDocument();
  });

  it('should display the last updated date', () => {
    render(<DatenschutzPage />);

    expect(screen.getByText(/Stand:/i)).toBeInTheDocument();
    expect(screen.getByText(/Februar 2026/i)).toBeInTheDocument();
  });
});
