import type { CV } from "../../lib/cvTypes";
import { Chip } from "../ui/Chip";
import { CvPdfDocument } from "../pdf/CvPdfDocument";

import { pdf } from "@react-pdf/renderer";

export function Hero({ cv }: { cv: CV }) {
  const interests = [
    { id: "short", label: "Short-term projects", tone: "accent" as const },
    { id: "mentoring", label: "Mentoring", tone: "soft" as const },
    { id: "nonprofit", label: "Non-profit (animal welfare)", tone: "soft" as const },
    { id: "contact", label: "If you have something — reach out", tone: "neutral" as const },
  ];

  const isDev = import.meta.env.DEV;

  // In production (GitHub Pages), this points to: <BASE_URL>/cv.pdf
  // Put the file here: /public/cv.pdf
  const staticPdfHref = `${import.meta.env.BASE_URL}cv.pdf`;

  const downloadGeneratedPdf = async () => {
    const blob = await pdf(<CvPdfDocument cv={cv} />).toBlob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "Lukasz-Komur-CV.pdf";
    a.click();

    URL.revokeObjectURL(url);
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
          <p className="mt-3 text-lg text-white/80 md:text-xl">{cv.person.headline}</p>
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

        {interests.map((it) => (
          <span
            key={it.id}
            className={[
              "rounded-full border px-3 py-1 text-xs",
              it.tone === "accent"
                ? "border-amber-300/40 bg-amber-400/10 text-amber-200"
                : it.tone === "soft"
                ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                : "border-white/10 bg-white/5 text-white/70",
            ].join(" ")}
          >
            {it.label}
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

        {isDev ? (
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
            onClick={downloadGeneratedPdf}
            title="Generate PDF from JSON (dev only)"
          >
            Generate PDF
          </button>
        ) : (
          <a
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/10"
            href={staticPdfHref}
            download
            title="Download static PDF"
          >
            Download PDF
          </a>
        )}
      </div>
    </section>
  );
}
