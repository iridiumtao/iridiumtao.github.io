// scripts/generate-sitemap.ts
// Regenerates public/sitemap.xml on every predev/prebuild by reading the 8
// project slugs from data/portfolio.json and expanding them through
// lib/routeMap.ts's allRoutePairs() -- the single route enumeration the
// language switcher and the reciprocal hreflang <Head> tags also resolve
// through. There is deliberately no second list of routes here: re-enumerating
// them would create exactly the drifting source of truth this phase exists to
// eliminate.
//
// public/sitemap.xml is GENERATED build output, in the same class as
// public/resumes/*.pdf and public/fonts/open-huninn-subset.woff2 -- never
// hand-edit it; re-run this script (or `yarn dev` / `yarn build`) instead. It
// is nonetheless committed to the repo, matching how the font subset and the
// resume PDFs are handled, because .github/workflows/deploy.yml invokes the
// `next` binary directly and so bypasses the prebuild hook that would otherwise
// regenerate it (CLAUDE.md's CI note).
//
// DELIBERATELY ESM, unlike its neighbours scripts/subset-font.ts and
// scripts/prepare-resumes.ts, which are deliberately CommonJS: those two cannot
// `import` from lib/*.ts (ESM), so they carry no route table and no origin.
// This script must reuse lib/routeMap.ts's allRoutePairs() and lib/site.ts's
// SITE_ORIGIN rather than inline-duplicating either, so it is written as an ESM
// module -- top-level `import`, extension-exact relative specifiers, the JSON
// import attribute, and import.meta.dirname. Node content-detects ESM from the
// `import` statements, exactly as scripts/subset-font.test.ts and every
// lib/*.test.ts already run in this repo. Do not "fix" it back to CommonJS to
// match its neighbours -- they differ on purpose.
import fs from "node:fs";
import path from "node:path";
import { HTML_LANG } from "../lib/locale.ts";
import { allRoutePairs, STATIC_ROUTES } from "../lib/routeMap.ts";
import { SITE_ORIGIN } from "../lib/site.ts";
import portfolio from "../data/portfolio.json" with { type: "json" };

const outputPath = path.join(
  import.meta.dirname,
  "..",
  "public",
  "sitemap.xml",
);

// Absolute, SITE_ORIGIN-prefixed URL for a site-root-relative route path.
// SITE_ORIGIN is the canonical host (chun-ju.irilia.app), never hardcoded here.
const absolute = (routePath: string): string => `${SITE_ORIGIN}${routePath}`;

const slugs = portfolio.projects.map((project) => project.slug);

// allRoutePairs() returns the 404 pair too, because it is the route table, not
// the index policy. A 404 page must never be advertised in a sitemap, so it is
// filtered out here explicitly -- matched by its own en value from the same
// table rather than by a hardcoded "/404" string (T-06-29).
const notFoundEn = STATIC_ROUTES.notFound.en;
const pairs = allRoutePairs(slugs).filter((pair) => pair.en !== notFoundEn);

// One <url> per route (both locales of every non-404 pair), each declaring the
// reciprocal en/zh alternates -- the same shape components/wood/LocaleHead.tsx
// emits per page, sourced from the same route table. The x-default alternate
// (English, the root/default locale) is declared once per pair, on the English
// url, so search engines resolve every unpublished language to the English URL.
const urlEntries = pairs.flatMap((pair) => {
  const enAbs = absolute(pair.en);
  const zhAbs = absolute(pair.zh);
  const alternates = [
    `    <xhtml:link rel="alternate" hreflang="${HTML_LANG.en}" href="${enAbs}"/>`,
    `    <xhtml:link rel="alternate" hreflang="${HTML_LANG.zh}" href="${zhAbs}"/>`,
  ];
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${enAbs}"/>`;

  const enUrl = [
    "  <url>",
    `    <loc>${enAbs}</loc>`,
    ...alternates,
    xDefault,
    "  </url>",
  ].join("\n");

  const zhUrl = [
    "  <url>",
    `    <loc>${zhAbs}</loc>`,
    ...alternates,
    "  </url>",
  ].join("\n");

  return [enUrl, zhUrl];
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...urlEntries,
  "</urlset>",
  "",
].join("\n");

fs.writeFileSync(outputPath, xml);

console.log(
  `Wrote public/sitemap.xml: ${urlEntries.length} url entries from ${pairs.length} route pairs.`,
);
