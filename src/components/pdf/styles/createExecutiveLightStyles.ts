import { StyleSheet } from "@react-pdf/renderer";

export type ExecutiveLightPalette = {
  pageBg: string;
  text: string;
  heading: string;
  muted: string;
  subtle: string;
  border: string;
  cardBg: string;
  badgeBg: string;
  badgeText: string;
  accent: string;
};

export function createExecutiveLightStyles(palette: ExecutiveLightPalette) {
  return StyleSheet.create({
    page: {
      fontFamily: "Inter",
      paddingTop: 28,
      paddingHorizontal: 28,
      paddingBottom: 62,
      backgroundColor: palette.pageBg,
      color: palette.text,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 18,
      marginBottom: 18,
      borderBottom: `1px solid ${palette.border}`,
    },
    headerMain: {
      flex: 1,
      paddingRight: 18,
    },
    name: {
      fontSize: 29,
      fontWeight: 600,
      color: palette.heading,
    },
    headline: {
      fontSize: 11,
      marginTop: 5,
      color: palette.muted,
    },
    contactLine: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 9,
    },
    contactText: {
      fontSize: 8.8,
      color: palette.muted,
    },
    headerQr: {
      width: 92,
      alignItems: "center",
    },
    headerQrImage: {
      width: 78,
      height: 78,
    },
    headerQrText: {
      marginTop: 4,
      fontSize: 7,
      color: palette.muted,
    },

    continuedHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 16,
      marginBottom: 18,
      borderBottom: `1px solid ${palette.border}`,
    },
    continuedHeaderMain: {
      flex: 1,
    },
    continuedName: {
      fontSize: 21,
      fontWeight: 600,
      color: palette.heading,
    },
    continuedSubtitle: {
      fontSize: 10,
      marginTop: 4,
      color: palette.muted,
    },
    continuedQr: {
      width: 70,
      alignItems: "center",
    },
    continuedQrImage: {
      width: 54,
      height: 54,
    },
    continuedQrText: {
      marginTop: 3,
      fontSize: 6.5,
      color: palette.muted,
    },

    body: {
      flexDirection: "row",
    },

    sidebar: {
      width: "32%",
      paddingRight: 18,
      borderRight: `1px solid ${palette.border}`,
    },

    avatarWrap: {
      width: "100%",
      alignItems: "center",
      marginBottom: 16,
    },
    avatar: {
      width: 78,
      height: 78,
      borderRadius: 18,
      objectFit: "cover",
    },

    sidebarBlock: {
      marginBottom: 14,
    },
    sidebarTitle: {
      fontSize: 10.5,
      fontWeight: 600,
      color: palette.heading,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },

    focusList: {},
    focusItem: {
      fontSize: 8.6,
      color: palette.text,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
      backgroundColor: palette.cardBg,
      border: `1px solid ${palette.border}`,
      marginBottom: 5,
    },

    skillGroup: {
      marginBottom: 8,
    },
    skillGroupTitle: {
      fontSize: 8.8,
      fontWeight: 600,
      color: palette.muted,
      marginBottom: 5,
    },
    badgesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    badge: {
      fontSize: 7.4,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 7,
      backgroundColor: palette.badgeBg,
      color: palette.badgeText,
      border: `1px solid ${palette.border}`,
      marginRight: 4,
      marginBottom: 4,
    },

    timelineItem: {
      flexDirection: "row",
      marginBottom: 9,
    },
    timelineDot: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: palette.accent,
      marginTop: 3,
      marginRight: 7,
    },
    timelineContent: {
      flex: 1,
    },
    timelineTitle: {
      fontSize: 8.8,
      fontWeight: 600,
      color: palette.heading,
    },
    timelineDate: {
      fontSize: 7.6,
      marginTop: 2,
      color: palette.muted,
    },

    linkRow: {
      marginBottom: 8,
    },
    linkLabel: {
      fontSize: 7.8,
      color: palette.muted,
      marginBottom: 2,
    },
    link: {
      fontSize: 7.8,
      color: palette.accent,
      textDecoration: "none",
    },

    main: {
      width: "68%",
      paddingLeft: 18,
    },
    mainSection: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 600,
      color: palette.heading,
      marginBottom: 8,
    },
    summaryText: {
      fontSize: 9.6,
      lineHeight: 1.45,
      color: palette.text,
      backgroundColor: palette.cardBg,
      border: `1px solid ${palette.border}`,
      borderRadius: 12,
      padding: 12,
    },

    experienceList: {
      backgroundColor: palette.cardBg,
      border: `1px solid ${palette.border}`,
      borderRadius: 12,
      padding: 13,
    },
    projectItem: {
      marginBottom: 10,
      paddingBottom: 9,
      borderBottom: `1px solid ${palette.border}`,
    },
    projectMeta: {
      fontSize: 8,
      color: palette.muted,
    },
    projectTitle: {
      fontSize: 10.3,
      fontWeight: 600,
      marginTop: 3,
      color: palette.heading,
    },
    projectDesc: {
      fontSize: 8.7,
      marginTop: 4,
      color: palette.text,
      lineHeight: 1.35,
    },

    emptyMainPanel: {
      backgroundColor: palette.cardBg,
      border: `1px solid ${palette.border}`,
      borderRadius: 12,
      padding: 13,
    },
    emptyMainText: {
      fontSize: 9,
      color: palette.subtle,
    },

    footerBlock: {
      position: "absolute",
      left: 28,
      right: 28,
      bottom: 18,
      alignItems: "center",
    },
    footerConsentText: {
      width: "88%",
      fontSize: 5,
      lineHeight: 1.15,
      color: palette.subtle,
      textAlign: "center",
      marginBottom: 3,
    },
    footer: {
      fontSize: 7.2,
      color: palette.subtle,
      textAlign: "center",
    },
    inlineLinkItem: {
      flexDirection: "row",
      alignItems: "center",
    },

    inlineLinkSeparator: {
      fontSize: 7.8,
      color: palette.subtle,
      marginHorizontal: 3,
    },
  });
}

export type ExecutiveLightStyles = ReturnType<typeof createExecutiveLightStyles>;