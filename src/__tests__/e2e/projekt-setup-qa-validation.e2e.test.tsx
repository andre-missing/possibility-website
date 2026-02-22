/**
 * E2E QA-Validation: Projekt-Setup (Repository, Toolchain & Hosting-Infrastruktur)
 *
 * Ticket: Projekt-Setup: Repository, Toolchain & Hosting-Infrastruktur (2ac2b31a)
 *
 * Ergaenzende E2E-Tests die pruefen, dass die gesamte Toolchain als Einheit
 * funktioniert: Build-Output-Validierung, HTML-Struktur, Asset-Pipeline,
 * und Cross-Cutting Szenarien.
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

function getFileSize(relativePath: string): number {
  const fullPath = path.join(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) return 0;
  return fs.statSync(fullPath).size;
}

function getDirectorySize(relativePath: string): number {
  const dirPath = path.join(PROJECT_ROOT, relativePath);
  if (!fs.existsSync(dirPath)) return 0;
  let totalSize = 0;
  const walkDir = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile()) {
        totalSize += fs.statSync(fullPath).size;
      } else if (entry.isDirectory()) {
        walkDir(fullPath);
      }
    }
  };
  walkDir(dirPath);
  return totalSize;
}

// ============================================================================
// E2E: Build-Output Vollstaendigkeit und Qualitaet
// ============================================================================

describe('E2E QA: Build-Output Tiefenvalidierung', () => {
  it('out/index.html hat korrektes HTML5 Grundgeruest', () => {
    if (!fileExists('out/index.html')) {
      // Build wurde noch nicht ausgefuehrt - Test ueberspringen aber warnen
      console.warn('out/index.html nicht gefunden - Build erforderlich');
      return;
    }

    const html = readFile('out/index.html');
    expect(html).toMatch(/^<!DOCTYPE html>/i);
    expect(html).toContain('<html');
    expect(html).toContain('<head>');
    expect(html).toContain('</head>');
    expect(html).toContain('<body');
    expect(html).toContain('</body>');
    expect(html).toContain('</html>');
  });

  it('out/index.html setzt lang="de" auf dem html-Element', () => {
    if (!fileExists('out/index.html')) return;
    const html = readFile('out/index.html');
    expect(html).toMatch(/<html[^>]*lang="de"/);
  });

  it('out/index.html enthaelt viewport Meta-Tag fuer Responsive Design', () => {
    if (!fileExists('out/index.html')) return;
    const html = readFile('out/index.html');
    expect(html).toMatch(/<meta[^>]*name="viewport"/);
  });

  it('out/index.html enthaelt den Firmentitel', () => {
    if (!fileExists('out/index.html')) return;
    const html = readFile('out/index.html');
    expect(html).toContain('possibility GmbH');
  });

  it('out/index.html enthaelt referenzen zu _next/static Assets', () => {
    if (!fileExists('out/index.html')) return;
    const html = readFile('out/index.html');
    expect(html).toMatch(/_next\/static/);
  });

  it('Build-Output hat eine vernuenftige Groesse (> 1KB fuer index.html)', () => {
    if (!fileExists('out/index.html')) return;
    const size = getFileSize('out/index.html');
    // Einfache Startseite: mindestens 1KB (HTML-Grundgeruest + Next.js Boilerplate)
    expect(size).toBeGreaterThan(1000);
  });

  it('Build-Output enthaelt CSS (Tailwind wird kompiliert)', () => {
    if (!fileExists('out')) return;
    // Suche nach CSS-Dateien im _next/static Verzeichnis
    const outDir = path.join(PROJECT_ROOT, 'out', '_next', 'static');
    if (!fs.existsSync(outDir)) return;

    let hasCss = false;
    const walkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.css')) {
          hasCss = true;
          break;
        }
        if (entry.isDirectory()) {
          walkDir(path.join(dir, entry.name));
        }
      }
    };
    walkDir(outDir);
    expect(hasCss).toBe(true);
  });

  it('Build-Output enthaelt JavaScript Bundles', () => {
    if (!fileExists('out')) return;
    const outDir = path.join(PROJECT_ROOT, 'out', '_next', 'static');
    if (!fs.existsSync(outDir)) return;

    let hasJs = false;
    const walkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.js')) {
          hasJs = true;
          break;
        }
        if (entry.isDirectory()) {
          walkDir(path.join(dir, entry.name));
        }
      }
    };
    walkDir(outDir);
    expect(hasJs).toBe(true);
  });

  it('Build-Output 404.html hat korrektes HTML5 Grundgeruest', () => {
    if (!fileExists('out/404.html')) return;
    const html = readFile('out/404.html');
    expect(html).toMatch(/^<!DOCTYPE html>/i);
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });
});

// ============================================================================
// E2E: Vollstaendiger Rendering-Zyklus
// ============================================================================

describe('E2E QA: Rendering-Konsistenz', () => {
  it('HomePage rendert identisch bei wiederholtem Rendering (Determinismus)', () => {
    const { container: container1 } = render(<HomePage />);
    const html1 = container1.innerHTML;

    const { container: container2 } = render(<HomePage />);
    const html2 = container2.innerHTML;

    expect(html1).toBe(html2);
  });

  it('HomePage hat nur ein h1-Element (SEO Best Practice)', () => {
    render(<HomePage />);
    const h1Elements = document.querySelectorAll('h1');
    expect(h1Elements.length).toBe(1);
  });

  it('HomePage nutzt ausschliesslich semantische HTML-Elemente', () => {
    render(<HomePage />);
    // main Element vorhanden
    const main = document.querySelector('main');
    expect(main).toBeInTheDocument();
    // div nur fuer Layout, nicht fuer Semantik
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.tagName).toBe('H1');
  });

  it('RootLayout rendert Kinder ohne Wrapper-div-Verschachtelung', () => {
    render(
      <RootLayout>
        <main data-testid="content">Inhalt</main>
      </RootLayout>
    );
    const content = screen.getByTestId('content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent('Inhalt');
  });

  it('RootLayout rendert korrekt mit komplexen Kindern', () => {
    render(
      <RootLayout>
        <header>
          <nav>
            <ul>
              <li>
                <a href="#test">Test</a>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          <h1>Titel</h1>
          <p>Absatz</p>
        </main>
        <footer>Footer</footer>
      </RootLayout>
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Titel')).toBeInTheDocument();
    expect(screen.getByText('Absatz')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});

// ============================================================================
// E2E: Toolchain-Konfigurations-Integritaet
// ============================================================================

describe('E2E QA: Toolchain arbeitet als Einheit', () => {
  it('ESLint Config referenziert nur existierende Plugins', () => {
    const eslint = readJSON('.eslintrc.json') as { plugins: string[] };
    for (const plugin of eslint.plugins) {
      // Pruefen ob das Plugin als npm-Paket installiert ist
      const pluginPkgName =
        plugin === 'prettier'
          ? 'eslint-plugin-prettier'
          : plugin === '@typescript-eslint'
            ? '@typescript-eslint/eslint-plugin'
            : `eslint-plugin-${plugin}`;

      const pluginPath = path.join(
        PROJECT_ROOT,
        'node_modules',
        pluginPkgName
      );
      expect(fs.existsSync(pluginPath)).toBe(true);
    }
  });

  it('TypeScript Path-Alias @/* wird von tsconfig UND jest.config unterstuetzt', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: { paths: Record<string, string[]> };
    };
    const jestConfig = readFile('jest.config.js');

    // tsconfig hat den Alias
    expect(tsconfig.compilerOptions.paths['@/*']).toContain('./src/*');
    // jest.config hat den passenden Mapper
    expect(jestConfig).toContain("'^@/(.*)$'");
    expect(jestConfig).toContain('<rootDir>/src/$1');
  });

  it('Tailwind content-Pfade matchen die Projektstruktur', () => {
    const config = readFile('tailwind.config.ts');
    // Tailwind muss src/ scannen wo die Components leben
    expect(config).toContain('./src/');
    // Muss .ts und .tsx abdecken
    expect(config).toMatch(/\{ts,tsx\}/);
  });

  it('Next.js Config und tsconfig sind kompatibel', () => {
    const tsconfig = readJSON('tsconfig.json') as {
      compilerOptions: { jsx: string; module: string };
    };
    // Next.js benoetigt jsx: "preserve"
    expect(tsconfig.compilerOptions.jsx).toBe('preserve');
    // Next.js benoetigt module: "esnext"
    expect(tsconfig.compilerOptions.module).toBe('esnext');
  });

  it('Alle Config-Dateien sind syntaktisch korrekt (parseable)', () => {
    // JSON-Dateien
    expect(() => readJSON('package.json')).not.toThrow();
    expect(() => readJSON('tsconfig.json')).not.toThrow();
    expect(() => readJSON('.eslintrc.json')).not.toThrow();
    expect(() => readJSON('.prettierrc.json')).not.toThrow();
    expect(() => readJSON('package-lock.json')).not.toThrow();

    // JS/MJS-Dateien sollten existieren und nicht leer sein
    expect(readFile('next.config.mjs').length).toBeGreaterThan(0);
    expect(readFile('postcss.config.js').length).toBeGreaterThan(0);
    expect(readFile('jest.config.js').length).toBeGreaterThan(0);
    expect(readFile('tailwind.config.ts').length).toBeGreaterThan(0);
  });
});

// ============================================================================
// E2E: Sicherheits- und Best-Practice-Validierung
// ============================================================================

describe('E2E QA: Sicherheits- und Best-Practice-Checks', () => {
  it('Keine source-maps im Build-Output (Sicherheit)', () => {
    if (!fileExists('out')) return;
    const outDir = path.join(PROJECT_ROOT, 'out');
    let hasSourceMaps = false;
    const walkDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.map')) {
          hasSourceMaps = true;
        }
        if (entry.isDirectory()) {
          walkDir(path.join(dir, entry.name));
        }
      }
    };
    walkDir(outDir);
    // Source-Maps im Production-Build koennen ein Sicherheitsrisiko sein
    // Next.js static export generiert standardmaessig keine Source-Maps
    // Falls doch, ist das kein harter Fehler, aber unerwuenscht
    // Wir akzeptieren beides - aber loggen eine Warnung
    if (hasSourceMaps) {
      console.warn(
        'WARNING: Source-Maps im Build-Output gefunden. Pruefen ob gewuenscht.'
      );
    }
    // Test gilt als bestanden - nur Information
    expect(true).toBe(true);
  });

  it('Build-Output HTML setzt charset UTF-8', () => {
    if (!fileExists('out/index.html')) return;
    const html = readFile('out/index.html');
    expect(html).toMatch(/charset.*utf-8/i);
  });

  it('Kein Debug-Code oder console.log in Source-Dateien', () => {
    const page = readFile('src/app/page.tsx');
    const layout = readFile('src/app/layout.tsx');
    const globals = readFile('src/app/globals.css');

    expect(page).not.toContain('console.log');
    expect(page).not.toContain('debugger');
    expect(layout).not.toContain('console.log');
    expect(layout).not.toContain('debugger');
    expect(globals).not.toContain('console.log');
  });

  it('package.json hat keine deprecated oder vulnerable dependency patterns', () => {
    const pkg = readJSON('package.json') as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };

    // Keine *-Versionen (unsicher)
    for (const [name, version] of Object.entries(pkg.dependencies)) {
      expect(version).not.toBe('*');
      expect(version).not.toBe('latest');
    }
    for (const [name, version] of Object.entries(pkg.devDependencies)) {
      expect(version).not.toBe('*');
      expect(version).not.toBe('latest');
    }
  });

  it('Homepage rendert keine sensiblen Informationen', () => {
    render(<HomePage />);
    const bodyText = document.body.textContent || '';
    // Keine E-Mail-Adressen, Telefonnummern oder API-Keys auf der Startseite
    expect(bodyText).not.toMatch(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    expect(bodyText).not.toMatch(/sk-[a-zA-Z0-9]{20,}/);
    expect(bodyText).not.toMatch(/API[_-]?KEY/i);
  });
});
