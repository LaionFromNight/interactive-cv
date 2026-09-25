import { useEffect, useId, useRef, useState, type WheelEvent } from "react";
import type { CV } from "../../lib/cvTypes";
import { Section } from "../layout/Section";
import { SectionHeader } from "../layout/SectionHeader";
import { Reveal } from "../ui/Reveal";
import { trackSpotlight } from "../ui/spotlight";

type ShowcaseItem = {
  id: string;
  title: string;
  teaser: string;
  url: string;
  image_url?: string;
  image_alt?: string;
  tags?: string[];
};

const SCROLL_TOLERANCE = 8;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getHostnameLabel(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function ShowcaseSection({ cv }: { cv: CV }) {
  const showcase = cv.showcase;
  const items = (showcase?.items ?? []) as ShowcaseItem[];
  const trackRef = useRef<HTMLDivElement | null>(null);
  const trackId = useId();
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(items.length > 1);

  const updateScrollState = () => {
    const track = trackRef.current;

    if (!track) return;

    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".featured-carousel-card"));

    if (cards.length > 0) {
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - trackCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    }

    setCanScrollPrev(track.scrollLeft > SCROLL_TOLERANCE);
    setCanScrollNext(track.scrollLeft < maxScrollLeft - SCROLL_TOLERANCE);
  };

  const scrollToCard = (index: number) => {
    const track = trackRef.current;

    if (!track) return;

    const cards = Array.from(track.querySelectorAll<HTMLElement>(".featured-carousel-card"));
    const nextCard = cards[index];

    if (!nextCard) return;

    const targetLeft = nextCard.offsetLeft - (track.clientWidth - nextCard.offsetWidth) / 2;

    track.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const scrollTrack = (direction: -1 | 1) => {
    const nextIndex = Math.max(0, Math.min(items.length - 1, activeIndex + direction));

    scrollToCard(nextIndex);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const track = trackRef.current;

    if (!track || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    const scrollingBackward = event.deltaY < 0;
    const scrollingForward = event.deltaY > 0;

    if (
      maxScrollLeft <= 0 ||
      (scrollingBackward && track.scrollLeft <= 0) ||
      (scrollingForward && track.scrollLeft >= maxScrollLeft)
    ) {
      return;
    }

    event.preventDefault();
    track.scrollBy({ left: event.deltaY, behavior: "auto" });
  };

  useEffect(() => {
    const track = trackRef.current;

    if (!track) return;
    const frame = window.requestAnimationFrame(() => {
      updateScrollState();
    });

    const handleScroll = () => {
      updateScrollState();
    };

    track.addEventListener("scroll", handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(track);
    Array.from(track.children).forEach((child) => resizeObserver.observe(child));

    return () => {
      window.cancelAnimationFrame(frame);
      track.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [items.length]);

  if (!items.length) return null;

  return (
    <Section id="showcase">
      <SectionHeader
        eyebrow="Showcase"
        title={showcase?.title ?? "Featured work"}
        desc={showcase?.subtitle ?? "A few projects I’m happy to show."}
        aside={
          items.length > 1 ? (
            <div className="hidden items-center gap-2 md:flex" aria-hidden="true">
              {items.map((item, index) => (
                <span
                  key={item.id}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    index === activeIndex ? "w-8 bg-accent" : "w-1.5 bg-line-strong"
                  }`}
                />
              ))}
            </div>
          ) : null
        }
      />

      <Reveal>
        <div className="featured-carousel" role="region" aria-label="Featured work carousel">
          <button
            type="button"
            className="featured-carousel-button featured-carousel-button-prev icon-btn h-12 w-12"
            aria-label="Previous featured project"
            aria-controls={trackId}
            onClick={() => scrollTrack(-1)}
            disabled={!canScrollPrev}
          >
            <span aria-hidden="true">←</span>
          </button>

          <div
            ref={trackRef}
            id={trackId}
            className="featured-carousel-track"
            onWheel={handleWheel}
          >
            {items.map((item, index) => {
              const offset = Math.max(-2, Math.min(2, index - activeIndex));

              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="featured-carousel-card group block rounded-[1.5rem]"
                  data-active={index === activeIndex ? "true" : "false"}
                  data-offset={String(offset)}
                  title={item.url}
                >
                  <div className="panel spotlight h-full p-4" onPointerMove={trackSpotlight}>
                    <div className="relative overflow-hidden rounded-2xl border border-line bg-bg-elev">
                      <div className="aspect-video w-full">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.image_alt ?? item.title}
                            className="featured-carousel-image h-full w-full object-cover object-top"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-subtle">
                            No screenshot
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-2 pb-2 pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-xl font-semibold text-fg">{item.title}</h3>
                        <span className="text-subtle transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-accent">
                          ↗
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-muted">{item.teaser}</p>

                      {item.tags?.length ? (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {item.tags.map((t) => (
                            <span
                              key={`${item.id}-${t}`}
                              className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted ring-1 ring-line"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <p className="mt-4 text-xs font-medium text-accent">{getHostnameLabel(item.url)}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          <button
            type="button"
            className="featured-carousel-button featured-carousel-button-next icon-btn h-12 w-12"
            aria-label="Next featured project"
            aria-controls={trackId}
            onClick={() => scrollTrack(1)}
            disabled={!canScrollNext}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </Reveal>
    </Section>
  );
}
