import type { CV } from "../../lib/cvTypes";
import { SectionHeader } from "../layout/SectionHeader";
import { Reveal } from "../ui/Reveal";
import { trackSpotlight } from "../ui/spotlight";

const GROUPS: { id: string; title: string; tags: string[]; tone: Tone }[] = [
  { id: "backend", title: "Backend", tags: ["backend"], tone: "amber" },
  { id: "cloud", title: "Cloud", tags: ["cloud"], tone: "sky" },
  { id: "frontend", title: "Frontend", tags: ["frontend"], tone: "pink" },
  { id: "db", title: "Databases", tags: ["db"], tone: "emerald" },
  { id: "devops", title: "DevOps", tags: ["devops"], tone: "indigo" },
  { id: "testing", title: "Testing", tags: ["testing"], tone: "violet" },
  { id: "platform", title: "Platforms", tags: ["platform"], tone: "slate" },
];

type Tone = "amber" | "sky" | "pink" | "emerald" | "indigo" | "violet" | "slate" | "other";

type TechItem = { id: string; name: string; tags: string[] };

function pickGroup(tech: TechItem): { id: string; title: string; tone: Tone } {
  for (const g of GROUPS) {
    if (g.tags.some((t) => tech.tags?.includes(t))) return { id: g.id, title: g.title, tone: g.tone };
  }
  return { id: "other", title: "Other", tone: "other" };
}

const toneRgbVar: Record<Tone, string> = {
  amber: "tone-badge--amber",
  sky: "tone-badge--sky",
  pink: "tone-badge--pink",
  emerald: "tone-badge--emerald",
  indigo: "tone-badge--indigo",
  violet: "tone-badge--violet",
  slate: "tone-badge--slate",
  other: "tone-badge--slate",
};

export function SkillsSection({ cv }: { cv: CV }) {
  const tech = cv.skills?.tech ?? [];

  const byGroup = new Map<string, { title: string; tone: Tone; items: TechItem[] }>();

  for (const t of tech) {
    const g = pickGroup(t);
    const prev = byGroup.get(g.id);
    if (!prev) byGroup.set(g.id, { title: g.title, tone: g.tone, items: [t] });
    else prev.items.push(t);
  }

  const ordered = [
    ...GROUPS.map((g) => byGroup.get(g.id)).filter(Boolean),
    byGroup.get("other"),
  ].filter((x): x is NonNullable<typeof x> => Boolean(x));

  return (
    <section id="skills" className="py-16 md:py-24">
      <SectionHeader
        eyebrow="Skills"
        title="Tools of the trade"
        desc={`${tech.length} technologies, grouped by area — from backend and cloud to testing and delivery.`}
      />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {ordered.map((g, i) => (
          <Reveal key={g.title} delay={(i % 3) * 90}>
            <div
              onPointerMove={trackSpotlight}
              className={`panel spotlight h-full p-6 hover:-translate-y-1 ${toneRgbVar[g.tone]}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: "rgb(var(--tone-rgb))", boxShadow: "0 0 14px rgba(var(--tone-rgb), 0.8)" }}
                    aria-hidden="true"
                  />
                  <p className="font-display text-base font-semibold text-fg">{g.title}</p>
                </div>
                <span className="font-display text-sm tabular-nums text-subtle">{g.items.length}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {g.items
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((t) => (
                    <span
                      key={t.id}
                      className={`tone-badge tone-badge--interactive rounded-full border px-3 py-1 text-xs font-medium ${toneRgbVar[g.tone]}`}
                      title={(t.tags ?? []).join(", ")}
                    >
                      {t.name}
                    </span>
                  ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
