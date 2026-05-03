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
- Static crawler-friendly homepage fallback injected into the root HTML at build time
- Configurable static marketing/content pages generated from `src/data/cms.json`
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
metadata from `src/data/seo.json`, injects the crawler-readable homepage
fallback from `src/data/cv.json`, and generates enabled static pages from
`src/data/cms.json`.

## CMS static pages

Generated static pages are controlled by `src/data/cms.json`. Global SEO/site
defaults remain in `src/data/seo.json`; page content and static-page navigation
live in `cms.json`.

Use `staticPagesNavLabel` to set the header dropdown label used when more than
one static page is enabled. The default/fallback label is `More`.

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

Publishing rules:

- `enabled: true` generates `dist/<path>/index.html`, adds the page to the
  homepage header navigation, sitemap, and generated navigation metadata.
- `enabled: false` keeps the page as a draft/reference; it is not generated,
  linked, added to the sitemap, or shown in the header.
- Disabled pages may be incomplete. Enabled pages are validated during
  `npm run build`.
- `redirectFrom` can contain old paths, for example `["/why/"]`, and creates
  redirect pages for enabled pages only.

Header behavior:

- Zero enabled static pages: only internal homepage section links are shown.
- One enabled static page: it is shown directly as a normal nav item.
- Two or more enabled static pages: they are shown in a dropdown using
  `staticPagesNavLabel`, with `navLabel` and `navDescription` for each item.

Allowed page and section tones:

- `violet` - default, preserves the original generated-page accent style.
- `gold` - restrained amber/gold accents.
- `blue` - calm blue accents.
- `emerald` - green/teal accents.
- `rose` - subtle rose accents.
- `slate` - neutral gray/steel accents.

If `tone` is omitted, the page uses `violet`. Sections may also set `tone` to
override the page tone for that section.

Supported CTA fields:

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

CTAs can be placed at page level with `ctas` or `cta`, and inside sections with
`ctas` or `cta`.

Supported section fields:

- `heading` - required for enabled pages.
- `tone` - optional section tone override.
- `description` - short intro paragraph.
- `body` - single paragraph.
- `paragraphs` - array of regular paragraphs.
- `animatedParagraphs` - array of paragraph blocks with subtle hover states.
- `badges` - array of compact highlighted chips.
- `items` - array of items rendered as chips by default.
- `itemsStyle` - `chips` or `list`; `list` renders a detailed bullet list.
- `animatedList` - array of semantic list items with subtle hover states.
- `animatedListStyle` - `list`, `cards`, or `chips`; defaults to `list`.
- `cards` - array of `{ "title": "...", "description": "..." }`.
- `ctas` / `cta` - section-level actions.

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

The disabled `/example/` entry in `src/data/cms.json` is the reference page for
all supported static-page content blocks. Enable it locally only to preview the
renderer, then disable it again before committing.

Preview the production build locally:

```bash
npm run preview
```
