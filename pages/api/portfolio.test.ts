// pages/api/portfolio.test.ts
// Whitelist proof for pages/api/portfolio.page.ts's locale-to-path resolver.
//
// This file lives under pages/ on purpose — colocated with the route it proves
// rather than exiled to lib/ — and Next never sees it: `.test.ts` matches no
// entry in next.config.js's pageExtensions in either dev or production, which
// is the same documented "non-page files in the pages directory" mechanism that
// keeps edit.dev.tsx out of the export.
//
// What earns this file: resolveContentPath is the ONLY expression in the route
// that turns request input into a filesystem path. If it can ever be coaxed
// into returning something outside data/, an unauthenticated POST to the dev
// server overwrites an arbitrary file in the developer's tree. Proving that
// mechanically here is cheaper and far more thorough than probing a live
// server, because the function is pure.
//
// Node 26 invocation notes (see lib/routeMap.test.ts for precedent):
// - Run with bare `yarn test` / `node --test` — never `node --test <dir>`
//   (repo gotcha: Node treats the path as a script to require).
// - The relative imports must use the exact on-disk extension; Node's ESM
//   resolver rejects the extensionless form.
import test from "node:test";
import assert from "node:assert/strict";
import {
  CONTENT_FILE_BY_LOCALE,
  resolveContentPath,
} from "./portfolio.page.ts";
import { LOCALES } from "../../lib/locale.ts";

/* ── Accepted locales ─────────────────────────────────────────────────── */

test("both real locales resolve to their own content file", () => {
  assert.equal(resolveContentPath("en"), "data/portfolio.json");
  assert.equal(resolveContentPath("zh"), "data/portfolio.zh.json");
});

test("the two locales never resolve to the same file", () => {
  assert.notEqual(resolveContentPath("en"), resolveContentPath("zh"));
});

/* ── Rejected input ───────────────────────────────────────────────────── */

test("every non-locale value resolves to null, never a default path", () => {
  const rejected: unknown[] = [
    "EN", // exact ASCII equality: no case-folding
    "Zh",
    "fr", // a locale this site does not have
    "", // empty string
    " en", // no trimming
    "../../etc/passwd", // traversal
    "en/../../etc/passwd", // traversal wearing a valid prefix
    "/etc/passwd", // absolute path
    "data/portfolio.json", // the resolved value fed back in
    null,
    undefined,
    0,
    true,
    ["en"],
    {},
  ];
  for (const value of rejected) {
    assert.equal(
      resolveContentPath(value),
      null,
      `resolveContentPath(${JSON.stringify(value)}) must return null`,
    );
  }
});

test("inherited Object.prototype keys resolve to null — the guard runs before the index", () => {
  // A bare `MAP[input]` with no isLocale guard would hand these back as
  // prototype members (a function, or Object.prototype itself), so a null here
  // is direct evidence that the narrowing happens first.
  for (const key of ["constructor", "__proto__", "toString", "valueOf"]) {
    assert.equal(
      resolveContentPath(key),
      null,
      `resolveContentPath("${key}") must return null, not a prototype member`,
    );
  }
});

/* ── Map integrity ────────────────────────────────────────────────────── */

test("the map covers exactly the locales lib/locale.ts declares", () => {
  assert.deepEqual(
    Object.keys(CONTENT_FILE_BY_LOCALE).sort(),
    [...LOCALES].sort(),
    "a locale added to lib/locale.ts must also be given a content file here",
  );
});

test("every mapped value is contained in data/", () => {
  for (const value of Object.values(CONTENT_FILE_BY_LOCALE)) {
    assert.ok(
      !value.startsWith("/"),
      `"${value}" must be relative — an absolute path escapes the repo root`,
    );
    assert.ok(
      !value.split("/").includes(".."),
      `"${value}" must contain no parent-directory segment`,
    );
    assert.ok(value.startsWith("data/"), `"${value}" must live under data/`);
  }
});

test("the mapped files are distinct", () => {
  const values = Object.values(CONTENT_FILE_BY_LOCALE);
  assert.equal(
    new Set(values).size,
    values.length,
    `two locales share one content file: ${values.join(", ")}`,
  );
});
