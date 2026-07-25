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
//
// Plan 06-05 made both accessors locale-aware. Every pre-existing case now
// passes "en" explicitly and asserts exactly what it asserted before — the
// English coverage is preserved unchanged, not rewritten — and a new block at
// the bottom covers the "zh" locale: slug/order parity, a real rendered
// Chinese body, and the traversal guard firing before any fs call in the
// non-English path too.
import test from "node:test";
import fs from "node:fs";
import assert from "node:assert/strict";
import { getAllProjects, getProjectBySlug } from "./projects.ts";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const EXPECTED_PROJECT_COUNT = 8;

test("getProjectBySlug resolves a fully-shaped project for real Oblivilight data", async () => {
  const project = await getProjectBySlug("openhci25-oblivilight", "en");
  assert.ok(project, "expected a non-null project");
  assert.equal(project.slug, "openhci25-oblivilight");
  assert.deepEqual(project.techStack, ["HCI", "LangChain"]);
  assert.match(project.imageSrc, /^\/images\/projects\//);
  // Proves the Markdown was actually rendered through remark-html, not just read raw.
  // `assert.ok` is declared `asserts value` in @types/node, so unlike the
  // `assert.equal(typeof ..., "string")` spelling it previously used, it also
  // narrows `body` from `string | null` for the assert.match below (TS2345).
  assert.ok(
    typeof project.body === "string",
    "expected a rendered Markdown body string",
  );
  assert.match(project.body, /<p>/);
});

test("getProjectBySlug returns null for an unknown slug (DATA-03 no-Markdown path, D-08b)", async () => {
  const project = await getProjectBySlug("__does_not_exist__", "en");
  assert.equal(project, null);
});

test("getProjectBySlug returns null for a path-traversal-shaped slug (T-02-01)", async () => {
  const project = await getProjectBySlug("../../etc/passwd", "en");
  assert.equal(project, null);
});

test("getAllProjects includes a kebab-case Oblivilight slug", async () => {
  const projects = getAllProjects("en");
  const oblivilight = projects.find(
    (p) => p.slug === "openhci25-oblivilight",
  );
  assert.ok(oblivilight, "expected Oblivilight (id 8) in getAllProjects()");
  assert.match(oblivilight.slug, SLUG_PATTERN);
});

test("getAllProjects returns exactly 8 fully-shaped projects with valid, unique, localized-image slugs (DATA-01/02/04, all 8)", () => {
  const projects = getAllProjects("en");
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
  const projects = getAllProjects("en");
  assert.equal(projects.length, EXPECTED_PROJECT_COUNT);

  for (const { slug } of projects) {
    const project = await getProjectBySlug(slug, "en");
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

/* ── Locale awareness (plan 06-05, LOC-04) ────────────────────────────── */

test('getAllProjects("zh") returns the same slugs in the same order as "en"', () => {
  // Order parity is load-bearing, not incidental: the home grid's featured
  // slice and every showcase page's prev/next derive from this order, so a
  // locale-dependent sort would silently give the two sites different
  // neighbours. It holds because startDate/endDate are pinned identical across
  // both content files (plan 06-03) — this asserts the consequence, and
  // lib/translations.test.ts asserts the cause.
  const en = getAllProjects("en");
  const zh = getAllProjects("zh");
  assert.equal(zh.length, EXPECTED_PROJECT_COUNT);
  assert.deepEqual(
    zh.map((p) => p.slug),
    en.map((p) => p.slug),
    "zh and en project order must be identical",
  );
});

test('getProjectBySlug resolves a rendered _projects/<slug>.zh.md body for "zh"', async () => {
  const project = await getProjectBySlug("openhci25-oblivilight", "zh");
  assert.ok(project, "expected a non-null project");
  assert.equal(project.slug, "openhci25-oblivilight");
  assert.ok(
    typeof project.body === "string",
    "expected a rendered Chinese Markdown body string",
  );
  // <p> proves it went through remark-html rather than being read raw, and the
  // CJK range proves the .zh.md sibling was read rather than the English file.
  assert.match(project.body, /<p>/);
  assert.match(project.body, /[一-鿿]/);
});

test('getProjectBySlug rejects a traversal-shaped slug for "zh" before any fs call (T-06-11)', async (t) => {
  // The locale suffix is appended to an already-validated slug, so adding
  // locales must not have opened a second path into join(). Mocking
  // fs.existsSync proves the SLUG_PATTERN guard returns first rather than
  // merely proving the traversal happened to miss.
  const existsSync = t.mock.method(fs, "existsSync");
  const project = await getProjectBySlug("../../etc/passwd", "zh");
  assert.equal(project, null);
  assert.equal(
    existsSync.mock.callCount(),
    0,
    "SLUG_PATTERN must reject before any filesystem access",
  );
});

test('getProjectBySlug throws, naming both sides of the drift, when a .zh.md body is missing (LOC-04, D-04)', async (t) => {
  // The invariant plan 06-09 depends on: a missing translation fails the build
  // loudly instead of rendering the English body under a /zh/ URL. Mocking the
  // existence check gives a permanent regression guard for it without having to
  // delete a real content file.
  t.mock.method(fs, "existsSync", () => false);
  await assert.rejects(
    () => getProjectBySlug("openhci25-oblivilight", "zh"),
    (error: Error) => {
      assert.match(error.message, /openhci25-oblivilight/);
      assert.match(error.message, /_projects\/openhci25-oblivilight\.zh\.md/);
      assert.match(error.message, /drifted apart/);
      return true;
    },
  );
});

test('getProjectBySlug still returns body: null rather than throwing for a missing "en" body', async (t) => {
  // The English posture is deliberately unchanged: an absent
  // _projects/<slug>.md has always been a legitimate state and must stay one.
  t.mock.method(fs, "existsSync", () => false);
  const project = await getProjectBySlug("openhci25-oblivilight", "en");
  assert.ok(project, "expected a non-null project");
  assert.equal(project.body, null);
});
