// lib/personJsonLd.test.ts
// GH-3 / D-5 / D-7 / D-8 verification for lib/personJsonLd.ts.
//
// The assertion that earns this file: every emitted property value must be
// derivable from data/portfolio.json or data/portfolio.zh.json. The structured
// data published here is read by crawlers as authoritative machine-readable
// fact about a real person, so a fabricated jobTitle or alumniOf is a false
// public claim, not a cosmetic defect (T-vav-03). That is why the expectations
// below are DERIVED from the raw content files rather than pasted as literals,
// and why the raw JSON is imported directly instead of going through
// lib/portfolio.ts's accessor: asserting against the accessor would only prove
// the builder agrees with itself.
//
// Node 26 invocation notes (see lib/routeMap.test.ts for precedent):
// - Run with bare `node --test` -- never `node --test <dir>` (repo gotcha:
//   Node treats the path as a script to require).
// - Relative imports must carry the exact on-disk ".ts" extension, and JSON
//   imports need the `with { type: "json" }` attribute.
import test from "node:test";
import assert from "node:assert/strict";
import {
  type PersonJsonLd,
  buildPersonJsonLd,
  serializePersonJsonLd,
} from "./personJsonLd.ts";
import { DICTIONARY } from "./dictionary.ts";
import { LOCALES, type Locale } from "./locale.ts";
import { STATIC_ROUTES } from "./routeMap.ts";
import { SITE_ORIGIN } from "./site.ts";
import type { PortfolioData } from "../types/portfolio";
import rawPortfolioEn from "../data/portfolio.json" with { type: "json" };
import rawPortfolioZh from "../data/portfolio.zh.json" with { type: "json" };

/* ── The raw content files, one per locale ────────────────────────────── */

// Widened to PortfolioData deliberately: the annotation re-proves each file's
// shape here, independently of lib/portfolio.ts, so this suite keeps meaning
// even if the accessor is refactored.
const RAW: Record<Locale, PortfolioData> = {
  en: rawPortfolioEn,
  zh: rawPortfolioZh,
};

// U+00B7 MIDDLE DOT -- the separator data/portfolio.{,zh}.json uses inside
// `home.stack`. Written as an escape so this file needs no non-ASCII literal,
// matching lib/personJsonLd.ts.
const MIDDLE_DOT = "\u00b7";

/**
 * The expected Person object for one locale, composed field by field from the
 * raw content file. This is the whole of D-5 expressed as code: if a value the
 * builder emits cannot be written as an expression over RAW[locale] (plus the
 * dictionary's brandSuffix, SITE_ORIGIN and STATIC_ROUTES), it does not belong
 * in the payload at all.
 */
