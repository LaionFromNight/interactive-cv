import { escapeHtml } from "./seo-utils.mjs";

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

const buildProfileViewModel = (cv) => {
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

  const isPublicProjectId = (projectId) => {
    const project = asArray(cv.projects).find((item) => item.id === projectId);
    return project?.public?.show !== false;
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

  return {
    coreSkills,
    getClientDisplayName,
    getCompanyDisplayName,
    getDomainNames,
    getProjectDisplayName,
    getRoleNames,
    getStackNames,
    groupedSkills,
    isPublicProjectId,
    publicProjects,
  };
};

const renderProject = (project, model) => {
  const projectTitle = model.getProjectDisplayName(project.id);
  const company = model.getCompanyDisplayName(project.company_id);
  const client = model.getClientDisplayName(project.client_id);
  const meta = [formatRange(project.time_range), company, client, cleanText(project.status)]
    .filter(Boolean)
    .join(" | ");
  const description = cleanText(project.description);
  const roles = model.getRoleNames(project);
  const domains = model.getDomainNames(project);
  const stack = model.getStackNames(project);

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

const renderTimelineItem = (item, model) => {
  const company = item.company_id
    ? model.getCompanyDisplayName(item.company_id)
    : model.getClientDisplayName(item.client_id) || "Experience";
  const projectNames = asArray(item.project_ids)
    .filter(model.isPublicProjectId)
    .map(model.getProjectDisplayName);

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

const renderStaticPageNavigation = (staticPages, headingId) => {
  const pages = asArray(staticPages).filter((page) => cleanText(page?.path));
  if (!pages.length) return "";

  return `
      <nav aria-labelledby="${escapeHtml(headingId)}">
        <h2 id="${escapeHtml(headingId)}">Additional pages</h2>
        <ul>${pages
          .map(
            (page) => `
          <li>
            <a href="${escapeHtml(page.path)}">${escapeHtml(page.navLabel || page.title || page.path)}</a>
            ${cleanText(page.navDescription) ? `<p>${escapeHtml(page.navDescription)}</p>` : ""}
          </li>`,
          )
          .join("")}
        </ul>
      </nav>`;
};

export const buildStaticProfileHtml = (
  cv,
  {
    className = "",
    id = "",
    headingPrefix = "static",
    staticPages = [],
    attribution = null,
  } = {},
) => {
  const model = buildProfileViewModel(cv);
  const profiles = asArray(cv.person?.profiles);
  const linkedInProfile = profiles.find((profile) => profile.id === "linkedin");
  const email = cleanText(cv.person?.contacts?.email);
  const phone = cleanText(cv.person?.contacts?.phone);
  const summaryText =
    cleanText(cv.ai_metadata?.career_summary?.long) ||
    cleanText(cv.person?.bio_short);
  const classAttr = className ? ` class="${escapeHtml(className)}"` : "";
  const idAttr = id ? ` id="${escapeHtml(id)}"` : "";
  const headingId = (name) => `${headingPrefix}-${name}-heading`;
  const attributionText = cleanText(attribution?.text);
  const attributionUrl = cleanText(attribution?.url);

  return `<main${idAttr}${classAttr} aria-label="Static CV profile">
      <header>
        <h1>${escapeHtml(cv.person?.full_name || "Lukasz Komur")}</h1>
        <p><strong>${escapeHtml(cv.person?.headline || "Software Engineer / Senior Backend Engineer / Solution Architect")}</strong></p>
        ${cleanText(cv.person?.bio_short) ? `<p>${escapeHtml(cv.person.bio_short)}</p>` : ""}
      </header>

      <section aria-labelledby="${escapeHtml(headingId("summary"))}">
        <h2 id="${escapeHtml(headingId("summary"))}">Professional summary</h2>
        <p>${escapeHtml(summaryText)}</p>
      </section>

      <section aria-labelledby="${escapeHtml(headingId("contact"))}">
        <h2 id="${escapeHtml(headingId("contact"))}">Contact and profile links</h2>
        ${email ? `<p>Email: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>` : ""}
        ${phone ? `<p>Phone: <a href="tel:${escapeHtml(phone.replace(/[^\d+]/g, ""))}">${escapeHtml(phone)}</a></p>` : ""}
        ${renderLinkList(profiles)}
      </section>

      ${renderStaticPageNavigation(staticPages, headingId("additional-pages"))}

      <section aria-labelledby="${escapeHtml(headingId("strengths"))}">
        <h2 id="${escapeHtml(headingId("strengths"))}">Core strengths</h2>
        ${asArray(cv.summary?.cards)
          .map(
            (card) => `
        <article>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.desc)}</p>
        </article>`,
          )
          .join("")}
      </section>

      <section aria-labelledby="${escapeHtml(headingId("core-skills"))}">
        <h2 id="${escapeHtml(headingId("core-skills"))}">Core skills</h2>
        ${renderTagList([
          ...asArray(cv.pdf?.profile_focus),
          ...model.coreSkills,
        ])}
      </section>

      <section aria-labelledby="${escapeHtml(headingId("skills"))}">
        <h2 id="${escapeHtml(headingId("skills"))}">Skills and technologies</h2>
        ${model.groupedSkills
          .map(
            (group) => `
        <article>
          <h3>${escapeHtml(group.title)}</h3>
          ${renderTagList(group.items)}
        </article>`,
          )
          .join("")}
      </section>

      <section aria-labelledby="${escapeHtml(headingId("experience"))}">
        <h2 id="${escapeHtml(headingId("experience"))}">Experience / Projects</h2>
        ${model.publicProjects.map((project) => renderProject(project, model)).join("")}
      </section>

      <section aria-labelledby="${escapeHtml(headingId("timeline"))}">
        <h2 id="${escapeHtml(headingId("timeline"))}">Timeline</h2>
        ${asArray(cv.experience_timeline)
          .map((item) => renderTimelineItem(item, model))
          .join("")}
      </section>

      <section aria-labelledby="${escapeHtml(headingId("education"))}">
        <h2 id="${escapeHtml(headingId("education"))}">Education</h2>
        ${asArray(cv.education).map(renderEducationItem).join("")}
      </section>

      <section aria-labelledby="${escapeHtml(headingId("showcase"))}">
        <h2 id="${escapeHtml(headingId("showcase"))}">Featured work and side projects</h2>
        ${asArray(cv.showcase?.items).map(renderShowcaseItem).join("")}
      </section>

      <section aria-labelledby="${escapeHtml(headingId("beyond-work"))}">
        <h2 id="${escapeHtml(headingId("beyond-work"))}">Beyond work</h2>
        <h3>Soft skills</h3>
        ${renderTagList(cv.extras?.misc_skills)}
        <h3>Hobbies</h3>
        ${renderTagList(cv.extras?.hobbies)}
      </section>

      <section aria-labelledby="${escapeHtml(headingId("music"))}">
        <h2 id="${escapeHtml(headingId("music"))}">Music / AI-generated albums</h2>
        <ul>${asArray(cv.media?.spotify?.items).map(renderSpotifyItem).join("")}</ul>
      </section>

      <section aria-labelledby="${escapeHtml(headingId("metadata"))}">
        <h2 id="${escapeHtml(headingId("metadata"))}">Profile metadata</h2>
        <p>Languages: ${escapeHtml(asArray(cv.person?.spoken_languages).join(", "))}</p>
        <p>Last updated: ${escapeHtml(cv.meta?.generated_at_local)}</p>
        ${linkedInProfile ? `<p>LinkedIn: <a href="${escapeHtml(linkedInProfile.url)}">${escapeHtml(linkedInProfile.url)}</a></p>` : ""}
      </section>
      ${
        attributionText && attributionUrl
          ? `<footer><p><a href="${escapeHtml(attributionUrl)}">${escapeHtml(attributionText)}</a></p></footer>`
          : ""
      }
    </main>`;
};

export const buildNoScriptProfileFallback = (
  cv,
  staticPages = [],
  attribution = null,
) => `<noscript>
      <style>
        .static-profile-noscript {
          width: min(100% - 32px, 960px);
          margin: 0 auto;
          padding: 40px 0 64px;
          color: #172033;
          background: #ffffff;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          line-height: 1.6;
        }

        .static-profile-noscript article,
        .static-profile-noscript section {
          margin-top: 24px;
        }

        .static-profile-noscript .tags {
          padding-left: 1.25rem;
        }
      </style>
      ${buildStaticProfileHtml(cv, {
        className: "static-profile-noscript",
        headingPrefix: "noscript-profile",
        staticPages,
        attribution,
      })}
    </noscript>`;
