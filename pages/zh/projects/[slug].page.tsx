// pages/zh/projects/[slug].page.tsx
// The CHINESE project showcase route — a locale binding, not an implementation.
// The body lives in components/wood/pages/ProjectPage.tsx and is shared with
// pages/projects/[slug].page.tsx (D-03, ZH-06); only the `locale` constant
// differs. What stays HERE is everything that touches the server-only project
// data module. This route is the first real consumer of plan 06-05's
// missing-translation throw: a missing _projects/<slug>.zh.md fails the build
// loudly rather than falling back to the English body.
import React from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import ProjectPage from "../../../components/wood/pages/ProjectPage";
import type { NavEntry } from "../../../components/wood/pages/ProjectPage";
import { getAllProjects, getProjectBySlug } from "../../../lib/projects";
import type { Project, ProjectWithBody } from "../../../lib/projects";
import type { Locale } from "../../../lib/locale";

const LOCALE: Locale = "zh";

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
  // Slugs are the same ASCII kebab-case strings as English (ZH-03), never
  // transliterated. fallback: false is the only mode output:'export' supports.
  return {
    paths: getAllProjects(LOCALE).map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
}) => {
  // `fallback: false` means only enumerated slugs reach here, so a null result
  // is real path/data drift. Throwing keeps `project` non-nullable and fails the
  // build loudly; do NOT soften to `?? null`.
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

export default function ZhShowcase({ project, prev, next }: Props) {
  return (
    <ProjectPage locale={LOCALE} project={project} prev={prev} next={next} />
  );
}
