export function SectionHeader({
  title,
  desc,
}: {
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      {desc ? <p className="mt-2 text-sm text-white/70">{desc}</p> : null}
    </div>
  );
}
