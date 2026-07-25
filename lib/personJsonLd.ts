// lib/personJsonLd.ts
// The schema.org Person entity published on both locale home pages (GH-3).
// Pure data: no React import and no JSX, so bare `node --test` can load it and
// lib/personJsonLd.test.ts can cover the entire published payload. The render
// wrapper is components/wood/PersonJsonLd.tsx and holds no field logic.
//
// SOURCING RULE (D-5), the one that governs every line below: this file makes
// public, machine-readable claims about a real person. Crawlers read them as
// authoritative. Every value therefore has to come out of
// the two per-locale content files under data/ -- composed, at most, with the
// dictionary's brandSuffix, SITE_ORIGIN and STATIC_ROUTES. A schema.org
// property with no truthful source in the content model is OMITTED. A smaller,
// wholly-true Person is the correct outcome; a fuller one built on a guess is
// a lie with a machine-readable wrapper.
//
// Content is reached ONLY through getPortfolioData() -- never by importing the
// raw JSON here -- so a content edit that breaks the shape fails at
// `yarn typecheck` through that accessor's `satisfies` check rather than
// silently emitting a malformed entity. (The TEST does import the raw files
// directly, on purpose: that is what proves these values trace to the content
// on disk instead of merely agreeing with the accessor.)
//
// This file is deliberately PURE ASCII (D-9). scripts/subset-font.ts scans
// lib/ and components/ for glyphs, so a CJK or punctuation literal added here
// would change the emitted font subset for a string no visitor ever reads. The
// middle dot below is written as an escape for exactly that reason.
//
// Relative imports carry the explicit on-disk ".ts" extension: Node's ESM
// resolver rejects the extensionless form when `node --test` loads this module
// (same convention as lib/routeMap.ts and lib/dictionary.ts).
import { getPortfolioData } from "./portfolio.ts";
import { t } from "./dictionary.ts";
import { STATIC_ROUTES } from "./routeMap.ts";
import { SITE_ORIGIN } from "./site.ts";
import type { Locale } from "./locale.ts";

/* -- Deliberately omitted properties (D-5) ----------------------------- */
//
// Each of these is a property a later contributor will be tempted to "helpfully"
// fill in. Do not. The reason it is absent is that the content model does not
// contain the fact, and inventing one here publishes a false claim:
//
// - jobTitle       -- no job-title field exists anywhere in the content model.
//                     lib/dictionary.ts's "{name} - Engineer" is a page-TITLE
//                     suffix, not a declared professional title.
// - worksFor,      -- every resume.experiences entry is a past internship or a
//   affiliation       role with an end date. Naming a current employer would be
//                     false.
// - image          -- no portrait asset exists in the content model.
// - address        -- home.based is a single free-text string. Splitting it into
//   (PostalAddress)   addressLocality/addressRegion would be inference, not
//                     sourcing.
// - birthDate,     -- absent from the content model entirely.
//   nationality,
//   gender,
//   telephone
// - inLanguage     -- NOT valid on Person (D-10). Its schema.org domain is
//                     BroadcastService, CommunicateAction, CreativeWork, Event,
//                     LinkRole, PronounceableText and WriteAction. Emitting it
//                     would produce an invalid entity.
// - knowsLanguage  -- valid on Person, but it would be inferred from
//                     lib/locale.ts's LOCALES table rather than sourced from the
//                     content files, which is precisely what D-5 forbids.

/* -- Types ------------------------------------------------------------- */

export type SchemaPlace = {
  "@type": "Place";
  name: string;
};

export type SchemaEducationalOrganization = {
  "@type": "EducationalOrganization";
  name: string;
};

/**
 * Exactly the properties this site publishes. Closed on purpose: adding a
 * property here forces the author to answer "which content field is this?"
 * before it can compile, and lib/personJsonLd.test.ts asserts the emitted key
 * set matches this shape.
 */
