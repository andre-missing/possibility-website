/**
 * Integration Tests: Projekt-Setup (Repository, Toolchain & Hosting-Infrastruktur)
 *
 * Ticket: Projekt-Setup: Repository, Toolchain & Hosting-Infrastruktur (2ac2b31a)
 * Akzeptanzkriterien: REQ-001 bis REQ-008
 *
 * Diese Tests pruefen, dass alle Projekt-Setup-Komponenten korrekt konfiguriert
 * und integriert sind: Repository-Dokumentation, Frontend-Framework, Code-Qualitaet,
 * CSS-Architektur, Hosting-Plattform, CI/CD, Domain und HTTPS.
 */

import * as fs from 'fs';
import * as path from 'path';
import { render, screen } from '@testing-library/react';
import HomePage from '../../app/page';
import RootLayout from '../../app/layout';

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

// ============================================================================
// REQ-001: Git-Repository mit Projektdokumentation
// ============================================================================

describe('REQ-001: Git-Repository mit Projektdokumentation', () => {
  it('README.md existiert im Projekt-Root', () => {
    expect(fileExists('README.md')).toBe(true);
  });

  it('README.md ist nicht leer und enthaelt relevanten Inhalt', () => {
    const readme = readFile('README.md');
    expect(readme.length).toBeGreaterThan(100);
  });

  it('README.md dokumentiert den Tech-Stack', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('Next.js');
    expect(readme).toContain('TypeScript');
    expect(readme).toContain('Tailwind');
  });

  it('README.md enthaelt Setup-Anweisungen', () => {
    const readme = readFile('README.md');
    expect(readme).toMatch(/npm\s+(install|ci)/);
    expect(readme).toContain('npm run dev');
  });

  it('README.md dokumentiert verfuegbare Scripts', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('npm run build');
    expect(readme).toContain('npm run lint');
    expect(readme).toContain('npm test');
  });

  it('README.md enthaelt Architektur-Entscheidung (ADR)', () => {
    const readme = readFile('README.md');
    expect(readme).toMatch(/ADR|Entscheidung|Begr(ue|ü)ndung/i);
  });

  it('.gitignore existiert und schliesst node_modules aus', () => {
    expect(fileExists('.gitignore')).toBe(true);
    const gitignore = readFile('.gitignore');
    expect(gitignore).toContain('node_modules');
  });

  it('.gitignore schliesst Build-Artefakte und sensible Dateien aus', () => {
    const gitignore = readFile('.gitignore');
    expect(gitignore).toContain('.next');
    expect(gitignore).toContain('/out');
    expect(gitignore).toContain('.env');
    expect(gitignore).toContain('coverage');
  });

  it('.git Verzeichnis existiert (initialisiertes Repository)', () => {
    expect(fileExists('.git')).toBe(true);
  });
});

// ============================================================================
// REQ-002: Frontend-Framework eingerichtet
// ============================================================================

