// components/wood/pages/HomePage.tsx
// The home page body — ONE implementation shared by both locales (D-03, ZH-06).
// pages/index.page.tsx binds it to "en" and pages/zh/index.page.tsx binds it to
// "zh"; neither holds a JSX body of its own, so a layout fix applied here takes
// effect on both trees at once. That is the whole point of the extraction, and
// it has to happen before the second caller exists — once two page files carry
// the same markup, the divergence starts silently.
//
// This file lives under components/wood/, so the server-only project data
// module in lib/ is off-limits here (ESLint no-restricted-imports plus that
// module's own runtime guard). Its path is deliberately left unwritten so a
// grep for it over this file stays a real check rather than a comment match —
// the same discipline LocaleProvider.tsx and ProjectCard.tsx use. `projects`
// therefore arrives as a prop from the page file's getStaticProps, and the
// `Project` type comes from the types-only module.
import React, { Fragment, useState } from "react";
import Link from "next/link";
import Nav from "../Nav";
import Footer from "../Footer";
import ProjectCard from "../ProjectCard";
import LocaleHead from "../LocaleHead";
import PersonJsonLd from "../PersonJsonLd";
import { getPortfolioData } from "../../../lib/portfolio";
import { t } from "../../../lib/dictionary";
import type { Locale } from "../../../lib/locale";
import { STATIC_ROUTES, counterpartPath } from "../../../lib/routeMap";
import type { Project } from "../../../types/portfolio";

/* ── Helpers ──────────────────────────────────────────────────────────── */

// One table, two renderings. The English abbreviation and the Chinese ordinal
// live on the same row on purpose: two parallel month tables would be free to
// drift, and a month present in one but not the other fails silently at render
// time rather than at `yarn typecheck`.
const MONTHS: Record<string, { abbr: string; ordinal: number }> = {
  January: { abbr: "JAN", ordinal: 1 },
  February: { abbr: "FEB", ordinal: 2 },
  March: { abbr: "MAR", ordinal: 3 },
  April: { abbr: "APR", ordinal: 4 },
  May: { abbr: "MAY", ordinal: 5 },
  June: { abbr: "JUN", ordinal: 6 },
  July: { abbr: "JUL", ordinal: 7 },
  August: { abbr: "AUG", ordinal: 8 },
  September: { abbr: "SEP", ordinal: 9 },
  October: { abbr: "OCT", ordinal: 10 },
  November: { abbr: "NOV", ordinal: 11 },
  December: { abbr: "DEC", ordinal: 12 },
};

type DateEndpoint = {
  /** The raw month token as stored, e.g. "July" or "Present". */
  raw: string;
  /** Absent on an open-ended endpoint — "Present" carries no year. */
  year: string | undefined;
  abbr: string;
  ordinal: number | undefined;
};

// "July 2025" → { raw: "July", year: "2025", abbr: "JUL", ordinal: 7 }.
// An unrecognised token keeps its upper-cased self for English and no ordinal
// for Chinese, so drift in the content file degrades rather than fabricating a
// month number.
//
// A BARE YEAR ("2025") is its own shape, not a degraded "Month YYYY". The
// résumé's honors are stored that way, so without this branch the year lands in
// `raw`, `year` stays undefined, and every honor row renders "undefined年" in
// Chinese — which is exactly what shipped into the first zh build of the résumé
// page. Recognised by the token being four digits with nothing after it, so a
// real month name can never take this path.
function parseEndpoint(value: string): DateEndpoint {
  const [first, second] = (value || "").trim().split(" ");
  const head = first || "";
  const yearOnly = second === undefined && /^\d{4}$/.test(head);
  const raw = yearOnly ? "" : head;
  const year = yearOnly ? head : second;
  const month = MONTHS[raw];
  return {
    raw,
    year,
    abbr: month ? month.abbr : raw.toUpperCase(),
    ordinal: month ? month.ordinal : undefined,
  };
}

