import type { CV } from "./cvTypes";
import { indexById } from "./cvUtils";

export const buildIndexes = (cv: CV) => ({
  roles: indexById(cv.taxonomy.roles),
  domains: indexById(cv.taxonomy.domains),
  tech: indexById(cv.skills.tech),
  companies: indexById(cv.companies),
  projects: indexById(cv.projects),
});

export type Indexes = ReturnType<typeof buildIndexes>;
