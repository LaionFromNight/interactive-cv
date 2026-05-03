import type { CmsConfig, StaticPageNavItem } from "./cmsTypes";

export const getEnabledStaticPageNavItems = (
  cms: CmsConfig,
): StaticPageNavItem[] =>
  cms.staticPages
    .filter((page) => page.enabled === true)
    .map((page) => ({
      label: page.navLabel,
      description: page.navDescription,
      href: page.path,
    }));

export const getStaticPagesNavLabel = (cms: CmsConfig) =>
  cms.staticPagesNavLabel?.trim() || "More";
