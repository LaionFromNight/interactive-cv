import type { ReactNode } from "react";

export function Section({
  id,
  className = "py-16 md:py-24",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={className}>
      {children}
    </section>
  );
}
