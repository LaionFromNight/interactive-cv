import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import {
  applyTitleTemplate,
  buildRobotsTxt,
  buildSeoHead,
  buildSitemapXml,
  buildStructuredData,
  buildWebManifest,
  escapeHtml,
  getSiteUrl,
  loadJson,
  normalizeLastmod,
  rootDir,
  safeJsonScript,
} from "./seo-utils.mjs";

const indexPath = path.join(rootDir, "dist", "index.html");
const robotsPath = path.join(rootDir, "dist", "robots.txt");
const sitemapPath = path.join(rootDir, "dist", "sitemap.xml");
const manifestPath = path.join(rootDir, "dist", "site.webmanifest");

const getOutputPathForRoute = (routePath) => {
  const relativeRoute = String(routePath ?? "").replace(/^\/+|\/+$/g, "");
  const outputDir = relativeRoute
    ? path.join(rootDir, "dist", relativeRoute)
    : path.join(rootDir, "dist");

  return {
    dir: outputDir,
    file: path.join(outputDir, "index.html"),
  };
};

const seo = await loadJson("src/data/seo.json");
const cv = await loadJson("src/data/cv.json");
const originalHtml = await readFile(indexPath, "utf8");
const siteUrl = getSiteUrl(seo);
const lastmod = normalizeLastmod(cv.meta?.generated_at_local);

