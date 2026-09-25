import { Font } from "@react-pdf/renderer";

type FontFace = { file: string; fontWeight: number; fontStyle?: "italic" };

/*
 * Full (latin + latin-ext) TTF files served from /public/assets/fonts,
 * so Polish and other diacritics render correctly in every typeface.
 * Family names here are the ones referenced by `typographyOptions`.
 */
const FAMILIES: Record<string, FontFace[]> = {
  Inter: [
    { file: "Inter-Regular.ttf", fontWeight: 400 },
    { file: "Inter-400-italic.ttf", fontWeight: 400, fontStyle: "italic" },
    { file: "Inter-SemiBold.ttf", fontWeight: 600 },
    { file: "Inter-700.ttf", fontWeight: 700 },
  ],
  Lora: [
    { file: "Lora-400.ttf", fontWeight: 400 },
    { file: "Lora-400-italic.ttf", fontWeight: 400, fontStyle: "italic" },
    { file: "Lora-600.ttf", fontWeight: 600 },
    { file: "Lora-700.ttf", fontWeight: 700 },
  ],
  SourceSans3: [
    { file: "SourceSans3-400.ttf", fontWeight: 400 },
    { file: "SourceSans3-400-italic.ttf", fontWeight: 400, fontStyle: "italic" },
    { file: "SourceSans3-600.ttf", fontWeight: 600 },
    { file: "SourceSans3-700.ttf", fontWeight: 700 },
  ],
  Playfair: [
    { file: "PlayfairDisplay-600.ttf", fontWeight: 400 },
    { file: "PlayfairDisplay-600.ttf", fontWeight: 600 },
    { file: "PlayfairDisplay-700.ttf", fontWeight: 700 },
  ],
};

let registeredBase: string | null = null;

/** Registers all PDF font families. `baseUrl` must end with a slash. */
export function registerPdfFonts(baseUrl: string) {
  if (registeredBase === baseUrl) return;

  Object.entries(FAMILIES).forEach(([family, faces]) => {
    Font.register({
      family,
      fonts: faces.map((face) => ({
        src: `${baseUrl}${face.file}`,
        fontWeight: face.fontWeight,
        fontStyle: face.fontStyle,
      })),
    });
  });

  // Never split words with hyphens — it looks unprofessional in a CV.
  Font.registerHyphenationCallback((word) => [word]);

  registeredBase = baseUrl;
}
