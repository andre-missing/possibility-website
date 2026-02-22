/**
 * E2E-Style Tests: Projekt-Setup (Repository, Toolchain & Hosting-Infrastruktur)
 *
 * Ticket: Projekt-Setup: Repository, Toolchain & Hosting-Infrastruktur (2ac2b31a)
 *
 * Diese Tests simulieren End-to-End Szenarien fuer das Projekt-Setup.
 * Sie pruefen, dass die gesamte Toolchain (Next.js, TypeScript, Tailwind,
 * ESLint, Prettier, Jest) als Einheit funktioniert und ein produktionsreifer
 * Build erstellt werden kann.
 *
 * Hinweis: Da kein E2E-Framework (Playwright/Cypress) konfiguriert ist,
 * werden diese Tests als Component-Integration-Tests mit Testing Library
 * implementiert, ergaenzt durch Filesystem- und Build-Validierungen.
 */

import * as fs from 'fs';
import * as path from 'path';
import { render, screen, within } from '@testing-library/react';
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

function dirContainsFiles(relativePath: string): boolean {
  const dirPath = path.join(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(dirPath)) return false;
  const entries = fs.readdirSync(dirPath);
  return entries.length > 0;
}

// ============================================================================
// E2E Szenario 1: Entwickler klont Repository und startet Entwicklung
// ============================================================================

describe('E2E: Entwickler-Onboarding - Projekt von Grund auf nutzbar', () => {
  it('Alle Projekt-Konfigurationsdateien sind vorhanden', () => {
    const requiredFiles = [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'next.config.mjs',
      'tailwind.config.ts',
      'postcss.config.js',
      '.eslintrc.json',
      '.prettierrc.json',
      '.prettierignore',
      '.editorconfig',
      '.gitignore',
      'jest.config.js',
      'jest.setup.ts',
      'README.md',
    ];

    const missingFiles = requiredFiles.filter((f) => !fileExists(f));
    expect(missingFiles).toEqual([]);
  });

  it('App Router Verzeichnisstruktur ist vollstaendig', () => {
    expect(fileExists('src/app/layout.tsx')).toBe(true);
    expect(fileExists('src/app/page.tsx')).toBe(true);
    expect(fileExists('src/app/globals.css')).toBe(true);
  });

  it('Dependencies sind installiert (node_modules vorhanden)', () => {
    expect(dirContainsFiles('node_modules')).toBe(true);
  });

  it('Alle kritischen Dependencies sind in node_modules verfuegbar', () => {
    const criticalDeps = [
      'node_modules/next',
      'node_modules/react',
      'node_modules/react-dom',
      'node_modules/typescript',
      'node_modules/tailwindcss',
      'node_modules/eslint',
      'node_modules/prettier',
      'node_modules/jest',
    ];

    const missingDeps = criticalDeps.filter((d) => !fileExists(d));
    expect(missingDeps).toEqual([]);
  });

  it('README gibt klare Setup-Anweisungen: clone, install, dev', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('git clone');
    expect(readme).toContain('npm install');
    expect(readme).toContain('npm run dev');
    expect(readme).toContain('localhost:3000');
  });
});

// ============================================================================
// E2E Szenario 2: Homepage laesst sich korrekt rendern
// ============================================================================

