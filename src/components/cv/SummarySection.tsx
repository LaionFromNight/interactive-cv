import type { CV } from "../../lib/cvTypes";
import { SectionHeader } from "../layout/SectionHeader";
import { Card } from "../ui/Card";
import { Reveal } from "../ui/Reveal";

export function SummarySection({ cv }: { cv: CV }) {
  const summary = cv.summary;
  if (!summary?.cards?.length) return null;

  return (
    <section className="py-16 md:py-20" id="summary">
      <SectionHeader
        eyebrow="In short"
        title={summary.title ?? "In short"}
        desc={summary.subtitle ?? "Key values and work style."}
      />

      <div className="grid gap-5 md:grid-cols-3">
        {summary.cards.map((c, i) => (
          <Reveal key={c.id} delay={i * 110}>
            <Card
              title={c.title}
              eyebrow={
                <span className="font-display text-sm font-semibold text-gradient">
                  {String(i + 1).padStart(2, "0")}
                </span>
              }
            >
              <p className="text-sm leading-7 text-muted">{c.desc}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
