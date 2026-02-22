export interface DataProtectionOfficer {
  name: string;
  email: string;
  phone: string | null;
}

export interface ResponsibleParty {
  companyName: string;
  address: string;
  email: string;
  phone: string;
  dataProtectionOfficer: DataProtectionOfficer | null;
}

export interface DatenschutzSection {
  /** URL-safe slug for anchor links */
  id: string;
  /** Heading level 1-3 (maps to h1-h3) */
  level: number;
  title: string;
  /** HTML content for the section */
  content: string;
  /** Optional nested subsections */
  subsections?: DatenschutzSection[];
}

export interface DatenschutzData {
  /** Version number, e.g. '1.0.0' */
  version: string;
  /** ISO-8601 date string, e.g. '2026-02-01' */
  lastUpdated: string;
  /** Display date, e.g. 'Februar 2026' */
  displayDate: string;
  responsible: ResponsibleParty;
  sections: DatenschutzSection[];
}
