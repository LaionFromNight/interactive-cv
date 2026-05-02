import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  absoluteUrl,
  applyTitleTemplate,
  buildStructuredData,
  escapeHtml,
  getKeywords,
  getSiteUrl,
  loadJson,
  rootDir,
  safeJsonScript,
} from "./seo-utils.mjs";

const cvPath = path.join(rootDir, "src", "data", "cv.json");
const outputDir = path.join(rootDir, "dist", "cv");
const outputPath = path.join(outputDir, "index.html");

const asArray = (value) => (Array.isArray(value) ? value : []);

const cleanText = (value) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : "";

const compactText = (items) => asArray(items).map(cleanText).filter(Boolean);

const indexById = (items) =>
  Object.fromEntries(
    asArray(items)
      .filter((item) => item && typeof item.id === "string")
      .map((item) => [item.id, item]),
  );

const formatRange = (range = {}) => {
  const start = cleanText(range.start) || "Unknown";
  const end = cleanText(range.end) || "Present";
  return `${start} to ${end}`;
};

const renderList = (items, className = "") => {
  const values = compactText(items);
  if (!values.length) return "";

  const classAttr = className ? ` class="${escapeHtml(className)}"` : "";
  return `<ul${classAttr}>${values.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
};

const renderLinkList = (items) => {
  const links = asArray(items).filter((item) => cleanText(item?.url));
  if (!links.length) return "";

  return `<ul>${links
    .map((item) => {
      const label = cleanText(item.label) || cleanText(item.url);
      const url = cleanText(item.url);
      return `<li><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></li>`;
    })
    .join("")}</ul>`;
};

const renderTagList = (items) => renderList(items, "tags");

const cv = await loadJson(path.relative(rootDir, cvPath));
const seo = await loadJson("src/data/seo.json");
const siteUrl = getSiteUrl(seo);
const cvUrl = `${siteUrl}/cv/`;
const cvPageTitle = applyTitleTemplate(seo, "Static CV");
const cvPageDescription = seo.defaultSeo?.description;
const keywords = getKeywords(seo).join(", ");

const rolesById = indexById(cv.taxonomy?.roles);
const domainsById = indexById(cv.taxonomy?.domains);
const techById = indexById(cv.skills?.tech);
const companiesById = indexById(cv.companies);
const clientsById = indexById(cv.clients);

const privacyDefaults = cv.meta?.privacy_rules?.public_display_defaults ?? {};
const privacyOverrides = cv.meta?.privacy_rules?.overrides ?? {};

const shouldShowClientName = (clientId) => {
  if (!clientId) return false;
  const client = clientsById[clientId];
  const inline = client?.privacy?.show_client_name;
  const override = privacyOverrides?.[clientId]?.show_client_name;
  const fallback = privacyDefaults.show_client_names;
  return (inline ?? override ?? fallback) === true;
};

const shouldShowProjectName = (projectId) => {
  if (!projectId) return false;
  const project = asArray(cv.projects).find((item) => item.id === projectId);
  const inline = project?.public?.show_project_name;
  const override = privacyOverrides?.[projectId]?.show_project_name;
  const fallback = privacyDefaults.show_project_names;
  return (inline ?? override ?? fallback) === true;
};

const getClientDisplayName = (clientId) => {
  if (!clientId) return null;
  const client = clientsById[clientId];
  if (!client) return null;

  return shouldShowClientName(clientId)
    ? cleanText(client.display_name) || "Client"
    : "Client (anonymized)";
};

const getProjectDisplayName = (projectId) => {
  const project = asArray(cv.projects).find((item) => item.id === projectId);
  if (!project) return "Unknown project";

  return shouldShowProjectName(projectId)
    ? cleanText(project.display_name) || cleanText(project.name) || "Project"
    : "Project (anonymized)";
};

const getCompanyDisplayName = (companyId) => {
  if (!companyId) return "Independent / B2B collaboration";
  return cleanText(companiesById[companyId]?.name) || "Company";
};

const getRoleNames = (project) =>
  asArray(project.roles).map((id) => cleanText(rolesById[id]?.name) || id);

const getDomainNames = (project) =>
  asArray(project.domain_ids).map((id) => cleanText(domainsById[id]?.name) || id);

const getStackNames = (project) =>
  asArray(project.tech_usage)
    .slice()
    .sort((a, b) => Number(b.usage ?? 0) - Number(a.usage ?? 0))
    .map((item) => cleanText(techById[item.tech_id]?.name) || item.tech_id);

const publicProjects = asArray(cv.projects)
  .filter((project) => project?.public?.show !== false)
  .sort((a, b) =>
    (cleanText(b.time_range?.start) || "").localeCompare(cleanText(a.time_range?.start) || ""),
  );

const coreSkills = asArray(cv.skills?.tech)
  .filter((tech) => tech?.core_stack === true)
  .map((tech) => cleanText(tech.name))
  .filter(Boolean)
  .sort((a, b) => a.localeCompare(b));

const skillGroups = [
  { title: "Backend", tags: ["backend"] },
  { title: "Cloud and serverless", tags: ["cloud", "serverless"] },
  { title: "Frontend", tags: ["frontend"] },
  { title: "Databases", tags: ["db", "sql", "nosql"] },
  { title: "DevOps", tags: ["devops"] },
  { title: "Testing", tags: ["testing"] },
  { title: "Platforms and integrations", tags: ["platform", "integration"] },
];

const groupedSkills = (() => {
  const groups = new Map(skillGroups.map((group) => [group.title, []]));
  groups.set("Other", []);

  for (const tech of asArray(cv.skills?.tech)) {
    const tags = asArray(tech.tags);
    const match = skillGroups.find((group) =>
      group.tags.some((tag) => tags.includes(tag)),
    );
    groups.get(match?.title ?? "Other").push(cleanText(tech.name) || tech.id);
  }

  return Array.from(groups.entries())
    .map(([title, items]) => ({
      title,
      items: items.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    }))
    .filter((group) => group.items.length > 0);
})();

const profiles = asArray(cv.person?.profiles);
const linkedInProfile = profiles.find((profile) => profile.id === "linkedin");

const structuredData = buildStructuredData(seo, {
  pageName: "Static CV",
  pageUrl: cvUrl,
  breadcrumbs: [
    { name: "Strona główna", item: `${siteUrl}/` },
    { name: "Static CV", item: cvUrl },
  ],
});

structuredData["@graph"].push({
  "@type": "ProfilePage",
  "@id": `${cvUrl}#profile-page`,
  name: "Lukasz Komur - Static CV",
  url: cvUrl,
  description: cvPageDescription,
  mainEntity: { "@id": `${siteUrl}/#person` },
});

