export type CvPdfConsentStandard = "none" | "eu" | "us" | "china";

export type CvPdfTemplateId =
  | "executiveLight"
  | "americanResume"
  | "onePageGradient"
  ;

export type CvPdfColorSchemeId =
  | "amberExecutive"
  | "emeraldArchitect"
  | "blueEngineering"
  | "graphiteMono"
  | "highContrastAccessible"
  ;

export type CvPdfOptions = {
  consentStandard: CvPdfConsentStandard;
  companyName: string;
  templateId: CvPdfTemplateId;
  colorSchemeId: CvPdfColorSchemeId;
};

export const defaultCvPdfOptions: CvPdfOptions = {
  consentStandard: "none",
  companyName: "",
  templateId: "executiveLight",
  colorSchemeId: "amberExecutive",
};

export const consentOptions: Array<{
  id: CvPdfConsentStandard;
  label: string;
  description: string;
}> = [
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
    description: "Adds a short US-style recruitment/application processing clause.",
  },
  {
    id: "china",
    label: "China / PIPL recruitment consent",
    description: "Adds a short China/PIPL-style recruitment processing clause.",
  },
];

export const templateOptions: Array<{
  id: CvPdfTemplateId;
  label: string;
  description: string;
}> = [
  {
    id: "executiveLight",
    label: "Detailed Engineering CV",
    description:
      "Two-page CV focused on senior engineering profile, skills, timeline, links, and selected project summaries.",
  },
  {
    id: "americanResume",
    label: "American Resume",
    description:
      "US-style resume with a clean single-column layout, full project descriptions, responsibilities, highlights, and stack.",
  },
  {
    id: "onePageGradient",
    label: "Visual Profile Card",
    description:
      "One-page visual profile / business-card style PDF with QR artwork, summary, core stack, and timeline.",
  },
];

export const colorSchemeOptions: Array<{
  id: CvPdfColorSchemeId;
  label: string;
  description: string;
}> = [
  {
    id: "amberExecutive",
    label: "Amber Executive",
    description: "Warm executive-style palette with subtle amber accents.",
  },
  {
    id: "highContrastAccessible",
    label: "High Contrast Accessible",
    description:
      "Maximum contrast palette for better readability and low-vision accessibility.",
  },
  {
    id: "emeraldArchitect",
    label: "Emerald Architect",
    description: "Clean light layout with restrained emerald/teal accents.",
  },
  {
    id: "blueEngineering",
    label: "Blue Engineering",
    description: "Cool technical palette with professional blue accents.",
  },
  {
    id: "graphiteMono",
    label: "Graphite Mono",
    description: "Minimal grayscale enterprise-style CV palette.",
  },
  
];

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