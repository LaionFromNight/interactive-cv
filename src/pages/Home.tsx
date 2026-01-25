import cvRaw from "../data/cv.json";
import type { CV } from "../lib/cvTypes";
import { ExperienceExplorer } from "../components/cv/ExperienceExplorer";
import { Hero } from "../components/cv/Hero";
import { Nav } from "../components/layout/Nav";
import {SpotifySection} from "../components/media/SpotifySection";

const cv = cvRaw as unknown as CV;

export function Home() {
  const spotify = cv.media?.spotify;

  return (
    <div className="vite-bg min-h-screen text-white">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Hero cv={cv} />

        {spotify?.items?.length ? (
          <SpotifySection
            items={spotify.items}
            title={spotify.title ?? "DJ Dev Studio — Soundtrack"}
            subtitle={spotify.subtitle ?? "Pick one and hit play."}
          />
        ) : null}

        <ExperienceExplorer cv={cv} />
      </main>
    </div>
  );
}
