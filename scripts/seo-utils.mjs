import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const loadJson = async (relativePath) =>
  JSON.parse(await readFile(path.join(rootDir, relativePath), "utf8"));

const htmlEscapeMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);

export const safeJsonScript = (value) =>
  JSON.stringify(value, null, 2).replace(/</g, "\\u003c");

export const stripTrailingSlash = (value) => String(value ?? "").replace(/\/+$/, "");

export const getSiteUrl = (seo) => stripTrailingSlash(seo.site?.url);

export const absoluteUrl = (seo, value) => {
  const url = String(value ?? "");
  if (/^https?:\/\//i.test(url)) return url;
  if (!url) return getSiteUrl(seo);
  return `${getSiteUrl(seo)}${url.startsWith("/") ? url : `/${url}`}`;
};

export const applyTitleTemplate = (seo, title) => {
  const template = seo.defaultSeo?.titleTemplate;
  if (!title || title === seo.defaultSeo?.title) return seo.defaultSeo?.title ?? title;
  if (!template?.includes("%s")) return title;
  return template.replace("%s", title);
};

export const getKeywords = (seo) => [
  ...(seo.keywords?.primary ?? []),
  ...(seo.keywords?.longTail ?? []),
];

export const normalizeLastmod = (value, fallback = new Date()) => {
  const text = String(value ?? "").trim();
  const monthMap = {
    JAN: "01",
    FEB: "02",
    MAR: "03",
    APR: "04",
    MAY: "05",
    JUN: "06",
    JUL: "07",
    AUG: "08",
    SEP: "09",
    OCT: "10",
    NOV: "11",
    DEC: "12",
  };

  const match = text.match(/^(\d{4})-([A-Z]{3})-(\d{2})$/i);
  if (match) {
    const [, year, month, day] = match;
    const monthNumber = monthMap[month.toUpperCase()];
    if (monthNumber) return `${year}-${monthNumber}-${day}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  return fallback.toISOString().slice(0, 10);
};

export const buildStructuredData = (
  seo,
  {
    pageName = seo.site?.name,
    pageUrl = seo.defaultSeo?.canonical,
    breadcrumbs = [{ name: "Strona główna", item: seo.defaultSeo?.canonical }],
  } = {},
) => {
  const siteUrl = getSiteUrl(seo);
  const canonicalUrl = absoluteUrl(seo, pageUrl);
  const person = {
    ...seo.schema.person,
    "@id": `${siteUrl}/#person`,
    url: seo.schema.person?.url ?? siteUrl,
    image: absoluteUrl(seo, seo.schema.person?.image),
    knowsAbout: seo.schema.knowsAbout ?? [],
    sameAs: seo.schema.person?.sameAs ?? [],
  };

  const service = {
    ...seo.schema.service,
    "@id": `${siteUrl}/#professional-service`,
    url: `${siteUrl}/`,
    image: absoluteUrl(seo, seo.openGraph?.image?.url),
    provider: { "@id": `${siteUrl}/#person` },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: seo.site?.name,
    url: `${siteUrl}/`,
    inLanguage: seo.site?.language,
    description: seo.defaultSeo?.description,
    publisher: { "@id": `${siteUrl}/#person` },
  };

  const breadcrumbList = {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    name: `${pageName} breadcrumbs`,
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(seo, item.item),
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [website, person, service, breadcrumbList],
  };
};

export const buildSiteNavigationStructuredData = (seo, staticPages = []) => {
  const siteUrl = getSiteUrl(seo);
  if (!staticPages.length) return null;

  return {
    "@type": "ItemList",
    "@id": `${siteUrl}/#site-navigation`,
    name: "Site navigation",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        url: `${siteUrl}/`,
      },
      ...staticPages.map((page, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: page.navLabel ?? page.title,
        description: page.navDescription,
        url: absoluteUrl(seo, page.canonical ?? page.path),
      })),
    ],
  };
};

export const buildSitemapXml = (seo, lastmod, staticPages = []) => {
  const siteUrl = getSiteUrl(seo);
  const urls = Array.from(
    new Set(
      [
        `${siteUrl}/`,
        ...staticPages.map((page) => page.canonical),
      ].filter(Boolean),
    ),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeHtml(url)}</loc>
    <lastmod>${escapeHtml(lastmod)}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
};

export const buildRobotsTxt = (seo) => `User-agent: *
Allow: /

Sitemap: ${getSiteUrl(seo)}/sitemap.xml
`;

export const buildWebManifest = (seo) => ({
  name: seo.site?.name,
  short_name: seo.site?.name,
  lang: seo.site?.language,
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#0b1216",
  theme_color: seo.site?.themeColor ?? "#0b1216",
  icons: [
    {
      src: seo.favicon?.android192,
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: seo.favicon?.android512,
      sizes: "512x512",
      type: "image/png",
    },
  ],
});

export const buildSrOnlyStyle = () => `<style>
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    </style>`;

export const buildSeoHead = ({
  seo,
  title = seo.defaultSeo?.title,
  description = seo.defaultSeo?.description,
  canonical = seo.defaultSeo?.canonical,
  robots = seo.defaultSeo?.robots,
  structuredData = buildStructuredData(seo),
  assetTags = [],
  openGraph = {},
  twitter = {},
}) => {
  const og = { ...(seo.openGraph ?? {}), ...openGraph };
  const twitterMeta = { ...(seo.twitter ?? {}), ...twitter };
  const image = og.image ?? {};
  const keywords = getKeywords(seo).join(", ");

  return `  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <meta name="author" content="${escapeHtml(seo.site?.author)}" />
    <meta name="robots" content="${escapeHtml(robots)}" />
    <meta name="theme-color" content="${escapeHtml(seo.site?.themeColor ?? "#0b1216")}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <link rel="icon" href="${escapeHtml(seo.favicon?.ico)}" sizes="any" />
    <link rel="icon" type="image/png" sizes="16x16" href="${escapeHtml(seo.favicon?.icon16)}" />
    <link rel="icon" type="image/png" sizes="32x32" href="${escapeHtml(seo.favicon?.icon32)}" />
    <link rel="apple-touch-icon" href="${escapeHtml(seo.favicon?.appleTouchIcon)}" />
    <link rel="manifest" href="${escapeHtml(seo.favicon?.manifest)}" />

    <meta property="og:type" content="${escapeHtml(og.type)}" />
    <meta property="og:title" content="${escapeHtml(og.title)}" />
    <meta property="og:description" content="${escapeHtml(og.description)}" />
    <meta property="og:url" content="${escapeHtml(og.url)}" />
    <meta property="og:image" content="${escapeHtml(image.url)}" />
    <meta property="og:image:width" content="${escapeHtml(image.width)}" />
    <meta property="og:image:height" content="${escapeHtml(image.height)}" />
    <meta property="og:image:alt" content="${escapeHtml(image.alt)}" />
    <meta property="og:site_name" content="${escapeHtml(og.siteName)}" />
    <meta property="og:locale" content="${escapeHtml(og.locale)}" />

    <meta name="twitter:card" content="${escapeHtml(twitterMeta.card)}" />
    <meta name="twitter:title" content="${escapeHtml(twitterMeta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(twitterMeta.description)}" />
    <meta name="twitter:image" content="${escapeHtml(twitterMeta.image)}" />

    <script type="application/ld+json">${safeJsonScript(structuredData)}</script>
    ${buildSrOnlyStyle()}
${assetTags.map((tag) => `    ${tag}`).join("\n")}
  </head>`;
};
