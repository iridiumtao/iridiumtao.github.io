// lib/projects.ts
// The only module that touches the filesystem for project data (D-10/D-11).
// Must only be imported from build-time data fetching (getStaticProps/getStaticPaths)
// in pages/*.js — never from a components/wood/* client component. Enforced two ways:
// a runtime assertServerOnly() throw here, and a static no-restricted-imports ESLint
// rule scoped to components/wood/** (see eslint.config.mjs).
import fs from "fs";
import { join } from "path";
import matter from "gray-matter";
// Extension-exact specifier + JSON import attribute: required for Node's native
// ESM loader (used directly by `node --test`, D-12) to resolve these relative
// imports — Node's ESM resolver (unlike webpack/tsc's "bundler" resolution)
// does not infer extensions and requires an import attribute for JSON. The
// extension must literally match the file on disk, so it tracks renames: when
// markdownToHtml moved .js -> .ts, this specifier had to move with it. Both
// forms remain valid under the project's tsconfig ("moduleResolution":
// "bundler", "allowImportingTsExtensions") and Next.js's build pipeline;
// verified via `yarn build`.
import markdownToHtml from "../utils/markdownToHtml.ts";
// Goes through lib/portfolio.ts rather than the raw JSON so the content shape
// is checked against PortfolioData in the one place that promises to check it
// (D-06). Importing the JSON directly here meant toProject() consumed the
// inferred literal type and its RawProjectEntry parameter was never actually
// enforced against the real file.
import portfolioData from "./portfolio.ts";
// types/portfolio.ts is the single source of truth for the content model
// (D-08). This module re-exports Project/ProjectWithBody so its existing
// consumers keep importing them from here, but it no longer defines its own
// parallel copies that could silently drift from the canonical ones.
import type {
  Project,
  ProjectWithBody,
  RawProjectEntry,
} from "../types/portfolio";

export type { Project, ProjectWithBody };

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

// The one place the raw-JSON shape (subtitle optional/absent) meets the
// normalized shape (subtitle nullable). The `?? null` coalescing below already
// handles an absent key correctly, so RawProjectEntry needs no extra guards.
function toProject(raw: RawProjectEntry): Project {
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
  const projects = portfolioData.projects.map(toProject);
  // Returning 0 for any unparseable date (the previous behaviour) is not a
  // valid total order: it is non-transitive, so a single malformed endDate made
  // Array.prototype.sort produce an engine-dependent arrangement of the WHOLE
  // list rather than misplacing one entry. This order is load-bearing — the
  // homepage featured grid and every showcase page's prev/next derive from it.
  // Bad dates now sort deterministically to the end and announce themselves.
  const ts = (d: string | undefined): number => {
    const t = d ? new Date(d).getTime() : NaN;
    if (isNaN(t)) console.warn(`lib/projects: unparseable endDate: "${d}"`);
    return isNaN(t) ? -Infinity : t;
  };
  return projects.sort((a, b) => ts(b.endDate) - ts(a.endDate));
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
