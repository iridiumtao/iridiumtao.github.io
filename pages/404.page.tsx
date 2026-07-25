// pages/404.page.tsx
// The ENGLISH 404 — a locale binding, not an implementation. The body lives in
// components/wood/pages/NotFoundPage.tsx and is shared with the Chinese 404
// (D-03, ZH-06).
//
// DO NOT ADD getStaticProps HERE, unlike every other page. Measured against a
// real export: with it the build emits only out/404/index.html and STOPS
// emitting the bare out/404.html — the single file GitHub Pages serves for an
// unmatched path. It would silently replace this custom 404 with GitHub's own,
// with no build error anywhere. Nothing is lost: <html lang> comes from
// pages/_document.page.tsx via ctx.pathname, LocaleProvider already defaults to
// DEFAULT_LOCALE ("en") when pageProps.locale is absent, and NotFoundPage is
// handed its locale explicitly below. pages/zh/404.page.tsx is the opposite
// case and DOES need getStaticProps — its locale is not the default, and its
// export shape is irrelevant because only the root 404.html is ever served.
import React from "react";
import NotFoundPage from "../components/wood/pages/NotFoundPage";
import type { Locale } from "@/lib/locale";

const LOCALE: Locale = "en";

export default function NotFound() {
  return <NotFoundPage locale={LOCALE} />;
}
