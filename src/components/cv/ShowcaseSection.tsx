import type { CV } from "../../lib/cvTypes";
import { Section } from "../layout/Section";
import { SectionHeader } from "../layout/SectionHeader";
import { Chip } from "../ui/Chip";
import { Card } from "../ui/Card";

type ShowcaseItem = {
  id: string;
  title: string;
  teaser: string;
  url: string;
  image_url?: string;
  image_alt?: string;
  tags?: string[];
};

export function ShowcaseSection({ cv }: { cv: CV }) {
  const showcase = cv.showcase;
  const items = (showcase?.items ?? []) as ShowcaseItem[];

  if (!items.length) return null;

  return (
    <Section id="showcase" className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          title={showcase?.title ?? "Featured work"}
          desc={showcase?.subtitle ?? "A few projects I’m happy to show."}
        />

        {/* Center the whole grid so it doesn't stick to the left when there are 1-2 cards */}
        <div className="mt-8 flex justify-center">
          <div className="grid w-full max-w-5xl gap-6 md:grid-cols-2">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group block"
                title={item.url}
              >
                <Card
                  title={item.title}
                  subtitle={undefined}
                  onClick={undefined}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    <div className="aspect-video w-full">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.image_alt ?? item.title}
                          className="h-full w-full object-contain object-center"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-white/50">
                          No screenshot
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <span className="text-white/40 transition group-hover:text-white/70">↗</span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-white/70">{item.teaser}</p>

                    {item.tags?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.tags.map((t) => (
                          <Chip key={`${item.id}-${t}`}>{t}</Chip>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 text-xs text-white/40">
                      {new URL(item.url).hostname}
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
