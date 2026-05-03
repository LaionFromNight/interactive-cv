export type StaticPageAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type StaticPageTone = "violet" | "gold" | "blue" | "emerald" | "rose" | "slate";

export type StaticPageSection = {
  heading: string;
  tone?: StaticPageTone;
  description?: string;
  body?: string;
  paragraphs?: string[];
  animatedParagraphs?: string[];
  badges?: string[];
  items?: string[];
  itemsStyle?: "chips" | "list";
  animatedList?: string[];
  animatedListStyle?: "list" | "cards" | "chips";
  cards?: Array<{
    title: string;
    description: string;
  }>;
  cta?: StaticPageAction;
  ctas?: StaticPageAction[];
};

export type StaticPageConfig = {
  enabled: boolean;
  path: string;
  navLabel: string;
  navDescription: string;
  title: string;
  description: string;
  canonical: string;
  robots: string;
  tone?: StaticPageTone;
  redirectFrom?: string[];
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    image?: {
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    };
  };
  twitter?: {
    title?: string;
    description?: string;
    image?: string;
  };
  h1: string;
  lead: string;
  heroNote?: string;
  cta?: StaticPageAction;
  ctas?: StaticPageAction[];
  sections: StaticPageSection[];
};

export type StaticPageNavItem = {
  label: string;
  description: string;
  href: string;
};

export type CmsConfig = {
  staticPagesNavLabel?: string;
  staticPages: StaticPageConfig[];
};
