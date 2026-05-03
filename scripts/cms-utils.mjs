import { getSiteUrl, loadJson, stripTrailingSlash } from "./seo-utils.mjs";

const asArray = (value) => (Array.isArray(value) ? value : []);
const cleanText = (value) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : "";

export const allowedTones = new Set(["violet", "gold", "blue", "emerald", "rose", "slate"]);
export const allowedAnimatedListStyles = new Set(["list", "cards", "chips"]);

export const loadCmsConfig = () => loadJson("src/data/cms.json");

export const normalizePagePath = (pagePath) => {
  const text = cleanText(pagePath);
  if (!text) return "";
  const withLeadingSlash = text.startsWith("/") ? text : `/${text}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
};

export const resolvePageCanonical = (siteUrl, page) =>
  cleanText(page?.canonical) || `${stripTrailingSlash(siteUrl)}${normalizePagePath(page?.path)}`;

export const getPageTone = (page) => {
  const tone = cleanText(page?.tone);
  return allowedTones.has(tone) ? tone : "violet";
};

export const getToneClass = (tone) => `tone-${allowedTones.has(tone) ? tone : "violet"}`;

const validateAction = (action, context, errors) => {
  if (!action || typeof action !== "object") return;
  if (!cleanText(action.label)) errors.push(`${context} CTA is missing label`);
  if (!cleanText(action.href)) errors.push(`${context} CTA is missing href`);
};

const validateStringArray = (value, fieldName, context, errors) => {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`${context} ${fieldName} must be an array`);
    return;
  }

  value.forEach((item, itemIndex) => {
    if (!cleanText(item)) {
      errors.push(`${context} ${fieldName}[${itemIndex}] must be a non-empty string`);
    }
  });
};

const validateEnabledPage = (page, index, seenEnabledPaths, seenEnabledCanonicals, siteUrl) => {
  const label = cleanText(page?.path) || `staticPages[${index}]`;
  const errors = [];
  const path = cleanText(page?.path);
  const normalizedPath = normalizePagePath(path);
  const canonical = resolvePageCanonical(siteUrl, page);

  if (!path) errors.push(`${label} is enabled but missing path`);
  if (path && !path.startsWith("/")) errors.push(`${label} path must start with "/"`);
  if (!cleanText(page?.title)) errors.push(`${label} is enabled but missing title`);
  if (!cleanText(page?.description)) errors.push(`${label} is enabled but missing description`);
  if (!cleanText(page?.navLabel)) errors.push(`${label} is enabled but missing navLabel`);
  if (!cleanText(page?.h1)) errors.push(`${label} is enabled but missing h1`);
  if (!cleanText(page?.lead)) errors.push(`${label} is enabled but missing lead`);
  if (!Array.isArray(page?.sections)) errors.push(`${label} is enabled but sections is not an array`);
  if (page?.tone !== undefined && !allowedTones.has(cleanText(page.tone))) {
    errors.push(`${label} tone must be one of ${Array.from(allowedTones).join(", ")}`);
  }

  if (normalizedPath) {
    if (seenEnabledPaths.has(normalizedPath)) {
      errors.push(`${label} duplicates enabled path ${normalizedPath}`);
    }
    seenEnabledPaths.add(normalizedPath);
  }

  if (canonical) {
    if (seenEnabledCanonicals.has(canonical)) {
      errors.push(`${label} duplicates enabled canonical ${canonical}`);
    }
    seenEnabledCanonicals.add(canonical);
  }

  asArray(page?.ctas ?? (page?.cta ? [page.cta] : [])).forEach((action, actionIndex) =>
    validateAction(action, `${label} top-level ctas[${actionIndex}]`, errors),
  );

  asArray(page?.sections).forEach((section, sectionIndex) => {
    const sectionLabel = `${label} sections[${sectionIndex}]`;
    if (!cleanText(section?.heading)) errors.push(`${sectionLabel} is missing heading`);
    if (section?.tone !== undefined && !allowedTones.has(cleanText(section.tone))) {
      errors.push(`${sectionLabel} tone must be one of ${Array.from(allowedTones).join(", ")}`);
    }

    validateStringArray(section?.badges, "badges", sectionLabel, errors);
    validateStringArray(section?.animatedList, "animatedList", sectionLabel, errors);
    validateStringArray(section?.animatedParagraphs, "animatedParagraphs", sectionLabel, errors);

    if (
      section?.animatedListStyle !== undefined &&
      !allowedAnimatedListStyles.has(cleanText(section.animatedListStyle))
    ) {
      errors.push(
        `${sectionLabel} animatedListStyle must be one of ${Array.from(allowedAnimatedListStyles).join(", ")}`,
      );
    }

    asArray(section?.ctas ?? (section?.cta ? [section.cta] : [])).forEach(
      (action, actionIndex) =>
        validateAction(action, `${sectionLabel} ctas[${actionIndex}]`, errors),
    );
  });

  return errors;
};

export const validateCmsConfig = (cms, seo) => {
  const errors = [];
  const warnings = [];

  if (!cms || typeof cms !== "object") {
    throw new Error("src/data/cms.json must contain a JSON object");
  }

  if (!Array.isArray(cms.staticPages)) {
    throw new Error("src/data/cms.json must contain staticPages array");
  }

  const seenEnabledPaths = new Set();
  const seenEnabledCanonicals = new Set();
  const seenAllPaths = new Map();
  const seenAllCanonicals = new Map();
  const siteUrl = getSiteUrl(seo);

  cms.staticPages.forEach((page, index) => {
    const normalizedPath = normalizePagePath(page?.path);
    const canonical = resolvePageCanonical(siteUrl, page);

    if (normalizedPath) {
      const previous = seenAllPaths.get(normalizedPath);
      if (previous !== undefined) {
        warnings.push(
          `staticPages[${index}] path duplicates staticPages[${previous}]: ${normalizedPath}`,
        );
      }
      seenAllPaths.set(normalizedPath, index);
    }

    if (canonical) {
      const previous = seenAllCanonicals.get(canonical);
      if (previous !== undefined) {
        warnings.push(
          `staticPages[${index}] canonical duplicates staticPages[${previous}]: ${canonical}`,
        );
      }
      seenAllCanonicals.set(canonical, index);
    }

    if (page?.enabled === true) {
      errors.push(
        ...validateEnabledPage(page, index, seenEnabledPaths, seenEnabledCanonicals, siteUrl),
      );
    }
  });

  for (const warning of warnings) {
    console.warn(`[cms] ${warning}`);
  }

  if (errors.length) {
    throw new Error(`Invalid src/data/cms.json:\n- ${errors.join("\n- ")}`);
  }
};

export const getEnabledStaticPages = (cms, seo) => {
  const siteUrl = getSiteUrl(seo);

  return cms.staticPages
    .filter((page) => page?.enabled === true)
    .map((page) => ({
      ...page,
      path: normalizePagePath(page.path),
      canonical: resolvePageCanonical(siteUrl, page),
    }));
};

export const getStaticPagesNavLabel = (cms) =>
  cleanText(cms.staticPagesNavLabel) || "More";
