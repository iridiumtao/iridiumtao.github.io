// pages/resume.page.tsx
// The résumé page. All content comes from lib/portfolio.ts (TS-03) — never from
// the raw JSON directly — so a content edit that breaks the shape fails in one
// place rather than silently here.
import React from "react";
import Head from "next/head";
import Link from "next/link";
import fs from "fs";
import path from "path";

import Nav from "../components/wood/Nav";
import Footer from "../components/wood/Footer";
import data from "../lib/portfolio";
import type { ResumeSkills } from "../types/portfolio";

// Build-time-computed from the public/resumes/*.pdf filenames, so it is not part
// of PortfolioData and deliberately does not live in types/portfolio.ts.
type ResumeDownload = { url: string; name: string; purpose: string };

export async function getStaticProps(): Promise<{
  props: { resumes: ResumeDownload[] };
}> {
  const resumesDir = path.join(process.cwd(), "public", "resumes");
  let resumes: ResumeDownload[] = [];

  try {
    const filenames = fs.readdirSync(resumesDir);
    resumes = filenames
      .filter((filename) => filename.endsWith(".pdf"))
      .map((filename) => {
        const purpose = filename.replace("resume-", "").replace(".pdf", "");
        let name = purpose.toUpperCase();
        if (purpose === "swe") name = "Software Engineer";
        else if (purpose === "ml") name = "ML Engineer";
        else if (purpose === "ios") name = "iOS Developer";
        else if (purpose === "ex") name = "Extended";
        else if (purpose === "mlops") name = "MLOps Engineer";

        return { url: `/resumes/${filename}`, name, purpose };
      })
      .reverse();
  } catch (error) {
    // Distinguish "not generated yet" from a real failure. prepare-resumes.ts
    // runs on prebuild and should have populated this directory, so anything
    // other than ENOENT here is a regression that would otherwise ship a résumé
    // page with zero download links.
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(
        "public/resumes missing — expected only before prepare-resumes runs",
      );
    } else {
      console.error("Failed to read public/resumes:", error);
    }
  }

  return { props: { resumes } };
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

// Sortable date from a "Mon YYYY - Mon YYYY" / "YYYY" string (uses the end).
function getSortableDate(dateString: string | undefined): Date {
  if (!dateString) return new Date(0);
  const lower = dateString.toString().toLowerCase();
  if (lower.includes("present") || lower.includes("current")) return new Date();
  const parts = lower.split(" - ");
  const end = parts.length > 1 ? parts[1] : parts[0];
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

// Normalise " - " to an en dash for display.
const fmtRange = (d: string | undefined): string =>
  (d || "").replace(/\s*-\s*/, " – ");

// Join present meta parts with a middot.
const metaLine = (...parts: (string | undefined | false)[]): string =>
  parts.filter(Boolean).join(" · ");

// "Software Developer at CARITY AI" → role + accented company.
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
type TimelineItemProps = {
  title: React.ReactNode;
  date?: string;
  meta?: string;
  bullets?: string[] | null;
  courses?: string[] | null;
};

function TimelineItem({
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
        {date && <span className="tl-date">{fmtRange(date)}</span>}
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

const SKILL_GROUPS: { label: string; key: keyof ResumeSkills }[] = [
  { label: "Languages", key: "languages" },
  { label: "Cloud & DevOps", key: "cloudAndDevOps" },
  { label: "Data & ML", key: "dataAndML" },
];

export default function Resume({ resumes }: { resumes: ResumeDownload[] }) {
  const r = data.resume;

  return (
    <div className="we">
      <Head>
        <title>{`Resume — ${data.name} Tao`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="wrap wrap-narrow">
        <Nav />

        {/* Header */}
        <header className="resume-head">
          <span className="kicker">{r.tagline}</span>
          <h1>Résumé</h1>
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
              <h2>
                <span className="num">01 ／</span>Education
              </h2>
            </div>
            <div className="tl">
              {[...r.education]
                .sort(byDateDesc((edu) => edu.universityDate))
                .map((edu) => (
                  <TimelineItem
                    key={edu.id}
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
                <span className="num">02 ／</span>Technical Skills
              </h2>
            </div>
            {SKILL_GROUPS.map((g) => (
              <div className="skill-group" key={g.key}>
                <div className="skill-label">{g.label}</div>
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
                <span className="num">03 ／</span>Professional Experience
              </h2>
              <span className="aside">{r.experiences.length} roles</span>
            </div>
            <div className="tl">
              {[...r.experiences]
                .sort(byDateDesc((exp) => exp.dates))
                .map((exp) => (
                <TimelineItem
                  key={exp.id}
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
                <span className="num">04 ／</span>Projects
              </h2>
              <span className="aside">{r.projects.length} selected</span>
            </div>
            <div className="tl">
              {[...r.projects]
                .sort(byDateDesc((project) => project.dates))
                .map((project) => (
                  <TimelineItem
                    key={project.id}
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
                <span className="num">05 ／</span>Honors &amp; Awards
              </h2>
            </div>
            <div className="tl">
              {[...r.honors]
                .sort(byDateDesc((honor) => honor.year))
                .map((honor) => (
                  <TimelineItem
                    key={honor.id}
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

      {process.env.NODE_ENV === "development" && (
        <Link href="/edit" className="dev-edit">
          Edit Data
        </Link>
      )}
    </div>
  );
}
