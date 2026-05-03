import { StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

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

type ExecutiveLightStyleKey =
  | "page"
  | "header"
  | "headerMain"
  | "name"
  | "headline"
  | "contactLine"
  | "contactText"
  | "headerQr"
  | "headerQrImage"
  | "headerQrText"
  | "continuedHeader"
  | "continuedHeaderMain"
  | "continuedName"
  | "continuedSubtitle"
  | "continuedQr"
  | "continuedQrImage"
  | "continuedQrText"
  | "body"
  | "sidebar"
  | "avatarWrap"
  | "avatar"
  | "sidebarBlock"
  | "sidebarTitle"
  | "focusList"
  | "focusItem"
  | "skillGroup"
  | "skillGroupTitle"
  | "badgesRow"
  | "badge"
  | "timelineItem"
  | "timelineDot"
  | "timelineContent"
  | "timelineTitle"
  | "timelineDate"
  | "linkRow"
  | "linkLabel"
  | "link"
  | "main"
  | "mainSection"
  | "sectionTitle"
  | "summaryText"
  | "experienceList"
  | "projectItem"
  | "projectMeta"
  | "projectTitle"
  | "projectDesc"
  | "emptyMainPanel"
  | "emptyMainText"
  | "footerBlock"
  | "footerConsentText"
  | "footerAttributionBlock"
  | "footerDivider"
  | "footerAttribution"
  | "footer"
  | "inlineLinkItem"
  | "inlineLinkSeparator";

export type ExecutiveLightStyleOverrides = Partial<
  Record<ExecutiveLightStyleKey, Style>
>;

function mergeStyle(base: Style, override?: Style): Style {
  return {
    ...base,
    ...(override ?? {}),
  };
}

export function createExecutiveLightStyles(
  palette: ExecutiveLightPalette,
  overrides: ExecutiveLightStyleOverrides = {},
) {
  return StyleSheet.create({
    page: mergeStyle(
      {
        fontFamily: "Inter",
        paddingTop: 28,
        paddingHorizontal: 28,
        paddingBottom: 62,
        backgroundColor: palette.pageBg,
        color: palette.text,
      },
      overrides.page,
    ),

    header: mergeStyle(
      {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 18,
        marginBottom: 18,
        borderBottom: `1px solid ${palette.border}`,
      },
      overrides.header,
    ),

    headerMain: mergeStyle(
      {
        flex: 1,
        paddingRight: 18,
      },
      overrides.headerMain,
    ),

    name: mergeStyle(
      {
        fontSize: 29,
        fontWeight: 600,
        color: palette.heading,
      },
      overrides.name,
    ),

    headline: mergeStyle(
      {
        fontSize: 11,
        marginTop: 5,
        color: palette.muted,
      },
      overrides.headline,
    ),

    contactLine: mergeStyle(
      {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 9,
      },
      overrides.contactLine,
    ),

    contactText: mergeStyle(
      {
        fontSize: 8.8,
        color: palette.muted,
      },
      overrides.contactText,
    ),

    headerQr: mergeStyle(
      {
        width: 92,
        alignItems: "center",
      },
      overrides.headerQr,
    ),

    headerQrImage: mergeStyle(
      {
        width: 78,
        height: 78,
      },
      overrides.headerQrImage,
    ),

    headerQrText: mergeStyle(
      {
        marginTop: 4,
        fontSize: 7,
        color: palette.muted,
      },
      overrides.headerQrText,
    ),

    continuedHeader: mergeStyle(
      {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 16,
        marginBottom: 18,
        borderBottom: `1px solid ${palette.border}`,
      },
      overrides.continuedHeader,
    ),

    continuedHeaderMain: mergeStyle(
      {
        flex: 1,
      },
      overrides.continuedHeaderMain,
    ),

    continuedName: mergeStyle(
      {
        fontSize: 21,
        fontWeight: 600,
        color: palette.heading,
      },
      overrides.continuedName,
    ),

    continuedSubtitle: mergeStyle(
      {
        fontSize: 10,
        marginTop: 4,
        color: palette.muted,
      },
      overrides.continuedSubtitle,
    ),

    continuedQr: mergeStyle(
      {
        width: 70,
        alignItems: "center",
      },
      overrides.continuedQr,
    ),

    continuedQrImage: mergeStyle(
      {
        width: 54,
        height: 54,
      },
      overrides.continuedQrImage,
    ),

    continuedQrText: mergeStyle(
      {
        marginTop: 3,
        fontSize: 6.5,
        color: palette.muted,
      },
      overrides.continuedQrText,
    ),

    body: mergeStyle(
      {
        flexDirection: "row",
      },
      overrides.body,
    ),

    sidebar: mergeStyle(
      {
        width: "32%",
        paddingRight: 18,
        borderRight: `1px solid ${palette.border}`,
      },
      overrides.sidebar,
    ),

    avatarWrap: mergeStyle(
      {
        width: "100%",
        alignItems: "center",
        marginBottom: 16,
      },
      overrides.avatarWrap,
    ),

    avatar: mergeStyle(
      {
        width: 78,
        height: 78,
        borderRadius: 18,
        objectFit: "cover",
      },
      overrides.avatar,
    ),

    sidebarBlock: mergeStyle(
      {
        marginBottom: 14,
      },
      overrides.sidebarBlock,
    ),

    sidebarTitle: mergeStyle(
      {
        fontSize: 10.5,
        fontWeight: 600,
        color: palette.heading,
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.4,
      },
      overrides.sidebarTitle,
    ),

    focusList: mergeStyle({}, overrides.focusList),

    focusItem: mergeStyle(
      {
        fontSize: 8.6,
        color: palette.text,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        backgroundColor: palette.cardBg,
        border: `1px solid ${palette.border}`,
        marginBottom: 5,
      },
      overrides.focusItem,
    ),

    skillGroup: mergeStyle(
      {
        marginBottom: 8,
      },
      overrides.skillGroup,
    ),

    skillGroupTitle: mergeStyle(
      {
        fontSize: 8.8,
        fontWeight: 600,
        color: palette.muted,
        marginBottom: 5,
      },
      overrides.skillGroupTitle,
    ),

    badgesRow: mergeStyle(
      {
        flexDirection: "row",
        flexWrap: "wrap",
      },
      overrides.badgesRow,
    ),

    badge: mergeStyle(
      {
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
      overrides.badge,
    ),

    timelineItem: mergeStyle(
      {
        flexDirection: "row",
        marginBottom: 9,
      },
      overrides.timelineItem,
    ),

    timelineDot: mergeStyle(
      {
        width: 6,
        height: 6,
        borderRadius: 999,
        backgroundColor: palette.accent,
        marginTop: 3,
        marginRight: 7,
      },
      overrides.timelineDot,
    ),

    timelineContent: mergeStyle(
      {
        flex: 1,
      },
      overrides.timelineContent,
    ),

    timelineTitle: mergeStyle(
      {
        fontSize: 8.8,
        fontWeight: 600,
        color: palette.heading,
      },
      overrides.timelineTitle,
    ),

    timelineDate: mergeStyle(
      {
        fontSize: 7.6,
        marginTop: 2,
        color: palette.muted,
      },
      overrides.timelineDate,
    ),

    linkRow: mergeStyle(
      {
        marginBottom: 8,
        width: "100%",
      },
      overrides.linkRow,
    ),

    linkLabel: mergeStyle(
      {
        fontSize: 7.4,
        color: palette.muted,
        marginBottom: 2,
        width: "100%",
      },
      overrides.linkLabel,
    ),

    link: mergeStyle(
      {
        fontSize: 7,
        color: palette.accent,
        textDecoration: "none",
        lineHeight: 1.15,
        width: "100%",
        maxWidth: "100%",
      },
      overrides.link,
    ),

    main: mergeStyle(
      {
        width: "68%",
        paddingLeft: 18,
      },
      overrides.main,
    ),

    mainSection: mergeStyle(
      {
        marginBottom: 15,
      },
      overrides.mainSection,
    ),

    sectionTitle: mergeStyle(
      {
        fontSize: 13,
        fontWeight: 600,
        color: palette.heading,
        marginBottom: 8,
      },
      overrides.sectionTitle,
    ),

    summaryText: mergeStyle(
      {
        fontSize: 9.6,
        lineHeight: 1.45,
        color: palette.text,
        backgroundColor: palette.cardBg,
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        padding: 12,
      },
      overrides.summaryText,
    ),

    experienceList: mergeStyle(
      {
        backgroundColor: palette.cardBg,
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        padding: 13,
      },
      overrides.experienceList,
    ),

    projectItem: mergeStyle(
      {
        marginBottom: 10,
        paddingBottom: 9,
        borderBottom: `1px solid ${palette.border}`,
      },
      overrides.projectItem,
    ),

    projectMeta: mergeStyle(
      {
        fontSize: 8,
        color: palette.muted,
      },
      overrides.projectMeta,
    ),

    projectTitle: mergeStyle(
      {
        fontSize: 10.3,
        fontWeight: 600,
        marginTop: 3,
        color: palette.heading,
      },
      overrides.projectTitle,
    ),

    projectDesc: mergeStyle(
      {
        fontSize: 8.7,
        marginTop: 4,
        color: palette.text,
        lineHeight: 1.35,
      },
      overrides.projectDesc,
    ),

    emptyMainPanel: mergeStyle(
      {
        backgroundColor: palette.cardBg,
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        padding: 13,
      },
      overrides.emptyMainPanel,
    ),

    emptyMainText: mergeStyle(
      {
        fontSize: 9,
        color: palette.subtle,
      },
      overrides.emptyMainText,
    ),

    footerBlock: mergeStyle(
      {
        position: "absolute",
        left: 28,
        right: 28,
        bottom: 18,
        alignItems: "center",
      },
      overrides.footerBlock,
    ),

    footerConsentText: mergeStyle(
      {
        width: "88%",
        fontSize: 5,
        lineHeight: 1.15,
        color: palette.subtle,
        textAlign: "center",
        marginBottom: 3,
      },
      overrides.footerConsentText,
    ),

    footerAttributionBlock: mergeStyle(
      {
        width: "100%",
        alignItems: "center",
        marginTop: 5,
      },
      overrides.footerAttributionBlock,
    ),

    footerDivider: mergeStyle(
      {
        width: "34%",
        height: 1,
        backgroundColor: palette.border,
        marginBottom: 5,
      },
      overrides.footerDivider,
    ),

    footerAttribution: mergeStyle(
      {
        width: "88%",
        fontSize: 6.4,
        color: palette.subtle,
        textAlign: "center",
        textDecoration: "none",
      },
      overrides.footerAttribution,
    ),

    footer: mergeStyle(
      {
        fontSize: 7.2,
        color: palette.subtle,
        textAlign: "center",
      },
      overrides.footer,
    ),

    inlineLinkItem: mergeStyle(
      {
        flexDirection: "row",
        alignItems: "center",
      },
      overrides.inlineLinkItem,
    ),

    inlineLinkSeparator: mergeStyle(
      {
        fontSize: 7.8,
        color: palette.subtle,
        marginHorizontal: 3,
      },
      overrides.inlineLinkSeparator,
    ),
  });
}

export type ExecutiveLightStyles = ReturnType<typeof createExecutiveLightStyles>;