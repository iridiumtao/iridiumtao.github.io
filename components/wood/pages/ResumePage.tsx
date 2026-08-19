// components/wood/pages/ResumePage.tsx
// The résumé page body — ONE implementation shared by both locales (D-03,
// ZH-06). pages/resume.page.tsx binds it to "en" and pages/zh/resume.page.tsx
// binds it to "zh"; neither holds a JSX body of its own, so a layout fix
// applied here takes effect on both trees at once.
//
// This file lives under components/wood/, so the server-only project data
// module in lib/ is off-limits here (ESLint no-restricted-imports plus that
// module's own runtime guard) — its path is deliberately left unwritten so a
// grep for it over this file stays a real check rather than a comment match.
// The résumé needs no project data anyway; what it DOES need from outside is
// the public/resumes/*.pdf listing, and that filesystem read stays in the page
// file where fs is allowed. It arrives here as the `resumes` prop.
//
// The PDFs themselves are English-only. A Chinese résumé PDF is deferred
// (ZHPDF-01/02), so both locales list the same files and only the surrounding
// prose differs — that is accurate, not a gap, and no "these are in English"
// notice is added here (that is ZHPDF-02).
import React from "react";
import Link from "next/link";
import Nav from "../Nav";
import Footer from "../Footer";
import LocaleHead from "../LocaleHead";
import { formatExpDate } from "./HomePage";
import { getPortfolioData } from "../../../lib/portfolio";
import { t } from "../../../lib/dictionary";
import type { ChromeStrings } from "../../../lib/dictionary";
import type { Locale } from "../../../lib/locale";
import { STATIC_ROUTES, counterpartPath } from "../../../lib/routeMap";
import type { ResumeSkills } from "../../../types/portfolio";

// Build-time-computed from the public/resumes/*.pdf filenames by the page
// file's getStaticProps, so it is not part of PortfolioData and deliberately
// does not live in types/portfolio.ts.
export type ResumeDownload = { url: string; name: string; purpose: string };

/* ── Helpers ──────────────────────────────────────────────────────────── */

// Sortable date from a "Mon YYYY - Mon YYYY" / "YYYY" string (uses the end).
//
// Deliberately NOT locale-branched. Both content files store the same English
// "Month YYYY" strings (plan 06-03 kept them identical on purpose), so résumé
// ordering is locale-independent by construction. A locale branch here would
// be silently destructive rather than loud: the function falls back to
// new Date(0) on an unparseable value instead of throwing, so a Chinese date
// form reaching it would produce a mis-ordered résumé with no error anywhere.
function getSortableDate(dateString: string | undefined): Date {
  if (!dateString) return new Date(0);
  const lower = dateString.toString().toLowerCase();
  if (lower.includes("present") || lower.includes("current")) return new Date();
  const parts = lower.split(" - ");
  // Which endpoint is selected is load-bearing — it drives résumé sort order, so
  // a range must keep resolving to its SECOND part and a bare date to its first.
  // The trailing `?? ""` changes neither: `dateString` is proven non-empty by the
  // guard above, so `parts[0]` always exists and `parts[1]` exists exactly when
  // the length check already passed. It is there only because
  // noUncheckedIndexedAccess types every array index as possibly-missing. An
  // empty string would fall through to the new Date(0) return below, matching how
  // this function already treats an unparseable value.
  const end = (parts.length > 1 ? parts[1] : parts[0]) ?? "";
  const date = new Date(end);
  if (!isNaN(date.getTime())) return date;
  const year = end.match(/\d{4}/);
  if (year) {
    const yd = new Date(year[0]);
    if (!isNaN(yd.getTime())) return yd;
  }
  return new Date(0);
}

// Descending comparator over a date field. Takes an accessor rather than a key
// string so the field is checked against the entry type at compile time — a
// misspelled or removed field is now a build error, not a silently dead sort.
// (`.getTime()` is explicit because `Date - Date` only works via valueOf.)
const byDateDesc =
  <T,>(pick: (item: T) => string | undefined) =>
  (a: T, b: T): number =>
    getSortableDate(pick(b)).getTime() - getSortableDate(pick(a)).getTime();