describe('REQ-002: Frontend-Framework eingerichtet', () => {
  it('package.json existiert und definiert Projektname', () => {
    const pkg = readJSON('package.json') as Record<string, unknown>;
    expect(pkg.name).toBe('possibility-website');
    expect(pkg.private).toBe(true);
  });

  it('Next.js ist als Dependency installiert (>= 14)', () => {
    const pkg = readJSON('package.json') as { dependencies: Record<string, string> };
    expect(pkg.dependencies.next).toBeDefined();
    expect(pkg.dependencies.next).toMatch(/\^14/);
  });

  it('React und React-DOM sind als Dependencies installiert', () => {
    const pkg = readJSON('package.json') as { dependencies: Record<string, string> };
    expect(pkg.dependencies.react).toBeDefined();
    expect(pkg.dependencies['react-dom']).toBeDefined();
  });

  it('TypeScript ist als devDependency installiert', () => {
    const pkg = readJSON('package.json') as { devDependencies: Record<string, string> };
    expect(pkg.devDependencies.typescript).toBeDefined();
  });

  it('next.config.mjs konfiguriert Static Export', () => {
    const config = readFile('next.config.mjs');
    expect(config).toContain("output: 'export'");
  });

  it('next.config.mjs deaktiviert Image Optimization (fuer Static Export)', () => {
    const config = readFile('next.config.mjs');
    expect(config).toContain('unoptimized: true');
  });

  it('tsconfig.json existiert und hat strict mode aktiviert', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: Record<string, unknown>;
    };
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it('tsconfig.json konfiguriert Path-Alias @/*', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: { paths: Record<string, string[]> };
    };
    expect(tsconfig.compilerOptions.paths).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@/*']).toContain('./src/*');
  });

  it('App Router Struktur existiert (src/app/layout.tsx und page.tsx)', () => {
    expect(fileExists('src/app/layout.tsx')).toBe(true);
    expect(fileExists('src/app/page.tsx')).toBe(true);
  });

  it('Root Layout setzt HTML lang="de" fuer deutsche Website', () => {
    const layout = readFile('src/app/layout.tsx');
    expect(layout).toContain('lang="de"');
  });

  it('Root Layout importiert globals.css', () => {
    const layout = readFile('src/app/layout.tsx');
    expect(layout).toContain("'./globals.css'");
  });

  it('HomePage rendert korrekt mit Next.js App Router', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'possibility GmbH'
    );
  });

  it('package.json definiert alle erforderlichen Scripts', () => {
    const pkg = readJSON('package.json') as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts.dev).toBeDefined();
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts.start).toBeDefined();
    expect(pkg.scripts.lint).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
    expect(pkg.scripts['type-check']).toBeDefined();
    expect(pkg.scripts.format).toBeDefined();
    expect(pkg.scripts['format:check']).toBeDefined();
  });
});

// ============================================================================
// REQ-003: Code-Qualitaetswerkzeuge konfiguriert
// ============================================================================

describe('REQ-003: Code-Qualitaetswerkzeuge konfiguriert', () => {
  it('ESLint-Konfiguration existiert (.eslintrc.json)', () => {
    expect(fileExists('.eslintrc.json')).toBe(true);
  });

  it('ESLint nutzt next/core-web-vitals Preset', () => {
    const eslint = readJSON('.eslintrc.json') as { extends: string[] };
    expect(eslint.extends).toContain('next/core-web-vitals');
  });

  it('ESLint integriert TypeScript-Plugin', () => {
    const eslint = readJSON('.eslintrc.json') as {
      extends: string[];
      plugins: string[];
    };
    expect(eslint.extends).toContain(
      'plugin:@typescript-eslint/recommended'
    );
    expect(eslint.plugins).toContain('@typescript-eslint');
  });

  it('ESLint integriert Prettier', () => {
    const eslint = readJSON('.eslintrc.json') as {
      extends: string[];
      plugins: string[];
      rules: Record<string, unknown>;
    };
    expect(eslint.extends).toContain('prettier');
    expect(eslint.plugins).toContain('prettier');
    expect(eslint.rules['prettier/prettier']).toBe('error');
  });

  it('ESLint erzwingt consistent-type-imports', () => {
    const eslint = readJSON('.eslintrc.json') as {
      rules: Record<string, unknown>;
    };
    expect(eslint.rules['@typescript-eslint/consistent-type-imports']).toBe(
      'error'
    );
  });

  it('Prettier-Konfiguration existiert (.prettierrc.json)', () => {
    expect(fileExists('.prettierrc.json')).toBe(true);
  });

  it('Prettier nutzt konsistente Formatierungs-Regeln', () => {
    const prettier = readJSON('.prettierrc.json') as Record<string, unknown>;
    expect(prettier.semi).toBe(true);
    expect(prettier.singleQuote).toBe(true);
    expect(prettier.tabWidth).toBe(2);
    expect(prettier.trailingComma).toBe('es5');
  });

  it('Prettier integriert Tailwind-Plugin fuer Klassen-Sortierung', () => {
    const prettier = readJSON('.prettierrc.json') as { plugins: string[] };
    expect(prettier.plugins).toContain('prettier-plugin-tailwindcss');
  });

  it('.prettierignore existiert', () => {
    expect(fileExists('.prettierignore')).toBe(true);
  });

  it('.editorconfig existiert mit korrekten Einstellungen', () => {
    expect(fileExists('.editorconfig')).toBe(true);
    const editorconfig = readFile('.editorconfig');
    expect(editorconfig).toContain('indent_size = 2');
    expect(editorconfig).toContain('indent_style = space');
    expect(editorconfig).toContain('end_of_line = lf');
    expect(editorconfig).toContain('charset = utf-8');
  });

  it('Jest ist als Test-Framework konfiguriert', () => {
    expect(fileExists('jest.config.js')).toBe(true);
    const pkg = readJSON('package.json') as {
      devDependencies: Record<string, string>;
    };
    expect(pkg.devDependencies.jest).toBeDefined();
    expect(pkg.devDependencies['jest-environment-jsdom']).toBeDefined();
  });

  it('Jest Setup-Datei importiert Testing Library Matchers', () => {
    expect(fileExists('jest.setup.ts')).toBe(true);
    const setup = readFile('jest.setup.ts');
    expect(setup).toContain('@testing-library/jest-dom');
  });

  it('Testing Library ist als devDependency installiert', () => {
    const pkg = readJSON('package.json') as {
      devDependencies: Record<string, string>;
    };
    expect(pkg.devDependencies['@testing-library/react']).toBeDefined();
    expect(pkg.devDependencies['@testing-library/jest-dom']).toBeDefined();
  });

  it('ESLint und Prettier devDependencies sind installiert', () => {
    const pkg = readJSON('package.json') as {
      devDependencies: Record<string, string>;
    };
    expect(pkg.devDependencies.eslint).toBeDefined();
    expect(pkg.devDependencies.prettier).toBeDefined();
    expect(pkg.devDependencies['eslint-config-prettier']).toBeDefined();
    expect(pkg.devDependencies['eslint-plugin-prettier']).toBeDefined();
    expect(
      pkg.devDependencies['@typescript-eslint/eslint-plugin']
    ).toBeDefined();
    expect(pkg.devDependencies['@typescript-eslint/parser']).toBeDefined();
  });
});

// ============================================================================
// REQ-004: CSS-Architektur festgelegt
// ============================================================================

describe('REQ-004: CSS-Architektur festgelegt', () => {
  it('Tailwind CSS ist als devDependency installiert', () => {
    const pkg = readJSON('package.json') as {
      devDependencies: Record<string, string>;
    };
    expect(pkg.devDependencies.tailwindcss).toBeDefined();
    expect(pkg.devDependencies.tailwindcss).toMatch(/\^3/);
  });

  it('tailwind.config.ts existiert', () => {
    expect(fileExists('tailwind.config.ts')).toBe(true);
  });

  it('Tailwind scannt alle src-Dateien fuer Klassen', () => {
    const config = readFile('tailwind.config.ts');
    expect(config).toContain("'./src/**/*.{ts,tsx}'");
  });

  it('Tailwind definiert Brand-Farben', () => {
    const config = readFile('tailwind.config.ts');
    expect(config).toContain('brand');
    // Sollte eine Farbpalette (50 bis 950) definieren
    expect(config).toContain("50:");
    expect(config).toContain("500:");
    expect(config).toContain("900:");
  });

  it('Tailwind definiert benutzerdefinierte Schriftart', () => {
    const config = readFile('tailwind.config.ts');
    expect(config).toContain('fontFamily');
    expect(config).toContain('Inter');
    expect(config).toContain('system-ui');
  });

  it('PostCSS-Konfiguration existiert mit Tailwind und Autoprefixer', () => {
    expect(fileExists('postcss.config.js')).toBe(true);
    const postcss = readFile('postcss.config.js');
    expect(postcss).toContain('tailwindcss');
    expect(postcss).toContain('autoprefixer');
  });

  it('globals.css importiert Tailwind-Directives', () => {
    const css = readFile('src/app/globals.css');
    expect(css).toContain('@tailwind base');
    expect(css).toContain('@tailwind components');
    expect(css).toContain('@tailwind utilities');
  });

  it('globals.css nutzt @layer fuer Custom Styles', () => {
    const css = readFile('src/app/globals.css');
    expect(css).toContain('@layer base');
  });

  it('Autoprefixer ist als devDependency installiert', () => {
    const pkg = readJSON('package.json') as {
      devDependencies: Record<string, string>;
    };
    expect(pkg.devDependencies.autoprefixer).toBeDefined();
  });

  it('HomePage nutzt Tailwind Utility-Klassen', () => {
    render(<HomePage />);
    const main = document.querySelector('main');
    expect(main).toHaveClass('flex');
    expect(main).toHaveClass('min-h-screen');
    expect(main).toHaveClass('items-center');
    expect(main).toHaveClass('justify-center');
  });
});

