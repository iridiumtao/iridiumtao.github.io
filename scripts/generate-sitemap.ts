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

// THE ONE SWITCH FOR THE CHINESE ROUTES. Flip to `true` and re-run this script
// (or `yarn dev` / `yarn build`) to start advertising /zh/ again -- nothing else
// needs editing.
//
// It is `false` because the Chinese tree is soft-launched: it ships and is
// reachable, but the EN/中 switcher is deliberately hidden
// (SHOW_LANGUAGE_SWITCHER in components/wood/LanguageSwitcher.tsx), so the site
// is not yet inviting anyone into it. A sitemap that lists those URLs is
// precisely such an invitation, so the sitemap must stay quiet about them until
// the owner says otherwise.
//
// When closed, this drops the hreflang <xhtml:link> alternates ENTIRELY, not
// just the Chinese one. A lone self-referential English alternate plus an
// x-default with no other language to default away from says nothing, and any
// alternate naming a /zh URL would hand a crawler that URL just as effectively
// as a <loc> would -- which is the whole thing being switched off here.
//
// Scope: this gate governs public/sitemap.xml and nothing else. lib/routeMap.ts
// still enumerates both locales (it is the route table, not the index policy,
// exactly as with the 404 pair above) and components/wood/LocaleHead.tsx still
// emits per-page hreflang alternates. Silencing those is a separate decision.
//
// The `: boolean` annotation is load-bearing: without it TypeScript infers the
// literal type `false`, narrows the enabled branch to dead code, and flipping
// the value would then be a type change rather than a one-word edit.
const PUBLISH_ZH_ROUTES: boolean = true;

// With PUBLISH_ZH_ROUTES open: one <url> per route (both locales of every
// non-404 pair), each declaring the reciprocal en/zh alternates -- the same
// shape components/wood/LocaleHead.tsx emits per page, sourced from the same
// route table. The x-default alternate (English, the root/default locale) is
// declared once per pair, on the English url, so search engines resolve every
// unpublished language to the English URL.
//
// With it closed: the English <loc> alone, no alternates. See the flag above.
const urlEntries = pairs.flatMap((pair) => {
  const enAbs = absolute(pair.en);

  if (!PUBLISH_ZH_ROUTES) {
    return [["  <url>", `    <loc>${enAbs}</loc>`, "  </url>"].join("\n")];
  }

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
