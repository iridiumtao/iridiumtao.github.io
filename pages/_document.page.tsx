// pages/_document.page.tsx
// Custom Document — anchors <Html suppressHydrationWarning> so next-themes'
// pre-hydration <html> class mutation (light/dark) never triggers a React
// hydration-mismatch warning. next/font loaders must NOT live here — they
// stay in styles/fonts.ts (the single font-definitions module); this file
// only imports the already-instantiated `.variable` string constants and
// applies them directly to <Html>, the true document root. <html> is
// unconditionally not `display:contents`, so font-family resolution never
// depends on inheriting through any intermediate wrapper — next-themes only
// ever classList.add/remove's the theme token here, never overwrites
// className wholesale, so these classes are never clobbered at runtime.
import { Html, Head, Main, NextScript } from "next/document";
import { huninn, jbmono } from "../styles/fonts";

export default function Document() {
  return (
    <Html
      lang="en"
      suppressHydrationWarning
      // globals.css sets `scroll-behavior: smooth` on <html> for in-page
      // anchor jumps (#projects, #work, #about). Without this attribute that
      // also animated Next's scroll-to-top on every route change, so clicking
      // a project card visibly scrolled the OLD page to the top before the new
      // one appeared. Next reads this marker in
      // disableSmoothScrollDuringRouteTransition and flips scroll-behavior to
      // `auto` around its own scrollTo — anchor smoothness is unaffected. The
      // dev build warns on the console when it is missing.
      data-scroll-behavior="smooth"
      className={`${huninn.variable} ${jbmono.variable}`}
    >
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
