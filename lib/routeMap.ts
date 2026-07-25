// lib/routeMap.ts
// The single source of counterpart URLs between the English and Chinese route
// trees (D-06). The language switcher, the reciprocal hreflang pairs (D-07) and
// the sitemap all resolve "what is this page called in the other locale?"
// through this one module — never by concatenating "/zh" or by .replace() at a
// call site. Reciprocity is then a property of one tested function instead of
// eighteen hand-written <Head> blocks, which matters because a non-reciprocal
// hreflang set is discarded wholesale by Google with no build error to catch it.
//
// Hard-coded, following the repo's existing old-slug redirect table: this map
// must not depend on any directory surviving, and the static routes are a
// closed set the compiler can see. The locale prefix itself is never spelled
// here — it comes from lib/locale.ts's withLocale(), the only module allowed to
// know it.
//
// Lookup discipline: exact ASCII string equality on trailing-slash-terminated
// paths. No case-folding, no percent-decoding, no Unicode normalization. Every
// caller passes a path this repo generated, so a path that does not match
// byte-for-byte is drift, not a near-miss to be repaired.
//
// The legacy /blog/<slug>/ redirect shims are deliberately absent: they are
// English-only redirects with no Chinese counterpart, and the old-slug redirect
// module in lib/ stays their sole owner.
import { type Locale, withLocale } from "./locale.ts";

/* ── Helpers ──────────────────────────────────────────────────────────── */

// Same kebab-case guard lib/projects.ts uses as its path-traversal fence, kept
// literal here rather than imported: lib/projects.ts is server-only (runtime
// assertServerOnly() + an ESLint no-restricted-imports rule), and this module
// must stay importable from components/wood/*.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// English-rooted base for the showcase route family. withLocale() adds the
// prefix; nothing here concatenates "/zh".
const PROJECTS_BASE = "/projects/";

// Builds the { en, zh } pair for one English-rooted path.
const pair = (path: string): RoutePair => ({
  en: path,
  zh: withLocale("zh", path),
});

/**
 * Extracts the slug from a `/projects/<slug>/` (or `/zh/projects/<slug>/`)
 * path, or null when `path` is not a well-formed showcase route in `locale`.
 *
 * The slug segment is validated against SLUG_PATTERN before it is accepted, so
 * a traversal-shaped path ("/projects/../../etc/passwd/") is rejected rather
 * than echoed back inside a composed URL (T-06-05).
 */
function projectSlugFrom(path: string, locale: Locale): string | null {
  const base = withLocale(locale, PROJECTS_BASE);
  if (!path.startsWith(base)) return null;
  const rest = path.slice(base.length);
  if (!rest.endsWith("/")) return null;
  const slug = rest.slice(0, -1);
  return SLUG_PATTERN.test(slug) ? slug : null;
}

/* ── Route table ──────────────────────────────────────────────────────── */

export type StaticRouteKey = "home" | "resume" | "notFound";

export type RoutePair = { en: string; zh: string };

// Iteration order for allRoutePairs(). Written out so the sitemap's row order
// is a decision, not whatever Object.keys() happens to return.
const STATIC_ROUTE_ORDER: readonly StaticRouteKey[] = [
  "home",
  "resume",
  "notFound",
];

// Every value here ends in "/" except the two 404 entries, because
// next.config.js sets trailingSlash: true and each route therefore exports as
// route/index.html.
//
// The 404 exception is deliberate and verified against a real export: the build
// emits BOTH out/404.html and out/404/index.html (byte-identical). GitHub Pages
// serves the bare out/404.html for an unknown path, so "/404" — the form that
// names the file actually served — is the one this table records.
export const STATIC_ROUTES: Record<StaticRouteKey, RoutePair> = {
  home: pair("/"),
  resume: pair("/resume/"),
  notFound: pair("/404"),
};

// Flattened both-directions lookup, built once from STATIC_ROUTES so the two
// can never disagree.
const STATIC_COUNTERPARTS: ReadonlyMap<string, string> = new Map(
  STATIC_ROUTE_ORDER.flatMap((key) => {
    const route = STATIC_ROUTES[key];
    return [
      [route.en, route.zh],
      [route.zh, route.en],
    ] as [string, string][];
  }),
);

/* ── Public API ───────────────────────────────────────────────────────── */

/**
 * The showcase route for one project slug in one locale:
 * projectPath("en", "retailpia") → /projects/retailpia/
 * projectPath("zh", "retailpia") → /zh/projects/retailpia/
 *
 * Throws on a slug that is not kebab-case. Callers are this repo's own build
 * steps reading slugs out of data/portfolio.json, so throw-on-drift matches
 * withLocale()'s posture: a malformed slug is a content bug that should fail
 * the build loudly, not a link that silently 404s.
 */
export function projectPath(locale: Locale, slug: string): string {
  if (!SLUG_PATTERN.test(slug)) {
    throw new TypeError(
      `projectPath: \`slug\` must be kebab-case, received "${slug}".`,
    );
  }
  return withLocale(locale, `${PROJECTS_BASE}${slug}/`);
}

/**
 * Resolves a path to its counterpart in the other locale, in BOTH directions,
 * or null when there is no counterpart.
 *
 * null — never "/" and never "/zh/". D-06 requires the switcher to land the
 * visitor on the counterpart of the page they were reading; a homepage default
 * would turn "we have no translation of this page" into a silent teleport, and
 * a caller that receives null can render nothing instead.
 *
 * Returns null for: an unknown path, the empty string, a differently-cased path
 * ("/RESUME/"), a legacy /blog/<slug>/ redirect, and any /projects/ path whose
 * slug segment is not kebab-case.
 */
export function counterpartPath(path: string): string | null {
  const staticCounterpart = STATIC_COUNTERPARTS.get(path);
  if (staticCounterpart !== undefined) return staticCounterpart;

  const enSlug = projectSlugFrom(path, "en");
  if (enSlug !== null) return projectPath("zh", enSlug);

  const zhSlug = projectSlugFrom(path, "zh");
  if (zhSlug !== null) return projectPath("en", zhSlug);

  return null;
}

/**
 * Every { en, zh } route pair the site publishes: the three static pairs first,
 * then one pair per slug in the order given. Consumed by the sitemap generator
 * and by the hreflang wiring, both of which need the full set rather than one
 * page's counterpart.
 *
 * The 404 pair is included because this is the route table, not the index
 * policy — a consumer that must not list it (a sitemap) filters it out
 * explicitly rather than relying on it being absent.
 *
 * Fresh objects are returned, so a consumer that mutates a pair cannot reach
 * back into STATIC_ROUTES.
 */
export function allRoutePairs(slugs: readonly string[]): RoutePair[] {
  return [
    ...STATIC_ROUTE_ORDER.map((key) => ({ ...STATIC_ROUTES[key] })),
    ...slugs.map((slug) => ({
      en: projectPath("en", slug),
      zh: projectPath("zh", slug),
    })),
  ];
}
