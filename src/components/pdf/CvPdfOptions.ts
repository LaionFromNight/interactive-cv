import { DEFAULT_PALETTE_ID, palettes } from "./theme/palettes";

/*
 * Everything in this file is plain data, safe to import from the UI bundle
 * (no @react-pdf imports). The PDF layouts read the same catalogs.
 */

export type CvPdfConsentStandard = "none" | "eu" | "us" | "china";

export type CvPdfLayoutId =
  | "classic"
  | "sidebar"
  | "modern"
  | "elegant"
  | "timeline";

export type CvPdfTypographyId =
  | "modern"
  | "classic"
  | "editorial"
  | "serif"
  | "humanist";

export type CvPdfPageSize = "A4" | "LETTER";

export type CvPdfContentLevel = "concise" | "standard" | "detailed";

export type CvPdfDensity = "compact" | "balanced" | "airy";

export type CvPdfSectionToggles = {
  photo: boolean;
  qrCode: boolean;
  links: boolean;
  skillLevels: boolean;
  education: boolean;
  languages: boolean;
  strengths: boolean;
  interests: boolean;
};

export type CvPdfOptions = {
  layoutId: CvPdfLayoutId;
  paletteId: string;
  typographyId: CvPdfTypographyId;
  pageSize: CvPdfPageSize;
  contentLevel: CvPdfContentLevel;
  density: CvPdfDensity;
  sections: CvPdfSectionToggles;
  consentStandard: CvPdfConsentStandard;
  companyName: string;
};

export const defaultCvPdfOptions: CvPdfOptions = {
  layoutId: "sidebar",
  paletteId: DEFAULT_PALETTE_ID,
  typographyId: "modern",
  pageSize: "A4",
  contentLevel: "standard",
  density: "balanced",
  sections: {
    photo: true,
    qrCode: true,
    links: true,
    skillLevels: true,
    education: true,
    languages: true,
    strengths: true,
    interests: true,
  },
  consentStandard: "none",
  companyName: "",
};

type Option<T extends string> = {
  id: T;
  label: string;
  description: string;
};

export const layoutOptions: Array<
  Option<CvPdfLayoutId> & { tags: string[] }
> = [
  {
    id: "classic",
    label: "Classic",
    description:
      "Single column, clear hierarchy and plain-text skills. The safest choice for ATS systems and conservative industries.",
    tags: ["ATS-friendly", "1 column"],
  },
  {
    id: "sidebar",
    label: "Sidebar",
    description:
      "Solid colored sidebar with photo, contact, skills and education; experience gets the full main column.",
    tags: ["2 columns", "Photo"],
  },
  {
    id: "modern",
    label: "Modern",
    description:
      "Bold header band with your name and contact details, experience on the left and skill chips on the right.",
    tags: ["Header band", "2 columns"],
  },
  {
    id: "elegant",
    label: "Elegant",
    description:
      "Centered header, serif-friendly and airy. Section titles sit in a left gutter — calm and executive.",
    tags: ["Executive", "Gutter titles"],
  },
  {
    id: "timeline",
    label: "Timeline",
    description:
      "Experience drawn as a vertical timeline with dates on the left. Great when your career path tells a story.",
    tags: ["Visual", "Career story"],
  },
];

export const typographyOptions: Array<
  Option<CvPdfTypographyId> & {
    headingFamily: string;
    bodyFamily: string;
    /** CSS font stacks used only for the in-browser selector preview. */
    cssHeading: string;
    cssBody: string;
    /** Optical size correction so every pairing has a similar text density. */
    scale: number;
  }
> = [
  {
    id: "modern",
    label: "Modern Sans",
    description: "Inter everywhere — crisp, neutral and very readable on screen.",
    headingFamily: "Inter",
    bodyFamily: "Inter",
    cssHeading: "Inter, ui-sans-serif, system-ui, sans-serif",
    cssBody: "Inter, ui-sans-serif, system-ui, sans-serif",
    scale: 1,
  },
  {
    id: "classic",
    label: "Classic Pair",
    description: "Lora serif headings with Source Sans body — traditional but fresh.",
    headingFamily: "Lora",
    bodyFamily: "SourceSans3",
    cssHeading: "Lora, Georgia, 'Times New Roman', serif",
    cssBody: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    scale: 1.06,
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "High-contrast Playfair Display headings for a magazine-like feel.",
    headingFamily: "Playfair",
    bodyFamily: "SourceSans3",
    cssHeading: "'Playfair Display', Didot, Georgia, serif",
    cssBody: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    scale: 1.06,
  },
  {
    id: "serif",
    label: "Book Serif",
    description: "Lora for everything — warm, academic and elegant.",
    headingFamily: "Lora",
    bodyFamily: "Lora",
    cssHeading: "Lora, Georgia, serif",
    cssBody: "Lora, Georgia, serif",
    scale: 0.97,
  },
  {
    id: "humanist",
    label: "Humanist",
    description: "Source Sans 3 — friendly, compact, fits more content per page.",
    headingFamily: "SourceSans3",
    bodyFamily: "SourceSans3",
    cssHeading: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    cssBody: "'Source Sans 3', 'Segoe UI', system-ui, sans-serif",
    scale: 1.06,
  },
];

