/**
 * Typisierte Datendefinition fuer alle Impressum-Pflichtangaben gemaess § 5 TMG.
 * Trennt Inhalt von Darstellung, sodass Textaenderungen ohne Strukturaenderung moeglich sind.
 */

/** Pflichtangaben fuer das Impressum gemaess § 5 TMG */
export interface ImpressumData {
  /** Vollstaendiger Firmenname ohne Rechtsform */
  companyName: string;
  /** Rechtsform (z.B. 'GmbH') */
  legalForm: string;
  /** Strasse und Hausnummer */
  street: string;
  /** Postleitzahl */
  zip: string;
  /** Ort */
  city: string;
  /** Name(n) der Geschaeftsfuehrer */
  managingDirectors: string[];
  /** Registergericht (z.B. 'Amtsgericht Muenchen') */
  registryCourt: string;
  /** Handelsregisternummer (z.B. 'HRB 123456') */
  registryNumber: string;
  /** USt-IdNr., null falls nicht vorhanden */
  vatId: string | null;
  /** Kontakt-E-Mail-Adresse */
  email: string;
  /** Kontakt-Telefonnummer */
  phone: string;
}

/** Konkrete Impressum-Daten mit Platzhalter-Werten, die durch den Auftraggeber ersetzt werden */
export const IMPRESSUM_DATA: ImpressumData = {
  companyName: '[AUFTRAGGEBER_LIEFERT] possibility',
  legalForm: 'GmbH',
  street: '[AUFTRAGGEBER_LIEFERT] Musterstraße 1',
  zip: '[AUFTRAGGEBER_LIEFERT] 12345',
  city: '[AUFTRAGGEBER_LIEFERT] Musterstadt',
  managingDirectors: ['[AUFTRAGGEBER_LIEFERT] Max Mustermann'],
  registryCourt: '[AUFTRAGGEBER_LIEFERT] Amtsgericht Musterstadt',
  registryNumber: '[AUFTRAGGEBER_LIEFERT] HRB 123456',
  vatId: '[AUFTRAGGEBER_LIEFERT] DE123456789',
  email: '[AUFTRAGGEBER_LIEFERT] kontakt@possibility.gmbh',
  phone: '[AUFTRAGGEBER_LIEFERT] +49 (0) 123 456789-0',
};
