import cvRaw from "../data/cv.json";
import type { CV } from "../lib/cvTypes";

import { Nav } from "../components/layout/Nav";
import { Hero } from "../components/cv/Hero";
import { EducationSection } from "../components/cv/EducationSection";
import { ExtrasSection } from "../components/cv/ExtrasSection";
import { ContactSection } from "../components/cv/ContactSection";
import { SpotifySection } from "../components/media/SpotifySection";
import { ExperienceExplorer } from "../components/cv/ExperienceExplorer";
import { SkillsSection } from "../components/cv/SkillsSection";
import { SummarySection } from "../components/cv/SummarySection";
import { ShowcaseSection } from "../components/cv/ShowcaseSection";


const cv = cvRaw as unknown as CV;

export function Home() {
  return (
    <div className="vite-bg min-h-screen text-white">
      <Nav
        ownerName={cv.person.full_name}
        subtitle="Interactive CV"
        avatarSrc={cv.person.avatar_url}
        avatarAlt={cv.person.full_name}
      />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Hero cv={cv} />

        <SummarySection cv={cv} />

        <ShowcaseSection cv={cv} />

        <SpotifySection cv={cv} />

        <ExperienceExplorer cv={cv} />

        <SkillsSection cv={cv} />

        <EducationSection cv={cv} />

        <ExtrasSection cv={cv} />

        <ContactSection cv={cv} />
      </main>
    </div>
  );
}
