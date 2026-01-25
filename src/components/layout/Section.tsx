import type { ReactNode } from "react";

export function Section({
  id,
  className,
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