export const pageSizeOptions: Array<Option<CvPdfPageSize>> = [
  {
    id: "A4",
    label: "A4",
    description: "210 × 297 mm — Europe, Asia and most of the world.",
  },
  {
    id: "LETTER",
    label: "US Letter",
    description: "8.5 × 11 in — United States and Canada.",
  },
];

export const contentLevelOptions: Array<Option<CvPdfContentLevel>> = [
  {
    id: "concise",
    label: "Concise",
    description:
      "Most recent roles with one-line descriptions. Aims for a single page.",
  },
  {
    id: "standard",
    label: "Standard",
    description:
      "All roles with descriptions, key bullet points and tech stack. Usually 2 pages.",
  },
  {
    id: "detailed",
    label: "Detailed",
    description:
      "Everything: all responsibilities, highlights and full stack for each role.",
  },
];

export const densityOptions: Array<Option<CvPdfDensity>> = [
  {
    id: "compact",
    label: "Compact",
    description: "Smaller type and tighter spacing to fit more on a page.",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Recommended default.",
  },
  {
    id: "airy",
    label: "Airy",
    description: "Larger type and more white space for short CVs.",
  },
];

export const sectionToggleOptions: Array<{
  id: keyof CvPdfSectionToggles;
  label: string;
}> = [
  { id: "photo", label: "Photo" },
  { id: "qrCode", label: "QR code" },
  { id: "links", label: "Profile links" },
  { id: "skillLevels", label: "Skill levels" },
  { id: "education", label: "Education" },
  { id: "languages", label: "Languages" },
  { id: "strengths", label: "Strengths" },
  { id: "interests", label: "Interests" },
];

export const consentOptions: Array<Option<CvPdfConsentStandard>> = [
  {
    id: "none",
    label: "No consent clause",
    description: "Do not add any data-processing consent to the CV.",
  },
  {
    id: "eu",
    label: "EU / GDPR recruitment consent",
    description: "Adds a short GDPR-style recruitment processing clause.",
  },
  {
    id: "us",
    label: "US recruitment processing consent",
    description:
      "Adds a short US-style recruitment/application processing clause.",
  },
  {
    id: "china",
    label: "China / PIPL recruitment consent",
    description: "Adds a short China/PIPL-style recruitment processing clause.",
  },
];

export function getTypography(id: CvPdfTypographyId) {
  return (
    typographyOptions.find((option) => option.id === id) ?? typographyOptions[0]
  );
}

function pickId<T extends string>(
  options: ReadonlyArray<{ id: T }>,
  value: unknown,
  fallback: T,
): T {
  return options.some((option) => option.id === value) ? (value as T) : fallback;
}

/**
 * Makes any (possibly stale or hand-edited) stored value safe to use,
 * falling back to defaults field by field.
 */
export function normalizeCvPdfOptions(value: unknown): CvPdfOptions {
  const input = (value && typeof value === "object" ? value : {}) as Partial<
    Record<keyof CvPdfOptions, unknown>
  >;
  const d = defaultCvPdfOptions;
  const rawSections = (
    input.sections && typeof input.sections === "object" ? input.sections : {}
  ) as Partial<Record<keyof CvPdfSectionToggles, unknown>>;

  const sections = Object.fromEntries(
    Object.entries(d.sections).map(([key, fallback]) => {
      const raw = rawSections[key as keyof CvPdfSectionToggles];
      return [key, typeof raw === "boolean" ? raw : fallback];
    }),
  ) as CvPdfSectionToggles;

  return {
    layoutId: pickId(layoutOptions, input.layoutId, d.layoutId),
    paletteId: pickId(palettes, input.paletteId, d.paletteId),
    typographyId: pickId(typographyOptions, input.typographyId, d.typographyId),
    pageSize: pickId(pageSizeOptions, input.pageSize, d.pageSize),
    contentLevel: pickId(contentLevelOptions, input.contentLevel, d.contentLevel),
    density: pickId(densityOptions, input.density, d.density),
    sections,
    consentStandard: pickId(consentOptions, input.consentStandard, d.consentStandard),
    companyName: typeof input.companyName === "string" ? input.companyName : "",
  };
}

export function getConsentText(options: CvPdfOptions) {
  const companyName = options.companyName.trim();
  const companyPart = companyName ? ` by ${companyName}` : "";

  switch (options.consentStandard) {
    case "eu":
      return `I consent to the processing of my personal data${companyPart} for current and future recruitment purposes in accordance with applicable EU data protection regulations, including GDPR.`;

    case "us":
      return `I authorize the processing and retention of this CV${companyPart} for recruitment, hiring, and related employment consideration purposes, in accordance with applicable law.`;

    case "china":
      return `I consent to the processing of the personal information contained in this CV${companyPart} for recruitment and employment consideration purposes, in accordance with applicable personal information protection requirements.`;

    case "none":
    default:
      return null;
  }
}
