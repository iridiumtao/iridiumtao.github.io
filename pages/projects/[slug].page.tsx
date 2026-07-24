// pages/projects/[slug].page.tsx
// The ENGLISH project showcase route — a locale binding, not an implementation.
// The whole body lives in components/wood/pages/ProjectPage.tsx and is shared
// with pages/zh/projects/[slug].page.tsx (D-03, ZH-06). What stays HERE is
// everything that touches the server-only project data module. This file's
// locale is a literal constant — never computed, never detected — and travels
// to the shared chrome as pageProps.locale, which pages/_app.page.tsx feeds to
// LocaleProvider.
import React from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import ProjectPage from "../../components/wood/pages/ProjectPage";
import type { NavEntry } from "../../components/wood/pages/ProjectPage";
import { getAllProjects, getProjectBySlug } from "../../lib/projects";
import type { Project, ProjectWithBody } from "../../lib/projects";
import type { Locale } from "../../lib/locale";

const LOCALE: Locale = "en";

type Props = {
  project: ProjectWithBody;
  prev: NavEntry;
  next: NavEntry;
  locale: Locale;
};

// The dynamic segment this route generates. Passed as GetStaticProps' second
// type argument so `params` is narrowed from ParsedUrlQuery to this exact shape.
type Params = { slug: string };

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  return {
    paths: getAllProjects(LOCALE).map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
}) => {
  // `fallback: false` — the only mode output:'export' supports — means just the
  // enumerated slugs ever reach here, so getProjectBySlug cannot return null in
  // practice. Throwing rather than rendering a null project keeps `project`
  // non-nullable and fails the build loudly on paths/data drift.
  const project = params ? await getProjectBySlug(params.slug, LOCALE) : null;
  if (!project) {
    throw new Error(
      `No project found for slug "${params?.slug}". getStaticPaths and ` +
        "lib/projects.ts have drifted apart.",
    );
  }

  const all = getAllProjects(LOCALE); // newest-first, same order as the home grid
  const i = all.findIndex((p) => p.slug === project.slug);
  const toNav = (p: Project | null): NavEntry =>
    p ? { slug: p.slug, title: p.title } : null;
  // prev is the newer neighbour and next the older one; both null at their end
  // of the list, because the chain deliberately does not wrap around (D-13).
  const prev = toNav(all[i - 1] ?? null);
  const next = toNav(all[i + 1] ?? null);
  return { props: { project, prev, next, locale: LOCALE } };
};

export default function Showcase({ project, prev, next }: Props) {
  return (
    <ProjectPage locale={LOCALE} project={project} prev={prev} next={next} />
  );
}
