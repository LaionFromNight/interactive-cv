import { useEffect, useId, useRef, useState, type WheelEvent } from "react";
import type { CV } from "../../lib/cvTypes";
import { Section } from "../layout/Section";
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
    <Section id="showcase" className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="featured-carousel-header">
          <div className="featured-carousel-copy">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {showcase?.title ?? "Featured work"}
            </h2>
            <p className="mt-2 text-sm text-white/70">
              {showcase?.subtitle ?? "A few projects I’m happy to show."}
            </p>
          </div>
        </div>

        <div className="featured-carousel" role="region" aria-label="Featured work carousel">
          <button
            type="button"
            className="featured-carousel-button featured-carousel-button-prev"
            aria-label="Previous featured project"
            aria-controls={trackId}
            onClick={() => scrollTrack(-1)}
            disabled={!canScrollPrev}
          >
            <span className="featured-carousel-button-icon" aria-hidden="true">
              ←
            </span>
            <span className="featured-carousel-button-label" aria-hidden="true">
              Prev
            </span>
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
                className="featured-carousel-card group block focus:outline-none"
                data-active={index === activeIndex ? "true" : "false"}
                data-offset={String(offset)}
                title={item.url}
              >
                <Card
                  title={item.title}
                  subtitle={undefined}
                  onClick={undefined}
                >
                  {/* Image */}
                  <div className="featured-carousel-media relative overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    <div className="aspect-video w-full">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.image_alt ?? item.title}
                          className="featured-carousel-image h-full w-full object-contain object-center"
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
                      {getHostnameLabel(item.url)}
                    </div>
                  </div>
                </Card>
              </a>
              );
            })}
          </div>

          <button
            type="button"
            className="featured-carousel-button featured-carousel-button-next"
            aria-label="Next featured project"
            aria-controls={trackId}
            onClick={() => scrollTrack(1)}
            disabled={!canScrollNext}
          >
            <span className="featured-carousel-button-label" aria-hidden="true">
              Next
            </span>
            <span className="featured-carousel-button-icon" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>
    </Section>
  );
}
