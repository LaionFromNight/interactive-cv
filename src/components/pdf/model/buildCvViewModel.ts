import type { CV, CVProject, CVTech } from "../../../lib/cvTypes";
import {
  getClientDisplayName,
  shouldShowProjectName,
} from "../../../lib/cvUtils";
import { getConsentText, type CvPdfOptions } from "../CvPdfOptions";
import type { PdfLabels, PdfTemplateConfig } from "../PdfTemplateConfig";

/*
 * Normalizes cv.json into a flat, layout-friendly shape.
 * All layouts render from this model, so data rules (privacy, sorting,
 * how much detail to show) live in one place.
 */

export type CvContactItem = {
  kind: "email" | "phone" | "link";
  label: string;
  value: string;
  url?: string;
};

export type CvSkillItem = {
  id: string;
  name: string;
  /** 1–4, derived from the highest usage in projects. */
  level?: number;
};

export type CvSkillGroup = {
  id: string;
  title: string;
  items: CvSkillItem[];
};

export type CvExperienceEntry = {
  id: string;
  title: string;
  subtitle: string;
  dateRange: string;
  description: string;
  bullets: string[];
  stack: string[];
};

export type CvExperienceGroup = {
  id: string;
  /** Employer name; `null` when entries are listed without grouping. */
  employer: string | null;
  dateRange: string;
  entries: CvExperienceEntry[];
};

export type CvEducationItem = {
  id: string;
  title: string;
  institution: string;
  dateRange: string;
};

export type CvViewModel = {
  name: string;
  headline: string;
  summary: string;
  photoSrc: string | null;
  qr: { src: string; url: string; label: string } | null;
  contacts: CvContactItem[];
  links: CvContactItem[];
  focus: string[];
  skillGroups: CvSkillGroup[];
  coreSkills: CvSkillItem[];
  showSkillLevels: boolean;
  experience: CvExperienceGroup[];
  education: CvEducationItem[];
  languages: string[];
  strengths: string[];
  interests: string[];
  consentText: string | null;
  lastUpdated: string;
  labels: PdfLabels;
};

export type CvPdfAssets = {
  photoSrc: string | null;
  qrSrc: string | null;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SKILL_BUCKETS = [
  { id: "language", title: "Languages & Runtimes", tags: ["language"] },
  { id: "backend", title: "Backend & APIs", tags: ["backend", "api", "integration"] },
  { id: "frontend", title: "Frontend", tags: ["frontend", "desktop"] },
  { id: "cloud", title: "Cloud & Serverless", tags: ["cloud", "serverless", "compute", "storage"] },
  { id: "data", title: "Data & Messaging", tags: ["db", "sql", "nosql", "cache", "messaging", "streaming"] },
  { id: "devops", title: "DevOps & Observability", tags: ["devops", "observability", "mesh"] },
  { id: "security", title: "Security & Identity", tags: ["security", "auth"] },
  { id: "testing", title: "Testing & Quality", tags: ["testing"] },
  { id: "platform", title: "Platforms & Tools", tags: ["platform", "marketing", "email"] },
  { id: "ai", title: "AI & ML", tags: ["nlp", "vision", "ml", "ai"] },
] as const;

const CONTENT_LIMITS = {
  concise: { projects: 4, bullets: 0, stack: 0, skillsPerGroup: 6, skillGroups: 4, core: 6, education: 2 },
  standard: { projects: Infinity, bullets: 3, stack: 8, skillsPerGroup: 10, skillGroups: 8, core: 14, education: Infinity },
  detailed: { projects: Infinity, bullets: Infinity, stack: Infinity, skillsPerGroup: Infinity, skillGroups: Infinity, core: 18, education: Infinity },
} as const;

function formatMonth(value: string | null | undefined, present: string) {
  if (!value) return present;

  const [year, month] = value.split("-");
  const monthIndex = Number(month) - 1;

  if (!year || !month || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return value;
  }

  return `${MONTHS[monthIndex]} ${year}`;
}

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  present = "Present",
) {
  if (!start && !end) return "";
  if (start && end && start === end) return formatMonth(start, present);

  return `${formatMonth(start, present)} – ${formatMonth(end, present)}`;
}

function prettyUrl(url: string, maxLength = 34) {
  let display = url;

  try {
    const parsed = new URL(url);
    display = `${parsed.hostname.replace(/^www\./, "")}${decodeURIComponent(parsed.pathname)}`;
  } catch {
    // keep raw value
  }

  display = display.replace(/\/$/, "");

  return display.length > maxLength ? `${display.slice(0, maxLength - 1)}…` : display;
}

