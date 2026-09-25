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
  const className = [
    "chip rounded-full border px-3 py-1 text-xs font-medium transition",
    active ? "chip-active" : "",
  ].join(" ");

  if (!onClick) return <span className={className}>{children}</span>;

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
