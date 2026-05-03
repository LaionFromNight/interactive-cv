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
    "tone-badge tone-badge--interactive rounded-full border px-3 py-2 text-xs font-medium transition select-none " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20";

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
  return (
    <div className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <p className="text-xs text-white/60">Search</p>
        <input
          value={filters.q}
          onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
          placeholder="e.g. auth, Node.js, Cognito, data sync..."
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilters((p) => ({ ...p, onlyOngoing: !p.onlyOngoing }))}
          className={`rounded-full border px-3 py-2 text-xs ${
            filters.onlyOngoing
              ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-200"
              : "border-white/10 bg-white/5 text-white/70"
          }`}
        >
          Ongoing only
        </button>

        {filters.techIds.length > 0 ? (
          <button
            type="button"
            onClick={onClearTech}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
            title="Clear selected tech filters"
          >
            Clear ({filters.techIds.length})
          </button>
        ) : null}
      </div>

      {/* Tech chips row (colored by tag) */}
      <div className="md:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-white/60">Tech</p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllTech(!showAllTech)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
              title={showAllTech ? "Show fewer tech chips" : "Show all visible tech chips"}
            >
              {showAllTech ? "Collapse" : "Show all"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={techQ}
            onChange={(e) => setTechQ(e.target.value)}
            placeholder="Filter tech…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25 md:w-[260px]"
          />
          <span className="text-xs text-white/50">
            Showing {visibleTechCount}/{totalVisibleTechCount}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {visibleTech.map((t) => {
            const active = filters.techIds.includes(t.id);
            const cat = getTechCategory(t.tags);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onToggleTech(t.id)}
                className={getChipClassByCategory(cat, active)}
                title={t.tags.join(", ")}
              >
                {t.name}
              </button>
            );
          })}

          {visibleTech.length === 0 ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50">
              No tech matches.
            </span>
          ) : null}
        </div>
      </div>

      <div>
        <p className="text-xs text-white/60">Company</p>
        <select
          value={filters.companyId}
          onChange={(e) => setFilters((p) => ({ ...p, companyId: e.target.value }))}
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          <option value="all">All</option>
          {cv.companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="none">B2B collaboration</option>
        </select>
      </div>

      <div>
        <p className="text-xs text-white/60">Role</p>
        <select
          value={filters.roleId}
          onChange={(e) => setFilters((p) => ({ ...p, roleId: e.target.value }))}
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          <option value="all">All</option>
          {cv.taxonomy.roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs text-white/60">Domain</p>
        <select
          value={filters.domainId}
          onChange={(e) => setFilters((p) => ({ ...p, domainId: e.target.value }))}
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          <option value="all">All</option>
          {cv.taxonomy.domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
