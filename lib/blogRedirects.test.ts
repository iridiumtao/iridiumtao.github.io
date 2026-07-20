// lib/blogRedirects.test.ts
// PROJ-07/D-08b verification: proves the old→new slug redirect map is
// complete (8 rows), stable (raw decoded keys copied verbatim from
// 03-RESEARCH.md's verified table — never derived from _posts/, which is
// deleted later this phase), and points only at real portfolio.json slugs.
//
// Node 26 invocation notes (see lib/projects.test.ts for precedent):
// - Run with bare `yarn test` / `node --test` — never `node --test <dir>`
//   (repo gotcha, treats the path as a script to require).
// - The relative import below must use the exact on-disk extension
//   ("./blogRedirects" alone is rejected by Node's ESM resolver).
import test from "node:test";
import assert from "node:assert/strict";
import { OLD_TO_NEW_SLUG } from "./blogRedirects.ts";
import portfolioData from "../data/portfolio.json" with { type: "json" };

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Hard-coded expected keys (raw decoded strings) — asserted against, never
// read from _posts/ (that directory is deleted later this phase, D-10).
const EXPECTED_KEYS = [
  "AI Editor-in-Chief and Virtual News Presenter",
  "iOS Development",
  "Loud Plants in Your Area",
  "Oblivilight - OpenHCI'25",
  "Retailpia",
  "RISC-V-Simulator",
  "Taigi (Taiwanese-Hokkien) Medical Advising LLM",
  "TW-COVID-Bot (Telegram Bot)",
];

test("OLD_TO_NEW_SLUG has exactly 8 keys", () => {
  const keys = Object.keys(OLD_TO_NEW_SLUG);
  assert.equal(keys.length, 8, `expected 8 keys, got ${keys.length}`);
});

test("OLD_TO_NEW_SLUG keys match the verified raw old-slug set exactly", () => {
  const keys = Object.keys(OLD_TO_NEW_SLUG).sort();
  assert.deepEqual(keys, [...EXPECTED_KEYS].sort());
});

test("OLD_TO_NEW_SLUG values all match SLUG_PATTERN", () => {
  for (const [oldSlug, newSlug] of Object.entries(OLD_TO_NEW_SLUG)) {
    assert.match(
      newSlug,
      SLUG_PATTERN,
      `value for "${oldSlug}" ("${newSlug}") must match ${SLUG_PATTERN}`,
    );
  }
});

test("OLD_TO_NEW_SLUG values are all real data/portfolio.json project slugs", () => {
  const realSlugs = new Set(portfolioData.projects.map((p) => p.slug));
  for (const [oldSlug, newSlug] of Object.entries(OLD_TO_NEW_SLUG)) {
    assert.ok(
      realSlugs.has(newSlug),
      `value for "${oldSlug}" ("${newSlug}") must be a real portfolio.json slug`,
    );
  }
});

test("Oblivilight key maps to the correct new slug", () => {
  assert.equal(
    OLD_TO_NEW_SLUG["Oblivilight - OpenHCI'25"],
    "openhci25-oblivilight",
  );
});