function getTechLevels(cv: CV) {
  const levels = new Map<string, number>();

  cv.projects.forEach((project) => {
    project.tech_usage?.forEach(({ tech_id, usage }) => {
      levels.set(tech_id, Math.max(levels.get(tech_id) ?? 0, usage));
    });
  });

  return levels;
}

function sortSkills(a: CVTech, b: CVTech, levels: Map<string, number>) {
  const core = Number(b.core_stack === true) - Number(a.core_stack === true);
  if (core !== 0) return core;

  const level = (levels.get(b.id) ?? 0) - (levels.get(a.id) ?? 0);
  if (level !== 0) return level;

  const order = (a.ui?.order ?? Infinity) - (b.ui?.order ?? Infinity);
  if (order !== 0 && Number.isFinite(order)) return order;

  return a.name.localeCompare(b.name);
}

function toSkillItem(tech: CVTech, levels: Map<string, number>): CvSkillItem {
  const level = levels.get(tech.id);

  return {
    id: tech.id,
    name: tech.name,
    level: level && level > 0 ? Math.min(level, 4) : tech.core_stack ? 3 : undefined,
  };
}

function buildSkillGroups(cv: CV, limits: (typeof CONTENT_LIMITS)[keyof typeof CONTENT_LIMITS]) {
  const levels = getTechLevels(cv);
  const assigned = new Set<string>();
  const visible = cv.skills.tech.filter((tech) => tech.ui?.visible !== false);

  const groups: CvSkillGroup[] = SKILL_BUCKETS.map((bucket) => {
    const items = visible.filter(
      (tech) =>
        !assigned.has(tech.id) &&
        tech.tags?.some((tag) => (bucket.tags as readonly string[]).includes(tag)),
    );
    items.forEach((tech) => assigned.add(tech.id));

    return { id: bucket.id, title: bucket.title, items: items.sort((a, b) => sortSkills(a, b, levels)) };
  })
    .map((group) => ({ id: group.id, title: group.title, items: group.items.map((tech) => toSkillItem(tech, levels)) }));

  const rest = visible.filter((tech) => !assigned.has(tech.id)).sort((a, b) => sortSkills(a, b, levels));

  if (rest.length > 0) {
    groups.push({ id: "other", title: "Other", items: rest.map((tech) => toSkillItem(tech, levels)) });
  }

  const skillGroups = groups
    .filter((group) => group.items.length > 0)
    .slice(0, limits.skillGroups)
    .map((group) => ({ ...group, items: group.items.slice(0, limits.skillsPerGroup) }));

  const coreSkills = visible
    .slice()
    .sort((a, b) => sortSkills(a, b, levels))
    .slice(0, limits.core)
    .map((tech) => toSkillItem(tech, levels));

  return { skillGroups, coreSkills };
}

