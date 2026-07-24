// pages/zh/index.page.tsx
// The CHINESE home page — a locale binding, not an implementation. It renders
// the same components/wood/pages/HomePage.tsx its English twin does; only the
// `locale` constant differs (D-03, ZH-06). This file exists solely to say which
// locale it is and to fetch that locale's project data.
//
// The locale is a literal constant — never computed, never detected. It travels
// to the shared chrome as pageProps.locale, which pages/_app.page.tsx feeds to
// LocaleProvider. Pages may import the server-only project data module; the
// ESLint boundary covers components/wood/** only.
import React from "react";
import HomePage from "../../components/wood/pages/HomePage";
import { getAllProjects } from "../../lib/projects";
import type { Project } from "../../lib/projects";
import type { Locale } from "../../lib/locale";

const LOCALE: Locale = "zh";

export async function getStaticProps(): Promise<{
  props: { projects: Project[]; locale: Locale };
}> {
  return { props: { projects: getAllProjects(LOCALE), locale: LOCALE } };
}

export default function ZhHome({ projects }: { projects: Project[] }) {
  return <HomePage locale={LOCALE} projects={projects} />;
}
