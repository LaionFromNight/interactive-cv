import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CV } from "../../lib/cvTypes";
import {
  consentOptions,
  contentLevelOptions,
  defaultCvPdfOptions,
  densityOptions,
  layoutOptions,
  normalizeCvPdfOptions,
  pageSizeOptions,
  sectionToggleOptions,
  typographyOptions,
  type CvPdfOptions,
  type CvPdfSectionToggles,
} from "../pdf/CvPdfOptions";
import { createPdfTemplateConfig } from "../pdf/PdfTemplateConfig";
import { LayoutThumbnail } from "../pdf/preview/LayoutThumbnail";
import { PdfPreview } from "../pdf/preview/PdfPreview";
import { getPalette, paletteGroups, palettes } from "../pdf/theme/palettes";
import { DownloadIcon } from "../ui/Icons";
import { Modal } from "../ui/Modal";

const STORAGE_KEY = "interactive-cv:pdf-options:v2";
const PREVIEW_DEBOUNCE_MS = 350;

function loadStoredOptions(): CvPdfOptions {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeCvPdfOptions(JSON.parse(raw)) : defaultCvPdfOptions;
  } catch {
    return defaultCvPdfOptions;
  }
}

function storeOptions(options: CvPdfOptions) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  } catch {
    // Storage may be unavailable (private mode) — options just won't persist.
  }
}

/* ------------------------------------------------------------------ */
/* Small UI building blocks                                            */
/* ------------------------------------------------------------------ */

