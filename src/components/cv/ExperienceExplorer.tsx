import { useMemo, useState } from "react";
import type { CV } from "../../lib/cvTypes";
import { buildIndexes } from "../../lib/cvSelectors";
import { formatRange, getClientDisplayName, getProjectDisplayName } from "../../lib/cvUtils";
import { FiltersBar } from "./FiltersBar";
import { Timeline } from "./Timeline";
import { ProjectsGrid } from "./ProjectsGrid";
import { ProjectModal } from "./ProjectModal";
import { Section } from "../layout/Section";

export type ExperienceFilters = {
  q: string;
  companyId: "all" | "none" | string;
  roleId: "all" | string;
  domainId: "all" | string;
  onlyOngoing: boolean;
  techIds: string[];
};

type SkillTech = {
  id: string;
  name: string;
  tags?: string[];
  ui?: { visible?: boolean; order?: number };
};

type TechItem = {
  id: string;
  name: string;
  tags: string[];
  order: number;
};

const TECH_PREVIEW_LIMIT = 18;

export function ExperienceExplorer({ cv }: { cv: CV }) {
  const idx = useMemo(() => buildIndexes(cv), [cv]);

  // Privacy behavior is taken from JSON defaults (no user toggles).
  const canShowClientNames = cv.meta.privacy_rules.public_display_defaults.show_client_names;
  const canShowProjectNames = cv.meta.privacy_rules.public_display_defaults.show_project_names;

  const [filters, setFilters] = useState<ExperienceFilters>(() => ({
    q: "",
    companyId: "all",
    roleId: "all",
    domainId: "all",
    onlyOngoing: false,
    techIds: [],
  }));

  // Tech UI state
  const [techQ, setTechQ] = useState("");
  const [showAllTech, setShowAllTech] = useState(false);

  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  // ----- Labels (privacy-aware) -----
  const getClientLabel = (clientId: string | null) => {
    if (!clientId) return "—";
    if (!canShowClientNames) return "Client (hidden)";
    return getClientDisplayName(cv, clientId) ?? "—";
  };

  const getProjectLabel = (projectId: string) => {
    if (!canShowProjectNames) return "Project (hidden)";
    return getProjectDisplayName(cv, projectId);
  };

  const companyLabel = (companyId: string | null) => {
    if (!companyId) return "B2B collaboration";
    return idx.companies[companyId]?.name ?? "Company";
  };

  // ----- Tech chips list: ONLY ui.visible === true (default false) -----
  const availableTech: TechItem[] = useMemo(() => {
    const tech = (cv.skills?.tech as unknown as SkillTech[]) ?? [];

    return tech
      .filter((t) => t.ui?.visible === true)
      .map((t) => ({
        id: t.id,
        name: t.name ?? t.id,
        tags: t.tags ?? [],
        order: t.ui?.order ?? 9999,
      }))
      .filter((t) => Boolean(t.id && t.name))
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
      });
  }, [cv.skills?.tech]);

  const toggleTech = (techId: string) => {
    setFilters((prev) => {
      const exists = prev.techIds.includes(techId);
      return {
        ...prev,
        techIds: exists ? prev.techIds.filter((x) => x !== techId) : [...prev.techIds, techId],
      };
    });
  };

  const clearTech = () => setFilters((prev) => ({ ...prev, techIds: [] }));

  const resetFiltersToTimelineCompany = (companyId: string | null) => {
    setFilters({
      q: "",
      companyId: companyId ?? "none",
      roleId: "all",
      domainId: "all",
      onlyOngoing: false,
      techIds: [],
    });

    setTechQ("");
    setShowAllTech(false);
  };

  // Tech chip filtering + truncation
  const visibleTechFiltered = useMemo(() => {
    const q = techQ.trim().toLowerCase();
    if (!q) return availableTech;
    return availableTech.filter((t) => t.name.toLowerCase().includes(q));
  }, [availableTech, techQ]);

  const visibleTechToRender = useMemo(() => {
    if (showAllTech) return visibleTechFiltered;
    return visibleTechFiltered.slice(0, TECH_PREVIEW_LIMIT);
  }, [visibleTechFiltered, showAllTech]);

  // ----- Precompute search index per project (fast filtering) -----
  const projectSearchIndex = useMemo(() => {
    const byId = new Map<string, string>();

    for (const p of cv.projects) {
      if (p.public?.show === false) continue;

      const roles = (p.roles ?? []).map((r) => idx.roles[r]?.name ?? r);
      const domains = (p.domain_ids ?? []).map((d) => idx.domains[d]?.name ?? d);
      const tech = (p.tech_usage ?? []).map((t) => idx.tech[t.tech_id]?.name ?? t.tech_id);

      const projectName = canShowProjectNames ? getProjectDisplayName(cv, p.id) : "Project";
      const clientName =
        canShowClientNames && p.client_id ? getClientDisplayName(cv, p.client_id) ?? "Client" : "Client";
      const company = p.company_id ? idx.companies[p.company_id]?.name ?? "Company" : "B2B collaboration";

      const hay = [
        projectName,
        p.display_name ?? "",
        p.name ?? "",
        p.description ?? "",
        ...(p.responsibilities ?? []),
        ...(p.highlights ?? []),
        clientName,
        company,
        ...roles,
        ...domains,
        ...tech,
      ]
        .join(" ")
        .toLowerCase();

      byId.set(p.id, hay);
    }

    return byId;
  }, [cv, idx, canShowClientNames, canShowProjectNames]);

  const filteredProjects = useMemo(() => {
    const query = filters.q.trim().toLowerCase();

    return cv.projects
      .filter((p) => p.public?.show !== false)
      .filter((p) => {
        if (filters.onlyOngoing) {
          const ongoing = p.status === "ongoing" || p.time_range.end === null;
          if (!ongoing) return false;
        }

        if (filters.companyId !== "all") {
          if (filters.companyId === "none") {
            if (p.company_id !== null) return false;
          } else {
            if (p.company_id !== filters.companyId) return false;
          }
        }

        if (filters.roleId !== "all" && !(p.roles ?? []).includes(filters.roleId)) return false;

        if (filters.domainId !== "all" && !(p.domain_ids ?? []).includes(filters.domainId)) return false;

        if (filters.techIds.length > 0) {
          const ok = (p.tech_usage ?? []).some((u) => filters.techIds.includes(u.tech_id));
          if (!ok) return false;
        }

        if (query) {
          const hay = projectSearchIndex.get(p.id) ?? "";
          if (!hay.includes(query)) return false;
        }

        return true;
      })
      .sort((a, b) => (a.time_range.start < b.time_range.start ? 1 : -1));
  }, [cv.projects, filters, projectSearchIndex]);

  const timelineItems = cv.experience_timeline.map((t) => ({
    key: `${t.company_id ?? t.client_id ?? "x"}-${t.start}`,
    companyId: t.company_id ?? null,
    title: t.company_id ? companyLabel(t.company_id) : getClientLabel(t.client_id ?? null),
    range: formatRange(t.start, t.end),
    projectCount: t.project_ids?.length ?? 0,
  }));

  return (
    <Section id="experience" className="py-12 md:py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Experience Explorer</h2>
        <p className="mt-2 text-sm text-white/70">Filter projects and drill into details. Powered by JSON.</p>
      </div>

      <FiltersBar
        cv={cv}
        filters={filters}
        setFilters={setFilters}
        techQ={techQ}
        setTechQ={setTechQ}
        showAllTech={showAllTech}
        setShowAllTech={setShowAllTech}
        visibleTech={visibleTechToRender}
        visibleTechCount={visibleTechToRender.length}
        totalVisibleTechCount={visibleTechFiltered.length}
        onToggleTech={toggleTech}
        onClearTech={clearTech}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <Timeline
          items={timelineItems}
          onSelect={(companyId) => {
            resetFiltersToTimelineCompany(companyId);
            setOpenProjectId(null);
          }}
        />

        <ProjectsGrid
          projects={filteredProjects}
          idx={idx}
          getProjectLabel={getProjectLabel}
          companyLabel={companyLabel}
          onSelectProject={setOpenProjectId}
        />
      </div>

      <ProjectModal
        cv={cv}
        idx={idx}
        projectId={openProjectId}
        open={openProjectId !== null}
        onClose={() => setOpenProjectId(null)}
        onToggleTech={toggleTech}
        getProjectLabel={getProjectLabel}
        getClientLabel={getClientLabel}
        companyLabel={companyLabel}
      />
    </Section>
  );
}
