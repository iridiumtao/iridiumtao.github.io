// components/wood/LocaleHead.tsx
// The single generator of every page's document head (SEO-02/04/06/07, D-07).
// No page hand-writes an SEO tag: canonical, the reciprocal hreflang set, the
// default-locale fallback link and the paired og:locale values are all derived
// here from lib/routeMap.ts and lib/locale.ts.
//
// Why one component rather than a <Head> per page: an hreflang set is only
// honoured if it is reciprocal, and Google discards a non-reciprocal set
// wholesale with no build error to catch it. Generating both sides of every
// pair from counterpartPath() — whose involution is proven by test in
// lib/routeMap.test.ts — makes reciprocity a property of one tested function
// instead of eighteen hand-written blocks that must agree by inspection.
//
// Locale tag strings are never spelled literally in this file. HTML_LANG holds
// the IETF tags for hreflang and OG_LOCALE holds the underscore-separated
// OpenGraph codes; the two must never be swapped, which is exactly why
// lib/locale.ts keeps them as separate records.
//
// lib/routeMap.ts is a pure lookup table with no filesystem access, so it is
// safe here. The server-only project data module is not, and is not imported.
import React from "react";
import Head from "next/head";
import { HTML_LANG, OG_LOCALE } from "../../lib/locale";
import type { Locale } from "../../lib/locale";
import { counterpartPath } from "../../lib/routeMap";
import { SITE_ORIGIN } from "../../lib/site";

/* ── Helpers ──────────────────────────────────────────────────────────── */

// The other member of the two-locale union. A lookup rather than a ternary so
// adding a third locale becomes a type error here instead of a silent wrong
// pairing.
const OTHER_LOCALE: Record<Locale, Locale> = {
  en: "zh",
  zh: "en",
};

// Absolute URL from a site-root-relative path. Both canonical and OpenGraph
// require absolute URLs, and SITE_ORIGIN is the canonical host — deliberately
// not the github.io one, which only redirects to it.
const absolute = (path: string): string => `${SITE_ORIGIN}${path}`;

/* ── Component ────────────────────────────────────────────────────────── */

export default function LocaleHead({
  locale,
  title,
  description,
  path,
  ogType = "website",
  ogImage,
}: {
  locale: Locale;
  /** Rendered as the sole text child of <title>. */
  title: string;
  description: string;
  /**
   * This page's own route in its own locale — leading-slash and, except the
   * 404 route, trailing-slash terminated (next.config.js sets trailingSlash).
   * Always a value produced by lib/routeMap.ts, never composed free-hand.
   */
  path: string;
  ogType?: "website" | "article";
  /** Site-root-relative image path; made absolute here. */
  ogImage?: string;
}) {
  const canonicalUrl = absolute(path);
  const counterpart = counterpartPath(path);

  // Which side of the pair is English is decided from `locale`, never by
  // inspecting the strings — the prefix belongs to lib/locale.ts alone.
  const englishUrl =
    counterpart === null
      ? null
      : absolute(locale === "en" ? path : counterpart);
  const chineseUrl =
    counterpart === null
      ? null
      : absolute(locale === "zh" ? path : counterpart);

  return (
    <Head>
      {/* Single text child. An array of children — or a sibling expression
          beside it — exports an EMPTY <title>; this repo shipped that bug once
          already, and here it would recur across every route at once. */}
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={description} />

      {/* Self-referencing, in this page's own locale. Exactly one per page;
          no two routes share a canonical URL because lib/routeMap.ts asserts
          its own uniqueness. */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Emitted only when a real counterpart exists. A self-referencing or
          dangling pair is worse than none at all: the whole set is thrown
          away, taking the valid half with it. */}
      {englishUrl !== null && chineseUrl !== null && (
        <>
          <link rel="alternate" hrefLang={HTML_LANG.en} href={englishUrl} />
          <link rel="alternate" hrefLang={HTML_LANG.zh} href={chineseUrl} />
          {/* English is the root locale, so it is also the fallback served to
              any language this site does not publish. */}
          <link rel="alternate" hrefLang="x-default" href={englishUrl} />
        </>
      )}

      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      {ogImage && <meta property="og:image" content={absolute(ogImage)} />}
      {/* Exactly one of each, and never the same value. Localized share images
          are out of scope this milestone, so ogImage is not locale-branched. */}
      <meta property="og:locale" content={OG_LOCALE[locale]} />
      <meta
        property="og:locale:alternate"
        content={OG_LOCALE[OTHER_LOCALE[locale]]}
      />
    </Head>
  );
}
