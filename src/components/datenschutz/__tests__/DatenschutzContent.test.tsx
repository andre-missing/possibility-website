import { render, screen } from '@testing-library/react';
import DatenschutzContent from '../DatenschutzContent';
import type { DatenschutzData } from '@/content/datenschutz-types';

const mockContent: DatenschutzData = {
  version: '1.0.0',
  lastUpdated: '2026-02-01',
  displayDate: 'Februar 2026',
  responsible: {
    companyName: 'possibility GmbH',
    address: 'Musterstraße 1, 12345 Musterstadt',
    email: 'datenschutz@possibility.gmbh',
    phone: '+49 123 456789',
    dataProtectionOfficer: null,
  },
  sections: [
    {
      id: 'verantwortlicher',
      level: 1,
      title: 'Verantwortlicher',
      content: '<p>Test content for responsible party</p>',
    },
    {
      id: 'rechtsgrundlagen',
      level: 1,
      title: 'Rechtsgrundlagen',
      content: '<p>Test content for legal basis</p>',
      subsections: [
        {
          id: 'einwilligung',
          level: 2,
          title: 'Einwilligung',
          content: '<p>Consent details</p>',
        },
      ],
    },
  ],
};

describe('DatenschutzContent', () => {
  it('should render the main heading "Datenschutzerklärung"', () => {
    render(<DatenschutzContent content={mockContent} />);

    expect(
      screen.getByRole('heading', { name: /Datenschutzerklärung/i })
    ).toBeInTheDocument();
  });

  it('should display the version and date', () => {
    render(<DatenschutzContent content={mockContent} />);

    expect(
      screen.getByText(/Stand: Februar 2026 \(Version 1\.0\.0\)/i)
    ).toBeInTheDocument();
  });

  it('should render the table of contents', () => {
    render(<DatenschutzContent content={mockContent} />);

    expect(
      screen.getByRole('navigation', { name: 'Inhaltsverzeichnis' })
    ).toBeInTheDocument();
  });

  it('should render all top-level sections', () => {
    render(<DatenschutzContent content={mockContent} />);

    // Section titles appear in both TOC and section headings
    const verantwortlicherElements = screen.getAllByText('Verantwortlicher');
    expect(verantwortlicherElements.length).toBeGreaterThanOrEqual(1);

    const rechtsgrundlagenElements = screen.getAllByText('Rechtsgrundlagen');
    expect(rechtsgrundlagenElements.length).toBeGreaterThanOrEqual(1);
  });

  it('should render subsections', () => {
    render(<DatenschutzContent content={mockContent} />);

    // "Einwilligung" appears in both TOC link and section heading
    const elements = screen.getAllByText('Einwilligung');
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it('should render section content as HTML', () => {
    render(<DatenschutzContent content={mockContent} />);

    expect(
      screen.getByText('Test content for responsible party')
    ).toBeInTheDocument();
  });

  it('should wrap content in an article element', () => {
    const { container } = render(<DatenschutzContent content={mockContent} />);

    expect(container.querySelector('article')).toBeInTheDocument();
  });
});
