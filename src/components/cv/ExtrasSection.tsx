import type { CV } from "../../lib/cvTypes";
import { SectionHeader } from "../layout/SectionHeader";

function Chip({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
      {children}
    </span>
  );
}

export function ExtrasSection({ cv }: { cv: CV }) {
  const soft = cv.extras?.misc_skills ?? [];
  const hobbies = cv.extras?.hobbies ?? [];

  return (
    <section id="extras" className="py-12 md:py-16">
      <SectionHeader title="Beyond work" desc="Soft skills and hobbies." />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/20 hover:bg-white/[0.06]">
          <p className="text-sm font-semibold">Soft skills</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {soft.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
            {soft.length === 0 ? <span className="text-sm text-white/60">No items.</span> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/20 hover:bg-white/[0.06]">
          <p className="text-sm font-semibold">Hobbies</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {hobbies.map((h) => (
              <Chip key={h}>{h}</Chip>
            ))}
            {hobbies.length === 0 ? <span className="text-sm text-white/60">No items.</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
