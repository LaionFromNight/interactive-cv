import { useMemo, useState } from "react";

type SpotifyKind = "album" | "playlist" | "track";

export type SpotifyItem = {
  id: string;
  title: string;
  url: string; 
  note?: string;
};

type Props = {
  items: SpotifyItem[];
  title?: string;
  subtitle?: string;
  height?: number;
  initialIndex?: number;
};

function toSpotifyEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (!/open\.spotify\.com$/i.test(u.hostname)) return null;

    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const kind = parts[0] as SpotifyKind;
    const id = parts[1];
    if (!["album", "playlist", "track"].includes(kind)) return null;

    return `https://open.spotify.com/embed/${kind}/${id}`;
  } catch {
    return null;
  }
}

export function SpotifySection({
  items,
  title = "DJ Dev Studio — Soundtrack",
  subtitle = "Pick an album and press play.",
  height = 352,
  initialIndex = 0,
}: Props) {
  const safe = items ?? [];
  const [index, setIndex] = useState(() => {
    const i = Number.isFinite(initialIndex) ? initialIndex : 0;
    return Math.min(Math.max(i, 0), Math.max(safe.length - 1, 0));
  });

  const current = safe[index];

  const embedSrc = useMemo(() => {
    if (!current) return null;
    return toSpotifyEmbedUrl(current.url);
  }, [current]);

  const canNav = safe.length > 1;

  const goPrev = () => {
    if (!canNav) return;
    setIndex((i) => (i - 1 + safe.length) % safe.length);
  };

  const goNext = () => {
    if (!canNav) return;
    setIndex((i) => (i + 1) % safe.length);
  };

  return (
    <section className="py-8 md:py-10" id="music">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-white/70">{subtitle}</p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-[260px]">
            <p className="text-xs text-white/60">Now playing</p>
            <p className="mt-1 text-sm font-semibold">{current?.title ?? "—"}</p>
            {current?.note ? <p className="mt-1 text-xs text-white/60">{current.note}</p> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              disabled={!canNav}
              className={`rounded-full border px-3 py-2 text-xs ${
                canNav
                  ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  : "cursor-not-allowed border-white/5 bg-white/[0.03] text-white/30"
              }`}
              title="Previous"
            >
              Prev
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!canNav}
              className={`rounded-full border px-3 py-2 text-xs ${
                canNav
                  ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  : "cursor-not-allowed border-white/5 bg-white/[0.03] text-white/30"
              }`}
              title="Next"
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <p className="text-xs text-white/60">Album / playlist</p>
          <select
            value={String(index)}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/25 md:w-[520px]"
          >
            {safe.map((it, i) => (
              <option key={it.id} value={String(i)}>
                {it.title}
              </option>
            ))}
          </select>

          <span className="text-xs text-white/50">{safe.length ? `${index + 1}/${safe.length}` : "0/0"}</span>
        </div>

        <div className="mt-4">
          {!safe.length ? (
            <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-200">
              No Spotify items configured.
            </div>
          ) : !embedSrc ? (
            <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-200">
              Invalid Spotify URL for: <span className="font-semibold">{current?.title}</span>
              <div className="mt-2 text-xs text-amber-200/80">
                Use open.spotify.com album/playlist/track URL.
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <iframe
                title={`Spotify player: ${current.title}`}
                src={embedSrc}
                width="100%"
                height={height}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-white/50">
          Note: browsers usually block autoplay — user needs to press Play once in the player.
        </div>
      </div>
    </section>
  );
}
