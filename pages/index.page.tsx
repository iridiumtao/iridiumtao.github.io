// pages/index.page.tsx
// The home page. Content comes from lib/portfolio.ts and project data from
// lib/projects.ts (TS-03) — never from the raw JSON directly. Pages may
// import lib/projects; the ESLint server-only boundary covers components/wood/**.
import React, { Fragment, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Nav from "../components/wood/Nav";
import Footer from "../components/wood/Footer";
import ProjectCard from "../components/wood/ProjectCard";
import { getAllProjects } from "../lib/projects";
import type { Project } from "../lib/projects";

// Local data
import data from "@/lib/portfolio";

export async function getStaticProps(): Promise<{
  props: { projects: Project[] };
}> {
  return { props: { projects: getAllProjects() } };
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

const MONTHS: Record<string, string> = {
  January: "JAN",
  February: "FEB",
  March: "MAR",
  April: "APR",
  May: "MAY",
  June: "JUN",
  July: "JUL",
  August: "AUG",
  September: "SEP",
  October: "OCT",
  November: "NOV",
  December: "DEC",
};

// "July 2025 - August 2025" → "JUL — AUG 2025"; collapses shared years.
// An open-ended end ("May 2025 - Present") carries no year, so it is emitted
// on its own — without this it rendered as "MAY 2025 — PRESENT undefined".
function formatExpDate(dates: string | undefined): string {
  if (!dates) return "";
  const fmt = (s: string) => {
    const [m, y] = s.trim().split(" ");
    return { m: MONTHS[m] || (m || "").toUpperCase(), y };
  };
  const [rawA, rawB] = dates.split(" - ");
  const a = fmt(rawA);
  if (!rawB) return `${a.m} ${a.y}`;
  const b = fmt(rawB);
  if (!b.y) return `${a.m} ${a.y} — ${b.m}`;
  return a.y === b.y
    ? `${a.m} — ${b.m} ${b.y}`
    : `${a.m} ${a.y} — ${b.m} ${b.y}`;
}

// "Data Science Intern at Micron Technology" → { role, company }
function splitPosition(pos: string | undefined): {
  role: string;
  company: string;
} {
  const i = (pos || "").indexOf(" at ");
  if (i === -1 || !pos) return { role: pos || "", company: "" };
  return { role: pos.slice(0, i), company: pos.slice(i + 4) };
}

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

export default function Home({ projects }: { projects: Project[] }) {
  const home = data.home;

  // getAllProjects() (via getStaticProps) already sorts most-recent first —
  // the same canonical order the showcase page's prev/next uses (D-13).
  const featuredCount = home.projectCount || 3;
  const featured = projects.slice(0, featuredCount);
  const remaining = projects.slice(featuredCount);
  const [lead, ...rest] = featured;
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="we">
      <Head>
        <title>{`${data.name} Tao — Engineer`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="wrap">
        <Nav home />

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
              <span className="meta-label">Based</span>
              <span className="meta-value">{home.based}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Degree</span>
              <span className="meta-value">{home.degree}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Stack</span>
              <span className="meta-value">{home.stack}</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">Honors</span>
              <span className="meta-value">{home.honorsShort}</span>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects">
          <div className="sec-head">
            <h2>
              <span className="num">01 ／</span>Selected Projects
            </h2>
          </div>
          <div className="projects">
            {lead && <ProjectCard p={lead} size="large" />}
            <div className="right-col">
              {rest.map((p) => (
                <ProjectCard key={p.id} p={p} size="small" />
              ))}
            </div>
          </div>
          {showAll && remaining.length > 0 && (
            <div className="projects-all">
              {remaining.map((p) => (
                <ProjectCard key={p.id} p={p} size="small" />
              ))}
            </div>
          )}
          {remaining.length > 0 && (
            <div className="show-all">
              <button type="button" onClick={() => setShowAll((v) => !v)}>
                {showAll ? "Show Less" : `Show All (${projects.length})`}
              </button>
            </div>
          )}
        </section>

        {/* Work */}
        <section id="work">
          <div className="sec-head">
            <h2>
              <span className="num">02 ／</span>Professional Experience
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
                    {role} <span className="at">at {company}</span>
                  </span>
                  <span className="exp-blurb">{blurb}</span>
                  <span className="exp-when">{formatExpDate(exp.dates)}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* About */}
        <section id="about">
          <div className="sec-head">
            <h2>
              <span className="num">03 ／</span>About
            </h2>
          </div>
          <div className="about">
            <div className="about-pull">&ldquo;{home.aboutPull}&rdquo;</div>
            <div className="about-body">
              {data.aboutpara.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {process.env.NODE_ENV === "development" && (
        <Link href="/edit" className="dev-edit">
          Edit Data
        </Link>
      )}
    </div>
  );
}
