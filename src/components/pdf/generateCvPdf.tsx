import type { CV } from "../../lib/cvTypes";
import type { CvPdfOptions } from "./CvPdfOptions";
import { createPdfTemplateConfig } from "./PdfTemplateConfig";
import { getPalette } from "./theme/palettes";

/*
 * Browser-side PDF pipeline shared by the live preview and the download button.
 * Heavy libraries are imported lazily so they never land in the main bundle.
 */

const imageCache = new Map<string, Promise<string | null>>();
const qrCache = new Map<string, Promise<string | null>>();

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function fetchAsDataUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const blob = await response.blob();
  if (!/^image\/(png|jpe?g)$/.test(blob.type)) throw new Error(`Unsupported image type ${blob.type}`);

  return blobToDataUrl(blob);
}

/**
 * Loads the avatar as a data URL. If a cross-origin URL is blocked (e.g. while
 * developing locally), retries the same path on the current origin.
 */
function loadImage(url: string | undefined) {
  if (!url) return Promise.resolve(null);

  if (!imageCache.has(url)) {
    imageCache.set(
      url,
      (async () => {
        try {
          return await fetchAsDataUrl(url);
        } catch {
          try {
            const { pathname } = new URL(url, window.location.href);
            const sameOrigin = new URL(
              `${import.meta.env.BASE_URL}${pathname.replace(/^\//, "")}`,
              window.location.href,
            ).href;
            return sameOrigin === url ? null : await fetchAsDataUrl(sameOrigin);
          } catch {
            return null;
          }
        }
      })(),
    );
  }

  return imageCache.get(url)!;
}

function createQrCode(url: string | undefined, color: string) {
  if (!url) return Promise.resolve(null);

  const key = `${url}|${color}`;

  if (!qrCache.has(key)) {
    qrCache.set(
      key,
      import("qrcode")
        .then(({ default: QRCode }) =>
          QRCode.toDataURL(url, {
            margin: 0,
            width: 360,
            errorCorrectionLevel: "M",
            color: { dark: color, light: "#FFFFFF" },
          }),
        )
        .catch(() => null),
    );
  }

  return qrCache.get(key)!;
}

async function ensureBufferPolyfill() {
  if (typeof globalThis !== "undefined" && !("Buffer" in globalThis)) {
    const { Buffer } = await import("buffer");
    (globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;
  }
}

/** Renders the CV to a PDF blob (used directly by the preview). */
export async function renderCvPdfBlob(cv: CV, options: CvPdfOptions) {
  await ensureBufferPolyfill();

  const templateConfig = createPdfTemplateConfig(cv);
  const palette = getPalette(options.paletteId).colors;

  const [{ pdf }, { CvPdfDocument }, { registerPdfFonts }, photoSrc, qrSrc] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./CvPdfDocument"),
    import("./fonts"),
    options.sections.photo ? loadImage(cv.person.avatar_url) : Promise.resolve(null),
    options.sections.qrCode ? createQrCode(templateConfig.qr?.targetUrl, palette.ink) : Promise.resolve(null),
  ]);

  registerPdfFonts(new URL(`${import.meta.env.BASE_URL}assets/fonts/`, window.location.href).href);

  return pdf(<CvPdfDocument cv={cv} options={options} assets={{ photoSrc, qrSrc }} />).toBlob();
}

export function getCvPdfFileName(cv: CV) {
  const name = cv.person.full_name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${name || "CV"}-CV.pdf`;
}

/** Renders the CV and stamps full document metadata (title, keywords…) with pdf-lib. */
export async function buildDownloadableCvPdf(cv: CV, options: CvPdfOptions) {
  const [rawBlob, { PDFDocument }, { getPdfDocumentMetadata }] = await Promise.all([
    renderCvPdfBlob(cv, options),
    import("pdf-lib"),
    import("./PdfDocumentMetadata"),
  ]);

  const metadata = getPdfDocumentMetadata(cv);
  const pdfDocument = await PDFDocument.load(await rawBlob.arrayBuffer());

  pdfDocument.setTitle(metadata.title);
  pdfDocument.setAuthor(metadata.author);
  pdfDocument.setSubject(metadata.subject);
  pdfDocument.setKeywords(
    metadata.keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
  );
  pdfDocument.setCreator(metadata.creator);
  pdfDocument.setProducer(metadata.producer);
  pdfDocument.setModificationDate(new Date());

  const pdfBytes = await pdfDocument.save();

  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
}

export function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
