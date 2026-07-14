// pages/_document.js
// Custom Document — anchors <Html suppressHydrationWarning> so next-themes'
// pre-hydration <html> class mutation (light/dark) never triggers a React
// hydration-mismatch warning. next/font loaders must NOT live here — they
// stay in styles/fonts.js (the single font-definitions module); this file
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
