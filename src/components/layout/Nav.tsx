import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "../ui/Avatar";
import { CloseIcon, DownloadIcon, MenuIcon, MoonIcon, SunIcon } from "../ui/Icons";

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
  currentTheme?: "dark" | "light";
  onToggleTheme?: () => void;
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

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(atBottom ? ids[ids.length - 1] : current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
};

/** Writes scroll progress (0..1) into a CSS variable to avoid re-rendering on scroll. */
const useScrollProgress = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      ref.current?.style.setProperty("--progress", String(progress));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return ref;
};

function StaticPagesNav({
  pages,
  label,
}: {
  pages: StaticPageNavItem[];
  label: string;
}) {
  if (pages.length === 0) return null;

  const singlePage = pages[0];

  if (pages.length === 1 && singlePage) {
    return (
      <a className="nav-link" href={singlePage.href}>
        {singlePage.label}
      </a>
    );
  }

  return (
    <details className="group relative">
      <summary className="nav-link flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden">
        {label}
        <span
          aria-hidden="true"
          className="mb-0.5 h-1.5 w-1.5 rotate-45 border-b border-r border-current transition group-open:translate-y-0.5 group-open:-rotate-135"
        />
      </summary>
      <div className="nav-static-pages-menu absolute right-0 top-full z-50 mt-3 w-80 rounded-2xl p-2">
        {pages.map((page) => (
          <a
            key={page.href}
            className="block rounded-xl px-3 py-3 text-left transition hover:bg-surface-2 focus:bg-surface-2 focus:outline-none"
            href={page.href}
          >
            <span className="block text-sm font-semibold text-fg">{page.label}</span>
            <span className="mt-1 block text-xs leading-5 text-muted">{page.description}</span>
          </a>
        ))}
      </div>
    </details>
  );
}

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "dark" | "light";
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      onClick={onToggle}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
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
  currentTheme = "dark",
  onToggleTheme,
  onOpenPdfModal,
}: Props) {
  const ids = useMemo(
    () => items.filter((item) => item.trackActive !== false).map((item) => item.id),
    [items],
  );
  const active = useActiveSection(ids);
  const progressRef = useScrollProgress();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <>
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />

      <header className="sticky top-0 z-50 px-3 pt-3 md:px-4">
        <div className="nav-shell mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-2xl pl-3 pr-2 md:pl-4">
          <a href="#about" className="flex min-w-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
            <Avatar
              src={avatarSrc}
              name={avatarAlt ?? ownerName}
              className="h-9 w-9 shrink-0 rounded-xl ring-1 ring-line"
              textClassName="text-xs"
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-sm font-semibold tracking-tight text-fg">{ownerName}</p>
              <p className="truncate text-xs text-subtle">{subtitle}</p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {items.map((it) => {
              const isActive = it.trackActive === false ? false : it.id === active;
              return (
                <a
                  key={it.id}
                  href={it.href}
                  className="nav-link"
                  aria-current={isActive ? "page" : undefined}
                >
                  {it.label}
                </a>
              );
            })}
            <StaticPagesNav pages={staticPages} label={staticPagesNavLabel} />
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle theme={currentTheme} onToggle={onToggleTheme} />
            <button
              type="button"
              className="btn btn-primary btn-sm hidden sm:inline-flex"
              onClick={onOpenPdfModal}
            >
              <DownloadIcon className="h-4 w-4" />
              Get CV
            </button>
            <button
              type="button"
              className="icon-btn md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div
            id="mobile-menu"
            className="nav-shell mx-auto mt-2 max-w-6xl rounded-2xl p-2 md:hidden"
            style={{ animation: "popIn 260ms cubic-bezier(0.22, 1, 0.36, 1)" }}
          >
            <nav className="grid gap-1" aria-label="Mobile">
              {items.map((it) => (
                <a
                  key={it.id}
                  href={it.href}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-fg transition hover:bg-surface-2"
                  aria-current={it.id === active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {it.label}
                </a>
              ))}
              {staticPages.length ? (
                <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                  {staticPagesNavLabel}
                </p>
              ) : null}
              {staticPages.map((page) => (
                <a
                  key={page.href}
                  href={page.href}
                  className="rounded-xl px-4 py-3 text-sm text-muted transition hover:bg-surface-2 hover:text-fg"
                >
                  {page.label}
                </a>
              ))}
              <button
                type="button"
                className="btn btn-primary mt-2 w-full"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenPdfModal?.();
                }}
              >
                <DownloadIcon className="h-4 w-4" />
                Generate CV (PDF)
              </button>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
