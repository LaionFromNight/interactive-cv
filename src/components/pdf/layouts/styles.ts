import type { Style } from "@react-pdf/types";
import type { CvViewModel } from "../model/buildCvViewModel";
import type { PdfTheme } from "../theme/createPdfTheme";

export type LayoutProps = {
  vm: CvViewModel;
  theme: PdfTheme;
};

/* ------------------------------------------------------------------ */
/* Common styles                                                        */
/* ------------------------------------------------------------------ */

export function createCommonStyles(theme: PdfTheme) {
  const { palette: p, fs, sp, fonts } = theme;

  return {
    page: {
      fontFamily: fonts.body,
      fontSize: fs(9),
      color: p.text,
      backgroundColor: p.paper,
    },
    paragraph: {
      fontSize: fs(9.2),
      lineHeight: 1.5,
      color: p.text,
    },

    // Experience
    group: { marginBottom: sp(10) },
    groupHeader: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      marginBottom: sp(5),
    },
    groupName: {
      fontFamily: fonts.heading,
      fontSize: fs(11),
      fontWeight: 700,
      color: p.ink,
    },
    groupDate: { fontSize: fs(8.2), color: p.muted },
    entry: { marginBottom: sp(8) },
    entryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    entryTitle: {
      flex: 1,
      fontSize: fs(9.8),
      fontWeight: 600,
      color: p.ink,
      paddingRight: 8,
    },
    entryDate: {
      fontSize: fs(8),
      color: p.muted,
      textAlign: "right",
      marginTop: 1,
    },
    entrySubtitle: {
      fontSize: fs(8.2),
      color: p.accentText,
      marginTop: 1.5,
    },
    entryText: {
      fontSize: fs(8.8),
      lineHeight: 1.45,
      color: p.text,
      marginTop: sp(3),
    },
    bulletList: { marginTop: sp(3) },
    bulletRow: { flexDirection: "row", marginTop: sp(1.5) },
    bulletDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: p.accent,
      marginTop: fs(8.6) * 0.62,
      marginRight: 6,
      marginLeft: 2,
    },
    bulletText: {
      flex: 1,
      fontSize: fs(8.6),
      lineHeight: 1.42,
      color: p.text,
    },
    stackText: {
      fontSize: fs(7.8),
      color: p.muted,
      marginTop: sp(3),
      lineHeight: 1.35,
    },
    stackLabel: { fontWeight: 600, color: p.ink },

    // Education
    eduItem: { marginBottom: sp(6) },
    eduTitle: { fontSize: fs(9), fontWeight: 600, color: p.ink, lineHeight: 1.3 },
    eduMeta: { fontSize: fs(8), color: p.muted, marginTop: 1 },

    // Footer
    footer: {
      position: "absolute",
      bottom: 16,
      left: 36,
      right: 36,
      flexDirection: "row",
      justifyContent: "space-between",
      // No lineHeight here: react-pdf drops `fixed` absolute views that set it.
      fontSize: fs(7),
      color: p.subtle,
    },
    endBlock: {
      marginTop: sp(10),
      paddingTop: sp(6),
      borderTop: `0.6pt solid ${p.border}`,
    },
    consent: {
      fontSize: fs(6.8),
      lineHeight: 1.35,
      color: p.muted,
    },
    footerLink: { color: p.subtle, textDecoration: "none" },
  } satisfies Record<string, Style>;
}

export type CommonStyles = ReturnType<typeof createCommonStyles>;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
