# Interactive CV / Developer Portfolio

Public React + TypeScript + Vite portfolio for Lukasz Komur.

Live URL: https://lukaszkomur.dev

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React PDF

## Features

- Interactive experience explorer with project filtering and detail views
- Skills, timeline, education, contact links, and profile summary driven from `src/data/cv.json`
- SEO, Open Graph, Twitter Card, favicon, manifest, and Schema.org metadata driven from `src/data/seo.json`
- Generated PDF CV from the same JSON data source
- Static crawler-friendly CV page generated at build time under `/cv/`
- Static "work with me" page generated at build time under `/work-with-me/`
- JSON-LD structured data using Schema.org `Person`, `ProfessionalService`, `WebSite`, `BreadcrumbList`, and `ProfilePage`
- `robots.txt` and `sitemap.xml` for crawler discovery
- Static GitHub Pages deployment

## Development

Install dependencies:

```bash
npm install
```

Run the local dev server:

```bash
npm run dev
```

Build the production site:

```bash
npm run build
```

The build runs TypeScript checks, creates the Vite app in `dist/`, applies
metadata from `src/data/seo.json`, and then generates `dist/cv/index.html`
from `src/data/cv.json`.

Preview the production build locally:

```bash
npm run preview
```
