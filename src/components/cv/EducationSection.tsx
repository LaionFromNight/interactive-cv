import type { CV } from "../../lib/cvTypes";
import { SectionHeader } from "../layout/SectionHeader";
import { Reveal } from "../ui/Reveal";
import { trackSpotlight } from "../ui/spotlight";

function formatRange(start?: string | null, end?: string | null) {
  const s = start?.trim() ? start : "—";
  const e = end?.trim() ? end : "—";
  return `${s} – ${e}`;
}

export function EducationSection({ cv }: { cv: CV }) {
  const items = cv.education ?? [];

  return (
    <section id="education" className="py-16 md:py-24">
      <SectionHeader eyebrow="Education" title="Education" desc="Formal education and courses." />

      <div className="grid gap-5 md:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.id} delay={i * 100}>
            <div onPointerMove={trackSpotlight} className="panel spotlight h-full p-6 hover:-translate-y-1">
              <span className="inline-flex rounded-full bg-surface-2 px-3 py-1 font-display text-xs font-semibold tabular-nums text-accent ring-1 ring-line">
                {formatRange(it.time_range?.start, it.time_range?.end)}
              </span>
              <p className="mt-4 font-display text-lg font-semibold leading-snug text-fg">{it.institution}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{it.program}</p>
            </div>
          </Reveal>
        ))}

        {items.length === 0 ? (
          <div className="panel p-6 text-sm text-muted">No education items provided.</div>
        ) : null}
      </div>
    </section>
  );
}
