export function Timeline({
  items,
  activeCompanyId,
  onSelect,
}: {
  items: {
    key: string;
    companyId: string | null;
    title: string;
    range: string;
    projectCount: number;
  }[];
  activeCompanyId?: string;
  onSelect: (companyId: string | null) => void;
}) {
  return (
    <aside className="panel h-fit p-5 lg:sticky lg:top-24">
      <p className="field-label">Career timeline</p>
      <ol className="timeline-rail mt-3 space-y-1">
        {items.map((t) => {
          const isActive = (t.companyId ?? "none") === activeCompanyId;
          return (
            <li key={t.key} className="timeline-item relative pl-8" data-active={isActive ? "true" : "false"}>
              <span className="timeline-dot" aria-hidden="true" />
              <button
                type="button"
                className={`w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-surface-2 ${
                  isActive ? "bg-surface-2" : ""
                }`}
                aria-pressed={isActive}
                onClick={() => onSelect(t.companyId)}
              >
                <p className="font-display text-sm font-semibold text-fg">{t.title}</p>
                <p className="mt-0.5 text-xs text-muted">{t.range}</p>
                <p className="mt-1.5 text-xs font-medium text-accent">
                  {t.projectCount} {t.projectCount === 1 ? "project" : "projects"}
                </p>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
