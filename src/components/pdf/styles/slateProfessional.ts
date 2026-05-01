import { StyleSheet } from "@react-pdf/renderer";

export const slateProfessionalStyles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    paddingTop: 28,
    paddingHorizontal: 28,
    paddingBottom: 62,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 18,
    marginBottom: 18,
    borderBottom: "1px solid #DDE5EE",
  },
  headerMain: {
    flex: 1,
    paddingRight: 18,
  },
  name: {
    fontSize: 29,
    fontWeight: 600,
    color: "#0F172A",
  },
  headline: {
    fontSize: 11,
    marginTop: 5,
    color: "#475569",
  },
  contactLine: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 9,
  },
  contactText: {
    fontSize: 8.8,
    color: "#64748B",
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
    color: "#64748B",
  },

  continuedHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
    marginBottom: 18,
    borderBottom: "1px solid #DDE5EE",
  },
  continuedHeaderMain: {
    flex: 1,
  },
  continuedName: {
    fontSize: 21,
    fontWeight: 600,
    color: "#0F172A",
  },
  continuedSubtitle: {
    fontSize: 10,
    marginTop: 4,
    color: "#64748B",
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
    color: "#64748B",
  },

  body: {
    flexDirection: "row",
  },

  sidebar: {
    width: "32%",
    paddingRight: 18,
    borderRight: "1px solid #E2E8F0",
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
    color: "#0F172A",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  focusList: {},
  focusItem: {
    fontSize: 8.6,
    color: "#334155",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    marginBottom: 5,
  },

  skillGroup: {
    marginBottom: 8,
  },
  skillGroupTitle: {
    fontSize: 8.8,
    fontWeight: 600,
    color: "#475569",
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
    backgroundColor: "#FFFFFF",
    color: "#334155",
    border: "1px solid #E2E8F0",
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
    backgroundColor: "#2563EB",
    marginTop: 3,
    marginRight: 7,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 8.8,
    fontWeight: 600,
    color: "#0F172A",
  },
  timelineDate: {
    fontSize: 7.6,
    marginTop: 2,
    color: "#64748B",
  },

  linkRow: {
    marginBottom: 8,
  },
  linkLabel: {
    fontSize: 7.8,
    color: "#64748B",
    marginBottom: 2,
  },
  link: {
    fontSize: 7.8,
    color: "#2563EB",
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
    color: "#0F172A",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 9.6,
    lineHeight: 1.45,
    color: "#334155",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: 12,
  },

  experienceList: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: 13,
  },
  projectItem: {
    marginBottom: 10,
    paddingBottom: 9,
    borderBottom: "1px solid #E2E8F0",
  },
  projectMeta: {
    fontSize: 8,
    color: "#64748B",
  },
  projectTitle: {
    fontSize: 10.3,
    fontWeight: 600,
    marginTop: 3,
    color: "#0F172A",
  },
  projectDesc: {
    fontSize: 8.7,
    marginTop: 4,
    color: "#334155",
    lineHeight: 1.35,
  },

  emptyMainPanel: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 12,
    padding: 13,
  },
  emptyMainText: {
    fontSize: 9,
    color: "#94A3B8",
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
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 3,
  },
  footer: {
    fontSize: 7.2,
    color: "#94A3B8",
    textAlign: "center",
  },
  inlineLinkItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  inlineLinkSeparator: {
    fontSize: 7.8,
    color: "#94A3B8",
    marginHorizontal: 3,
  },
});

export type SlateProfessionalStyles = typeof slateProfessionalStyles;