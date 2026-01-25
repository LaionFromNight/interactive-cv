export function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-xs transition",
        active
          ? "border-white/25 bg-white/15 text-white"
          : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
