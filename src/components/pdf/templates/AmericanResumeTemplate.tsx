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
import type { PdfTemplateConfig } from "../PdfTemplateConfig";
import type { ExecutiveLightStyles } from "../styles/createExecutiveLightStyles"
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

const AMERICAN_PROJECTS_PER_PAGE = 3;
const MAX_PROJECT_TECH_ITEMS = 12;
const MAX_RESPONSIBILITIES = 5;
const MAX_HIGHLIGHTS = 4;

type CompanyLookup = Record<string, CV["companies"][number] | undefined>;
type ClientLookup = Record<string, CV["clients"][number] | undefined>;
type RoleLookup = Record<string, CV["taxonomy"]["roles"][number] | undefined>;
type DomainLookup = Record<string, CV["taxonomy"]["domains"][number] | undefined>;
type TechLookup = Record<string, CV["skills"]["tech"][number] | undefined>;
type Project = CV["projects"][number];

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

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

function getProjectCompany(project: Project, companiesById: CompanyLookup) {
  if (!project.company_id) return "B2B / Contract";

  return companiesById[project.company_id]?.name ?? "Company";
}

function getProjectClient(project: Project, clientsById: ClientLookup) {
  if (!project.client_id) return null;

  const client = clientsById[project.client_id];

  if (!client) return null;

  return client.display_name;
}

function getRoleNames(project: Project, rolesById: RoleLookup) {
  return (project.roles ?? [])
    .map((roleId) => rolesById[roleId]?.name)
    .filter(Boolean) as string[];
}

function getDomainNames(project: Project, domainsById: DomainLookup) {
  return (project.domain_ids ?? [])
    .map((domainId) => domainsById[domainId]?.name)
    .filter(Boolean) as string[];
}

function getProjectTechNames(project: Project, techById: TechLookup) {
  return (project.tech_usage ?? [])
    .map((usage) => techById[usage.tech_id]?.name)
    .filter(Boolean)
    .slice(0, MAX_PROJECT_TECH_ITEMS) as string[];
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
    });
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
              {"  |  "}
              {cv.person.contacts.phone}
            </Text>
          ) : null}

          {templateConfig.spokenLanguagesLine ? (
            <Text style={styles.contactText}>
              {"  |  "}
              {templateConfig.spokenLanguagesLine}
            </Text>
          ) : null}
        </View>

        {Array.isArray(cv.person.profiles) && cv.person.profiles.length ? (
          <View style={styles.contactLine}>
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
        ) : null}
      </View>

      <Link src={templateConfig.qr.targetUrl} style={styles.headerQr}>
        <Image src={templateConfig.qr.imageSrc} style={styles.headerQrImage} />
        <Text style={styles.headerQrText}>{templateConfig.qr.label}</Text>
      </Link>
    </View>
  );
}

function Footer({
  generatedAt,
  consentText,
  styles,
  templateConfig,
}: {
  generatedAt: string;
  consentText?: string | null;
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
    </View>
  );
}

function SkillBadges({
  skills,
  styles,
}: {
  skills: CV["skills"]["tech"];
  styles: ExecutiveLightStyles;
}) {
  if (!skills.length) return null;

  return (
    <View style={styles.badgesRow}>
      {skills.map((skill) => (
        <Text key={skill.id} style={styles.badge}>
          {skill.name}
        </Text>
      ))}
    </View>
  );
}

function BulletList({
  title,
  items,
  styles,
  limit,
}: {
  title: string;
  items: string[] | undefined;
  styles: ExecutiveLightStyles;
  limit: number;
}) {
  if (!items?.length) return null;

  const visibleItems = items.slice(0, limit);

  return (
    <View style={styles.skillGroup}>
      <Text style={styles.skillGroupTitle}>{title}</Text>

      {visibleItems.map((item, index) => (
        <Text key={`${title}-${index}`} style={styles.projectDesc}>
          • {item}
        </Text>
      ))}
    </View>
  );
}

