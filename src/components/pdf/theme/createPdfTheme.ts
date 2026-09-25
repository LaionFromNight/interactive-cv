import { getTypography, type CvPdfOptions } from "../CvPdfOptions";
import { getPalette, type PdfPalette } from "./palettes";

export type PdfTheme = {
  palette: PdfPalette;
  fonts: { heading: string; body: string };
  /** Scales a base font size (in pt) by typography and density. */
  fs: (size: number) => number;
  /** Scales a base spacing value (in pt) by density. */
  sp: (size: number) => number;
  page: { size: "A4" | "LETTER"; width: number; height: number };
};

const DENSITY = {
  compact: { font: 0.93, space: 0.76 },
  balanced: { font: 1, space: 1 },
  airy: { font: 1.05, space: 1.25 },
} as const;

const PAGE_DIMENSIONS = {
  A4: { width: 595.28, height: 841.89 },
  LETTER: { width: 612, height: 792 },
} as const;

const round = (value: number) => Math.round(value * 100) / 100;

export function createPdfTheme(options: CvPdfOptions): PdfTheme {
  const typography = getTypography(options.typographyId);
  const density = DENSITY[options.density];
  const fontScale = typography.scale * density.font;

  return {
    palette: getPalette(options.paletteId).colors,
    fonts: { heading: typography.headingFamily, body: typography.bodyFamily },
    fs: (size) => round(size * fontScale),
    sp: (size) => round(size * density.space),
    page: { size: options.pageSize, ...PAGE_DIMENSIONS[options.pageSize] },
  };
}
