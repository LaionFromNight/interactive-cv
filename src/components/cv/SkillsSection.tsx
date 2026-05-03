import type { CV } from "../../lib/cvTypes";
import { SectionHeader } from "../layout/SectionHeader";

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

const cardTone: Record<Tone, string> = {
  amber:
    "border-amber-300/15 hover:border-amber-300/30 hover:shadow-[0_30px_70px_rgba(251,191,36,0.08)]",
  sky: "border-sky-300/15 hover:border-sky-300/30 hover:shadow-[0_30px_70px_rgba(56,189,248,0.08)]",
  pink:
    "border-pink-300/15 hover:border-pink-300/30 hover:shadow-[0_30px_70px_rgba(236,72,153,0.08)]",
  emerald:
    "border-emerald-300/15 hover:border-emerald-300/30 hover:shadow-[0_30px_70px_rgba(52,211,153,0.08)]",
  indigo:
    "border-indigo-300/15 hover:border-indigo-300/30 hover:shadow-[0_30px_70px_rgba(129,140,248,0.08)]",
  violet:
    "border-violet-300/15 hover:border-violet-300/30 hover:shadow-[0_30px_70px_rgba(167,139,250,0.08)]",
  slate: "border-white/10 hover:border-white/20 hover:shadow-[0_30px_70px_rgba(255,255,255,0.04)]",
  other: "border-white/10 hover:border-white/20 hover:shadow-[0_30px_70px_rgba(255,255,255,0.04)]",
};

const chipToneClassName: Record<Tone, string> = {
  amber: "tone-badge--amber",
  sky: "tone-badge--sky",
  pink: "tone-badge--pink",
  emerald: "tone-badge--emerald",
  indigo: "tone-badge--indigo",
  violet: "tone-badge--violet",
  slate: "tone-badge--slate",
  other: "tone-badge--slate",
};

function TitleDot({ tone }: { tone: Tone }) {
  const cls =
    tone === "amber"
      ? "bg-amber-300"
      : tone === "sky"
        ? "bg-sky-300"
        : tone === "pink"
          ? "bg-pink-300"
          : tone === "emerald"
            ? "bg-emerald-300"
            : tone === "indigo"
              ? "bg-indigo-300"
              : tone === "violet"
                ? "bg-violet-300"
                : "bg-white/40";

  return <span className={`h-2 w-2 rounded-full ${cls} shadow-[0_0_16px_rgba(255,255,255,0.10)]`} />;
}

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
    <section id="skills" className="py-12 md:py-16">
      <SectionHeader title="Skills" desc="Technologies grouped by area." />

      <div className="grid gap-4 md:grid-cols-3">
        {ordered.map((g) => (
          <div
            key={g.title}
            className={`group rounded-2xl border bg-white/[0.04] p-5 transition ${cardTone[g.tone]}`}
          >
            <div className="flex items-center gap-2">
              <TitleDot tone={g.tone} />
              <p className="text-sm font-semibold">{g.title}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {g.items
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((t) => {
                  const tone = g.tone ?? "other";
                  const base = "tone-badge tone-badge--interactive rounded-full border px-3 py-1 text-xs font-medium transition";
                  return (
                    <span
                      key={t.id}
                      className={`${base} ${chipToneClassName[tone]}`}
                      title={(t.tags ?? []).join(", ")}
                    >
                      {t.name}
                    </span>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
