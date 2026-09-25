import type { ReactNode } from "react";
import { Reveal } from "../ui/Reveal";

export function SectionHeader({
  eyebrow,
  title,
  desc,
  aside,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  aside?: ReactNode;
}) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">{title}</h2>
        {desc ? <p className="mt-3 text-base leading-7 text-muted">{desc}</p> : null}
      </div>
      {aside}
    </Reveal>
  );
}
