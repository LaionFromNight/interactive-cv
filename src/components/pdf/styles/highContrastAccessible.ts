import { createExecutiveLightStyles } from "./createExecutiveLightStyles";

export const highContrastAccessibleStyles = createExecutiveLightStyles(
  {
    pageBg: "#FFFFFF",

    text: "#000000",
    heading: "#000000",
    muted: "#111111",
    subtle: "#111111",

    border: "#000000",
    cardBg: "#FFFFFF",

    badgeBg: "#000000",
    badgeText: "#FFFFFF",

    accent: "#003BFF",
  },
  {
    name: {
      fontSize: 31,
      fontWeight: 600,
    },

    headline: {
      fontSize: 12.5,
      fontWeight: 600,
    },

    contactText: {
      fontSize: 10,
      fontWeight: 600,
    },

    sectionTitle: {
      fontSize: 14.5,
      fontWeight: 600,
      letterSpacing: 0.2,
    },

    summaryText: {
      fontSize: 11,
      lineHeight: 1.55,
      border: "1.5px solid #000000",
      padding: 13,
    },

    projectTitle: {
      fontSize: 12,
      fontWeight: 600,
    },

    projectMeta: {
      fontSize: 9.2,
      fontWeight: 600,
    },

    projectDesc: {
      fontSize: 10.2,
      lineHeight: 1.45,
    },

    sidebarTitle: {
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: 0.6,
    },

    skillGroupTitle: {
      fontSize: 10,
      fontWeight: 600,
    },

    focusItem: {
      fontSize: 10,
      fontWeight: 600,
      border: "1.5px solid #000000",
      paddingVertical: 5,
      paddingHorizontal: 9,
    },

    badge: {
      fontSize: 8.8,
      fontWeight: 600,
      paddingHorizontal: 7,
      paddingVertical: 4,
      border: "1.5px solid #000000",
    },

    link: {
      fontSize: 9.2,
      fontWeight: 600,
    },

    footer: {
      fontSize: 8.5,
      fontWeight: 600,
    },

    footerConsentText: {
      fontSize: 6.2,
      lineHeight: 1.25,
      color: "#000000",
    },
  },
);