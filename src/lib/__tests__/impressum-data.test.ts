import { IMPRESSUM_DATA } from '../impressum-data';
import type { ImpressumData } from '../impressum-data';

describe('IMPRESSUM_DATA', () => {
  it('should contain all required fields', () => {
    const requiredKeys: (keyof ImpressumData)[] = [
      'companyName',
      'legalForm',
      'street',
      'zip',
      'city',
      'managingDirectors',
      'registryCourt',
      'registryNumber',
      'vatId',
      'email',
      'phone',
    ];

    for (const key of requiredKeys) {
      expect(IMPRESSUM_DATA).toHaveProperty(key);
    }
  });

  it('should have no empty string values for required string fields', () => {
    const requiredStringFields: (keyof ImpressumData)[] = [
      'companyName',
      'legalForm',
      'street',
      'zip',
      'city',
      'registryCourt',
      'registryNumber',
      'email',
      'phone',
    ];

    for (const key of requiredStringFields) {
      const value = IMPRESSUM_DATA[key];
      expect(typeof value).toBe('string');
      expect((value as string).trim()).not.toBe('');
    }
  });

  it('should have at least one managing director', () => {
    expect(Array.isArray(IMPRESSUM_DATA.managingDirectors)).toBe(true);
    expect(IMPRESSUM_DATA.managingDirectors.length).toBeGreaterThanOrEqual(1);
  });

  it('should have non-empty managing director names', () => {
    for (const director of IMPRESSUM_DATA.managingDirectors) {
      expect(typeof director).toBe('string');
      expect(director.trim()).not.toBe('');
    }
  });

  it('should have vatId as string or null', () => {
    expect(
      typeof IMPRESSUM_DATA.vatId === 'string' || IMPRESSUM_DATA.vatId === null
    ).toBe(true);
  });

  it('should satisfy the ImpressumData interface', () => {
    // TypeScript compile-time check: assigning to typed variable
    const data: ImpressumData = IMPRESSUM_DATA;
    expect(data).toBeDefined();
  });
});
