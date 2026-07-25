// components/wood/LocaleProvider.tsx
// Carries the active locale down to the shared Wood chrome (Nav, Footer) so
// those components do not have to take a `locale` prop from every call site.
//
// This context is PLUMBING, not a source of truth. The locale is decided by
// each page file: every getStaticProps returns `locale` as a literal constant
// ("en" in pages/*, "zh" in pages/zh/*), because a page file already knows
// which locale it is by construction. This provider only forwards the value
// Next hands back as pageProps.locale.
//
// It therefore must never DETECT anything at runtime — no parsing of the
// router's path, no browser-language sniffing, no client-side storage, no
// persisted preference (D-06's stateless requirement). Those three names are
// deliberately left unwritten here so a grep for them over this file stays a
// meaningful guard rather than matching this comment. Runtime detection would
// also risk a hydration flash for markup that has to be correct in the
// prerendered HTML before any JS runs, which is exactly what
// pages/_document.page.tsx already solves at build time from ctx.pathname.
//
// Missing-value posture: defaults to DEFAULT_LOCALE rather than throwing, so a
// page that supplies no locale — the dev-only editor route, or any future page
// outside both trees — renders as English. That is the safe-fallback posture,
// correct here because the input is Next's own pageProps rather than one of
// this repo's invariants. It is NOT a content fallback: no content accessor
// may ever coalesce a missing locale (D-04).
import React, { createContext, useContext } from "react";
import { DEFAULT_LOCALE } from "../../lib/locale";
import type { Locale } from "../../lib/locale";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({
  locale = DEFAULT_LOCALE,
  children,
}: {
  locale?: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

/**
 * The active locale for the page being rendered. Safe to call from any client
 * component under components/wood/*.
 */
export function useLocale(): Locale {
  return useContext(LocaleContext);
}
