import type { CV } from "../../lib/cvTypes";
import { SectionHeader } from "../layout/SectionHeader";
import { Reveal } from "../ui/Reveal";

function Group({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className="panel h-full p-6">
      <p className="font-display text-base font-semibold text-fg">{title}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((s) => (
          <span key={s} className={`tone-badge tone-badge--interactive ${tone} rounded-full border px-3.5 py-1.5 text-sm`}>
            {s}
          </span>
        ))}
        {items.length === 0 ? <span className="text-sm text-muted">No items.</span> : null}
      </div>
    </div>
  );
}

export function ExtrasSection({ cv }: { cv: CV }) {
  const soft = cv.extras?.misc_skills ?? [];
  const hobbies = cv.extras?.hobbies ?? [];

  return (
    <section id="extras" className="py-16 md:py-20">
      <SectionHeader eyebrow="Beyond work" title="Beyond work" desc="Soft skills and what keeps me curious outside of code." />

      <div className="grid gap-5 md:grid-cols-2">
        <Reveal>
          <Group title="Soft skills" items={soft} tone="tone-badge--violet" />
        </Reveal>
        <Reveal delay={100}>
          <Group title="Hobbies" items={hobbies} tone="tone-badge--sky" />
        </Reveal>
      </div>
    </section>
  );
}
