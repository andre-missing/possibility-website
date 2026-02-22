import { render, screen } from '@testing-library/react';
import ImpressumPage, { metadata } from '../page';
import { IMPRESSUM_DATA } from '@/lib/impressum-data';

describe('ImpressumPage', () => {
  it('should render a main element', () => {
    render(<ImpressumPage />);

    expect(document.querySelector('main')).toBeInTheDocument();
  });

  it('should render the heading "Impressum"', () => {
    render(<ImpressumPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Impressum' })
    ).toBeInTheDocument();
  });

  it('should render companyName and legalForm', () => {
    render(<ImpressumPage />);

    // companyName and legalForm are in the same <p> but as separate text nodes
    const section = screen.getByLabelText('Firmenangaben');
    expect(section.textContent).toContain(IMPRESSUM_DATA.companyName);
    expect(section.textContent).toContain(IMPRESSUM_DATA.legalForm);
  });

  it('should render the address (street, zip, city)', () => {
    render(<ImpressumPage />);

    const section = screen.getByLabelText('Firmenangaben');
    expect(section.textContent).toContain(IMPRESSUM_DATA.street);
    expect(section.textContent).toContain(IMPRESSUM_DATA.zip);
    expect(section.textContent).toContain(IMPRESSUM_DATA.city);
  });

  it('should render at least one managing director', () => {
    render(<ImpressumPage />);

    const section = screen.getByLabelText('Vertretungsberechtigte');
    expect(section.textContent).toContain(IMPRESSUM_DATA.managingDirectors[0]);
  });

  it('should render multiple managing directors as a list when more than one', () => {
    // Mock data with multiple directors for this test
    const originalDirectors = IMPRESSUM_DATA.managingDirectors;
    const multipleDirectors = ['Director A', 'Director B', 'Director C'];

    // Temporarily replace
    Object.defineProperty(IMPRESSUM_DATA, 'managingDirectors', {
      value: multipleDirectors,
      writable: true,
      configurable: true,
    });

    render(<ImpressumPage />);

    for (const director of multipleDirectors) {
      expect(screen.getByText(director)).toBeInTheDocument();
    }

    // Verify list items exist
    const listItems = document.querySelectorAll('li');
    expect(listItems.length).toBeGreaterThanOrEqual(multipleDirectors.length);

    // Restore
    Object.defineProperty(IMPRESSUM_DATA, 'managingDirectors', {
      value: originalDirectors,
      writable: true,
      configurable: true,
    });
  });

  it('should render registry court and registry number', () => {
    render(<ImpressumPage />);

    const section = screen.getByLabelText('Registerdaten');
    expect(section.textContent).toContain(IMPRESSUM_DATA.registryCourt);
    expect(section.textContent).toContain(IMPRESSUM_DATA.registryNumber);
  });

  it('should render email as a mailto link', () => {
    render(<ImpressumPage />);

    const emailLink = screen.getByRole('link', {
      name: IMPRESSUM_DATA.email,
    });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', `mailto:${IMPRESSUM_DATA.email}`);
  });

  it('should render phone as a tel link', () => {
    render(<ImpressumPage />);

    const phoneLink = screen.getByRole('link', {
      name: IMPRESSUM_DATA.phone,
    });
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink).toHaveAttribute('href', expect.stringContaining('tel:'));
  });

  it('should render the USt-IdNr. when vatId is set', () => {
    render(<ImpressumPage />);

    // IMPRESSUM_DATA has a vatId placeholder value
    if (IMPRESSUM_DATA.vatId !== null) {
      const section = screen.getByLabelText('Umsatzsteuer-ID');
      expect(section.textContent).toContain(IMPRESSUM_DATA.vatId);
      expect(
        screen.getByRole('heading', {
          name: /Umsatzsteuer-Identifikationsnummer/i,
        })
      ).toBeInTheDocument();
    }
  });

  it('should NOT render the USt-IdNr. section when vatId is null', () => {
    const originalVatId = IMPRESSUM_DATA.vatId;

    // Temporarily set vatId to null
    Object.defineProperty(IMPRESSUM_DATA, 'vatId', {
      value: null,
      writable: true,
      configurable: true,
    });

    render(<ImpressumPage />);

    expect(screen.queryByLabelText('Umsatzsteuer-ID')).not.toBeInTheDocument();

    // Restore
    Object.defineProperty(IMPRESSUM_DATA, 'vatId', {
      value: originalVatId,
      writable: true,
      configurable: true,
    });
  });

  it('should not have "use client" directive (is a Server Component)', async () => {
    // Read the source file to verify it does not contain 'use client'
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '..', 'page.tsx');
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).not.toContain("'use client'");
    expect(content).not.toContain('"use client"');
  });
});

describe('ImpressumPage metadata', () => {
  it('should export metadata with title containing "Impressum"', () => {
    expect(metadata).toBeDefined();
    expect(metadata.title).toContain('Impressum');
  });

  it('should export metadata with description', () => {
    expect(metadata).toBeDefined();
    expect(typeof metadata.description).toBe('string');
    expect(metadata.description!.length).toBeGreaterThan(0);
  });

  it('should export metadata with robots noindex', () => {
    expect(metadata).toBeDefined();
    expect(metadata.robots).toBe('noindex');
  });
});
