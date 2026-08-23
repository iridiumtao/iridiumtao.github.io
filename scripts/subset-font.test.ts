// scripts/subset-font.test.ts
// D-04 cmap regression guard: reads every real Traditional-Chinese content
// source the site ships -- data/portfolio.zh.json, all nine _projects/*.zh.md
// showcase bodies, lib/dictionary.ts's UI-chrome strings, and every file under
// pages/zh/ -- plus pages/cjk-specimen.page.tsx (still the site's declared CJK
// glyph floor, even though the site does not link it), and asserts every
// non-ASCII code point any of them contains has a glyph in the committed
// subsetted font's cmap.
//
// Until phase 6 this guard read ONLY pages/cjk-specimen.page.tsx, an unlinked
// proof page, so it stayed green no matter what real /zh/ content shipped --
// exactly the failure mode where the build passes while real Chinese glyphs are
// missing from the subset. It now covers the real content, and additionally
// asserts its own collected-file COUNT against an expected constant, so a
// Chinese content file added under _projects/ or pages/zh/ changes the count
// and fails this test rather than slipping past it -- the precise gap
// PITFALLS.md flags as staying green while glyphs go missing.
//
// Run via bare `yarn test` (`node --test` discovery); never `node --test <dir>`
// (repo gotcha). `yarn test` runs a `pretest` hook that regenerates the subset
// first, so the run always grades fresh output rather than a stale committed
// woff2. Bare `node --test` bypasses that hook, which is why the existence
// assertion below spells out the recovery command instead of letting
// fs.readFileSync throw a bare ENOENT.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { create } from "fontkit"; // fontkit 2.x is ESM with no default export
import type { Font, FontCollection } from "fontkit";

// create() types as Font | FontCollection (a woff2 could in principle be a
// TrueType collection). A single-face woff2 -- what subset-font.ts always
// produces -- is a Font, never a FontCollection; assert that shape via a
// proper type-predicate assertion function (rather than an unchecked cast)
// so the test fails loudly if that assumption is ever wrong.
function assertIsSingleFont(
  font: Font | FontCollection,
): asserts font is Font {
  assert.ok(
    font.type !== "TTC" && font.type !== "DFont",
    `expected a single Font, got a FontCollection (type "${font.type}") -- subset-font.ts should never produce one`,
  );
}

// This file contains `import` statements, so Node's default-CJS detection
// reparses it as ESM at run time (see the MODULE_TYPELESS_PACKAGE_JSON
// warning). ESM scope has no CommonJS dirname global; import.meta.dirname
// (Node >= 20.11) is the ESM-safe path base used for every constant below.
const ROOT = path.join(import.meta.dirname, "..");

// Recursively collect files under `dir` whose basename passes `matches`. No
// glob dependency exists in this project, mirroring scripts/subset-font.ts's
// own manual walk.
function collectFiles(
  dir: string,
  matches: (name: string) => boolean,
): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, matches));
    } else if (entry.isFile() && matches(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

// The named single-file sources: the specimen glyph floor plus the two content
// sources that live at a fixed path (the Chinese JSON and the UI-chrome
// dictionary). The per-directory content families are walked below.
const SINGLE_SOURCES = [
  path.join(ROOT, "pages", "cjk-specimen.page.tsx"),
  path.join(ROOT, "data", "portfolio.zh.json"),
  path.join(ROOT, "lib", "dictionary.ts"),
];
const PROJECT_BODIES = collectFiles(path.join(ROOT, "_projects"), (name) =>
  name.endsWith(".zh.md"),
);
const ZH_PAGES = collectFiles(path.join(ROOT, "pages", "zh"), () => true);
const SOURCES = [...SINGLE_SOURCES, ...PROJECT_BODIES, ...ZH_PAGES];

// cjk-specimen + data/portfolio.zh.json + lib/dictionary.ts (3) +
// 9 _projects/*.zh.md + 4 files under pages/zh/ (404, index, resume,
// projects/[slug]) = 16. Pinned so a new Chinese content file under _projects/
// or pages/zh/ trips the count assertion, forcing whoever adds it to update
// this constant AND confirm the regenerated subset covers its glyphs.
const EXPECTED_SOURCE_COUNT = 16;

const FONT = path.join(
  ROOT,
  "public",
  "fonts",
  "open-huninn-subset.woff2",
);

test("the Chinese content source set has its expected file count", () => {
  assert.equal(
    SOURCES.length,
    EXPECTED_SOURCE_COUNT,
    `expected ${EXPECTED_SOURCE_COUNT} Chinese content source files, collected ${SOURCES.length}:\n  ${SOURCES.join(
      "\n  ",
    )}\nIf you added or removed a Chinese content file under _projects/ or pages/zh/, update EXPECTED_SOURCE_COUNT and re-run \`node scripts/subset-font.ts\` so the subset covers its glyphs.`,
  );
});

test("every non-ASCII glyph in real /zh/ content is present in the subset cmap", () => {
  // > 0x7F isolates real content glyphs from ASCII import/JSX syntax; mirrors
  // subset-font.ts's own union semantics (it unions printable ASCII 0x20-0x7E
  // separately). NOT >= 0x3000 -- that gate would skip the U+2014 em dash and
  // U+2026 ellipsis that both the content and the specimen deliberately use.
  const codepoints = new Set<number>();
  for (const file of SOURCES) {
    const src = fs.readFileSync(file, "utf8");
    for (const ch of src) {
      const cp = ch.codePointAt(0)!;
      if (cp > 0x7f) codepoints.add(cp);
    }
  }

  // An emptied or mis-globbed source set must not pass vacuously: fail if no
  // files were collected, and fail if the collected files yield no glyphs.
  assert.ok(
    SOURCES.length > 0,
    "collected zero Chinese content source files -- the source set is empty or mis-globbed",
  );
  assert.ok(
    codepoints.size > 0,
    "collected zero non-ASCII code points from the Chinese content set -- an emptied or mis-globbed source set must not pass vacuously",
  );

  assert.ok(
    fs.existsSync(FONT),
    `${FONT} missing -- run \`node scripts/subset-font.ts\` first (or \`yarn test\`, whose pretest hook does it for you)`,
  );

  const font = create(fs.readFileSync(FONT));
  assertIsSingleFont(font);
  const missing = [...codepoints].filter(
    (cp) => !font.hasGlyphForCodePoint(cp),
  );
  assert.deepEqual(
    missing.map((cp) => `U+${cp.toString(16).toUpperCase()}`),
    [],
    `subset is missing glyphs for: ${missing
      .map((cp) => `U+${cp.toString(16).toUpperCase()}`)
      .join(", ")}`,
  );
});
