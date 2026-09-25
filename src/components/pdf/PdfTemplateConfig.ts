import type { CV, CVPdfLabels } from "../../lib/cvTypes";

export type PdfLabels = {
  summary: string;
  experience: string;
  skills: string;
  coreSkills: string;
  profile: string;
  education: string;
  languages: string;
  contact: string;
  links: string;
  strengths: string;
  interests: string;
  stack: string;
  present: string;
  lastUpdated: string;
  page: string;
};

export type PdfTemplateConfig = {
  qr: {
    targetUrl: string;
    label: string;
  } | null;
  profileFocus: string[];
  labels: PdfLabels;
};

const DEFAULT_LABELS: PdfLabels = {
  summary: "Summary",
  experience: "Experience",
  skills: "Skills",
  coreSkills: "Core Skills",
  profile: "Profile",
  education: "Education",
  languages: "Languages",
  contact: "Contact",
  links: "Links",
  strengths: "Strengths",
  interests: "Interests",
  stack: "Stack",
  present: "Present",
  lastUpdated: "Last updated",
  page: "Page",
};

/** Maps optional snake_case labels from `cv.json -> pdf.labels` onto the defaults. */
function resolveLabels(labels: CVPdfLabels | undefined): PdfLabels {
  const l = labels ?? {};

  return {
    summary: l.professional_summary ?? l.summary ?? DEFAULT_LABELS.summary,
    experience: l.experience ?? l.experience_projects ?? DEFAULT_LABELS.experience,
    skills: l.skills ?? DEFAULT_LABELS.skills,
    coreSkills: l.core_skills ?? DEFAULT_LABELS.coreSkills,
    profile: l.profile ?? DEFAULT_LABELS.profile,
    education: l.education ?? DEFAULT_LABELS.education,
    languages: l.languages ?? DEFAULT_LABELS.languages,
    contact: l.contact ?? DEFAULT_LABELS.contact,
    links: l.links ?? DEFAULT_LABELS.links,
    strengths: l.strengths ?? l.core_strengths ?? DEFAULT_LABELS.strengths,
    interests: l.interests ?? DEFAULT_LABELS.interests,
    stack: l.stack ?? DEFAULT_LABELS.stack,
    present: l.present ?? DEFAULT_LABELS.present,
    lastUpdated: l.last_updated ?? DEFAULT_LABELS.lastUpdated,
    page: l.page ?? DEFAULT_LABELS.page,
  };
}

const QR_PROFILE_IDS = ["cv", "website", "portfolio"];

export function normalizeDomainLabel(value: string | undefined) {
  if (!value) return "";

  return value.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
}

export function createPdfTemplateConfig(cv: CV): PdfTemplateConfig {
  const pdf = cv.pdf;

  const profileUrl = QR_PROFILE_IDS.map(
    (id) => cv.person.profiles?.find((profile) => profile.id === id)?.url,
  ).find(Boolean);

  const qrTargetUrl = pdf?.qr_code?.target_url ?? profileUrl;

  return {
    qr: qrTargetUrl
      ? {
          targetUrl: qrTargetUrl,
          label: pdf?.qr_code?.label ?? normalizeDomainLabel(qrTargetUrl),
        }
      : null,

    profileFocus: pdf?.profile_focus ?? [],

    labels: resolveLabels(pdf?.labels),
  };
}
