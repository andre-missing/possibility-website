# possibility.gmbh Website

Statische Unternehmenswebsite der possibility GmbH, gebaut mit Next.js und gehostet auf Vercel.

## Tech-Stack

| Komponente | Technologie                             |
| ---------- | --------------------------------------- |
| Framework  | Next.js 14+ (App Router, Static Export) |
| Sprache    | TypeScript (Strict Mode)                |
| Styling    | Tailwind CSS v3                         |
| Linting    | ESLint + Prettier                       |
| Hosting    | Vercel (CDN, SSL, CI/CD)                |
| Repository | GitHub                                  |
| CI         | GitHub Actions                          |

## Framework-Entscheidung (ADR)

### Next.js mit Static Export

**Entscheidung:** Next.js 14+ mit `output: 'export'` als Frontend-Framework.

**Begründung:**

- Bietet das beste Gleichgewicht zwischen Einfachheit für statische Seiten und Zukunftsfähigkeit (SSR/ISR jederzeit aktivierbar ohne Migration)
- App Router ist der offizielle Standard ab Next.js 13+
- TypeScript nativ integriert
- Größtes Ökosystem im React-Umfeld (Entwickler-Verfügbarkeit, Community-Support)
- Enge Integration mit Vercel eliminiert Hosting-Komplexität

**Alternativen:** Astro (kleineres Ökosystem), Gatsby (Wartungsmodus), Nuxt/Vue (kleinerer Talent-Pool in DACH), Plain HTML/CSS (keine Skalierbarkeit).

### Tailwind CSS als CSS-Architektur

**Entscheidung:** Tailwind CSS v3 als Utility-First CSS-Framework.

**Begründung:**

- De-facto-Standard für Utility-First-Styling in modernen React/Next.js-Projekten
- Kein Naming-Problem, automatisches Purging, konsistentes Design-System
- `prettier-plugin-tailwindcss` für automatische Klassen-Sortierung

**CSS-Konventionen:**

- Utility-First: Tailwind-Klassen direkt in JSX verwenden
- Custom-Styles nur in `globals.css` via `@layer`-Directives
- Brand-Farben und Fonts via `tailwind.config.ts` konfiguriert
- Keine CSS-Module oder CSS-in-JS

## Voraussetzungen

- [Node.js](https://nodejs.org/) >= 18.17
- npm >= 9

## Lokales Setup

```bash
# Repository klonen
git clone https://github.com/possibility-gmbh/possibility-website.git
cd possibility-website

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die Website ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Verfügbare Scripts

| Script                  | Beschreibung                                                     |
| ----------------------- | ---------------------------------------------------------------- |
| `npm run dev`           | Startet den Next.js-Entwicklungsserver mit Hot-Reload            |
| `npm run build`         | Erstellt einen statischen Production-Build im `out/`-Verzeichnis |
| `npm run start`         | Startet einen lokalen Server für den Production-Build            |
| `npm run lint`          | Führt ESLint-Prüfung für alle TypeScript-Dateien aus             |
| `npm run format`        | Formatiert alle Dateien mit Prettier                             |
| `npm run format:check`  | Prüft Formatierung ohne Änderungen                               |
| `npm run type-check`    | TypeScript-Kompilierungsprüfung ohne Output                      |
| `npm test`              | Führt Unit Tests mit Jest aus                                    |
| `npm run test:watch`    | Führt Tests im Watch-Modus aus                                   |
| `npm run test:coverage` | Führt Tests mit Coverage-Report aus                              |

## Deployment

### Vercel (Production)

Das Deployment erfolgt automatisch über die Vercel GitHub-Integration:

1. **Push auf `main`** -> Automatisches Production-Deployment auf [possibility.gmbh](https://possibility.gmbh)
2. **Pull Request** -> Automatisches Preview-Deployment mit eigener URL

Vercel übernimmt:

- Automatische SSL-Zertifikate (kein manuelles Let's Encrypt)
- Globales CDN (Edge Network)
- Custom-Domain-Konfiguration
- HTTP -> HTTPS Redirect
- www -> non-www Redirect

### CI Pipeline

Bei jedem Pull Request und Push auf `main` läuft die CI-Pipeline:

1. **Lint** - ESLint-Prüfung
2. **Format Check** - Prettier-Prüfung
3. **Type Check** - TypeScript-Kompilierung
4. **Tests** - Unit Tests
5. **Build** - Statischer Build mit Verifikation

Ein fehlerhafter Build blockiert das Deployment.

## Architektur

```
possibility-website/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root-Layout (HTML-Grundgerüst)
│   │   ├── page.tsx          # Startseite
│   │   └── globals.css       # Globale Styles + Tailwind Directives
│   └── __tests__/            # Unit Tests
├── public/                   # Statische Assets (Favicon, Bilder)
├── .github/workflows/        # GitHub Actions CI/CD
├── next.config.mjs           # Next.js-Konfiguration (Static Export)
├── tailwind.config.ts        # Tailwind CSS-Konfiguration
├── tsconfig.json             # TypeScript-Konfiguration (Strict)
├── .eslintrc.json            # ESLint-Regeln
├── .prettierrc.json          # Prettier-Konfiguration
└── postcss.config.js         # PostCSS-Pipeline
```
