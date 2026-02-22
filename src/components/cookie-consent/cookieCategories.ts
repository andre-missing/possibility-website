import type { CookieCategoryDefinition } from './types';

export const COOKIE_CATEGORIES: CookieCategoryDefinition[] = [
  {
    id: 'essential',
    label: 'Essenzielle Cookies',
    description:
      'Diese Cookies sind für den Betrieb der Website technisch notwendig und können nicht deaktiviert werden.',
    required: true,
    cookies: [
      {
        name: 'cookie_consent',
        type: 'Local Storage',
        purpose: 'Speichert Ihre Cookie-Einwilligungspräferenzen',
        duration: 'Dauerhaft (bis zur manuellen Löschung)',
        provider: 'possibility GmbH',
      },
    ],
  },
  {
    id: 'functional',
    label: 'Funktionale Cookies',
    description:
      'Funktionale Cookies ermöglichen erweiterte Funktionalität und Personalisierung, z.B. Spracheinstellungen oder Darstellungspräferenzen.',
    required: false,
    cookies: [
      {
        name: 'language_preference',
        type: 'Local Storage',
        purpose: 'Speichert Ihre bevorzugte Sprache',
        duration: '1 Jahr',
        provider: 'possibility GmbH',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analyse & Tracking',
    description:
      'Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem Informationen gesammelt und gemeldet werden.',
    required: false,
    cookies: [
      {
        name: '_ga',
        type: 'HTTP Cookie',
        purpose: 'Registriert eine eindeutige ID für Google Analytics',
        duration: '2 Jahre',
        provider: 'Google LLC',
      },
      {
        name: '_ga_*',
        type: 'HTTP Cookie',
        purpose: 'Wird von Google Analytics zum Sammeln von Daten verwendet',
        duration: '2 Jahre',
        provider: 'Google LLC',
      },
    ],
  },
];