// ============================================================================
// REQ-005: Hosting-Plattform verknuepft
// ============================================================================

describe('REQ-005: Hosting-Plattform verknuepft', () => {
  it('README.md dokumentiert Vercel als Hosting-Plattform', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('Vercel');
  });

  it('Static Export ist konfiguriert (out/ Verzeichnis)', () => {
    const config = readFile('next.config.mjs');
    expect(config).toContain("output: 'export'");
  });

  it('.gitignore schliesst .vercel Verzeichnis aus', () => {
    const gitignore = readFile('.gitignore');
    expect(gitignore).toContain('.vercel');
  });

  it('README.md beschreibt automatisches Deployment', () => {
    const readme = readFile('README.md');
    expect(readme).toMatch(/automatisch/i);
    expect(readme).toContain('Production-Deployment');
  });

  it('README.md beschreibt Preview-Deployments fuer Pull Requests', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('Preview-Deployment');
  });

  it('README.md erwaehnt CDN und Edge Network', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('CDN');
  });
});

// ============================================================================
// REQ-006: Automatisches Deployment via CI/CD
// ============================================================================

describe('REQ-006: Automatisches Deployment via CI/CD', () => {
  it('CI Workflow existiert (.github/workflows/ci.yml)', () => {
    expect(fileExists('.github/workflows/ci.yml')).toBe(true);
  });

  it('Deploy Workflow existiert (.github/workflows/deploy.yml)', () => {
    expect(fileExists('.github/workflows/deploy.yml')).toBe(true);
  });

  it('CI Workflow triggert auf Push und Pull Request zum main-Branch', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain('pull_request');
    expect(ci).toContain('push');
    expect(ci).toContain('main');
  });

  it('CI Workflow fuehrt Lint-Schritt aus', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain('npm run lint');
  });

  it('CI Workflow fuehrt Prettier-Check aus', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain('npm run format:check');
  });

  it('CI Workflow fuehrt TypeScript Type-Check aus', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain('npm run type-check');
  });

  it('CI Workflow fuehrt Tests aus', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain('npm test');
  });

  it('CI Workflow fuehrt Build aus', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain('npm run build');
  });

  it('CI Workflow verifiziert Build-Output (out/index.html)', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain('out/index.html');
  });

  it('CI Workflow nutzt Node.js 20', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain('node-version: 20');
  });

  it('CI Workflow nutzt npm ci fuer deterministische Installs', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain('npm ci');
  });

  it('CI Workflow nutzt npm-Caching', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain("cache: 'npm'");
  });

  it('Deploy Workflow triggert nur auf Push zum main-Branch', () => {
    const deploy = readFile('.github/workflows/deploy.yml');
    expect(deploy).toContain('push');
    expect(deploy).toContain('main');
    expect(deploy).not.toContain('pull_request');
  });

  it('CI Pipeline hat die korrekte Reihenfolge: lint -> format -> type-check -> test -> build', () => {
    const ci = readFile('.github/workflows/ci.yml');
    const lintIndex = ci.indexOf('npm run lint');
    const formatIndex = ci.indexOf('npm run format:check');
    const typeCheckIndex = ci.indexOf('npm run type-check');
    const testIndex = ci.indexOf('npm test');
    const buildIndex = ci.indexOf('npm run build');

    expect(lintIndex).toBeLessThan(formatIndex);
    expect(formatIndex).toBeLessThan(typeCheckIndex);
    expect(typeCheckIndex).toBeLessThan(testIndex);
    expect(testIndex).toBeLessThan(buildIndex);
  });
});

