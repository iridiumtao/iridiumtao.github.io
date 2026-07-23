// pages/index.page.tsx
// The ENGLISH home page — a locale binding, not an implementation. The whole
// body lives in components/wood/pages/HomePage.tsx and is shared with
// pages/zh/index.page.tsx (D-03, ZH-06), so this file exists only to say which
// locale it is and to fetch that locale's project data.
//
// This page file IS the English home page, so its locale is a literal constant
// — never computed, never detected. It travels to the shared chrome as
// pageProps.locale, which pages/_app.page.tsx feeds to LocaleProvider.
//
// Pages may import the server-only project data module; the ESLint boundary
// covers components/wood/** only, which is exactly why HomePage receives
// `projects` as a prop instead of reading them itself.
import React from "react";
import HomePage from "../components/wood/pages/HomePage";
import { getAllProjects } from "../lib/projects";
import type { Project } from "../lib/projects";
import type { Locale } from "@/lib/locale";

const LOCALE: Locale = "en";

export async function getStaticProps(): Promise<{
  props: { projects: Project[]; locale: Locale };
}> {
  return { props: { projects: getAllProjects(LOCALE), locale: LOCALE } };
}

export default function Home({ projects }: { projects: Project[] }) {
  return <HomePage locale={LOCALE} projects={projects} />;
}