// "2025年7月". The year leads in Chinese, which is also why the shared-year
// collapse below drops the SECOND year rather than the first the way English
// does — Chinese hangs the year off the opening endpoint.
function zhFull(p: DateEndpoint): string {
  return p.ordinal === undefined ? `${p.year}年` : `${p.year}年${p.ordinal}月`;
}

function zhMonthOnly(p: DateEndpoint): string {
  return p.ordinal === undefined ? zhFull(p) : `${p.ordinal}月`;
}

// "JUL 2025", or bare "2025" when the endpoint carries no month. Composing the
// two fields directly would prefix a monthless endpoint with the empty
// abbreviation and a space (" 2025").
function enFull(p: DateEndpoint): string {
  return p.abbr ? `${p.abbr} ${p.year}` : `${p.year}`;
}

/**
 * Renders a stored `dates` string for one locale (CN-09).
 *
 * en: "July 2025 - August 2025" → "JUL — AUG 2025"; collapses a shared year.
 * zh: "July 2025 - August 2025" → "2025年7月 — 8月".
 *
 * The branch lives inside this one helper on purpose — CN-09 is explicit that
 * localized dates must not become a second date subsystem. The stored strings
 * stay English "Month YYYY" in BOTH content files because this helper and the
 * résumé page's two sort comparators all parse them by English month name.
 *
 * An open-ended range ("May 2025 - Present") is detected by its MISSING YEAR,
 * never by comparing against the word "Present" — the marker is a shape, so it
 * survives the endpoint being spelled differently. Without that branch the
 * English form used to render "MAY 2025 — PRESENT undefined".
 *
 * Exported, unlike the other helpers here, because the résumé timeline renders
 * the same stored strings: a second implementation there is precisely the
 * "new date subsystem" CN-09 rules out. Import this one rather than writing
 * another.
 */
export function formatExpDate(
  dates: string | undefined,
  locale: Locale,
): string {
  if (!dates) return "";
  const [rawA, rawB] = dates.split(" - ");
  const a = parseEndpoint(rawA);
  const b = rawB === undefined ? null : parseEndpoint(rawB);
  const ongoing = b !== null && !b.year;
  const present = t(locale).datePresent;

  if (locale === "zh") {
    if (b === null) return zhFull(a);
    if (ongoing) return `${zhFull(a)} — ${present}`;
    // The shared-year collapse drops the closing endpoint's year, so it is only
    // valid when that endpoint still has a month to carry the range. Two bare
    // years in the same year would otherwise collapse to a dangling "月"-less
    // fragment.
    return a.year === b.year && b.ordinal !== undefined
      ? `${zhFull(a)} — ${zhMonthOnly(b)}`
      : `${zhFull(a)} — ${zhFull(b)}`;
  }

  if (b === null) return enFull(a);
  // Upper-cased to match the abbreviation house style around it; the word
  // itself comes from the dictionary so the zh branch is not the only caller
  // and the string has exactly one home.
  if (ongoing) return `${enFull(a)} — ${present.toUpperCase()}`;
  // Same guard as the Chinese collapse: both endpoints need a month before the
  // opening year can be dropped.
  return a.year === b.year && a.abbr && b.abbr
    ? `${a.abbr} — ${b.abbr} ${b.year}`
    : `${enFull(a)} — ${enFull(b)}`;
}

// "Data Science Intern at Micron Technology" → { role, company }.
//
// The " at " infix is a convention of the ENGLISH content file only. The
// Chinese file writes the company into the position string itself
// ("Micron Technology 資料科學實習生"), so this returns an empty company there
// and the caller omits the company span entirely rather than rendering a
// dangling English "at " on every Chinese row.
function splitPosition(pos: string | undefined): {
  role: string;
  company: string;
} {
  const i = (pos || "").indexOf(" at ");
  if (i === -1 || !pos) return { role: pos || "", company: "" };
  return { role: pos.slice(0, i), company: pos.slice(i + 4) };
}

