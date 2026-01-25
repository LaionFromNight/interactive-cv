const navItems = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0F17]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <span className="text-sm font-semibold text-white">Interactive CV</span>
        <div className="flex items-center gap-4 text-sm text-white/70">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-white">
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
