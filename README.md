# Interactive CV / Developer Portfolio

<p align="center">
  <a href="https://lukaszkomur.dev">
    <img src="https://img.shields.io/badge/Website-lukaszkomur.dev-0f172a?style=for-the-badge&logo=firefoxbrowser&logoColor=white" alt="Website" />
  </a>
  <a href="https://www.linkedin.com/in/%C5%82ukasz-komur-553042117/">
    <img src="https://img.shields.io/badge/LinkedIn-Lukasz%20Komur-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="https://github.com/LaionFromNight">
    <img src="https://img.shields.io/badge/GitHub-LaionFromNight-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-Custom%20Portfolio%20Template%20License-f59e0b?style=for-the-badge" alt="License" />
  </a>
</p>

<p align="center">
  <strong>Public React + TypeScript + Vite interactive CV and developer portfolio for Lukasz Komur.</strong>
</p>

<p align="center">
  JSON-driven profile data, generated PDF CV, static crawler-friendly SEO output, and configurable static pages powered by a lightweight file-based CMS.
</p>

---

## About Lukasz Komur

This repository contains the source code for the original interactive CV / developer portfolio of **Lukasz Komur**.

- Website: https://lukaszkomur.dev
- GitHub: https://github.com/LaionFromNight
- LinkedIn: https://www.linkedin.com/in/%C5%82ukasz-komur-553042117/

## What this project offers

This project provides a modern interactive CV / developer portfolio with:

- interactive experience explorer with project filtering and detail views,
- JSON-driven profile, skills, experience, education and contact data,
- generated PDF CV from the same data source,
- SEO, Open Graph, Twitter Card and Schema.org metadata,
- crawler-friendly static homepage fallback injected at build time,
- configurable static pages generated from `src/data/cms.json`,
- sitemap and `robots.txt` generation,
- GitHub Pages deployment support.

## Forking and creating your own portfolio

You may fork this repository and create your own personal portfolio based on it.

Before publishing your own version, you must replace all personal data, branding, links, images and content related to **Lukasz Komur** with your own.

The intended customization layer is:

- `src/data/cv.json`
- `src/data/seo.json`
- `src/data/cms.json`
- public assets such as personal images, favicons, icons and Open Graph images

You may use the project as a portfolio template by changing your own data/configuration files and deploying your own version.

## What you may change in your fork

You may change:

- CV/profile data in `src/data/cv.json`,
- SEO/site metadata in `src/data/seo.json`,
- generated static pages in `src/data/cms.json`,
- public assets used for your own profile, favicon and Open Graph images,
- deployment configuration needed for your own website.

## Core changes and pull requests

The core application code should remain aligned with the original project.

Changes to the core system should be proposed through pull requests to the main repository, especially changes to:

- React components,
- layout and styling system,
- static page renderer,
- CMS renderer,
- SEO/build pipeline,
- PDF renderer,
- scripts and build tooling,
- application architecture.

The goal is simple: forks should customize personal data, while improvements to the core portfolio engine should be contributed back through pull requests.

## Identity and branding notice

Lukasz Komur’s personal identity, CV data, profile content, experience, images, links, website branding and personal materials are not licensed for reuse.

Do not publish a fork that presents Lukasz Komur’s identity, experience, profile or personal content as your own.

If you publish your own version, replace the original personal content with your own data.

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React PDF

## Features

- Interactive experience explorer with project filtering and detail views.
- Skills, timeline, education, contact links, and profile summary driven from `src/data/cv.json`.
- SEO, Open Graph, Twitter Card, favicon, manifest, and Schema.org metadata driven from `src/data/seo.json`.
- CV Studio: generated PDF CV from the same JSON data source, with 5 layouts, 17 color palettes in 6 groups, 5 font pairings, A4 / US Letter, 3 content levels, 3 densities, section toggles and a live preview of the real PDF.
- Static crawler-friendly homepage fallback injected into the root HTML at build time.
- Configurable static marketing/content pages generated from `src/data/cms.json`.
- JSON-LD structured data using Schema.org `Person`, `ProfessionalService`, `WebSite`, `BreadcrumbList`, and `ProfilePage`.
- `robots.txt` and `sitemap.xml` for crawler discovery.
- Static GitHub Pages deployment.

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

The build runs TypeScript checks, creates the Vite app in `dist/`, applies metadata from `src/data/seo.json`, injects the crawler-readable homepage fallback from `src/data/cv.json`, and generates enabled static pages from `src/data/cms.json`.

Preview the production build locally:

```bash
npm run preview
```

## PDF CV Studio

The "Download CV" button opens **CV Studio** — a PDF generator that builds the CV in the browser from `src/data/cv.json`.

- **Layouts:** Classic (single column, ATS-friendly), Sidebar, Modern (header band), Elegant (gutter titles), Timeline.
- **Colors:** palettes grouped as Neutral, Corporate blues, Warm, Natural, Creative and Accessible/print. Every layout works with every palette.
- **Typography:** Inter, Lora + Source Sans 3, Playfair Display + Source Sans 3, Lora, Source Sans 3. Full latin-ext TTFs live in `public/assets/fonts`, so Polish and other diacritics render correctly.
- **Format:** A4 or US Letter; Concise (aims for 1 page) / Standard / Detailed content; Compact / Balanced / Airy density.
- **Sections:** photo, QR code, links, skill levels, education, languages, strengths, interests; optional GDPR / US / PIPL consent clause.
- **Preview:** the right-hand pane renders the actual PDF with pdf.js and refreshes as options change; layout thumbnails repaint instantly when hovering a palette. The chosen options are remembered in `localStorage`.

