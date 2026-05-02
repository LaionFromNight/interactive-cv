import { useState } from "react";
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

const HOME_NAV_ITEMS = [
  { id: "about", label: "About", href: "#about" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "education", label: "Education", href: "#education" },
  {
    id: "work-with-me",
    label: "Work with me",
    href: "/work-with-me/",
    trackActive: false,
  },
] as const;

const cv = cvRaw as unknown as CV;

export function Home() {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  return (
    <div className="vite-bg min-h-screen text-white">
      <Nav
        ownerName={cv.person.full_name}
        subtitle="Interactive CV"
        items={[...HOME_NAV_ITEMS]}
        avatarSrc={cv.person.avatar_url}
        avatarAlt={cv.person.full_name}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
      />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Hero
          cv={cv}
          isPdfModalOpen={isPdfModalOpen}
          onOpenPdfModal={() => setIsPdfModalOpen(true)}
          onClosePdfModal={() => setIsPdfModalOpen(false)}
        />

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
