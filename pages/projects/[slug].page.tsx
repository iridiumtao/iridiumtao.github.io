// pages/projects/[slug].page.tsx
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
import type { GetStaticPaths, GetStaticProps } from "next";
import { getAllProjects, getProjectBySlug } from "../../lib/projects";
import type { Project, ProjectWithBody } from "../../lib/projects";
import { SITE_ORIGIN } from "../../lib/site";

// The prev/next neighbour link — just enough of a project to render the label
// and href. null at each end of the list (D-13, no wrap-around).
type NavEntry = { slug: string; title: string } | null;

type Props = {
  project: ProjectWithBody;
  prev: NavEntry;
  next: NavEntry;
};

// The dynamic segment this route generates. Passed as GetStaticProps' second
// type argument so `params` is narrowed from ParsedUrlQuery to this exact shape.
type Params = { slug: string };

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  return {
    paths: getAllProjects().map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
}) => {
  // `fallback: false` means only slugs enumerated by getStaticPaths — i.e. real
  // projects — ever reach here, so getProjectBySlug cannot return null in
  // practice. Throwing rather than rendering a null project keeps `project`
  // non-nullable for the component below and fails the build loudly if the
  // paths and the data source ever drift apart.
  const project = params ? await getProjectBySlug(params.slug) : null;
  if (!project) {
    throw new Error(
      `No project found for slug "${params?.slug}". getStaticPaths and ` +
        "lib/projects.ts have drifted apart.",
    );
  }

  const all = getAllProjects(); // newest-first, same order as the home grid
  const i = all.findIndex((p) => p.slug === project.slug);
  const toNav = (p: Project | null): NavEntry =>
    p ? { slug: p.slug, title: p.title } : null;
  return {
    props: {
      project,
      prev: toNav(all[i - 1] ?? null), // newer neighbour; null at the newest end
      next: toNav(all[i + 1] ?? null), // older neighbour; null at the oldest end
    },
  };
};

export default function ProjectPage({ project, prev, next }: Props) {
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

      <div className="wrap wrap-prose">
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
          {/* HTML sink. p.body is build-time output of utils/markdownToHtml.ts,
              which runs remark-html >= 14 with its default sanitizer on
              repo-owned _projects/*.md -- raw HTML and javascript: hrefs are
              stripped before they reach here (verified against remark-html
              16.0.1). No user input ever reaches this string. If that pipeline
              is ever switched to `sanitize: false` or fed non-repo content,
              this sink must be re-audited. */}
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
            <Link
              className="proj-nav-link proj-nav-next"
              href={`/projects/${next.slug}`}
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
