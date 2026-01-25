import React from "react";

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
        "chip rounded-full border px-3 py-1 text-xs transition",
        "focus:outline-none focus:ring-2 focus:ring-white/20",
        active
          ? "border-white/30 bg-white/20 text-white shadow-[0_10px_30px_rgba(255,255,255,0.06)]"
          : "border-white/10 bg-white/5 text-white/75 hover:bg-white/10 hover:border-white/20",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
