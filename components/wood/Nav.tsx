// components/wood/Nav.tsx
import React from "react";
import Link from "next/link";
import { getPortfolioData } from "../../lib/portfolio";
import { withLocale } from "../../lib/locale";
import { useLocale } from "./LocaleProvider";

// Shared Wood Editorial navigation. On the homepage, section links are
// in-page anchors; elsewhere they jump back to the homepage sections.
//
// `back` swaps the trailing CTA from "Resume →" to "← Home". The résumé page
// passes it because a button linking to the page you are already on is dead
// weight, and it is the one page with no other route out.
//
// One implementation serves both locales (D-03): the locale comes from context
// (seeded from pageProps.locale), content from getPortfolioData(locale), and
// every internal href from withLocale() — so a Chinese page never links back
// into the English tree. Never import the server-only project data module
// here; when a type is needed, take the types-only route ProjectCard.tsx uses.
//
// The visible labels below are still English on purpose. lib/dictionary.ts
// landed in plan 06-04 and plan 06-06 swaps these strings over to it —
// changing them here would put the same file in two plans of one wave.
export default function Nav({
  home = false,
  back = false,
}: {
  home?: boolean;
  back?: boolean;
}) {
  const locale = useLocale();
  const data = getPortfolioData(locale);
  // Empty on the homepage so the section links stay in-page anchors; elsewhere
  // it is this locale's home path, so they jump to the right tree's homepage.
  const base = home ? "" : withLocale(locale, "/");
  return (
    <nav>
      <Link href={withLocale(locale, "/")} className="brand">
        <span className="mark">T</span>
        <span className="name">{data.name} Tao</span>
      </Link>
      <div className="nav-links">
        <a href={`${base}#projects`}>Projects</a>
        <a href={`${base}#work`}>Work</a>
        <a href={`${base}#about`}>About</a>
        <a href={data.home.contactEmail}>Contact</a>
        {back ? (
          <Link href={withLocale(locale, "/")} className="cta">
            ← Home
          </Link>
        ) : (
          <Link href={withLocale(locale, "/resume")} className="cta">
            Resume →
          </Link>
        )}
      </div>
    </nav>
  );
}
