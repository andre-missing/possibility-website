import { render, screen } from '@testing-library/react';
import TableOfContents from '../TableOfContents';
import type { DatenschutzSection } from '@/content/datenschutz-types';

const mockSections: DatenschutzSection[] = [
  {
    id: 'verantwortlicher',
    level: 1,
    title: 'Verantwortlicher',
    content: '<p>Content</p>',
  },
  {
    id: 'rechtsgrundlagen',
    level: 1,
    title: 'Rechtsgrundlagen',
    content: '<p>Content</p>',
  },
  {
    id: 'cookies',
    level: 1,
    title: 'Cookies',
    content: '<p>Content</p>',
    subsections: [
      {
        id: 'essenzielle-cookies',
        level: 2,
        title: 'Essenzielle Cookies',
        content: '<p>Content</p>',
      },
      {
        id: 'analyse-cookies',
        level: 2,
        title: 'Analyse-Cookies',
        content: '<p>Content</p>',
      },
    ],
  },
];

describe('TableOfContents', () => {
  it('should render an "Inhaltsverzeichnis" heading', () => {
    render(<TableOfContents sections={mockSections} />);

    expect(
      screen.getByRole('heading', { name: 'Inhaltsverzeichnis' })
    ).toBeInTheDocument();
  });

  it('should render navigation with aria-label', () => {
    render(<TableOfContents sections={mockSections} />);

    const nav = screen.getByRole('navigation', {
      name: 'Inhaltsverzeichnis',
    });
    expect(nav).toBeInTheDocument();
  });

  it('should generate correct anchor links for top-level sections', () => {
    render(<TableOfContents sections={mockSections} />);

    const verantwortlicherLink = screen.getByRole('link', {
      name: 'Verantwortlicher',
    });
    expect(verantwortlicherLink).toHaveAttribute('href', '#verantwortlicher');

    const rechtsgrundlagenLink = screen.getByRole('link', {
      name: 'Rechtsgrundlagen',
    });
    expect(rechtsgrundlagenLink).toHaveAttribute('href', '#rechtsgrundlagen');
  });

  it('should generate correct anchor links for subsections', () => {
    render(<TableOfContents sections={mockSections} />);

    const essenziellLink = screen.getByRole('link', {
      name: 'Essenzielle Cookies',
    });
    expect(essenziellLink).toHaveAttribute('href', '#essenzielle-cookies');

    const analyseLink = screen.getByRole('link', {
      name: 'Analyse-Cookies',
    });
    expect(analyseLink).toHaveAttribute('href', '#analyse-cookies');
  });

  it('should render all section titles as links', () => {
    render(<TableOfContents sections={mockSections} />);

    const links = screen.getAllByRole('link');
    // 3 top-level + 2 subsections = 5 links
    expect(links).toHaveLength(5);
  });

  it('should handle sections without subsections', () => {
    const simpleSections: DatenschutzSection[] = [
      {
        id: 'simple',
        level: 1,
        title: 'Simple Section',
        content: '<p>Content</p>',
      },
    ];

    render(<TableOfContents sections={simpleSections} />);

    expect(
      screen.getByRole('link', { name: 'Simple Section' })
    ).toHaveAttribute('href', '#simple');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });
});
