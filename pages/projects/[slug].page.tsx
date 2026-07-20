// pages/projects/[slug].js
// Wood-styled project showcase page (PROJ-01/02/03/04). Thin static-generation
// consumer of lib/projects.ts — build-time data only, no client fs access.
// getStaticPaths enumerates all real project slugs (fallback: false is the
// only mode output:'export' supports); getStaticProps resolves the project
// plus its home-grid-order prev/next neighbours (D-13, no wrap-around).
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Nav from "../../components/wood/Nav";
import Footer from "../../components/wood/Footer";
import { getAllProjects, getProjectBySlug } from "../../lib/projects";
import { SITE_ORIGIN } from "../../lib/site";

export async function getStaticPaths() {
  return {
    paths: getAllProjects().map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const project = await getProjectBySlug(params.slug);
  const all = getAllProjects(); // newest-first, same order as the home grid
  const i = all.findIndex((p) => p.slug === params.slug);
  const toNav = (p) => (p ? { slug: p.slug, title: p.title } : null);
  return {
    props: {
      project,
      prev: toNav(all[i - 1] ?? null), // newer neighbour; null at the newest end
      next: toNav(all[i + 1] ?? null), // older neighbour; null at the oldest end
    },
  };
}

export default function ProjectPage({ project, prev, next }) {
  const p = project;
  const dateRange =
    p.startDate === p.endDate ? p.endDate : `${p.startDate} — ${p.endDate}`;
  const canonicalUrl = `${SITE_ORIGIN}/projects/${p.slug}/`;

  return (
    <div className="we">
      <Head>
        <title>{`${p.title} — Chun-Ju Tao`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={p.description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={p.title} />
        <meta property="og:description" content={p.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`${SITE_ORIGIN}${p.imageSrc}`} />
      </Head>

      <div className="wrap">
        <Nav />

        <header className="resume-head">
          <span className="kicker">{dateRange}</span>
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
              Repository ↗
            </a>
            {p.demoUrl && (
              <a href={p.demoUrl} target="_blank" rel="noreferrer">
                Live Demo ↗
              </a>
            )}
          </div>
        </header>

        <article className="resume-body">
          <div className="proj-cover">
            <img src={p.imageSrc} alt={p.title} />
          </div>
          {p.body !== null && (
            <div
              className="proj-body"
              dangerouslySetInnerHTML={{ __html: p.body }}
            />
          )}
        </article>

        <nav className="proj-nav">
          {prev && (
            <Link className="proj-nav-link" href={`/projects/${prev.slug}`}>
              ← {prev.title}
            </Link>
          )}
          {next && (
            <Link className="proj-nav-link" href={`/projects/${next.slug}`}>
              {next.title} →
            </Link>
          )}
        </nav>

        <Footer />
      </div>
    </div>
  );
}