const renderProject = (project) => {
  const projectTitle = getProjectDisplayName(project.id);
  const company = getCompanyDisplayName(project.company_id);
  const client = getClientDisplayName(project.client_id);
  const meta = [formatRange(project.time_range), company, client, cleanText(project.status)]
    .filter(Boolean)
    .join(" | ");
  const description = cleanText(project.description);
  const roles = getRoleNames(project);
  const domains = getDomainNames(project);
  const stack = getStackNames(project);

  return `
        <article class="project">
          <h3>${escapeHtml(projectTitle)}</h3>
          <p class="meta">${escapeHtml(meta)}</p>
          ${description ? `<p>${escapeHtml(description)}</p>` : ""}
          ${roles.length ? `<h4>Roles</h4>${renderTagList(roles)}` : ""}
          ${domains.length ? `<h4>Domains</h4>${renderTagList(domains)}` : ""}
          ${compactText(project.responsibilities).length ? `<h4>Responsibilities</h4>${renderList(project.responsibilities)}` : ""}
          ${compactText(project.highlights).length ? `<h4>Highlights</h4>${renderList(project.highlights)}` : ""}
          ${stack.length ? `<h4>Stack / technologies</h4>${renderTagList(stack)}` : ""}
        </article>`;
};

const renderTimelineItem = (item) => {
  const company = item.company_id
    ? getCompanyDisplayName(item.company_id)
    : getClientDisplayName(item.client_id) || "Experience";
  const projectNames = asArray(item.project_ids).map(getProjectDisplayName);

  return `
        <article>
          <h3>${escapeHtml(company)}</h3>
          <p class="meta">${escapeHtml(formatRange(item))}</p>
          ${renderList(projectNames)}
        </article>`;
};

const renderEducationItem = (item) => `
        <article>
          <h3>${escapeHtml(item.institution)}</h3>
          <p>${escapeHtml(item.program)}</p>
          <p class="meta">${escapeHtml(formatRange(item.time_range))}</p>
        </article>`;

