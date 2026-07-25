// components/wood/Footer.tsx
import React from "react";
import { getPortfolioData } from "../../lib/portfolio";
import { t } from "../../lib/dictionary";
import { useLocale } from "./LocaleProvider";

// Shared Wood Editorial footer. One implementation for both locales (D-03):
// locale from context, content from getPortfolioData(locale), chrome labels
// from t(locale). Never import the server-only project data module here.
//
// Social titles stay content rather than chrome — they name the owner's own
// accounts and belong to data/portfolio*.json. The wordmark suffix and the
// copyright line are chrome, so they come from the dictionary.
export default function Footer() {
  const locale = useLocale();
  const data = getPortfolioData(locale);
  const s = t(locale);
  // Filter on the link, not the display title. The résumé entry is excluded
  // because Nav already carries a Resume CTA — but its `title` is translated
  // ("Resume" / "履歷") while its `link` is asserted byte-identical across
  // locales by lib/translations.test.ts. Matching on the title would have let
  // the entry straight through in Chinese and rendered a 履歷 link pointing at
  // the UNPREFIXED English /resume. Every remaining social is an off-site
  // http(s) or mailto destination; internal routes belong in Nav.
  const socials = data.socials.filter((s) => !s.link.startsWith("/"));
  return (
    <footer>
      <span className="footer-brand">
        {data.name} {s.brandSuffix}
      </span>
      <div className="footer-links">
        {socials.map((s) => (
          <a key={s.title} href={s.link}>
            {s.title}
            {s.link.startsWith("http") ? " ↗" : ""}
          </a>
        ))}
      </div>
      <span className="footer-copy">{s.footerCopy}</span>
    </footer>
  );
}