describe('E2E: Homepage Rendering - Vollstaendige Seite', () => {
  it('HomePage rendert ohne Fehler', () => {
    expect(() => {
      render(<HomePage />);
    }).not.toThrow();
  });

  it('HomePage zeigt den Firmennamen prominent an', () => {
    render(<HomePage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('possibility GmbH');
  });

  it('HomePage zeigt die Unternehmens-Tagline an', () => {
    render(<HomePage />);

    expect(
      screen.getByText(
        /Ihr Partner für innovative Lösungen und digitale Transformation/i
      )
    ).toBeInTheDocument();
  });

  it('HomePage nutzt semantisches main-Element als Container', () => {
    render(<HomePage />);

    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('HomePage nutzt Tailwind-Klassen fuer zentriertes Layout', () => {
    render(<HomePage />);

    const main = document.querySelector('main');
    expect(main).toHaveClass('flex');
    expect(main).toHaveClass('min-h-screen');
    expect(main).toHaveClass('items-center');
    expect(main).toHaveClass('justify-center');
  });

  it('HomePage-Heading nutzt Tailwind Typography-Klassen', () => {
    render(<HomePage />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveClass('text-4xl');
    expect(heading).toHaveClass('font-bold');
  });

  it('RootLayout wraps children korrekt mit ClientLayout', () => {
    const layoutSource = readFile('src/app/layout.tsx');
    expect(layoutSource).toContain('ClientLayout');
    expect(layoutSource).toContain('{children}');
  });

  it('RootLayout setzt Metadata (title und description)', () => {
    const layoutSource = readFile('src/app/layout.tsx');
    expect(layoutSource).toContain("title: 'possibility GmbH'");
    expect(layoutSource).toContain('description');
  });
});

// ============================================================================
// E2E Szenario 3: Build-Pipeline funktioniert
// ============================================================================

describe('E2E: Build-Pipeline - Alle Toolchain-Schritte sind konfiguriert', () => {
  it('Static Export Build ist korrekt konfiguriert', () => {
    const config = readFile('next.config.mjs');
    expect(config).toContain("output: 'export'");
    expect(config).toContain('unoptimized: true');
  });

  it('Build-Output Verzeichnis existiert (out/)', () => {
    expect(fileExists('out')).toBe(true);
  });

  it('Build-Output enthaelt index.html', () => {
    expect(fileExists('out/index.html')).toBe(true);
  });

  it('Build-Output index.html enthaelt valides HTML', () => {
    if (fileExists('out/index.html')) {
      const html = readFile('out/index.html');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('lang="de"');
      expect(html).toContain('</html>');
    }
  });

  it('Build-Output index.html enthaelt den Seitentitel', () => {
    if (fileExists('out/index.html')) {
      const html = readFile('out/index.html');
      expect(html).toContain('possibility GmbH');
    }
  });

  it('CI Workflow definiert vollstaendige Quality-Pipeline', () => {
    const ci = readFile('.github/workflows/ci.yml');

    // Alle Schritte muessen vorhanden sein
    expect(ci).toContain('Run ESLint');
    expect(ci).toContain('Run Prettier check');
    expect(ci).toContain('Run TypeScript type-check');
    expect(ci).toContain('Run tests');
    expect(ci).toContain('Build project');
    expect(ci).toContain('Verify build output');
  });

  it('GitHub Actions Workflows nutzen aktuelle Action-Versionen (v4)', () => {
    const ci = readFile('.github/workflows/ci.yml');
    expect(ci).toContain('actions/checkout@v4');
    expect(ci).toContain('actions/setup-node@v4');
  });
});

// ============================================================================
// E2E Szenario 4: Code-Qualitaet wird durchgesetzt
// ============================================================================

describe('E2E: Code-Qualitaet - Werkzeuge arbeiten zusammen', () => {
  it('ESLint + Prettier + TypeScript bilden eine lueckenlose Pruefkette', () => {
    const eslint = readJSON('.eslintrc.json') as {
      extends: string[];
      plugins: string[];
    };

    // ESLint erweitert Prettier (verhindert Konflikte)
    expect(eslint.extends).toContain('prettier');
    // ESLint nutzt TypeScript-Parser
    expect(eslint.plugins).toContain('@typescript-eslint');
    // TypeScript strict mode ist aktiv
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: Record<string, unknown>;
    };
    expect(tsconfig.compilerOptions.strict).toBe(true);
  });

  it('Prettier Tailwind-Plugin ist integriert fuer konsistente Klassen-Sortierung', () => {
    const prettier = readJSON('.prettierrc.json') as { plugins: string[] };
    const pkg = readJSON('package.json') as {
      devDependencies: Record<string, string>;
    };

    expect(prettier.plugins).toContain('prettier-plugin-tailwindcss');
    expect(pkg.devDependencies['prettier-plugin-tailwindcss']).toBeDefined();
  });

  it('Jest-Konfiguration ist korrekt fuer Next.js eingerichtet', () => {
    const jestConfig = readFile('jest.config.js');
    expect(jestConfig).toContain('next/jest');
    expect(jestConfig).toContain('jsdom');
    expect(jestConfig).toContain('jest.setup.ts');
  });

  it('Jest collectCoverageFrom schliesst Test-Dateien und .d.ts aus', () => {
    const jestConfig = readFile('jest.config.js');
    expect(jestConfig).toContain('collectCoverageFrom');
    expect(jestConfig).toContain('!src/**/*.test.{ts,tsx}');
    expect(jestConfig).toContain('!src/**/*.d.ts');
  });

  it('Jest Module-Name-Mapper unterstuetzt @/ Path-Alias', () => {
    const jestConfig = readFile('jest.config.js');
    expect(jestConfig).toContain("'^@/(.*)$'");
    expect(jestConfig).toContain('<rootDir>/src/$1');
  });

  it('TypeScript noEmit ist konfiguriert (nur Type-Checking)', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: Record<string, unknown>;
    };
    expect(tsconfig.compilerOptions.noEmit).toBe(true);
  });

  it('TypeScript isolatedModules ist aktiv (fuer schnellere Kompilierung)', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: Record<string, unknown>;
    };
    expect(tsconfig.compilerOptions.isolatedModules).toBe(true);
  });
});