const renderShowcaseItem = (item) => `
        <article>
          <h3><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h3>
          <p>${escapeHtml(item.teaser)}</p>
          ${renderTagList(item.tags)}
        </article>`;

const renderSpotifyItem = (item) => `
        <li><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></li>`;

const summaryText =
  cleanText(cv.ai_metadata?.career_summary?.long) ||
  cleanText(cv.person?.bio_short);

const html = `<!doctype html>
<html lang="${escapeHtml(seo.site?.language)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(cvPageTitle)}</title>
    <meta name="description" content="${escapeHtml(cvPageDescription)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <meta name="author" content="${escapeHtml(seo.site?.author)}" />
    <meta name="robots" content="${escapeHtml(seo.defaultSeo?.robots)}" />
    <meta name="theme-color" content="${escapeHtml(seo.site?.themeColor ?? "#0b1216")}" />
    <link rel="canonical" href="${cvUrl}" />
    <link rel="icon" href="${escapeHtml(seo.favicon?.ico)}" sizes="any" />
    <link rel="icon" type="image/png" sizes="16x16" href="${escapeHtml(seo.favicon?.icon16)}" />
    <link rel="icon" type="image/png" sizes="32x32" href="${escapeHtml(seo.favicon?.icon32)}" />
    <link rel="apple-touch-icon" href="${escapeHtml(seo.favicon?.appleTouchIcon)}" />
    <link rel="manifest" href="${escapeHtml(seo.favicon?.manifest)}" />
    <meta property="og:type" content="${escapeHtml(seo.openGraph?.type)}" />
    <meta property="og:title" content="${escapeHtml(seo.openGraph?.title)}" />
    <meta property="og:description" content="${escapeHtml(seo.openGraph?.description)}" />
    <meta property="og:url" content="${cvUrl}" />
    <meta property="og:image" content="${escapeHtml(absoluteUrl(seo, seo.openGraph?.image?.url))}" />
    <meta property="og:image:width" content="${escapeHtml(seo.openGraph?.image?.width)}" />
    <meta property="og:image:height" content="${escapeHtml(seo.openGraph?.image?.height)}" />
    <meta property="og:image:alt" content="${escapeHtml(seo.openGraph?.image?.alt)}" />
    <meta property="og:site_name" content="${escapeHtml(seo.openGraph?.siteName)}" />
    <meta property="og:locale" content="${escapeHtml(seo.openGraph?.locale)}" />
    <meta name="twitter:card" content="${escapeHtml(seo.twitter?.card)}" />
    <meta name="twitter:title" content="${escapeHtml(seo.twitter?.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.twitter?.description)}" />
    <meta name="twitter:image" content="${escapeHtml(absoluteUrl(seo, seo.twitter?.image))}" />
    <script type="application/ld+json">${safeJsonScript(structuredData)}</script>
    <style>
      :root {
        color-scheme: light;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        line-height: 1.6;
        color: #172033;
        background: #f6f7fb;
      }

      body {
        margin: 0;
      }

      main {
        width: min(100% - 32px, 960px);
        margin: 0 auto;
        padding: 40px 0 64px;
      }

      header,
      section,
      article {
        border: 1px solid #dfe4ee;
        border-radius: 12px;
        background: #ffffff;
      }

      header,
      section {
        padding: 28px;
        margin-bottom: 24px;
      }

      article {
        padding: 20px;
        margin-top: 16px;
      }

      h1,
      h2,
      h3,
      h4,
      p {
        margin-top: 0;
      }

      h1 {
        margin-bottom: 8px;
        font-size: clamp(2.2rem, 8vw, 4rem);
        line-height: 1.05;
      }

      h2 {
        margin-bottom: 12px;
        font-size: 1.55rem;
      }

      h3 {
        margin-bottom: 6px;
        font-size: 1.15rem;
      }

      h4 {
        margin-bottom: 6px;
        font-size: 0.95rem;
      }

      a {
        color: #0754a6;
      }

      ul {
        padding-left: 1.25rem;
      }

      .lead {
        max-width: 72ch;
        font-size: 1.08rem;
      }

      .meta {
        color: #586274;
        font-size: 0.94rem;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding-left: 0;
        list-style: none;
      }

      .tags li {
        border: 1px solid #d7deea;
        border-radius: 999px;
        padding: 4px 10px;
        background: #f8fafc;
        font-size: 0.9rem;
      }

      .grid {
        display: grid;
        gap: 16px;
      }

      @media (min-width: 760px) {
        .grid.two {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .grid.three {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <p><a href="/">Back to interactive homepage</a></p>
        <h1>${escapeHtml(cv.person?.full_name || "Lukasz Komur")}</h1>
        <p class="lead"><strong>${escapeHtml(cv.person?.headline || "Software Engineer / Senior Backend Engineer / Solution Architect")}</strong></p>
        ${cleanText(cv.person?.bio_short) ? `<p>${escapeHtml(cv.person.bio_short)}</p>` : ""}
      </header>

      <section aria-labelledby="summary-heading">
        <h2 id="summary-heading">Professional summary</h2>
        <p>${escapeHtml(summaryText)}</p>
      </section>

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact and profile links</h2>
        <p>Email: <a href="mailto:${escapeHtml(cv.person?.contacts?.email)}">${escapeHtml(cv.person?.contacts?.email)}</a></p>
        ${cleanText(cv.person?.contacts?.phone) ? `<p>Phone: <a href="tel:${escapeHtml(cv.person.contacts.phone.replace(/[^\d+]/g, ""))}">${escapeHtml(cv.person.contacts.phone)}</a></p>` : ""}
        ${renderLinkList(profiles)}
      </section>

      <section aria-labelledby="strengths-heading">
        <h2 id="strengths-heading">Core strengths</h2>
        <div class="grid three">
          ${asArray(cv.summary?.cards)
            .map(
              (card) => `
          <article>
            <h3>${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.desc)}</p>
          </article>`,
            )
            .join("")}
        </div>
      </section>

      <section aria-labelledby="core-skills-heading">
        <h2 id="core-skills-heading">Core skills</h2>
        ${renderTagList([
          ...asArray(cv.pdf?.profile_focus),
          ...coreSkills,
        ])}
      </section>

      <section aria-labelledby="skills-heading">
        <h2 id="skills-heading">Skills and technologies</h2>
        <div class="grid two">
          ${groupedSkills
            .map(
              (group) => `
          <article>
            <h3>${escapeHtml(group.title)}</h3>
            ${renderTagList(group.items)}
          </article>`,
            )
            .join("")}
        </div>
      </section>

      <section aria-labelledby="experience-heading">
        <h2 id="experience-heading">Experience / Projects</h2>
        ${publicProjects.map(renderProject).join("")}
      </section>

      <section aria-labelledby="timeline-heading">
        <h2 id="timeline-heading">Timeline</h2>
        ${asArray(cv.experience_timeline).map(renderTimelineItem).join("")}
      </section>

      <section aria-labelledby="education-heading">
        <h2 id="education-heading">Education</h2>
        ${asArray(cv.education).map(renderEducationItem).join("")}
      </section>

      <section aria-labelledby="showcase-heading">
        <h2 id="showcase-heading">Featured work and side projects</h2>
        ${asArray(cv.showcase?.items).map(renderShowcaseItem).join("")}
      </section>

      <section aria-labelledby="beyond-work-heading">
        <h2 id="beyond-work-heading">Beyond work</h2>
        <h3>Soft skills</h3>
        ${renderTagList(cv.extras?.misc_skills)}
        <h3>Hobbies</h3>
        ${renderTagList(cv.extras?.hobbies)}
      </section>

      <section aria-labelledby="music-heading">
        <h2 id="music-heading">Music / AI-generated albums</h2>
        <ul>${asArray(cv.media?.spotify?.items).map(renderSpotifyItem).join("")}</ul>
      </section>

      <section aria-labelledby="metadata-heading">
        <h2 id="metadata-heading">Profile metadata</h2>
        <p>Languages: ${escapeHtml(asArray(cv.person?.spoken_languages).join(", "))}</p>
        <p>Last updated: ${escapeHtml(cv.meta?.generated_at_local)}</p>
        ${linkedInProfile ? `<p>LinkedIn: <a href="${escapeHtml(linkedInProfile.url)}">${escapeHtml(linkedInProfile.url)}</a></p>` : ""}
      </section>
    </main>
  </body>
</html>
`;

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, html, "utf8");
console.log(`Generated ${path.relative(rootDir, outputPath)}`);
