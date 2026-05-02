import type { CV } from "../../lib/cvTypes";

type Project = CV["projects"][number];

function compactItems(items: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      items
        .filter(Boolean)
        .map((item) => item?.trim())
        .filter(Boolean) as string[],
    ),
  ).join(", ");
}

function getTechnologyKeywords(cv: CV) {
  const techById = Object.fromEntries(
    cv.skills.tech.map((tech) => [tech.id, tech]),
  );

  const usedTechIds = new Set<string>();

  cv.projects.forEach((project) => {
    project.tech_usage?.forEach((usage) => {
      usedTechIds.add(usage.tech_id);
    });
  });

  const coreTechNames = cv.skills.tech
    .filter((tech) => tech.core_stack === true)
    .map((tech) => tech.name);

  const usedTechNames = Array.from(usedTechIds)
    .map((techId) => techById[techId]?.name)
    .filter(Boolean) as string[];

  return Array.from(new Set([...coreTechNames, ...usedTechNames]));
}

function getDomainKeywords(cv: CV) {
  const domainsById = Object.fromEntries(
    cv.taxonomy.domains.map((domain) => [domain.id, domain]),
  );

  const usedDomainIds = new Set<string>();

  cv.projects.forEach((project) => {
    project.domain_ids?.forEach((domainId) => {
      usedDomainIds.add(domainId);
    });
  });

  return Array.from(usedDomainIds)
    .map((domainId) => domainsById[domainId]?.name)
    .filter(Boolean) as string[];
}

function hasAnyPattern(values: string[], patterns: RegExp[]) {
  return values.some((value) => patterns.some((pattern) => pattern.test(value)));
}

function getDynamicStrengths(cv: CV) {
  const domainKeywords = getDomainKeywords(cv);
  const technologyKeywords = getTechnologyKeywords(cv);
  const roleIds = new Set(cv.projects.flatMap((project) => project.roles ?? []));

  const strengths = new Set<string>();

  if (
    hasAnyPattern(domainKeywords, [
      /authentication/i,
      /authorization/i,
      /iam/i,
    ]) ||
    hasAnyPattern(technologyKeywords, [/cognito/i])
  ) {
    strengths.add("Security / IAM / authentication");
  }

  if (
    hasAnyPattern(technologyKeywords, [
      /aws lambda/i,
      /gcp cloud functions/i,
      /api gateway/i,
      /serverless/i,
    ])
  ) {
    strengths.add("Cloud / serverless delivery");
  }

  if (
    hasAnyPattern(domainKeywords, [
      /internal platforms/i,
      /provisioning/i,
      /developer tools/i,
    ])
  ) {
    strengths.add("Internal platforms / developer tooling");
  }

  if (hasAnyPattern(domainKeywords, [/e-commerce/i])) {
    strengths.add("E-commerce tooling / platform modernization");
  }

  if (hasAnyPattern(domainKeywords, [/marketing/i, /data sync/i])) {
    strengths.add("Integrations / data synchronization");
  }

  if (roleIds.has("role_solution_arch")) {
    strengths.add("Solution architecture");
  }

  if (
    roleIds.has("role_backend_tech_lead") ||
    roleIds.has("role_team_lead")
  ) {
    strengths.add("Technical leadership");
  }

  if (roleIds.has("role_senior_backend")) {
    strengths.add("Senior backend engineering");
  }

  return Array.from(strengths);
}

function scoreProject(project: Project, cv: CV) {
  let score = 0;

  if (project.public?.show === false) return -1;

  if (project.status === "ongoing") score += 40;

  if (project.time_range.start >= "2024-01") score += 30;
  else if (project.time_range.start >= "2023-01") score += 25;
  else if (project.time_range.start >= "2022-01") score += 18;
  else if (project.time_range.start >= "2021-01") score += 12;

  if (project.roles?.includes("role_solution_arch")) score += 25;
  if (project.roles?.includes("role_senior_backend")) score += 20;
  if (project.roles?.includes("role_backend_tech_lead")) score += 20;
  if (project.roles?.includes("role_team_lead")) score += 12;
  if (project.roles?.includes("role_fullstack")) score += 8;

  const importantDomains = new Set([
    "dom_auth",
    "dom_data_platform",
    "dom_ecomm_tools",
    "dom_marketing_sync",
    "dom_social",
  ]);

  project.domain_ids?.forEach((domainId) => {
    if (importantDomains.has(domainId)) score += 10;
  });

  const coreTechIds = new Set(
    cv.skills.tech
      .filter((tech) => tech.core_stack === true)
      .map((tech) => tech.id),
  );

  project.tech_usage?.forEach((usage) => {
    if (coreTechIds.has(usage.tech_id)) score += 4;
  });

  score += Math.min(project.responsibilities?.length ?? 0, 5);
  score += Math.min((project.highlights?.length ?? 0) * 2, 8);

  return score;
}

function getProjectPriorityKeywords(cv: CV) {
  return cv.projects
    .filter((project) => project.public?.show !== false)
    .slice()
    .sort((a, b) => scoreProject(b, cv) - scoreProject(a, cv))
    .slice(0, 6)
    .map((project) => project.display_name ?? project.name)
    .filter(Boolean);
}

export function getPdfDocumentMetadata(cv: CV) {
  const ai = cv.ai_metadata;

  const primaryTitle = ai?.positioning?.primary_title ?? cv.person.headline;

  const subject =
    ai?.career_summary?.short ?? cv.person.bio_short ?? cv.person.headline;

  const keywords = compactItems([
    primaryTitle,
    ai?.positioning?.seniority,
    ai?.ats?.preferred_tone,
    ...(ai?.positioning?.alternative_titles ?? []),
    ...(ai?.positioning?.preferred_roles ?? []),
    ...(ai?.ats?.target_markets ?? []),
    ...getTechnologyKeywords(cv),
    ...getDomainKeywords(cv),
    ...getDynamicStrengths(cv),
    ...getProjectPriorityKeywords(cv),
  ]);

  return {
    title: `${cv.person.full_name} CV - ${primaryTitle}`,
    author: cv.person.full_name,
    subject,
    keywords,
    creator: "interactive-cv",
    producer: "interactive-cv",
  };
}