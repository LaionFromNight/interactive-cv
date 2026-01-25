export function Timeline({
  items,
  onSelect,
}: {
  items: {
    key: string;
    companyId: string | null;
    title: string;
    range: string;
    projectCount: number;
  }[];
  onSelect: (companyId: string | null) => void;
}) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-sm font-semibold">Timeline</p>
      <div className="mt-4 space-y-3">
        {items.map((t) => (
          <button
            key={t.key}
            type="button"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left hover:bg-white/10"
            onClick={() => onSelect(t.companyId)}
          >
            <p className="text-sm font-semibold">{t.title}</p>
            <p className="text-xs text-white/60">{t.range}</p>
            <p className="mt-2 text-xs text-white/50">Projects: {t.projectCount}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
