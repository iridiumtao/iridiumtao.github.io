// components/wood/pages/ProjectPage.tsx
// The project showcase body — ONE implementation shared by both locales (D-03,
// ZH-06). pages/projects/[slug].page.tsx binds it to "en" and
// pages/zh/projects/[slug].page.tsx binds it to "zh"; neither holds a JSX body
// of its own, so a layout fix applied here takes effect on all 16 exported
// showcase pages at once.
//
// This file lives under components/wood/, so the server-only project data
// module in lib/ is off-limits here (ESLint no-restricted-imports plus that
// module's own runtime guard) — its path is deliberately left unwritten so a
// grep for it over this file stays a real check rather than a comment match.
// `project`, `prev` and `next` therefore arrive as props from the page file's
// getStaticProps, and ProjectWithBody comes from the types-only module, exactly
// as ProjectCard.tsx takes its Project.
//
// Everything locale-varying about a showcase page is already resolved before it
// gets here: getProjectBySlug() picked the right content file and the right
// _projects/<slug>[.zh].md body, and it THROWS rather than falling back to
// English when a translation is missing. So this component never asks "which
// language is this text in?" — it only asks which locale's routes and chrome to
// render around it.
import React from "react";
import Link from "next/link";
import Nav from "../Nav";
import Footer from "../Footer";
import LocaleHead from "../LocaleHead";
import { formatExpDate } from "./HomePage";
import { t } from "../../../lib/dictionary";
import type { Locale } from "../../../lib/locale";
import { projectPath, counterpartPath } from "../../../lib/routeMap";
import type { ProjectWithBody } from "../../../types/portfolio";

// The prev/next neighbour link — just enough of a project to render the label
// and href. null at each end of the list (D-13, no wrap-around). Exported
// because both page bindings build these values in their getStaticProps.
export type NavEntry = { slug: string; title: string } | null;

/* ── Helpers ──────────────────────────────────────────────────────────── */

// The kicker date under the project title.
//
// en: unchanged from before the bilingual work — the stored startDate/endDate
//     as written, joined by an em dash ("July 2025 — August 2025"), collapsing
//     to the single endpoint when a project began and ended in the same month.
// zh: delegated to formatExpDate, the one date renderer on the site, which
//     already parses these exact English "Month YYYY" strings ("2025年7月 — 8月").
//
// startDate/endDate stay English in BOTH content files on purpose — plan 06-03
// pinned them identical so the server-side newest-first sort, and therefore the
// prev/next chain below, is the same in both locales. That means the reader
// facing string has to be produced here rather than stored, and it has to come
// from the same helper the home page and the résumé use (CN-09 forbids a second
// date subsystem).
function kickerDate(
  startDate: string,
  endDate: string,
  locale: Locale,
): string {
  if (locale === "zh") {
    return formatExpDate(
      startDate === endDate ? startDate : `${startDate} - ${endDate}`,
      locale,
    );
  }
  return startDate === endDate ? endDate : `${startDate} — ${endDate}`;
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function ProjectPage({
  locale,
  project,
  prev,
  next,
}: {
  locale: Locale;
  project: ProjectWithBody;
  prev: NavEntry;
  next: NavEntry;
}) {
  const p = project;
  const s = t(locale);

  // Resolved ONCE and threaded to both consumers below. The switcher href and
  // the hreflang pair are the same value by construction, which is why they
  // cannot drift apart (D-06, D-07). projectPath() also re-validates the slug,
  // so a malformed one fails the build here as well as in lib/.
  const path = projectPath(locale, p.slug);
  const counterpart = counterpartPath(path);

  return (
    <div className="we">
      <LocaleHead
        locale={locale}
        title={`${p.title} • ${s.homeTitle}`}
        description={p.description}
        path={path}
        ogType="article"
        // Site-root-relative; LocaleHead prefixes SITE_ORIGIN itself. Prefixing
        // here too would produce a doubled origin.
        ogImage={p.imageSrc}
        // The project's own title is the only alt we actually know for its own
        // cover image. Supplying it is also what stops LocaleHead falling back
        // to the default card's alt, which would describe a different picture.
        ogImageAlt={p.title}
      />

      <div className="wrap col-prose">
        <Nav counterpartUrl={counterpart} />

        <header className="resume-head proj-head">
          <span className="kicker">
            {kickerDate(p.startDate, p.endDate, locale)}
          </span>
          <h1>{p.title}</h1>
          {p.subtitle && <p className="desc">{p.subtitle}</p>}
          {p.techStack.length > 0 && (
            <div className="chip-row">
              {p.techStack.map((tech, i) => (
                <span key={i} className="chip">
                  {tech}
                </span>
              ))}
            </div>
          )}
          <div className="resume-downloads">
            <a href={p.url} target="_blank" rel="noreferrer">
              {s.projectRepositoryLink}
            </a>
            {p.demoUrl && (
              <a href={p.demoUrl} target="_blank" rel="noreferrer">
                {s.projectLiveDemoLink}
              </a>
            )}
          </div>
        </header>

        <article className="resume-body">
          <div className="proj-cover">
            <img src={p.imageSrc} alt={p.title} />
          </div>
          {/* HTML sink. p.body is build-time output of utils/markdownToHtml.ts,
              which runs remark-html >= 14 with its default sanitizer on
              repo-owned _projects/*.md and _projects/*.zh.md -- raw HTML and
              javascript: hrefs are stripped before they reach here (verified
              against remark-html 16.0.1). No user input ever reaches this
              string. The Chinese bodies travel this same first-party pipeline,
              so the bilingual work opened no new input path. If that pipeline
              is ever switched to `sanitize: false` or fed non-repo content,
              this sink must be re-audited. */}
          {p.body !== null && (
            <div
              className="proj-body"
              dangerouslySetInnerHTML={{ __html: p.body }}
            />
          )}
        </article>

        {/* Neighbours are resolved in THIS page's locale, so a Chinese showcase
            links to Chinese neighbours rather than dropping the reader back
            into the English tree mid-browse. The slugs are locale-invariant
            (lib/translations.test.ts asserts it), so the chain itself is the
            same order in both trees. */}
        <nav className="proj-nav">
          {prev && (
            <Link
              className="proj-nav-link"
              href={projectPath(locale, prev.slug)}
            >
              ← {prev.title}
            </Link>
          )}
          {next && (
            <Link
              className="proj-nav-link proj-nav-next"
              href={projectPath(locale, next.slug)}
            >
              {next.title} →
            </Link>
          )}
        </nav>

        <Footer />
      </div>
    </div>
  );
}
