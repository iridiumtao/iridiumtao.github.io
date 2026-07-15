// lib/projects.ts
// The only module that touches the filesystem for project data (D-10/D-11).
// Must only be imported from build-time data fetching (getStaticProps/getStaticPaths)
// in pages/*.js — never from a components/wood/* client component. Enforced two ways:
// a runtime assertServerOnly() throw here, and a static no-restricted-imports ESLint
// rule scoped to components/wood/** (see eslint.config.mjs).
import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
import markdownToHtml from "../utils/markdownToHtml";
import portfolioData from "../data/portfolio.json";

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

// Kebab-case only — rejects path traversal sequences (e.g. "../../etc/passwd")
// before any path.join() call using the raw slug (T-02-01).
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const projectsDirectory = join(process.cwd(), "_projects");

/**
 * Throws when called in a browser context. No-op at build time (Node.js).
 */
export function assertServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "lib/projects.ts must only be imported from getStaticProps/getStaticPaths " +
        "(build-time, Node.js). It must never be imported from a client component " +
        "under components/wood/*.",
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProject(raw: any): Project {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle ?? null,
    techStack: raw.techStack ?? [],
    startDate: raw.startDate,
    endDate: raw.endDate,
    description: raw.description,
    imageSrc: raw.imageSrc,
    url: raw.url,
    demoUrl: raw.demoUrl ?? null,
    role: raw.role ?? null,
    problem: raw.problem ?? null,
    process: raw.process ?? null,
    outcome: raw.outcome ?? null,
  };
}

/**
 * Returns every project from data/portfolio.json's `projects` array, sorted
 * newest-first by endDate — mirrors the exact comparator pages/index.js uses.
 */
export function getAllProjects(): Project[] {
  assertServerOnly();
  const projects = (portfolioData.projects ?? []).map(toProject);
  return projects.sort((a, b) => {
    const da = a.endDate ? new Date(a.endDate) : null;
    const db = b.endDate ? new Date(b.endDate) : null;
    if (!da || !db || isNaN(da.getTime()) || isNaN(db.getTime())) return 0;
    return db.getTime() - da.getTime();
  });
}

/**
 * Returns the project matching `slug` plus its rendered Markdown body from
 * _projects/{slug}.md, when present. Returns null for an unrecognized slug,
 * a malformed slug (defense-in-depth, T-02-01), or when no project matches.
 * `body` is always `string | null`, never `undefined` (D-08b).
 */
export async function getProjectBySlug(
  slug: string,
): Promise<ProjectWithBody | null> {
  assertServerOnly();

  if (!SLUG_PATTERN.test(slug)) return null;

  const project = getAllProjects().find((p) => p.slug === slug);
  if (!project) return null;

  const mdPath = join(projectsDirectory, `${slug}.md`);
  let body: string | null = null;
  if (fs.existsSync(mdPath)) {
    const fileContents = fs.readFileSync(mdPath, "utf8");
    const { content } = matter(fileContents);
    if (content && content.trim().length > 0) {
      body = await markdownToHtml(content);
    }
  }

  return { ...project, body };
}