const headMatch = originalHtml.match(/<head>[\s\S]*?<\/head>/);
const assetTags = headMatch
  ? Array.from(
      headMatch[0].matchAll(
        /(?:<script\b[^>]*\bsrc=["'][^"']*\/assets\/[^"']+["'][^>]*>\s*<\/script>|<link\b[^>]*\bhref=["'][^"']*\/assets\/[^"']+["'][^>]*>)/g,
      ),
    ).map((match) => match[0])
  : [];

const structuredData = buildStructuredData(seo, {
  pageName: seo.site?.name,
  pageUrl: seo.defaultSeo?.canonical,
  breadcrumbs: [{ name: "Strona główna", item: `${siteUrl}/` }],
});

const nextHead = buildSeoHead({
  seo,
  title: seo.defaultSeo?.title,
  description: seo.defaultSeo?.description,
  canonical: seo.defaultSeo?.canonical,
  robots: seo.defaultSeo?.robots,
  structuredData,
  assetTags,
});

const crawlerBlock = `    <div class="sr-only">
      <p>${escapeHtml(seo.contentSeo?.crawlerNote)}</p>
      <a href="/cv/">${escapeHtml(seo.contentSeo?.crawlerLinkText)}</a>
    </div>`;

const noScriptFallback = `    <noscript>
      <main>
        <h1>${escapeHtml(cv.person?.full_name)}</h1>
        <p>${escapeHtml(cv.person?.headline)}</p>
        <p>${escapeHtml(cv.person?.bio_short)}</p>
      </main>
    </noscript>`;

let html = originalHtml
  .replace(/<html\b[^>]*>/, `<html lang="${escapeHtml(seo.site?.language)}">`)
  .replace(/<head>[\s\S]*?<\/head>/, nextHead)
  .replace(/    <div class="sr-only">[\s\S]*?<\/div>/, crawlerBlock)
  .replace(/    <noscript>[\s\S]*?<\/noscript>/, noScriptFallback);

if (!html.includes(crawlerBlock)) {
  html = html.replace(/<body>/, `<body>\n${crawlerBlock}`);
}

if (!html.includes(noScriptFallback)) {
  html = html.replace(/<script\b/, `${noScriptFallback}\n    <script`);
}

await writeFile(indexPath, html, "utf8");
await writeFile(robotsPath, buildRobotsTxt(seo), "utf8");
await writeFile(sitemapPath, buildSitemapXml(seo, lastmod), "utf8");
await writeFile(manifestPath, `${safeJsonScript(buildWebManifest(seo))}\n`, "utf8");

const contentPage = seo.contentSeo?.page;
if (contentPage) {
  const contentPageOutput = getOutputPathForRoute(contentPage.path);
  const contentPageStructuredData = buildStructuredData(seo, {
    pageName: contentPage.title,
    pageUrl: contentPage.canonical,
    breadcrumbs: [
      { name: "Home", item: `${siteUrl}/` },
      { name: contentPage.title, item: contentPage.canonical },
    ],
  });

  const contentPageHead = buildSeoHead({
    seo,
    title: applyTitleTemplate(seo, contentPage.title),
    description: contentPage.description,
    canonical: contentPage.canonical,
    robots: seo.defaultSeo?.robots,
    structuredData: contentPageStructuredData,
    openGraph: {
      ...contentPage.openGraph,
      url: contentPage.openGraph?.url ?? contentPage.canonical,
    },
    twitter: contentPage.twitter,
  });

  const renderActions = (actions = [], className = "section-actions") => {
    if (!actions.length) return "";

    return `<div class="${className}">${actions
      .map((action) => {
        const variant = action.variant === "secondary" ? "secondary" : "primary";
        return `<a class="action-link action-link-${variant}" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`;
      })
      .join("")}</div>`;
  };

  const renderItems = (section) => {
    if (!section.items?.length) return "";

    if (section.itemsStyle === "list") {
      return `<ul class="detail-list">${section.items
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("")}</ul>`;
    }

    return `<ul class="item-grid">${section.items
      .map((item) => `<li class="interactive-chip">${escapeHtml(item)}</li>`)
      .join("")}</ul>`;
  };

  const sectionHtml = (seo.contentSeo?.sections ?? [])
    .map(
      (section) => `
        <section class="content-section">
          <h2>${escapeHtml(section.heading)}</h2>
          ${section.description ? `<p class="section-intro">${escapeHtml(section.description)}</p>` : ""}
          ${section.body ? `<p>${escapeHtml(section.body)}</p>` : ""}
          ${(section.paragraphs ?? []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          ${section.cards?.length ? `<div class="card-grid">${section.cards
            .map(
              (card) => `
              <article class="content-card cv-card">
                <h3>${escapeHtml(card.title)}</h3>
                <p>${escapeHtml(card.description)}</p>
              </article>`,
            )
            .join("")}</div>` : ""}
          ${renderItems(section)}
          ${renderActions(section.ctas ?? (section.cta ? [section.cta] : []))}
        </section>`,
    )
    .join("");

  const heroActions = renderActions(seo.contentSeo?.heroCtas ?? [], "hero-actions");

  const contentPageHtml = `<!doctype html>
<html lang="${escapeHtml(seo.site?.language)}">
${contentPageHead}
  <body>
    <main>
      <p class="back"><a href="/">Back to interactive CV</a></p>
      <header>
        <p class="eyebrow">${escapeHtml(seo.site?.name)}</p>
        <h1>${escapeHtml(seo.contentSeo?.h1)}</h1>
        <p class="lead">${escapeHtml(seo.contentSeo?.lead)}</p>
        ${heroActions}
        ${seo.contentSeo?.heroNote ? `<p class="hero-note">${escapeHtml(seo.contentSeo.heroNote)}</p>` : ""}
      </header>
      <section class="grid" aria-label="Reasons to work together">
        ${sectionHtml}
      </section>
    </main>
    <style>
      @keyframes softGlow {
        0%, 100% { opacity: 0.35; transform: translate3d(0, 0, 0); }
        50% { opacity: 0.65; transform: translate3d(0, -1px, 0); }
      }

      :root {
        color-scheme: dark;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #f8fafc;
        background: #0b1216;
      }

      body {
        margin: 0;
        min-height: 100vh;
        position: relative;
        overflow-x: hidden;
        background: #0b1216;
      }

      body::before {
        content: "";
        position: fixed;
        inset: -2px;
        z-index: -2;
        background:
          radial-gradient(1200px 600px at 14% 4%, rgba(139, 92, 246, 0.22), transparent 60%),
          radial-gradient(900px 500px at 85% 0%, rgba(168, 85, 247, 0.16), transparent 55%),
          radial-gradient(900px 700px at 72% 88%, rgba(59, 130, 246, 0.14), transparent 60%);
      }

      body::after {
        content: "";
        position: fixed;
        inset: 0;
        z-index: -1;
        background-image:
          linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px);
        background-size: 64px 64px;
        opacity: 0.12;
        mask-image: radial-gradient(500px 300px at 50% 10%, black 25%, transparent 80%);
      }

      main {
        width: min(100% - 32px, 1080px);
        margin: 0 auto;
        padding: 48px 0 88px;
      }

      header {
        max-width: 860px;
        padding: 44px 0 36px;
      }

      .content-section + .content-section {
        margin-top: 28px;
      }

      h1 {
        margin: 0;
        max-width: 12ch;
        font-size: clamp(2.2rem, 5.2vw, 4.35rem);
        letter-spacing: -0.04em;
        line-height: 1.04;
      }

      h2 {
        margin: 0;
        font-size: 1.3rem;
        letter-spacing: -0.02em;
      }

      h3 {
        margin: 0 0 12px;
        font-size: 1.05rem;
        color: rgba(248, 250, 252, 0.96);
      }

      p {
        color: rgba(248, 250, 252, 0.72);
        line-height: 1.7;
      }

      a {
        color: #c4b5fd;
      }

      .back {
        margin: 0;
        font-size: 0.95rem;
      }

      .eyebrow {
        margin: 0 0 16px;
        color: #c4b5fd;
        font-size: 0.86rem;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .lead {
        max-width: 780px;
        margin-top: 18px;
        font-size: 1.08rem;
      }

      .hero-note {
        max-width: 780px;
        margin-top: 18px;
        color: rgba(248, 250, 252, 0.64);
      }

      .section-intro {
        margin-top: 12px;
      }

      .hero-actions,
      .section-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 24px;
      }

      .action-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 50px;
        padding: 0 18px;
        border-radius: 14px;
        border: 1px solid transparent;
        font-weight: 700;
        text-decoration: none;
        transition: background 180ms ease, border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
      }

      .action-link-primary {
        background: #c4b5fd;
        border-color: rgba(196, 181, 253, 0.34);
        color: #1e133d;
        box-shadow: 0 18px 42px rgba(167, 139, 250, 0.16);
      }

      .action-link-primary:hover {
        background: #ddd6fe;
        transform: translateY(-1px);
      }

      .action-link-secondary {
        background: rgba(196, 181, 253, 0.10);
        border-color: rgba(196, 181, 253, 0.24);
        color: #f5f3ff;
      }

      .action-link-secondary:hover {
        background: rgba(196, 181, 253, 0.18);
        border-color: rgba(196, 181, 253, 0.36);
        transform: translateY(-1px);
      }

      .grid {
        display: grid;
        gap: 24px;
      }

      .card-grid,
      .item-grid,
      .detail-list {
        display: grid;
        gap: 16px;
        margin: 20px 0 0;
        padding: 0;
        list-style: none;
      }

      .content-card,
      .item-grid li,
      .content-section {
        border: 1px solid rgba(148, 163, 184, 0.24);
        border-radius: 24px;
        background: rgba(17, 27, 35, 0.72);
        backdrop-filter: blur(18px);
        box-shadow: 0 20px 60px rgba(7, 10, 18, 0.28);
        padding: 24px;
      }

      .cv-card {
        position: relative;
        overflow: hidden;
        transform: translateZ(0);
      }

      .cv-card::before {
        content: "";
        position: absolute;
        inset: -2px;
        background:
          radial-gradient(800px 240px at 15% 10%, rgba(139, 92, 246, 0.12), transparent 60%),
          radial-gradient(800px 260px at 85% 85%, rgba(59, 130, 246, 0.10), transparent 60%);
        opacity: 0.55;
        animation: softGlow 6.5s ease-in-out infinite;
        pointer-events: none;
      }

      .content-card {
        transition:
          border-color 180ms ease,
          box-shadow 180ms ease,
          background 180ms ease,
          transform 180ms ease;
      }

      .content-card:hover {
        border-color: rgba(196, 181, 253, 0.34);
        background: rgba(22, 30, 42, 0.82);
        box-shadow: 0 30px 70px rgba(167, 139, 250, 0.08);
        transform: translateY(-2px);
      }

      .content-card > *,
      .interactive-chip > * {
        position: relative;
        z-index: 1;
      }

      .item-grid li {
        color: rgba(248, 250, 252, 0.86);
        font-weight: 500;
      }

      .detail-list {
        gap: 14px;
      }

      .detail-list li {
        position: relative;
        padding-left: 22px;
        color: rgba(248, 250, 252, 0.82);
        line-height: 1.7;
      }

      .detail-list li::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0.72em;
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: #c4b5fd;
        box-shadow: 0 0 16px rgba(196, 181, 253, 0.32);
      }

      .interactive-chip {
        position: relative;
        overflow: hidden;
        border-color: rgba(196, 181, 253, 0.18);
        background: rgba(139, 92, 246, 0.08);
        color: rgba(237, 233, 254, 0.92);
        transition:
          background 180ms ease,
          border-color 180ms ease,
          color 180ms ease,
          transform 180ms ease,
          box-shadow 180ms ease;
      }

      .interactive-chip::after {
        content: "";
        position: absolute;
        top: -40%;
        left: -60%;
        width: 55%;
        height: 180%;
        transform: rotate(12deg);
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
        opacity: 0;
        pointer-events: none;
      }

      .interactive-chip:hover {
        background: rgba(139, 92, 246, 0.14);
        border-color: rgba(196, 181, 253, 0.3);
        color: #f5f3ff;
        box-shadow: 0 18px 42px rgba(167, 139, 250, 0.08);
        transform: translateY(-1px);
      }

      .interactive-chip:hover::after {
        opacity: 0.5;
        left: 120%;
        transition: left 650ms ease, opacity 200ms ease;
      }

      @media (max-width: 759px) {
        main {
          width: min(100% - 24px, 1080px);
          padding-top: 32px;
        }

        .content-card,
        .item-grid li,
        .content-section {
          border-radius: 20px;
          padding: 20px;
        }

        .action-link {
          width: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .cv-card::before {
          animation: none !important;
        }

        .interactive-chip::after,
        .interactive-chip:hover::after,
        .content-card,
        .interactive-chip,
        .action-link {
          transition: none !important;
        }
      }

      @media (min-width: 760px) {
        .grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .card-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .item-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .detail-list {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    </style>
  </body>
</html>
`;

  await mkdir(contentPageOutput.dir, { recursive: true });
  await writeFile(contentPageOutput.file, contentPageHtml, "utf8");

  const redirectPages = contentPage.redirectFrom ?? [];

  await Promise.all(
    redirectPages.map(async (redirectFrom) => {
      const redirectOutput = getOutputPathForRoute(redirectFrom);
      const redirectHtml = `<!doctype html>
<html lang="${escapeHtml(seo.site?.language)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(`Redirecting to ${contentPage.title}`)}</title>
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${escapeHtml(contentPage.canonical)}" />
    <meta http-equiv="refresh" content="0; url=${escapeHtml(contentPage.canonical)}" />
  </head>
  <body>
    <p>Redirecting to <a href="${escapeHtml(contentPage.canonical)}">${escapeHtml(contentPage.canonical)}</a>.</p>
  </body>
</html>
`;

      await mkdir(redirectOutput.dir, { recursive: true });
      await writeFile(redirectOutput.file, redirectHtml, "utf8");
    }),
  );
}

console.log("Applied SEO metadata from src/data/seo.json");