function uniq(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function buildEntry(
  cv: CV,
  project: CVProject,
  options: CvPdfOptions,
  labels: PdfLabels,
  limits: (typeof CONTENT_LIMITS)[keyof typeof CONTENT_LIMITS],
): CvExperienceEntry {
  const rolesById = Object.fromEntries(cv.taxonomy.roles.map((role) => [role.id, role.name]));
  const techById = Object.fromEntries(cv.skills.tech.map((tech) => [tech.id, tech.name]));

  const title = shouldShowProjectName(cv, project.id)
    ? project.display_name || project.name
    : "Confidential project";

  const client = getClientDisplayName(cv, project.client_id);
  const roles = (project.roles ?? []).map((id) => rolesById[id]).filter(Boolean);

  const bullets =
    options.contentLevel === "concise"
      ? []
      : uniq([...(project.responsibilities ?? []), ...(project.highlights ?? [])]).slice(0, limits.bullets);

  const stack = (project.tech_usage ?? [])
    .slice()
    .sort((a, b) => b.usage - a.usage)
    .map((usage) => techById[usage.tech_id])
    .filter(Boolean)
    .slice(0, limits.stack);

  return {
    id: project.id,
    title,
    subtitle: [roles.join(" · "), client].filter(Boolean).join("  |  "),
    dateRange: formatDateRange(project.time_range.start, project.time_range.end, labels.present),
    description: project.description ?? "",
    bullets,
    stack,
  };
}

function buildExperience(
  cv: CV,
  options: CvPdfOptions,
  labels: PdfLabels,
  limits: (typeof CONTENT_LIMITS)[keyof typeof CONTENT_LIMITS],
): CvExperienceGroup[] {
  const byNewest = (a: CVProject, b: CVProject) =>
    (b.time_range.end ?? "9999").localeCompare(a.time_range.end ?? "9999") ||
    (b.time_range.start ?? "").localeCompare(a.time_range.start ?? "");

  const projects = cv.projects
    .filter((project) => project.public?.show !== false)
    .sort(byNewest)
    .slice(0, limits.projects);

  const included = new Set(projects.map((project) => project.id));
  const companiesById = Object.fromEntries(cv.companies.map((company) => [company.id, company]));
  const timeline = (cv.experience_timeline ?? [])
    .slice()
    .sort((a, b) => (b.end ?? "9999").localeCompare(a.end ?? "9999") || b.start.localeCompare(a.start));

  if (timeline.length === 0) {
    return [
      {
        id: "all",
        employer: null,
        dateRange: "",
        entries: projects.map((project) => buildEntry(cv, project, options, labels, limits)),
      },
    ];
  }

  const used = new Set<string>();

  const groups: CvExperienceGroup[] = timeline.map((item, index) => {
    const groupProjects = projects.filter(
      (project) =>
        !used.has(project.id) &&
        (item.project_ids?.includes(project.id) ||
          (item.company_id !== null && project.company_id === item.company_id)),
    );
    groupProjects.forEach((project) => used.add(project.id));

    const employer = item.company_id
      ? companiesById[item.company_id]?.name ?? "Company"
      : getClientDisplayName(cv, item.client_id ?? null) ?? "Independent / Contract";

    return {
      id: `${item.company_id ?? item.client_id ?? "group"}-${index}`,
      employer,
      dateRange: formatDateRange(item.start, item.end, labels.present),
      entries: groupProjects.map((project) => buildEntry(cv, project, options, labels, limits)),
    };
  });

  const leftovers = projects.filter((project) => !used.has(project.id) && included.has(project.id));

  if (leftovers.length > 0) {
    groups.push({
      id: "other-projects",
      employer: "Other projects",
      dateRange: "",
      entries: leftovers.map((project) => buildEntry(cv, project, options, labels, limits)),
    });
  }

  return groups.filter((group) => group.entries.length > 0);
}

export function buildCvViewModel(
  cv: CV,
  options: CvPdfOptions,
  templateConfig: PdfTemplateConfig,
  assets: CvPdfAssets,
): CvViewModel {
  const { labels } = templateConfig;
  const limits = CONTENT_LIMITS[options.contentLevel];
  const { sections } = options;

  const contacts: CvContactItem[] = [];

  if (cv.person.contacts.email) {
    contacts.push({
      kind: "email",
      label: "Email",
      value: cv.person.contacts.email,
      url: `mailto:${cv.person.contacts.email}`,
    });
  }

  if (cv.person.contacts.phone) {
    contacts.push({
      kind: "phone",
      label: "Phone",
      value: cv.person.contacts.phone,
      url: `tel:${cv.person.contacts.phone.replace(/\s+/g, "")}`,
    });
  }

  const links: CvContactItem[] = sections.links
    ? (cv.person.profiles ?? [])
        .filter((profile) => profile.url?.startsWith("http"))
        .map((profile) => ({
          kind: "link" as const,
          label: profile.label || profile.id,
          value: prettyUrl(profile.url),
          url: profile.url,
        }))
    : [];

  const { skillGroups, coreSkills } = buildSkillGroups(cv, limits);

  const education: CvEducationItem[] = sections.education
    ? (cv.education ?? []).slice(0, limits.education).map((item) => ({
        id: item.id,
        title: item.program,
        institution: item.institution,
        dateRange: formatDateRange(item.time_range?.start, item.time_range?.end, labels.present),
      }))
    : [];

  const qr =
    sections.qrCode && templateConfig.qr && assets.qrSrc
      ? { src: assets.qrSrc, url: templateConfig.qr.targetUrl, label: templateConfig.qr.label }
      : null;

  return {
    name: cv.person.full_name,
    headline: cv.person.headline,
    summary: cv.person.bio_short ?? cv.ai_metadata?.career_summary?.short ?? "",
    photoSrc: sections.photo ? assets.photoSrc : null,
    qr,
    contacts,
    links,
    focus: templateConfig.profileFocus,
    skillGroups,
    coreSkills,
    showSkillLevels: sections.skillLevels,
    experience: buildExperience(cv, options, labels, limits),
    education,
    languages: sections.languages ? cv.person.spoken_languages ?? [] : [],
    strengths: sections.strengths ? cv.extras?.misc_skills ?? [] : [],
    interests: sections.interests ? cv.extras?.hobbies ?? [] : [],
    consentText: getConsentText(options),
    lastUpdated: cv.meta.generated_at_local,
    labels,
  };
}
