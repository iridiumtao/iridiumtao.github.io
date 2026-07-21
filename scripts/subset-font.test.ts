// scripts/subset-font.test.ts
// D-04 cmap regression guard: reads the CJK proof page's own source (the
// single source of truth for the site's CJK glyph floor, see
// pages/cjk-specimen.page.tsx) and asserts every non-ASCII code point it
// contains is present in the committed subsetted font's cmap. This closes the
// gap subset-font.ts's own zero-file hard-fail cannot see: if the scan scope
// drifts but still matches other files, the buckets stay non-empty, the build
// stays green, and the CJK glyphs silently disappear anyway -- the Phase 4
// failure mode (15296 B -> 14804 B). Run via bare `yarn test` (`node --test`
// discovery); never `node --test <dir>` (repo gotcha). `yarn test` runs a
// `pretest` hook that regenerates the subset first, so the run always grades
// fresh output rather than a stale committed woff2. Bare `node --test` bypasses
// that hook, which is why the existence assertion below spells out the recovery
// command instead of letting fs.readFileSync throw a bare ENOENT.
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
// warning) -- `__dirname` is unavailable in ESM scope; `import.meta.dirname`
// (Node >= 20.11) is the ESM-safe equivalent.
const PROOF_PAGE = path.join(
  import.meta.dirname,
  "..",
  "pages",
  "cjk-specimen.page.tsx",
);
const FONT = path.join(
  import.meta.dirname,
  "..",
  "public",
  "fonts",
  "open-huninn-subset.woff2",
);

test("every non-ASCII glyph on the CJK proof page is present in the subset cmap", () => {
  const src = fs.readFileSync(PROOF_PAGE, "utf8");

  // > 0x7F isolates specimen glyphs from ASCII import/JSX syntax; mirrors
  // subset-font.ts's own union semantics (it unions in printable ASCII
  // 0x20-0x7E separately). NOT >= 0x3000 -- that gate would skip the U+2014
  // em dash and U+2026 ellipsis the specimen deliberately includes.
  const codepoints = new Set<number>();
  for (const ch of src) {
    const cp = ch.codePointAt(0)!;
    if (cp > 0x7f) codepoints.add(cp);
  }
  assert.ok(
    codepoints.size > 0,
    "proof page has no non-ASCII specimen text -- specimen must not be empty/ASCII-only",
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
