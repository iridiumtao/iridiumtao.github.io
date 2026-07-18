import React, { Fragment, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Nav from "../components/wood/Nav";
import Footer from "../components/wood/Footer";
import ProjectCard from "../components/wood/ProjectCard";
import { getAllProjects } from "../lib/projects";

// Local data
import data from "@/data/portfolio.json";

export async function getStaticProps() {
  return { props: { projects: getAllProjects() } };
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

const MONTHS = {
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
function formatExpDate(dates) {
  if (!dates) return "";
  const fmt = (s) => {
    const [m, y] = s.trim().split(" ");
    return { m: MONTHS[m] || (m || "").toUpperCase(), y };
  };
  const [rawA, rawB] = dates.split(" - ");
  const a = fmt(rawA);
  if (!rawB) return `${a.m} ${a.y}`;
  const b = fmt(rawB);
  return a.y === b.y
    ? `${a.m} — ${b.m} ${b.y}`
    : `${a.m} ${a.y} — ${b.m} ${b.y}`;
}

// "Data Science Intern at Micron Technology" → { role, company }
function splitPosition(pos) {
  const i = (pos || "").indexOf(" at ");
  if (i === -1) return { role: pos || "", company: "" };
  return { role: pos.slice(0, i), company: pos.slice(i + 4) };
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Wraps a single accent word inside a headline line.
function renderAccent(line, accent) {
  if (!accent || !line.includes(accent)) return line;
  const [before, after] = line.split(accent);
  return (
    <>
      {before}
      <span className="accent">{accent}</span>
      {after}
    </>
  );
}

// Wraps emphasised terms (rendered as <em> accent) inside body copy.
function renderEmphasis(text, terms = []) {
  if (!terms.length) return text;
  const re = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "g");
  return text
    .split(re)
    .map((chunk, i) =>
      terms.includes(chunk) ? (
        <em key={i}>{chunk}</em>
      ) : (
        <Fragment key={i}>{chunk}</Fragment>
      ),
    );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function Home({ projects }) {
  const home = data.home;

  // getAllProjects() (via getStaticProps) already sorts most-recent first —
  // the same canonical order the showcase page's prev/next uses (D-13).
  const featuredCount = home.projectCount || 3;
  const featured = projects.slice(0, featuredCount);
  const remaining = projects.slice(featuredCount);
  const [lead, ...rest] = featured;
  const [showAll, setShowAll] = useState(false);

  // Skill marquee, flattened from the résumé skill groups.
  const skills = [
    ...data.resume.skills.languages,
    ...data.resume.skills.cloudAndDevOps,
    ...data.resume.skills.dataAndML,
  ];

  return (
    <div className="we">
      <Head>
        <title>{data.name} Tao — Engineer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="wrap">
        <Nav home />

        {/* Hero */}
        <section className="hero">
          <div>
            <div className="greeting">
              <span className="dot" />
              {data.headerTaglineOne}
              {home.availability ? ` · ${home.availability}` : ""}
            </div>
            <h1>
              {home.heroLines.map((line, i) => (
                <Fragment key={i}>
                  {renderAccent(line, home.heroAccent)}
                  {i < home.heroLines.length - 1 && <br />}
                </Fragment>
              ))}
            </h1>
            <p className="lede">
              {renderEmphasis(home.lede, home.ledeEmphasis)}
            </p>
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

        {/* Skill marquee */}
        <div className="strip" aria-hidden="true">
          <div className="strip-track">
            {[...skills, ...skills].map((s, i) => (
              <Fragment key={i}>
                <span>{s}</span>
                <span className="sep">✦</span>
              </Fragment>
            ))}
          </div>
        </div>

        {/* Projects */}
        <section id="projects">
          <div className="sec-head">
            <h2>
              <span className="num">01 ／</span>Selected Projects
            </h2>
            <span className="aside">
              {showAll ? projects.length : featured.length} of{" "}
              {projects.length}
            </span>
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
            <span className="aside">
              {data.resume.experiences.length} internships
            </span>
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
            <span className="aside">A short note</span>
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