// Pull-quote marks around home.aboutPull. English takes curly doubles; Chinese
// takes the full-width corner brackets a Taiwanese reader expects around quoted
// prose — the same punctuation rule the Chinese copy itself follows. A Record
// rather than a ternary, so a third locale becomes a type error here.
const PULL_QUOTE: Record<Locale, { open: string; close: string }> = {
  en: { open: "“", close: "”" },
  zh: { open: "「", close: "」" },
};

// The three asterisk-based Markdown emphasis forms, longest delimiter first:
// alternation is first-match-wins, so listing `**` before `***` would consume
// the leading two asterisks of a bold-italic run and leave a stray one behind.
// The bodies are lazy, keeping each run to its own nearest closer, and none of
// them cross a newline because every string fed in is a single line.
//
// `\S(?:.*?\S)?` is CommonMark's flanking rule in its simplest useful form: a
// run may not open on whitespace or close on it. Without it a lone asterisk in
// the prose pairs with the opening asterisk of the next real emphasis and
// italicises everything in between — "a lone * asterisk ... on **MLOps**"
// rendered as one long italic run with a stray asterisk left over.
const INLINE_MARKDOWN =
  /\*\*\*(\S(?:.*?\S)?)\*\*\*|\*\*(\S(?:.*?\S)?)\*\*|\*(\S(?:.*?\S)?)\*/g;

