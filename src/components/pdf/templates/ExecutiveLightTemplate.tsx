import {
  Document,
  Font,
  Image,
  Link,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import attributionRaw from "../../../data/attribution.json";
import type { CV } from "../../../lib/cvTypes";
import { getConsentText, type CvPdfOptions } from "../CvPdfOptions";
import type { PdfTemplateConfig } from "../PdfTemplateConfig";
import type { ExecutiveLightStyles } from "../styles/createExecutiveLightStyles";
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

const FIRST_PAGE_SKILL_GROUP_COUNT = 4;
const FIRST_PAGE_PROJECT_COUNT = 5;
const MAX_LINK_TEXT_LENGTH = 28;
const attribution = attributionRaw as {
  text: string;
  url: string;
  textWithUrl: string;
};

type PdfProfile = {
  id: string;
  label: string;
  url: string;
};

type CompanyLookup = Record<string, CV["companies"][number] | undefined>;
type Project = CV["projects"][number];
type SkillGroups = ReturnType<typeof groupSkills>;

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

function groupSkills(cv: CV) {
  const buckets = [
    { key: "language", title: "Languages" },
    { key: "backend", title: "Backend" },
    { key: "frontend", title: "Frontend" },
    { key: "cloud", title: "Cloud" },
    { key: "db", title: "Databases" },
    { key: "devops", title: "DevOps" },
    { key: "testing", title: "Testing" },
    { key: "platform", title: "Platforms" },
  ] as const;

  return buckets
    .map((bucket) => ({
      ...bucket,
      items: cv.skills.tech.filter((tech) => tech.tags?.includes(bucket.key)),
    }))
    .filter((bucket) => bucket.items.length > 0);
}

function getProfiles(cv: CV): PdfProfile[] {
  const profiles = cv.person.profiles;

  if (!profiles) return [];

  if (Array.isArray(profiles)) {
    return profiles
      .filter((profile) => profile?.url)
      .map((profile, index) => ({
        id: profile.id ?? `profile-${index}`,
        label: profile.label ?? profile.id ?? `Profile ${index + 1}`,
        url: profile.url,
      }));
  }

  const objectProfiles = profiles as Record<string, string | undefined>;

  return Object.entries(objectProfiles)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => ({
      id: key,
      label: key
        .replace("_label", "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
      url: value ?? "",
    }))
    .filter((profile) => profile.url.startsWith("http"));
}

function getProjectCompany(project: Project, companiesById: CompanyLookup) {
  if (!project.company_id) return "B2B / Contract";

  return companiesById[project.company_id]?.name ?? "Company";
}

function getCompactLinkText(profile: PdfProfile) {
  if (profile.label) return profile.label;

  try {
    const parsedUrl = new URL(profile.url);
    const host = parsedUrl.hostname.replace(/^www\./, "");
    const path = parsedUrl.pathname === "/" ? "" : parsedUrl.pathname;
    const compactUrl = `${host}${path}`.replace(/\/$/, "");

    if (compactUrl.length <= MAX_LINK_TEXT_LENGTH) return compactUrl;

    return `${compactUrl.slice(0, MAX_LINK_TEXT_LENGTH - 3)}...`;
  } catch {
    if (profile.url.length <= MAX_LINK_TEXT_LENGTH) return profile.url;

    return `${profile.url.slice(0, MAX_LINK_TEXT_LENGTH - 3)}...`;
  }
}

function Header({
  cv,
  styles,
  templateConfig,
}: {
  cv: CV;
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  return (
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

          {templateConfig.spokenLanguagesLine ? (
            <Text style={styles.contactText}>
              {"  ·  "}
              {templateConfig.spokenLanguagesLine}
            </Text>
          ) : null}
        </View>
      </View>

      <Link src={templateConfig.qr.targetUrl} style={styles.headerQr}>
        <Image src={templateConfig.qr.imageSrc} style={styles.headerQrImage} />
        <Text style={styles.headerQrText}>{templateConfig.qr.label}</Text>
      </Link>
    </View>
  );
}

function ContinuationHeader({
  cv,
  styles,
  templateConfig,
}: {
  cv: CV;
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  return (
    <View style={styles.continuedHeader} wrap={false}>
      <View style={styles.continuedHeaderMain}>
        <Text style={styles.continuedName}>{cv.person.full_name}</Text>
        <Text style={styles.continuedSubtitle}>
          {templateConfig.labels.cvContinued}
        </Text>
      </View>

      <Link src={templateConfig.qr.targetUrl} style={styles.continuedQr}>
        <Image
          src={templateConfig.qr.imageSrc}
          style={styles.continuedQrImage}
        />
        <Text style={styles.continuedQrText}>{templateConfig.qr.label}</Text>
      </Link>
    </View>
  );
}

function Footer({
  generatedAt,
  consentText,
  showAttribution = false,
  styles,
  templateConfig,
}: {
  generatedAt: string;
  consentText?: string | null;
  showAttribution?: boolean;
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  return (
    <View style={styles.footerBlock}>
      <Text style={styles.footer}>
        {templateConfig.labels.lastUpdated}: {generatedAt}
      </Text>
      {consentText ? (
        <Text style={styles.footerConsentText}>{consentText}</Text>
      ) : null}

      {showAttribution ? (
        <View style={styles.footerAttributionBlock}>
          <View style={styles.footerDivider} />
          <Link src={attribution.url} style={styles.footerAttribution}>
            {attribution.textWithUrl}
          </Link>
        </View>
      ) : null}
    </View>
  );
}

function SkillsBlock({
  skillGroups,
  styles,
  templateConfig,
}: {
  skillGroups: SkillGroups;
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  if (skillGroups.length === 0) return null;

  return (
    <View style={styles.sidebarBlock}>
      <Text style={styles.sidebarTitle}>{templateConfig.labels.skills}</Text>

      {skillGroups.map((group) => (
        <View key={group.key} style={styles.skillGroup} wrap={false}>
          <Text style={styles.skillGroupTitle}>{group.title}</Text>

          <View style={styles.badgesRow}>
            {group.items.map((item) => (
              <Text key={item.id} style={styles.badge}>
                {item.name}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function FocusBlock({
  styles,
  templateConfig,
}: {
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  return (
    <View style={styles.sidebarBlock} wrap={false}>
      <Text style={styles.sidebarTitle}>{templateConfig.labels.profile}</Text>

      <View style={styles.focusList}>
        {templateConfig.profileFocus.map((item) => (
          <Text key={item} style={styles.focusItem}>
            {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

function TimelineBlock({
  timeline,
  companiesById,
  styles,
  templateConfig,
}: {
  timeline: CV["experience_timeline"];
  companiesById: CompanyLookup;
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <View style={styles.sidebarBlock}>
      <Text style={styles.sidebarTitle}>{templateConfig.labels.timeline}</Text>

      {timeline.map((item, index) => {
        const label = item.company_id
          ? companiesById[item.company_id]?.name ?? "Company"
          : "B2B / Contract";

        return (
          <View
            key={`${item.company_id ?? item.client_id ?? "x"}-${item.start}-${index}`}
            style={styles.timelineItem}
            wrap={false}
          >
            <View style={styles.timelineDot} />

            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>{label}</Text>
              <Text style={styles.timelineDate}>
                {formatRange(item.start, item.end)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function LinksBlock({
  profiles,
  styles,
  templateConfig,
}: {
  profiles: PdfProfile[];
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  if (profiles.length === 0) return null;

  return (
    <View style={styles.sidebarBlock}>
      <Text style={styles.sidebarTitle}>{templateConfig.labels.links}</Text>

      {profiles.map((profile) => (
        <View key={profile.id} style={styles.linkRow} wrap={false}>
          <Link src={profile.url} style={styles.link}>
            {getCompactLinkText(profile)}
          </Link>
        </View>
      ))}
    </View>
  );
}

function FirstPageSidebar({
  cv,
  skillGroups,
  styles,
  templateConfig,
}: {
  cv: CV;
  skillGroups: SkillGroups;
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  return (
    <View style={styles.sidebar}>
      {cv.person.avatar_url ? (
        <View style={styles.avatarWrap} wrap={false}>
          <Image src={cv.person.avatar_url} style={styles.avatar} />
        </View>
      ) : null}

      <FocusBlock styles={styles} templateConfig={templateConfig} />

      <SkillsBlock
        skillGroups={skillGroups}
        styles={styles}
        templateConfig={templateConfig}
      />
    </View>
  );
}

function ContinuationSidebar({
  skillGroups,
  timeline,
  companiesById,
  profiles,
  styles,
  templateConfig,
}: {
  skillGroups: SkillGroups;
  timeline: CV["experience_timeline"];
  companiesById: CompanyLookup;
  profiles: PdfProfile[];
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  return (
    <View style={styles.sidebar}>
      <SkillsBlock
        skillGroups={skillGroups}
        styles={styles}
        templateConfig={templateConfig}
      />

      <TimelineBlock
        timeline={timeline}
        companiesById={companiesById}
        styles={styles}
        templateConfig={templateConfig}
      />

      <LinksBlock
        profiles={profiles}
        styles={styles}
        templateConfig={templateConfig}
      />
    </View>
  );
}

function ProjectList({
  projects,
  companiesById,
  styles,
}: {
  projects: Project[];
  companiesById: CompanyLookup;
  styles: ExecutiveLightStyles;
}) {
  return (
    <View style={styles.experienceList}>
      {projects.map((project) => {
        const company = getProjectCompany(project, companiesById);

        return (
          <View key={project.id} style={styles.projectItem} wrap={false}>
            <Text style={styles.projectMeta}>
              {formatRange(project.time_range.start, project.time_range.end)} ·{" "}
              {company}
            </Text>

            <Text style={styles.projectTitle}>
              {project.display_name ?? project.name}
            </Text>

            {project.description ? (
              <Text style={styles.projectDesc}>{project.description}</Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function ExecutiveLightTemplate({
  cv,
  options,
  styles,
  templateConfig,
}: {
  cv: CV;
  options: CvPdfOptions;
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  const companiesById = Object.fromEntries(
    cv.companies.map((company) => [company.id, company]),
  ) as CompanyLookup;

  const timeline = cv.experience_timeline ?? [];

  const publicProjects = cv.projects
    .filter((project) => project.public?.show !== false)
    .slice()
    .sort((a, b) =>
      (b.time_range.start ?? "").localeCompare(a.time_range.start ?? ""),
    );

  const allSkillGroups = groupSkills(cv);

  const firstPageSkillGroups = allSkillGroups.slice(
    0,
    FIRST_PAGE_SKILL_GROUP_COUNT,
  );
  const remainingSkillGroups = allSkillGroups.slice(
    FIRST_PAGE_SKILL_GROUP_COUNT,
  );

  const firstPageProjects = publicProjects.slice(0, FIRST_PAGE_PROJECT_COUNT);
  const remainingProjects = publicProjects.slice(FIRST_PAGE_PROJECT_COUNT);

  const profiles = getProfiles(cv);
  const consentText = getConsentText(options);

  const shouldRenderContinuationPage =
    remainingProjects.length > 0 ||
    remainingSkillGroups.length > 0 ||
    timeline.length > 0 ||
    profiles.length > 0;

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
        <Header cv={cv} styles={styles} templateConfig={templateConfig} />

        <View style={styles.body}>
          <FirstPageSidebar
            cv={cv}
            skillGroups={firstPageSkillGroups}
            styles={styles}
            templateConfig={templateConfig}
          />

          <View style={styles.main}>
            <View style={styles.mainSection} wrap={false}>
              <Text style={styles.sectionTitle}>
                {templateConfig.labels.summary}
              </Text>
              <Text style={styles.summaryText}>
                {cv.person.bio_short ?? "—"}
              </Text>
            </View>

            <View style={styles.mainSection}>
              <Text style={styles.sectionTitle}>
                {templateConfig.labels.experienceProjects}
              </Text>

              <ProjectList
                projects={firstPageProjects}
                companiesById={companiesById}
                styles={styles}
              />
            </View>
          </View>
        </View>

        <Footer
          generatedAt={cv.meta.generated_at_local}
          consentText={consentText}
          showAttribution={!shouldRenderContinuationPage}
          styles={styles}
          templateConfig={templateConfig}
        />
      </Page>

      {shouldRenderContinuationPage ? (
        <Page size="A4" style={styles.page} wrap={false}>
          <ContinuationHeader
            cv={cv}
            styles={styles}
            templateConfig={templateConfig}
          />

          <View style={styles.body}>
            <ContinuationSidebar
              skillGroups={remainingSkillGroups}
              timeline={timeline}
              companiesById={companiesById}
              profiles={profiles}
              styles={styles}
              templateConfig={templateConfig}
            />

            <View style={styles.main}>
              {remainingProjects.length > 0 ? (
                <View style={styles.mainSection}>
                  <Text style={styles.sectionTitle}>
                    {templateConfig.labels.experienceProjectsContinued}
                  </Text>

                  <ProjectList
                    projects={remainingProjects}
                    companiesById={companiesById}
                    styles={styles}
                  />
                </View>
              ) : (
                <View style={styles.emptyMainPanel}>
                  <Text style={styles.emptyMainText}>
                    {templateConfig.labels.additionalProfileDetails}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Footer
            generatedAt={cv.meta.generated_at_local}
            consentText={consentText}
            showAttribution
            styles={styles}
            templateConfig={templateConfig}
          />
        </Page>
      ) : null}
    </Document>
  );
}
