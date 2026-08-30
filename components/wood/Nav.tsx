// components/wood/Nav.tsx
import React from "react";
import Link from "next/link";
import { getPortfolioData } from "../../lib/portfolio";
import { withLocale } from "../../lib/locale";
import { t } from "../../lib/dictionary";
import { useLocale } from "./LocaleProvider";
import LanguageSwitcher from "./LanguageSwitcher";

// Shared Wood Editorial navigation. On the homepage, section links are
// in-page anchors; elsewhere they jump back to the homepage sections.
//
// `back` swaps the résumé CTA for the home one. The résumé page passes it
// because a button linking to the page you are already on is dead weight, and
// it is the one page with no other route out.
//
// One implementation serves both locales (D-03): the locale comes from context
// (seeded from pageProps.locale), content from getPortfolioData(locale), chrome
// labels from t(locale), and every internal href from withLocale() — so a
// Chinese page never links back into the English tree. Never import the
// server-only project data module here; when a type is needed, take the
// types-only route ProjectCard.tsx uses.
//
// `counterpartUrl` is the language switcher's destination, resolved at build
// time by the calling page through lib/routeMap.ts. It defaults to null so a
// page with no counterpart is a valid caller without a cast — null renders the
// current-locale control alone rather than teleporting the visitor to a
// homepage (D-06). Nav appears on every page, including the eight showcases and
// the 404, so the switcher does too.
export default function Nav({
  home = false,
  back = false,
  counterpartUrl = null,
}: {
  home?: boolean;
  back?: boolean;
  counterpartUrl?: string | null;
}) {
  const navRef = React.useRef<HTMLElement>(null);
  const locale = useLocale();
  const data = getPortfolioData(locale);
  const s = t(locale);
  const fullName = `${data.name} ${s.brandSuffix}`;
  // Chinese is already the compact, owner-approved "Iridium 歐東" wordmark.
  // English alone sheds its parenthetical name at narrower breakpoints.
  const compactName =
    locale === "en"
      ? `${data.name.replace(/\s+\([^)]*\)/, "")} ${s.brandSuffix}`
      : fullName;
  const shortName =
    locale === "en" ? data.name.replace(/\s+\([^)]*\)/, "") : fullName;
  React.useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const variants = ["full", "compact", "short", "icon"] as const;
    const chooseWordmark = () => {
      for (const variant of variants) {
        nav.dataset.wordmark = variant;
        const navRect = nav.getBoundingClientRect();
        const brand = nav.querySelector<HTMLElement>(".brand");
        const actions = nav.querySelector<HTMLElement>(".nav-links");
        const name = nav.querySelector<HTMLElement>(`.brand-name-${variant}`);
        if (!brand || !actions) return;

        const brandRight =
          variant === "icon" || !name
            ? brand.getBoundingClientRect().right
            : name.getBoundingClientRect().right;
        const actionsRect = actions.getBoundingClientRect();
        if (
          brandRight + 8 <= actionsRect.left &&
          actionsRect.right <= navRect.right
        ) {
          return;
        }
      }
    };

    const observer = new ResizeObserver(chooseWordmark);
    observer.observe(nav);
    window.addEventListener("resize", chooseWordmark);
    void document.fonts.ready.then(chooseWordmark);
    chooseWordmark();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", chooseWordmark);
    };
  }, []);
  // Empty on the homepage so the section links stay in-page anchors; elsewhere
  // it is this locale's home path, so they jump to the right tree's homepage.
  const base = home ? "" : withLocale(locale, "/");
  return (
    <nav ref={navRef}>
      <Link
        href={withLocale(locale, "/")}
        className="brand"
        aria-label={fullName}
      >
        <span className="mark">T</span>
        <span className="name">
          <span className="brand-name-full">{fullName}</span>
          <span className="brand-name-compact">{compactName}</span>
          <span className="brand-name-short">{shortName}</span>
        </span>
      </Link>
      <div className="nav-links">
        <a href={`${base}#projects`}>{s.navProjects}</a>
        <a href={`${base}#work`}>{s.navWork}</a>
        <a href={`${base}#about`}>{s.navAbout}</a>
        <a href={data.home.contactEmail}>{s.navContact}</a>
        {back ? (
          <Link href={withLocale(locale, "/")} className="cta">
            {s.navHomeCta}
          </Link>
        ) : (
          <Link href={withLocale(locale, "/resume")} className="cta">
            {s.navResumeCta}
          </Link>
        )}
        <LanguageSwitcher locale={locale} counterpartUrl={counterpartUrl} />
      </div>
    </nav>
  );
}
