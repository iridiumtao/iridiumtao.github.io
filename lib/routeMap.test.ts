// lib/routeMap.test.ts
// SW-03/D-06/D-07 verification for lib/routeMap.ts.
//
// The assertion that earns this file: counterpartPath must be an INVOLUTION
// over every real route — counterpartPath(counterpartPath(x)) === x for all 22
// of them. A one-way hreflang pair is the failure mode Google discards silently
// and wholesale, with no build error and nothing visibly wrong on the page, so
// reciprocity has to be proven mechanically here rather than trusted per page.
//
// Node 26 invocation notes (see lib/blogRedirects.test.ts for precedent):
// - Run with bare `yarn test` / `node --test` — never `node --test <dir>`
//   (repo gotcha: Node treats the path as a script to require).
// - The relative import below must use the exact on-disk extension
//   ("./routeMap" alone is rejected by Node's ESM resolver), and the JSON
//   import needs the `with { type: "json" }` attribute.
import test from "node:test";
import assert from "node:assert/strict";
import {
  STATIC_ROUTES,
  allRoutePairs,
  counterpartPath,
  projectPath,
} from "./routeMap.ts";
import portfolioData from "../data/portfolio.json" with { type: "json" };

// The real slugs, read from the content file rather than hardcoded: a 9th
// project added later must be covered by the reciprocity proof automatically.
const SLUGS: readonly string[] = portfolioData.projects.map((p) => p.slug);

const ALL_PAIRS = allRoutePairs(SLUGS);

// The two 404 entries are the documented trailing-slash exception (the export
// emits out/404.html, which is the file GitHub Pages serves for unknown paths).
const NO_TRAILING_SLASH = [
  STATIC_ROUTES.notFound.en,
  STATIC_ROUTES.notFound.zh,
];

/* ── Reciprocity ──────────────────────────────────────────────────────── */

test("counterpartPath resolves every route in both directions (D-06)", () => {
  for (const routePair of ALL_PAIRS) {
    assert.equal(
      counterpartPath(routePair.en),
      routePair.zh,
      `counterpartPath("${routePair.en}") must resolve to "${routePair.zh}"`,
    );
    assert.equal(
      counterpartPath(routePair.zh),
      routePair.en,
      `counterpartPath("${routePair.zh}") must resolve to "${routePair.en}"`,
    );
  }
});

test("counterpartPath is an involution over every real route — reciprocity round-trip (D-07)", () => {
  for (const routePair of ALL_PAIRS) {
    for (const path of [routePair.en, routePair.zh]) {
      const counterpart = counterpartPath(path);
      assert.notEqual(
        counterpart,
        null,
        `reciprocity broken: "${path}" has no counterpart at all`,
      );
      assert.equal(
        counterpartPath(counterpart as string),
        path,
        `reciprocity broken: the round-trip "${path}" -> "${counterpart}" -> ` +
          `"${counterpartPath(counterpart as string)}" does not return to "${path}". ` +
          "A non-reciprocal hreflang pair is discarded silently by Google.",
      );
    }
  }
});

/* ── Totality ─────────────────────────────────────────────────────────── */

test("allRoutePairs returns exactly 3 static pairs plus one per slug", () => {
  assert.equal(
    ALL_PAIRS.length,
    3 + SLUGS.length,
    `expected ${3 + SLUGS.length} pairs, got ${ALL_PAIRS.length}`,
  );
});

test("allRoutePairs emits no duplicate en or zh route", () => {
  const enRoutes = ALL_PAIRS.map((p) => p.en);
  const zhRoutes = ALL_PAIRS.map((p) => p.zh);
  assert.equal(
    new Set(enRoutes).size,
    enRoutes.length,
    `duplicate English route in: ${enRoutes.join(", ")}`,
  );
  assert.equal(
    new Set(zhRoutes).size,
    zhRoutes.length,
    `duplicate Chinese route in: ${zhRoutes.join(", ")}`,
  );
});

test("STATIC_ROUTES holds exactly the three static keys", () => {
  assert.deepEqual(Object.keys(STATIC_ROUTES).sort(), [
    "home",
    "notFound",
    "resume",
  ]);
});

test("no English route is also a Chinese route", () => {
  const enRoutes = new Set(ALL_PAIRS.map((p) => p.en));
  for (const routePair of ALL_PAIRS) {
    assert.ok(
      !enRoutes.has(routePair.zh),
      `"${routePair.zh}" appears as both an English and a Chinese route`,
    );
  }
});

/* ── Trailing slash ───────────────────────────────────────────────────── */

test("every route value ends in / except the two 404 entries (trailingSlash: true)", () => {
  for (const routePair of ALL_PAIRS) {
    for (const path of [routePair.en, routePair.zh]) {
      if (NO_TRAILING_SLASH.includes(path)) continue;
      assert.ok(
        path.endsWith("/"),
        `"${path}" must end in "/" — next.config.js sets trailingSlash: true`,
      );
    }
  }
});

test("the 404 entries are the only routes without a trailing slash", () => {
  assert.deepEqual(NO_TRAILING_SLASH, ["/404", "/zh/404"]);
});

/* ── Null cases ───────────────────────────────────────────────────────── */

test("counterpartPath returns null — never a homepage default — for unmapped paths (D-06)", () => {
  const unmapped = [
    "", // empty string
    "/blog/tw-covid-bot/", // legacy English-only redirect shim
    "/RESUME/", // exact ASCII equality: no case-folding
    "/projects/../../etc/passwd/", // traversal shape, rejected by SLUG_PATTERN
    "/zh/projects/Not-A-Slug/", // uppercase slug segment
    "/projects/", // no slug at all
    "/resume", // missing trailing slash
    "/cjk-specimen/", // a real route with no Chinese counterpart
  ];
  for (const path of unmapped) {
    assert.equal(
      counterpartPath(path),
      null,
      `counterpartPath("${path}") must return null, not a fallback route`,
    );
  }
});

/* ── Prefix precision ─────────────────────────────────────────────────── */

test("counterpartPath does not read /zhuangzi/ as a Chinese route", () => {
  assert.equal(counterpartPath("/zhuangzi/"), null);
  assert.equal(counterpartPath("/zh-hant/"), null);
});

/* ── projectPath ──────────────────────────────────────────────────────── */

test("projectPath builds both locales' showcase routes", () => {
  assert.equal(projectPath("en", "retailpia"), "/projects/retailpia/");
  assert.equal(projectPath("zh", "retailpia"), "/zh/projects/retailpia/");
});

test("projectPath throws on a slug that is not kebab-case (T-06-05)", () => {
  assert.throws(() => projectPath("en", "../../etc/passwd"), TypeError);
  assert.throws(() => projectPath("zh", "Not-A-Slug"), TypeError);
});
