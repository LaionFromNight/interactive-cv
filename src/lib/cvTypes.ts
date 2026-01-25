// --------------------
// Primitives
// --------------------
export type MonthStr = `${number}-${string}`; // e.g. "2024-06"

// --------------------
// Privacy
// --------------------
export type PrivacyOverrides = Record<
  string,
  Partial<{
    show_client_name: boolean;
    show_project_name: boolean;
  }>
>;

export type CVPublicDisplayDefaults = {
  show_client_names: boolean;
  show_project_names: boolean;
};

export type CVPrivacyRules = {
  anonymize_clients: string[];
  anonymize_projects: string[];
  public_display_defaults: CVPublicDisplayDefaults;
  overrides: PrivacyOverrides;
};

export type CVMeta = {
  owner: string;
  privacy_rules: CVPrivacyRules;
  generated_at_local: string;
};

// --------------------
// Media (Spotify)
// --------------------
export type SpotifyItem = {
  id: string;
  title: string;
  url: string;
  note?: string;
};

export type CVSpotifyMedia = {
  title?: string;
  subtitle?: string;
  items: SpotifyItem[];
};

export type CVMedia = {
  spotify?: CVSpotifyMedia;
};

// --------------------
// Person
// --------------------
export type CVContacts = {
  email: string;
  phone?: string;
};

export type CVProfiles = {
  linkedin_label?: string;
  github_label?: string;
};

export type CVPerson = {
  full_name: string;
  headline: string;
  contacts: CVContacts;
  profiles: CVProfiles;
  spoken_languages: string[];
};

// --------------------
// Taxonomy
// --------------------
export type CVTaxonomyItem = {
  id: string;
  name: string;
};

export type CVTaxonomy = {
  roles: CVTaxonomyItem[];
  domains: CVTaxonomyItem[];
};

// --------------------
// Skills
// --------------------
export type CVTech = {
  id: string;
  name: string;
  tags: string[];
};

export type CVSkills = {
  tech: CVTech[];
  usage_scale: Record<string, string>;
};

// --------------------
// Companies
// --------------------
export type CVTimeRange = {
  start: MonthStr;
  end: MonthStr | null;
};

export type CVCompany = {
  id: string;
  name: string;
  type: string;
  time_range: CVTimeRange;
};

// --------------------
// Clients
// --------------------
export type CVClientPrivacy = {
  show_client_name?: boolean;
};

export type CVClient = {
  id: string;
  display_name: string;
  employer_company_id: string | null;
  is_anonymized: boolean;
  notes?: string;
  privacy?: CVClientPrivacy;
};

// --------------------
// Projects
// --------------------
export type CVProjectPublic = {
  show: boolean;
  show_project_name?: boolean;
};

export type CVTechUsage = {
  tech_id: string;
  usage: number;
};

export type CVProject = {
  id: string;
  client_id: string | null;
  company_id: string | null;
  name: string;
  display_name: string;
  time_range: CVTimeRange;
  status: "completed" | "ongoing" | string;
  domain_ids: string[];
  description: string;
  roles: string[];
  responsibilities: string[];
  tech_usage: CVTechUsage[];
  highlights: string[];
  public: CVProjectPublic;
  notes_private?: string[];
};

// --------------------
// Timeline
// --------------------
export type CVExperienceTimelineItem = {
  company_id: string | null;
  start: MonthStr;
  end: MonthStr | null;
  client_id?: string;
  project_ids: string[];
};

// --------------------
// Education
// --------------------
export type CVEducationTimeRange = {
  start: string;
  end: string;
};

export type CVEducation = {
  id: string;
  institution: string;
  program: string;
  time_range: CVEducationTimeRange;
};

// --------------------
// Extras
// --------------------
export type CVExtras = {
  misc_skills: string[];
  hobbies: string[];
};

// --------------------
// Root CV
// --------------------
export type CV = {
  schema_version: string;

  meta: CVMeta;

  // Keep optional media near the top
  media?: CVMedia;

  person: CVPerson;

  taxonomy: CVTaxonomy;

  skills: CVSkills;

  companies: CVCompany[];

  clients: CVClient[];

  projects: CVProject[];

  experience_timeline: CVExperienceTimelineItem[];

  education: CVEducation[];

  extras: CVExtras;
};
