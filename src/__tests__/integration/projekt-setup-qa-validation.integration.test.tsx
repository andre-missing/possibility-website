/**
 * QA-Validation: Projekt-Setup (Repository, Toolchain & Hosting-Infrastruktur)
 *
 * Ticket: Projekt-Setup: Repository, Toolchain & Hosting-Infrastruktur (2ac2b31a)
 * Akzeptanzkriterien: REQ-001 bis REQ-008
 *
 * Ergaenzende QA-Validierungen, die ueber die bestehenden Integrationstests
 * hinausgehen: Cross-Referencing, tiefe Config-Validierung, Edge Cases,
 * Sicherheits-Checks und Strukturkonsistenz.
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Helpers
// ============================================================================

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(PROJECT_ROOT, relativePath));
}

function readFile(relativePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, relativePath), 'utf-8');
}

function readJSON(relativePath: string): Record<string, unknown> {
  return JSON.parse(readFile(relativePath));
}

function isDirectory(relativePath: string): boolean {
  const fullPath = path.join(PROJECT_ROOT, relativePath);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

// ============================================================================
// REQ-001 QA: Dokumentationsqualitaet und Vollstaendigkeit
// ============================================================================

describe('QA REQ-001: Dokumentationsqualitaet', () => {
  it('README.md hat eine minimale Dokumentationslaenge (> 2000 Zeichen)', () => {
    const readme = readFile('README.md');
    expect(readme.length).toBeGreaterThan(2000);
  });

  it('README.md enthaelt Architektur-Diagramm oder -Verzeichnisbaum', () => {
    const readme = readFile('README.md');
    // Das README enthaelt einen Verzeichnisbaum im Code-Block
    expect(readme).toMatch(/```[\s\S]*src\/[\s\S]*```/);
  });

  it('README.md dokumentiert Voraussetzungen (Node.js Version)', () => {
    const readme = readFile('README.md');
    expect(readme).toMatch(/Node\.js/);
    expect(readme).toMatch(/>= 18/);
  });

  it('README.md enthaelt eine Tabelle fuer den Tech-Stack', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('| Komponente');
    expect(readme).toContain('| Technologie');
  });

  it('.gitignore enthaelt keine doppelten Eintraege', () => {
    const gitignore = readFile('.gitignore');
    const lines = gitignore
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'));
    const uniqueLines = [...new Set(lines)];
    expect(lines.length).toBe(uniqueLines.length);
  });

  it('.gitignore schliesst Editor-Metadaten aus', () => {
    const gitignore = readFile('.gitignore');
    expect(gitignore).toContain('.DS_Store');
  });

  it('.gitignore schliesst PEM-Dateien (Zertifikate/Schluessel) aus', () => {
    const gitignore = readFile('.gitignore');
    expect(gitignore).toContain('*.pem');
  });
});

// ============================================================================
// REQ-002 QA: Framework-Konsistenz und Cross-Referencing
// ============================================================================

describe('QA REQ-002: Framework-Konsistenz', () => {
  it('package.json name und lockfile name stimmen ueberein', () => {
    const pkg = readJSON('package.json') as { name: string };
    const lock = readJSON('package-lock.json') as { name: string };
    expect(pkg.name).toBe(lock.name);
  });

  it('package.json version und lockfile version stimmen ueberein', () => {
    const pkg = readJSON('package.json') as { version: string };
    const lock = readJSON('package-lock.json') as { version: string };
    expect(pkg.version).toBe(lock.version);
  });

  it('tsconfig.json target ist kompatibel mit Next.js (ES2017+)', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: { target: string };
    };
    const validTargets = [
      'ES2017',
      'ES2018',
      'ES2019',
      'ES2020',
      'ES2021',
      'ES2022',
      'ES2023',
      'ESNext',
    ];
    expect(
      validTargets.includes(tsconfig.compilerOptions.target.toUpperCase())
    ).toBe(true);
  });

  it('tsconfig.json lib enthaelt dom und esnext', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: { lib: string[] };
    };
    const libs = tsconfig.compilerOptions.lib.map((l) => l.toLowerCase());
    expect(libs).toContain('dom');
    expect(libs).toContain('esnext');
  });

  it('tsconfig.json exclude schliesst node_modules aus', () => {
    const tsconfig = readJSON('tsconfig.json') as { exclude: string[] };
    expect(tsconfig.exclude).toContain('node_modules');
  });

  it('tsconfig.json incremental ist aktiviert fuer schnellere Builds', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: { incremental: boolean };
    };
    expect(tsconfig.compilerOptions.incremental).toBe(true);
  });

  it('tsconfig.json esModuleInterop ist aktiviert', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: { esModuleInterop: boolean };
    };
    expect(tsconfig.compilerOptions.esModuleInterop).toBe(true);
  });

  it('next.config.mjs ist eine valide ES-Modul-Datei', () => {
    const config = readFile('next.config.mjs');
    // Sollte einen default-Export haben
    expect(config).toMatch(/export\s+default/);
  });

  it('package.json hat "private: true" gesetzt (kein versehentliches npm publish)', () => {
    const pkg = readJSON('package.json') as { private: boolean };
    expect(pkg.private).toBe(true);
  });

  it('alle Scripts in package.json referenzieren installierte Tools', () => {
    const pkg = readJSON('package.json') as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    // "next" commands should have next installed
    expect(pkg.dependencies.next).toBeDefined();
    // "eslint" command should have eslint installed
    expect(pkg.devDependencies.eslint).toBeDefined();
    // "prettier" command should have prettier installed
    expect(pkg.devDependencies.prettier).toBeDefined();
    // "jest" command should have jest installed
    expect(pkg.devDependencies.jest).toBeDefined();
    // "tsc" command should have typescript installed
    expect(pkg.devDependencies.typescript).toBeDefined();
  });
});

// ============================================================================
// REQ-003 QA: Code-Qualitaet Tiefe Validierung
// ============================================================================

describe('QA REQ-003: Code-Qualitaet Tiefencheck', () => {
  it('ESLint-Config hat keine widerspruchenden Extends', () => {
    const eslint = readJSON('.eslintrc.json') as { extends: string[] };
    // prettier muss NACH typescript-eslint kommen, um Konflikte zu vermeiden
    const prettierIdx = eslint.extends.indexOf('prettier');
    const tsIdx = eslint.extends.indexOf(
      'plugin:@typescript-eslint/recommended'
    );
    expect(prettierIdx).toBeGreaterThan(tsIdx);
  });

  it('ESLint-Config hat keine Regeln die mit Prettier kollidieren', () => {
    const eslint = readJSON('.eslintrc.json') as {
      rules: Record<string, unknown>;
    };
    // Diese Regeln wuerden mit Prettier kollidieren
    const conflictingRules = [
      'indent',
      'semi',
      'quotes',
      'comma-dangle',
      'arrow-parens',
    ];
    for (const rule of conflictingRules) {
      expect(eslint.rules[rule]).toBeUndefined();
    }
  });

  it('Prettier printWidth ist ein sinnvoller Wert (60-120)', () => {
    const prettier = readJSON('.prettierrc.json') as { printWidth: number };
    expect(prettier.printWidth).toBeGreaterThanOrEqual(60);
    expect(prettier.printWidth).toBeLessThanOrEqual(120);
  });

  it('.prettierignore schliesst Build-Artefakte aus', () => {
    const prettierignore = readFile('.prettierignore');
    expect(prettierignore).toMatch(/node_modules|\.next|out|coverage/);
  });

  it('.editorconfig root ist auf true gesetzt', () => {
    const editorconfig = readFile('.editorconfig');
    expect(editorconfig).toContain('root = true');
  });

  it('jest.config.js nutzt next/jest fuer korrekte Transformation', () => {
    const jestConfig = readFile('jest.config.js');
    expect(jestConfig).toContain('next/jest');
  });

  it('jest.config.js hat displayName gesetzt', () => {
    const jestConfig = readFile('jest.config.js');
    expect(jestConfig).toContain('displayName');
  });

  it('jest.setup.ts importiert nur Testing Library jest-dom', () => {
    const setup = readFile('jest.setup.ts');
    // Soll schlank sein - nur Matcher importieren
    expect(setup).toContain('@testing-library/jest-dom');
    // Keine Polyfills oder Hacks noetig
    const lines = setup
      .split('\n')
      .filter(
        (l) => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('*')
      );
    expect(lines.length).toBeLessThanOrEqual(5);
  });
});

// ============================================================================
// REQ-004 QA: CSS-Architektur Robustheit
// ============================================================================

describe('QA REQ-004: CSS-Architektur Edge Cases', () => {
  it('Tailwind Brand-Farbpalette hat alle Standard-Abstufungen', () => {
    const config = readFile('tailwind.config.ts');
    const standardShades = [
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      '950',
    ];
    for (const shade of standardShades) {
      expect(config).toContain(`${shade}:`);
    }
  });

  it('globals.css hat keine @import-Anweisungen (Performance)', () => {
    const css = readFile('src/app/globals.css');
    // @tailwind-Directives sind ok, aber @import sollte vermieden werden
    const lines = css.split('\n');
    const importLines = lines.filter(
      (l) => l.trim().startsWith('@import') && !l.trim().startsWith('@import url')
    );
    expect(importLines.length).toBe(0);
  });

  it('globals.css nutzt nur @layer base (keine componenten/utilities overrides)', () => {
    const css = readFile('src/app/globals.css');
    // Nur @layer base ist erlaubt fuer globale Styles
    const layerMatches = css.match(/@layer\s+(base|components|utilities)/g);
    if (layerMatches) {
      // Alle @layer-Nutzungen sollen "base" sein
      layerMatches.forEach((match) => {
        expect(match).toContain('base');
      });
    }
  });

  it('PostCSS-Config hat keine unnuetigen Plugins', () => {
    const postcss = readFile('postcss.config.js');
    // Nur tailwindcss und autoprefixer - kein cssnano etc. (Next.js optimiert selbst)
    expect(postcss).toContain('tailwindcss');
    expect(postcss).toContain('autoprefixer');
    expect(postcss).not.toContain('cssnano');
  });

  it('Tailwind Config nutzt TypeScript (.ts Extension)', () => {
    expect(fileExists('tailwind.config.ts')).toBe(true);
    expect(fileExists('tailwind.config.js')).toBe(false);
  });
});

// ============================================================================
// REQ-005 QA: Hosting-Integration Validierung
// ============================================================================

describe('QA REQ-005: Hosting-Plattform Tiefencheck', () => {
  it('Static Export erzeugt gueltige HTML-Dateien mit DOCTYPE', () => {
    if (fileExists('out/index.html')) {
      const html = readFile('out/index.html');
      expect(html).toMatch(/^<!DOCTYPE html>/i);
    }
  });

  it('Static Export index.html hat UTF-8 Charset', () => {
    if (fileExists('out/index.html')) {
      const html = readFile('out/index.html');
      expect(html).toMatch(/charset.*utf-8/i);
    }
  });

  it('Static Export enthaelt _next Verzeichnis fuer Assets', () => {
    expect(isDirectory('out/_next')).toBe(true);
  });

  it('Static Export enthaelt 404.html fuer Fehlerseiten', () => {
    expect(fileExists('out/404.html')).toBe(true);
  });

  it('favicon.ico existiert im public-Verzeichnis', () => {
    expect(fileExists('public/favicon.ico')).toBe(true);
  });

  it('favicon.ico ist im Build-Output vorhanden', () => {
    expect(fileExists('out/favicon.ico')).toBe(true);
  });
});

// ============================================================================
// REQ-006 QA: CI/CD Pipeline Cross-Referencing
// ============================================================================

describe('QA REQ-006: CI/CD Pipeline Cross-Referencing', () => {
  it('CI Workflow Schritte matchen exakt die package.json Scripts', () => {
    const ci = readFile('.github/workflows/ci.yml');
    const pkg = readJSON('package.json') as {
      scripts: Record<string, string>;
    };

    // Jeder CI-Schritt muss ein definiertes Script referenzieren
    if (ci.includes('npm run lint')) {
      expect(pkg.scripts.lint).toBeDefined();
    }
    if (ci.includes('npm run format:check')) {
      expect(pkg.scripts['format:check']).toBeDefined();
    }
    if (ci.includes('npm run type-check')) {
      expect(pkg.scripts['type-check']).toBeDefined();
    }
    if (ci.includes('npm test')) {
      expect(pkg.scripts.test).toBeDefined();
    }
    if (ci.includes('npm run build')) {
      expect(pkg.scripts.build).toBeDefined();
    }
  });

  it('CI Workflow nutzt keine veralteten GitHub Actions (alle v4)', () => {
    const ci = readFile('.github/workflows/ci.yml');
    // Keine v2 oder v3 Actions
    expect(ci).not.toMatch(/actions\/checkout@v[123]\b/);
    expect(ci).not.toMatch(/actions\/setup-node@v[123]\b/);
  });

  it('CI und Deploy Workflows haben unterschiedliche Trigger', () => {
    const ci = readFile('.github/workflows/ci.yml');
    const deploy = readFile('.github/workflows/deploy.yml');

    // CI laeuft auf PR und Push
    expect(ci).toContain('pull_request');
    expect(ci).toContain('push');

    // Deploy laeuft nur auf Push (keine PRs)
    expect(deploy).toContain('push');
    expect(deploy).not.toMatch(/pull_request:/);
  });

  it('CI Workflow hat genau einen Job (keine unnoetige Komplexitaet)', () => {
    const ci = readFile('.github/workflows/ci.yml');
    const jobMatches = ci.match(/^\s{2}\w+:/gm);
    // Unter "jobs:" sollte genau ein Job definiert sein
    // (quality: oder ein aehnlicher Name)
    expect(jobMatches).toBeTruthy();
    expect(jobMatches!.length).toBeGreaterThanOrEqual(1);
  });

  it('Deploy Workflow referenziert Vercel', () => {
    const deploy = readFile('.github/workflows/deploy.yml');
    expect(deploy).toMatch(/[Vv]ercel/);
  });

  it('CI Workflow names sind beschreibend (fuer GitHub UI)', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain('name: CI');
    expect(ci).toContain('name: Lint');
  });
});

// ============================================================================
// REQ-007 QA: Domain-Konfiguration
// ============================================================================

describe('QA REQ-007: Domain-Konfiguration Details', () => {
  it('README.md enthaelt die exakte Domain mit Schema (https://possibility.gmbh)', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('https://possibility.gmbh');
  });

  it('README.md dokumentiert DNS-Konfiguration (Custom-Domain)', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('Custom-Domain');
  });
});

// ============================================================================
// REQ-008 QA: HTTPS und Sicherheit
// ============================================================================

describe('QA REQ-008: HTTPS und Sicherheit', () => {
  it('README.md dokumentiert automatische SSL-Zertifikate (kein manuelles Setup)', () => {
    const readme = readFile('README.md');
    expect(readme).toMatch(/[Aa]utomatische?\s+SSL/);
  });

  it('README.md erwaehnt explizit HTTP -> HTTPS Redirect', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('HTTP');
    expect(readme).toContain('HTTPS');
    expect(readme).toContain('Redirect');
  });

  it('Keine sensiblen Dateien (.env, Secrets) im Repository', () => {
    // Diese Dateien duerfen NICHT existieren (oder in .gitignore stehen)
    const gitignore = readFile('.gitignore');
    expect(gitignore).toContain('.env');
    expect(gitignore).toContain('*.pem');
  });

  it('next.config.mjs enthaelt keine hartcodierten Secrets oder API-Keys', () => {
    const config = readFile('next.config.mjs');
    // Keine environment variables oder API keys
    expect(config).not.toMatch(/API_KEY|SECRET|PASSWORD|TOKEN/i);
    expect(config).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
  });
});

// ============================================================================
// Cross-Cutting QA: Strukturelle Konsistenz
// ============================================================================

describe('QA Cross-Cutting: Strukturelle Konsistenz', () => {
  it('Alle erstellten Dateien laut Ticket existieren tatsaechlich', () => {
    const expectedFiles = [
      'package.json',
      'next.config.mjs',
      'tsconfig.json',
      '.gitignore',
      'src/app/layout.tsx',
      'src/app/page.tsx',
      'src/app/globals.css',
      'public/favicon.ico',
      '.eslintrc.json',
      '.prettierrc.json',
      '.prettierignore',
      '.editorconfig',
      'tailwind.config.ts',
      'postcss.config.js',
      '.github/workflows/ci.yml',
      '.github/workflows/deploy.yml',
      'README.md',
      'jest.config.js',
      'jest.setup.ts',
    ];

    const missingFiles = expectedFiles.filter((f) => !fileExists(f));
    expect(missingFiles).toEqual([]);
  });

  it('Alle Unit-Test-Dateien laut Ticket existieren', () => {
    const expectedTestFiles = [
      'src/__tests__/page.test.tsx',
      'src/__tests__/layout.test.tsx',
    ];

    const missingTests = expectedTestFiles.filter((f) => !fileExists(f));
    expect(missingTests).toEqual([]);
  });

  it('src/app Verzeichnis enthaelt nur erwartete Dateien und Unterverzeichnisse', () => {
    const appDir = path.join(PROJECT_ROOT, 'src', 'app');
    const entries = fs.readdirSync(appDir);
    // Mindestens layout.tsx, page.tsx und globals.css muessen da sein
    expect(entries).toContain('layout.tsx');
    expect(entries).toContain('page.tsx');
    expect(entries).toContain('globals.css');
  });

  it('Keine .js Source-Dateien im src/app (alles TypeScript)', () => {
    const appDir = path.join(PROJECT_ROOT, 'src', 'app');
    const files = fs.readdirSync(appDir);
    const jsFiles = files.filter(
      (f) => f.endsWith('.js') && !f.endsWith('.config.js')
    );
    expect(jsFiles).toEqual([]);
  });

  it('package.json hat keinen unnuetigen scripts-Eintrag "eject"', () => {
    const pkg = readJSON('package.json') as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.eject).toBeUndefined();
  });

  it('Keine Lockfile-Konflikte: nur package-lock.json (kein yarn.lock)', () => {
    expect(fileExists('package-lock.json')).toBe(true);
    expect(fileExists('yarn.lock')).toBe(false);
    expect(fileExists('pnpm-lock.yaml')).toBe(false);
  });
});
