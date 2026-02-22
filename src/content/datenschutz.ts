import type { DatenschutzData } from './datenschutz-types';

export const datenschutzContent: DatenschutzData = {
  version: '1.0.0',
  lastUpdated: '2026-02-01',
  displayDate: 'Februar 2026',
  responsible: {
    companyName: 'possibility GmbH',
    address: 'Musterstraße 1, 12345 Musterstadt, Deutschland',
    email: 'datenschutz@possibility.gmbh',
    phone: '+49 (0) 123 456789-0',
    dataProtectionOfficer: null,
  },
  sections: [
    {
      id: 'verantwortlicher',
      level: 1,
      title: 'Verantwortlicher',
      content:
        '<p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>' +
        '<p><strong>possibility GmbH</strong><br/>' +
        'Musterstraße 1<br/>' +
        '12345 Musterstadt<br/>' +
        'Deutschland</p>' +
        '<p>E-Mail: datenschutz@possibility.gmbh<br/>' +
        'Telefon: +49 (0) 123 456789-0</p>',
    },
    {
      id: 'uebersicht-datenverarbeitung',
      level: 1,
      title: 'Übersicht der Datenverarbeitungen',
      content:
        '<p>Die nachfolgende Übersicht fasst die Arten der verarbeiteten Daten und die Zwecke ihrer Verarbeitung zusammen und verweist auf die betroffenen Personen.</p>',
      subsections: [
        {
          id: 'arten-verarbeiteter-daten',
          level: 2,
          title: 'Arten der verarbeiteten Daten',
          content:
            '<ul>' +
            '<li>Bestandsdaten (z.B. Namen, Adressen)</li>' +
            '<li>Kontaktdaten (z.B. E-Mail, Telefonnummern)</li>' +
            '<li>Inhaltsdaten (z.B. Eingaben in Kontaktformularen)</li>' +
            '<li>Nutzungsdaten (z.B. besuchte Webseiten, Zugriffszeiten)</li>' +
            '<li>Meta-/Kommunikationsdaten (z.B. Geräte-Informationen, IP-Adressen)</li>' +
            '</ul>',
        },
        {
          id: 'kategorien-betroffener-personen',
          level: 2,
          title: 'Kategorien betroffener Personen',
          content:
            '<ul>' +
            '<li>Nutzer der Website</li>' +
            '<li>Kommunikationspartner (Kontaktformular)</li>' +
            '<li>Geschäftspartner und Interessenten</li>' +
            '</ul>',
        },
      ],
    },
    {
      id: 'rechtsgrundlagen',
      level: 1,
      title: 'Rechtsgrundlagen der Verarbeitung',
      content:
        '<p>Die Verarbeitung personenbezogener Daten erfolgt auf folgenden Rechtsgrundlagen gemäß DSGVO:</p>' +
        '<ul>' +
        '<li><strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</strong> – Die betroffene Person hat ihre Einwilligung zu der Verarbeitung gegeben (z.B. Cookie-Consent für Analyse-Cookies).</li>' +
        '<li><strong>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</strong> – Die Verarbeitung ist zur Erfüllung eines Vertrags oder zur Durchführung vorvertraglicher Maßnahmen erforderlich.</li>' +
        '<li><strong>Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO)</strong> – Die Verarbeitung ist zur Wahrung berechtigter Interessen erforderlich (z.B. Sicherheit der Website, Server-Logfiles).</li>' +
        '</ul>',
    },
    {
      id: 'betroffenenrechte',
      level: 1,
      title: 'Rechte der betroffenen Personen',
      content:
        '<p>Ihnen stehen als betroffene Person nach der DSGVO verschiedene Rechte zu:</p>' +
        '<ul>' +
        '<li><strong>Auskunftsrecht (Art. 15 DSGVO)</strong> – Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob personenbezogene Daten verarbeitet werden.</li>' +
        '<li><strong>Recht auf Berichtigung (Art. 16 DSGVO)</strong> – Sie haben das Recht, die Berichtigung unrichtiger Daten zu verlangen.</li>' +
        '<li><strong>Recht auf Löschung (Art. 17 DSGVO)</strong> – Sie haben das Recht, die Löschung Ihrer Daten zu verlangen.</li>' +
        '<li><strong>Recht auf Einschränkung (Art. 18 DSGVO)</strong> – Sie haben das Recht, die Einschränkung der Verarbeitung zu verlangen.</li>' +
        '<li><strong>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</strong> – Sie haben das Recht, Ihre Daten in einem übertragbaren Format zu erhalten.</li>' +
        '<li><strong>Widerspruchsrecht (Art. 21 DSGVO)</strong> – Sie haben das Recht, der Verarbeitung Ihrer Daten zu widersprechen.</li>' +
        '<li><strong>Recht auf Widerruf (Art. 7 Abs. 3 DSGVO)</strong> – Sie haben das Recht, eine erteilte Einwilligung jederzeit zu widerrufen.</li>' +
        '<li><strong>Beschwerderecht (Art. 77 DSGVO)</strong> – Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren.</li>' +
        '</ul>',
    },
    {
      id: 'server-logfiles',
      level: 1,
      title: 'Server-Logfiles',
      content:
        '<p>Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:</p>' +
        '<ul>' +
        '<li>Browsertyp und Browserversion</li>' +
        '<li>Verwendetes Betriebssystem</li>' +
        '<li>Referrer URL</li>' +
        '<li>Hostname des zugreifenden Rechners</li>' +
        '<li>Uhrzeit der Serveranfrage</li>' +
        '<li>IP-Adresse</li>' +
        '</ul>' +
        '<p>Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung und der Optimierung seiner Website.</p>' +
        '<p><strong>Speicherdauer:</strong> Die Server-Logfiles werden nach spätestens 30 Tagen automatisch gelöscht.</p>',
    },
    {
      id: 'kontaktformular',
      level: 1,
      title: 'Kontaktformular',
      content:
        '<p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.</p>' +
        '<p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung von Anfragen).</p>' +
        '<p><strong>Speicherdauer:</strong> Ihre Daten werden nach abschließender Bearbeitung Ihrer Anfrage gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>',
    },
    {
      id: 'cookies',
      level: 1,
      title: 'Cookies und Einwilligungsmanagement',
      content:
        '<p>Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden und die Ihr Browser speichert.</p>',
      subsections: [
        {
          id: 'essenzielle-cookies',
          level: 2,
          title: 'Essenzielle Cookies',
          content:
            '<p>Essenzielle Cookies sind für den Betrieb der Website technisch notwendig. Sie ermöglichen grundlegende Funktionen und können nicht deaktiviert werden.</p>' +
            '<p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).</p>',
        },
        {
          id: 'funktionale-cookies',
          level: 2,
          title: 'Funktionale Cookies',
          content:
            '<p>Funktionale Cookies ermöglichen erweiterte Funktionalität und Personalisierung. Sie werden nur mit Ihrer ausdrücklichen Einwilligung gesetzt.</p>' +
            '<p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</p>',
        },
        {
          id: 'analyse-cookies',
          level: 2,
          title: 'Analyse- und Tracking-Cookies',
          content:
            '<p>Analyse-Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren. Sie werden nur mit Ihrer ausdrücklichen Einwilligung gesetzt.</p>' +
            '<p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).</p>',
        },
        {
          id: 'einwilligungsverwaltung',
          level: 2,
          title: 'Einwilligungsverwaltung',
          content:
            '<p>Beim ersten Besuch unserer Website werden Sie über ein Banner um Ihre Einwilligung gebeten. Sie können Ihre Einstellungen jederzeit über den Button "Cookie-Einstellungen" im Footer der Website ändern oder Ihre Einwilligung widerrufen.</p>' +
            '<p>Die Speicherung Ihrer Einwilligungspräferenzen erfolgt im Local Storage Ihres Browsers. Dies ist technisch notwendig und erfordert keine gesonderte Einwilligung.</p>',
        },
      ],
    },
    {
      id: 'speicherdauer',
      level: 1,
      title: 'Speicherdauer',
      content:
        '<p>Sofern innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt.</p>' +
        '<p>Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben.</p>',
    },
    {
      id: 'aenderungen',
      level: 1,
      title: 'Änderungen dieser Datenschutzerklärung',
      content:
        '<p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.</p>',
    },
  ],
};