// ============================================================================
// E2E Szenario 5: Hosting und Deployment-Konfiguration
// ============================================================================

describe('E2E: Hosting & Deployment - Vercel-Integration komplett', () => {
  it('Deploy Workflow ist fuer automatische Vercel-Deployments konfiguriert', () => {
    const deploy = readFile('.github/workflows/deploy.yml');
    expect(deploy).toContain('Deploy to Vercel');
    expect(deploy).toContain('push');
    expect(deploy).toContain('main');
  });

  it('README dokumentiert den vollstaendigen Deployment-Workflow', () => {
    const readme = readFile('README.md');

    // Push auf main -> Production
    expect(readme).toContain('Push auf `main`');
    expect(readme).toContain('Production-Deployment');

    // Pull Request -> Preview
    expect(readme).toContain('Pull Request');
    expect(readme).toContain('Preview-Deployment');
  });

  it('README dokumentiert alle Vercel-Features', () => {
    const readme = readFile('README.md');
    expect(readme).toContain('SSL-Zertifikate');
    expect(readme).toContain('CDN');
    expect(readme).toContain('Custom-Domain');
    expect(readme).toContain('HTTP');
    expect(readme).toContain('HTTPS');
  });

  it('Static Export ist korrekt fuer CDN-Hosting konfiguriert', () => {
    const config = readFile('next.config.mjs');
    // Static Export generiert nur statische HTML-Dateien
    expect(config).toContain("output: 'export'");
    // Bilder muessen unoptimized sein fuer Static Export
    expect(config).toContain('unoptimized: true');
  });
});

// ============================================================================
// E2E Szenario 6: Fehler-Faelle und Edge Cases
// ============================================================================

