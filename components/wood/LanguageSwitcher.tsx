// components/wood/LanguageSwitcher.tsx
// The site-wide EN / 中 control (SW-01, SW-04, D-06). Stateless and entirely
// prop-driven: it receives the counterpart URL already resolved at build time
// by lib/routeMap.ts's counterpartPath() and renders two elements. It holds no
// state, remembers nothing between visits, sniffs nothing about the visitor,
// and inspects no runtime path — D-06's "stateless" requirement is a privacy
// property as much as a behavioural one, so the browser-storage, cookie,
// preferred-language and router-path APIs are deliberately left unnamed even
// in this comment, keeping a grep for them over this file a real guard rather
// than a comment match (the same discipline LocaleProvider.tsx uses).
//
// Fixed control order, EN then 中, on every page in both locales, so the
// control never jumps position as a visitor moves through the site. That order
// comes from iterating LOCALES rather than from a self/other pair, because
// LOCALES is a constant ["en", "zh"] while "which label is mine" is not.
//
// The counterpart URL must never be substituted with a locale root: landing a
// visitor on the homepage instead of the translation of the page they were
// reading is precisely what D-06 forbids, so a null counterpart renders the
// current-locale control alone and emits no link at all.
//
// Never import the server-only project data module here; lib/routeMap.ts and
// lib/dictionary.ts are pure lookup tables and are safe.
import React from "react";
import Link from "next/link";
import { LOCALES } from "../../lib/locale";
import type { Locale } from "../../lib/locale";
import { t } from "../../lib/dictionary";

// Temporary soft-launch gate. The /zh/ tree ships and stays reachable — its
// routes, canonical links and hreflang pairs are unaffected — but the visible
// EN / 中 control is withheld while the Chinese content is being proofread on
// the live site. Flip this back to true to expose the switcher; nothing else
// needs to change.
const SHOW_LANGUAGE_SWITCHER = true;

export default function LanguageSwitcher({
  locale,
  counterpartUrl,
}: {
  locale: Locale;
  counterpartUrl: string | null;
}) {
  if (!SHOW_LANGUAGE_SWITCHER) return null;
  // role="group" is what makes the aria-label announceable — an aria-label on
  // a bare <div> is ignored by assistive technology.
  return (
    <div
      className="lang-switch"
      role="group"
      aria-label={t(locale).localeSwitchAriaLabel}
    >
      {LOCALES.map((l) => {
        // Each locale is labelled with its own autonym, read out of that
        // locale's own record — so the label of a control never depends on
        // which locale is currently being read.
        const label = t(l).localeSelfLabel;
        if (l === locale) {
          return (
            <span key={l} className="lang-switch-current" aria-current="true">
              {label}
            </span>
          );
        }
        if (counterpartUrl === null) return null;
        return (
          <Link key={l} className="lang-switch-link" href={counterpartUrl}>
            {label}
          </Link>
        );
      })}
    </div>
  );
}