function ProjectCard({
  project,
  companiesById,
  clientsById,
  rolesById,
  domainsById,
  techById,
  styles,
  templateConfig,
}: {
  project: Project;
  companiesById: CompanyLookup;
  clientsById: ClientLookup;
  rolesById: RoleLookup;
  domainsById: DomainLookup;
  techById: TechLookup;
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  const company = getProjectCompany(project, companiesById);
  const client = getProjectClient(project, clientsById);
  const roleNames = getRoleNames(project, rolesById);
  const domainNames = getDomainNames(project, domainsById);
  const techNames = getProjectTechNames(project, techById);

  return (
    <View style={styles.projectItem} wrap={false}>
      <Text style={styles.projectMeta}>
        {formatRange(project.time_range.start, project.time_range.end)} ·{" "}
        {[company, client, project.status].filter(Boolean).join(" · ")}
      </Text>

      <Text style={styles.projectTitle}>
        {project.display_name ?? project.name}
      </Text>

      {roleNames.length || domainNames.length ? (
        <Text style={styles.projectMeta}>
          {[...roleNames, ...domainNames].join(" · ")}
        </Text>
      ) : null}

      {project.description ? (
        <Text style={styles.projectDesc}>{project.description}</Text>
      ) : null}

      <BulletList
        title={templateConfig.labels.responsibilities}
        items={project.responsibilities}
        styles={styles}
        limit={MAX_RESPONSIBILITIES}
      />

      <BulletList
        title={templateConfig.labels.highlights}
        items={project.highlights}
        styles={styles}
        limit={MAX_HIGHLIGHTS}
      />

      {techNames.length ? (
        <Text style={styles.projectMeta}>
          {templateConfig.labels.stack}: {techNames.join(" | ")}
        </Text>
      ) : null}
    </View>
  );
}

function ProjectList({
  projects,
  companiesById,
  clientsById,
  rolesById,
  domainsById,
  techById,
  styles,
  templateConfig,
}: {
  projects: Project[];
  companiesById: CompanyLookup;
  clientsById: ClientLookup;
  rolesById: RoleLookup;
  domainsById: DomainLookup;
  techById: TechLookup;
  styles: ExecutiveLightStyles;
  templateConfig: PdfTemplateConfig;
}) {
  if (!projects.length) return null;

  return (
    <View style={styles.experienceList}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          companiesById={companiesById}
          clientsById={clientsById}
          rolesById={rolesById}
          domainsById={domainsById}
          techById={techById}
          styles={styles}
          templateConfig={templateConfig}
        />
      ))}
    </View>
  );
}

export function AmericanResumeTemplate({
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

  const clientsById = Object.fromEntries(
    cv.clients.map((client) => [client.id, client]),
  ) as ClientLookup;

  const rolesById = Object.fromEntries(
    cv.taxonomy.roles.map((role) => [role.id, role]),
  ) as RoleLookup;

  const domainsById = Object.fromEntries(
    cv.taxonomy.domains.map((domain) => [domain.id, domain]),
  ) as DomainLookup;

  const techById = Object.fromEntries(
    cv.skills.tech.map((tech) => [tech.id, tech]),
  ) as TechLookup;

  const publicProjects = cv.projects
    .filter((project) => project.public?.show !== false)
    .slice()
    .sort((a, b) =>
      (b.time_range.start ?? "").localeCompare(a.time_range.start ?? ""),
    );

  const projectPages = chunkArray(publicProjects, AMERICAN_PROJECTS_PER_PAGE);
  const coreSkills = getCoreSkills(cv);
  const consentText = getConsentText(options);

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

        <View style={styles.mainSection} wrap={false}>
          <Text style={styles.sectionTitle}>
            {templateConfig.labels.professionalSummary}
          </Text>
          <Text style={styles.summaryText}>{cv.person.bio_short ?? "—"}</Text>
        </View>

        {cv.summary?.cards?.length ? (
          <View style={styles.mainSection}>
            <Text style={styles.sectionTitle}>
              {templateConfig.labels.coreStrengths}
            </Text>

            <View style={styles.experienceList}>
              {cv.summary.cards.map((card) => (
                <View key={card.id} style={styles.projectItem} wrap={false}>
                  <Text style={styles.projectTitle}>{card.title}</Text>
                  <Text style={styles.projectDesc}>{card.desc}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>
            {templateConfig.labels.coreSkills}
          </Text>
          <SkillBadges skills={coreSkills} styles={styles} />
        </View>

        <Footer
          generatedAt={cv.meta.generated_at_local}
          consentText={consentText}
          styles={styles}
          templateConfig={templateConfig}
        />
      </Page>

      {projectPages.map((projects, pageIndex) => (
        <Page
          key={`american-project-page-${pageIndex}`}
          size="A4"
          style={styles.page}
          wrap={false}
        >
          <Header cv={cv} styles={styles} templateConfig={templateConfig} />

          <View style={styles.mainSection}>
            <Text style={styles.sectionTitle}>
              {pageIndex === 0
                ? templateConfig.labels.experienceProjects
                : templateConfig.labels.experienceProjectsContinued}
            </Text>

            <ProjectList
              projects={projects}
              companiesById={companiesById}
              clientsById={clientsById}
              rolesById={rolesById}
              domainsById={domainsById}
              techById={techById}
              styles={styles}
              templateConfig={templateConfig}
            />
          </View>

          <Footer
            generatedAt={cv.meta.generated_at_local}
            consentText={consentText}
            styles={styles}
            templateConfig={templateConfig}
          />
        </Page>
      ))}
    </Document>
  );
}