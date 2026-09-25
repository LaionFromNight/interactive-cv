import type { CV } from "../../lib/cvTypes";
import type { ExperienceFilters } from "./ExperienceExplorer";

const TECH_COLOR_PRIORITY = ["language", "backend", "cloud", "frontend", "db", "devops"] as const;

type TechItem = {
  id: string;
  name: string;
  tags: string[];
};

const getTechCategory = (tags: string[]): (typeof TECH_COLOR_PRIORITY)[number] | "other" => {
  for (const key of TECH_COLOR_PRIORITY) {
    if (tags.includes(key)) return key;
  }
  return "other";
};

const getChipClassByCategory = (category: string, active: boolean) => {
  const base =
    "tone-badge tone-badge--interactive rounded-full border px-3 py-1.5 text-xs font-medium select-none";

  const toneClassName: Record<string, string> = {
    language: "tone-badge--violet",
    backend: "tone-badge--amber",
    cloud: "tone-badge--sky",
    frontend: "tone-badge--pink",
    db: "tone-badge--emerald",
    devops: "tone-badge--indigo",
    other: "tone-badge--slate",
  };

  const tone = toneClassName[category] ?? toneClassName.other;
  return `${base} ${tone} ${active ? "tone-badge--active" : ""}`;
};


export function FiltersBar({
  cv,
  filters,
  setFilters,
  techQ,
  setTechQ,
  showAllTech,
  setShowAllTech,
  visibleTech,
  visibleTechCount,
  totalVisibleTechCount,
  onToggleTech,
  onClearTech,
}: {
  cv: CV;
  filters: ExperienceFilters;
  setFilters: (next: ExperienceFilters | ((prev: ExperienceFilters) => ExperienceFilters)) => void;
  techQ: string;
  setTechQ: (next: string) => void;
  showAllTech: boolean;
  setShowAllTech: (next: boolean) => void;
  visibleTech: TechItem[];
  visibleTechCount: number;
  totalVisibleTechCount: number;
  onToggleTech: (techId: string) => void;
  onClearTech: () => void;
}) {
  const hasActiveFilters =
    filters.q.trim() !== "" ||
    filters.companyId !== "all" ||
    filters.roleId !== "all" ||
    filters.domainId !== "all" ||
    filters.onlyOngoing ||
    filters.techIds.length > 0;

  return (
    <div className="panel p-5 md:p-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <label className="block">
          <span className="field-label">Search projects</span>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="e.g. auth, Node.js, Cognito, data sync…"
              className="field pl-10"
            />
          </div>
        </label>

        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            onClick={() => setFilters((p) => ({ ...p, onlyOngoing: !p.onlyOngoing }))}
            aria-pressed={filters.onlyOngoing}
            className={`tone-badge tone-badge--interactive tone-badge--emerald inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border px-4 text-xs font-semibold ${
              filters.onlyOngoing ? "tone-badge--active" : ""
            }`}
          >
            <span className={filters.onlyOngoing ? "pulse-dot" : "h-2 w-2 rounded-full bg-current opacity-50"} aria-hidden="true" />
            Ongoing only
          </button>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setFilters({ q: "", companyId: "all", roleId: "all", domainId: "all", onlyOngoing: false, techIds: [] });
                setTechQ("");
              }}
              className="btn btn-ghost"
            >
              Reset filters
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="field-label">Company</span>
          <select
            value={filters.companyId}
            onChange={(e) => setFilters((p) => ({ ...p, companyId: e.target.value }))}
            className="field"
          >
            <option value="all">All</option>
            {cv.companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="none">B2B collaboration</option>
          </select>
        </label>

        <label className="block">
          <span className="field-label">Role</span>
          <select
            value={filters.roleId}
            onChange={(e) => setFilters((p) => ({ ...p, roleId: e.target.value }))}
            className="field"
          >
            <option value="all">All</option>
            {cv.taxonomy.roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="field-label">Domain</span>
          <select
            value={filters.domainId}
            onChange={(e) => setFilters((p) => ({ ...p, domainId: e.target.value }))}
            className="field"
          >
            <option value="all">All</option>
            {cv.taxonomy.domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 border-t border-line pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="field-label mb-0">
            Tech stack{" "}
            <span className="normal-case tracking-normal text-subtle">
              · showing {visibleTechCount}/{totalVisibleTechCount}
            </span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={techQ}
              onChange={(e) => setTechQ(e.target.value)}
              placeholder="Filter tech…"
              aria-label="Filter tech"
              className="field min-h-[2.25rem] w-44 py-1.5"
            />
            {filters.techIds.length > 0 ? (
              <button type="button" onClick={onClearTech} className="btn btn-ghost btn-sm" title="Clear selected tech filters">
                Clear ({filters.techIds.length})
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setShowAllTech(!showAllTech)}
              className="btn btn-secondary btn-sm"
              title={showAllTech ? "Show fewer tech chips" : "Show all visible tech chips"}
            >
              {showAllTech ? "Collapse" : "Show all"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {visibleTech.map((t) => {
            const active = filters.techIds.includes(t.id);
            const cat = getTechCategory(t.tags);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggleTech(t.id)}
                aria-pressed={active}
                className={getChipClassByCategory(cat, active)}
                title={t.tags.join(", ")}
              >
                {t.name}
              </button>
            );
          })}

          {visibleTech.length === 0 ? (
            <span className="text-sm text-subtle">No tech matches.</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
