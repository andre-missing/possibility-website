import { datenschutzContent } from '../datenschutz';
import type { DatenschutzSection } from '../datenschutz-types';

describe('datenschutzContent', () => {
  it('should have a valid ISO-8601 lastUpdated date', () => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect(datenschutzContent.lastUpdated).toMatch(isoDateRegex);

    // Ensure it parses to a valid date
    const date = new Date(datenschutzContent.lastUpdated);
    expect(date.toString()).not.toBe('Invalid Date');
  });

  it('should have a displayDate in "Monat Jahr" format', () => {
    const germanMonths = [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember',
    ];
    const parts = datenschutzContent.displayDate.split(' ');
    expect(parts).toHaveLength(2);
    expect(germanMonths).toContain(parts[0]);
    expect(parseInt(parts[1], 10)).toBeGreaterThanOrEqual(2024);
  });

  it('should have a version string', () => {
    expect(datenschutzContent.version).toBeTruthy();
    expect(typeof datenschutzContent.version).toBe('string');
  });

  it('should contain all mandatory DSGVO sections', () => {
    const allSectionIds = getAllSectionIds(datenschutzContent.sections);

    // Required sections per DSGVO Art. 13/14
    expect(allSectionIds).toContain('verantwortlicher');
    expect(allSectionIds).toContain('rechtsgrundlagen');
    expect(allSectionIds).toContain('betroffenenrechte');
    expect(allSectionIds).toContain('server-logfiles');
    expect(allSectionIds).toContain('kontaktformular');
    expect(allSectionIds).toContain('cookies');
  });

  it('should have responsible party information', () => {
    expect(datenschutzContent.responsible.companyName).toBe('possibility GmbH');
    expect(datenschutzContent.responsible.email).toBeTruthy();
    expect(datenschutzContent.responsible.phone).toBeTruthy();
    expect(datenschutzContent.responsible.address).toBeTruthy();
  });

  it('should have sections with valid structure', () => {
    for (const section of datenschutzContent.sections) {
      expect(section.id).toBeTruthy();
      expect(section.title).toBeTruthy();
      expect(section.content).toBeTruthy();
      expect(section.level).toBeGreaterThanOrEqual(1);
      expect(section.level).toBeLessThanOrEqual(3);
    }
  });

  it('should have URL-safe section IDs', () => {
    const allSections = flattenSections(datenschutzContent.sections);
    const urlSafeRegex = /^[a-z0-9-]+$/;

    for (const section of allSections) {
      expect(section.id).toMatch(urlSafeRegex);
    }
  });
});

function getAllSectionIds(sections: DatenschutzSection[]): string[] {
  const ids: string[] = [];
  for (const section of sections) {
    ids.push(section.id);
    if (section.subsections) {
      ids.push(...getAllSectionIds(section.subsections));
    }
  }
  return ids;
}

function flattenSections(sections: DatenschutzSection[]): DatenschutzSection[] {
  const flat: DatenschutzSection[] = [];
  for (const section of sections) {
    flat.push(section);
    if (section.subsections) {
      flat.push(...flattenSections(section.subsections));
    }
  }
  return flat;
}
