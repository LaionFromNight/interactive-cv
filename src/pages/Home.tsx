import { useState } from "react";
import attributionRaw from "../data/attribution.json";
import cmsRaw from "../data/cms.json";
import cvRaw from "../data/cv.json";
import type { CmsConfig } from "../lib/cmsTypes";
import type { CV } from "../lib/cvTypes";
import {
  getEnabledStaticPageNavItems,
  getStaticPagesNavLabel,
} from "../lib/staticPageNav";

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
import { ScrollToTopButton } from "../components/layout/ScrollToTopButton";

const HOME_NAV_ITEMS = [
  { id: "about", label: "About", href: "#about" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "education", label: "Education", href: "#education" },
] as const;

const cv = cvRaw as unknown as CV;
const cms = cmsRaw as unknown as CmsConfig;
const attribution = attributionRaw as {
  text: string;
  url: string;
};
const staticPageNavItems = getEnabledStaticPageNavItems(cms);
const staticPagesNavLabel = getStaticPagesNavLabel(cms);

export function Home({
  theme,
  onToggleTheme,
}: {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  return (
    <div className={`vite-bg theme-shell theme-${theme} min-h-screen text-white`}>
      <Nav
        ownerName={cv.person.full_name}
        subtitle="Interactive CV"
        items={[...HOME_NAV_ITEMS]}
        staticPages={staticPageNavItems}
        staticPagesNavLabel={staticPagesNavLabel}
        avatarSrc={cv.person.avatar_url}
        avatarAlt={cv.person.full_name}
        currentTheme={theme}
        onToggleTheme={onToggleTheme}
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

        <ExperienceExplorer cv={cv} />

        <SkillsSection cv={cv} />

        <ShowcaseSection cv={cv} />

        <SpotifySection cv={cv} />

        <EducationSection cv={cv} />

        <ExtrasSection cv={cv} />

        <ContactSection cv={cv} />
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-slate-500">
        <a
          href={attribution.url}
          className="site-footer-link transition hover:text-slate-300"
        >
          {attribution.text}
        </a>
      </footer>

      <ScrollToTopButton />
    </div>
  );
}