Optional configuration in `cv.json`:

```json
"pdf": {
  "qr_code": { "target_url": "https://your-site.dev/", "label": "your-site.dev" },
  "profile_focus": ["Backend", "System Design"],
  "labels": { "summary": "Podsumowanie", "experience": "Doświadczenie", "present": "obecnie" }
}
```

The QR code is generated in the browser from `target_url` (or from a profile with id `cv`, `website` or `portfolio`). Section labels can be translated through `pdf.labels`.

Code lives in `src/components/pdf/`: `CvPdfOptions.ts` (option catalogs), `theme/` (palettes, typography scale), `model/buildCvViewModel.ts` (data normalization, privacy rules, content limits) and `layouts/` (one component per layout).

## CMS static pages

`src/data/cms.json` works as a lightweight file-based CMS for generated static pages.

Global SEO/site defaults remain in `src/data/seo.json`; page content and static-page navigation live in `cms.json`.

Use `staticPagesNavLabel` to set the header dropdown label used when more than one static page is enabled. The default/fallback label is `More`.

Each object in `staticPages` can create one generated page:

```json
{
  "enabled": true,
  "path": "/example-page/",
  "navLabel": "Example page",
  "navDescription": "Short description shown in the header dropdown.",
  "title": "Example page – Lukasz Komur",
  "description": "SEO description for the generated page.",
  "canonical": "https://lukaszkomur.dev/example-page/",
  "robots": "index, follow, max-image-preview:large",
  "tone": "violet",
  "openGraph": {
    "title": "Example page – Lukasz Komur",
    "description": "Open Graph description.",
    "url": "https://lukaszkomur.dev/example-page/"
  },
  "twitter": {
    "title": "Example page – Lukasz Komur",
    "description": "Twitter card description."
  },
  "h1": "Example page",
  "lead": "Hero lead text.",
  "heroNote": "Optional note below hero CTAs.",
  "ctas": [
    {
      "label": "Primary action",
      "href": "https://example.com",
      "variant": "primary"
    }
  ],
  "sections": []
}
```

### Publishing rules

- `enabled: true` generates `dist/<path>/index.html`, adds the page to the homepage header navigation, sitemap, and generated navigation metadata.
- `enabled: false` keeps the page as a draft/reference; it is not generated, linked, added to the sitemap, or shown in the header.
- Disabled pages may be incomplete.
- Enabled pages are validated during `npm run build`.
- `redirectFrom` can contain old paths, for example `["/why/"]`, and creates redirect pages for enabled pages only.

### Header behavior

- Zero enabled static pages: only internal homepage section links are shown.
- One enabled static page: it is shown directly as a normal nav item.
- Two or more enabled static pages: they are shown in a dropdown using `staticPagesNavLabel`, with `navLabel` and `navDescription` for each item.

### Allowed page and section tones

- `violet` — default, preserves the original generated-page accent style.
- `gold` — restrained amber/gold accents.
- `blue` — calm blue accents.
- `emerald` — green/teal accents.
- `rose` — subtle rose accents.
- `slate` — neutral gray/steel accents.

If `tone` is omitted, the page uses `violet`. Sections may also set `tone` to override the page tone for that section.

### Supported CTA fields

```json
{
  "label": "Contact me",
  "href": "mailto:contact@lukaszkomur.dev",
  "variant": "primary"
}
```

Allowed CTA variants:

- `primary`
- `secondary`

CTAs can be placed at page level with `ctas` or `cta`, and inside sections with `ctas` or `cta`.

### Supported section fields

- `heading` — required for enabled pages.
- `tone` — optional section tone override.
- `description` — short intro paragraph.
- `body` — single paragraph.
- `paragraphs` — array of regular paragraphs.
- `animatedParagraphs` — array of paragraph blocks with subtle hover states.
- `badges` — array of compact highlighted chips.
- `items` — array of items rendered as chips by default.
- `itemsStyle` — `chips` or `list`; `list` renders a detailed bullet list.
- `animatedList` — array of semantic list items with subtle hover states.
- `animatedListStyle` — `list`, `cards`, or `chips`; defaults to `list`.
- `cards` — array of `{ "title": "...", "description": "..." }`.
- `ctas` / `cta` — section-level actions.

Section render order is:

1. `heading`
2. `description`
3. `body`
4. `paragraphs`
5. `animatedParagraphs`
6. `badges`
7. `cards`
8. `items`
9. `animatedList`
10. `ctas` / `cta`

The disabled `/example/` entry in `src/data/cms.json` is the reference page for all supported static-page content blocks. Enable it locally only to preview the renderer, then disable it again before committing.

## License

This project is not distributed under a plain MIT license.

The source is available under a custom portfolio template license. You may fork and use it as a personal portfolio template under the conditions described in `LICENSE`.

You may customize your own JSON data/configuration and personal assets, but you may not reuse Lukasz Komur’s personal identity, CV data, images, links, branding or content.

Core system changes should be proposed through pull requests to the main repository.