import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import type { CV } from "../../lib/cvTypes";
import { CvPdfDocument } from "../pdf/CvPdfDocument";
import {
  colorSchemeOptions,
  consentOptions,
  defaultCvPdfOptions,
  templateOptions,
  type CvPdfOptions,
} from "../pdf/CvPdfOptions";
import { Chip } from "../ui/Chip";

export function Hero({ cv }: { cv: CV }) {
  const [pdfOptions, setPdfOptions] =
    useState<CvPdfOptions>(defaultCvPdfOptions);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const interests = [
    { id: "short", label: "Short-term projects", tone: "accent" as const },
    { id: "mentoring", label: "Mentoring", tone: "soft" as const },
    {
      id: "nonprofit",
      label: "Non-profit (animal welfare)",
      tone: "soft" as const,
    },
    {
      id: "contact",
      label: "If you have something — reach out",
      tone: "neutral" as const,
    },
  ];

  const updatePdfOption = <K extends keyof CvPdfOptions>(
    key: K,
    value: CvPdfOptions[K],
  ) => {
    setPdfOptions((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const downloadGeneratedPdf = async () => {
    setIsGeneratingPdf(true);

    try {
      const blob = await pdf(
        <CvPdfDocument cv={cv} options={pdfOptions} />,
      ).toBlob();

      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "Lukasz-Komur-CV.pdf";
      anchor.click();

      URL.revokeObjectURL(url);
      setIsPdfModalOpen(false);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <section className="pb-10 pt-16 md:pb-16 md:pt-24" id="about">
      <div className="mt-8 flex flex-wrap items-center gap-6">
        {cv.person.avatar_url ? (
          <img
            src={cv.person.avatar_url}
            alt={cv.person.full_name}
            className="h-24 w-24 rounded-2xl border border-white/10 object-cover"
            loading="lazy"
          />
        ) : null}

        <div className="min-w-[260px]">
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
            {cv.person.full_name}
          </h1>
          <p className="mt-3 text-lg text-white/80 md:text-xl">
            {cv.person.headline}
          </p>
        </div>
      </div>

      <p className="mt-6 max-w-3xl text-base leading-7 text-white/70 md:text-lg">
        {cv.person.bio_short ?? "—"}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip>Polish</Chip>
        <Chip>English</Chip>
        <Chip>Backend / Solution Architecture</Chip>
        <Chip>System Design</Chip>
        <Chip>Cloud / Serverless</Chip>
      </div>

      <div className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/75">
        <span className="text-white/60">Currently open for:</span>

        {interests.map((interest) => (
          <span
            key={interest.id}
            className={[
              "rounded-full border px-3 py-1 text-xs",
              interest.tone === "accent"
                ? "border-amber-300/40 bg-amber-400/10 text-amber-200"
                : interest.tone === "soft"
                  ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                  : "border-white/10 bg-white/5 text-white/70",
            ].join(" ")}
          >
            {interest.label}
          </span>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <a
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
          href="#experience"
        >
          Browse experience
        </a>

        <a
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
          href="#contact"
        >
          Contact me
        </a>

        <button
          type="button"
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
          onClick={() => setIsPdfModalOpen(true)}
          title="Generate PDF from JSON"
        >
          Generate PDF
        </button>
      </div>

      {isPdfModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Generate PDF
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  Choose consent clause, template, and color scheme before
                  generating your CV.
                </p>
              </div>

              <button
                type="button"
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/10"
                onClick={() => setIsPdfModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
                  Consent clause
                </span>

                <select
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none hover:bg-slate-800"
                  value={pdfOptions.consentStandard}
                  onChange={(event) =>
                    updatePdfOption(
                      "consentStandard",
                      event.target.value as CvPdfOptions["consentStandard"],
                    )
                  }
                >
                  {consentOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-white/45">
                  {
                    consentOptions.find(
                      (option) => option.id === pdfOptions.consentStandard,
                    )?.description
                  }
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
                  Company name
                </span>

                <input
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none placeholder:text-white/30 hover:bg-slate-800"
                  value={pdfOptions.companyName}
                  onChange={(event) =>
                    updatePdfOption("companyName", event.target.value)
                  }
                  placeholder="Optional, e.g. Company Name"
                />

                <p className="mt-2 text-xs text-white/45">
                  Used only when a consent clause is selected.
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
                  PDF template
                </span>

                <select
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none hover:bg-slate-800"
                  value={pdfOptions.templateId}
                  onChange={(event) =>
                    updatePdfOption(
                      "templateId",
                      event.target.value as CvPdfOptions["templateId"],
                    )
                  }
                >
                  {templateOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-white/45">
                  {
                    templateOptions.find(
                      (option) => option.id === pdfOptions.templateId,
                    )?.description
                  }
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/50">
                  Color scheme
                </span>

                <select
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-3 text-sm text-white outline-none hover:bg-slate-800"
                  value={pdfOptions.colorSchemeId}
                  onChange={(event) =>
                    updatePdfOption(
                      "colorSchemeId",
                      event.target.value as CvPdfOptions["colorSchemeId"],
                    )
                  }
                >
                  {colorSchemeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs text-white/45">
                  {
                    colorSchemeOptions.find(
                      (option) => option.id === pdfOptions.colorSchemeId,
                    )?.description
                  }
                </p>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/75 hover:bg-white/10"
                onClick={() => setIsPdfModalOpen(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={downloadGeneratedPdf}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? "Generating..." : "Generate PDF"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}