// pages/zh/404.page.tsx
// The CHINESE 404 — a locale binding, not an implementation. The body lives in
// components/wood/pages/NotFoundPage.tsx and is shared with the English 404
// (D-03, ZH-06); only the `locale` constant differs.
//
// UNLIKE the root pages/404.page.tsx, this file DOES carry getStaticProps. The
// root case must omit it: adding it there makes the build stop emitting the
// bare out/404.html that GitHub Pages serves for an unmatched path. Here the
// opposite holds — this locale is NOT the LocaleProvider default, so the props
// seed it explicitly, and the export shape is irrelevant because only the root
// 404.html is ever served by the platform. Next emits this as out/zh/404.html.
import React from "react";
import NotFoundPage from "../../components/wood/pages/NotFoundPage";
import type { Locale } from "../../lib/locale";

const LOCALE: Locale = "zh";

export async function getStaticProps(): Promise<{ props: { locale: Locale } }> {
  return { props: { locale: LOCALE } };
}

export default function ZhNotFound() {
  return <NotFoundPage locale={LOCALE} />;
}
