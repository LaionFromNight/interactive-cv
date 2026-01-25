export function Card({
  title,
  subtitle,
  children,
  onClick,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={[
        "cv-card rounded-2xl border border-white/10 bg-white/[0.04] p-6",
        onClick ? "cursor-pointer hover:bg-white/[0.06]" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
