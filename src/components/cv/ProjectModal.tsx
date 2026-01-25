import type { CV } from "../../lib/cvTypes";
import type { Indexes } from "../../lib/cvSelectors";
import { formatRange } from "../../lib/cvUtils";
import { Modal } from "../ui/Modal";
import { Chip } from "../ui/Chip";

export function ProjectModal({
  cv,
  idx,
  projectId,
  open,
  onClose,
  onToggleTech,
  getProjectLabel,
  getClientLabel,
  companyLabel,
}: {
  cv: CV;
  idx: Indexes;
  projectId: string | null;
  open: boolean;
  onClose: () => void;
  onToggleTech: (techId: string) => void;
  getProjectLabel: (projectId: string) => string;
  getClientLabel: (clientId: string | null) => string;
  companyLabel: (companyId: string | null) => string;
}) {
  const p = projectId ? cv.projects.find((x) => x.id === projectId) : null;
  if (!p) return null;

  const title = getProjectLabel(p.id);
  const company = companyLabel(p.company_id);
  const client = getClientLabel(p.client_id);

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="space-y-6">
        <div className="text-sm text-white/70">
          <div>{formatRange(p.time_range.start, p.time_range.end)}</div>
          <div>{[company, client, p.status].filter(Boolean).join(" • ")}</div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Description</h4>
          <p className="mt-2 text-sm leading-6 text-white/70">{p.description}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Responsibilities</h4>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
            {p.responsibilities.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>

        {p.highlights?.length ? (
          <div>
            <h4 className="text-sm font-semibold text-white">Highlights</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <h4 className="text-sm font-semibold text-white">Domains / Roles</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {p.domain_ids.map((d) => (
              <span key={d} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {idx.domains[d]?.name ?? d}
              </span>
            ))}
            {p.roles.map((r) => (
              <span key={r} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {idx.roles[r]?.name ?? r}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Tech (click to filter)</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...p.tech_usage].sort((a, b) => b.usage - a.usage).map((t) => (
              <Chip key={t.tech_id} onClick={() => onToggleTech(t.tech_id)}>
                {idx.tech[t.tech_id]?.name ?? t.tech_id} · {t.usage}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