// Renders inline Markdown emphasis in hero and body copy: `*em*`, `**strong**`,
// and `***both***`. Deliberately just those, hand-rolled — a real Markdown
// renderer would wrap every string in a block-level <p> that an <h1> must not
// contain, for three rules of syntax the site actually uses.
//
// This replaced a pair of "which substring is the accent?" content fields
// (heroAccent / ledeEmphasis). Those matched by search, so the emphasis
// silently vanished whenever the surrounding copy was reworded — the marker
// now travels inside the sentence it belongs to.
function renderCopy(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(INLINE_MARKDOWN)) {
    const [raw, both, strong, em] = match;
    const at = match.index;
    if (at > cursor) {
      nodes.push(<Fragment key={cursor}>{text.slice(cursor, at)}</Fragment>);
    }
    // Exactly one group participates per match; `undefined` distinguishes a
    // group that did not participate from one that matched an empty body.
    if (both !== undefined) {
      nodes.push(
        <strong key={at}>
          <em>{both}</em>
        </strong>,
      );
    } else if (strong !== undefined) {
      nodes.push(<strong key={at}>{strong}</strong>);
    } else {
      nodes.push(<em key={at}>{em}</em>);
    }
    cursor = at + raw.length;
  }

  // Unmatched asterisks simply stay in the text, the same way they do in a
  // Markdown renderer — nothing here can drop content.
  if (cursor < text.length) {
    nodes.push(<Fragment key={cursor}>{text.slice(cursor)}</Fragment>);
  }
  return nodes;
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function HomePage({
  locale,
  projects,
}: {
  locale: Locale;
  projects: Project[];
}) {
  const data = getPortfolioData(locale);
  const s = t(locale);
  const home = data.home;

  // The wordmark exactly as Nav and Footer compose it, so the browser tab and
  // the page header never disagree about the owner's name.
  const wordmark = `${data.name} ${s.brandSuffix}`;
  // Resolved ONCE and threaded to both consumers below. The switcher href and
  // the hreflang pair are the same value by construction, which is why they
  // cannot drift apart (D-06, D-07).
  const path = STATIC_ROUTES.home[locale];
  const counterpart = counterpartPath(path);

  // getAllProjects() (via getStaticProps) already sorts most-recent first —
  // the same canonical order the showcase page's prev/next uses (D-13).
  const featuredCount = home.projectCount || 3;
  const featured = projects.slice(0, featuredCount);
  const remaining = projects.slice(featuredCount);
  const [lead, ...rest] = featured;
  const [showAll, setShowAll] = useState(false);

  const quote = PULL_QUOTE[locale];

  return (
    <div className="we">
      <LocaleHead
        locale={locale}
        title={s.homeTitleTemplate.replace("{name}", wordmark)}
        description={s.homeDescriptionTemplate.replace("{name}", wordmark)}
        path={path}
      />
      <PersonJsonLd locale={locale} />

      <div className="wrap">
        <Nav home counterpartUrl={counterpart} />

        {/* Hero */}
        <section className="hero">
          <div>
            <div className="greeting">
              <span className="dot" />
              {home.greeting}
              {home.availability ? ` · ${home.availability}` : ""}
            </div>
            <h1>
              {home.heroLines.map((line, i) => (
                <Fragment key={i}>
                  {renderCopy(line)}
                  {i < home.heroLines.length - 1 && <br />}
                </Fragment>
              ))}
            </h1>
            <p className="lede">{renderCopy(home.lede)}</p>
          </div>
          <div className="hero-meta">
            <div className="meta-row">
              <span className="meta-label">{s.metaBased}</span>
              <span className="meta-value">{home.based}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">{s.metaDegree}</span>
              <span className="meta-value">{home.degree}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">{s.metaStack}</span>
              <span className="meta-value">{home.stack}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">{s.metaHonors}</span>
              <span className="meta-value">{home.honorsShort}</span>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects">
          <div className="sec-head">
            {/* The `01 ／` numeral is layout, not copy — identical in both
                locales, so it stays literal here rather than in the
                dictionary. */}
            <h2>
              <span className="num">01 ／</span>
              {s.sectionProjects}
            </h2>
          </div>
          <div className="projects">
            {lead && <ProjectCard p={lead} locale={locale} size="large" />}
            <div className="right-col">
              {rest.map((p) => (
                <ProjectCard key={p.id} p={p} locale={locale} size="small" />
              ))}
            </div>
          </div>
          {showAll && remaining.length > 0 && (
            <div className="projects-all">
              {remaining.map((p) => (
                <ProjectCard key={p.id} p={p} locale={locale} size="small" />
              ))}
            </div>
          )}
          {remaining.length > 0 && (
            <div className="show-all">
              <button type="button" onClick={() => setShowAll((v) => !v)}>
                {showAll
                  ? s.showLess
                  : s.showAllTemplate.replace("{n}", String(projects.length))}
              </button>
            </div>
          )}
        </section>

        {/* Work */}
        <section id="work">
          <div className="sec-head">
            <h2>
              <span className="num">02 ／</span>
              {s.sectionExperience}
            </h2>
          </div>
          <div className="exp-list">
            {data.resume.experiences.map((exp, i) => {
              const { role, company } = splitPosition(exp.position);
              const blurb =
                data.experiences[i]?.description || exp.bullets?.[0] || "";
              return (
                <div className="exp-row" key={exp.id}>
                  <span className="exp-idx">
                    /{String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="exp-role">
                    {role}
                    {/* Omitted wholesale rather than rendered empty: with no
                        company to name there is nothing for the English "at"
                        to join, and a Chinese row would otherwise end in a
                        dangling "at ". The leading space is kept OUTSIDE the
                        span so the English markup is unchanged. */}
                    {company ? (
                      <Fragment>
                        {" "}
                        <span className="at">at {company}</span>
                      </Fragment>
                    ) : null}
                  </span>
                  <span className="exp-blurb">{blurb}</span>
                  <span className="exp-when">
                    {formatExpDate(exp.dates, locale)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* About */}
        <section id="about">
          <div className="sec-head">
            <h2>
              <span className="num">03 ／</span>
              {s.sectionAbout}
            </h2>
          </div>
          <div className="about">
            <div className="about-pull">
              {quote.open}
              {home.aboutPull}
              {quote.close}
            </div>
            <div className="about-body">
              {data.aboutpara.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* The dev-only content editor. next.config.js's pageExtensions drops
          pages/edit.dev.tsx from the production export, so no visitor in either
          locale can reach this — which is why its label stays English. */}
      {process.env.NODE_ENV === "development" && (
        <Link href="/edit" className="dev-edit">
          Edit Data
        </Link>
      )}
    </div>
  );
}
