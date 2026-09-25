import type { CV } from "../../lib/cvTypes";
import type { Indexes } from "../../lib/cvSelectors";
import { formatRange } from "../../lib/cvUtils";
import { Card } from "../ui/Card";
import { Reveal } from "../ui/Reveal";

const TECH_PREVIEW = 4;

export function ProjectsGrid({
  projects,
  idx,
  getProjectLabel,
  companyLabel,
  onSelectProject,
  onShowAll,
}: {
  projects: CV["projects"];
  idx: Indexes;
  getProjectLabel: (projectId: string) => string;
  companyLabel: (companyId: string | null) => string;
  onSelectProject: (projectId: string) => void;
  onShowAll?: () => void;
}) {
  if (projects.length === 0) {
    return (
      <div className="panel flex flex-col items-start gap-4 p-8">
        <p className="font-display text-lg font-semibold text-fg">No project matches current filters.</p>
        <p className="text-sm text-muted">Try a broader search or clear the filters.</p>
        {onShowAll ? (
          <button type="button" className="btn btn-secondary" onClick={onShowAll}>
            Show all projects
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-subtle" aria-live="polite">
        <span className="font-semibold text-fg">{projects.length}</span>{" "}
        {projects.length === 1 ? "project" : "projects"}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p, i) => {
          const ongoing = p.status === "ongoing" || p.time_range.end === null;
          const tech = [...(p.tech_usage ?? [])].sort((a, b) => b.usage - a.usage).slice(0, TECH_PREVIEW);

          return (
            <Reveal key={p.id} delay={Math.min(i, 5) * 60}>
              <Card
                title={getProjectLabel(p.id)}
                subtitle={`${formatRange(p.time_range.start, p.time_range.end)} · ${companyLabel(p.company_id)}`}
                onClick={() => onSelectProject(p.id)}
                eyebrow={
                  ongoing ? (
                    <span className="tone-badge tone-badge--emerald inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                      <span className="pulse-dot" aria-hidden="true" />
                      Ongoing
                    </span>
                  ) : undefined
                }
              >
                <p className="line-clamp-3 text-sm leading-6 text-muted">{p.description}</p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {tech.map((t) => (
                    <span key={t.tech_id} className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted ring-1 ring-line">
                      {idx.tech[t.tech_id]?.name ?? t.tech_id}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.domain_ids.map((d) => (
                    <span key={d} className="text-xs text-subtle">
                      #{(idx.domains[d]?.name ?? d).replace(/\s+/g, "")}
                    </span>
                  ))}
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