// Renders a stored date range for one locale (CN-09).
//
// en: unchanged from before the bilingual work — the stored string as written,
//     with its " - " normalised to an en dash ("May 2025 – Present").
// zh: delegated wholesale to formatExpDate, the home page's renderer, which
//     already parses these exact strings ("2025年5月 — 至今").
//
// The delegation is the point. CN-09 rules out a second date subsystem, and a
// résumé-local Chinese renderer would be exactly that: two parsers of the same
// English month names, free to disagree about how "September 2021 - July 2023"
// reads in Chinese. The two locales therefore differ in dash and in year
// placement — that is formatExpDate's established Chinese form, not a new
// convention invented here.
const fmtRange = (d: string | undefined, locale: Locale): string =>
  locale === "zh"
    ? formatExpDate(d, locale)
    : (d || "").replace(/\s*-\s*/, " – ");

// Join present meta parts with a middot.
const metaLine = (...parts: (string | undefined | false)[]): string =>
  parts.filter(Boolean).join(" · ");

// "Software Developer at CARITY AI" → role + accented company.
//
// The " at " infix is a convention of the ENGLISH content file only, the same
// one the home page's splitPosition() relies on. data/portfolio.zh.json writes
// the company into the position string itself ("Micron Technology 資料科學實習生"),
// so this finds no separator there and returns the string unchanged — a
// Chinese row renders as plain text with no `.at` span, which is correct.
// Do not invent a Chinese separator heuristic to "fix" that.
function renderRole(position: string | undefined): React.ReactNode {
  const i = (position || "").indexOf(" at ");
  if (i === -1 || !position) return position;
  return (
    <>
      {position.slice(0, i)}{" "}
      <span className="at">at {position.slice(i + 4)}</span>
    </>
  );
}

/* ── Reusable timeline item ───────────────────────────────────────────── */

// `title` is a ReactNode because renderRole() returns markup for experience
// entries and a plain string everywhere else. `bullets`/`courses` are optional:
// only education passes `courses`, and only experience/projects pass `bullets`.
// `locale` is required — it is what fmtRange needs, and defaulting it would
// reintroduce the English-on-a-Chinese-page failure the rest of the phase
// exists to make impossible.
type TimelineItemProps = {
  locale: Locale;
  title: React.ReactNode;
  date?: string;
  meta?: string;
  bullets?: string[] | null;
  courses?: string[] | null;
};

