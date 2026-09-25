import { useState } from "react";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Image avatar that falls back to a gradient monogram when the URL is missing or fails. */
export function Avatar({
  src,
  name,
  className = "",
  textClassName = "text-sm",
  size = 80,
  priority = false,
}: {
  src?: string;
  name: string;
  className?: string;
  textClassName?: string;
  /** Rendered size in CSS pixels; sets intrinsic width/height to avoid layout shift. */
  size?: number;
  /** Load eagerly with high fetch priority (above-the-fold hero image). */
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={`object-cover ${className}`}
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center bg-[image:var(--grad-strong)] font-display font-bold text-white ${textClassName} ${className}`}
    >
      {initials(name)}
    </div>
  );
}
