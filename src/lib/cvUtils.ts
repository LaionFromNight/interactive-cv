import type { CV } from "./cvTypes";

export const formatRange = (start: string, end: string | null) => {
  const s = start.replace("-", ".");
  const e = end ? end.replace("-", ".") : "now";
  return `${s} → ${e}`;
};

export const indexById = <T extends { id: string }>(arr: T[]) =>
  Object.fromEntries(arr.map((x) => [x.id, x])) as Record<string, T>;

export const shouldShowClientName = (cv: CV, clientId: string) => {
  const defaults = cv.meta.privacy_rules.public_display_defaults.show_client_names;
  const override = cv.meta.privacy_rules.overrides?.[clientId]?.show_client_name;
  const client = cv.clients.find((c) => c.id === clientId);
  const inline = client?.privacy?.show_client_name;
  return (inline ?? override ?? defaults) === true;
};

export const shouldShowProjectName = (cv: CV, projectId: string) => {
  const defaults = cv.meta.privacy_rules.public_display_defaults.show_project_names;
  const override = cv.meta.privacy_rules.overrides?.[projectId]?.show_project_name;
  const proj = cv.projects.find((p) => p.id === projectId);
  const inline = proj?.public?.show_project_name;
  return (inline ?? override ?? defaults) === true;
};

export const getClientDisplayName = (cv: CV, clientId: string | null) => {
  if (!clientId) return null;
  const client = cv.clients.find((c) => c.id === clientId);
  if (!client) return null;

  return shouldShowClientName(cv, clientId)
    ? client.display_name
    : "Client (anonymized)";
};

export const getProjectDisplayName = (cv: CV, projectId: string) => {
  const proj = cv.projects.find((p) => p.id === projectId);
  if (!proj) return "Unknown project";

  return shouldShowProjectName(cv, projectId)
    ? proj.display_name
    : "Project (anonymized)";
};