function StudioSection({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-line py-5 first:pt-1 last:border-b-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-fg">
          <span className="studio-step">{step}</span>
          {title}
        </h4>
        {hint ? <span className="truncate text-xs text-subtle">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ReadonlyArray<{ id: T; label: string; description: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  const active = options.find((option) => option.id === value);

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="studio-segmented" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={option.id === value}
            className="studio-segment"
            onClick={() => onChange(option.id)}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
      {active ? <p className="mt-1.5 text-xs leading-5 text-subtle">{active.description}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

type PreviewState =
  | { status: "rendering"; blob: Blob | null }
  | { status: "ready"; blob: Blob }
  | { status: "error"; blob: Blob | null };

export function PdfGeneratorModal({
  cv,
  open,
  onClose,
}: {
  cv: CV;
  open: boolean;
  onClose: () => void;
}) {
  const [options, setOptions] = useState<CvPdfOptions>(loadStoredOptions);
  const [hoverPaletteId, setHoverPaletteId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>({ status: "rendering", blob: null });
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mobileView, setMobileView] = useState<"options" | "preview">("options");
  const renderIdRef = useRef(0);

  const templateConfig = useMemo(() => createPdfTemplateConfig(cv), [cv]);
  const availability: Partial<Record<keyof CvPdfSectionToggles, boolean>> = {
    photo: Boolean(cv.person.avatar_url),
    qrCode: Boolean(templateConfig.qr),
    education: (cv.education?.length ?? 0) > 0,
    languages: (cv.person.spoken_languages?.length ?? 0) > 0,
    strengths: (cv.extras?.misc_skills?.length ?? 0) > 0,
    interests: (cv.extras?.hobbies?.length ?? 0) > 0,
    links: (cv.person.profiles?.length ?? 0) > 0,
  };

  const selectedPalette = getPalette(options.paletteId);
  const thumbnailPalette = getPalette(hoverPaletteId ?? options.paletteId).colors;

  const update = <K extends keyof CvPdfOptions>(key: K, value: CvPdfOptions[K]) => {
    setOptions((current) => ({ ...current, [key]: value }));
  };

  const toggleSection = (key: keyof CvPdfSectionToggles) => {
    setOptions((current) => ({
      ...current,
      sections: { ...current.sections, [key]: !current.sections[key] },
    }));
  };

  useEffect(() => {
    storeOptions(options);
  }, [options]);

  // Re-render the real PDF (debounced) whenever an option changes.
  useEffect(() => {
    if (!open) return;

    const renderId = ++renderIdRef.current;
    const timer = window.setTimeout(async () => {
      setPreview((current) => ({ status: "rendering", blob: current.blob }));

      try {
        const { renderCvPdfBlob } = await import("../pdf/generateCvPdf");
        const blob = await renderCvPdfBlob(cv, options);
        if (renderId === renderIdRef.current) setPreview({ status: "ready", blob });
      } catch (error) {
        console.error("[PdfGeneratorModal] Preview rendering failed", error);
        if (renderId === renderIdRef.current) {
          setPreview((current) => ({ status: "error", blob: current.blob }));
        }
      }
    }, PREVIEW_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [cv, options, open]);

  const download = async () => {
    setIsDownloading(true);

    try {
      const { buildDownloadableCvPdf, getCvPdfFileName, triggerDownload } = await import(
        "../pdf/generateCvPdf"
      );
      const blob = await buildDownloadableCvPdf(cv, options);
      triggerDownload(blob, getCvPdfFileName(cv));
    } catch (error) {
      console.error("[PdfGeneratorModal] PDF generation failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const activeLayout = layoutOptions.find((layout) => layout.id === options.layoutId);
  const pageSizeLabel = pageSizeOptions.find((size) => size.id === options.pageSize)?.label;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      bodyClassName="overflow-hidden"
      title="CV Studio"
      subtitle="Pick a layout, colors and format. The preview is the real PDF, rebuilt live from your CV data."
      footer={
        <>
          <button
            type="button"
            className="btn btn-ghost mr-auto"
            onClick={() => setOptions(defaultCvPdfOptions)}
          >
            Reset
          </button>
          <button type="button" className="btn btn-ghost hidden sm:inline-flex" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={download}
            disabled={isDownloading}
          >
            <DownloadIcon />
            {isDownloading ? "Preparing…" : "Download PDF"}
          </button>
        </>
      }
    >
      <div className="flex h-full min-h-0 flex-col lg:grid lg:grid-cols-[minmax(340px,420px)_1fr]">
        {/* Mobile switch between the options and the preview */}
        <div className="studio-segmented m-3 lg:hidden" role="tablist" aria-label="Studio view">
          {(["options", "preview"] as const).map((view) => (
            <button
              key={view}
              type="button"
              role="tab"
              aria-selected={mobileView === view}
              aria-checked={mobileView === view}
              className="studio-segment capitalize"
              onClick={() => setMobileView(view)}
            >
              {view}
            </button>
          ))}
        </div>

        {/* ---------------- Options ---------------- */}
        <div
          className={`min-h-0 flex-1 overflow-y-auto border-line px-5 pb-6 lg:block lg:border-r lg:pt-4 ${
            mobileView === "options" ? "block" : "hidden"
          }`}
        >
          <StudioSection step={1} title="Layout" hint={activeLayout?.tags.join(" · ")}>
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-3">
              {layoutOptions.map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  className="studio-card"
                  aria-pressed={layout.id === options.layoutId}
                  onClick={() => update("layoutId", layout.id)}
                  title={layout.description}
                >
                  <LayoutThumbnail
                    layoutId={layout.id}
                    palette={thumbnailPalette}
                    className="studio-thumb"
                  />
                  <span className="mt-1.5 block text-xs font-semibold text-fg">{layout.label}</span>
                </button>
              ))}
            </div>
            <p className="mt-2.5 text-xs leading-5 text-subtle">{activeLayout?.description}</p>
          </StudioSection>

          <StudioSection step={2} title="Colors" hint={selectedPalette.label}>
            <div className="space-y-3" onMouseLeave={() => setHoverPaletteId(null)}>
              {paletteGroups.map((group) => (
                <div key={group.id}>
                  <p className="text-xs font-semibold text-muted" title={group.description}>
                    {group.label}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {palettes
                      .filter((palette) => palette.group === group.id)
                      .map((palette) => (
                        <button
                          key={palette.id}
                          type="button"
                          className="studio-swatch"
                          aria-pressed={palette.id === options.paletteId}
                          aria-label={palette.label}
                          title={palette.label}
                          onClick={() => update("paletteId", palette.id)}
                          onMouseEnter={() => setHoverPaletteId(palette.id)}
                          onFocus={() => setHoverPaletteId(palette.id)}
                          onBlur={() => setHoverPaletteId(null)}
                          style={{
                            background: `linear-gradient(135deg, ${palette.colors.dark} 0 50%, ${palette.colors.accent} 50% 100%)`,
                          }}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-subtle">
              {paletteGroups.find((group) => group.id === selectedPalette.group)?.description} Hover a
              swatch to preview it on the layout thumbnails.
            </p>
          </StudioSection>

          <StudioSection step={3} title="Typography">
            <div className="grid grid-cols-2 gap-2">
              {typographyOptions.map((typography) => (
                <button
                  key={typography.id}
                  type="button"
                  className="studio-card flex items-center gap-3 text-left"
                  aria-pressed={typography.id === options.typographyId}
                  onClick={() => update("typographyId", typography.id)}
                  title={typography.description}
                >
                  <span
                    className="text-2xl leading-none text-fg"
                    style={{ fontFamily: typography.cssHeading, fontWeight: 600 }}
                    aria-hidden="true"
                  >
                    Aa
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-fg">{typography.label}</span>
                    <span
                      className="block truncate text-[11px] text-subtle"
                      style={{ fontFamily: typography.cssBody }}
                    >
                      Żółć ąę — body text
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </StudioSection>

          <StudioSection step={4} title="Format">
            <div className="space-y-4">
              <Segmented
                label="Paper size"
                options={pageSizeOptions}
                value={options.pageSize}
                onChange={(value) => update("pageSize", value)}
              />
              <Segmented
                label="Content"
                options={contentLevelOptions}
                value={options.contentLevel}
                onChange={(value) => update("contentLevel", value)}
              />
              <Segmented
                label="Density"
                options={densityOptions}
                value={options.density}
                onChange={(value) => update("density", value)}
              />
            </div>
          </StudioSection>

          <StudioSection step={5} title="Sections">
            <div className="flex flex-wrap gap-2">
              {sectionToggleOptions.map((section) => {
                const available = availability[section.id] ?? true;

                return (
                  <button
                    key={section.id}
                    type="button"
                    className="studio-toggle"
                    aria-pressed={available && options.sections[section.id]}
                    disabled={!available}
                    onClick={() => toggleSection(section.id)}
                    title={available ? undefined : "No data for this section in cv.json"}
                  >
                    <span className="studio-toggle-box" aria-hidden="true" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </StudioSection>

          <StudioSection step={6} title="Consent clause">
            <div className="grid gap-3">
              <select
                className="field"
                aria-label="Consent clause"
                value={options.consentStandard}
                onChange={(event) =>
                  update("consentStandard", event.target.value as CvPdfOptions["consentStandard"])
                }
              >
                {consentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              {options.consentStandard !== "none" ? (
                <input
                  className="field"
                  aria-label="Company name"
                  value={options.companyName}
                  onChange={(event) => update("companyName", event.target.value)}
                  placeholder="Company name (optional)"
                />
              ) : null}
              <p className="text-xs leading-5 text-subtle">
                {consentOptions.find((option) => option.id === options.consentStandard)?.description}
              </p>
            </div>
          </StudioSection>
        </div>

        {/* ---------------- Live preview ---------------- */}
        <div
          className={`studio-preview min-h-0 flex-1 flex-col lg:flex ${
            mobileView === "preview" ? "flex" : "hidden"
          }`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3 text-xs text-muted">
            <span className="font-semibold text-fg">
              {activeLayout?.label} · {selectedPalette.label} · {pageSizeLabel}
            </span>
            <span className="flex items-center gap-2" aria-live="polite">
              {preview.status === "rendering" ? (
                <>
                  <span className="studio-spinner" aria-hidden="true" />
                  Updating preview…
                </>
              ) : preview.status === "error" ? (
                <span className="text-accent-3">Preview failed — try another option</span>
              ) : pageCount ? (
                `${pageCount} ${pageCount === 1 ? "page" : "pages"}`
              ) : null}
            </span>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-8">
            <div
              className={`mx-auto w-full max-w-[640px] transition-opacity duration-200 ${
                preview.status === "rendering" && preview.blob ? "opacity-60" : "opacity-100"
              }`}
            >
              {preview.blob ? null : (
                <div className="studio-skeleton" aria-hidden="true">
                  <LayoutThumbnail layoutId={options.layoutId} palette={selectedPalette.colors} />
                </div>
              )}
              <PdfPreview
                blob={preview.blob}
                onPageCount={setPageCount}
                onError={(error) => {
                  console.error("[PdfPreview] Rendering failed", error);
                  setPreview((current) => ({ status: "error", blob: current.blob }));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
