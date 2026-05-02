import {
  Document,
  Font,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { CV } from "../../../lib/cvTypes";
import { getConsentText, type CvPdfOptions } from "../CvPdfOptions";
import type { PdfTemplateConfig } from "../PdfTemplateConfig";
import { getPdfDocumentMetadata } from "../PdfDocumentMetadata";

Font.register({
  family: "Inter",
  fonts: [
    { src: "/assets/fonts/Inter-Regular.ttf", fontWeight: 400 },
    { src: "/assets/fonts/Inter-SemiBold.ttf", fontWeight: 600 },
  ],
});

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MAX_CORE_SKILLS = 16;

type CompanyLookup = Record<string, CV["companies"][number] | undefined>;

function formatMonth(value: string | null | undefined) {
  if (!value) return "Present";

  const [year, month] = value.split("-");
  const monthIndex = Number(month) - 1;

  if (!year || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return value;
  }

  return `${MONTHS[monthIndex]} ${year}`;
}

function formatRange(
  start: string | null | undefined,
  end: string | null | undefined,
) {
  if (!start && !end) return "—";

  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

function getCoreSkills(cv: CV) {
  const coreSkills = cv.skills.tech.filter((tech) => tech.core_stack === true);

  const fallbackSkills = cv.skills.tech.filter(
    (tech) => tech.ui?.visible === true,
  );

  return (coreSkills.length > 0 ? coreSkills : fallbackSkills)
    .slice()
    .sort((a, b) => {
      const orderA = a.ui?.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.ui?.order ?? Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) return orderA - orderB;

      return a.name.localeCompare(b.name);
    })
    .slice(0, MAX_CORE_SKILLS);
}

function getProfileUrl(cv: CV, id: string) {
  return cv.person.profiles?.find((profile) => profile.id === id)?.url;
}

function HeaderInfo({
  cv,
  templateConfig,
}: {
  cv: CV;
  templateConfig: PdfTemplateConfig;
}) {
  const githubUrl = getProfileUrl(cv, "github");
  const linkedinUrl = getProfileUrl(cv, "linkedin");
  const cvUrl = getProfileUrl(cv, "cv") ?? templateConfig.qr.targetUrl;

  return (
    <View style={styles.headerInfo} wrap={false}>
      <Text style={styles.contactHeading}>Contact / Profiles</Text>

      <View style={styles.contactPanel}>
        <Text style={styles.contactText}>{cv.person.contacts.email}</Text>

        {cv.person.contacts.phone ? (
          <Text style={styles.contactText}>{cv.person.contacts.phone}</Text>
        ) : null}

        {templateConfig.spokenLanguagesLine ? (
          <Text style={styles.contactText}>
            {templateConfig.spokenLanguagesLine}
          </Text>
        ) : null}
      </View>

      <View style={styles.linksRow}>
        {githubUrl ? (
          <Link src={githubUrl} style={styles.headerLink}>
            GitHub
          </Link>
        ) : null}

        {linkedinUrl ? (
          <Link src={linkedinUrl} style={styles.headerLink}>
            LinkedIn
          </Link>
        ) : null}

        {cvUrl ? (
          <Link src={cvUrl} style={styles.headerLink}>
            {templateConfig.qr.label}
          </Link>
        ) : null}
      </View>
    </View>
  );
}

function HeroBlock({
  cv,
  templateConfig,
  bottomQrSrc,
}: {
  cv: CV;
  templateConfig: PdfTemplateConfig;
  bottomQrSrc: string;
}) {
  return (
    <View style={styles.hero} wrap={false}>
      <View style={styles.heroQrWrap}>
        <Image src={bottomQrSrc} style={styles.heroQrImage} />
      </View>

      <HeaderInfo cv={cv} templateConfig={templateConfig} />
    </View>
  );
}

function SummaryBlock({
  cv,
  templateConfig,
}: {
  cv: CV;
  templateConfig: PdfTemplateConfig;
}) {
  return (
    <View style={styles.summaryPanel} wrap={false}>
      <Text style={styles.sectionLabel}>{templateConfig.labels.summary}</Text>

      <Text style={styles.summaryText}>{cv.person.bio_short ?? "—"}</Text>

      {cv.summary?.cards?.length ? (
        <View style={styles.summaryCards}>
          {cv.summary.cards.map((card) => (
            <View key={card.id} style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>{card.title}</Text>
              <Text style={styles.summaryCardText}>{card.desc}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function CoreStackBlock({ cv }: { cv: CV }) {
  const coreSkills = getCoreSkills(cv);

  if (coreSkills.length === 0) return null;

  return (
    <View style={styles.stackPanel} wrap={false}>
      <Text style={styles.sectionLabel}>Core stack</Text>

      <View style={styles.stackGrid}>
        {coreSkills.map((skill) => (
          <Text key={skill.id} style={styles.skillBadge}>
            {skill.name}
          </Text>
        ))}
      </View>
    </View>
  );
}

function TimelineBlock({
  cv,
  companiesById,
  templateConfig,
}: {
  cv: CV;
  companiesById: CompanyLookup;
  templateConfig: PdfTemplateConfig;
}) {
  const timeline = cv.experience_timeline ?? [];

  if (timeline.length === 0) return null;

  return (
    <View style={styles.timelinePanel} wrap={false}>
      <Text style={styles.sectionLabel}>{templateConfig.labels.timeline}</Text>

      <View style={styles.timelineList}>
        {timeline.map((item, index) => {
          const company = item.company_id
            ? companiesById[item.company_id]?.name ?? "Company"
            : "B2B / Contract";

          return (
            <View
              key={`${item.company_id ?? item.client_id ?? "timeline"}-${item.start}-${index}`}
              style={styles.timelineItem}
            >
              <View style={styles.timelineDot} />

              <View style={styles.timelineContent}>
                <Text style={styles.timelineCompany}>{company}</Text>
                <Text style={styles.timelineDate}>
                  {formatRange(item.start, item.end)}
                </Text>
                <Text style={styles.timelineMeta}>
                  Projects: {item.project_ids?.length ?? 0}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Footer({
  generatedAt,
  consentText,
  templateConfig,
}: {
  generatedAt: string;
  consentText?: string | null;
  templateConfig: PdfTemplateConfig;
}) {
  return (
    <View style={styles.footerBlock}>
      <Text style={styles.footerText}>
        {templateConfig.labels.lastUpdated}: {generatedAt}
      </Text>

      {consentText ? (
        <Text style={styles.footerConsentText}>{consentText}</Text>
      ) : null}
    </View>
  );
}

export function OnePageGradientTemplate({
  cv,
  options,
  templateConfig,
}: {
  cv: CV;
  options: CvPdfOptions;
  templateConfig: PdfTemplateConfig;
}) {
  const companiesById = Object.fromEntries(
    cv.companies.map((company) => [company.id, company]),
  ) as CompanyLookup;

  const consentText = getConsentText(options);
  const bottomQrSrc = `${import.meta.env.BASE_URL}QRCODE2.png`;

  const documentMetadata = getPdfDocumentMetadata(cv);

  return (
    <Document
      author={documentMetadata.author}
      title={documentMetadata.title}
      subject={documentMetadata.subject}
      keywords={documentMetadata.keywords}
      creator={documentMetadata.creator}
      producer={documentMetadata.producer}
    >
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.bgLayerOne} fixed />
        <View style={styles.bgLayerTwo} fixed />
        <View style={styles.bgLayerThree} fixed />
        <View style={styles.bgFrame} fixed />

        <HeroBlock
          cv={cv}
          templateConfig={templateConfig}
          bottomQrSrc={bottomQrSrc}
        />

        <SummaryBlock cv={cv} templateConfig={templateConfig} />

        <View style={styles.twoColumns}>
          <CoreStackBlock cv={cv} />

          <TimelineBlock
            cv={cv}
            companiesById={companiesById}
            templateConfig={templateConfig}
          />
        </View>

        <Footer
          generatedAt={cv.meta.generated_at_local}
          consentText={consentText}
          templateConfig={templateConfig}
        />
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    paddingTop: 30,
    paddingHorizontal: 34,
    paddingBottom: 58,
    backgroundColor: "#020617",
    color: "#E5F7FF",
    position: "relative",
  },

  bgLayerOne: {
    position: "absolute",
    left: -145,
    top: -90,
    width: 430,
    height: 430,
    borderRadius: 999,
    backgroundColor: "#00F5D4",
    opacity: 0.13,
  },
  bgLayerTwo: {
    position: "absolute",
    right: -145,
    top: 135,
    width: 440,
    height: 440,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    opacity: 0.16,
  },
  bgLayerThree: {
    position: "absolute",
    left: 120,
    bottom: -170,
    width: 480,
    height: 480,
    borderRadius: 999,
    backgroundColor: "#10B981",
    opacity: 0.12,
  },
  bgFrame: {
    position: "absolute",
    left: 22,
    right: 22,
    top: 22,
    bottom: 22,
    border: "1px solid rgba(94, 234, 212, 0.36)",
    borderRadius: 22,
  },

  hero: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 18,
    marginBottom: 16,
    borderBottom: "1px solid rgba(125, 211, 252, 0.30)",
  },
  heroQrWrap: {
    width: 205,
    height: 205,
    borderRadius: 24,
    overflow: "hidden",
    border: "1px solid rgba(94, 234, 212, 0.32)",
    backgroundColor: "rgba(2, 6, 23, 0.80)",
    marginRight: 24,
  },
  heroQrImage: {
    width: 205,
    height: 205,
    objectFit: "cover",
  },

  headerInfo: {
    flex: 1,
    paddingLeft: 4,
  },
  contactHeading: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: "#5EEAD4",
    marginBottom: 10,
  },
  contactPanel: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(103, 232, 249, 0.28)",
    backgroundColor: "rgba(8, 47, 73, 0.38)",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 9.4,
    color: "#D8F3FF",
    marginBottom: 5,
  },
  linksRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  headerLink: {
    fontSize: 8,
    color: "#67E8F9",
    textDecoration: "none",
    marginRight: 8,
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
    border: "1px solid rgba(103, 232, 249, 0.42)",
    backgroundColor: "rgba(8, 47, 73, 0.54)",
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#5EEAD4",
    marginBottom: 8,
  },

  summaryPanel: {
    padding: 15,
    borderRadius: 18,
    border: "1px solid rgba(125, 211, 252, 0.28)",
    backgroundColor: "rgba(15, 23, 42, 0.76)",
    marginBottom: 14,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.45,
    color: "#E0F2FE",
  },
  summaryCards: {
    flexDirection: "row",
    marginTop: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 9,
    borderRadius: 12,
    border: "1px solid rgba(94, 234, 212, 0.24)",
    backgroundColor: "rgba(2, 132, 199, 0.16)",
    marginRight: 7,
  },
  summaryCardTitle: {
    fontSize: 8.8,
    fontWeight: 600,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  summaryCardText: {
    fontSize: 7.4,
    lineHeight: 1.35,
    color: "#CFFAFE",
  },

  twoColumns: {
    flexDirection: "row",
  },

  stackPanel: {
    width: "48%",
    minHeight: 255,
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(94, 234, 212, 0.26)",
    backgroundColor: "rgba(8, 47, 73, 0.52)",
    marginRight: 12,
  },
  stackGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillBadge: {
    fontSize: 7.8,
    fontWeight: 600,
    color: "#ECFEFF",
    backgroundColor: "rgba(15, 118, 110, 0.52)",
    border: "1px solid rgba(94, 234, 212, 0.35)",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 7,
    marginRight: 5,
    marginBottom: 6,
  },

  timelinePanel: {
    width: "52%",
    minHeight: 255,
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(125, 211, 252, 0.24)",
    backgroundColor: "rgba(15, 23, 42, 0.70)",
  },
  timelineList: {},
  timelineItem: {
    flexDirection: "row",
    marginBottom: 10,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#5EEAD4",
    marginTop: 4,
    marginRight: 9,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 7,
    borderBottom: "1px solid rgba(125, 211, 252, 0.16)",
  },
  timelineCompany: {
    fontSize: 10.3,
    fontWeight: 600,
    color: "#FFFFFF",
  },
  timelineDate: {
    fontSize: 8.4,
    color: "#BAE6FD",
    marginTop: 2,
  },
  timelineMeta: {
    fontSize: 7.5,
    color: "#67E8F9",
    marginTop: 2,
  },

  footerBlock: {
    position: "absolute",
    left: 34,
    right: 34,
    bottom: 22,
    alignItems: "center",
  },
  footerText: {
    fontSize: 7.2,
    color: "#BAE6FD",
    textAlign: "center",
  },
  footerConsentText: {
    width: "86%",
    fontSize: 5.2,
    lineHeight: 1.18,
    color: "#CFFAFE",
    textAlign: "center",
    marginTop: 3,
  },
});