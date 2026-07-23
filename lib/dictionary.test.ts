// lib/dictionary.test.ts
// CN-04 guard for lib/dictionary.ts.
//
// What this closes that `satisfies Record<Locale, ChromeStrings>` cannot:
// `satisfies` proves the two records are structurally identical. It cannot see
// that a `zh` value is still the English label — a copy-paste leaves the build
// green, the type check green, and an English nav rendered on a Chinese page.
// Every assertion below names the offending key in its message.
//
// The Simplified-character and mainland-vocabulary blocklists are IMPORTED from
// lib/translations.test.ts rather than redefined. A second, drifting copy is
// exactly how one half of the site's Chinese ends up ungoverned — and the lists
// have to live in a *.test.ts because scripts/subset-font.ts scans all of lib/
// except *.test.ts, so a plain module holding Simplified characters would ship
// those glyphs inside the font subset every visitor downloads.
//
// Side effect of that import, expected and harmless: node:test registers
// lib/translations.test.ts's own tests in this file's process too, so they are
// reported twice across a full `node --test` run.
//
// Node 26 invocation notes (see lib/blogRedirects.test.ts for precedent):
// - Run with bare `yarn test` / `node --test` — never `node --test <dir>`
//   (repo gotcha: Node treats the path as a script to require).
// - The relative imports below must use the exact on-disk extension
//   ("./dictionary" alone is rejected by Node's ESM resolver).
import test from "node:test";
import assert from "node:assert/strict";
import { DICTIONARY, t, type ChromeStrings } from "./dictionary.ts";
import {
  MAINLAND_TERM_BLOCKLIST,
  SIMPLIFIED_BLOCKLIST,
} from "./translations.test.ts";

const KEYS = Object.keys(DICTIONARY.en) as (keyof ChromeStrings)[];

// Keys whose Chinese form is legitimately free of Han characters. Enumerated
// rather than pattern-matched, so a genuinely untranslated label can never hide
// behind a rule: this list is short, and every entry needs a written reason.
const NON_CJK_ZH_KEYS: readonly (keyof ChromeStrings)[] = [
  // The autonym of the OTHER locale, shown in the switcher. On a Chinese page
  // the link out is labelled "EN" — an English page's own name, in Latin
  // letters, is the correct label in either locale (research/FEATURES.md:
  // show the language's own native name, never a flag).
  "localeOtherLabel",
];

// Correct Taiwan compounds that contain a blocked mainland term as a substring
// (演算法 contains 算法). Masked before the substring search so the check cannot
// false-positive on correct prose — same carve-out lib/translations.test.ts
// makes, kept in sync by hand because it is not exported.
const TAIWAN_COMPOUNDS_TO_MASK: readonly string[] = ["演算法"];

/* ── Helpers ──────────────────────────────────────────────────────────── */

// `for...of` over a string yields whole code points, so a character outside the
// BMP compares as itself rather than as two lone surrogates.
function hasHanCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint >= 0x3400 && codePoint <= 0x9fff) return true;
  }
  return false;
}

function maskTaiwanCompounds(value: string): string {
  let masked = value;
  for (const compound of TAIWAN_COMPOUNDS_TO_MASK) {
    masked = masked.split(compound).join("");
  }
  return masked;
}

/* ── Structure ────────────────────────────────────────────────────────── */

test("both locale records carry exactly the same keys", () => {
  assert.deepEqual(
    Object.keys(DICTIONARY.zh).sort(),
    Object.keys(DICTIONARY.en).sort(),
  );
});

test("the dictionary is not empty and every value is a plain string", () => {
  assert.ok(KEYS.length > 0, "DICTIONARY.en has no keys at all");
  for (const locale of ["en", "zh"] as const) {
    for (const key of KEYS) {
      assert.equal(
        typeof DICTIONARY[locale][key],
        "string",
        `${locale}.${key} must be a string — ChromeStrings is flat and string-only`,
      );
    }
  }
});

test("t() returns the record for the locale asked for", () => {
  assert.equal(t("en"), DICTIONARY.en);
  assert.equal(t("zh"), DICTIONARY.zh);
});

/* ── Translation completeness ─────────────────────────────────────────── */

test("every Chinese value differs from its English counterpart (CN-04)", () => {
  const untranslated = KEYS.filter(
    (key) => DICTIONARY.zh[key] === DICTIONARY.en[key],
  );
  assert.deepEqual(
    untranslated,
    [],
    `these keys still hold the English string in the zh record: ${untranslated.join(", ")}`,
  );
});

test("every Chinese value contains a Han character, except the enumerated allowlist (CN-04)", () => {
  const missing = KEYS.filter(
    (key) =>
      !NON_CJK_ZH_KEYS.includes(key) && !hasHanCharacter(DICTIONARY.zh[key]),
  );
  assert.deepEqual(
    missing,
    [],
    `these zh values contain no Han character (U+3400–U+9FFF) and are not on ` +
      `NON_CJK_ZH_KEYS: ${missing.join(", ")}`,
  );
});

test("every NON_CJK_ZH_KEYS entry is still a real key", () => {
  for (const key of NON_CJK_ZH_KEYS) {
    assert.ok(
      KEYS.includes(key),
      `NON_CJK_ZH_KEYS lists "${key}", which is no longer a ChromeStrings key — ` +
        "a dead exemption weakens the Han-character check",
    );
  }
});

test("no value in either record is empty or whitespace-only", () => {
  for (const locale of ["en", "zh"] as const) {
    for (const key of KEYS) {
      assert.ok(
        DICTIONARY[locale][key].trim().length > 0,
        `${locale}.${key} is empty or whitespace-only`,
      );
    }
  }
});

/* ── Taiwan-usage discipline (CN-05) ──────────────────────────────────── */

test("no Simplified character appears in any Chinese value", () => {
  const blocked = new Set(SIMPLIFIED_BLOCKLIST);
  for (const key of KEYS) {
    for (const character of DICTIONARY.zh[key]) {
      assert.ok(
        !blocked.has(character),
        `zh.${key} contains the Simplified character "${character}" ` +
          `(U+${character.codePointAt(0)?.toString(16).toUpperCase()})`,
      );
    }
  }
});

test("no mainland-vocabulary term appears in any Chinese value", () => {
  for (const key of KEYS) {
    const haystack = maskTaiwanCompounds(DICTIONARY.zh[key]);
    for (const term of MAINLAND_TERM_BLOCKLIST) {
      assert.ok(
        !haystack.includes(term),
        `zh.${key} uses the mainland term "${term}" — see research/PITFALLS.md ` +
          "Pitfall 8 for the Taiwan form",
      );
    }
  }
});

test("the résumé heading uses 履歷, and no value uses 簡歷 or 項目", () => {
  assert.ok(
    DICTIONARY.zh.resumeHeading.includes("履歷"),
    "zh.resumeHeading must use 履歷",
  );
  for (const key of KEYS) {
    for (const term of ["簡歷", "項目"]) {
      assert.ok(!DICTIONARY.zh[key].includes(term), `zh.${key} uses "${term}"`);
    }
  }
});
