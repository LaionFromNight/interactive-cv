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
        "chip rounded-full border px-3 py-1 text-xs font-semibold transition",
        "focus:outline-none focus:ring-2 focus:ring-white/20",
        active ? "chip-active" : "chip-idle",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
