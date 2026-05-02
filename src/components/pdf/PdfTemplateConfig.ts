import type { CV } from "../../lib/cvTypes";

export type PdfLabels = {
  summary: string;
  professionalSummary: string;
  coreStrengths: string;
  coreSkills: string;
  skills: string;
  profile: string;
  timeline: string;
  links: string;
  experienceProjects: string;
  experienceProjectsContinued: string;
  responsibilities: string;
  highlights: string;
  stack: string;
  cvContinued: string;
  additionalProfileDetails: string;
  lastUpdated: string;
};

export type PdfTemplateConfig = {
  qr: {
    imageSrc: string;
    targetUrl: string;
    label: string;
  };
  profileFocus: string[];
  spokenLanguages: string[];
  spokenLanguagesLine: string | null;
  labels: PdfLabels;
};

type PdfJsonConfig = {
  qr_code?: {
    image_url?: string;
    target_url?: string;
    label?: string;
  };
  profile_focus?: string[];
  labels?: Partial<{
    summary: string;
    professional_summary: string;
    core_strengths: string;
    core_skills: string;
    skills: string;
    profile: string;
    timeline: string;
    links: string;
    experience_projects: string;
    experience_projects_continued: string;
    responsibilities: string;
    highlights: string;
    stack: string;
    cv_continued: string;
    additional_profile_details: string;
    last_updated: string;
  }>;
};

type CVWithPdfConfig = CV & {
  pdf?: PdfJsonConfig;
};

const DEFAULT_PROFILE_FOCUS = [
  "Backend/ FullStack Software Engineering",
];

const DEFAULT_LABELS: PdfLabels = {
  summary: "Summary",
  professionalSummary: "Professional Summary",
  coreStrengths: "Core Strengths",
  coreSkills: "Core Skills",
  skills: "Skills",
  profile: "Profile",
  timeline: "Timeline",
  links: "Links",
  experienceProjects: "Experience / Projects",
  experienceProjectsContinued: "Experience / Projects continued",
  responsibilities: "Responsibilities",
  highlights: "Highlights",
  stack: "Stack",
  cvContinued: "CV continued",
  additionalProfileDetails: "Additional profile details",
  lastUpdated: "Last updated",
};

function getInteractiveCvProfileUrl(cv: CV) {
  return cv.person.profiles?.find((profile) => profile.id === "cv")?.url;
}

function normalizeDomainLabel(value: string | undefined) {
  if (!value) return "";

  return value
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

export function createPdfTemplateConfig(cv: CV): PdfTemplateConfig {
  const pdf = (cv as CVWithPdfConfig).pdf;

  const interactiveCvUrl = getInteractiveCvProfileUrl(cv);
  const fallbackTargetUrl = interactiveCvUrl ?? "https://lukaszkomur.dev/";
  const fallbackQrImageSrc = `${import.meta.env.BASE_URL}QRCODE.png`;

  const spokenLanguages = cv.person.spoken_languages ?? [];

  return {
    qr: {
      imageSrc: pdf?.qr_code?.image_url ?? fallbackQrImageSrc,
      targetUrl: pdf?.qr_code?.target_url ?? fallbackTargetUrl,
      label:
        pdf?.qr_code?.label ??
        normalizeDomainLabel(pdf?.qr_code?.target_url ?? fallbackTargetUrl),
    },

    profileFocus:
      pdf?.profile_focus && pdf.profile_focus.length > 0
        ? pdf.profile_focus
        : DEFAULT_PROFILE_FOCUS,

    spokenLanguages,

    spokenLanguagesLine:
      spokenLanguages.length > 0 ? spokenLanguages.join(" / ") : null,

    labels: {
      summary: pdf?.labels?.summary ?? DEFAULT_LABELS.summary,
      professionalSummary:
        pdf?.labels?.professional_summary ??
        DEFAULT_LABELS.professionalSummary,
      coreStrengths:
        pdf?.labels?.core_strengths ?? DEFAULT_LABELS.coreStrengths,
      coreSkills: pdf?.labels?.core_skills ?? DEFAULT_LABELS.coreSkills,
      skills: pdf?.labels?.skills ?? DEFAULT_LABELS.skills,
      profile: pdf?.labels?.profile ?? DEFAULT_LABELS.profile,
      timeline: pdf?.labels?.timeline ?? DEFAULT_LABELS.timeline,
      links: pdf?.labels?.links ?? DEFAULT_LABELS.links,
      experienceProjects:
        pdf?.labels?.experience_projects ?? DEFAULT_LABELS.experienceProjects,
      experienceProjectsContinued:
        pdf?.labels?.experience_projects_continued ??
        DEFAULT_LABELS.experienceProjectsContinued,
      responsibilities:
        pdf?.labels?.responsibilities ?? DEFAULT_LABELS.responsibilities,
      highlights: pdf?.labels?.highlights ?? DEFAULT_LABELS.highlights,
      stack: pdf?.labels?.stack ?? DEFAULT_LABELS.stack,
      cvContinued: pdf?.labels?.cv_continued ?? DEFAULT_LABELS.cvContinued,
      additionalProfileDetails:
        pdf?.labels?.additional_profile_details ??
        DEFAULT_LABELS.additionalProfileDetails,
      lastUpdated: pdf?.labels?.last_updated ?? DEFAULT_LABELS.lastUpdated,
    },
  };
}