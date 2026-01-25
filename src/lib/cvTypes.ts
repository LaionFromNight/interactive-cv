export type MonthStr = `${number}-${string}`; // np. "2024-06"

export type PrivacyOverrides = Record<
  string,
  Partial<{
    show_client_name: boolean;
    show_project_name: boolean;
  }>
>;

export type CV = {
  schema_version: string;
  meta: {
    owner: string;
    privacy_rules: {
      anonymize_clients: string[];
      anonymize_projects: string[];
      public_display_defaults: {
        show_client_names: boolean;
        show_project_names: boolean;
      };
      overrides: PrivacyOverrides;
    };
    generated_at_local: string;
  };

  person: {
    full_name: string;
    headline: string;
    contacts: { email: string; phone?: string };
    profiles: { linkedin_label?: string; github_label?: string };
    spoken_languages: string[];
  };

  taxonomy: {
    roles: { id: string; name: string }[];
    domains: { id: string; name: string }[];
  };

  skills: {
    tech: { id: string; name: string; tags: string[] }[];
    usage_scale: Record<string, string>;
  };

  companies: {
    id: string;
    name: string;
    type: string;
    time_range: { start: MonthStr; end: MonthStr | null };
  }[];

  clients: {
    id: string;
    display_name: string;
    employer_company_id: string | null;
    is_anonymized: boolean;
    notes?: string;
    privacy?: { show_client_name?: boolean };
  }[];

  projects: {
    id: string;
    client_id: string | null;
    company_id: string | null;
    name: string;
    display_name: string;
    time_range: { start: MonthStr; end: MonthStr | null };
    status: "completed" | "ongoing" | string;
    domain_ids: string[];
    description: string;
    roles: string[];
    responsibilities: string[];
    tech_usage: { tech_id: string; usage: number }[];
    highlights: string[];
    public: { show: boolean; show_project_name?: boolean };
    notes_private?: string[];
  }[];

  experience_timeline: {
    company_id: string | null;
    start: MonthStr;
    end: MonthStr | null;
    client_id?: string;
    project_ids: string[];
  }[];

  education: {
    id: string;
    institution: string;
    program: string;
    time_range: { start: string; end: string };
  }[];

  extras: {
    misc_skills: string[];
    hobbies: string[];
  };
};
