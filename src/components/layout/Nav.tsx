import { useEffect, useMemo, useState } from "react";

type NavItem = { id: string; label: string; href: string; trackActive?: boolean };

type Props = {
  ownerName?: string;
  subtitle?: string;
  items?: NavItem[];
  avatarSrc?: string;
  avatarAlt?: string;
  onOpenPdfModal?: () => void;
};

const DEFAULT_ITEMS: NavItem[] = [
  { id: "about", label: "About", href: "#about" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "education", label: "Education", href: "#education" },
];

const useActiveSection = (ids: string[]) => {
  const [active, setActive] = useState<string>(ids[0] ?? "about");

  useEffect(() => {
    if (!ids.length) return;

    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0.1, 0.2, 0.35, 0.5, 0.75] }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);

  return active;
};

export function Nav({
  ownerName = "Your Name",
  subtitle = "Interactive CV",
  items = DEFAULT_ITEMS,
  avatarSrc,
  avatarAlt,
  onOpenPdfModal,
}: Props) {
  const ids = useMemo(
    () => items.filter((item) => item.trackActive !== false).map((item) => item.id),
    [items],
  );
  const active = useActiveSection(ids);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <a href="#about" className="flex items-center gap-3">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={avatarAlt ?? ownerName}
              className="h-9 w-9 rounded-xl object-cover ring-1 ring-white/10"
              loading="lazy"
            />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400/80 to-emerald-400/60 ring-1 ring-white/10" />
          )}

          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">{ownerName}</p>
            <p className="text-xs text-white/60">{subtitle}</p>
          </div>
        </a>

        {/* Links */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {items.map((it) => {
            const isActive = it.trackActive === false ? false : it.id === active;
            return (
              <a
                key={it.id}
                href={it.href}
                className={`transition ${isActive ? "text-white" : "text-white/70 hover:text-white"}`}
                aria-current={isActive ? "page" : undefined}
              >
                {it.label}
              </a>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            onClick={onOpenPdfModal}
          >
            Generate CV
          </button>
          <a
            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90"
            href="#experience"
          >
            Browse projects
          </a>
        </div>
      </div>
    </header>
  );
}