function expectedPerson(locale: Locale): PersonJsonLd {
  const raw = RAW[locale];
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${raw.name} ${DICTIONARY[locale].brandSuffix}`,
    alternateName: raw.resume.tagline,
    url: `${SITE_ORIGIN}${STATIC_ROUTES.home[locale]}`,
    description: raw.resume.description,
    email: raw.home.contactEmail.replace(/^mailto:/, ""),
    homeLocation: { "@type": "Place", name: raw.home.based },
    alumniOf: raw.resume.education.map((entry) => ({
      "@type": "EducationalOrganization" as const,
      name: entry.universityName,
    })),
    knowsAbout: raw.home.stack
      .split(MIDDLE_DOT)
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
    sameAs: raw.socials
      .filter((social) => /^https?:\/\//.test(social.link))
      .map((social) => social.link),
  };
}

// Recursive emptiness walk. A JSON-LD consumer treats "" and [] as assertions
// too, so an empty value is a claim the content file never made.
function assertNoEmptyValues(value: unknown, path: string): void {
  assert.notEqual(value, null, `${path} must not be null`);
  assert.notEqual(value, undefined, `${path} must not be undefined`);
  if (typeof value === "string") {
    assert.ok(value.length > 0, `${path} must not be an empty string`);
    assert.notEqual(value, "undefined", `${path} must not be "undefined"`);
    return;
  }
  if (Array.isArray(value)) {
    assert.ok(value.length > 0, `${path} must not be an empty array`);
    value.forEach((item, i) => assertNoEmptyValues(item, `${path}[${i}]`));
    return;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    assert.ok(entries.length > 0, `${path} must not be an empty object`);
    for (const [key, child] of entries) {
      assertNoEmptyValues(child, `${path}.${key}`);
    }
  }
}

/* ── Field mapping: every value traces to the content file (D-5) ──────── */

test("buildPersonJsonLd emits exactly the fields derivable from the content files (D-5)", () => {
  for (const locale of LOCALES) {
    assert.deepEqual(
      buildPersonJsonLd(locale),
      expectedPerson(locale),
      `the ${locale} payload must equal the object composed from the raw content file`,
    );
  }
});

test("buildPersonJsonLd emits no property beyond the agreed field set (D-5)", () => {
  const allowed = [
    "@context",
    "@type",
    "alternateName",
    "alumniOf",
    "description",
    "email",
    "homeLocation",
    "knowsAbout",
    "name",
    "sameAs",
    "url",
  ];
  for (const locale of LOCALES) {
    assert.deepEqual(
      Object.keys(buildPersonJsonLd(locale)).sort(),
      allowed,
      `the ${locale} payload carries a property with no stated source; ` +
        "an unsourceable property must be OMITTED, not invented (D-5)",
    );
  }
});

test("the schema.org envelope is a Person", () => {
  for (const locale of LOCALES) {
    const person = buildPersonJsonLd(locale);
    assert.equal(person["@context"], "https://schema.org");
    assert.equal(person["@type"], "Person");
    assert.equal(person.homeLocation["@type"], "Place");
    for (const school of person.alumniOf) {
      assert.equal(school["@type"], "EducationalOrganization");
    }
  }
});

test("no emitted value is null, undefined, empty, or the string \"undefined\"", () => {
  for (const locale of LOCALES) {
    assertNoEmptyValues(buildPersonJsonLd(locale), `person(${locale})`);
  }
});

/* ── url composition ──────────────────────────────────────────────────── */

test("url is SITE_ORIGIN + the locale's home route, not a hand-written string", () => {
  assert.equal(buildPersonJsonLd("en").url, `${SITE_ORIGIN}/`);
  assert.equal(buildPersonJsonLd("zh").url, `${SITE_ORIGIN}/zh/`);
});

/* ── sameAs / email split ─────────────────────────────────────────────── */

test("sameAs holds only absolute http(s) profile URLs -- mailto: and relative routes excluded", () => {
  for (const locale of LOCALES) {
    const person = buildPersonJsonLd(locale);
    for (const url of person.sameAs) {
      assert.match(
        url,
        /^https?:\/\//,
        `sameAs means "the same entity elsewhere"; "${url}" is not a profile URL`,
      );
    }
    // The two content entries that must NOT appear: the mailto: address (it
    // becomes `email`) and the relative internal /resume route.
    const links = RAW[locale].socials.map((social) => social.link);
    for (const link of links.filter((l) => !/^https?:\/\//.test(l))) {
      assert.ok(
        !person.sameAs.includes(link),
        `sameAs must not carry "${link}"`,
      );
    }
    // Derived, not hardcoded: a social entry added to the content file later
    // must be picked up automatically rather than failing this assertion.
    assert.equal(
      person.sameAs.length,
      links.filter((l) => /^https?:\/\//.test(l)).length,
      "every absolute profile URL in the content file must appear in sameAs",
    );
  }
});

test("email drops the mailto: scheme carried by home.contactEmail", () => {
  for (const locale of LOCALES) {
    const person = buildPersonJsonLd(locale);
    assert.ok(
      !person.email.startsWith("mailto:"),
      "schema.org email is a bare address, not a URI",
    );
    assert.equal(
      `mailto:${person.email}`,
      RAW[locale].home.contactEmail,
      "the address must be exactly the one in the content file",
    );
  }
});

/* ── knowsAbout ───────────────────────────────────────────────────────── */

test("knowsAbout is home.stack split on the middle dot, trimmed, empties dropped", () => {
  for (const locale of LOCALES) {
    const person = buildPersonJsonLd(locale);
    assert.equal(
      person.knowsAbout.join(` ${MIDDLE_DOT} `),
      RAW[locale].home.stack,
      "the split must round-trip back to the stored stack string",
    );
    for (const item of person.knowsAbout) {
      assert.equal(item, item.trim(), `"${item}" carries surrounding space`);
      assert.ok(!item.includes(MIDDLE_DOT), `"${item}" still holds a separator`);
    }
  }
});

/* ── Locale awareness (D-6) ───────────────────────────────────────────── */

test("every human-readable field differs between the two locales (D-6)", () => {
  const en = buildPersonJsonLd("en");
  const zh = buildPersonJsonLd("zh");
  assert.notEqual(en.name, zh.name);
  assert.notEqual(en.alternateName, zh.alternateName);
  assert.notEqual(en.description, zh.description);
  assert.notEqual(en.url, zh.url);
  assert.notEqual(en.homeLocation.name, zh.homeLocation.name);
  assert.equal(en.alumniOf.length, zh.alumniOf.length);
  en.alumniOf.forEach((school, i) => {
    assert.notEqual(
      school.name,
      zh.alumniOf[i]?.name,
      `alumniOf[${i}] is untranslated`,
    );
  });
});

test("proper nouns and URLs are identical across locales", () => {
  const en = buildPersonJsonLd("en");
  const zh = buildPersonJsonLd("zh");
  assert.equal(en.email, zh.email);
  assert.deepEqual(en.sameAs, zh.sameAs);
  assert.deepEqual(en.knowsAbout, zh.knowsAbout);
});

/* ── Serializer (D-7 / T-vav-01) ──────────────────────────────────────── */

test("serializePersonJsonLd round-trips both locales through JSON.parse", () => {
  for (const locale of LOCALES) {
    const person = buildPersonJsonLd(locale);
    assert.deepEqual(JSON.parse(serializePersonJsonLd(person)), person);
  }
});

test("serializePersonJsonLd emits no literal < for either locale (D-7)", () => {
  for (const locale of LOCALES) {
    assert.ok(
      !serializePersonJsonLd(buildPersonJsonLd(locale)).includes("<"),
      `the ${locale} payload contains a raw < and could terminate the script element`,
    );
  }
});

test("a hostile content value cannot break out of the script element (T-vav-01)", () => {
  // The real content holds no angle bracket, so the escape path has to be
  // exercised with a hand-built object or it is never actually tested.
  const hostile: PersonJsonLd = {
    ...buildPersonJsonLd("en"),
    name: "</script><img src=x onerror=alert(1)>",
    description: "a < b && c > d",
  };
  const serialized = serializePersonJsonLd(hostile);
  assert.ok(!serialized.includes("<"), "a raw < survived serialization");
  assert.ok(
    !serialized.toLowerCase().includes("</script"),
    "a closing script tag survived serialization",
  );
  // The escape is a valid JSON escape, so a parser still sees the original
  // characters -- nothing is lost, only the HTML tokenizer is disarmed.
  assert.deepEqual(JSON.parse(serialized), hostile);
});
