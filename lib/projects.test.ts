// lib/projects.test.ts
// D-12 verification: proves the whole content pipeline (slug + schema fields +
// copied Markdown body + localized image, all readable through lib/projects.ts)
// end-to-end. Plan 02-03 proved this on one real project (Oblivilight, id 8);
// Plan 02-05 broadens the getAllProjects()/getProjectBySlug() loop assertions
// to all 8 projects now that Plan 02-04 has extended the remaining 7 entries
// in data/portfolio.json, closing DATA-01 through DATA-04 for the complete
// dataset (not just the one-project slice).
//
// Node 26 invocation notes (empirically determined, see 02-03-SUMMARY.md):
// - `node --test lib/projects.test.ts` runs unflagged — Node 26's built-in
//   TypeScript type-stripping covers this without --experimental-strip-types.
// - The relative import below must use the exact on-disk extension
//   ("./projects" alone is rejected by Node's ESM resolver, unlike
//   TypeScript's own "bundler" moduleResolution used by `next build`).
import test from "node:test";
import assert from "node:assert/strict";
import { getAllProjects, getProjectBySlug } from "./projects.ts";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EXPECTED_PROJECT_COUNT = 8;

test("getProjectBySlug resolves a fully-shaped project for real Oblivilight data", async () => {
  const project = await getProjectBySlug("openhci25-oblivilight");
  assert.ok(project, "expected a non-null project");
  assert.equal(project.slug, "openhci25-oblivilight");
  assert.deepEqual(project.techStack, ["HCI", "LangChain"]);
  assert.match(project.imageSrc, /^\/images\/projects\//);
  // Proves the Markdown was actually rendered through remark-html, not just read raw.
  assert.equal(typeof project.body, "string");
  assert.match(project.body, /<p>/);
});

test("getProjectBySlug returns null for an unknown slug (DATA-03 no-Markdown path, D-08b)", async () => {
  const project = await getProjectBySlug("__does_not_exist__");
  assert.equal(project, null);
});

test("getProjectBySlug returns null for a path-traversal-shaped slug (T-02-01)", async () => {
  const project = await getProjectBySlug("../../etc/passwd");
  assert.equal(project, null);
});

test("getAllProjects includes a kebab-case Oblivilight slug", async () => {
  const projects = getAllProjects();
  const oblivilight = projects.find(
    (p) => p.slug === "openhci25-oblivilight",
  );
  assert.ok(oblivilight, "expected Oblivilight (id 8) in getAllProjects()");
  assert.match(oblivilight.slug, SLUG_PATTERN);
});

test("getAllProjects returns exactly 8 fully-shaped projects with valid, unique, localized-image slugs (DATA-01/02/04, all 8)", () => {
  const projects = getAllProjects();
  assert.equal(
    projects.length,
    EXPECTED_PROJECT_COUNT,
    `expected exactly ${EXPECTED_PROJECT_COUNT} projects`,
  );

  const seenSlugs = new Set<string>();
  for (const project of projects) {
    // DATA-01: present, valid, unique kebab-case slug.
    assert.match(
      project.slug,
      SLUG_PATTERN,
      `slug "${project.slug}" must match ${SLUG_PATTERN}`,
    );
    assert.equal(
      seenSlugs.has(project.slug),
      false,
      `duplicate slug found: "${project.slug}"`,
    );
    seenSlugs.add(project.slug);

    // DATA-02: techStack is always an array (never omitted/undefined).
    assert.ok(
      Array.isArray(project.techStack),
      `techStack for "${project.slug}" must be an Array`,
    );

    // DATA-04: imageSrc is localized under /images/projects/ and never
    // hot-links to GitHub-hosted raw content (T-02-04).
    assert.match(
      project.imageSrc,
      /^\/images\/projects\//,
      `imageSrc for "${project.slug}" must start with /images/projects/`,
    );
    assert.doesNotMatch(
      project.imageSrc,
      /raw\.githubusercontent\.com/,
      `imageSrc for "${project.slug}" must not hot-link raw.githubusercontent.com`,
    );
    assert.doesNotMatch(
      project.imageSrc,
      /github\.com/,
      `imageSrc for "${project.slug}" must not hot-link github.com`,
    );

    // Closes RESEARCH.md Pitfall 5 exhaustively across all 8 projects, not
    // just id 8: these fields must be explicit null or string, never
    // undefined (D-08b — "optional at the code level" must stay testable).
    for (const field of [
      "role",
      "problem",
      "process",
      "outcome",
      "demoUrl",
    ] as const) {
      const value = project[field];
      assert.ok(
        value === null || typeof value === "string",
        `"${project.slug}".${field} must be null or a string, got ${typeof value}`,
      );
    }
  }
  assert.equal(seenSlugs.size, EXPECTED_PROJECT_COUNT, "slugs must be unique");
});

test("getProjectBySlug resolves a non-empty Markdown body for every one of the 8 real slugs (DATA-03, all 8)", async () => {
  const projects = getAllProjects();
  assert.equal(projects.length, EXPECTED_PROJECT_COUNT);

  for (const { slug } of projects) {
    const project = await getProjectBySlug(slug);
    assert.ok(project, `expected a non-null project for slug "${slug}"`);
    assert.equal(
      typeof project.body,
      "string",
      `body for "${slug}" must be a string`,
    );
    assert.ok(
      project.body && project.body.trim().length > 0,
      `body for "${slug}" must be non-empty`,
    );
  }
});
