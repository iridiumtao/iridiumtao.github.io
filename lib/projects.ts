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
import { getPortfolioData } from "./portfolio.ts";
import type { Locale } from "./locale.ts";
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
// before any path.join() call using the raw slug (T-02-01, T-06-11). The locale
// suffix added in getProjectBySlug() below is appended to an ALREADY-VALIDATED
// slug; it is never used to build a path out of an unvalidated one, so adding
// locales did not open a second, unguarded route into path.join().
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
 * Returns every project from the given locale's content file `projects` array,
 * sorted newest-first by endDate — mirrors the exact comparator pages/index.js
 * uses.
 *
 * `locale` is required (LOC-04): there is no default and no English fallback.
 *
 * The sort order is locale-independent by construction. startDate/endDate are
 * pinned identical across both content files (plan 06-03), and
 * lib/translations.test.ts asserts that parity — so getAllProjects("zh")
 * returns the same slugs in the same order as getAllProjects("en"), which is
 * what keeps the home grid and every showcase page's prev/next consistent
 * between the two locales (D-13).
 */
export function getAllProjects(locale: Locale): Project[] {
  assertServerOnly();
  const projects = getPortfolioData(locale).projects.map(toProject);
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
 * Returns the project matching `slug` plus its rendered Markdown body, read
 * from _projects/{slug}.md for "en" and _projects/{slug}.{locale}.md for every
 * other locale. Returns null for an unrecognized slug, a malformed slug
 * (defense-in-depth, T-02-01/T-06-11), or when no project matches.
 * `body` is always `string | null`, never `undefined` (D-08b).
 *
 * Two deliberately DIFFERENT missing-file postures (Shared Pattern 4):
 *
 * - "en" keeps today's behaviour exactly: an absent _projects/{slug}.md yields
 *   `body: null` and the page renders without a body section. That has always
 *   been a legitimate state for an English project.
 * - Any other locale THROWS (LOC-04, D-04). A missing translation is drift
 *   between this repo's own two content sources, so it takes the throw-on-drift
 *   posture of pages/projects/[slug].page.tsx rather than the safe-fallback
 *   posture reserved for framework and filesystem input. tsc cannot see a
 *   missing file, so a hard `next build` failure is the closest available
 *   equivalent to the `satisfies` check that guards data/portfolio.zh.json.
 *   Falling back to the English body is expressly forbidden: it would ship an
 *   English showcase page under a /zh/ URL and look, to the reader, like a
 *   finished translation.
 */
export async function getProjectBySlug(
  slug: string,
  locale: Locale,
): Promise<ProjectWithBody | null> {
  assertServerOnly();

  if (!SLUG_PATTERN.test(slug)) return null;

  const project = getAllProjects(locale).find((p) => p.slug === slug);
  if (!project) return null;

  // The suffix is appended to a slug SLUG_PATTERN has already accepted, so the
  // filename below cannot escape projectsDirectory (T-06-11).
  const filename = locale === "en" ? `${slug}.md` : `${slug}.${locale}.md`;
  const mdPath = join(projectsDirectory, filename);

  if (locale !== "en" && !fs.existsSync(mdPath)) {
    throw new Error(
      `No ${locale} showcase body for slug "${slug}". ` +
        `data/portfolio.${locale}.json lists the project but ` +
        `_projects/${filename} is missing — the two content sources have ` +
        "drifted apart. Write that translation or drop the project from the " +
        `${locale} content file; lib/projects.ts deliberately does not fall ` +
        "back to the English body (D-04).",
    );
  }

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
