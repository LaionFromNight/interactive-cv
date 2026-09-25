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
  getEnabledStaticPages,
  loadCmsConfig,
  validateCmsConfig,
} from "./cms-utils.mjs";
import {
  buildNoScriptProfileFallback,
  buildStaticProfileHtml,
} from "./static-profile-renderer.mjs";
import { renderStaticPageBody, withStaticPageHeadExtras } from "./static-page-template.mjs";

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

  const staticPageHtml = `<!doctype html>
<html lang="${escapeHtml(seo.site?.language)}" class="theme-dark" data-theme="dark">
${withStaticPageHeadExtras(staticPageHead)}
${renderStaticPageBody({ staticPage, seo, enabledStaticPages, attributionUrl, attributionText })}
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
