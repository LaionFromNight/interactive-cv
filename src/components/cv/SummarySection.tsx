import type { CV } from "../../lib/cvTypes";
import { SectionHeader } from "../layout/SectionHeader";
import { Card } from "../ui/Card";

export function SummarySection({ cv }: { cv: CV }) {
  const summary = cv.summary;
  if (!summary?.cards?.length) return null;

  return (
    <section className="py-12 md:py-16" id="summary">
      <SectionHeader
        title={summary.title ?? "In short"}
        desc={summary.subtitle ?? "Key values and work style."}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {summary.cards.map((c) => (
          <Card key={c.id} title={c.title}>
            <p className="text-sm leading-6 text-white/70">{c.desc}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
