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
}: {
  src?: string;
  name: string;
  className?: string;
  textClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
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
