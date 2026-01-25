import type { ReactNode } from "react";
import type { CV } from "../../lib/cvTypes";
import type { Indexes } from "../../lib/cvSelectors";
import { formatRange } from "../../lib/cvUtils";
import { Card } from "../ui/Card";

const Tag = ({ children }: { children: ReactNode }) => (
  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
    {children}
  </span>
);

export function ProjectsGrid({
  projects,
  idx,
  getProjectLabel,
  companyLabel,
  onSelectProject,
}: {
  projects: CV["projects"];
  idx: Indexes;
  getProjectLabel: (projectId: string) => string;
  companyLabel: (companyId: string | null) => string;
  onSelectProject: (projectId: string) => void;
}) {
  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-sm text-white/60">
        No project matches current filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects.map((p) => (
        <Card
          key={p.id}
          title={getProjectLabel(p.id)}
          subtitle={`${formatRange(p.time_range.start, p.time_range.end)} • ${companyLabel(p.company_id)}`}
          onClick={() => onSelectProject(p.id)}
        >
          <p className="text-sm text-white/70">{p.description}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {p.domain_ids.map((d) => (
              <Tag key={d}>{idx.domains[d]?.name ?? d}</Tag>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
