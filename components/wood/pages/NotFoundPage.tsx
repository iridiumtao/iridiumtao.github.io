// components/wood/pages/NotFoundPage.tsx
// The Wood-styled custom 404 body (PROJ-05), shared by both locales the same
// way HomePage.tsx is (D-03, ZH-06). pages/404.page.tsx binds it to "en" and
// pages/zh/404.page.tsx binds it to "zh"; neither carries markup of its own.
//
// KNOWN AND ACCEPTED LIMITATION, recorded rather than worked around (see
// research/ARCHITECTURE.md, section 6): GitHub Pages serves exactly one
// site-wide 404.html for any unmatched path. A Chinese 404 page can be linked
// from inside the /zh/ tree, but a mistyped /zh/anything still gets served the
// ENGLISH out/404.html. Do not add a client-side redirect, a lang-sniffing
// script, or any other workaround — the fix belongs to the hosting platform,
// and every available workaround trades a wrong-language page for a flash of
// wrong content plus a dependency on JavaScript having run.
//
// No data fetching here: the page is static content, and the server-only
// project data module in lib/ is off-limits under components/wood/ anyway.
import React from "react";
import Link from "next/link";
import Nav from "../Nav";
import Footer from "../Footer";
import LocaleHead from "../LocaleHead";
import { t } from "../../../lib/dictionary";
import { withLocale, type Locale } from "../../../lib/locale";
import { STATIC_ROUTES, counterpartPath } from "../../../lib/routeMap";

export default function NotFoundPage({ locale }: { locale: Locale }) {
  const s = t(locale);
  // Resolved ONCE and threaded to both the head and the switcher, so the two
  // can never disagree. STATIC_ROUTES.notFound omits the trailing slash on
  // purpose: Next exports this page as out/404.html, which is the file GitHub
  // Pages actually serves — not out/404/index.html.
  const path = STATIC_ROUTES.notFound[locale];
  const counterpart = counterpartPath(path);

  return (
    <div className="we">
      <LocaleHead
        locale={locale}
        title={s.notFoundTitle}
        description={s.notFoundDescription}
        path={path}
      />

      <div className="wrap">
        <Nav counterpartUrl={counterpart} />

        <header className="resume-head">
          {/* The numeral is layout, not copy — it reads the same in both
              locales, so it stays literal here rather than in the
              dictionary. */}
          <span className="kicker">404</span>
          <h1>{s.notFoundHeading}</h1>
          <p className="desc">{s.notFoundBody}</p>
          <div className="resume-downloads">
            {/* Routed through withLocale so a Chinese 404 goes back to /zh/,
                never into the English tree. */}
            <Link href={withLocale(locale, "/")}>{s.notFoundBackLink}</Link>
          </div>
        </header>

        <Footer />
      </div>
    </div>
  );
}
