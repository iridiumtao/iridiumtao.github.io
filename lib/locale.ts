// lib/locale.ts
// The single definition of locale identity for the whole site (D-01). Every
// other module imports `Locale` from here rather than re-spelling the locale
// codes — the IETF language tag and the OpenGraph locale codes (D-07) are
// written out exactly once each, in HTML_LANG and OG_LOCALE below, and
// nowhere else in .ts/.tsx. The one documented exception is
// styles/globals.css's html[lang=...] selector: a stylesheet cannot import a
// TypeScript constant, so it must spell the tag literally.
//
// Note the two distinct spellings of "Chinese" this module keeps apart, and
// why: the Locale member "zh" is the URL segment and the content-file suffix
// (/zh/resume/, _projects/<slug>.zh.md), while HTML_LANG.zh is the language
// tag served to browsers and crawlers. Separating them is what stops a route
// prefix from ever drifting into an html lang attribute.

// The two-member literal union. Closed on purpose: a value that is not
// exactly "en" or "zh" cannot reach <Html lang> or a href builder.
export type Locale = "en" | "zh";

export const LOCALES: readonly Locale[] = ["en", "zh"];

// English is the root locale — unprefixed at /, and the fallback whenever a
// locale cannot be determined from external input.
export const DEFAULT_LOCALE: Locale = "en";

// URL/path prefix per locale. English is deliberately the empty string so
// withLocale() is a plain concatenation with no per-locale branching.
export const LOCALE_PREFIX: Record<Locale, string> = {
  en: "",
  zh: "/zh",
};

// The values consumed by <Html lang> and by <link rel="alternate" hreflang>
// (SEO-01, D-07). Traditional Chinese as written in Taiwan, hence Hant + TW.
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  zh: "zh-Hant-TW",
};

// OpenGraph uses underscore-separated language_TERRITORY codes, not IETF
// language tags — og:locale must never be handed HTML_LANG's value (D-07).
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  zh: "zh_TW",
};

/**
 * Narrows an unknown value to Locale. Exact ASCII string equality — no
 * case-folding, no Unicode normalization, no trimming.
 */
export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "zh";
}

/**
 * Derives the locale from a Next route pathname (e.g. /zh/projects/[slug]).
 *
 * Matches only the exact segment /zh or a /zh/ prefix, so /zhuangzi stays
 * English. Comparison is exact ASCII: /ZH/ is NOT Chinese.
 *
 * Safe-fallback posture, not throw-on-drift: the caller is
 * pages/_document.page.tsx feeding it Next's own ctx.pathname, which is
 * framework machinery rather than a repo invariant. An undefined, empty, or
 * malformed value returns DEFAULT_LOCALE and never throws.
 */
export function localeFromPathname(pathname: string | undefined): Locale {
  if (typeof pathname !== "string") return DEFAULT_LOCALE;
  const prefix = LOCALE_PREFIX.zh;
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return "zh";
  return DEFAULT_LOCALE;
}

/**
 * Prefixes an English-rooted, leading-slash path with the locale's prefix:
 * withLocale("zh", "/resume/") returns /zh/resume/; withLocale("en", "/")
 * returns /.
 *
 * next.config.js sets trailingSlash: true, so the caller's trailing slash is
 * preserved verbatim — withLocale("zh", "/") returns /zh/, not /zh.
 *
 * Throws on a path that does not begin with a slash. Unlike
 * localeFromPathname, this input comes from this repo's own call sites, so
 * throw-on-drift is the correct posture: a relative href would silently
 * resolve against whatever route happened to render it.
 */
export function withLocale(locale: Locale, path: string): string {
  if (!path.startsWith("/")) {
    throw new TypeError(
      `withLocale: \`path\` must begin with a slash, received "${path}". ` +
        "Pass the English-rooted absolute path, e.g. /resume/.",
    );
  }
  return `${LOCALE_PREFIX[locale]}${path}`;
}
