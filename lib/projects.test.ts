// lib/projects.test.ts
// D-12 verification: proves the whole content pipeline (slug + schema fields +
// copied Markdown body + localized image, all readable through lib/projects.ts)
// end-to-end on one real project (Oblivilight, id 8) via node:test.
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
