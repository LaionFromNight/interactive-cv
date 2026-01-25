import type { CV } from "../../lib/cvTypes";
import { SectionHeader } from "../layout/SectionHeader";

function formatRange(start?: string | null, end?: string | null) {
  const s = start?.trim() ? start : "—";
  const e = end?.trim() ? end : "—";
  return `${s} → ${e}`;
}

export function EducationSection({ cv }: { cv: CV }) {
  const items = cv.education ?? [];

  return (
    <section id="education" className="py-12 md:py-16">
      <SectionHeader title="Education" desc="Formal education and courses." />

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_30px_70px_rgba(255,255,255,0.04)]"
          >
            <p className="text-sm font-semibold">{it.institution}</p>
            <p className="mt-2 text-sm text-white/70">{it.program}</p>
            <p className="mt-3 text-xs text-white/50">
              {formatRange(it.time_range?.start, it.time_range?.end)}
            </p>
          </div>
        ))}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/60">
            No education items provided.
          </div>
        ) : null}
      </div>
    </section>
  );
}