// ============================================================================
// REQ-007: Domain-Konfiguration und DNS
// ============================================================================

describe('REQ-007: Domain-Konfiguration und DNS', () => {
  it('README.md erwaehnt die Domain possibility.gmbh', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('possibility.gmbh');
  });

  it('README.md dokumentiert Custom-Domain-Konfiguration', () => {
    const readme = readFile('README.md');
    expect(readme).toMatch(/Custom.?Domain/i);
  });

  it('README.md dokumentiert www-zu-non-www Redirect', () => {
    const readme = readFile('README.md');
    expect(readme).toMatch(/www.*non-www/i);
  });
});

// ============================================================================
// REQ-008: HTTPS-Verschluesselung aktiv
// ============================================================================

describe('REQ-008: HTTPS-Verschluesselung aktiv', () => {
  it('README.md dokumentiert automatische SSL-Zertifikate', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('SSL');
  });

  it('README.md dokumentiert HTTP-zu-HTTPS Redirect', () => {
    const readme = readFile('README.md');
    expect(readme).toMatch(/HTTP.*HTTPS.*Redirect/i);
  });

  it('Vercel uebernimmt HTTPS (in Dokumentation vermerkt)', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('Vercel');
    expect(readme).toContain('SSL');
  });
});

// ============================================================================
// Cross-Cutting: Integrations-Pruefungen
// ============================================================================

describe('Cross-Cutting: Framework-Integration', () => {
  it('Next.js + TypeScript + Tailwind arbeiten zusammen (Homepage rendert)', () => {
    render(<HomePage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('possibility GmbH');

    const main = document.querySelector('main');
    expect(main).toHaveClass('flex', 'min-h-screen');
  });

  it('RootLayout rendert Kinder korrekt', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test</div>
      </RootLayout>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('package-lock.json existiert fuer reproduzierbare Builds', () => {
    expect(fileExists('package-lock.json')).toBe(true);
  });

  it('node_modules Verzeichnis existiert (Dependencies installiert)', () => {
    expect(fileExists('node_modules')).toBe(true);
  });

  it('TypeScript Types fuer React sind installiert', () => {
    const pkg = readJSON('package.json') as {
      devDependencies: Record<string, string>;
    };
    expect(pkg.devDependencies['@types/react']).toBeDefined();
    expect(pkg.devDependencies['@types/react-dom']).toBeDefined();
    expect(pkg.devDependencies['@types/node']).toBeDefined();
  });
});
