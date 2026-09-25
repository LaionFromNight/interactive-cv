import type { ReactNode } from "react";
import { trackSpotlight } from "./spotlight";

export function Card({
  title,
  subtitle,
  eyebrow,
  children,
  onClick,
  className = "",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const interactive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      onPointerMove={trackSpotlight}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={[
        "panel spotlight group h-full p-6",
        interactive ? "panel-interactive" : "",
        className,
      ].join(" ")}
    >
      {eyebrow ? <div className="mb-3">{eyebrow}</div> : null}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold leading-snug text-fg">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-subtle">{subtitle}</p> : null}
        </div>
        {interactive ? (
          <span
            aria-hidden="true"
            className="mt-1 text-subtle transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
          >
            ↗
          </span>
        ) : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
