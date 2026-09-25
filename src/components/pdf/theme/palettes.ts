import { ensureContrast, mix } from "./color";

/**
 * Fully resolved set of colors used by every PDF layout.
 * Layouts never hardcode colors — they only read from this object,
 * so every layout works with every palette.
 */
export type PdfPalette = {
  /** Brand color: section titles, rules, links, timeline dots. */
  accent: string;
  /** Very light tint of the accent, used for chips and soft panels. */
  accentSoft: string;
  /** Accent darkened/lightened enough to be readable as text on paper. */
  accentText: string;
  /** Text placed on top of a solid `accent` background. */
  onAccent: string;
  /** Headings and the name. */
  ink: string;
  text: string;
  muted: string;
  subtle: string;
  border: string;
  paper: string;
  /** Neutral light panel background. */
  surface: string;
  /** Solid dark panel (sidebar, header band). */
  dark: string;
  darkText: string;
  darkMuted: string;
  darkBorder: string;
  /** Accent that stays readable on the `dark` panel. */
  darkAccent: string;
};

export type PdfPaletteGroupId =
  | "neutral"
  | "corporate"
  | "warm"
  | "natural"
  | "creative"
  | "accessible";

export type PdfPaletteDefinition = {
  id: string;
  label: string;
  group: PdfPaletteGroupId;
  colors: PdfPalette;
};

export const paletteGroups: Array<{
  id: PdfPaletteGroupId;
  label: string;
  description: string;
}> = [
  {
    id: "neutral",
    label: "Neutral & timeless",
    description: "Safe for any industry — finance, law, consulting, public sector.",
  },
  {
    id: "corporate",
    label: "Corporate blues",
    description: "Trustworthy and technical — IT, engineering, enterprise.",
  },
  {
    id: "warm",
    label: "Warm & confident",
    description: "Memorable without being loud — sales, management, hospitality.",
  },
  {
    id: "natural",
    label: "Fresh & natural",
    description: "Calm and balanced — healthcare, education, sustainability, NGO.",
  },
  {
    id: "creative",
    label: "Creative",
    description: "More personality — design, marketing, media, startups.",
  },
  {
    id: "accessible",
    label: "Accessible & print",
    description: "Maximum readability and clean black-and-white printing.",
  },
];

type PaletteSeed = {
  id: string;
  label: string;
  group: PdfPaletteGroupId;
  /** Main brand color. */
  accent: string;
  /** Dark, slightly tinted neutral used for headings and dark panels. */
  ink: string;
  paper?: string;
  overrides?: Partial<PdfPalette>;
};

function definePalette(seed: PaletteSeed): PdfPaletteDefinition {
  const paper = seed.paper ?? "#FFFFFF";
  const { accent, ink } = seed;

  const colors: PdfPalette = {
    accent,
    accentSoft: mix(accent, paper, 0.9),
    accentText: ensureContrast(accent, paper, 4.5),
    onAccent: ensureContrast("#FFFFFF", accent, 4.5),
    ink,
    text: mix(ink, paper, 0.12),
    muted: mix(ink, paper, 0.4),
    subtle: mix(ink, paper, 0.56),
    border: mix(ink, paper, 0.86),
    paper,
    surface: mix(ink, paper, 0.955),
    dark: ink,
    darkText: mix(paper, ink, 0.04),
    darkMuted: mix(paper, ink, 0.32),
    darkBorder: mix(paper, ink, 0.82),
    darkAccent: ensureContrast(mix(accent, "#FFFFFF", 0.25), ink, 4.5),
    ...seed.overrides,
  };

  return {
    id: seed.id,
    label: seed.label,
    group: seed.group,
    colors,
  };
}

export const palettes: PdfPaletteDefinition[] = [
  // Neutral & timeless
  definePalette({
    id: "graphite",
    label: "Graphite",
    group: "neutral",
    accent: "#475569",
    ink: "#111827",
  }),
  definePalette({
    id: "charcoalGold",
    label: "Charcoal & Gold",
    group: "neutral",
    accent: "#A07A3C",
    ink: "#1C1B19",
  }),
  definePalette({
    id: "slateSand",
    label: "Slate & Sand",
    group: "neutral",
    accent: "#8A7560",
    ink: "#27303B",
    paper: "#FFFEFB",
  }),

  // Corporate blues
  definePalette({
    id: "navy",
    label: "Midnight Navy",
    group: "corporate",
    accent: "#1E4E8C",
    ink: "#0F1B2D",
  }),
  definePalette({
    id: "ocean",
    label: "Ocean Blue",
    group: "corporate",
    accent: "#1D6FD8",
    ink: "#0B1F35",
  }),
  definePalette({
    id: "steelTeal",
    label: "Steel Teal",
    group: "corporate",
    accent: "#0E7490",
    ink: "#0F242B",
  }),

  // Warm & confident
  definePalette({
    id: "burgundy",
    label: "Burgundy",
    group: "warm",
    accent: "#9F1D3A",
    ink: "#2A1117",
  }),
  definePalette({
    id: "terracotta",
    label: "Terracotta",
    group: "warm",
    accent: "#C2542D",
    ink: "#2B1A14",
  }),
  definePalette({
    id: "amber",
    label: "Amber",
    group: "warm",
    accent: "#B7791F",
    ink: "#2A2116",
  }),

  // Fresh & natural
  definePalette({
    id: "emerald",
    label: "Emerald",
    group: "natural",
    accent: "#047857",
    ink: "#0D2A21",
  }),
  definePalette({
    id: "sage",
    label: "Sage",
    group: "natural",
    accent: "#5B7F63",
    ink: "#1F2B23",
  }),
  definePalette({
    id: "forest",
    label: "Forest",
    group: "natural",
    accent: "#2F6B3A",
    ink: "#142219",
  }),

  // Creative
  definePalette({
    id: "violet",
    label: "Violet",
    group: "creative",
    accent: "#6D3FD9",
    ink: "#1C1433",
  }),
  definePalette({
    id: "coral",
    label: "Coral",
    group: "creative",
    accent: "#E0525A",
    ink: "#26161B",
  }),
  definePalette({
    id: "aqua",
    label: "Aqua",
    group: "creative",
    accent: "#0FA3A3",
    ink: "#10262B",
  }),

  // Accessible & print
  definePalette({
    id: "highContrast",
    label: "High Contrast",
    group: "accessible",
    accent: "#0033B3",
    ink: "#000000",
    overrides: {
      text: "#000000",
      muted: "#2E2E2E",
      subtle: "#4A4A4A",
      border: "#8C8C8C",
      darkMuted: "#E6E6E6",
    },
  }),
  definePalette({
    id: "printMono",
    label: "Print Mono",
    group: "accessible",
    accent: "#262626",
    ink: "#111111",
    overrides: {
      accentSoft: "#F1F1F1",
    },
  }),
];

export type PdfPaletteId = (typeof palettes)[number]["id"];

export const DEFAULT_PALETTE_ID = "navy";

export function getPalette(id: string): PdfPaletteDefinition {
  return (
    palettes.find((palette) => palette.id === id) ??
    palettes.find((palette) => palette.id === DEFAULT_PALETTE_ID) ??
    palettes[0]
  );
}