describe('E2E: Edge Cases und Fehler-Faelle', () => {
  it('package.json und package-lock.json Versionen sind konsistent', () => {
    const pkg = readJSON('package.json') as { name: string; version: string };
    const lockfile = readJSON('package-lock.json') as {
      name: string;
      version: string;
    };

    expect(pkg.name).toBe(lockfile.name);
    expect(pkg.version).toBe(lockfile.version);
  });

  it('Keine .env Datei ist versioniert (Security)', () => {
    const gitignore = readFile('.gitignore');
    expect(gitignore).toMatch(/\.env/);
  });

  it('Build-Output .next wird nicht versioniert', () => {
    const gitignore = readFile('.gitignore');
    expect(gitignore).toContain('.next');
  });

  it('Coverage-Verzeichnis wird nicht versioniert', () => {
    const gitignore = readFile('.gitignore');
    expect(gitignore).toContain('coverage');
  });

  it('HomePage rendert mehrfach ohne Seiteneffekte', () => {
    const { unmount: unmount1 } = render(<HomePage />);
    expect(screen.getByRole('heading')).toHaveTextContent('possibility GmbH');
    unmount1();

    const { unmount: unmount2 } = render(<HomePage />);
    expect(screen.getByRole('heading')).toHaveTextContent('possibility GmbH');
    unmount2();

    render(<HomePage />);
    expect(screen.getByRole('heading')).toHaveTextContent('possibility GmbH');
  });

  it('RootLayout rendert leeren Content ohne Fehler', () => {
    expect(() => {
      render(
        <RootLayout>
          <></>
        </RootLayout>
      );
    }).not.toThrow();
  });

  it('RootLayout rendert verschachtelte Kinder korrekt', () => {
    render(
      <RootLayout>
        <div data-testid="outer">
          <div data-testid="inner">
            <span data-testid="deep">Tief verschachtelt</span>
          </div>
        </div>
      </RootLayout>
    );

    expect(screen.getByTestId('deep')).toHaveTextContent('Tief verschachtelt');
  });

  it('Alle Config-Dateien sind valides JSON/JS (keine Syntax-Fehler)', () => {
    // JSON configs
    expect(() => readJSON('package.json')).not.toThrow();
    expect(() => readJSON('tsconfig.json')).not.toThrow();
    expect(() => readJSON('.eslintrc.json')).not.toThrow();
    expect(() => readJSON('.prettierrc.json')).not.toThrow();
  });

  it('tsconfig.json includes decken alle relevanten Dateitypen ab', () => {
    const tsconfig = readJSON('tsconfig.json') as { include: string[] };
    const includesTS = tsconfig.include.some((i: string) => i.includes('*.ts'));
    const includesTSX = tsconfig.include.some((i: string) =>
      i.includes('*.tsx')
    );
    expect(includesTS || includesTSX).toBe(true);
  });
});

// ============================================================================
// E2E Szenario 7: Projekt-Struktur-Validierung
// ============================================================================

describe('E2E: Projekt-Struktur vollstaendig und konsistent', () => {
  it('src/ Verzeichnis hat korrekte Unterverzeichnisse', () => {
    expect(fileExists('src/app')).toBe(true);
    expect(fileExists('src/__tests__')).toBe(true);
  });

  it('public/ Verzeichnis existiert fuer statische Assets', () => {
    expect(fileExists('public')).toBe(true);
  });

  it('.github/workflows/ Verzeichnis enthaelt CI und Deploy Workflows', () => {
    expect(fileExists('.github/workflows/ci.yml')).toBe(true);
    expect(fileExists('.github/workflows/deploy.yml')).toBe(true);
  });

  it('Test-Verzeichnisstruktur hat Integration und E2E Unterverzeichnisse', () => {
    expect(fileExists('src/__tests__/integration')).toBe(true);
    expect(fileExists('src/__tests__/e2e')).toBe(true);
  });

  it('TypeScript JSX ist auf "preserve" gesetzt (fuer Next.js)', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: Record<string, unknown>;
    };
    expect(tsconfig.compilerOptions.jsx).toBe('preserve');
  });

  it('TypeScript moduleResolution ist "bundler" (fuer Next.js App Router)', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: Record<string, unknown>;
    };
    expect(tsconfig.compilerOptions.moduleResolution).toBe('bundler');
  });
});