export type PersonJsonLd = {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  alternateName: string;
  url: string;
  description: string;
  email: string;
  homeLocation: SchemaPlace;
  alumniOf: SchemaEducationalOrganization[];
  knowsAbout: string[];
  sameAs: string[];
};

/* -- Helpers ----------------------------------------------------------- */

// U+00B7 MIDDLE DOT -- the separator home.stack uses in both content files
// (the "Python <dot> Go <dot> Docker ..." string). Written as an escape rather
// than pasted, to keep this file ASCII (D-9); the glyph itself already reaches
// the font subset through the content files, which do spell it literally.
const MIDDLE_DOT = "\u00b7";

// schema.org's `email` is a bare address, not a URI, while the content model
// stores home.contactEmail ready for an href. Anchored so a local part that
// happens to contain the word is untouched.
const MAILTO_SCHEME = /^mailto:/;

// `sameAs` means "the same entity, elsewhere" -- a third-party profile page.
// Matching on the absolute-URL SHAPE rather than on a social's title means a
// future profile entry is picked up automatically and a future relative link
// (or another mailto:) is excluded automatically. Today this admits the GitHub
// and LinkedIn entries and rejects the mailto: address (which becomes `email`)
// and the internal "/resume" route.
const ABSOLUTE_URL = /^https?:\/\//;

/* -- Builder ----------------------------------------------------------- */

/**
 * The Person entity for one locale. Pure: same locale in, deep-equal object
 * out, no I/O and no clock.
 *
 * `locale` is required, matching getPortfolioData() and t(): a caller that has
 * not decided which locale it renders must not silently publish English facts
 * on a Chinese page.
 */
export function buildPersonJsonLd(locale: Locale): PersonJsonLd {
  const data = getPortfolioData(locale);
  const strings = t(locale);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    // The same wordmark Nav, Footer and the <title> already compose, so the
    // name a crawler reads and the name a visitor reads cannot drift.
    name: `${data.name} ${strings.brandSuffix}`,
    // The name line printed at the top of the resume.
    alternateName: data.resume.tagline,
    // Composed, never hand-written: lib/routeMap.ts owns what the home route is
    // called in each locale, and lib/site.ts owns the canonical origin.
    url: `${SITE_ORIGIN}${STATIC_ROUTES.home[locale]}`,
    description: data.resume.description,
    email: data.home.contactEmail.replace(MAILTO_SCHEME, ""),
    // home.based is one free-text string, so it stays one Place name (D-11).
    // Note the content file says "Pittsburgh, PA" while CLAUDE.md's prose says
    // "between New York and Taipei". The content file is the single source of
    // truth and wins; reconciling the two is the owner's call, not this
    // module's.
    homeLocation: { "@type": "Place", name: data.home.based },
    alumniOf: data.resume.education.map((entry) => ({
      "@type": "EducationalOrganization" as const,
      name: entry.universityName,
    })),
    knowsAbout: data.home.stack
      .split(MIDDLE_DOT)
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
    sameAs: data.socials
      .filter((social) => ABSOLUTE_URL.test(social.link))
      .map((social) => social.link),
  };
}

/* -- Serializer -------------------------------------------------------- */

/**
 * The exact string to place inside <script type="application/ld+json">.
 *
 * The `<` replacement is LOAD-BEARING, not noise -- do not remove it as dead
 * weight (D-7, T-vav-01). The payload is injected with dangerouslySetInnerHTML,
 * which bypasses React's escaping, so a content value containing "</script>"
 * would otherwise terminate the enclosing element and let the rest of that
 * value be parsed as markup. Escaping every `<` makes that impossible.
 *
 * Nothing is lost by it: the \u003c escape is valid JSON, so every JSON-LD
 * parser sees the original "<" character. Only the HTML tokenizer, which does
 * not process JSON escapes, is disarmed.
 */
export function serializePersonJsonLd(person: PersonJsonLd): string {
  return JSON.stringify(person).replace(/</g, "\\u003c");
}
