import type { CV } from "../../lib/cvTypes";
import { Section } from "../layout/Section";

export function Hero({ cv }: { cv: CV }) {
  return (
    <Section id="about" className="pb-10 pt-16 md:pb-16 md:pt-24">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        JSON-driven interactive CV
      </div>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">{cv.person.full_name}</h1>
      <p className="mt-3 text-lg text-white/80 md:text-xl">{cv.person.headline}</p>
    </Section>
  );
}
