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

  return `${months[monthIndex]} ${year}`;
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

function Header({
  cv,
  qrCodeSrc,
  styles,
}: {
  cv: CV;
  qrCodeSrc: string;
  styles: SlateProfessionalStyles;
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

          <Text style={styles.contactText}>{"  ·  "}Polish / English</Text>
        </View>
      </View>

      <View style={styles.headerQr}>
        <Image src={qrCodeSrc} style={styles.headerQrImage} />
        <Text style={styles.headerQrText}>lukaszkomur.dev</Text>
      </View>
    </View>
  );
}

function ContinuationHeader({
  cv,
  qrCodeSrc,
  styles,
}: {
  cv: CV;
  qrCodeSrc: string;
  styles: SlateProfessionalStyles;
}) {
  return (
    <View style={styles.continuedHeader} wrap={false}>
      <View style={styles.continuedHeaderMain}>
        <Text style={styles.continuedName}>{cv.person.full_name}</Text>
        <Text style={styles.continuedSubtitle}>CV continued</Text>
      </View>

      <View style={styles.continuedQr}>
        <Image src={qrCodeSrc} style={styles.continuedQrImage} />
        <Text style={styles.continuedQrText}>lukaszkomur.dev</Text>
      </View>
    </View>
  );
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
      <Text style={styles.footerConsentText}>{consentText}</Text>
    </View>
  );
}

function SkillsBlock({
  skillGroups,
  styles,
}: {
  skillGroups: SkillGroups;
  styles: SlateProfessionalStyles;
}) {
  if (skillGroups.length === 0) return null;

  return (
    <View style={styles.sidebarBlock}>
      <Text style={styles.sidebarTitle}>Skills</Text>

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

function FocusBlock({ styles }: { styles: SlateProfessionalStyles }) {
  return (
    <View style={styles.sidebarBlock} wrap={false}>
      <Text style={styles.sidebarTitle}>PROFILE</Text>

      <View style={styles.focusList}>
        <Text style={styles.focusItem}>Backend / Solution Architecture</Text>
        <Text style={styles.focusItem}>System Design</Text>
        <Text style={styles.focusItem}>Cloud / Serverless</Text>
        <Text style={styles.focusItem}>IAM & Integrations</Text>
      </View>
    </View>
  );
}

function TimelineBlock({
  timeline,
  companiesById,
  styles,
}: {
  timeline: CV["experience_timeline"];
  companiesById: CompanyLookup;
  styles: SlateProfessionalStyles;
}) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <View style={styles.sidebarBlock}>
      <Text style={styles.sidebarTitle}>Timeline</Text>

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
}: {
  profiles: PdfProfile[];
  styles: SlateProfessionalStyles;
}) {
  if (profiles.length === 0) return null;

  return (
    <View style={styles.sidebarBlock}>
      <Text style={styles.sidebarTitle}>Links</Text>

      {profiles.map((profile) => (
        <View key={profile.id} style={styles.linkRow} wrap={false}>
          <Text style={styles.linkLabel}>{profile.label}</Text>
          <Link src={profile.url} style={styles.link}>
            {profile.url}
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
}: {
  cv: CV;
  skillGroups: SkillGroups;
  styles: SlateProfessionalStyles;
}) {
  return (
    <View style={styles.sidebar}>
      {cv.person.avatar_url ? (
        <View style={styles.avatarWrap} wrap={false}>
          <Image src={cv.person.avatar_url} style={styles.avatar} />
        </View>
      ) : null}

      <FocusBlock styles={styles} />
      <SkillsBlock skillGroups={skillGroups} styles={styles} />
    </View>
  );
}

function ContinuationSidebar({
  skillGroups,
  timeline,
  companiesById,
  profiles,
  styles,
}: {
  skillGroups: SkillGroups;
  timeline: CV["experience_timeline"];
  companiesById: CompanyLookup;
  profiles: PdfProfile[];
  styles: SlateProfessionalStyles;
}) {
  return (
    <View style={styles.sidebar}>
      <SkillsBlock skillGroups={skillGroups} styles={styles} />

      <TimelineBlock
        timeline={timeline}
        companiesById={companiesById}
        styles={styles}
      />

      <LinksBlock profiles={profiles} styles={styles} />
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
  styles: SlateProfessionalStyles;
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
}: {
  cv: CV;
  options: CvPdfOptions;
  styles: SlateProfessionalStyles;
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

  const firstPageSkillGroupCount = 4;
  const firstPageProjectCount = 5;

  const firstPageSkillGroups = allSkillGroups.slice(0, firstPageSkillGroupCount);
  const remainingSkillGroups = allSkillGroups.slice(firstPageSkillGroupCount);

  const firstPageProjects = publicProjects.slice(0, firstPageProjectCount);
  const remainingProjects = publicProjects.slice(firstPageProjectCount);

  const profiles = getProfiles(cv);
  const qrCodeSrc = `${import.meta.env.BASE_URL}QRCODE.png`;
  const consentText = getConsentText(options);

  const shouldRenderContinuationPage =
    remainingProjects.length > 0 ||
    remainingSkillGroups.length > 0 ||
    timeline.length > 0 ||
    profiles.length > 0;

  return (
    <Document
      author={cv.person.full_name}
      title={`${cv.person.full_name} CV`}
      subject={cv.person.headline}
    >
      <Page size="A4" style={styles.page} wrap={false}>
        <Header cv={cv} qrCodeSrc={qrCodeSrc} styles={styles} />

        <View style={styles.body}>
          <FirstPageSidebar
            cv={cv}
            skillGroups={firstPageSkillGroups}
            styles={styles}
          />

          <View style={styles.main}>
            <View style={styles.mainSection} wrap={false}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.summaryText}>
                {cv.person.bio_short ?? "—"}
              </Text>
            </View>

            <View style={styles.mainSection}>
              <Text style={styles.sectionTitle}>Experience / Projects</Text>

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
          styles={styles}
        />
      </Page>

      {shouldRenderContinuationPage ? (
        <Page size="A4" style={styles.page} wrap={false}>
          <ContinuationHeader cv={cv} qrCodeSrc={qrCodeSrc} styles={styles} />

          <View style={styles.body}>
            <ContinuationSidebar
              skillGroups={remainingSkillGroups}
              timeline={timeline}
              companiesById={companiesById}
              profiles={profiles}
              styles={styles}
            />

            <View style={styles.main}>
              {remainingProjects.length > 0 ? (
                <View style={styles.mainSection}>
                  <Text style={styles.sectionTitle}>
                    Experience / Projects continued
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
                    Additional profile details
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Footer
            generatedAt={cv.meta.generated_at_local}
            consentText={consentText}
            styles={styles}
          />
        </Page>
      ) : null}
    </Document>
  );
}