import { mkdir, rm, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import {
  applyTitleTemplate,
  buildRobotsTxt,
  buildSeoHead,
  buildSitemapXml,
  buildSiteNavigationStructuredData,
  buildStructuredData,
  buildWebManifest,
  escapeHtml,
  getSiteUrl,
  loadJson,
  normalizeLastmod,
  rootDir,
  safeJsonScript,
} from "./seo-utils.mjs";
import {
  allowedAnimatedListStyles,
  getEnabledStaticPages,
  getPageTone,
  getToneClass,
  loadCmsConfig,
  validateCmsConfig,
} from "./cms-utils.mjs";
import {
  buildNoScriptProfileFallback,
  buildStaticProfileHtml,
} from "./static-profile-renderer.mjs";

const indexPath = path.join(rootDir, "dist", "index.html");
const robotsPath = path.join(rootDir, "dist", "robots.txt");
const sitemapPath = path.join(rootDir, "dist", "sitemap.xml");
const manifestPath = path.join(rootDir, "dist", "site.webmanifest");
const publicRobotsPath = path.join(rootDir, "public", "robots.txt");
const publicSitemapPath = path.join(rootDir, "public", "sitemap.xml");
const publicManifestPath = path.join(rootDir, "public", "site.webmanifest");

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
const cms = await loadCmsConfig();
const cv = await loadJson("src/data/cv.json");
const attribution = await loadJson("src/data/attribution.json");
const originalHtml = await readFile(indexPath, "utf8");
const siteUrl = getSiteUrl(seo);
const lastmod = normalizeLastmod(process.env.SITE_LASTMOD);
validateCmsConfig(cms, seo);
const enabledStaticPages = getEnabledStaticPages(cms, seo);
const attributionText =
  typeof attribution.text === "string"
    ? attribution.text
    : "Powered by Interactive CV by Lukasz Komur";
const attributionUrl =
  typeof attribution.url === "string" ? attribution.url : "https://lukaszkomur.dev/";

const removeOutputForRoute = async (routePath) => {
  if (!String(routePath ?? "").trim()) return;
  const output = getOutputPathForRoute(routePath);
  await rm(output.dir, { recursive: true, force: true });
};

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

structuredData["@graph"].push({
  "@type": "ProfilePage",
  "@id": `${siteUrl}/#profile-page`,
  name: `${cv.person?.full_name ?? seo.site?.name} - Profile`,
  url: `${siteUrl}/`,
  description: seo.defaultSeo?.description,
  mainEntity: { "@id": `${siteUrl}/#person` },
});

const siteNavigationStructuredData = buildSiteNavigationStructuredData(
  seo,
  enabledStaticPages,
);

if (siteNavigationStructuredData) {
  structuredData["@graph"].push(siteNavigationStructuredData);
}

const nextHead = buildSeoHead({
  seo,
  title: seo.defaultSeo?.title,
  description: seo.defaultSeo?.description,
  canonical: seo.defaultSeo?.canonical,
  robots: seo.defaultSeo?.robots,
  structuredData,
  assetTags,
});

const staticProfileBlock = `    ${buildStaticProfileHtml(cv, {
  className: "sr-only",
  id: "static-profile",
  staticPages: enabledStaticPages,
  attribution,
})}`;

const noScriptFallback = `    ${buildNoScriptProfileFallback(cv, enabledStaticPages, attribution)}`;

let html = originalHtml
  .replace(/<html\b[^>]*>/, `<html lang="${escapeHtml(seo.site?.language)}">`)
  .replace(/<head>[\s\S]*?<\/head>/, nextHead)
  .replace(/    <(?:div|main)\b[^>]*class=["']sr-only["'][\s\S]*?<\/(?:div|main)>/, staticProfileBlock)
  .replace(/    <noscript>[\s\S]*?<\/noscript>/, noScriptFallback);

if (!html.includes('id="static-profile"')) {
  html = html.replace(/<body>/, `<body>\n${staticProfileBlock}`);
}

if (!html.includes(noScriptFallback)) {
  html = html.replace(/<script\b/, `${noScriptFallback}\n    <script`);
}

const robotsTxt = buildRobotsTxt(seo);
const sitemapXml = buildSitemapXml(seo, lastmod, enabledStaticPages);
const webManifest = `${safeJsonScript(buildWebManifest(seo))}\n`;

await writeFile(indexPath, html, "utf8");
await writeFile(robotsPath, robotsTxt, "utf8");
await writeFile(publicRobotsPath, robotsTxt, "utf8");
await writeFile(sitemapPath, sitemapXml, "utf8");
await writeFile(publicSitemapPath, sitemapXml, "utf8");
await writeFile(manifestPath, webManifest, "utf8");
await writeFile(publicManifestPath, webManifest, "utf8");

await Promise.all(
  (cms.staticPages ?? []).flatMap((page) => [
    removeOutputForRoute(page.path),
    ...(page.redirectFrom ?? []).map(removeOutputForRoute),
  ]),
);

for (const staticPage of enabledStaticPages) {
  const staticPageOutput = getOutputPathForRoute(staticPage.path);
  const staticPageStructuredData = buildStructuredData(seo, {
    pageName: staticPage.title,
    pageUrl: staticPage.canonical,
    breadcrumbs: [
      { name: "Home", item: `${siteUrl}/` },
      { name: staticPage.title, item: staticPage.canonical },
    ],
  });

  if (siteNavigationStructuredData) {
    staticPageStructuredData["@graph"].push(siteNavigationStructuredData);
  }

  const staticPageHead = buildSeoHead({
    seo,
    title: applyTitleTemplate(seo, staticPage.title),
    description: staticPage.description,
    canonical: staticPage.canonical,
    robots: staticPage.robots ?? seo.defaultSeo?.robots,
    structuredData: staticPageStructuredData,
    openGraph: {
      ...staticPage.openGraph,
      url: staticPage.openGraph?.url ?? staticPage.canonical,
    },
    twitter: staticPage.twitter,
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

  const renderBadges = (badges = []) => {
    if (!badges.length) return "";

    return `<ul class="badge-list">${badges
      .map((badge) => `<li class="badge">${escapeHtml(badge)}</li>`)
      .join("")}</ul>`;
  };

  const renderAnimatedParagraphs = (paragraphs = []) => {
    if (!paragraphs.length) return "";

    return `<div class="animated-paragraphs">${paragraphs
      .map((paragraph) => `<p class="animated-paragraph">${escapeHtml(paragraph)}</p>`)
      .join("")}</div>`;
  };

  const renderAnimatedList = (section) => {
    if (!section.animatedList?.length) return "";

    const style = allowedAnimatedListStyles.has(section.animatedListStyle)
      ? section.animatedListStyle
      : "list";

    return `<ul class="animated-list animated-list-${style}">${section.animatedList
      .map((item) => `<li class="animated-list-item">${escapeHtml(item)}</li>`)
      .join("")}</ul>`;
  };

  const pageTone = getPageTone(staticPage);

  const sectionHtml = (staticPage.sections ?? [])
    .map(
      (section) => {
        const sectionTone = section.tone ? getPageTone(section) : pageTone;
        return `
        <section class="content-section ${getToneClass(sectionTone)}">
          <h2>${escapeHtml(section.heading)}</h2>
          ${section.description ? `<p class="section-intro">${escapeHtml(section.description)}</p>` : ""}
          ${section.body ? `<p>${escapeHtml(section.body)}</p>` : ""}
          ${(section.paragraphs ?? []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
          ${renderAnimatedParagraphs(section.animatedParagraphs)}
          ${renderBadges(section.badges)}
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
          ${renderAnimatedList(section)}
          ${renderActions(section.ctas ?? (section.cta ? [section.cta] : []))}
        </section>`;
      },
    )
    .join("");

  const heroActions = renderActions(
    staticPage.ctas ?? (staticPage.cta ? [staticPage.cta] : []),
    "hero-actions",
  );

  const staticPageHtml = `<!doctype html>
<html lang="${escapeHtml(seo.site?.language)}">
${staticPageHead}
  <body class="${getToneClass(pageTone)}">
    <main>
      <p class="back"><a href="/">Back to interactive CV</a></p>
      <header>
        <p class="eyebrow">${escapeHtml(seo.site?.name)}</p>
        <h1>${escapeHtml(staticPage.h1)}</h1>
        <p class="lead">${escapeHtml(staticPage.lead)}</p>
        ${heroActions}
        ${staticPage.heroNote ? `<p class="hero-note">${escapeHtml(staticPage.heroNote)}</p>` : ""}
      </header>
      <section class="grid" aria-label="${escapeHtml(staticPage.navLabel)}">
        ${sectionHtml}
      </section>
    </main>
    <footer class="site-attribution">
      <a href="${escapeHtml(attributionUrl)}">${escapeHtml(attributionText)}</a>
    </footer>
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

      body,
      .tone-violet {
        --accent: #c4b5fd;
        --accent-soft: rgba(196, 181, 253, 0.10);
        --accent-strong: #ddd6fe;
        --accent-text: #f5f3ff;
        --accent-border: rgba(196, 181, 253, 0.28);
        --accent-shadow: rgba(167, 139, 250, 0.16);
        --accent-ink: #1e133d;
      }

      body.tone-gold,
      .tone-gold {
        --accent: #facc15;
        --accent-soft: rgba(250, 204, 21, 0.10);
        --accent-strong: #fde68a;
        --accent-text: #fef3c7;
        --accent-border: rgba(250, 204, 21, 0.28);
        --accent-shadow: rgba(245, 158, 11, 0.16);
        --accent-ink: #1f1600;
      }

      body.tone-blue,
      .tone-blue {
        --accent: #93c5fd;
        --accent-soft: rgba(147, 197, 253, 0.10);
        --accent-strong: #bfdbfe;
        --accent-text: #eff6ff;
        --accent-border: rgba(147, 197, 253, 0.28);
        --accent-shadow: rgba(59, 130, 246, 0.16);
        --accent-ink: #071426;
      }

      body.tone-emerald,
      .tone-emerald {
        --accent: #6ee7b7;
        --accent-soft: rgba(110, 231, 183, 0.10);
        --accent-strong: #a7f3d0;
        --accent-text: #ecfdf5;
        --accent-border: rgba(110, 231, 183, 0.28);
        --accent-shadow: rgba(16, 185, 129, 0.16);
        --accent-ink: #052016;
      }

      body.tone-rose,
      .tone-rose {
        --accent: #fda4af;
        --accent-soft: rgba(253, 164, 175, 0.10);
        --accent-strong: #fecdd3;
        --accent-text: #fff1f2;
        --accent-border: rgba(253, 164, 175, 0.28);
        --accent-shadow: rgba(244, 63, 94, 0.14);
        --accent-ink: #2a0710;
      }

      body.tone-slate,
      .tone-slate {
        --accent: #cbd5e1;
        --accent-soft: rgba(203, 213, 225, 0.10);
        --accent-strong: #e2e8f0;
        --accent-text: #f8fafc;
        --accent-border: rgba(203, 213, 225, 0.24);
        --accent-shadow: rgba(148, 163, 184, 0.12);
        --accent-ink: #111827;
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
          radial-gradient(1200px 600px at 14% 4%, var(--accent-shadow), transparent 60%),
          radial-gradient(900px 500px at 85% 0%, var(--accent-soft), transparent 55%),
          radial-gradient(900px 700px at 72% 88%, rgba(59, 130, 246, 0.12), transparent 60%);
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

      .site-attribution {
        width: min(100% - 32px, 1080px);
        margin: -48px auto 0;
        padding: 0 0 40px;
        text-align: center;
      }

      .site-attribution a {
        color: rgba(148, 163, 184, 0.72);
        font-size: 0.78rem;
        text-decoration: none;
        transition: color 180ms ease;
      }

      .site-attribution a:hover {
        color: var(--accent-text);
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
        color: var(--accent);
      }

      .back {
        margin: 0;
        font-size: 0.95rem;
      }

      .eyebrow {
        margin: 0 0 16px;
        color: var(--accent);
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
        background: var(--accent);
        border-color: var(--accent-border);
        color: var(--accent-ink);
        box-shadow: 0 18px 42px var(--accent-shadow);
      }

      .action-link-primary:hover {
        background: var(--accent-strong);
        transform: translateY(-1px);
      }

      .action-link-secondary {
        background: var(--accent-soft);
        border-color: var(--accent-border);
        color: var(--accent-text);
      }

      .action-link-secondary:hover {
        background: var(--accent-soft);
        border-color: var(--accent);
        transform: translateY(-1px);
      }

      .grid {
        display: grid;
        gap: 24px;
      }

      .card-grid,
      .item-grid,
      .badge-list,
      .animated-list,
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
          radial-gradient(800px 240px at 15% 10%, var(--accent-soft), transparent 60%),
          radial-gradient(800px 260px at 85% 85%, var(--accent-shadow), transparent 60%);
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
        border-color: var(--accent-border);
        background: rgba(22, 30, 42, 0.82);
        box-shadow: 0 30px 70px var(--accent-shadow);
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
        background: var(--accent);
        box-shadow: 0 0 16px var(--accent-shadow);
      }

      .badge-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .badge,
      .interactive-chip {
        position: relative;
        overflow: hidden;
        border-color: var(--accent-border);
        background: var(--accent-soft);
        color: var(--accent-text);
        transition:
          background 180ms ease,
          border-color 180ms ease,
          color 180ms ease,
          transform 180ms ease,
          box-shadow 180ms ease;
      }

      .badge {
        display: inline-flex;
        align-items: center;
        min-height: 32px;
        padding: 0 12px;
        border: 1px solid var(--accent-border);
        border-radius: 999px;
        font-size: 0.88rem;
        font-weight: 700;
        list-style: none;
      }

      .badge:hover {
        background: var(--accent-soft);
        border-color: var(--accent);
        box-shadow: 0 12px 28px var(--accent-shadow);
        transform: translateY(-1px);
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
        background: var(--accent-soft);
        border-color: var(--accent);
        color: var(--accent-text);
        box-shadow: 0 18px 42px var(--accent-shadow);
        transform: translateY(-1px);
      }

      .interactive-chip:hover::after {
        opacity: 0.5;
        left: 120%;
        transition: left 650ms ease, opacity 200ms ease;
      }

      .animated-paragraphs {
        display: grid;
        gap: 12px;
        margin-top: 18px;
      }

      .animated-paragraph {
        margin: 0;
        border-left: 3px solid var(--accent-border);
        border-radius: 14px;
        background: rgba(15, 23, 30, 0.42);
        padding: 14px 16px;
        transition:
          background 180ms ease,
          border-color 180ms ease,
          color 180ms ease,
          transform 180ms ease;
      }

      .animated-paragraph:hover {
        background: var(--accent-soft);
        border-color: var(--accent);
        color: rgba(248, 250, 252, 0.86);
        transform: translateY(-1px);
      }

      .animated-list-list {
        gap: 12px;
      }

      .animated-list-cards {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .animated-list-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .animated-list-item {
        position: relative;
        border: 1px solid var(--accent-border);
        border-radius: 18px;
        background: rgba(15, 23, 30, 0.44);
        color: rgba(248, 250, 252, 0.84);
        line-height: 1.6;
        list-style: none;
        padding: 14px 16px 14px 36px;
        transition:
          background 180ms ease,
          border-color 180ms ease,
          color 180ms ease,
          transform 180ms ease,
          box-shadow 180ms ease;
      }

      .animated-list-item::before {
        content: "";
        position: absolute;
        left: 16px;
        top: 1.36em;
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--accent);
        box-shadow: 0 0 16px var(--accent-shadow);
      }

      .animated-list-cards .animated-list-item {
        min-height: 72px;
        padding: 18px 18px 18px 42px;
      }

      .animated-list-chips .animated-list-item {
        min-height: 32px;
        border-radius: 999px;
        padding: 6px 14px 6px 30px;
        font-weight: 700;
      }

      .animated-list-chips .animated-list-item::before {
        left: 14px;
        top: 50%;
        width: 6px;
        height: 6px;
        transform: translateY(-50%);
      }

      .animated-list-item:hover {
        background: var(--accent-soft);
        border-color: var(--accent);
        color: var(--accent-text);
        box-shadow: 0 18px 42px var(--accent-shadow);
        transform: translateY(-1px);
      }

      @media (max-width: 759px) {
        main {
          width: min(100% - 24px, 1080px);
          padding-top: 32px;
        }

        .site-attribution {
          width: min(100% - 24px, 1080px);
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
        .animated-list-item,
        .animated-paragraph,
        .badge,
        .site-attribution a,
        .content-card,
        .interactive-chip,
        .action-link {
          transition: none !important;
        }

        .animated-list-item:hover,
        .animated-paragraph:hover,
        .badge:hover,
        .content-card:hover,
        .interactive-chip:hover,
        .action-link:hover {
          transform: none !important;
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

  await mkdir(staticPageOutput.dir, { recursive: true });
  await writeFile(staticPageOutput.file, staticPageHtml, "utf8");

  const redirectPages = staticPage.redirectFrom ?? [];

  await Promise.all(
    redirectPages.map(async (redirectFrom) => {
      const redirectOutput = getOutputPathForRoute(redirectFrom);
      const redirectHtml = `<!doctype html>
<html lang="${escapeHtml(seo.site?.language)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(`Redirecting to ${staticPage.title}`)}</title>
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${escapeHtml(staticPage.canonical)}" />
    <meta http-equiv="refresh" content="0; url=${escapeHtml(staticPage.canonical)}" />
  </head>
  <body>
    <p>Redirecting to <a href="${escapeHtml(staticPage.canonical)}">${escapeHtml(staticPage.canonical)}</a>.</p>
    <footer>
      <p><a href="${escapeHtml(attributionUrl)}">${escapeHtml(attributionText)}</a></p>
    </footer>
  </body>
</html>
`;

      await mkdir(redirectOutput.dir, { recursive: true });
      await writeFile(redirectOutput.file, redirectHtml, "utf8");
    }),
  );
}

console.log("Applied SEO metadata from src/data/seo.json");
