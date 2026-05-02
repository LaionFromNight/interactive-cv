export type SeoConfig = {
  contentCta?: {
    label: string;
    href: string;
    variant?: "primary" | "secondary";
  };
  site: {
    name: string;
    url: string;
    locale: string;
    language: string;
    author: string;
    themeColor?: string;
  };
  defaultSeo: {
    title: string;
    titleTemplate: string;
    description: string;
    canonical: string;
    robots: string;
  };
  keywords: {
    primary: string[];
    longTail: string[];
  };
  openGraph: {
    type: string;
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: string;
    image: {
      url: string;
      width: number;
      height: number;
      alt: string;
    };
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
  favicon: {
    ico: string;
    icon16: string;
    icon32: string;
    appleTouchIcon: string;
    android192: string;
    android512: string;
    manifest: string;
  };
  schema: {
    person: {
      "@type": string;
      name: string;
      jobTitle: string;
      description: string;
      image: string;
      url: string;
      email?: string;
      sameAs: string[];
    };
    knowsAbout: string[];
    service: {
      "@type": string;
      name: string;
      serviceType: string[];
      areaServed: string[];
    };
  };
  contentSeo: {
    page: {
      path: string;
      title: string;
      description: string;
      canonical: string;
      redirectFrom?: string[];
      openGraph?: {
        title?: string;
        description?: string;
        url?: string;
      };
      twitter?: {
        title?: string;
        description?: string;
        image?: string;
      };
    };
    h1: string;
    lead: string;
    heroNote?: string;
    heroCtas?: Array<{
      label: string;
      href: string;
      variant?: "primary" | "secondary";
    }>;
    crawlerNote: string;
    crawlerLinkText: string;
    sections: Array<{
      heading: string;
      description?: string;
      body?: string;
      paragraphs?: string[];
      items?: string[];
      itemsStyle?: "chips" | "list";
      cards?: Array<{
        title: string;
        description: string;
      }>;
      cta?: {
        label: string;
        href: string;
        variant?: "primary" | "secondary";
      };
      ctas?: Array<{
        label: string;
        href: string;
        variant?: "primary" | "secondary";
      }>;
    }>;
  };
};