function TimelineItem({
  locale,
  title,
  date,
  meta,
  bullets,
  courses,
}: TimelineItemProps) {
  return (
    <div className="tl-item">
      <div className="tl-head">
        <span className="tl-title">{title}</span>
        {date && <span className="tl-date">{fmtRange(date, locale)}</span>}
      </div>
      {meta && <div className="tl-meta">{meta}</div>}
      {bullets && bullets.length > 0 && (
        <ul className="tl-bullets">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      {courses && courses.length > 0 && (
        <div className="tl-courses chip-row">
          {courses.map((c, i) => (
            <span key={i} className="chip-sq">
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

// `key` names a field of ResumeSkills and is an IDENTIFIER, not copy — it stays
// literal in both locales. `labelKey` names the dictionary entry a reader
// actually sees, so the heading above each chip row is translated while the
// data lookup underneath it is not.
const SKILL_GROUPS: { labelKey: keyof ChromeStrings; key: keyof ResumeSkills }[] =
  [
    { labelKey: "skillsLanguages", key: "languages" },
    { labelKey: "skillsCloudAndDevOps", key: "cloudAndDevOps" },
    { labelKey: "skillsFrameworksAndBackend", key: "frameworksAndBackend" },
    { labelKey: "skillsDataAndML", key: "dataAndML" },
  ];

export default function ResumePage({
  locale,
  resumes,
}: {
  locale: Locale;
  resumes: ResumeDownload[];
}) {
  const data = getPortfolioData(locale);
  const s = t(locale);
  const r = data.resume;

  // Resolved ONCE and threaded to both consumers below. The switcher href and
  // the hreflang pair are the same value by construction, which is why they
  // cannot drift apart (D-06, D-07).
  const path = STATIC_ROUTES.resume[locale];
  const counterpart = counterpartPath(path);

  return (
    <div className="we">
      <LocaleHead
        locale={locale}
        title={s.resumeTitle}
        description={s.resumeDescription}
        path={path}
      />

      <div className="wrap col-narrow">
        <Nav back counterpartUrl={counterpart} />

        {/* Header */}
        <header className="resume-head">
          <h1>{s.resumeHeading}</h1>
          <p className="desc">{r.description}</p>
          {resumes.length > 0 && (
            <div className="resume-downloads">
              {resumes.map((resume) => (
                <a
                  key={resume.url}
                  href={resume.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {resume.name} 🔗
                </a>
              ))}
            </div>
          )}
        </header>

        <div className="resume-body">
          {/* Education */}
          <section>
            <div className="sec-head">
              {/* The `01 ／` numeral is layout, not copy — identical in both
                  locales, so it stays literal here rather than in the
                  dictionary. */}
              <h2>
                <span className="num">01 ／</span>
                {s.resumeSectionEducation}
              </h2>
            </div>
            <div className="tl">
              {[...r.education]
                .sort(byDateDesc((edu) => edu.universityDate))
                .map((edu) => (
                  <TimelineItem
                    key={edu.id}
                    locale={locale}
                    title={edu.universityName}
                    date={edu.universityDate}
                    meta={metaLine(
                      edu.location,
                      edu.gpa && `GPA ${edu.gpa}`,
                      edu.degree,
                    )}
                    courses={edu.relevantCoursework}
                  />
                ))}
            </div>
          </section>

          {/* Skills */}
          <section>
            <div className="sec-head">
              <h2>
                <span className="num">02 ／</span>
                {s.resumeSectionSkills}
              </h2>
            </div>
            {SKILL_GROUPS.map((g) => (
              <div className="skill-group" key={g.key}>
                <div className="skill-label">{s[g.labelKey]}</div>
                <div className="chip-row">
                  {(r.skills[g.key] || []).map((skill, i) => (
                    <span key={i} className="chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Experience */}
          <section>
            <div className="sec-head">
              <h2>
                <span className="num">03 ／</span>
                {s.resumeSectionExperience}
              </h2>
              <span className="aside">
                {s.resumeRolesCountTemplate.replace(
                  "{n}",
                  String(r.experiences.length),
                )}
              </span>
            </div>
            <div className="tl">
              {[...r.experiences]
                .sort(byDateDesc((exp) => exp.dates))
                .map((exp) => (
                  <TimelineItem
                    key={exp.id}
                    locale={locale}
                    title={renderRole(exp.position)}
                    date={exp.dates}
                    meta={metaLine(exp.location, exp.type)}
                    bullets={exp.bullets}
                  />
                ))}
            </div>
          </section>

          {/* Projects */}
          <section>
            <div className="sec-head">
              <h2>
                <span className="num">04 ／</span>
                {s.resumeSectionProjects}
              </h2>
              <span className="aside">
                {s.resumeProjectsCountTemplate.replace(
                  "{n}",
                  String(r.projects.length),
                )}
              </span>
            </div>
            <div className="tl">
              {[...r.projects]
                .sort(byDateDesc((project) => project.dates))
                .map((project) => (
                  <TimelineItem
                    key={project.id}
                    locale={locale}
                    title={project.title}
                    date={project.dates}
                    meta={metaLine(project.organization, project.location)}
                    bullets={project.details}
                  />
                ))}
            </div>
          </section>

          {/* Honors */}
          <section>
            <div className="sec-head">
              <h2>
                <span className="num">05 ／</span>
                {s.resumeSectionHonors}
              </h2>
            </div>
            <div className="tl">
              {[...r.honors]
                .sort(byDateDesc((honor) => honor.year))
                .map((honor) => (
                  <TimelineItem
                    key={honor.id}
                    locale={locale}
                    title={honor.title}
                    date={honor.year}
                    meta={metaLine(
                      honor.event || honor.organization,
                      honor.location,
                    )}
                  />
                ))}
            </div>
          </section>
        </div>

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
