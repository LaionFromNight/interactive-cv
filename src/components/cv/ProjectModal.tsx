import type { CV } from "../../lib/cvTypes";
import type { Indexes } from "../../lib/cvSelectors";
import { formatRange } from "../../lib/cvUtils";
import { Modal } from "../ui/Modal";
import { Chip } from "../ui/Chip";

function Heading({ children }: { children: string }) {
  return <h4 className="field-label">{children}</h4>;
}

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
    <Modal
      open={open}
      title={title}
      subtitle={[formatRange(p.time_range.start, p.time_range.end), company, client, p.status].filter(Boolean).join(" · ")}
      onClose={onClose}
    >
      <div className="space-y-7">
        <div>
          <Heading>Description</Heading>
          <p className="text-[15px] leading-7 text-fg/90">{p.description}</p>
        </div>

        <div>
          <Heading>Responsibilities</Heading>
          <ul className="space-y-2">
            {p.responsibilities.map((r) => (
              <li key={r} className="flex gap-3 text-sm leading-6 text-muted">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        {p.highlights?.length ? (
          <div>
            <Heading>Highlights</Heading>
            <ul className="space-y-2">
              {p.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm leading-6 text-muted">
                  <span className="shrink-0 text-accent-2" aria-hidden="true">★</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <Heading>Domains / Roles</Heading>
          <div className="flex flex-wrap gap-2">
            {p.domain_ids.map((d) => (
              <span key={d} className="tone-badge tone-badge--sky rounded-full border px-3 py-1 text-xs font-medium">
                {idx.domains[d]?.name ?? d}
              </span>
            ))}
            {p.roles.map((r) => (
              <span key={r} className="tone-badge tone-badge--violet rounded-full border px-3 py-1 text-xs font-medium">
                {idx.roles[r]?.name ?? r}
              </span>
            ))}
          </div>
        </div>

        <div>
          <Heading>Tech — click to filter projects</Heading>
          <div className="flex flex-wrap gap-2">
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
