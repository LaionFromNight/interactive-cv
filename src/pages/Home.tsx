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
import { PdfGeneratorModal } from "../components/cv/PdfGeneratorModal";

const HOME_NAV_ITEMS = [
  { id: "about", label: "About", href: "#about" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "showcase", label: "Work", href: "#showcase" },
  { id: "contact", label: "Contact", href: "#contact" },
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
    <div className={`theme-shell theme-${theme} min-h-screen`}>
      <div className="site-bg" aria-hidden="true">
        <div className="site-blob site-blob--a" />
        <div className="site-blob site-blob--b" />
        <div className="site-blob site-blob--c" />
      </div>

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

      <main className="mx-auto max-w-6xl px-4 pb-8 md:px-6">
        <Hero cv={cv} onOpenPdfModal={() => setIsPdfModalOpen(true)} />

        <SummarySection cv={cv} />

        <ExperienceExplorer cv={cv} />

        <SkillsSection cv={cv} />

        <ShowcaseSection cv={cv} />

        <EducationSection cv={cv} />

        <ExtrasSection cv={cv} />

        <SpotifySection cv={cv} />

        <ContactSection cv={cv} />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-subtle md:px-6">
          <p>
            © {new Date().getFullYear()} {cv.person.full_name}
          </p>
          <a href={attribution.url} className="transition hover:text-fg">
            {attribution.text}
          </a>
        </div>
      </footer>

      <PdfGeneratorModal
        cv={cv}
        open={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      <ScrollToTopButton />
    </div>
  );
}
