// types/portfolio.ts
// Canonical content-model types for data/portfolio.json (D-05/D-07).
// Every type here is derived from the real, committed JSON — not from an
// idealized schema. When the JSON changes shape, lib/portfolio.ts's
// `satisfies PortfolioData` check is what fails first (D-06).

export type Social = {
  title: string;
  link: string;
};

// The top-level flat `experiences` array — short blurbs paired index-wise
// with resume.experiences. Distinct from ResumeExperienceEntry.
export type Experience = {
  id: string;
  title: string;
  description: string;
};

// `greeting`, `heroLines`, and `lede` are the hero's copy. The two of them that
// used to carry a separate highlight field (`heroAccent`, `ledeEmphasis`) now
// mark their own emphasis inline with Markdown `**strong**` — one string to
// edit instead of a string plus a fragile "which substring" pointer.
export type Home = {
  greeting: string;
  availability: string;
  heroLines: string[];
  lede: string;
  based: string;
  degree: string;
  stack: string;
  honorsShort: string;
  aboutPull: string;
  contactEmail: string;
  projectCount: number;
};

export type ResumeExperienceEntry = {
  id: string;
  dates: string;
  type: string;
  position: string;
  location: string;
  bullets: string[];
};

export type ResumeEducationEntry = {
  id: string;
  universityName: string;
  universityDate: string;
  location: string;
  degree: string;
  gpa: string;
  relevantCoursework: string[];
};

// Exactly the four keys present in the committed data today, in the order the
// résumé itself groups them.
export type ResumeSkills = {
  languages: string[];
  cloudAndDevOps: string[];
  frameworksAndBackend: string[];
  dataAndML: string[];
};

export type ResumeProjectEntry = {
  id: string;
  title: string;
  organization: string;
  location: string;
  dates: string;
  details: string[];
};

// `event`, `organization`, and `organizer` are independently optional: the real
// entries use none, one, or two of them (the Level-Up Society honor carries both
// `event` and `organizer`). A discriminated union would misrepresent that, and
// pages/resume.js already reads them as a `honor.event || honor.organization`
// fallback chain at the call site.
export type ResumeHonorEntry = {
  id: string;
  title: string;
  event?: string;
  organization?: string;
  organizer?: string;
  location: string;
  year: string;
};

export type Resume = {
  tagline: string;
  description: string;
  experiences: ResumeExperienceEntry[];
  education: ResumeEducationEntry[];
  skills: ResumeSkills;
  projects: ResumeProjectEntry[];
  honors: ResumeHonorEntry[];
};

// The normalized project shape consumed everywhere in the UI, produced by
// lib/projects.ts's toProject(). Mirrors that module's exported type exactly.
export type Project = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  techStack: string[];
  startDate: string;
  endDate: string;
  description: string;
  imageSrc: string;
  url: string;
  demoUrl: string | null;
  role: string | null;
  problem: string | null;
  process: string | null;
  outcome: string | null;
};

export type ProjectWithBody = Project & { body: string | null };

// The literal shape inside data/portfolio.json's `projects` array — NOT
// identical to Project. `subtitle` is optional rather than nullable because
// three entries (risc-v-simulator, tw-covid-bot, swiftui-weather-app) omit the
// key entirely instead of setting it to null. The `T | null` rule (D-07) covers
// fields that genuinely hold null in the JSON, not fields that are absent.
export type RawProjectEntry = Omit<Project, "subtitle"> & {
  subtitle?: string;
};

export type PortfolioData = {
  name: string;
  showCursor: boolean;
  darkMode: boolean;
  showResume: boolean;
  socials: Social[];
  projects: RawProjectEntry[];
  experiences: Experience[];
  aboutpara: string;
  home: Home;
  resume: Resume;
};
