// lib/locale.test.ts
// LOC-01/SEO-01 verification for lib/locale.ts: proves localeFromPathname's
// prefix boundary in both directions (/zh matches, /zhuangzi does not),
// proves withLocale respects trailingSlash: true at the root path and throws
// on a relative path, and pins the two locale codes D-07 fixed.
//
// Node 26 invocation notes (see lib/blogRedirects.test.ts for precedent):
// - Run with bare `yarn test` / `node --test` — never `node --test <dir>`
//   (repo gotcha: Node treats the path as a script to require).
// - The relative import below must use the exact on-disk extension
//   ("./locale" alone is rejected by Node's ESM resolver).
import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_LOCALE,
  HTML_LANG,
  LOCALES,
  LOCALE_PREFIX,
  OG_LOCALE,
  isLocale,
  localeFromPathname,
  withLocale,
} from "./locale.ts";

test("LOCALES holds exactly the two locales, English first", () => {
  assert.deepEqual([...LOCALES], ["en", "zh"]);
  assert.equal(DEFAULT_LOCALE, "en");
});

test("LOCALE_PREFIX leaves English unprefixed at the site root", () => {
  assert.equal(LOCALE_PREFIX.en, "");
  assert.equal(LOCALE_PREFIX.zh, "/zh");
});

test("HTML_LANG and OG_LOCALE carry the codes D-07 fixed", () => {
  assert.equal(HTML_LANG.en, "en");
  assert.equal(HTML_LANG.zh, "zh-Hant-TW");
  assert.equal(OG_LOCALE.en, "en_US");
  assert.equal(OG_LOCALE.zh, "zh_TW");
});

test("HTML_LANG and OG_LOCALE never share a value", () => {
  // og:locale takes underscore codes, <html lang> takes IETF tags. Handing
  // one the other's value is the silent failure this assertion catches.
  assert.notEqual(HTML_LANG.zh, OG_LOCALE.zh);
  assert.notEqual(HTML_LANG.en, OG_LOCALE.en);
});

test("isLocale narrows only the exact two members", () => {
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("zh"), true);
  for (const value of [
    "ZH",
    "zh-Hant-TW",
    "zh_TW",
    "",
    " zh",
    undefined,
    null,
    0,
    {},
  ]) {
    assert.equal(isLocale(value), false, `isLocale(${String(value)})`);
  }
});

test("localeFromPathname returns zh on the /zh route tree", () => {
  assert.equal(localeFromPathname("/zh"), "zh");
  assert.equal(localeFromPathname("/zh/"), "zh");
  assert.equal(localeFromPathname("/zh/resume"), "zh");
  assert.equal(localeFromPathname("/zh/projects/[slug]"), "zh");
  assert.equal(localeFromPathname("/zh/404"), "zh");
});

test("localeFromPathname returns en on the English route tree", () => {
  assert.equal(localeFromPathname("/"), "en");
  assert.equal(localeFromPathname("/resume"), "en");
  assert.equal(localeFromPathname("/projects/[slug]"), "en");
});

test("localeFromPathname does not match a /zh-prefixed word", () => {
  // The boundary that matters: only the exact segment counts, never a
  // substring of a longer first segment.
  assert.equal(localeFromPathname("/zhuangzi"), "en");
  assert.equal(localeFromPathname("/zh-hant"), "en");
  assert.equal(localeFromPathname("/zhang/zh"), "en");
});

test("localeFromPathname is case-sensitive ASCII", () => {
  // No case-folding and no Unicode normalization by design — a mis-cased
  // route is a routing bug to surface, not something to silently accept.
  assert.equal(localeFromPathname("/ZH/"), "en");
  assert.equal(localeFromPathname("/Zh"), "en");
});

test("localeFromPathname falls back to en rather than throwing", () => {
  // Safe-fallback posture: the input is Next's ctx.pathname, framework
  // machinery this repo does not control.
  assert.equal(localeFromPathname(undefined), DEFAULT_LOCALE);
  assert.equal(localeFromPathname(""), DEFAULT_LOCALE);
  assert.equal(localeFromPathname("zh"), DEFAULT_LOCALE);
  assert.equal(localeFromPathname("not a path"), DEFAULT_LOCALE);
});

test("withLocale leaves English paths untouched", () => {
  assert.equal(withLocale("en", "/"), "/");
  assert.equal(withLocale("en", "/resume/"), "/resume/");
  assert.equal(
    withLocale("en", "/projects/retailpia/"),
    "/projects/retailpia/",
  );
});

test("withLocale prefixes Chinese paths and keeps the trailing slash", () => {
  // next.config.js sets trailingSlash: true, so the root case must stay
  // "/zh/" — "/zh" would 308-redirect on the live site.
  assert.equal(withLocale("zh", "/"), "/zh/");
  assert.equal(withLocale("zh", "/resume/"), "/zh/resume/");
  assert.equal(
    withLocale("zh", "/projects/retailpia/"),
    "/zh/projects/retailpia/",
  );
});

test("withLocale round-trips through localeFromPathname", () => {
  for (const locale of LOCALES) {
    assert.equal(localeFromPathname(withLocale(locale, "/resume/")), locale);
  }
});

test("withLocale throws a TypeError naming the offending path", () => {
  for (const bad of ["", "resume", "./resume", "https://example.com/"]) {
    assert.throws(
      () => withLocale("zh", bad),
      (error: unknown) =>
        error instanceof TypeError && error.message.includes("path"),
      `withLocale("zh", ${JSON.stringify(bad)}) should throw`,
    );
  }
});
