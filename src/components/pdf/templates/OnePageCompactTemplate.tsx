import {
  Document,
  Font,
  Image,
  Link,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import type { CV } from "../../../lib/cvTypes";
import { getConsentText, type CvPdfOptions } from "../CvPdfOptions";
import type { SlateProfessionalStyles } from "../styles/slateProfessional";

Font.register({
  family: "Inter",
  fonts: [
    { src: "/assets/fonts/Inter-Regular.ttf", fontWeight: 400 },
    { src: "/assets/fonts/Inter-SemiBold.ttf", fontWeight: 600 },
  ],
});

const months = [
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

type CompanyLookup = Record<string, CV["companies"][number] | undefined>;
type Project = CV["projects"][number];

function formatMonth(value: string | null | undefined) {
  if (!value) return "Present";

  const [year, month] = value.split("-");
  const monthIndex = Number(month) - 1;

  if (!year || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return value;
  }

  return `${months[monthIndex]} ${year}`;
}

function formatRange(
  start: string | null | undefined,
  end: string | null | undefined,
) {
  if (!start && !end) return "—";

  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

function getProjectCompany(project: Project, companiesById: CompanyLookup) {
  if (!project.company_id) return "B2B / Contract";

  return companiesById[project.company_id]?.name ?? "Company";
}

function getCompactSkills(cv: CV) {
  const names = [
    "TypeScript",
    "JavaScript",
    "Python",
    "Node.js",
    "Express",
    "FastAPI",
    "React",
    "MongoDB",
    "PostgreSQL",
    "Redis",
    "AWS Lambda",
    "AWS Cognito",
    "GCP Cloud Functions",
    "Docker",
  ];

  return names
    .map((name) => cv.skills.tech.find((tech) => tech.name === name))
    .filter(Boolean) as CV["skills"]["tech"];
}

function Footer({
  generatedAt,
  consentText,
  styles,
}: {
  generatedAt: string;
  consentText?: string | null;
  styles: SlateProfessionalStyles;
}) {
  return (
    <View style={styles.footerBlock}>
      <Text style={styles.footer}>Last updated: {generatedAt}</Text>

      {consentText ? (
        <Text style={styles.footerConsentText}>{consentText}</Text>
      ) : null}
    </View>
  );
}

export function OnePageCompactTemplate({
  cv,
  options,
  styles,
}: {
  cv: CV;
  options: CvPdfOptions;
  styles: SlateProfessionalStyles;
}) {
  const companiesById = Object.fromEntries(
    cv.companies.map((company) => [company.id, company]),
  ) as CompanyLookup;

  const publicProjects = cv.projects
    .filter((project) => project.public?.show !== false)
    .slice()
    .sort((a, b) =>
      (b.time_range.start ?? "").localeCompare(a.time_range.start ?? ""),
    )
    .slice(0, 5);

  const compactSkills = getCompactSkills(cv);
  const qrCodeSrc = `${import.meta.env.BASE_URL}QRCODE.png`;
  const consentText = getConsentText(options);

  return (
    <Document
      author={cv.person.full_name}
      title={`${cv.person.full_name} CV`}
      subject={cv.person.headline}
    >
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.header} wrap={false}>
          <View style={styles.headerMain}>
            <Text style={styles.name}>{cv.person.full_name}</Text>
            <Text style={styles.headline}>{cv.person.headline}</Text>

            <View style={styles.contactLine}>
              <Text style={styles.contactText}>{cv.person.contacts.email}</Text>

              {cv.person.contacts.phone ? (
                <Text style={styles.contactText}>
                  {"  ·  "}
                  {cv.person.contacts.phone}
                </Text>
              ) : null}

              <Text style={styles.contactText}>{"  ·  "}Polish / English</Text>
            </View>
          </View>

          <View style={styles.headerQr}>
            <Image src={qrCodeSrc} style={styles.headerQrImage} />
            <Text style={styles.headerQrText}>lukaszkomur.dev</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.sidebar}>
            {cv.person.avatar_url ? (
              <View style={styles.avatarWrap} wrap={false}>
                <Image src={cv.person.avatar_url} style={styles.avatar} />
              </View>
            ) : null}

            <View style={styles.sidebarBlock} wrap={false}>
              <Text style={styles.sidebarTitle}>Focus</Text>

              <Text style={styles.focusItem}>
                Backend / Solution Architecture
              </Text>
              <Text style={styles.focusItem}>System Design</Text>
              <Text style={styles.focusItem}>Cloud / Serverless</Text>
              <Text style={styles.focusItem}>IAM & Integrations</Text>
            </View>

            <View style={styles.sidebarBlock}>
              <Text style={styles.sidebarTitle}>Core stack</Text>

              <View style={styles.badgesRow}>
                {compactSkills.map((skill) => (
                  <Text key={skill.id} style={styles.badge}>
                    {skill.name}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.sidebarBlock}>
              <Text style={styles.sidebarTitle}>Timeline</Text>

              {(cv.experience_timeline ?? []).map((item) => {
                const company = item.company_id
                  ? companiesById[item.company_id]?.name ?? "Company"
                  : "B2B / Contract";

                return (
                  <View
                    key={`${company}-${item.start}`}
                    style={styles.timelineItem}
                    wrap={false}
                  >
                    <View style={styles.timelineDot} />

                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>{company}</Text>
                      <Text style={styles.timelineDate}>
                        {formatRange(item.start, item.end)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.main}>
            <View style={styles.mainSection} wrap={false}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.summaryText}>
                {cv.person.bio_short ?? "—"}
              </Text>
            </View>

            <View style={styles.mainSection}>
              <Text style={styles.sectionTitle}>Selected experience</Text>

              <View style={styles.experienceList}>
                {publicProjects.map((project) => {
                  const company = getProjectCompany(project, companiesById);

                  return (
                    <View
                      key={project.id}
                      style={styles.projectItem}
                      wrap={false}
                    >
                      <Text style={styles.projectMeta}>
                        {formatRange(
                          project.time_range.start,
                          project.time_range.end,
                        )}{" "}
                        · {company}
                      </Text>

                      <Text style={styles.projectTitle}>
                        {project.display_name ?? project.name}
                      </Text>

                      {project.description ? (
                        <Text style={styles.projectDesc}>
                          {project.description}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>

            {Array.isArray(cv.person.profiles) && cv.person.profiles.length ? (
              <View style={styles.mainSection}>
                <Text style={styles.sectionTitle}>Links</Text>

                <View style={styles.badgesRow}>
                  {cv.person.profiles.map((profile, index) => (
                    <View key={profile.id} style={styles.inlineLinkItem}>
                      <Link src={profile.url} style={styles.link}>
                        {profile.label}
                      </Link>

                      {index < cv.person.profiles.length - 1 ? (
                        <Text style={styles.inlineLinkSeparator}> | </Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <Footer
          generatedAt={cv.meta.generated_at_local}
          consentText={consentText}
          styles={styles}
        />
      </Page>
    </Document>
  );
}