// lib/portfolio.ts
// The single typed accessor for the site's content files (D-06), now keyed by
// locale (D-04). Import this instead of the raw JSON so a content edit that
// breaks the shape fails `yarn typecheck` here, in one place, rather than
// silently at a call site.
//
// Two files, one type (D-04): data/portfolio.json and data/portfolio.zh.json
// each carry their OWN `satisfies` line below, against the same type. That
// per-file check is the entire mechanism making a missing or renamed Chinese
// field a typecheck failure instead of a silent English render. Do not collapse
// the two checks into the BY_LOCALE annotation alone — a single wider
// annotation would absorb a structural mismatch — and do not add a `?? en`
// fallback anywhere in this module. There is no English fallback by design.
//
// Honest limit of `satisfies`: it proves STRUCTURAL completeness only. It
// cannot prove a Chinese value is actually Chinese rather than copy-pasted
// English. lib/translations.test.ts (plan 06-03) closes that gap mechanically
// — Simplified-character and mainland-vocabulary blocklists, key parity, and
// per-field divergence — and the owner's line-by-line revision pass (D-09) is
// final acceptance.
//
// The JSON import attribute is required for Node's native ESM loader (used
// directly by `node --test`) and remains valid under both tsc's "bundler"
// resolution and Next.js's build pipeline — same form as lib/projects.ts.
// Omitting it on either import breaks `node --test`, not `next build`, so it
// fails late.
import rawPortfolioDataEn from "../data/portfolio.json" with { type: "json" };
import rawPortfolioDataZh from "../data/portfolio.zh.json" with { type: "json" };
import type { PortfolioData } from "../types/portfolio";
// Extension-exact, and it MUST stay that way: this is the module's first
// runtime (non-type-only) relative import, so it is the first one Node's native
// ESM loader has to resolve when `node --test` pulls this file in through
// lib/projects.ts. A bare "./dictionary" typechecks and builds fine and fails
// only under `yarn test` — matching lib/projects.ts and lib/routeMap.ts.
import { t } from "./dictionary.ts";
import type { Locale } from "./locale";

// Compile-time checks only — no runtime validation by design (D-05: no new
// dependency, no i18n library). `satisfies` keeps the narrow inferred literal
// types intact while asserting each JSON file structurally matches
// PortfolioData independently of the other.
const portfolioDataEn = rawPortfolioDataEn satisfies PortfolioData;
const portfolioDataZh = rawPortfolioDataZh satisfies PortfolioData;

const BY_LOCALE: Record<Locale, PortfolioData> = {
  en: portfolioDataEn,
  zh: portfolioDataZh,
};

/**
 * Returns the content for one locale. The parameter is REQUIRED (LOC-03):
 * there is no default value, no optional marker, and no coalescing to English.
 * Calling getPortfolioData() with no argument is a type error, which is the
 * point — a caller that has not decided which locale it renders must not
 * silently get English.
 */
export function getPortfolioData(locale: Locale): PortfolioData {
  return BY_LOCALE[locale];
}

/**
 * The site's wordmark in one locale — the content file's `name`, a space, then
 * the dictionary's `brandSuffix`. Renders "Chun-Ju (Iridium) Tao" in English
 * and "Chun-Ju (Iridium) 歐東" in Chinese.
 *
 * This is the extraction of a composition that today appears VERBATIM in five
 * places: Nav.tsx, Footer.tsx, HomePage.tsx, ResumePage.tsx and
 * ProjectPage.tsx. Only LocaleHead and ProjectPage adopt the helper in this
 * pass — the other four are a deliberate follow-up, held back because sibling
 * tasks are editing those files concurrently and a rename collision there would
 * cost more than the duplication does. The partial adoption is a scheduling
 * decision, not an oversight; finish it when those files are free.
 *
 * No new dictionary key is involved: `brandSuffix` already carries the
 * localized half of the wordmark, so this adds no string and therefore no new
 * glyph to the font subset.
 *
 * Importing `t` here is cycle-free: dictionary.ts imports only ./locale.
 */
export function wordmark(locale: Locale): string {
  return `${BY_LOCALE[locale].name} ${t(locale).brandSuffix}`;
}
