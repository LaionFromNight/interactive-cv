import { useEffect, useMemo, useState } from "react";

type NavItem = { id: string; label: string; href: string; trackActive?: boolean };
type StaticPageNavItem = { label: string; description: string; href: string };

type Props = {
  ownerName?: string;
  subtitle?: string;
  items?: NavItem[];
  staticPages?: StaticPageNavItem[];
  staticPagesNavLabel?: string;
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

function StaticPagesNav({
  pages,
  label,
  variant,
}: {
  pages: StaticPageNavItem[];
  label: string;
  variant: "desktop" | "mobile";
}) {
  if (pages.length === 0) return null;

  const isMobile = variant === "mobile";
  const singlePage = pages[0];
  const linkClassName = isMobile
    ? "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
    : "transition text-white/70 hover:text-white";

  if (pages.length === 1 && singlePage) {
    return (
      <a className={linkClassName} href={singlePage.href}>
        {singlePage.label}
      </a>
    );
  }

  return (
    <details className="group relative">
      <summary
        className={[
          "flex cursor-pointer list-none items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 [&::-webkit-details-marker]:hidden",
          isMobile
            ? "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            : "text-white/70 transition hover:text-white",
        ].join(" ")}
      >
        {label}
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rotate-45 border-b border-r border-white/45 transition group-open:-rotate-135"
        />
      </summary>
      <div
        className={[
          "absolute right-0 top-full z-50 mt-3 rounded-xl border border-white/10 bg-black/90 p-2 shadow-2xl shadow-black/40 backdrop-blur",
          isMobile ? "w-[min(20rem,calc(100vw-2rem))]" : "w-80",
        ].join(" ")}
      >
        {pages.map((page) => (
          <a
            key={page.href}
            className="block rounded-lg px-3 py-3 text-left hover:bg-white/10 focus:bg-white/10 focus:outline-none"
            href={page.href}
          >
            <span className="block text-sm font-semibold text-white">
              {page.label}
            </span>
            <span className="mt-1 block text-xs leading-5 text-white/60">
              {page.description}
            </span>
          </a>
        ))}
      </div>
    </details>
  );
}

export function Nav({
  ownerName = "Your Name",
  subtitle = "Interactive CV",
  items = DEFAULT_ITEMS,
  staticPages = [],
  staticPagesNavLabel = "More",
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
          <StaticPagesNav
            pages={staticPages}
            label={staticPagesNavLabel}
            variant="desktop"
          />
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <StaticPagesNav
              pages={staticPages}
              label={staticPagesNavLabel}
              variant="mobile"
            />
          </div>
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
