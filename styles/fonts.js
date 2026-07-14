// styles/fonts.js
// Single font-definitions module (Next's official "font definitions file"
// pattern — see nextjs.org/docs/pages/api-reference/components/font). Both
// next/font loaders are instantiated here exactly once and consumed only by
// pages/_document.js, which applies their `.variable` classNames directly to
// <Html>. This keeps the project's existing constraint intact: no next/font
// loader function call lives in pages/_document.js — only the already-
// instantiated `.variable` string constants are imported from this module.
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";

// Self-hosted display font: CJK-subsetted Open Huninn (SIL OFL 1.1), vendored
// under public/fonts/. Regenerated automatically by scripts/subset-font.js.
export const huninn = localFont({
  src: "../public/fonts/open-huninn-subset.woff2",
  variable: "--font-huninn",
  display: "swap",
  preload: true,
});

// Self-hosted via next/font/google — downloaded + hashed at build time, so
// the browser never requests fonts.googleapis.com / fonts.gstatic.com.
export const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jbmono",
  display: "swap",
});
